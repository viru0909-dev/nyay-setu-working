import cv2
import json
import os

video_path = r"input_videos\Sample.mp4"

print("Trying to open:", video_path)

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error opening video")
    exit()

fps = cap.get(cv2.CAP_PROP_FPS)

frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))

height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

duration = frame_count / fps

metadata = {
    "video_name": "Sample.mp4",
    "fps": fps,
    "total_frames": frame_count,
    "resolution": [width, height],
    "duration_seconds": duration
}

os.makedirs("metadata_output", exist_ok=True)

with open("metadata_output/metadata.json", "w") as file:
    json.dump(metadata, file, indent=4)

print("Metadata generated successfully")