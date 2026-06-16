"""
Nyay Saarthi — Legal Reasoning NLP Orchestrator
FastAPI Entry Point with SSE Streaming

Port: 8001
Endpoints:
  POST /api/legal/analyze-stream    — Full SSE pipeline (production)
  POST /api/legal/analyze           — Sync version (testing only)
  GET  /health                      — Health check
"""

import os
from utils import async_retry
import asyncio
import json

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from sse_starlette.sse import EventSourceResponse

from cache import generate_cache_key, get_cached_response, set_cached_response
from config import (
    FRONTEND_ORIGIN,
    GROQ_API_KEY,
    GROQ_MODEL_FAST,
    GEMINI_API_KEY,
    GEMINI_MODEL,
)
from decomposer import decompose_query
from router import route_questions
from research import run_parallel_research, execute_with_fallback
from synthesizer import (
    synthesize_answers,
    stream_synthesize_answers,
    synthesize_answers_structured,
    stream_synthesize_answers_structured,
)
from validators.citation_validator import validate_citations_from_text
from avatar_speech import get_interim_messages, convert_to_hinglish, detect_domain
from services.kanoon_search import build_kanoon_context
from sanitizer import sanitize_user_input, sanitize_prompt_input

# Initialize clients for deep research pipeline
from groq import AsyncGroq
from google import genai

groq_client = AsyncGroq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nlp-orchestrator")
# ─── Sensitive fields to redact in production ─────────────────────────────────
SENSITIVE_FIELDS = {"authorization", "password", "token", "api_key", "secret"}


def redact(headers: dict) -> dict:
    """Mask sensitive header values in production."""
    if os.getenv("ENV", "development") != "production":
        return dict(headers)
    return {
        k: "***REDACTED***" if k.lower() in SENSITIVE_FIELDS else v
        for k, v in headers.items()
    }


# ─── Logging Middleware ───────────────────────────────────────────────────────
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())

        logger.info(
            {
                "event": "request_received",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host,
                "headers": redact(dict(request.headers)),
            }
        )

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        response.headers["X-Request-ID"] = request_id

        logger.info(
            {
                "event": "request_completed",
                "request_id": request_id,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            }
        )

        return response


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
    lifespan=lifespan,
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ORIGIN,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://nyaysetu-lovat.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from routers.forensics import router as forensics_router

    app.include_router(forensics_router)
    logger.info("Loaded forensics router.")
except ImportError:
    logger.warning("Skipping forensics router due to missing dependencies.")

try:
    from routers.modi_ocr import router as modi_ocr_router

    app.include_router(modi_ocr_router)
    logger.info("Loaded modi_ocr router.")
except ImportError:
    logger.warning("Skipping modi_ocr router due to missing dependencies.")
try:
    from routers.ocr import router as ocr_router

    app.include_router(ocr_router)
    logger.info("Loaded ocr router.")
except ImportError:
    logger.warning("Skipping ocr router due to missing dependencies.")

try:
    from routers.contradictions import router as contradictions_router

    app.include_router(contradictions_router)
    logger.info("Loaded contradictions router.")
except Exception as e:
    logger.warning("Skipping contradictions router: %s", e)


# ─── Models ───────────────────────────────────────────────────────────────────


class LegalQuery(BaseModel):
    query: str
    language: str = "en"

    @field_validator("query")
    @classmethod
    def validate_and_sanitize_query(cls, v):
        v = sanitize_user_input(v)
        if not v:
            raise ValueError("Query cannot be empty")
        if len(v) > 2000:
            raise ValueError("Query exceeds maximum length of 2000 characters")
        return v

    @field_validator("language")
    @classmethod
    def validate_language(cls, v):
        allowed = {"en", "hi", "hinglish"}
        if v not in allowed:
            raise ValueError(f"Language must be one of: {allowed}")
        return v


# ─── SSE Event Builder ────────────────────────────────────────────────────────


def sse_event(event_type: str, data: dict) -> str:
    """Return a JSON-encoded SSE event string."""
    return json.dumps({"type": event_type, **data})


# ─── Core SSE Pipeline ────────────────────────────────────────────────────────


