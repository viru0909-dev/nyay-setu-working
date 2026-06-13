import os
import subprocess

COLMAP = r"C:\Users\HP\Downloads\colmap-x64-windows-cuda\bin\colmap.exe"

workspace = os.path.abspath("colmap_workspace")

images = os.path.join(workspace, "images")

database_path = os.path.join(workspace, "database.db")

sparse_path = os.path.join(workspace, "sparse")

print("Workspace:", workspace)
print("Images:", images)

# FEATURE EXTRACTION
subprocess.run(
    [
        COLMAP,
        "feature_extractor",
        "--database_path",
        database_path,
        "--image_path",
        images,
        "--ImageReader.single_camera",
        "1",
        "--SiftExtraction.use_gpu",
        "0",
    ]
)

# FEATURE MATCHING
subprocess.run(
    [
        COLMAP,
        "exhaustive_matcher",
        "--database_path",
        database_path,
        "--SiftMatching.use_gpu",
        "0",
    ]
)

# SPARSE RECONSTRUCTION
subprocess.run(
    [
        COLMAP,
        "mapper",
        "--database_path",
        database_path,
        "--image_path",
        images,
        "--output_path",
        sparse_path,
    ]
)

print("COLMAP sparse reconstruction complete")
