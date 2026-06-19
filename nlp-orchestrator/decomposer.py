import json
import logging
from config import GROQ_API_KEY, GROQ_MODEL_FAST
from groq import AsyncGroq

# Initialize logger for better debugging
logger = logging.getLogger("nlp-orchestrator")
client = AsyncGroq(api_key=GROQ_API_KEY)

DECOMPOSE_PROMPT = """You are a senior Indian legal expert. A citizen asked a question.
Your task is to break this down into 3 to 5 specific focused sub-questions that together 
fully cover the original question. Each sub-question should be answerable independently.

Focus ONLY on Indian law: IPC, BNS, CPC, MVA, Constitution, etc.

STRICT DOMAIN GUARDRAIL:
- If the user's question is NOT related to Indian Law, legal procedures, or the Indian 
justice system, return an empty JSON array [].

Return ONLY a valid JSON array of strings. No explanation. No markdown.
Example: ["What does Section 304A IPC say?", "What is the penalty for negligence?"]

User's question: {query}
"""

async def decompose_query(query: str) -> list[str]:
    """Decompose a complex legal query into focused sub-questions."""
    try:
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {"role": "user", "content": DECOMPOSE_PROMPT.format(query=query)}
            ],
            temperature=0.3,
            max_tokens=512,
        )

        raw_output = response.choices[0].message.content.strip()
        
        # Robustness: Clean up markdown code blocks if the AI includes them
        if raw_output.startswith("```json"):
            raw_output = raw_output.replace("```json", "").replace("```", "").strip()

        sub_questions = json.loads(raw_output)

        if isinstance(sub_questions, list) and all(isinstance(q, str) for q in sub_questions):
            # Enforce the 5-question cap as requested by the maintainer
            return sub_questions[:5]
        
        logger.warning("[Decomposer] Received non-list format: %s", raw_output)
        return [query]

    except (json.JSONDecodeError, ValueError) as e:
        logger.error("[Decomposer] JSON error: %s", e)
        return [query]
    except Exception as e:
        logger.error("[Decomposer] Fatal error: %s", e)
        return [query]