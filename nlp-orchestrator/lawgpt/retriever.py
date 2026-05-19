"""
lawgpt/retriever.py — FAISS index loader and retrieval for Nyay Setu LawGPT.

Loads a persisted FAISS index from vector_store/legal_index and exposes
a module-level `get_retriever()` that returns a cached retriever instance.
"""

from pathlib import Path
from typing import Optional

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
# pyrefly: ignore [missing-import]
from langchain.schema import Document


# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR: Path = Path(__file__).resolve().parent.parent
INDEX_DIR: Path = BASE_DIR / "vector_store" / "legal_index"

# ── Cached state ───────────────────────────────────────────────────────────────
_vectorstore: Optional[FAISS] = None
_embeddings: Optional[HuggingFaceEmbeddings] = None


def _get_embeddings() -> HuggingFaceEmbeddings:
    """Return the singleton embedding model instance."""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
    return _embeddings


def load_vectorstore() -> FAISS:
    """
    Load the FAISS index from disk. Caches the result after the first
    successful load so subsequent calls are instant.

    Raises:
        FileNotFoundError: If the index directory does not exist.
    """
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore

    if not INDEX_DIR.exists():
        raise FileNotFoundError(
            "Run 'python lawgpt/ingest.py' before starting the server."
        )

    _vectorstore = FAISS.load_local(
        folder_path=str(INDEX_DIR),
        embeddings=_get_embeddings(),
        allow_dangerous_deserialization=True,
    )
    return _vectorstore


def retrieve(query: str, k: int = 3) -> list[Document]:
    """
    Retrieve the top-k most relevant chunks for a query.

    Args:
        query: The user's search query string.
        k: Number of results to return (default 3).

    Returns:
        A list of LangChain Document objects with page_content and metadata.
    """
    vs: FAISS = load_vectorstore()
    results: list[Document] = vs.similarity_search(query, k=k)
    return results


def get_chunk_count() -> Optional[int]:
    """Return the number of vectors in the loaded FAISS index, or None."""
    try:
        vs: FAISS = load_vectorstore()
        return vs.index.ntotal
    except (FileNotFoundError, Exception):
        return None


def is_index_loaded() -> bool:
    """Check whether the FAISS index is available."""
    return _vectorstore is not None
