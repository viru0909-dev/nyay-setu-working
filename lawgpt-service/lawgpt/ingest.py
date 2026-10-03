"""
lawgpt/ingest.py — PDF ingestion pipeline for ChromaDB.

Loads PDFs from legal_corpus/, chunks them, adds statute metadata,
embeds with BAAI/bge-m3, and saves to persistent ChromaDB.

Usage:
    python lawgpt/ingest.py
"""

import sys
import shutil
from pathlib import Path
from typing import List, Dict

import fitz
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document


BASE_DIR: Path = Path(__file__).resolve().parent.parent
CORPUS_DIR: Path = BASE_DIR / "legal_corpus"
CHROMADB_DIR: Path = BASE_DIR / "vector_store" / "chromadb_legal"

STATUTE_MAPPING = {
    "IPC": "Indian Penal Code",
    "CrPC": "Criminal Procedure Code",
    "BNS": "Bharatiya Nyaya Sanhita 2023",
    "BNSS": "Bharatiya Nagarik Suraksha Sanhita 2023",
    "BSA": "Bharatiya Sakshya Adhiniyam 2023",
    "Constitution": "Indian Constitution",
    "Evidence": "Indian Evidence Act",
}


def infer_statute_from_filename(filename: str) -> str:
    for code, name in STATUTE_MAPPING.items():
        if code.lower() in filename.lower():
            return name
    return filename.replace(".pdf", "").title()


def extract_text_from_pdf(pdf_path: Path) -> List[Document]:
    documents = []
    filename = pdf_path.name
    statute_name = infer_statute_from_filename(filename)
    try:
        doc = fitz.open(str(pdf_path))
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                documents.append(
                    Document(
                        page_content=text,
                        metadata={
                            "source": statute_name,
                            "page": page_num + 1,
                            "filename": filename,
                        },
                    )
                )
        doc.close()
    except Exception as e:
        print(f"Error reading {filename}: {e}")
    return documents


def build_chunks(documents: List[Document]) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", "Section ", "Article ", "।", "धारा "],
    )
    return splitter.split_documents(documents)


def ingest() -> None:
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    CHROMADB_DIR.parent.mkdir(parents=True, exist_ok=True)

    if CHROMADB_DIR.exists():
        shutil.rmtree(CHROMADB_DIR)
        print(f"Removed old ChromaDB at {CHROMADB_DIR}")

    pdf_files = sorted(CORPUS_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {CORPUS_DIR}/")
        print("Drop your legal PDFs (e.g. BNS_2023.pdf) into that folder and re-run.")
        sys.exit(1)

    print(f"Found {len(pdf_files)} PDF(s) in {CORPUS_DIR}/\n")

    all_documents = []
    file_chunk_counts = {}

    for pdf_path in pdf_files:
        page_docs = extract_text_from_pdf(pdf_path)
        chunks = build_chunks(page_docs)
        file_chunk_counts[pdf_path.name] = len(chunks)
        all_documents.extend(chunks)
        statute = infer_statute_from_filename(pdf_path.name)
        print(f"  {pdf_path.name}: {len(page_docs)} pages -> {len(chunks)} chunks [{statute}]")

    if not all_documents:
        print("No text could be extracted from the PDFs.")
        sys.exit(1)

    print(f"Embedding {len(all_documents)} chunks with BAAI/bge-m3 ...")
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
    vectorstore = Chroma.from_documents(
        all_documents, embeddings, persist_directory=str(CHROMADB_DIR)
    )
    vectorstore.persist()

    total_chunks = len(all_documents)
    file_count = len(pdf_files)
    print(f"Indexed {total_chunks} chunks from {file_count} files:")
    for fname, count in file_chunk_counts.items():
        print(f"   - {fname}: {count} chunks")
    print(f"ChromaDB saved to {CHROMADB_DIR}/")
    print("Data is now persistent across service restarts!")


if __name__ == "__main__":
    ingest()
