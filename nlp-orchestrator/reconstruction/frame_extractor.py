import cv2
import os

video_path = r"input_videos\Sample2.mp4"
output_folder = r"reconstruction\output_frames\cam2"

os.makedirs(output_folder, exist_ok=True)

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error opening video")
    exit()

fps = cap.get(cv2.CAP_PROP_FPS)

frame_number = 0

while True:

    success, frame = cap.read()

    if not success:
        break

    timestamp = frame_number / fps

    frame_filename = os.path.join(
        output_folder,
        f"frame_{frame_number:04d}.jpg"
    )

    cv2.imwrite(frame_filename, frame)

    print(f"Saved frame at {timestamp:.2f} sec")

    frame_number += 1

cap.release()

print("Frame extraction completed")
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
