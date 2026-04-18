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

from config import FRONTEND_ORIGIN, GROQ_API_KEY, GROQ_MODEL_FAST, GEMINI_API_KEY, GEMINI_MODEL
from decomposer import decompose_query
from router import route_questions
from research import run_parallel_research
from synthesizer import synthesize_answers
from avatar_speech import get_interim_messages, convert_to_hinglish, detect_domain
from services.kanoon_search import build_kanoon_context
from routers.forensics import router as forensics_router

# Initialize clients for deep research pipeline
from groq import AsyncGroq
from google import genai

groq_client = AsyncGroq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

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

# ─── Deep Research Pipeline ──────────────────────────────────────────────────

DEEP_RESEARCH_SYSTEM_PROMPT = """You are Nyay Saarthi legal AI. Answer ONLY using the provided Indian Kanoon legal context below.
If the answer is not in the context, say "I need to verify this — please consult an advocate."

CONTEXT FROM INDIAN KANOON:
{kanoon_context}

USER QUERY: {user_query}

Provide a thorough legal analysis. Cite the exact section or judgment you used.
Structure your response with:
1. Direct answer to the question
2. Relevant legal sections with exact numbers
3. Key case precedents cited
4. Practical steps for the citizen
5. Important caveats or disclaimers

Format in Markdown. Be precise and cite sources."""


