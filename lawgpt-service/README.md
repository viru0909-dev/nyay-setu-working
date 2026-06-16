# LawGPT Service

A FastAPI-based RAG (Retrieval-Augmented Generation) microservice that powers
grounded legal AI responses for Nyay Setu's Vakil Friend (Nyay Saarthi).

Instead of relying on an LLM's general training memory, this service retrieves
relevant chunks from actual Indian legal documents before every response —
eliminating hallucinated section numbers and fabricated case citations.

---

## How It Works
User question
→ FAISS vector search (1574+ legal chunks)
→ Top 3 relevant statute passages retrieved
→ Passed as context to Groq/Gemini/Ollama
→ Grounded answer with real citations returned

---

## Tech Stack

| Component | Technology |
|---|---|
| API framework | FastAPI |
| Vector store | FAISS (CPU) |
| Embeddings | BAAI/bge-m3 (multilingual) |
| PDF loading | PyMuPDF |
| LLM (primary) | Groq — llama-3.3-70b-versatile |
| LLM (fallback) | Google Gemini 1.5 Pro |
| LLM (local) | Ollama — llama3 |

---

## Legal Corpus (Phase 2)

| Document | Pages | Chunks | Source |
|---|---|---|---|
| BNS 2023 | 28 | 63 | bprd.nic.in |
| BNSS 2023 | 279 | 1248 | indiacode.nic.in |
| BSA 2023 | 47 | 263 | mha.gov.in |
| IPC 1860 | 119 | 733 | instapdf.in |
| CrPC 1973 | 263 | 1325 | instapdf.in |
| Constitution of India | 404 | 1407 | instapdf.in |
| Indian Evidence Act 1872 | 74 | 258 | instapdf.in |
| **Total** | **1214** | **5297** | |




> **Note:** PDFs are not included in the repository. Download them manually
> from official government sources (see Setup below).

---

## Setup

### 1. Prerequisites

- Python 3.11+
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### 2. Install dependencies

```bash
cd lawgpt-service
pip install -r requirements.txt
pip install tf-keras  # required for sentence-transformers compatibility
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
GROQ_API_KEY=gsk_your_key_here

### 4. Download legal PDFs

Create the corpus directory and download the PDFs:

```bash
mkdir -p legal_corpus
cd legal_corpus

# BNS 2023
curl -L -o "BNS_2023.pdf" "https://bprd.nic.in/uploads/pdf/BNS_English_30-04-2024.pdf"

# BNSS 2023
curl -L -o "BNSS_2023.pdf" "https://www.indiacode.nic.in/bitstream/123456789/21544/1/the_bharatiya_nagarik_suraksha_sanhita,_2023.pdf"

# BSA 2023
curl -L -o "BSA_2023.pdf" "https://www.mha.gov.in/sites/default/files/2024-04/250882_english_01042024_0.pdf"

cd ..
```

### 5. Run ingestion (builds FAISS index)

```bash
python lawgpt/ingest.py
```

Expected output:
📂 Found 7 PDF(s) in legal_corpus/
  📄 BNSS_2023.pdf: 279 pages → 1248 chunks
  📄 BNS_2023.pdf: 28 pages → 63 chunks
  📄 BSA_2023.pdf: 47 pages → 263 chunks
  📄 CRPC_1973.pdf: 263 pages → 1325 chunks
  📄 Constitution_India.pdf: 404 pages → 1407 chunks
  📄 Evidence_Act_1872.pdf: 74 pages → 258 chunks
  📄 IPC_1860.pdf: 119 pages → 733 chunks
✅ Indexed 5297 chunks from 7 files
> First run downloads the BAAI/bge-m3 model (~2.3GB). Subsequent runs use
> the cached model and complete in under a minute.

### 6. Start the service

```bash
uvicorn main:app --reload --port 8001
```

Expected output:
✅ FAISS index loaded — RAG ready (1574 vectors)
INFO: Uvicorn running on http://127.0.0.1:8001

---

## API Endpoints

### `GET /health`

Check service status and index state.

```bash
curl http://localhost:8001/health
```

```json
{
  "status": "ok",
  "index_loaded": true,
  "model": "groq",
  "chunk_count": 5297
}
```

### `POST /context`

Retrieve relevant legal chunks for a question. Called internally by
Spring Boot's `RagService.java` — does NOT call the LLM.

```bash
curl -X POST http://localhost:8001/context \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the punishment for theft?", "max_results": 3}'
```

```json
{
  "context": "- Theft (Section 303 BNS)...\n\n- Rigorous imprisonment...",
  "sources": ["BNS_2023.pdf — page 13", "BNSS_2023.pdf — page 207"]
}
```

### `POST /chat`

Full RAG pipeline — retrieves context and calls LLM. For standalone
testing and direct use.

```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain BNS Section 303", "session_id": "test-1"}'
```

```json
{
  "answer": "BNS Section 303 deals with theft...",
  "sources": ["BNS_2023.pdf — page 13"],
  "session_id": "test-1",
  "model_used": "groq"
}
```

---

## Integration with Spring Boot

This service runs as a sidecar alongside the main Spring Boot backend.
`RagService.java` proxies to this service automatically:
Spring Boot (port 8080)
└── RagService.java → POST http://localhost:8001/context
└── FAISS retrieval
└── Returns legal context
└── VakilFriendService.java → Groq (with retrieved context)

No changes required to the frontend or any Spring Boot controllers.
If this service is unavailable, Spring Boot falls back gracefully with
an empty context string.

---

## Project Structure
<img width="820" height="399" alt="image" src="https://github.com/user-attachments/assets/dc7f1e0c-703f-4cdc-b251-4ee233ed6c08" />

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes (for /chat) | Free key from console.groq.com |
| `GEMINI_API_KEY` | No | Fallback if Groq unavailable |

The `/context` endpoint (used by Spring Boot) does not require any API
key — it only does vector search, no LLM calls.

---

## Contributing

This service is part of the
[Nyay Setu](https://github.com/viru0909-dev/nyay-setu-working) project,
a GSSoC 2025 open source initiative.

To add more legal documents to the corpus:
1. Drop PDFs into `legal_corpus/`
2. Re-run `python lawgpt/ingest.py`
3. Restart the service

The FAISS index will be rebuilt automatically with all documents.
