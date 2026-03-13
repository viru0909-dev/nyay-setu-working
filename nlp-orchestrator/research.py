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


async def call_groq_async(question: str) -> dict:
    """Call Groq LPU with a legal sub-question."""
    try:
        response = await groq_client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {"role": "system", "content": LEGAL_SYSTEM_PROMPT},
                {"role": "user", "content": question}
            ],
            temperature=0.2,
            max_tokens=800
        )
        answer = response.choices[0].message.content.strip()
        return {"question": question, "answer": answer, "source": "groq", "error": None}
    except Exception as e:
        print(f"[Research/Groq] Error: {e}")
        return {"question": question, "answer": "", "source": "groq", "error": str(e)}


async def call_gemini_async(question: str) -> dict:
    """Call Gemini with a complex legal sub-question via asyncio."""
    if not gemini_client:
        # Fallback to Groq if Gemini key not set
        return await call_groq_async(question)
    try:
        full_prompt = f"{LEGAL_SYSTEM_PROMPT}\n\nQuestion: {question}"
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
        return {"question": question, "answer": answer, "source": "gemini", "error": None}
    except Exception as e:
        print(f"[Research/Gemini] Error: {e}")
        # Fallback to Groq on Gemini failure
        return await call_groq_async(question)


async def run_parallel_research(routed_questions: list[dict]) -> list[dict]:
    """
    Run all sub-questions in parallel using asyncio.gather().
    Returns results in the same order as input.
    """
    tasks = []
    for item in routed_questions:
        question = item["question"]
        model = item["model"]

        if model == "gemini":
            tasks.append(call_gemini_async(question))
        else:
            tasks.append(call_groq_async(question))

    # All tasks fire simultaneously
    results = await asyncio.gather(*tasks, return_exceptions=False)
    return list(results)
