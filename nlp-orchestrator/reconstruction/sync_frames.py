import os
import json

cam1_path = r"reconstruction\output_frames\cam1"
cam2_path = r"reconstruction\output_frames\cam2"

cam1_frames = sorted(os.listdir(cam1_path))
cam2_frames = sorted(os.listdir(cam2_path))

aligned_frames = {}

min_frames = min(len(cam1_frames), len(cam2_frames))

for i in range(min_frames):

    aligned_frames[i] = {"cam1": cam1_frames[i], "cam2": cam2_frames[i]}

with open(r"reconstruction\aligned_frames.json", "w") as file:
    json.dump(aligned_frames, file, indent=4)

print("Frame synchronization completed")
import json


def synchronize_frames(metadata_file):

    with open(metadata_file, "r") as f:
        metadata = json.load(f)

    synced_frames = []

    for item in metadata:

        synced_frames.append(
            {
                "frame": item["frame"],
                "timestamp": item["timestamp"],
                "camera_id": item["camera_id"],
            }
        )

    print(f"Synchronized {len(synced_frames)} frames")

    return synced_frames


synchronize_frames("metadata.json")
