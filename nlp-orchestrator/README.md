# Nyay Saarthi — Legal Reasoning NLP Orchestrator

A Python FastAPI microservice that acts as the intelligent middle layer between the user's legal questions and AI models (Groq + Gemini).

## Architecture

```
User Query
    ↓
[1] Query Decomposer     — Splits complex question into 3-5 sub-questions
    ↓
[2] Smart Router         — Routes each to Groq (simple) or Gemini (complex)
    ↓
[3] Parallel Research    — All sub-questions fire simultaneously via asyncio.gather()
    ↓
[4] Synthesizer          — Merges sub-answers into one structured final answer
    ↓
[5] Avatar Speech Layer  — Generates interim Hinglish messages + final Hinglish dialogue
    ↓
SSE Stream → React Frontend
```

## Setup

### 1. Install Python (3.11+)

### 2. Create a virtual environment
```bash
cd nlp-orchestrator
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up API keys
```bash
cp .env.example .env
# Edit .env and fill in your GROQ_API_KEY and GOOGLE_GEMINI_API_KEY
```

### 4a. Indian Kanoon (recommended)

To ground responses with real judgments and sections, set the Indian Kanoon token:

```bash
INDIAN_KANOON_TOKEN=your_indian_kanoon_token_here
# Optional override
INDIAN_KANOON_API_URL=https://api.indiankanoon.org
```

### 5. Run the service
```bash
uvicorn main:app --port 8001 --reload
```

Service will be available at: http://localhost:8001

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/legal/analyze-stream` | **SSE streaming** (production) |
| POST | `/api/legal/analyze` | Sync full response (testing) |
| POST | `/ocr/modi` | Modi script image OCR with Devanagari text output |

## Modi OCR

The OCR endpoint accepts a Modi script document image as multipart form data, preprocesses it with OpenCV/Pillow, and runs a lightweight TrOCR-compatible Hugging Face model.

Optional `.env` values:

```bash
TROCR_MODEL_NAME=Piyush3142/trocr-sanskrit-ocr
TROCR_DEVICE=          # Optional: cuda, cuda:0, or cpu. Empty auto-selects CUDA when available.
HF_TOKEN=              # Optional: only needed for private or gated Hugging Face models.
```

The default checkpoint is lightweight enough for local inference compared with 12B+ vision-language models. Accuracy on handwritten Modi will improve when a small Modi-specific TrOCR-compatible checkpoint is configured through `TROCR_MODEL_NAME`.

### OCR request

```bash
curl -X POST http://localhost:8001/ocr/modi \
  -F "file=@path/to/modi_document.png"
```

Response:

```json
{
  "status": "success",
  "predicted_text": "देवनागरी OCR output",
  "processing_time": "1.23s"
}
```

### Swagger testing

1. Start the service with `uvicorn main:app --port 8001 --reload`.
2. Open `http://localhost:8001/docs`.
3. Expand the `OCR` section.
4. Use `POST /ocr/modi` and upload a Modi script image.

### MoDeTrans validation sample

Use the public MoDeTrans dataset for manual validation:

```python
from datasets import load_dataset

dataset = load_dataset("historyHulk/MoDeTrans", split="train", streaming=True)
sample = next(iter(dataset))
sample["image"].save("modi_sample.png")
```

Then upload `modi_sample.png` to `/ocr/modi`.

## SSE Event Types (streamed to frontend)

```json
{ "type": "avatar_update",   "message": "Researching motor liability..." }
{ "type": "sub_questions",   "questions": ["...", "..."] }
{ "type": "research_start",  "total": 4 }
{ "type": "sub_answer",      "question": "...", "answer": "...", "source": "groq" }
{ "type": "synthesis_start" }
{ "type": "final_answer",    "markdown": "...", "hinglish": "..." }
{ "type": "done" }
```

## Testing

```bash
# Health check
curl http://localhost:8001/health

# Sync test (returns full JSON at once)
curl -X POST http://localhost:8001/api/legal/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "Am I liable if I rear-ended someone at a red light?"}'

# SSE streaming test (events appear progressively)
curl -N -X POST http://localhost:8001/api/legal/analyze-stream \
  -H "Content-Type: application/json" \
  -d '{"query": "Am I liable if I rear-ended someone at a red light?"}'
```

## Frontend Integration (React)

```javascript
const eventSource = new EventSource('/api/legal/analyze-stream');

// Or with POST via fetch + readable stream:
const response = await fetch('http://localhost:8001/api/legal/analyze-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userMessage })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      if (event.type === 'avatar_update') setAvatarMessage(event.message);
      if (event.type === 'final_answer') setFinalAnswer(event.markdown);
    }
  }
}
```
