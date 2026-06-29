"""
Reusable semantic-retrieval facade (Phase 1 — issue #673).

This module is the single, dependency-light entry point that the rest of the
orchestrator (and any future NLP-reasoning integration) should call to perform
semantic search over the persistent legal corpus. It composes the existing
low-level building blocks — `embedder` (bi-encoder), `vectorstore` (persistent
Chroma), and `reranker` (cross-encoder) — behind one stable, typed API so that
callers never have to wire those three together by hand.

Why a facade
------------
Before this module, the only place the retrieval primitives were assembled was
inside `services.kanoon_search.build_kanoon_context`, tightly coupled to the
live Indian Kanoon search flow. There was no way to "just retrieve the top-k
legal passages for a query" without dragging in a live HTTP search. This facade
provides exactly that — a corpus-only, Kanoon-independent retrieval utility —
which Phase 2 (issue #674) then uses to ground the reasoning pipeline.

Design principles (consistent with the existing retrieval package)
------------------------------------------------------------------
  * Graceful degradation: if embeddings, the vector store, or the reranker are
    unavailable, calls return empty results / zero counts and log once, rather
    than raising. A caller can always treat retrieval as best-effort.
  * Async-first: `retrieve` / `ingest_documents` are async and never block the
    FastAPI event loop (the heavy work happens in the embedder/reranker
    executors). A synchronous `retrieve_sync` is provided for scripts.
  * Typed results: `RetrievedChunk` replaces ad-hoc dicts so downstream code
    can rely on attribute access and stable field names.
  * Config-driven defaults: top-k / fetch-k / rerank / model names come from
    `config` so behaviour matches the rest of the system, but every call can
    override them.

Public API
----------
    await retrieve(query, *, top_k=..., fetch_k=..., rerank=..., min_score=..., source=...)
    retrieve_sync(query, ...)                          # blocking variant
    await ingest_documents(documents, *, source=...)   # add docs to the corpus
    corpus_size()                                      # number of chunks stored
    is_available()                                     # retrieval usable right now?
    RetrievedChunk                                     # typed result row
"""

import logging
from dataclasses import dataclass, field
from typing import Any, Optional

from config import (
    CHROMA_PATH,
    EMBEDDING_MODEL,
    RERANKER_ENABLED,
    RERANKER_MODEL,
    RETRIEVAL_ENABLED,
    RETRIEVAL_FETCH_K,
    RETRIEVAL_TOP_K,
)
from services.retrieval import chunker, embedder, vectorstore
from services.retrieval import reranker as rr

logger = logging.getLogger("retrieval-facade")


# ─── Typed result row ─────────────────────────────────────────────────────────


@dataclass
class RetrievedChunk:
    """
    One retrieved passage plus its provenance.

    `score` is the effective relevance score used for ordering/threshholding:
    the cross-encoder `rerank_score` when reranking ran, otherwise the
    bi-encoder cosine similarity in [0, 1]. The raw cosine similarity is always
    preserved in `similarity` so callers can inspect both.
    """

    text: str
    score: float
    similarity: float = 0.0
    rerank_score: Optional[float] = None
    doc_id: str = ""
    title: str = ""
    source: str = ""
    chunk_index: int = -1
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_raw(cls, raw: dict) -> "RetrievedChunk":
        """Build a RetrievedChunk from a `vectorstore.query` row.

        The row shape is {chunk, score, metadata}; reranking additionally
        attaches `rerank_score`. Missing fields degrade to sensible defaults.
        """
        meta = raw.get("metadata") or {}
        similarity = float(raw.get("score", 0.0))
        rerank_score = raw.get("rerank_score")
        rerank_score = None if rerank_score is None else float(rerank_score)
        effective = similarity if rerank_score is None else rerank_score
        return cls(
            text=raw.get("chunk", "") or "",
            score=float(effective),
            similarity=similarity,
            rerank_score=rerank_score,
            doc_id=str(meta.get("doc_id", "")),
            title=str(meta.get("title", "")) or "Untitled",
            source=str(meta.get("source", "")),
            chunk_index=int(meta.get("chunk_index", -1)),
            metadata=meta,
        )

    def as_context_block(self) -> str:
        """Render a single citation-friendly context block for prompts."""
        header = self.title or "Untitled"
        if self.doc_id:
            header = f"{header} [doc_id={self.doc_id}]"
        return f"=== {header} ===\n{self.text}"


# ─── Retrieval ────────────────────────────────────────────────────────────────


def _resolve_defaults(
    top_k: Optional[int],
    fetch_k: Optional[int],
    rerank: Optional[bool],
) -> tuple[int, int, bool]:
    top_k = RETRIEVAL_TOP_K if top_k is None else int(top_k)
    fetch_k = RETRIEVAL_FETCH_K if fetch_k is None else int(fetch_k)
    rerank = RERANKER_ENABLED if rerank is None else bool(rerank)
    # Never fetch fewer candidates than we intend to return.
    fetch_k = max(fetch_k, top_k)
    return top_k, fetch_k, rerank


def _filter_by_source(candidates: list[dict], source: Optional[str]) -> list[dict]:
    if not source:
        return candidates
    return [c for c in candidates if (c.get("metadata") or {}).get("source") == source]


def _finalize(
    candidates: list[dict],
    top_k: int,
    min_score: float,
) -> list[RetrievedChunk]:
    out: list[RetrievedChunk] = []
    for raw in candidates[:top_k]:
        chunk = RetrievedChunk.from_raw(raw)
        if chunk.score < min_score:
            continue
        out.append(chunk)
    return out