async def legal_reasoning_pipeline(query: str, language: str):
    """
    Async generator that yields SSE events through the full 5-layer pipeline.
    """
    kanoon_task = None
    research_task = None

    try:
        # ── Layer 1: Decompose ───────────────────────────────────
        # Sanitize query for prompt injection before sending to AI
        safe_query = sanitize_prompt_input(query)
        logger.info(f"[Layer 1] Decomposing: {safe_query[:60]}...")
        yield sse_event(
            "avatar_update",
            {"message": "Aapka sawaal samajh raha hoon, thoda wait karein..."},
        )

        kanoon_task = asyncio.create_task(build_kanoon_context(query, max_results=3))

        sub_questions = await decompose_query(safe_query)
        logger.info(f"[Layer 1] Got {len(sub_questions)} sub-questions")
        yield sse_event("sub_questions", {"questions": sub_questions})

        # ── Layer 2: Route ───────────────────────────────────────
        routed = route_questions(sub_questions)
        logger.info(
            f"[Layer 2] Routing: {[(r['question'][:30], r['model']) for r in routed]}"
        )

        try:
            kanoon_context, _ = await kanoon_task
        except Exception as e:
            logger.error("[Layer 2] Indian Kanoon fetch failed: %s", e)
            kanoon_context = ""

        # ── Layer 5a: Interim Avatar Messages (to stream while research runs) ──
        interim_messages = get_interim_messages(query, count=3)

        # ── Layer 3: Parallel Research ───────────────────────────
        yield sse_event("research_start", {"total": len(routed)})

        # Launch research as a background Task so we can yield interims concurrently
        research_task = asyncio.create_task(
            run_parallel_research(routed, kanoon_context=kanoon_context)
        )

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
                yield sse_event(
                    "sub_answer",
                    {
                        "question": result["question"],
                        "answer": result["answer"],
                        "source": result["source"],
                    },
                )

        # ── Layer 4: Synthesize ──────────────────────────────────
        yield sse_event("synthesis_start", {})
        yield sse_event(
            "avatar_update",
            {
                "message": "Sab information mila di, ab aapke liye summary bana raha hoon..."
            },
        )

        logger.info("[Layer 4] Synthesizing with structured streaming...")

        synthesized_md = ""
        cited_laws_from_stream = []

        # Stream synthesis tokens using the structured generator
        async for chunk in stream_synthesize_answers_structured(safe_query, results):
            if chunk.get("text"):
                synthesized_md += chunk["text"]
                yield sse_event("synthesis_token", {"chunk": chunk["text"]})
            if chunk.get("citations"):
                cited_laws_from_stream = chunk["citations"]

        logger.info("[Layer 4] Synthesis complete")

        try:
            validation_results = validate_citations_from_text(synthesized_md)
            if validation_results:
                logger.info(
                    "[Layer 4] Citation validation results: %s", validation_results
                )
        except Exception as e:
            logger.warning("[Layer 4] Citation validation failed (non-blocking): %s", e)
            validation_results = []

        # ── Layer 5b: Hinglish Conversion ────────────────────────
        logger.info("[Layer 5] Converting to Hinglish...")
        hinglish_dialogue = await convert_to_hinglish(synthesized_md)

        yield sse_event(
            "final_answer",
            {
                "markdown": synthesized_md,
                "hinglish": hinglish_dialogue,
                "cited_laws": cited_laws_from_stream,
                "citation_validation": validation_results,
            },
        )

        yield sse_event("done", {"message": "Research complete"})
        logger.info("[Pipeline] Done ✓")

    except (GeneratorExit, asyncio.CancelledError):
        logger.info("[Pipeline] Client disconnected — cleaning up tasks")
        raise

    except Exception as e:
        logger.error(f"[Pipeline] Fatal error: {e}")
        yield sse_event("error", {"message": str(e)})
        yield sse_event("done", {"message": "Error occurred"})

    finally:
        if kanoon_task is not None and not kanoon_task.done():
            kanoon_task.cancel()
            try:
                await kanoon_task
            except (asyncio.CancelledError, BaseException):
                pass

        if research_task is not None and not research_task.done():
            research_task.cancel()
            try:
                await research_task
            except (asyncio.CancelledError, BaseException):
                pass


# ─── Endpoints ────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok", "service": "nlp-orchestrator", "port": 8001}


