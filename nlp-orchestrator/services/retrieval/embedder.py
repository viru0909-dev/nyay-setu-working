"""
Lazy-loaded sentence-transformer embedder.

Default model: `sentence-transformers/all-MiniLM-L6-v2` — 384-dim, ~80 MB,
runs cheaply on CPU. Swap to `law-ai/InLegalBERT` (Indian-legal pretrained)
via the EMBEDDING_MODEL env var for higher domain fidelity.

The model is loaded on first use, behind a lock, so multiple concurrent
requests hitting cold start don't try to instantiate it in parallel.
All public calls are async-friendly: blocking encode work runs in the default
executor so the FastAPI event loop is never stalled.
"""

import asyncio
import logging
from threading import Lock
from typing import Optional

logger = logging.getLogger("retrieval-embedder")

_model = None
_model_name: Optional[str] = None
_lock = Lock()


def _load_model(model_name: str):
    """Idempotently load (or reload, if model_name changed) the embedder."""
    global _model, _model_name

    if _model is not None and _model_name == model_name:
        return _model

    with _lock:
        # Re-check inside lock (double-checked locking).
        if _model is not None and _model_name == model_name:
            return _model

        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            logger.warning(
                "sentence-transformers is not installed; embedder disabled. "
                "Install with: pip install sentence-transformers"
            )
            _model = None
            return None

        logger.info(f"Loading embedding model: {model_name}")
        try:
            _model = SentenceTransformer(model_name)
            _model_name = model_name
            # Forward-compatible: get_sentence_embedding_dimension() is being
            # renamed to get_embedding_dimension() in a future release.
            dim_fn = (
                getattr(_model, "get_embedding_dimension", None)
                or getattr(_model, "get_sentence_embedding_dimension", None)
            )
            dim = dim_fn() if dim_fn else "?"
            logger.info(f"Embedding model ready ({dim}-dim)")
        except Exception as e:
            logger.error(f"Failed to load embedding model '{model_name}': {e}")
            _model = None
        return _model


def embed_sync(texts: list[str], model_name: str) -> Optional[list[list[float]]]:
    """Encode `texts` synchronously. Returns None if the model is unavailable."""
    if not texts:
        return []

    model = _load_model(model_name)
    if model is None:
        return None

    try:
        # normalize_embeddings=True ensures cosine similarity == dot product,
        # which matches the Chroma collection's 'cosine' space setting.
        embeddings = model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return embeddings.tolist()
    except Exception as e:
        logger.error(f"embed_sync failed: {e}")
        return None


async def embed_async(
    texts: list[str],
    model_name: str,
) -> Optional[list[list[float]]]:
    """Async wrapper: runs encode in the default executor."""
    if not texts:
        return []
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, embed_sync, texts, model_name)