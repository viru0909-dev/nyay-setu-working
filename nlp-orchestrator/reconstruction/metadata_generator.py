import cv2
import json

def generate_metadata(video_path, output_json, camera_id):

    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        print("Error opening video")
        return

    fps = video.get(cv2.CAP_PROP_FPS)

    metadata = []

    frame_id = 0

    while True:

        success, frame = video.read()

        if not success:
            break

        timestamp = frame_id / fps

        metadata.append({
            "frame": f"frame_{frame_id}.jpg",
            "timestamp": round(timestamp, 3),
            "camera_id": camera_id
        })

        frame_id += 1

    video.release()

    with open(output_json, "w") as f:
        json.dump(metadata, f, indent=4)

    print(f"Generated metadata for {frame_id} frames")


generate_metadata(
    "../input_videos/sample.mp4",
    "metadata.json",
    "cam_1"
)