async def retrieve(
    query: str,
    *,
    top_k: Optional[int] = None,
    fetch_k: Optional[int] = None,
    rerank: Optional[bool] = None,
    min_score: float = 0.0,
    source: Optional[str] = None,
) -> list[RetrievedChunk]:
    """
    Semantic search over the persistent corpus.

    Args:
        query:     the natural-language query to ground.
        top_k:     max passages to return (default: config.RETRIEVAL_TOP_K).
        fetch_k:   candidates to pull from the vector store before reranking
                   (default: config.RETRIEVAL_FETCH_K). Clamped to >= top_k.
        rerank:    run the cross-encoder rerank (default: config.RERANKER_ENABLED).
        min_score: drop chunks whose effective score is below this. For cosine
                   similarity this is in [0, 1]; for cross-encoder rerank scores
                   it is an unbounded logit (0.0 keeps only non-negative ones).
        source:    if set, keep only chunks whose metadata `source` matches
                   (e.g. "seed", "indian_kanoon").

    Returns an ordered list (most relevant first), or [] if retrieval is
    disabled or unavailable. Never raises for the common failure modes.
    """
    if not query or not query.strip():
        return []
    if not RETRIEVAL_ENABLED:
        logger.debug("retrieve: RETRIEVAL_ENABLED is false; returning []")
        return []

    top_k, fetch_k, rerank = _resolve_defaults(top_k, fetch_k, rerank)

    q_emb = await embedder.embed_async([query], EMBEDDING_MODEL)
    if not q_emb:
        logger.warning("retrieve: embedder unavailable; returning []")
        return []

    candidates = vectorstore.query(
        query_embedding=q_emb[0],
        top_k=fetch_k,
        persist_dir=CHROMA_PATH,
    )
    candidates = _filter_by_source(candidates, source)
    if not candidates:
        return []

    if rerank:
        candidates = await rr.rerank_async(query, candidates, top_k, RERANKER_MODEL)

    return _finalize(candidates, top_k, min_score)


def retrieve_sync(
    query: str,
    *,
    top_k: Optional[int] = None,
    fetch_k: Optional[int] = None,
    rerank: Optional[bool] = None,
    min_score: float = 0.0,
    source: Optional[str] = None,
) -> list[RetrievedChunk]:
    """Blocking variant of :func:`retrieve` for scripts / non-async callers."""
    if not query or not query.strip():
        return []
    if not RETRIEVAL_ENABLED:
        return []

    top_k, fetch_k, rerank = _resolve_defaults(top_k, fetch_k, rerank)

    q_emb = embedder.embed_sync([query], EMBEDDING_MODEL)
    if not q_emb:
        logger.warning("retrieve_sync: embedder unavailable; returning []")
        return []

    candidates = vectorstore.query(
        query_embedding=q_emb[0],
        top_k=fetch_k,
        persist_dir=CHROMA_PATH,
    )
    candidates = _filter_by_source(candidates, source)
    if not candidates:
        return []

    if rerank:
        candidates = rr.rerank_sync(query, candidates, top_k, RERANKER_MODEL)

    return _finalize(candidates, top_k, min_score)


# ─── Ingestion ────────────────────────────────────────────────────────────────


async def ingest_documents(
    documents: list[dict],
    *,
    source: str = "corpus",
    max_tokens: int = 512,
    overlap_tokens: int = 64,
    skip_existing: bool = True,
) -> int:
    """
    Chunk, embed, and upsert a batch of documents into the corpus.

    Each document is a dict:
        {
            "doc_id": str,              # required, stable id (idempotency key)
            "text": str,                # required, raw document text
            "title": str,               # optional, human-readable title
            "source": str,              # optional, overrides the `source` arg
            "metadata": dict,           # optional, extra metadata to store
        }

    Re-ingesting the same `doc_id` is safe: by default existing docs are
    skipped; pass `skip_existing=False` to force a re-embed (the vector store
    replaces all chunks for that doc_id atomically).

    Returns the total number of chunks written across all documents.
    """
    total = 0
    for doc in documents or []:
        doc_id = (doc.get("doc_id") or "").strip()
        text = doc.get("text") or ""
        if not doc_id or not text.strip():
            logger.debug("ingest_documents: skipping doc with empty id/text")
            continue

        if skip_existing and vectorstore.has_doc(doc_id, CHROMA_PATH):
            logger.debug("ingest_documents: %s already present; skipping", doc_id)
            continue

        chunks = chunker.chunk_text(
            text, max_tokens=max_tokens, overlap_tokens=overlap_tokens
        )
        if not chunks:
            logger.warning("ingest_documents: %s produced no chunks", doc_id)
            continue

        embeddings = await embedder.embed_async(chunks, EMBEDDING_MODEL)
        if not embeddings:
            logger.error("ingest_documents: embedder unavailable for %s", doc_id)
            continue

        base_metadata = {
            "title": doc.get("title", ""),
            "source": doc.get("source") or source,
        }
        extra = doc.get("metadata") or {}
        if isinstance(extra, dict):
            base_metadata.update(extra)

        added = vectorstore.upsert_chunks(
            doc_id=doc_id,
            chunks=chunks,
            embeddings=embeddings,
            base_metadata=base_metadata,
            persist_dir=CHROMA_PATH,
        )
        total += added
        logger.info("ingest_documents: %s -> %d chunks", doc_id, added)

    return total


# ─── Introspection ────────────────────────────────────────────────────────────


def corpus_size() -> int:
    """Number of chunks currently stored (0 if the store is unavailable)."""
    return vectorstore.count(CHROMA_PATH)


def is_available() -> bool:
    """
    True when retrieval can actually serve results right now: the feature flag
    is on and the persistent store holds at least one chunk.
    """
    return RETRIEVAL_ENABLED and corpus_size() > 0
