"""
lawgpt/retriever.py — ChromaDB persistent index loader and retrieval.

Replaced FAISS with ChromaDB for:
- Persistent storage (survives restarts, instant startup)
- Metadata filtering (statute-scoped queries like "search only in BNS 2023")
"""

from pathlib import Path
from typing import Optional, List

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain.schema import Document
    _HAS_LANGCHAIN = True
except Exception:
    HuggingFaceEmbeddings = None
    Chroma = None
    Document = object
    _HAS_LANGCHAIN = False


BASE_DIR: Path = Path(__file__).resolve().parent.parent
CHROMADB_DIR: Path = BASE_DIR / "vector_store" / "chromadb_legal"

_vectorstore: Optional[Chroma] = None
_embeddings: Optional[HuggingFaceEmbeddings] = None

STATUTE_SOURCES = {
    "IPC": "Indian Penal Code",
    "CrPC": "Criminal Procedure Code",
    "BNS": "Bharatiya Nyaya Sanhita 2023",
    "BNSS": "Bharatiya Nagarik Suraksha Sanhita 2023",
    "BSA": "Bharatiya Sakshya Adhiniyam 2023",
    "Constitution": "Indian Constitution",
    "Evidence": "Indian Evidence Act",
}


def _get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available")
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
    return _embeddings


def load_vectorstore() -> Chroma:
    global _vectorstore
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available")
    if _vectorstore is not None:
        return _vectorstore
    if not CHROMADB_DIR.exists():
        raise FileNotFoundError("Run 'python lawgpt/ingest.py' to initialize ChromaDB first.")
    _vectorstore = Chroma(
        persist_directory=str(CHROMADB_DIR),
        embedding_function=_get_embeddings(),
    )
    return _vectorstore


def retrieve(query: str, k: int = 3) -> List[Document]:
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available")
    vs = load_vectorstore()
    return vs.similarity_search(query, k=k)


def retrieve_by_statute(query: str, statute: str, k: int = 3) -> List[Document]:
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available")
    vs = load_vectorstore()
    statute_name = STATUTE_SOURCES.get(statute, statute)
    where_filter = {"source": {"$eq": statute_name}}
    return vs.similarity_search(query, k=k, where=where_filter)


def retrieve_with_scores(query: str, k: int = 5) -> List[dict]:
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available")
    vs = load_vectorstore()
    results_with_scores = vs.similarity_search_with_score(query, k=k)
    formatted = []
    for doc, score in results_with_scores:
        relevance = max(0.0, min(100.0, 100.0 - (float(score) * 100)))
        formatted.append({
            "page_content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "page": doc.metadata.get("page", 0),
            "relevance": round(relevance, 1),
        })
    return formatted


def retrieve_with_scores(query: str, k: int = 5) -> list[dict]:
    """
    Retrieve document chunks along with their relevance scores.
    """
    if not _HAS_LANGCHAIN:
        raise ImportError("langchain_community is not available in this environment")
    vs: FAISS = load_vectorstore()
    results_with_scores = vs.similarity_search_with_score(query, k=k)
    
    formatted_results = []
    for doc, score in results_with_scores:
        # L2 distance: lower is better (usually 0.0 to 2.0). Map to 0-100% similarity
        sim_score = max(0.0, min(1.0, 1.0 - (float(score) / 2.0)))
        relevance = round(sim_score * 100, 1)
        
        formatted_results.append({
            "page_content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "page": doc.metadata.get("page", 0),
            "relevance": relevance
        })
    return formatted_results


def get_chunk_count() -> Optional[int]:
    try:
        if not _HAS_LANGCHAIN:
            return None
        return load_vectorstore()._collection.count()
    except Exception:
        return None


def is_index_loaded() -> bool:
    return _vectorstore is not None


def get_available_statutes() -> List[str]:
    try:
        if not _HAS_LANGCHAIN:
            return []
        all_data = load_vectorstore()._collection.get(include=["metadatas"])
        sources = set()
        for metadata in all_data.get("metadatas", []):
            if metadata and "source" in metadata:
                sources.add(metadata["source"])
        return sorted(sources)
    except Exception:
        return []
