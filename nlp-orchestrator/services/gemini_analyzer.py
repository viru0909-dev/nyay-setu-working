from google import genai
import asyncio
from config import GEMINI_API_KEY, GEMINI_MODEL
import logging

logger = logging.getLogger("gemini-analyzer")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

TIMELINE_RECONSTRUCTION_PROMPT = """SYSTEM: You are a forensic accident analyst for Indian courts.
You have expertise in IPC 279, 304A, 337, 338, Motor Vehicles Act 1988, and BNS 2023.

USER: Analyze this accident video frame by frame.

For every critical moment identify:
TIMESTAMP | EVENT | VEHICLE | BEHAVIOR | LEGAL FLAG

Label each moment:
PRE_INCIDENT / WARNING / TRIGGER / IMPACT / POST_IMPACT

The TRIGGER moment is the most important — identify exactly who did what at what second that caused the accident.

End with LIABILITY VERDICT:
- Primary fault: Vehicle X because [reason]
- Evidence strength: Strong/Moderate/Weak
- Recommended legal action for the citizen
"""

async def analyze_frames(frame_paths: list[str], job_id: str) -> str:
    """
    Upload frames to Gemini and request forensic timeline analysis.
    Responses are cached in Redis by a key derived from the frame file paths,
    so re-analysis of the same video job is served instantly from cache.
    """
    if not client:
        logger.error("Gemini API key not found. Returning fallback analysis.")
        return "FALLBACK: Gemini API key not configured. Video frame analysis skipped."

    # ── Cache check (keyed by sorted frame paths as a proxy for video identity) ──
    cache_key = None
    try:
        from cache import generate_cache_key, get_cached_response, set_cached_response
        frames_fingerprint = "|".join(sorted(frame_paths))
        cache_key = generate_cache_key("gemini_frames", frames_fingerprint, GEMINI_MODEL)
        cached = get_cached_response(cache_key)
        if cached is not None:
            logger.info(f"[{job_id}] Frame analysis cache HIT — skipping Gemini API call")
            return cached
    except Exception as e:
        logger.warning(f"[{job_id}] Cache read failed (non-blocking): {e}")
        cache_key = None

    # ── Gemini API call ───────────────────────────────────────────────────────
    try:
        from PIL import Image
        images = []
        for path in frame_paths:
            try:
                images.append(Image.open(path))
            except Exception as e:
                logger.error(f"Error loading frame {path}: {e}")

        if not images:
            return "No valid frames extracted from the video."

        contents = [TIMELINE_RECONSTRUCTION_PROMPT] + images

        logger.info(f"[{job_id}] Sending {len(images)} frames to Gemini for analysis...")

        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents
            )
        )

        analysis = response.text.strip()
        logger.info(f"[{job_id}] Received analysis from Gemini.")

        # ── Cache store ───────────────────────────────────────────────────────
        try:
            if cache_key and analysis:
                set_cached_response(cache_key, analysis)
        except Exception as e:
            logger.warning(f"[{job_id}] Cache write failed (non-blocking): {e}")

        return analysis

    except Exception as e:
        logger.error(f"[{job_id}] Error in Gemini analysis: {e}")
        return f"Error analyzing video frames: {str(e)}"