@app.get("/models")
async def get_models():
    return {
        "groq": {"model": GROQ_MODEL_FAST, "available": bool(GROQ_API_KEY)},
        "gemini": {"model": GEMINI_MODEL, "available": bool(GEMINI_API_KEY)},
    }


@app.post("/api/legal/analyze-stream")
async def analyze_stream(body: LegalQuery, request: Request):
    """
    Primary SSE endpoint — streams the full legal reasoning pipeline.
    Frontend connects using fetch + ReadableStream for real-time updates.
    Input validation and sanitization is handled by the LegalQuery Pydantic model.
    """

    logger.info(f"[Stream] New query: {body.query[:80]}")

    async def event_generator():
        pipeline = legal_reasoning_pipeline(body.query, body.language)

        try:
            async for event in pipeline:
                if await request.is_disconnected():
                    logger.info("[Stream] Client disconnected")
                    break
                yield {"data": event}
        finally:
            await pipeline.aclose()

    return EventSourceResponse(event_generator())


@app.post("/api/legal/analyze")
async def analyze_sync(body: LegalQuery):
    """
    Synchronous endpoint — runs the full pipeline and returns all results at once.
    Use only for testing. In production, use /analyze-stream for real-time UX.
    Input validation and sanitization is handled by the LegalQuery Pydantic model.
    """

    logger.info(f"[Sync] Analyzing: {body.query[:80]}")

    sub_questions = await decompose_query(body.query)
    routed = route_questions(sub_questions)
    try:
        kanoon_context, _ = await build_kanoon_context(body.query, max_results=3)
    except Exception as e:
        logger.error("[Sync] Indian Kanoon fetch failed: %s", e)
        kanoon_context = ""
    results = await run_parallel_research(routed, kanoon_context=kanoon_context)
    synthesis = await synthesize_answers_structured(body.query, results)
    synthesized = synthesis.answer_markdown

    try:
        validation_results = validate_citations_from_text(synthesized)
        if validation_results:
            logger.info("[Sync] Citation validation results: %s", validation_results)
    except Exception as e:
        logger.warning("[Sync] Citation validation failed (non-blocking): %s", e)
        validation_results = []

    hinglish = await convert_to_hinglish(synthesized)

    return JSONResponse(
        {
            "query": body.query,
            "sub_questions": sub_questions,
            "research": results,
            "final_answer": {
                "markdown": synthesized,
                "hinglish": hinglish,
                "cited_laws": synthesis.cited_laws,
                "citation_validation": validation_results,
            },
        }
    )


# ─── Deep Research Pipeline ──────────────────────────────────────────────────

DEEP_RESEARCH_SYSTEM_PROMPT = """You are Nyay Saarthi, a specialized Indian Legal AI Assistant. 
Your SOLE purpose is to provide legal information, analysis, and guidance based on Indian Law (IPC, BNS, MVA, Constitution, etc.).

STRICT MANDATE:
- If the user query is NOT related to Indian Law, legal procedures, or the Indian justice system, you MUST politely refuse to answer.
- State: "I am a specialized Legal AI Assistant. I can only assist with queries related to Indian Law and legal procedures. Your question seems to be outside my legal domain."
- DO NOT answer questions about technology, science, general history, or other non-legal topics.
- Answer ONLY using the provided Indian Kanoon legal context below when possible.

CONTEXT FROM INDIAN KANOON:
{kanoon_context}

USER QUERY: {user_query}

If the topic is legal but not found in the context, use your internal legal knowledge but cite relevant sections and add a disclaimer.
Structure your response with:
1. Direct answer to the question
2. Relevant legal sections with exact numbers
3. Key case precedents cited (if any)
4. Practical steps for the citizen
5. Important caveats or disclaimers

Format in Markdown. Be precise and professional."""


@async_retry(max_attempts=3)
async def call_groq_with_retry(grounded_prompt, query):

    response = await groq_client.chat.completions.create(
        model=GROQ_MODEL_FAST,
        messages=[
            {"role": "system", "content": grounded_prompt},
            {"role": "user", "content": query},
        ],
        temperature=0.2,
        max_tokens=2048,
    )

    return response


