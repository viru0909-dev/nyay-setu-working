import cv2
import os
import aiohttp
import asyncio
from typing import List

UPLOAD_DIR = "/tmp/nyaysetu_forensics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def download_video(url: str, job_id: str) -> str:
    """Download video from URL (which will be a MinIO/Spring Boot endpoint) to a local temp file."""
    # If the URL is already a local path (for testing), just return it
    if url.startswith("/") and os.path.exists(url):
        return url
        
    local_path = os.path.join(UPLOAD_DIR, f"{job_id}_video.mp4")
    
    # Simple check if already downloaded
    if os.path.exists(local_path):
        return local_path

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                with open(local_path, 'wb') as f:
                    while True:
                        chunk = await response.content.read(1024 * 1024)
                        if not chunk:
                            break
                        f.write(chunk)
                return local_path
            else:
                raise Exception(f"Failed to download video from {url}: {response.status}")

async def extract_frames(video_path: str, job_id: str, frame_interval: int = 30) -> List[str]:
    """
    Extract frames from video (e.g. 1 frame every 30 frames / 1 sec).
    Returns list of paths to the extracted JPEG frames.
    """
    output_dir = os.path.join(UPLOAD_DIR, f"{job_id}_frames")
    os.makedirs(output_dir, exist_ok=True)
    
    extracted_frames = []
    
    # Run OpenCV extraction in a thread to not block asyncio pool
    def _extract():
        cap = cv2.VideoCapture(video_path)
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        if fps == 0:
            fps = 30 # default assumed
            
        # extract 1 frame per second
        interval = fps 
        
        count = 0
        success, image = cap.read()
        while success:
            if count % interval == 0:
                # Save frame
                frame_name = f"frame_{count}.jpg"
                frame_path = os.path.join(output_dir, frame_name)
                
                # Resize to save token/storage space before sending to AI
                resized = cv2.resize(image, (640, 360))
                cv2.imwrite(frame_path, resized)
                extracted_frames.append(frame_path)
                
                # Cap at 50 frames to avoid blowing up the context window
                if len(extracted_frames) >= 50:
                    break
                    
            success, image = cap.read()
            count += 1
            
        cap.release()
        return extracted_frames

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _extract)

def cleanup_job(job_id: str):
    """Delete the downloaded video and frames after analysis to comply with DPDP Act 2023."""
    import shutil
    video_path = os.path.join(UPLOAD_DIR, f"{job_id}_video.mp4")
    frames_dir = os.path.join(UPLOAD_DIR, f"{job_id}_frames")
    
    if os.path.exists(video_path):
        os.remove(video_path)
    if os.path.exists(frames_dir):
        shutil.rmtree(frames_dir)
