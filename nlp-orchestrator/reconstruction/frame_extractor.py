import cv2
import os

print("Program started")

def extract_frames(video_path, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        print("Error opening video")
        return

    fps = video.get(cv2.CAP_PROP_FPS)

    print(f"Video FPS: {fps}")

    count = 0

    while True:

        success, frame = video.read()

        if not success:
            break

        frame_path = os.path.join(
            output_folder,
            f"frame_{count}.jpg"
        )

        cv2.imwrite(frame_path, frame)

        count += 1

    video.release()

    print(f"Extracted {count} frames successfully")


extract_frames(
    "sample.mp4",
    "output_frames"
)