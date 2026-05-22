"""
Indian Kanoon Integration — Semantic Retrieval over Legal Documents.

This module merges two independent improvements:

1. HTTP resilience (originally by @viru0909-dev): circuit breaker that opens
   after sustained failures, tenacity-based retry decorator with exponential
   backoff on transient errors, shared aiohttp.ClientSession for parallel
   doc fetches, and richer error logging.

2. Semantic retrieval (this PR): chunking + embedding + vector store + cross-
   encoder rerank. Replaces the original "top-N Kanoon hits → first 1500
   chars of each, concatenated" with proper RAG over a persistent local
   corpus. The bug both PRs independently fixed (GET→POST on /doc/<id>/)
   means we actually have document text to chunk for the first time.

The public seam `build_kanoon_context(query, max_results) -> (str, list[dict])`
is preserved so main.py and the SSE event shape are unchanged.
"""

import asyncio
import logging
import re

import aiohttp

from config import (
    CHROMA_PATH,
    EMBEDDING_MODEL,
    INDIAN_KANOON_API_URL,
    INDIAN_KANOON_TOKEN,
    RERANKER_ENABLED,
    RERANKER_MODEL,
    RETRIEVAL_ENABLED,
    RETRIEVAL_FETCH_K,
    RETRIEVAL_TOP_K,
)
from services.retrieval import chunker, embedder
from services.retrieval import reranker as rr
from services.retrieval import vectorstore
from utils import CircuitBreaker, retry_transient

logger = logging.getLogger("kanoon-search")

# Bumped from 10s — observed real-world latency on Kanoon's search backend
# regularly exceeds 10s for vague or long queries.
DEFAULT_TIMEOUT = aiohttp.ClientTimeout(total=25)
DOC_TIMEOUT = aiohttp.ClientTimeout(total=30)

# Module-level circuit breaker (shared between search and doc fetch). After 5
# consecutive failures we stop hitting Kanoon for 60s, then send one probe.
kanoon_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)


# ─── HTTP layer ───────────────────────────────────────────────────────────────


@retry_transient
async def _search_kanoon_with_retry(
    query: str,
    url: str,
    params: dict,
    headers: dict,
    max_results: int = 3,
) -> list[dict]:
    """Tenacity-decorated POST. Raises on HTTP error to drive retries."""
    async with aiohttp.ClientSession(timeout=DEFAULT_TIMEOUT) as session:
        async with session.post(url, data=params, headers=headers) as resp:
            if resp.status != 200:
                body = await resp.text()
                logger.error(
                    "Indian Kanoon search returned %s: %s",
                    resp.status, body[:200],
                )
                raise aiohttp.ClientResponseError(
                    resp.request_info, resp.history, status=resp.status,
                )
            data = await resp.json(content_type=None)

    docs = data.get("docs", []) or []
    results = [
        {
            "title": doc.get("title", "Untitled"),
            "doc_id": str(doc.get("tid", "")),
            "snippet": _clean_snippet(doc.get("headline", "")),
        }
        for doc in docs[:max_results]
    ]
    logger.info(f"Indian Kanoon: {len(results)} hits for {query[:50]!r}")
    return results


async def search_kanoon(query: str, max_results: int = 3) -> list[dict]:
    """Search Indian Kanoon. Gated by the circuit breaker."""
    if not INDIAN_KANOON_TOKEN:
        logger.warning("Indian Kanoon API token not set; skipping search.")
        return []

    if not kanoon_breaker.is_available():
        logger.warning("[CircuitBreaker/Kanoon] OPEN — skipping search")
        return []

    url = f"{INDIAN_KANOON_API_URL}/search/"
    params = {"formInput": query, "pagenum": 0}
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Accept": "application/json",
    }

    try:
        result = await _search_kanoon_with_retry(
            query, url, params, headers, max_results,
        )
        kanoon_breaker.call_succeeded()
        return result
    except Exception as e:
        kanoon_breaker.call_failed()
        logger.error(f"Indian Kanoon search error: {type(e).__name__}: {e}")
        return []


@retry_transient
async def _fetch_doc(
    session: aiohttp.ClientSession,
    url: str,
    headers: dict,
    max_chars: int,
) -> str:
    """Tenacity-decorated POST on /doc/<id>/. Raises on HTTP error."""
    async with session.post(url, headers=headers) as resp:
        if resp.status != 200:
            body = await resp.text()
            logger.error(
                "Kanoon doc fetch failed %s: %s",
                resp.status, body[:200],
            )
            raise aiohttp.ClientResponseError(
                resp.request_info, resp.history, status=resp.status,
            )
        data = await resp.json(content_type=None)

    text = _strip_html(data.get("doc", ""))
    return text[:max_chars]


