"""
Layer 3: Parallel Research Engine
Sends all sub-questions to their assigned models simultaneously using asyncio.gather().
- Groq LPU for simple/factual questions
- Gemini for complex reasoning/precedent questions
"""

import asyncio
from google import genai
from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_MODEL_FAST, GEMINI_API_KEY, GEMINI_MODEL

# Initialize clients
groq_client = AsyncGroq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

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

KANOON_CONTEXT_PROMPT = """Use the Indian Kanoon context when it is relevant.
If a specific section or judgment is not present in the context, clearly say you cannot verify it.
"""


def _build_user_prompt(question: str, kanoon_context: str | None) -> str:
    if not kanoon_context:
        return question

    return (
        f"{question}\n\n"
        "INDIAN KANOON CONTEXT:\n"
        f"{kanoon_context}\n\n"
        "If the answer is not present in the context, say you cannot verify it."
    )


async def call_groq_async(question: str, kanoon_context: str | None = None) -> dict:
    """Call Groq LPU with a legal sub-question."""
    try:
        user_prompt = _build_user_prompt(question, kanoon_context)
        response = await groq_client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {"role": "system", "content": f"{LEGAL_SYSTEM_PROMPT}\n\n{KANOON_CONTEXT_PROMPT}"},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=800
        )
        answer = response.choices[0].message.content.strip()
        return {
            "question": question,
            "answer": answer,
            "source": "groq",
            "cached": False,
            "error": None
        }
    except Exception as e:
        print(f"[Research/Groq] Error: {e}")
        return {"question": question, "answer": "", "source": "groq", "error": str(e)}


async def call_gemini_async(question: str, kanoon_context: str | None = None) -> dict:
    """Call Gemini with a complex legal sub-question via asyncio."""
    if not gemini_client:
        # Fallback to Groq if Gemini key not set
        return await call_groq_async(question, kanoon_context)
    try:
        user_prompt = _build_user_prompt(question, kanoon_context)
        full_prompt = (
            f"{LEGAL_SYSTEM_PROMPT}\n\n"
            f"{KANOON_CONTEXT_PROMPT}\n\n"
            f"Question: {user_prompt}"
        )
        # Run synchronous Gemini call in executor to not block event loop
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=full_prompt
            )
        )
        answer = response.text.strip()
        return {
            "question": question,
            "answer": answer,
            "source": "gemini",
            "cached": False,
            "error": None
        }
    except Exception as e:
        print(f"[Research/Gemini] Error: {e}")
        # Fallback to Groq on Gemini failure
        return await call_groq_async(question, kanoon_context)


async def run_parallel_research(
    routed_questions: list[dict],
    kanoon_context: str | None = None
) -> list[dict]:
    """
    Run all sub-questions in parallel using asyncio.gather().
    Returns results in the same order as input.
    """
    tasks = []
    for item in routed_questions:
        question = item["question"]
        model = item["model"]

        if model == "gemini":
            tasks.append(call_gemini_async(question, kanoon_context))
        else:
            tasks.append(call_groq_async(question, kanoon_context))

    # All tasks fire simultaneously
    results = await asyncio.gather(*tasks, return_exceptions=False)
    return list(results)
