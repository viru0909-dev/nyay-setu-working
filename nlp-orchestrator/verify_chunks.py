import sys
from config import CHROMA_PATH
import chromadb

doc_id = sys.argv[1]
client = chromadb.PersistentClient(path=CHROMA_PATH)
try:
    col = client.get_collection('kanoon')
    res = col.get(where={'doc_id': doc_id})
    docs = res.get('documents', [])
    print(f"\n=== Results for {doc_id} ===")
    print(f"Total chunks generated: {len(docs)}")
    for i, doc in enumerate(docs):
        print(f"\n--- Chunk {i} ---\n{doc}\n")
except Exception as e:
    print(f"Error accessing ChromaDB: {e}")