async def get_kanoon_doc(
    doc_id: str,
    max_chars: int = 40_000,
    session: aiohttp.ClientSession | None = None,
) -> str:
    """
    Fetch the full text of a Kanoon document, HTML-stripped and truncated.

    `max_chars` default bumped from 2000 to 40000: the chunker now handles
    size, so we want the whole document available for embedding rather than
    an arbitrary 2000-char prefix.

    NOTE: Indian Kanoon's /doc/<id>/ endpoint requires POST, not GET. The
    pre-fix code used GET and silently 405'd on every call.

    If `session` is provided, it's reused (better for parallel ingestion);
    otherwise a fresh session is created with DOC_TIMEOUT.
    """
    if not INDIAN_KANOON_TOKEN or not doc_id:
        return ""

    if not kanoon_breaker.is_available():
        logger.warning("[CircuitBreaker/Kanoon] OPEN — skipping doc fetch")
        return ""

    url = f"{INDIAN_KANOON_API_URL}/doc/{doc_id}/"
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Accept": "application/json",
    }

    try:
        if session is not None:
            result = await _fetch_doc(session, url, headers, max_chars)
        else:
            async with aiohttp.ClientSession(timeout=DOC_TIMEOUT) as new_session:
                result = await _fetch_doc(new_session, url, headers, max_chars)
        kanoon_breaker.call_succeeded()
        return result
    except Exception as e:
        kanoon_breaker.call_failed()
        logger.error(
            f"Kanoon doc fetch error (doc_id={doc_id}): {type(e).__name__}: {e}"
        )
        return ""


# ─── Ingestion ────────────────────────────────────────────────────────────────


async def _ingest_doc(
    doc_meta: dict,
    session: aiohttp.ClientSession | None = None,
) -> int:
    """
    Ensure a single Kanoon doc is in the vector store. No-op if already
    present or if the document text can't be fetched. Returns chunks added.

    Skip paths at DEBUG; failure paths at WARNING/ERROR.
    """
    doc_id = doc_meta.get("doc_id") or ""
    if not doc_id:
        logger.debug("[_ingest_doc] skipping: empty doc_id")
        return 0

    if vectorstore.has_doc(doc_id, CHROMA_PATH):
        logger.debug(f"[_ingest_doc] {doc_id}: cache hit, skipping")
        return 0

    text = await get_kanoon_doc(doc_id, max_chars=40_000, session=session)
    if not text:
        logger.warning(
            f"[_ingest_doc] {doc_id}: doc fetch returned empty, can't ingest"
        )
        return 0

    chunks = chunker.chunk_text(text, max_tokens=512, overlap_tokens=64)
    if not chunks:
        logger.warning(
            f"[_ingest_doc] {doc_id}: chunker produced 0 chunks from {len(text)} chars"
        )
        return 0

    embeddings = await embedder.embed_async(chunks, EMBEDDING_MODEL)
    if not embeddings:
        logger.error(
            f"[_ingest_doc] {doc_id}: embedder returned None (model unavailable?)"
        )
        return 0

    added = vectorstore.upsert_chunks(
        doc_id=doc_id,
        chunks=chunks,
        embeddings=embeddings,
        base_metadata={
            "title": doc_meta.get("title", ""),
            "source": "indian_kanoon",
        },
        persist_dir=CHROMA_PATH,
    )
    logger.info(f"Ingested {added} chunks for Kanoon doc {doc_id}")
    return added


# ─── Public RAG entry point (signature preserved) ─────────────────────────────


