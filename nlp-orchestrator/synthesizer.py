"""
Layer 4: Answer Synthesizer
Combines all sub-answers into one structured, clean final legal answer.
Includes relevant IPC / BNS / MVA section references.
"""

from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_MODEL_FAST

client = AsyncGroq(api_key=GROQ_API_KEY)

SYNTHESIS_PROMPT = """You are a senior Indian legal expert writing a final comprehensive legal opinion.

You have received research results from multiple focused legal sub-queries. 
Synthesize these into a single, clear, well-structured answer for an Indian citizen.

Research Results:
{research_results}

Original User Question: {original_query}

Your synthesis must:
1. Start with a clear, direct answer to the main question (2-3 sentences)
2. Provide key legal provisions with exact section numbers (IPC/BNS/CPC/MVA as applicable)
3. Outline practical steps the user can take
4. Mention any important deadlines or limitations
5. Include a brief disclaimer that this is AI-generated legal information and a lawyer should be consulted for specific cases

Format your response in clear markdown with headers (##) and bullet points (-) where appropriate.
Write in simple, accessible English. Avoid heavy legal jargon.
"""


def format_research_for_synthesis(research_results: list[dict]) -> str:
    """Format the research results into a readable block for the synthesis prompt."""
    formatted = []
    for i, result in enumerate(research_results, 1):
        if result.get("answer"):
            formatted.append(
                f"Sub-Question {i}: {result['question']}\n"
                f"Source: {result['source'].upper()}\n"
                f"Answer: {result['answer']}\n"
            )
    return "\n---\n".join(formatted)


async def synthesize_answers(
    original_query: str,
    research_results: list[dict]
) -> str:
    """
    Synthesize multiple sub-answers into one final structured legal response.
    Returns: Markdown-formatted string.
    """
    try:
        formatted_research = format_research_for_synthesis(research_results)
        
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {
                    "role": "user",
                    "content": SYNTHESIS_PROMPT.format(
                        research_results=formatted_research,
                        original_query=original_query
                    )
                }
            ],
            temperature=0.3,
            max_tokens=2048
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"[Synthesizer] Error: {e}")
        # Fallback: concatenate all answers
        parts = [f"**{r['question']}**\n{r['answer']}" for r in research_results if r.get("answer")]
        return "\n\n".join(parts)
