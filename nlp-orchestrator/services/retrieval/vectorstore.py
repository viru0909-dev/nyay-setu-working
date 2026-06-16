"""
Persistent Chroma vector store wrapper.

Design notes:
  * Single shared collection (`kanoon`) holds chunks from both the seed corpus
    (Bare Acts, Constitution, landmark judgments) and live Indian Kanoon hits.
    Metadata distinguishes them via the `source` field.
  * Chunk IDs are deterministic: `{doc_id}::chunk::{i}`. Idempotent re-ingest
    is achieved by deleting all chunks for a doc_id before inserting fresh ones.
  * Cosine space is configured at collection creation; embeddings should be
    L2-normalized upstream (the embedder does this).

All functions degrade gracefully when chromadb is not installed: they log
once and return empty/zero values, letting `kanoon_search.build_kanoon_context`
fall back to the legacy whole-doc concatenation path.
"""

import logging
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("retrieval-vectorstore")

_client = None
_collection = None
_collection_path: Optional[str] = None


def _get_collection(persist_dir: str, collection_name: str = "kanoon"):
    """Lazily create the Chroma client + collection (cached per persist_dir)."""
    global _client, _collection, _collection_path

    if _collection is not None and _collection_path == persist_dir:
        return _collection

    try:
        import chromadb
        from chromadb.config import Settings
    except ImportError:
        logger.warning(
            "chromadb is not installed; vector store disabled. "
            "Install with: pip install chromadb"
        )
        return None

    Path(persist_dir).mkdir(parents=True, exist_ok=True)

    try:
        _client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )
        _collection = _client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        _collection_path = persist_dir
        logger.info(
            f"Chroma collection '{collection_name}' ready at {persist_dir} "
            f"({_collection.count()} chunks)"
        )
        return _collection
    except Exception as e:
        logger.error(f"Failed to initialize Chroma at {persist_dir}: {e}")
        return None


def has_doc(doc_id: str, persist_dir: str) -> bool:
    """Return True if any chunks for this doc are already in the store."""
    if not doc_id:
        return False
    col = _get_collection(persist_dir)
    if col is None:
        return False
    try:
        result = col.get(where={"doc_id": doc_id}, limit=1)
        return bool(result.get("ids"))
    except Exception as e:
        logger.error(f"has_doc({doc_id}) failed: {e}")
        return False


def upsert_chunks(
    doc_id: str,
    chunks: list[str],
    embeddings: list[list[float]],
    base_metadata: dict[str, Any],
    persist_dir: str,
) -> int:
    """
    Insert chunks for `doc_id`, replacing any existing entries for that doc.

    Returns the number of chunks written (0 on failure or disabled store).
    """
    col = _get_collection(persist_dir)
    if col is None or not chunks or not embeddings:
        return 0

    if len(chunks) != len(embeddings):
        logger.error(
            f"upsert_chunks: chunks/embeddings length mismatch "
            f"({len(chunks)} vs {len(embeddings)}) for doc {doc_id}"
        )
        return 0

    # Idempotent: delete existing chunks for this doc first.
    try:
        existing = col.get(where={"doc_id": doc_id})
        existing_ids = existing.get("ids") or []
        if existing_ids:
            col.delete(ids=existing_ids)
    except Exception as e:
        logger.warning(f"upsert_chunks: cleanup for {doc_id} failed (continuing): {e}")

    ids = [f"{doc_id}::chunk::{i}" for i in range(len(chunks))]
    metadatas = [
        {**base_metadata, "doc_id": doc_id, "chunk_index": i}
        for i in range(len(chunks))
    ]

    try:
        col.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return len(chunks)
    except Exception as e:
        logger.error(f"upsert_chunks: add failed for {doc_id}: {e}")
        return 0


def query(
    query_embedding: list[float],
    top_k: int,
    persist_dir: str,
) -> list[dict]:
    """
    Nearest-neighbor search.

    Returns: list of {chunk, score, metadata}, sorted by descending similarity.
    `score` is cosine similarity in [0, 1] (1 - cosine_distance).
    """
    col = _get_collection(persist_dir)
    if col is None or not query_embedding:
        return []

    try:
        result = col.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        logger.error(f"vector query failed: {e}")
        return []

    docs = (result.get("documents") or [[]])[0]
    metas = (result.get("metadatas") or [[]])[0]
    dists = (result.get("distances") or [[]])[0]

    return [
        {
            "chunk": doc,
            "score": float(1.0 - dist),
            "metadata": meta or {},
        }
        for doc, meta, dist in zip(docs, metas, dists)
    ]


def count(persist_dir: str) -> int:
    """Return the total number of chunks in the store (0 if unavailable)."""
    col = _get_collection(persist_dir)
    if col is None:
        return 0
    try:
        return col.count()
    except Exception:
        return 0