async def build_kanoon_context(
    query: str,
    max_results: int = 3,
) -> tuple[str, list[dict]]:
    """
    Build a grounded legal context for `query`.

    Pipeline:
      1. Live Kanoon search for candidate docs.
      2. Parallel ingest (using a shared aiohttp session) of any new docs.
      3. Embed the query and kNN-query the vector store.
      4. Optional cross-encoder rerank over top-N → top-K.
      5. Assemble citation-preserving context string.

    Falls back to the original whole-doc-concat behaviour if retrieval is
    disabled, embeddings unavailable, or the store is empty.

    Returns: (context_string, results_metadata) — signature preserved.
    """
    # Step 1: live search (always invoked; circuit breaker guards backpressure).
    live_results = await search_kanoon(query, max_results=max_results)

    # Step 2: legacy fallback path when retrieval is disabled.
    if not RETRIEVAL_ENABLED:
        return await _legacy_context(live_results), live_results[:max_results]

    # Step 3: ingest new docs in parallel, reusing one HTTP session.
    if live_results:
        async with aiohttp.ClientSession(timeout=DOC_TIMEOUT) as session:
            await asyncio.gather(
                *[_ingest_doc(r, session=session) for r in live_results],
                return_exceptions=True,
            )

    # Step 4: query the store.
    q_emb = await embedder.embed_async([query], EMBEDDING_MODEL)
    if not q_emb:
        logger.warning("Embedder unavailable; falling back to legacy context")
        return await _legacy_context(live_results), live_results[:max_results]

    candidates = vectorstore.query(
        query_embedding=q_emb[0],
        top_k=RETRIEVAL_FETCH_K,
        persist_dir=CHROMA_PATH,
    )
    if not candidates:
        logger.info("Vector store returned no candidates; using legacy fallback")
        return await _legacy_context(live_results), live_results[:max_results]

    # Step 5: optional cross-encoder rerank.
    if RERANKER_ENABLED:
        candidates = await rr.rerank_async(
            query, candidates, RETRIEVAL_TOP_K, RERANKER_MODEL,
        )
    else:
        candidates = candidates[:RETRIEVAL_TOP_K]

    # Step 6: assemble outputs.
    context = _format_context(candidates)
    enriched_meta = _enrich_results(live_results, candidates, max_results)

    # Summary log — read off everything important from one line.
    seed_chunks = sum(
        1 for c in candidates
        if c.get("metadata", {}).get("source") == "seed"
    )
    live_chunks = len(candidates) - seed_chunks
    top_score = (
        candidates[0].get("rerank_score", candidates[0].get("score", 0.0))
        if candidates else 0.0
    )
    logger.info(
        f"build_kanoon_context: query={query[:40]!r} | "
        f"live_hits={len(live_results)} | "
        f"served={seed_chunks} seed + {live_chunks} live chunks | "
        f"top_score={top_score:.3f}"
    )
    return context, enriched_meta


# ─── Output formatting + legacy fallback ──────────────────────────────────────


def _format_context(candidates: list[dict]) -> str:
    """Concatenate retrieved chunks with citation-friendly headers."""
    parts: list[str] = []
    seen: dict[str, int] = {}

    for cand in candidates:
        meta = cand.get("metadata", {}) or {}
        title = meta.get("title", "Untitled")
        doc_id = meta.get("doc_id", "")

        seen[title] = seen.get(title, 0) + 1
        marker = title if seen[title] == 1 else f"{title} (excerpt {seen[title]})"

        parts.append(f"=== {marker} [doc_id={doc_id}] ===\n{cand.get('chunk', '')}\n")

    return "\n".join(parts)


def _enrich_results(
    live_results: list[dict],
    retrieved: list[dict],
    max_results: int,
) -> list[dict]:
    """
    Build per-document metadata for the kanoon_results SSE event.

    Original shape {title, doc_id, snippet} preserved; additively augmented
    with score and source. Front-end ignores unknown fields.
    """
    by_id = {r["doc_id"]: r for r in live_results}
    best_per_doc: dict[str, dict] = {}

    for cand in retrieved:
        meta = cand.get("metadata", {}) or {}
        doc_id = meta.get("doc_id", "")
        score = float(cand.get("rerank_score", cand.get("score", 0.0)))

        existing = best_per_doc.get(doc_id)
        if existing is None or score > existing["score"]:
            best_per_doc[doc_id] = {
                "title": meta.get("title") or by_id.get(doc_id, {}).get("title", "Untitled"),
                "doc_id": doc_id,
                "snippet": by_id.get(doc_id, {}).get(
                    "snippet", cand.get("chunk", "")[:200],
                ),
                "score": score,
                "source": meta.get("source", "vector_store"),
            }

    if not best_per_doc:
        return live_results[:max_results]

    ordered = sorted(best_per_doc.values(), key=lambda d: d["score"], reverse=True)
    return ordered[:max_results]


async def _legacy_context(live_results: list[dict]) -> str:
    """
    Original behaviour — fetch up to 1500 chars per doc and concatenate.
    Reuses a single aiohttp session for parallel fetches.
    """
    if not live_results:
        return ""

    async with aiohttp.ClientSession(timeout=DOC_TIMEOUT) as session:
        tasks = [
            get_kanoon_doc(r["doc_id"], max_chars=1500, session=session)
            for r in live_results
        ]
        doc_texts = await asyncio.gather(*tasks, return_exceptions=True)

    parts: list[str] = []
    for r, doc_text in zip(live_results, doc_texts):
        if isinstance(doc_text, BaseException):
            logger.error(
                "Doc fetch error for %s: %s",
                r.get("doc_id"), doc_text,
            )
            doc_text = ""
        if doc_text:
            parts.append(f"=== {r['title']} ===\n{doc_text}\n")
        else:
            parts.append(f"=== {r['title']} ===\n{r['snippet']}\n")
    return "\n".join(parts)


# ─── HTML helpers ─────────────────────────────────────────────────────────────


_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


def _clean_snippet(html_text: str) -> str:
    return _strip_html(html_text).strip()


def _strip_html(text: str) -> str:
    clean = _TAG_RE.sub("", text or "")
    clean = _WS_RE.sub(" ", clean)
    return clean.strip()