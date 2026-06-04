import cv2
import os
import aiohttp
import asyncio
import socket
import ipaddress
from urllib.parse import urlparse
from typing import List

UPLOAD_DIR = "/tmp/nyaysetu_forensics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_safe_url(url: str) -> bool:
    """
    Validates if a URL is safe to download from (SSRF mitigation).
    Ensures scheme is http/https and resolved IP is not loopback, private, link-local, or unspecified.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Resolve hostname to all associated IP addresses
        addr_info = socket.getaddrinfo(hostname, None)
        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            
            # Check for loopback, private networks, link-local, unspecified, or multicast addresses
            if (ip.is_loopback or 
                ip.is_private or 
                ip.is_link_local or 
                ip.is_unspecified or 
                ip.is_multicast):
                return False
                
        return True
    except Exception:
        return False

async def download_video(url: str, job_id: str) -> str:
    """Download video from URL (which will be a MinIO/Spring Boot endpoint) to a local temp file."""
    # If the URL is already a local path (for testing), just return it
    if url.startswith("/") and os.path.exists(url):
        return url
        
    # Apply SSRF validation check
    if not is_safe_url(url):
        raise ValueError(f"SSRF validation failed: URL '{url}' resolves to a restricted or unsafe IP address.")

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

    loop = asyncio.get_running_loop()
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
