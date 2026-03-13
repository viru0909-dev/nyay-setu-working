from fastapi import APIRouter, Request, HTTPException
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import logging

from models.schemas import ForensicsRequest
from services.video_processor import download_video, extract_frames, cleanup_job
from services.gemini_analyzer import analyze_frames
from services.groq_router import legal_section_lookup
from services.report_generator import generate_report, generate_avatar_script

logger = logging.getLogger("forensics-router")
router = APIRouter(prefix="/forensics", tags=["Forensics"])

def sse_event(event_type: str, data: dict) -> str:
    """Helper to format JSON SSE events for the forensics stream."""
    return json.dumps({"type": event_type, **data})

async def forensic_analysis_pipeline(request_data: ForensicsRequest):
    """
    Async generator that yields SSE events for the 5 stages of the Accident Forensic Pipeline.
    """
    job_id = request_data.jobId
    video_urls = request_data.videoUrls
    citizen_desc = request_data.citizenDescription
    
    if not video_urls:
        yield sse_event("error", {"jobId": job_id, "message": "No video URLs provided."})
        return
        
    try:
        # Stage 1: Upload / Download locally
        yield sse_event("status", {"jobId": job_id, "stage": "UPLOAD_COMPLETE", "message": "Video mil gayi. Main abhi frame by frame dekh raha hoon."})
        
        logger.info(f"[{job_id}] Downloading video {video_urls[0]}...")
        local_video_path = await download_video(video_urls[0], job_id)
        
        # Stage 2: Extract Frames (OpenCV)
        yield sse_event("status", {"jobId": job_id, "stage": "EXTRACTING_FRAMES", "message": "Har second ka analysis ho raha hai. Thoda wait karein."})
        
        logger.info(f"[{job_id}] Extracting frames from {local_video_path}...")
        frames = await extract_frames(local_video_path, job_id, frame_interval=30)
        
        if not frames:
            yield sse_event("error", {"jobId": job_id, "message": "Could not extract any frames from the video."})
            return
            
        # Stage 3 & 4: AI Analysis (Parallel)
        yield sse_event("status", {"jobId": job_id, "stage": "AI_ANALYSIS", "message": "Gemini AI accident ki timeline reconstruct kar rahi hai. Yeh deep analysis hai, thoda time lagega."})
        
        # Fire both Gemini (video frames) and Groq (legal lookup) simultaneously
        gemini_task = asyncio.create_task(analyze_frames(frames, job_id))
        groq_task = asyncio.create_task(legal_section_lookup(citizen_desc, job_id))
        
        # Yield an interim message while waiting for the heavy AI to finish
        await asyncio.sleep(4)
        if not (gemini_task.done() and groq_task.done()):
            yield sse_event("status", {"jobId": job_id, "stage": "AI_ANALYSIS", "message": "IPC aur Motor Vehicles Act check ho raha hai aapke case ke liye. Kaunse sections apply honge yeh pata chal raha hai."})
            
        # Wait for both tasks to complete
        results = await asyncio.gather(gemini_task, groq_task)
        gemini_timeline = results[0]
        groq_legal = results[1]
        
        # Provide real-time partial timeline result to UI immediately
        yield sse_event("partial_result", {"jobId": job_id, "timeline": gemini_timeline, "legal": groq_legal})
        
        # Stage 5: Synthesis and Report Generation
        report = generate_report(job_id, gemini_timeline, groq_legal)
        avatar_script = generate_avatar_script(job_id, groq_legal)
        
        yield sse_event("status", {"jobId": job_id, "stage": "REPORT_READY", "message": avatar_script})
        
        # Final Payload
        yield sse_event("complete", {"jobId": job_id, "report": report})
        logger.info(f"[{job_id}] Forensics pipeline complete.")
        
    except Exception as e:
        logger.error(f"[{job_id}] Fatal error: {e}")
        yield sse_event("error", {"jobId": job_id, "message": str(e)})
    finally:
        # Cleanup to satisfy DPDP Act 2023 constraints (Privacy)
        try:
            cleanup_job(job_id)
            logger.info(f"[{job_id}] Cleaned up local video and frames.")
        except Exception as cleanup_err:
            logger.error(f"[{job_id}] Cleanup failed: {cleanup_err}")

@router.post("/analyze-stream")
async def analyze_forensics_stream(request_data: ForensicsRequest, request: Request):
    """SSE endpoint for streaming the 5-stage accident forensic analysis."""
    
    async def event_generator():
        async for event in forensic_analysis_pipeline(request_data):
            if await request.is_disconnected():
                logger.info(f"[{request_data.jobId}] Client disconnected during forensics stream.")
                break
            # sse-starlette format: yield {'data': <string>}
            yield {"data": event}
            
    return EventSourceResponse(event_generator())
