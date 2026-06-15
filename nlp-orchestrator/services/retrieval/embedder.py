"""
Lazy-loaded sentence-transformer embedder.

Default model: `law-ai/InLegalBERT` — 768-dim, Indian-legal domain pretrained.
Replaces `sentence-transformers/all-MiniLM-L6-v2` (384-dim) for higher legal
domain fidelity. Mean pooling is applied automatically for InLegalBERT since it
is not a native SBERT model.

The model is loaded on first use, behind a lock, so multiple concurrent requests
hitting cold start do not try to instantiate it in parallel. All public calls are
async-friendly: blocking encode work runs in the default executor so the FastAPI
event loop is never stalled.
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
        if _model is not None and _model_name == model_name:
            return _model

        logger.info(f"Loading embedding model: {model_name}")
        try:
            if "InLegalBERT" in model_name or "inlegal" in model_name.lower():
                import torch
                import torch.nn.functional as F
                from transformers import AutoModel, AutoTokenizer

                logger.info("Using HuggingFace AutoModel with mean pooling for InLegalBERT")
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                hf_model = AutoModel.from_pretrained(model_name)
                hf_model.eval()

                class _InLegalBERTWrapper:
                    def __init__(self, tok, mod):
                        self._tok = tok
                        self._mod = mod

                    def encode(
                        self,
                        texts,
                        convert_to_numpy=True,
                        normalize_embeddings=True,
                        show_progress_bar=False,
                    ):
                        encoded = self._tok(
                            texts,
                            padding=True,
                            truncation=True,
                            max_length=512,
                            return_tensors="pt",
                        )
                        with torch.no_grad():
                            output = self._mod(**encoded)
                        token_emb = output.last_hidden_state
                        mask = (
                            encoded["attention_mask"]
                            .unsqueeze(-1)
                            .expand(token_emb.size())
                            .float()
                        )
                        pooled = torch.sum(token_emb * mask, 1) / torch.clamp(
                            mask.sum(1), min=1e-9
                        )
                        if normalize_embeddings:
                            pooled = F.normalize(pooled, p=2, dim=1)
                        return pooled.numpy() if convert_to_numpy else pooled

                    def get_embedding_dimension(self):
                        return 768

                _model = _InLegalBERTWrapper(tokenizer, hf_model)
            else:
                try:
                    from sentence_transformers import SentenceTransformer
                except ImportError:
                    logger.warning(
                        "sentence-transformers is not installed; embedder disabled. "
                        "Install with: pip install sentence-transformers"
                    )
                    _model = None
                    return None
                _model = SentenceTransformer(model_name)

            _model_name = model_name
            dim_fn = getattr(_model, "get_embedding_dimension", None) or getattr(
                _model, "get_sentence_embedding_dimension", None
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