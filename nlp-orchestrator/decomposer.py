"""
Layer 1: Query Decomposer
Breaks a complex legal question into 3-5 focused sub-questions using Groq LPU.
"""

import json
from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_MODEL_FAST

client = AsyncGroq(api_key=GROQ_API_KEY)

DECOMPOSE_PROMPT = """You are a senior Indian legal expert. A citizen asked a legal question.
Your task is to break this down into 3 to 5 specific focused sub-questions that together 
fully cover the original question. Each sub-question should be answerable independently.

Focus on Indian law: IPC, BNS, CPC, MVA, Constitution, etc.

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
                {
                    "role": "user",
                    "content": DECOMPOSE_PROMPT.format(query=query)
                }
            ],
            temperature=0.3,
            max_tokens=512
        )
        
        raw_output = response.choices[0].message.content.strip()
        
        # Try to parse JSON
        sub_questions = json.loads(raw_output)
        
        # Ensure it is a list of strings
        if isinstance(sub_questions, list) and all(isinstance(q, str) for q in sub_questions):
            return sub_questions[:5]  # cap at 5
        else:
            raise ValueError("Unexpected format from decomposer")
    
    except (json.JSONDecodeError, ValueError):
        # Fallback: return original query as a single item
        return [query]
    
    except Exception as e:
        print(f"[Decomposer] Error: {e}")
        return [query]
