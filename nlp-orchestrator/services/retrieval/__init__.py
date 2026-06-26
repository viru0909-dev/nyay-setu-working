"""
Semantic retrieval package for the NLP orchestrator.

Low-level building blocks:
    chunker      — token/section-aware chunking of legal text
    embedder     — bi-encoder embeddings (InLegalBERT by default)
    vectorstore  — persistent Chroma vector store wrapper
    reranker     — cross-encoder reranking of candidates

High-level reusable facade (Phase 1, issue #673):
    retrieve / retrieve_sync — semantic search over the corpus
    ingest_documents          — add documents to the corpus
    corpus_size / is_available
    RetrievedChunk            — typed result row

The facade symbols are exported lazily via module ``__getattr__`` so that
importing a single low-level submodule (e.g. ``from services.retrieval import
chunker``) does not pull in ``config`` or the embedding/vector-store stack.
"""

from typing import TYPE_CHECKING

__all__ = [
    "RetrievedChunk",
    "retrieve",
    "retrieve_sync",
    "ingest_documents",
    "corpus_size",
    "is_available",
]

# Names re-exported from the retriever facade, resolved on first access.
_FACADE_EXPORTS = set(__all__)


def __getattr__(name: str):
    """Lazily resolve facade symbols (PEP 562) without eager heavy imports."""
    if name in _FACADE_EXPORTS:
        from services.retrieval import retriever

        return getattr(retriever, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__():
    return sorted(list(globals().keys()) + list(_FACADE_EXPORTS))


if TYPE_CHECKING:  # pragma: no cover - import-time hints only for type checkers
    from services.retrieval.retriever import (  # noqa: F401
        RetrievedChunk,
        corpus_size,
        ingest_documents,
        is_available,
        retrieve,
        retrieve_sync,
    )