async def deep_research_pipeline(query: str, language: str):
    """
    Async generator that yields SSE events through the 5-stage deep research pipeline.
    Each stage emits: stage update, avatar_speak, and relevant data events.
    """
    try:
        # ── Stage 1: UNDERSTANDING ────────────────────────────────
        # Sanitize query for prompt injection before sending to AI
        safe_query = sanitize_prompt_input(query)
        logger.info(
            f"[Deep Research] Stage 1: Understanding query: {safe_query[:60]}..."
        )

        domain = detect_domain(query)
        domain_label = domain.upper() if domain != "general" else "GENERAL LEGAL"

        yield sse_event(
            "stage",
            {
                "stage": "understanding",
                "status": "active",
                "domain": domain_label,
                "message": f"Analyzing your query — detected domain: {domain_label}",
            },
        )
        yield sse_event(
            "avatar_speak",
            {
                "message": "Aapka sawaal samajh aa gaya. Legal domain identify ho raha hai..."
            },
        )
        await asyncio.sleep(1)  # Brief pause for UX

        yield sse_event(
            "stage",
            {
                "stage": "understanding",
                "status": "complete",
                "domain": domain_label,
                "message": f"Domain identified: {domain_label}",
            },
        )

        # ── Stage 2: SEARCHING KANOON ─────────────────────────────
        logger.info("[Deep Research] Stage 2: Searching Indian Kanoon...")

        yield sse_event(
            "stage",
            {
                "stage": "searching",
                "status": "active",
                "message": "Searching Indian Kanoon database...",
            },
        )
        yield sse_event(
            "avatar_speak",
            {"message": "Indian Kanoon mein relevant cases dhundh raha hoon..."},
        )

        kanoon_context, kanoon_results = await build_kanoon_context(
            query, max_results=3
        )

        yield sse_event(
            "kanoon_results", {"results": kanoon_results[:2]}  # Send top 2 for display
        )
        yield sse_event(
            "stage",
            {
                "stage": "searching",
                "status": "complete",
                "message": f"Found {len(kanoon_results)} relevant judgments",
            },
        )

        # ── Stage 3: ROUTING ──────────────────────────────────────
        logger.info("[Deep Research] Stage 3: Routing...")

        # Compute complexity score for display
        from router import COMPLEX_KEYWORDS

        lower_q = query.lower()
        complex_score = sum(1 for kw in COMPLEX_KEYWORDS if kw in lower_q)
        word_count = len(query.split())

        # Normalized complexity 0-1
        complexity = min(1.0, (complex_score * 0.3 + word_count * 0.02))
        model_choice = "gemini" if complexity >= 0.5 else "groq"

        yield sse_event(
            "stage",
            {
                "stage": "routing",
                "status": "active",
                "complexity": round(complexity, 2),
                "model": model_choice,
                "message": f"Complexity score: {round(complexity, 2)} — sending to {'Gemini for deep analysis' if model_choice == 'gemini' else 'Groq for fast response'}",
            },
        )

        if complexity >= 0.5:
            yield sse_event(
                "avatar_speak",
                {
                    "message": "Yeh complex case hai, Gemini se deep analysis kar raha hoon..."
                },
            )
        else:
            yield sse_event(
                "avatar_speak",
                {"message": "Simple query hai, Groq se fast response le raha hoon..."},
            )

        await asyncio.sleep(0.5)
        yield sse_event(
            "stage",
            {
                "stage": "routing",
                "status": "complete",
                "complexity": round(complexity, 2),
                "model": model_choice,
                "message": f"Routed to {model_choice.upper()}",
            },
        )

        # ── Stage 4: REASONING ────────────────────────────────────
        logger.info("[Deep Research] Stage 4: Reasoning...")

        yield sse_event(
            "stage",
            {
                "stage": "reasoning",
                "status": "active",
                "message": "Legal reasoning in progress...",
            },
        )
        yield sse_event(
            "avatar_speak",
            {"message": "Legal reasoning chal rahi hai, thoda wait karein..."},
        )

        # Build grounded prompt with Kanoon context
        grounded_prompt = DEEP_RESEARCH_SYSTEM_PROMPT.format(
            kanoon_context=(
                kanoon_context
                if kanoon_context
                else "No specific Indian Kanoon judgments found for this query. If the query is legal in nature, provide general legal guidance based on Indian statutes. If the query is non-legal, follow the refusal mandate in your system prompt."
            ),
            user_query=query,
        )

        ai_answer = None
        cached = False

        if model_choice == "gemini" and gemini_client:
            cache_key = generate_cache_key(
                "gemini", grounded_prompt, GEMINI_MODEL, user_query=query
            )
            cached_response = get_cached_response(cache_key)
            if cached_response:
                logger.info("[Deep Research] Gemini cache hit")
                ai_answer = cached_response
                cached = True

        if not cached and (
            model_choice == "groq" or (model_choice == "gemini" and not gemini_client)
        ):
            cache_key = generate_cache_key(
                "groq", grounded_prompt, GROQ_MODEL_FAST, user_query=query
            )
            cached_response = get_cached_response(cache_key)
            if cached_response:
                logger.info("[Deep Research] Groq cache hit")
                ai_answer = cached_response
                cached = True

        if not cached:
            # Use the unified fallback coordinator for deep research to avoid
            # duplicating retry/fallback logic between Gemini and Groq.
            result = await execute_with_fallback(
                query, kanoon_context, primary_provider=model_choice
            )
            ai_answer = result.get("answer", "")
            model_choice = result.get("source", model_choice)

            if ai_answer:
                if model_choice == "gemini":
                    cache_key = generate_cache_key(
                        "gemini", grounded_prompt, GEMINI_MODEL, user_query=query
                    )
                    set_cached_response(cache_key, ai_answer)
                elif model_choice == "groq":
                    cache_key = generate_cache_key(
                        "groq", grounded_prompt, GROQ_MODEL_FAST, user_query=query
                    )
                    set_cached_response(cache_key, ai_answer)

        # Stream reasoning text in chunks for live display
        if ai_answer:
            words = ai_answer.split()
            chunk_size = 8
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i : i + chunk_size])
                yield sse_event("reasoning", {"text": chunk})
                await asyncio.sleep(0.1)  # Small delay for streaming effect

        yield sse_event(
            "stage",
            {
                "stage": "reasoning",
                "status": "complete",
                "message": "Legal analysis complete",
            },
        )

        # ── Stage 5: VERDICT ──────────────────────────────────────
        logger.info("[Deep Research] Stage 5: Verdict...")

        yield sse_event(
            "stage",
            {
                "stage": "verdict",
                "status": "active",
                "message": "Preparing final legal conclusion...",
            },
        )

        # Validate citations in AI response
        citation_validation = (
            validate_citations_from_text(ai_answer) if ai_answer else []
        )
        if citation_validation:
            logger.info("[Deep Research] Citation validation: %s", citation_validation)

        # Convert to Hinglish for avatar speech
        hinglish_verdict = await convert_to_hinglish(
            ai_answer or "Analysis could not be completed."
        )

        # Build citations
        citations = []
        for r in kanoon_results:
            citations.append({"title": r["title"], "doc_id": r["doc_id"]})

        yield sse_event(
            "avatar_speak", {"message": f"Analysis complete. {hinglish_verdict}"}
        )

        yield sse_event(
            "final",
            {
                "answer": ai_answer or "Unable to generate analysis.",
                "hinglish": hinglish_verdict,
                "citations": citations,
                "citation_validation": citation_validation,
                "model_used": model_choice,
                "domain": domain_label,
            },
        )

        yield sse_event(
            "stage",
            {
                "stage": "verdict",
                "status": "complete",
                "message": "Deep research complete",
            },
        )

        yield sse_event("done", {"message": "Deep research complete"})
        logger.info("[Deep Research] Pipeline complete ✓")

    except (GeneratorExit, asyncio.CancelledError):
        logger.info("[Deep Research] Client disconnected")
        raise

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
    # Input validation and sanitization is handled by the LegalQuery Pydantic model.
    logger.info(f"[Deep Research] New query: {body.query[:80]}")

    async def event_generator():
        pipeline = deep_research_pipeline(body.query, body.language)

        try:
            async for event in pipeline:
                if await request.is_disconnected():
                    logger.info("[Deep Research] Client disconnected")
                    break
                yield {"data": event}
        finally:
            await pipeline.aclose()

    return EventSourceResponse(event_generator())


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
