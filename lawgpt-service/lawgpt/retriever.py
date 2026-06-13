"""
lawgpt/retriever.py — ChromaDB loader and retrieval for Nyay Setu LawGPT.

Loads a persisted ChromaDB collection from vector_store/chroma_db/ and
exposes retrieve() with optional statute-level metadata filtering.
"""

from pathlib import Path
from typing import Optional
from typing import Any

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma

    # pyrefly: ignore [missing-import]
    from langchain.schema import Document

    _HAS_LANGCHAIN = True
except Exception:
    HuggingFaceEmbeddings = None  # type: ignore
    Chroma = None  # type: ignore
    Document = object
    _HAS_LANGCHAIN = False


# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR: Path = Path(__file__).resolve().parent.parent
CHROMA_DIR: Path = BASE_DIR / "vector_store" / "chroma_db"
COLLECTION_NAME: str = "legal_corpus"

# ── Cached state ───────────────────────────────────────────────────────────────
_vectorstore = None
# Chroma at runtime
_embeddings = None  # HuggingFaceEmbeddings at runtime


def _get_embeddings() -> Any:
    """Return the singleton embedding model instance."""
    global _embeddings
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available in this environment")
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")  # type: ignore[call-non-callable]
    return _embeddings


def load_vectorstore() -> Any:
    """
    Load the ChromaDB collection from disk. Caches the result after the first
    successful load so subsequent calls are instant.

    Raises:
        FileNotFoundError: If the ChromaDB directory does not exist.
    """
    global _vectorstore
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available in this environment")
    if _vectorstore is not None:
        return _vectorstore  # type: ignore[return-value]

    if not CHROMA_DIR.exists():
        raise FileNotFoundError(
            "ChromaDB store not found. "
            "Run 'python lawgpt/ingest.py' before starting the server."
        )

    _vectorstore = Chroma(  # type: ignore[call-non-callable]
        persist_directory=str(CHROMA_DIR),
        embedding_function=_get_embeddings(),
        collection_name=COLLECTION_NAME,
    )
    return _vectorstore  # type: ignore[return-value]


def retrieve(
    query: str,
    k: int = 3,
    statute: Optional[str] = None,
) -> list:
    """
    Retrieve the top-k most relevant chunks for a query.

    Args:
        query:   The user's search query string.
        k:       Number of results to return (default 3).
        statute: Optional statute key to restrict search scope,
                 e.g. "IPC", "BNS", "BNSS", "CONSTITUTION".
                 Must match the value written during ingest.

    Returns:
        A list of LangChain Document objects with page_content and metadata.
    """
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available in this environment")
    vs = load_vectorstore()

    if statute:
        # ChromaDB metadata filter — scopes search to a single statute
        results = vs.similarity_search(
            query,
            k=k,
            filter={"statute": statute.upper()},
        )
    else:
        results = vs.similarity_search(query, k=k)

    return results


def get_chunk_count() -> Optional[int]:
    """Return the total number of vectors in the ChromaDB collection, or None."""
    try:
        if not _HAS_LANGCHAIN:
            return None
        vs = load_vectorstore()
        return vs._collection.count()
    except (FileNotFoundError, Exception):
        return None


def is_index_loaded() -> bool:
    """Check whether the ChromaDB collection is loaded and cached."""
    return _vectorstore is not None
