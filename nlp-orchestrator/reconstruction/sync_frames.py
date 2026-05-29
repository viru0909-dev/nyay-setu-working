import json

def synchronize_frames(metadata_file):

    with open(metadata_file, "r") as f:
        metadata = json.load(f)

    synced_frames = []

    for item in metadata:

        synced_frames.append({
            "frame": item["frame"],
            "timestamp": item["timestamp"],
            "camera_id": item["camera_id"]
        })

    print(f"Synchronized {len(synced_frames)} frames")

    return synced_frames


synchronize_frames("metadata.json")