async def deep_research_pipeline(query: str, language: str):
    """
    Async generator that yields SSE events through the 5-stage deep research pipeline.
    Each stage emits: stage update, avatar_speak, and relevant data events.
    """
    try:
        # ── Stage 1: UNDERSTANDING ────────────────────────────────
        logger.info(f"[Deep Research] Stage 1: Understanding query: {query[:60]}...")
        
        domain = detect_domain(query)
        domain_label = domain.upper() if domain != "general" else "GENERAL LEGAL"
        
        yield sse_event("stage", {
            "stage": "understanding",
            "status": "active",
            "domain": domain_label,
            "message": f"Analyzing your query — detected domain: {domain_label}"
        })
        yield sse_event("avatar_speak", {
            "message": "Aapka sawaal samajh aa gaya. Legal domain identify ho raha hai..."
        })
        await asyncio.sleep(1)  # Brief pause for UX
        
        yield sse_event("stage", {
            "stage": "understanding",
            "status": "complete",
            "domain": domain_label,
            "message": f"Domain identified: {domain_label}"
        })

        # ── Stage 2: SEARCHING KANOON ─────────────────────────────
        logger.info("[Deep Research] Stage 2: Searching Indian Kanoon...")
        
        yield sse_event("stage", {
            "stage": "searching",
            "status": "active",
            "message": "Searching Indian Kanoon database..."
        })
        yield sse_event("avatar_speak", {
            "message": "Indian Kanoon mein relevant cases dhundh raha hoon..."
        })

        kanoon_context, kanoon_results = await build_kanoon_context(query, max_results=3)
        
        yield sse_event("kanoon_results", {
            "results": kanoon_results[:2]  # Send top 2 for display
        })
        yield sse_event("stage", {
            "stage": "searching",
            "status": "complete",
            "message": f"Found {len(kanoon_results)} relevant judgments"
        })

        # ── Stage 3: ROUTING ──────────────────────────────────────
        logger.info("[Deep Research] Stage 3: Routing...")
        
        # Compute complexity score for display
        from router import classify_question, COMPLEX_KEYWORDS, SIMPLE_KEYWORDS
        lower_q = query.lower()
        complex_score = sum(1 for kw in COMPLEX_KEYWORDS if kw in lower_q)
        simple_score = sum(1 for kw in SIMPLE_KEYWORDS if kw in lower_q)
        word_count = len(query.split())
        
        # Normalized complexity 0-1
        complexity = min(1.0, (complex_score * 0.3 + word_count * 0.02))
        model_choice = "gemini" if complexity >= 0.5 else "groq"
        
        yield sse_event("stage", {
            "stage": "routing",
            "status": "active",
            "complexity": round(complexity, 2),
            "model": model_choice,
            "message": f"Complexity score: {round(complexity, 2)} — sending to {'Gemini for deep analysis' if model_choice == 'gemini' else 'Groq for fast response'}"
        })
        
        if complexity >= 0.5:
            yield sse_event("avatar_speak", {
                "message": "Yeh complex case hai, Gemini se deep analysis kar raha hoon..."
            })
        else:
            yield sse_event("avatar_speak", {
                "message": "Simple query hai, Groq se fast response le raha hoon..."
            })
        
        await asyncio.sleep(0.5)
        yield sse_event("stage", {
            "stage": "routing",
            "status": "complete",
            "complexity": round(complexity, 2),
            "model": model_choice,
            "message": f"Routed to {model_choice.upper()}"
        })

        # ── Stage 4: REASONING ────────────────────────────────────
        logger.info("[Deep Research] Stage 4: Reasoning...")
        
        yield sse_event("stage", {
            "stage": "reasoning",
            "status": "active",
            "message": "Legal reasoning in progress..."
        })
        yield sse_event("avatar_speak", {
            "message": "Legal reasoning chal rahi hai, thoda wait karein..."
        })

        # Build grounded prompt with Kanoon context
        grounded_prompt = DEEP_RESEARCH_SYSTEM_PROMPT.format(
            kanoon_context=kanoon_context if kanoon_context else "No specific Indian Kanoon context found. Use your general legal knowledge but clearly state you cannot verify specific judgments.",
            user_query=query
        )

        # Call the AI model and stream reasoning
        if model_choice == "gemini" and gemini_client:
            try:
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: gemini_client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=grounded_prompt
                    )
                )
                ai_answer = response.text.strip()
            except Exception as e:
                logger.error(f"Gemini failed, falling back to Groq: {e}")
                model_choice = "groq"
                ai_answer = None
        
        if model_choice == "groq" or (model_choice == "gemini" and not gemini_client):
            response = await groq_client.chat.completions.create(
                model=GROQ_MODEL_FAST,
                messages=[
                    {"role": "system", "content": grounded_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.2,
                max_tokens=2048
            )
            ai_answer = response.choices[0].message.content.strip()

        # Stream reasoning text in chunks for live display
        if ai_answer:
            words = ai_answer.split()
            chunk_size = 8
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i:i + chunk_size])
                yield sse_event("reasoning", {"text": chunk})
                await asyncio.sleep(0.1)  # Small delay for streaming effect

        yield sse_event("stage", {
            "stage": "reasoning",
            "status": "complete",
            "message": "Legal analysis complete"
        })

        # ── Stage 5: VERDICT ──────────────────────────────────────
        logger.info("[Deep Research] Stage 5: Verdict...")
        
        yield sse_event("stage", {
            "stage": "verdict",
            "status": "active",
            "message": "Preparing final legal conclusion..."
        })

        # Convert to Hinglish for avatar speech
        hinglish_verdict = await convert_to_hinglish(ai_answer or "Analysis could not be completed.")

        # Build citations
        citations = []
        for r in kanoon_results:
            citations.append({
                "title": r["title"],
                "doc_id": r["doc_id"]
            })

        yield sse_event("avatar_speak", {
            "message": f"Analysis complete. {hinglish_verdict}"
        })

        yield sse_event("final", {
            "answer": ai_answer or "Unable to generate analysis.",
            "hinglish": hinglish_verdict,
            "citations": citations,
            "model_used": model_choice,
            "domain": domain_label
        })

        yield sse_event("stage", {
            "stage": "verdict",
            "status": "complete",
            "message": "Deep research complete"
        })

        yield sse_event("done", {"message": "Deep research complete"})
        logger.info("[Deep Research] Pipeline complete ✓")

    except Exception as e:
        logger.error(f"[Deep Research] Fatal error: {e}")
        yield sse_event("error", {"message": str(e)})
        yield sse_event("done", {"message": "Error occurred"})


@app.post("/research/deep")
async def deep_research(body: LegalQuery, request: Request):
    """
    Deep Research SSE endpoint — streams 5-stage legal reasoning with
    Indian Kanoon context. Frontend connects directly to this for
    the reasoning panel + avatar speech updates.
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    logger.info(f"[Deep Research] New query: {body.query[:80]}")

    async def event_generator():
        async for event in deep_research_pipeline(body.query, body.language):
            if await request.is_disconnected():
                logger.info("[Deep Research] Client disconnected")
                break
            yield {"data": event}

    return EventSourceResponse(event_generator())


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

