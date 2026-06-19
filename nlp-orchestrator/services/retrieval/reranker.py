"""
Cross-encoder reranker.

The bi-encoder retrieval step (sentence-transformers + Chroma) is fast but
optimizes for semantic similarity in the embedding space, which can miss
cases where lexical overlap on a specific section number or party name is
the actual signal.

A cross-encoder rerank over the top-N bi-encoder candidates jointly encodes
(query, candidate) so attention can wire those signals together. We use
`BAAI/bge-reranker-base` by default — ~280 MB, runs cheaply on CPU, well-known
to recover several nDCG points on legal/QA workloads.

If sentence-transformers is missing or model load fails, this module returns
the top_k of the input candidates unchanged so the pipeline still works.
"""

import asyncio
import logging
from threading import Lock
from typing import Optional

logger = logging.getLogger("retrieval-reranker")

_model = None
_model_name: Optional[str] = None
_lock = Lock()


def _load_model(model_name: str):
    global _model, _model_name

    if _model is not None and _model_name == model_name:
        return _model

    with _lock:
        if _model is not None and _model_name == model_name:
            return _model

        try:
            from sentence_transformers import CrossEncoder
        except ImportError:
            logger.warning("sentence-transformers not installed; reranker disabled")
            _model = None
            return None

        logger.info(f"Loading reranker: {model_name}")
        try:
            _model = CrossEncoder(model_name, max_length=512)
            _model_name = model_name
            logger.info("Reranker ready")
        except Exception as e:
            logger.error(f"Failed to load reranker '{model_name}': {e}")
            _model = None
        return _model


def rerank_sync(
    query: str,
    candidates: list[dict],
    top_k: int,
    model_name: str,
) -> list[dict]:
    """
    Re-score `candidates` by cross-encoder relevance, return top-k.

    Each candidate dict is expected to have a "chunk" key. The returned dicts
    are the same objects, mutated to include "rerank_score", and sorted by it.
    """
    if not candidates:
        return []

    model = _load_model(model_name)
    if model is None:
        return candidates[:top_k]

    pairs = [(query, c.get("chunk", "")) for c in candidates]

    try:
        scores = model.predict(pairs, show_progress_bar=False)
    except Exception as e:
        logger.error(f"rerank prediction failed: {e}")
        return candidates[:top_k]

    for cand, score in zip(candidates, scores):
        cand["rerank_score"] = float(score)

    candidates.sort(key=lambda c: c.get("rerank_score", 0.0), reverse=True)
    return candidates[:top_k]


async def rerank_async(
    query: str,
    candidates: list[dict],
    top_k: int,
    model_name: str,
) -> list[dict]:
    """Async wrapper: runs the cross-encoder in the default executor."""
    if not candidates:
        return []
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, rerank_sync, query, candidates, top_k, model_name
    )
