"""
lawgpt/ingest.py — PDF ingestion pipeline for Nyay Setu LawGPT.

Loads all PDFs from legal_corpus/, splits them into chunks with
Indian-legal-aware separators, embeds with BAAI/bge-m3, and persists
to a ChromaDB collection at vector_store/chroma_db/.

Usage:
    python lawgpt/ingest.py
"""

import shutil
import sys
from pathlib import Path
from typing import List, Dict

# pyrefly: ignore [missing-import]
import fitz  # PyMuPDF

# pyrefly: ignore [missing-import]
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# pyrefly: ignore [missing-import]
from langchain.schema import Document

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR: Path = Path(__file__).resolve().parent.parent
CORPUS_DIR: Path = BASE_DIR / "legal_corpus"
CHROMA_DIR: Path = BASE_DIR / "vector_store" / "chroma_db"
COLLECTION_NAME: str = "legal_corpus"


def _statute_from_filename(filename: str) -> str:
    """Derive a short statute key from a PDF filename.

    Examples:
        IPC_1860.pdf      → "IPC"
        BNS_2023.pdf      → "BNS"
        Constitution.pdf  → "CONSTITUTION"
    """
    stem = Path(filename).stem  # strip .pdf
    return stem.split("_")[0].upper()  # take prefix before first underscore


def extract_text_from_pdf(pdf_path: Path) -> List[Document]:
    """Extract text from a PDF file, one Document per page with metadata."""
    documents: List[Document] = []
    filename: str = pdf_path.name
    statute: str = _statute_from_filename(filename)

    try:
        doc = fitz.open(str(pdf_path))
        for page_num in range(len(doc)):
            page = doc[page_num]
            text: str = page.get_text("text")
            if text.strip():
                documents.append(
                    Document(
                        page_content=text,
                        metadata={
                            "source": filename,
                            "page": page_num + 1,
                            "statute": statute,  # ← new: enables filter
                        },
                    )
                )
        doc.close()
    except Exception as e:
        print(f"❌ Error reading {filename}: {e}")

    return documents


def build_chunks(documents: List[Document]) -> List[Document]:
    """Split documents into retrieval-friendly chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", "Section ", "Article ", "।", "धारा "],
    )
    chunks: List[Document] = splitter.split_documents(documents)
    return chunks


def ingest() -> None:
    """Main ingestion pipeline: PDF → chunks → ChromaDB collection."""

    # Ensure corpus directory exists
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)

    # Clear previous ChromaDB collection so re-runs don't duplicate vectors
    if CHROMA_DIR.exists():
        shutil.rmtree(CHROMA_DIR)
        print("🗑️  Cleared existing ChromaDB collection.")
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)

    # Discover PDFs
    pdf_files: List[Path] = sorted(CORPUS_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"⚠️  No PDF files found in {CORPUS_DIR}/")
        print(
            "   Drop your legal PDFs (e.g. IPC_1860.pdf) into that folder and re-run."
        )
        sys.exit(1)

    print(f"📂 Found {len(pdf_files)} PDF(s) in {CORPUS_DIR}/\n")

    # Extract text from all PDFs
    all_documents: List[Document] = []
    file_chunk_counts: Dict[str, int] = {}

    for pdf_path in pdf_files:
        page_docs: List[Document] = extract_text_from_pdf(pdf_path)
        chunks: List[Document] = build_chunks(page_docs)
        file_chunk_counts[pdf_path.name] = len(chunks)
        all_documents.extend(chunks)
        print(f"  📄 {pdf_path.name}: {len(page_docs)} pages → {len(chunks)} chunks")

    if not all_documents:
        print("\n❌ No text could be extracted from the PDFs.")
        sys.exit(1)

    # Embed and persist to ChromaDB
    print(f"\n🔄 Embedding {len(all_documents)} chunks with BAAI/bge-m3 ...")
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
    Chroma.from_documents(
        all_documents,
        embeddings,
        persist_directory=str(CHROMA_DIR),
        collection_name=COLLECTION_NAME,
    )

    # Summary
    total_chunks: int = len(all_documents)
    file_count: int = len(pdf_files)
    print(f"\n✅ Indexed {total_chunks} chunks from {file_count} files:")
    for fname, count in file_chunk_counts.items():
        statute = _statute_from_filename(fname)
        print(f"   • {fname} [{statute}]: {count} chunks")
    print(f"\n💾 ChromaDB collection persisted to {CHROMA_DIR}/")


if __name__ == "__main__":
    ingest()
