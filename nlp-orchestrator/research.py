"""
Layer 3: Parallel Research Engine
Sends all sub-questions to their assigned models simultaneously using
asyncio.gather().

  * Groq LPU for simple/factual questions
  * Gemini for complex reasoning/precedent questions

Merged: circuit-breaker + retry + structured-fallback architecture
plus the GROUND_RESEARCH toggle and stricter grounded-prompt wording from
this PR.

Architecture:
  * main.py fetches Kanoon context ONCE per user query (in parallel with
    sub-question decomposition) and passes it here via `kanoon_context`.
    This avoids N round-trips to Kanoon for N sub-questions.
  * Each sub-question gets the same shared context. Decomposed sub-questions
    are closely related, so this is fine in practice.
  * `GROUND_RESEARCH=false` in .env forces ungrounded mode regardless of
    what main.py passes — useful for measuring the lift from grounding.
  * Per-LLM circuit breakers (Groq + Gemini independently) plus a Gemini→
    Groq cascade on failure means we degrade rather than fail.
"""

import asyncio
import logging

from google import genai
from groq import AsyncGroq

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL_FAST,
    GROUND_RESEARCH,
)
from utils import CircuitBreaker, retry_transient

logger = logging.getLogger(__name__)

# Initialize clients
groq_client = AsyncGroq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Module-level circuit breakers for persistent state across requests.
groq_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)
gemini_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)


# ─── Prompts ──────────────────────────────────────────────────────────────────

LEGAL_SYSTEM_PROMPT = """You are an expert Indian legal advisor with deep knowledge of:
- Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS) 2023
- Code of Criminal Procedure (CrPC) and Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Code of Civil Procedure (CPC)
- Motor Vehicles Act (MVA)
- Indian Constitution including Fundamental Rights
- Consumer Protection Act
- Right to Information Act (RTI)

Provide precise, accurate, legally grounded answers. Quote specific section numbers where relevant.
Keep your answer focused, factual, and written for a common Indian citizen.
"""

# Tightened from the original: explicit primacy of the context, explicit
# instruction to admit gaps rather than silently fall back to training data.
# This is the single biggest hallucination guardrail we have at the prompt
# level — when the retrieval finds the right passage, the model quotes it;
# when retrieval misses, the model is supposed to say so out loud.
KANOON_CONTEXT_PROMPT = """Use the INDIAN KANOON CONTEXT below as your primary source.

- If the answer is fully covered there, quote the exact section number, article, or judgment.
- If the context is partial or missing, you may fall back to your training knowledge, but you
  MUST state plainly: "the retrieved context does not cover this directly..." before doing so.
- Never silently invent section numbers, case names, or holdings not present in the context.
"""


def _build_user_prompt(question: str, kanoon_context: str | None) -> str:
    """Compose the user-facing prompt with optional retrieved context."""
    if not kanoon_context:
        return question

    return (
        f"{question}\n\n"
        "INDIAN KANOON CONTEXT:\n"
        f"{kanoon_context}\n\n"
        "If the answer is not present in the context, say you cannot verify it."
    )


def _fallback_response(question: str, source: str) -> dict:
    """Structured fallback when all retries are exhausted or the circuit is open."""
    return {
        "question": question,
        "answer": "Our legal research service is temporarily unavailable. Please try again shortly.",
        "source": source,
        "grounded": False,
        "error": "circuit_open",
        "is_fallback": True,
    }


# ─── Decorated LLM calls (retry layer) ────────────────────────────────────────


@retry_transient
async def _call_groq_with_retry(
    question: str,
    kanoon_context: str | None = None,
) -> dict:
    """Groq LPU call wrapped with tenacity-based retry."""
    user_prompt = _build_user_prompt(question, kanoon_context)
    response = await groq_client.chat.completions.create(
        model=GROQ_MODEL_FAST,
        messages=[
            {"role": "system",
             "content": f"{LEGAL_SYSTEM_PROMPT}\n\n{KANOON_CONTEXT_PROMPT}"},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=800,
    )
    return {
        "question": question,
        "answer": response.choices[0].message.content.strip(),
        "source": "groq",
        "grounded": bool(kanoon_context),
        "error": None,
    }


@retry_transient
async def _call_gemini_with_retry(
    question: str,
    kanoon_context: str | None = None,
) -> dict:
    """Gemini call wrapped with tenacity-based retry."""
    user_prompt = _build_user_prompt(question, kanoon_context)
    full_prompt = (
        f"{LEGAL_SYSTEM_PROMPT}\n\n"
        f"{KANOON_CONTEXT_PROMPT}\n\n"
        f"Question: {user_prompt}"
    )
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=full_prompt,
            config={"temperature": 0.2, "max_output_tokens": 800},
        ),
    )
    return {
        "question": question,
        "answer": (response.text or "").strip(),
        "source": "gemini",
        "grounded": bool(kanoon_context),
        "error": None,
    }


# ─── Public LLM entry points (circuit-breaker layer) ──────────────────────────


def _enforce_ground_flag(kanoon_context: str | None) -> str | None:
    """Strip context if GROUND_RESEARCH=false, so we can A/B test grounding."""
    if not GROUND_RESEARCH:
        return None
    return kanoon_context


async def call_groq_async(
    question: str,
    kanoon_context: str | None = None,
) -> dict:
    """Call Groq with circuit breaker + retry + ground-flag enforcement."""
    kanoon_context = _enforce_ground_flag(kanoon_context)

    if not groq_breaker.is_available():
        logger.warning("[CircuitBreaker/Groq] OPEN — fast-failing")
        return _fallback_response(question, "groq")

    try:
        result = await _call_groq_with_retry(question, kanoon_context)
        groq_breaker.call_succeeded()
        return result
    except Exception as e:
        groq_breaker.call_failed()
        logger.error(f"[Research/Groq] failed after retries: {type(e).__name__}: {e}")
        return _fallback_response(question, "groq")


async def call_gemini_async(
    question: str,
    kanoon_context: str | None = None,
) -> dict:
    """Call Gemini with circuit breaker + retry. Falls back to Groq on failure."""
    kanoon_context = _enforce_ground_flag(kanoon_context)

    if not gemini_client:
        return await call_groq_async(question, kanoon_context)
    if not gemini_breaker.is_available():
        logger.warning("[CircuitBreaker/Gemini] OPEN — falling back to Groq")
        return await call_groq_async(question, kanoon_context)

    try:
        result = await _call_gemini_with_retry(question, kanoon_context)
        gemini_breaker.call_succeeded()
        return result
    except Exception as e:
        gemini_breaker.call_failed()
        logger.error(f"[Research/Gemini] failed after retries: {type(e).__name__}: {e}")
        return await call_groq_async(question, kanoon_context)


# ─── Parallel orchestration ───────────────────────────────────────────────────


async def run_parallel_research(
    routed_questions: list[dict],
    kanoon_context: str | None = None,
) -> list[dict]:
    """
    Run all sub-questions in parallel using asyncio.gather().

    `kanoon_context` is the retrieved-and-reranked context for the original
    user query (typically built once in main.py via build_kanoon_context()
    in parallel with the decomposer). It's shared across all sub-questions
    in this run.

    Returns results in the same order as the input list.
    """
    tasks = []
    for item in routed_questions:
        question = item["question"]
        model = item["model"]

        if model == "gemini":
            tasks.append(call_gemini_async(question, kanoon_context))
        else:
            tasks.append(call_groq_async(question, kanoon_context))

    results = await asyncio.gather(*tasks, return_exceptions=False)
    return list(results)