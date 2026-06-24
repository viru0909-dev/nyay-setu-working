"""
COLMAP Execution Wrapper

Provides a callable interface for running COLMAP sparse reconstruction stages.
No hardcoded paths — all paths are passed as parameters or resolved at runtime.

Note: This is a foundation implementation. Actual COLMAP execution requires
a COLMAP binary on PATH or supplied via the ``colmap_bin`` parameter.
"""

import logging
import os
import subprocess
from typing import Optional

logger = logging.getLogger(__name__)


def _run(cmd: list[str], stage: str) -> subprocess.CompletedProcess:
    """Run a subprocess command and log the outcome."""
    logger.info("[COLMAP] Running stage: %s", stage)
    logger.debug("[COLMAP] Command: %s", " ".join(cmd))
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.warning(
                "[COLMAP] Stage '%s' exited with code %d: %s",
                stage,
                result.returncode,
                result.stderr.strip(),
            )
        else:
            logger.info("[COLMAP] Stage '%s' completed successfully.", stage)
        return result
    except FileNotFoundError:
        logger.error(
            "[COLMAP] Binary not found for stage '%s'. "
            "Ensure COLMAP is installed and on PATH or pass colmap_bin explicitly.",
            stage,
        )
        raise


def run_colmap_pipeline(
    workspace: str,
    images: Optional[str] = None,
    colmap_bin: str = "colmap",
    use_gpu: bool = False,
) -> dict:
    """
    Run the full COLMAP sparse reconstruction pipeline.

    Stages executed:
      1. feature_extractor  — extract SIFT features from images
      2. exhaustive_matcher — match features across all image pairs
      3. mapper             — reconstruct sparse 3-D model

    Args:
        workspace:  Absolute or relative path to the COLMAP workspace directory.
                    Must contain an ``images/`` sub-directory (or pass ``images``).
        images:     Path to the images directory. Defaults to
                    ``<workspace>/images``.
        colmap_bin: Name or full path of the COLMAP executable.
                    Defaults to ``"colmap"`` (assumes it is on PATH).
        use_gpu:    Whether to enable GPU acceleration for SIFT. Set to
                    ``False`` for CPU-only environments (default).

    Returns:
        A dict summarising which stages completed without errors::

            {
                "workspace": str,
                "feature_extraction": bool,
                "feature_matching": bool,
                "sparse_reconstruction": bool,
            }
    """
    workspace = os.path.abspath(workspace)
    images = images or os.path.join(workspace, "images")
    database_path = os.path.join(workspace, "database.db")
    sparse_path = os.path.join(workspace, "sparse")

    os.makedirs(sparse_path, exist_ok=True)

    gpu_flag = "1" if use_gpu else "0"
    results: dict = {
        "workspace": workspace,
        "feature_extraction": False,
        "feature_matching": False,
        "sparse_reconstruction": False,
    }

    logger.info("[COLMAP] Workspace : %s", workspace)
    logger.info("[COLMAP] Images    : %s", images)
    logger.info("[COLMAP] Database  : %s", database_path)
    logger.info("[COLMAP] Sparse out: %s", sparse_path)

    # ── Stage 1: Feature Extraction ──────────────────────────────────────────
    proc = _run(
        [
            colmap_bin,
            "feature_extractor",
            "--database_path",
            database_path,
            "--image_path",
            images,
            "--ImageReader.single_camera",
            "1",
            "--SiftExtraction.use_gpu",
            gpu_flag,
        ],
        stage="feature_extractor",
    )
    results["feature_extraction"] = proc.returncode == 0

    # ── Stage 2: Feature Matching ─────────────────────────────────────────────
    proc = _run(
        [
            colmap_bin,
            "exhaustive_matcher",
            "--database_path",
            database_path,
            "--SiftMatching.use_gpu",
            gpu_flag,
        ],
        stage="exhaustive_matcher",
    )
    results["feature_matching"] = proc.returncode == 0

    # ── Stage 3: Sparse Reconstruction (mapper) ───────────────────────────────
    proc = _run(
        [
            colmap_bin,
            "mapper",
            "--database_path",
            database_path,
            "--image_path",
            images,
            "--output_path",
            sparse_path,
        ],
        stage="mapper",
    )
    results["sparse_reconstruction"] = proc.returncode == 0

    logger.info("[COLMAP] Pipeline summary: %s", results)
    return results
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
