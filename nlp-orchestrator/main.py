"""
Nyay Saarthi — Legal Reasoning NLP Orchestrator
FastAPI Entry Point with SSE Streaming

Port: 8001
Endpoints:
  POST /api/legal/analyze-stream    — Full SSE pipeline (production)
  POST /api/legal/analyze           — Sync version (testing only)
  GET  /health                      — Health check
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from config import FRONTEND_ORIGIN
from decomposer import decompose_query
from router import route_questions
from research import run_parallel_research
from synthesizer import synthesize_answers
from avatar_speech import get_interim_messages, convert_to_hinglish
from routers.forensics import router as forensics_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nlp-orchestrator")


# ─── App Setup ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🧠 Nyay Saarthi NLP Orchestrator starting on port 8001")
    yield
    logger.info("NLP Orchestrator shutting down")

app = FastAPI(
    title="Nyay Saarthi — NLP Orchestrator",
    description="Legal Reasoning Pipeline: Decompose → Route → Research → Synthesize → Speak",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forensics_router)


# ─── Models ───────────────────────────────────────────────────────────────────

class LegalQuery(BaseModel):
    query: str
    language: str = "en"


# ─── SSE Event Builder ────────────────────────────────────────────────────────

def sse_event(event_type: str, data: dict) -> str:
    """Return a JSON-encoded SSE event string."""
    return json.dumps({"type": event_type, **data})


# ─── Core SSE Pipeline ────────────────────────────────────────────────────────

async def legal_reasoning_pipeline(query: str, language: str):
    """
    Async generator that yields SSE events through the full 5-layer pipeline.

    Fix: Removed inner async generator — research now runs as a background
    asyncio.Task while interim messages are yielded from the outer generator.
    """
    try:
        # ── Layer 1: Decompose ───────────────────────────────────
        logger.info(f"[Layer 1] Decomposing: {query[:60]}...")
        yield sse_event("avatar_update", {"message": "Aapka sawaal samajh raha hoon, thoda wait karein..."})

        sub_questions = await decompose_query(query)
        logger.info(f"[Layer 1] Got {len(sub_questions)} sub-questions")
        yield sse_event("sub_questions", {"questions": sub_questions})

        # ── Layer 2: Route ───────────────────────────────────────
        routed = route_questions(sub_questions)
        logger.info(f"[Layer 2] Routing: {[(r['question'][:30], r['model']) for r in routed]}")

        # ── Layer 5a: Interim Avatar Messages (to stream while research runs) ──
        interim_messages = get_interim_messages(query, count=3)

        # ── Layer 3: Parallel Research ───────────────────────────
        yield sse_event("research_start", {"total": len(routed)})

        # Launch research as a background Task so we can yield interims concurrently
        research_task = asyncio.create_task(run_parallel_research(routed))

        # Yield interim avatar messages every 2.5s while research task completes
        for msg in interim_messages:
            if research_task.done():
                break
            yield sse_event("avatar_update", {"message": msg})
            await asyncio.sleep(2.5)

        # Await the completed research (may already be done)
        results = await research_task

        # Stream each individual sub-answer
        for result in results:
            if result.get("answer"):
                yield sse_event("sub_answer", {
                    "question": result["question"],
                    "answer": result["answer"],
                    "source": result["source"]
                })

        # ── Layer 4: Synthesize ──────────────────────────────────
        yield sse_event("synthesis_start", {})
        yield sse_event("avatar_update", {"message": "Sab information mila di, ab aapke liye summary bana raha hoon..."})

        logger.info("[Layer 4] Synthesizing...")
        synthesized_md = await synthesize_answers(query, results)

        # ── Layer 5b: Hinglish Conversion ────────────────────────
        logger.info("[Layer 5] Converting to Hinglish...")
        hinglish_dialogue = await convert_to_hinglish(synthesized_md)

        yield sse_event("final_answer", {
            "markdown": synthesized_md,
            "hinglish": hinglish_dialogue
        })

        yield sse_event("done", {"message": "Research complete"})
        logger.info("[Pipeline] Done ✓")

    except Exception as e:
        logger.error(f"[Pipeline] Fatal error: {e}")
        yield sse_event("error", {"message": str(e)})
        yield sse_event("done", {"message": "Error occurred"})


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "nlp-orchestrator", "port": 8001}


@app.post("/api/legal/analyze-stream")
async def analyze_stream(body: LegalQuery, request: Request):
    """
    Primary SSE endpoint — streams the full legal reasoning pipeline.
    Frontend connects using fetch + ReadableStream for real-time updates.
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    logger.info(f"[Stream] New query: {body.query[:80]}")

    async def event_generator():
        async for event in legal_reasoning_pipeline(body.query, body.language):
            if await request.is_disconnected():
                logger.info("[Stream] Client disconnected")
                break
            yield {"data": event}

    return EventSourceResponse(event_generator())


@app.post("/api/legal/analyze")
async def analyze_sync(body: LegalQuery):
    """
    Synchronous endpoint — runs the full pipeline and returns all results at once.
    Use only for testing. In production, use /analyze-stream for real-time UX.
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    logger.info(f"[Sync] Analyzing: {body.query[:80]}")

    sub_questions = await decompose_query(body.query)
    routed = route_questions(sub_questions)
    results = await run_parallel_research(routed)
    synthesized = await synthesize_answers(body.query, results)
    hinglish = await convert_to_hinglish(synthesized)

    return JSONResponse({
        "query": body.query,
        "sub_questions": sub_questions,
        "research": results,
        "final_answer": {
            "markdown": synthesized,
            "hinglish": hinglish
        }
    })


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
