"""
Phase 4 — Image Undistortion Stage

Prepares sparse reconstruction output for dense reconstruction by undistorting
images using camera calibration parameters stored in the COLMAP sparse model.

Architecture position:
    Sparse Reconstruction → [Image Undistortion] → Patch Match Stereo
"""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


def run_image_undistorter(
    workspace: str,
    sparse_input: Optional[str] = None,
    dense_output: Optional[str] = None,
    colmap_bin: str = "colmap",
    max_image_size: int = 2000,
) -> dict:
    """
    Run COLMAP image undistortion to prepare images for dense reconstruction.

    Reads the sparse reconstruction model and undistorts all registered images,
    writing the result to a ``dense/`` sub-directory of the workspace.

    Args:
        workspace:      Path to the COLMAP workspace directory.
        sparse_input:   Path to the sparse reconstruction model directory.
                        Defaults to ``<workspace>/sparse/0``.
        dense_output:   Path where undistorted images will be written.
                        Defaults to ``<workspace>/dense``.
        colmap_bin:     COLMAP executable name or full path.
        max_image_size: Maximum image dimension for undistortion (pixels).
                        Smaller values reduce memory usage at the cost of detail.

    Returns:
        A result dict::

            {
                "stage": "image_undistortion",
                "workspace": str,
                "dense_output": str,
                "success": bool,
            }
    """
    workspace = os.path.abspath(workspace)
    sparse_input = sparse_input or os.path.join(workspace, "sparse", "0")
    dense_output = dense_output or os.path.join(workspace, "dense")

    result: dict = {
        "stage": "image_undistortion",
        "workspace": workspace,
        "dense_output": dense_output,
        "success": False,
    }

    logger.info("[ImageUndistorter] Starting image undistortion.")
    logger.info("[ImageUndistorter] Workspace     : %s", workspace)
    logger.info("[ImageUndistorter] Sparse input  : %s", sparse_input)
    logger.info("[ImageUndistorter] Dense output  : %s", dense_output)
    logger.info("[ImageUndistorter] Max image size: %d", max_image_size)

    os.makedirs(dense_output, exist_ok=True)

    try:
        import subprocess

        cmd = [
            colmap_bin,
            "image_undistorter",
            "--image_path",
            os.path.join(workspace, "images"),
            "--input_path",
            sparse_input,
            "--output_path",
            dense_output,
            "--output_type",
            "COLMAP",
            "--max_image_size",
            str(max_image_size),
        ]

        logger.debug("[ImageUndistorter] Command: %s", " ".join(cmd))
        proc = subprocess.run(cmd, capture_output=True, text=True)

        if proc.returncode == 0:
            logger.info("[ImageUndistorter] Image undistortion completed successfully.")
            result["success"] = True
        else:
            logger.warning(
                "[ImageUndistorter] Undistortion exited with code %d: %s",
                proc.returncode,
                proc.stderr.strip(),
            )

    except FileNotFoundError:
        logger.warning(
            "[ImageUndistorter] COLMAP binary '%s' not found. "
            "Skipping undistortion (foundation mode).",
            colmap_bin,
        )
    except Exception as exc:
        logger.error("[ImageUndistorter] Unexpected error: %s", exc)

    return result
