from groq import AsyncGroq
import logging
from config import GROQ_API_KEY, GROQ_MODEL_FAST
from cache import generate_cache_key, get_cached_response, set_cached_response

logger = logging.getLogger("groq-router")
client = AsyncGroq(api_key=GROQ_API_KEY)

LEGAL_LOOKUP_PROMPT = """SYSTEM: You are an expert Indian collision and motor vehicle law advisor.

USER: Based on this accident description: {timeline_summary}

Identify all applicable Indian law sections:
- IPC sections (e.g., 279, 304A, 337, 338)
- Motor Vehicles Act 1988 provisions
- BNS 2023 equivalent sections
- Compensation claim eligibility under MV Act Section 166 (MACT)

For each section explain in 1 plain-language sentence what it means for this citizen's case.
Keep the output highly structured and formatted in Markdown. Do not hallucinate laws.
"""

async def legal_section_lookup(citizen_description: str, job_id: str) -> str:
    """Extract applicable legal sections based on the citizen's description of the event."""
    if not citizen_description:
        return "No description provided by the citizen to lookup specific legal sections."
        
    try:
        prompt = LEGAL_LOOKUP_PROMPT.format(timeline_summary=citizen_description)
        
        # Generate cache key
        cache_key = generate_cache_key("groq", prompt, GROQ_MODEL_FAST)

        # Check cache first
        cached_response = get_cached_response(cache_key)
        if cached_response:
            logger.info(f"[{job_id}] Cache HIT for legal section lookup")
            return cached_response

        logger.info(f"[{job_id}] Sending legal lookup to Groq based on description...")
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=1024
        )
        
        result = response.choices[0].message.content.strip()

        # Cache the response
        set_cached_response(cache_key, result)

        logger.info(f"[{job_id}] Received legal sections from Groq.")
        return result
        
    except Exception as e:
        logger.error(f"[{job_id}] Error in Groq legal lookup: {e}")
        return f"Error retrieving legal sections: {str(e)}"
