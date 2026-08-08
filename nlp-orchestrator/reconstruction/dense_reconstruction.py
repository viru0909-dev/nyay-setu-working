"""
Phase 4 — Dense Reconstruction Pipeline

Orchestrates the full COLMAP dense reconstruction pipeline:

    Image Undistortion → Patch Match Stereo → Stereo Fusion → Dense Point Cloud

This module is the Phase 4 entry point. It is called after sparse
reconstruction (Phase 3 / reconstruction_runner.py) has completed
and a valid sparse model exists in ``<workspace>/sparse/0``.
"""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


def run_patch_match_stereo(
    dense_path: str,
    colmap_bin: str = "colmap",
    gpu_index: int = -1,
) -> bool:
    """
    Run COLMAP Patch Match Stereo to compute per-image depth maps.

    This is the most compute-intensive stage. GPU acceleration is strongly
    recommended; the ``gpu_index`` parameter controls which device is used.
    Set ``gpu_index=-1`` to use all available GPUs, or ``0``/``1``/... for a
    specific device.

    Args:
        dense_path: Path to the dense directory produced by image_undistorter.
        colmap_bin: COLMAP executable name or full path.
        gpu_index:  GPU index for PatchMatchStereo (``-1`` = all GPUs).
                    Ignored on CPU-only systems where COLMAP was built
                    without CUDA support.

    Returns:
        ``True`` if the stage completed without errors, else ``False``.
    """
    logger.info("[PatchMatchStereo] Starting depth map estimation.")
    logger.info("[PatchMatchStereo] Dense path : %s", dense_path)
    logger.info("[PatchMatchStereo] GPU index  : %d", gpu_index)

    try:
        import subprocess

        cmd = [
            colmap_bin,
            "patch_match_stereo",
            "--workspace_path",
            dense_path,
            "--workspace_format",
            "COLMAP",
            "--PatchMatchStereo.geom_consistency",
            "true",
            "--PatchMatchStereo.gpu_index",
            str(gpu_index),
        ]

        logger.debug("[PatchMatchStereo] Command: %s", " ".join(cmd))
        proc = subprocess.run(cmd, capture_output=True, text=True)

        if proc.returncode == 0:
            logger.info("[PatchMatchStereo] Depth maps computed successfully.")
            return True
        else:
            logger.warning(
                "[PatchMatchStereo] Exited with code %d: %s",
                proc.returncode,
                proc.stderr.strip(),
            )
            return False

    except FileNotFoundError:
        logger.warning(
            "[PatchMatchStereo] COLMAP binary '%s' not found. "
            "Skipping patch match stereo (foundation mode).",
            colmap_bin,
        )
        return False
    except Exception as exc:
        logger.error("[PatchMatchStereo] Unexpected error: %s", exc)
        return False


def run_dense_reconstruction(
    workspace: str,
    sparse_input: Optional[str] = None,
    colmap_bin: str = "colmap",
    max_image_size: int = 2000,
    min_num_pixels: int = 5,
    gpu_index: int = -1,
) -> dict:
    """
    Run the complete Phase 4 dense reconstruction pipeline.

    Stages:
      1. Image Undistortion   — corrects lens distortion using sparse model
      2. Patch Match Stereo   — estimates per-image depth maps
      3. Stereo Fusion        — fuses depth maps into a dense point cloud

    Args:
        workspace:       Path to the COLMAP workspace directory. Must already
                         contain a sparse reconstruction at
                         ``<workspace>/sparse/0``.
        sparse_input:    Path to the sparse model. Defaults to
                         ``<workspace>/sparse/0``.
        colmap_bin:      COLMAP executable name or full path.
        max_image_size:  Maximum image dimension for undistortion (pixels).
        min_num_pixels:  Minimum fused pixels per stereo fusion output point.
        gpu_index:       GPU index for Patch Match Stereo (``-1`` = all GPUs).

    Returns:
        A summary dict::

            {
                "workspace": str,
                "dense_path": str,
                "undistortion": bool,
                "patch_match_stereo": bool,
                "stereo_fusion": bool,
                "point_cloud": str,   # path to fused.ply (may not exist yet)
                "success": bool,      # True only when all three stages pass
            }
    """
    workspace = os.path.abspath(workspace)
    dense_path = os.path.join(workspace, "dense")

    summary: dict = {
        "workspace": workspace,
        "dense_path": dense_path,
        "undistortion": False,
        "patch_match_stereo": False,
        "stereo_fusion": False,
        "point_cloud": os.path.join(dense_path, "fused.ply"),
        "success": False,
    }

    logger.info("[DenseReconstruction] Dense reconstruction pipeline starting.")
    logger.info("[DenseReconstruction] Workspace : %s", workspace)

    # ── Stage 1: Image Undistortion ───────────────────────────────────────────
    from reconstruction.image_undistorter import run_image_undistorter

    undistort_result = run_image_undistorter(
        workspace=workspace,
        sparse_input=sparse_input,
        dense_output=dense_path,
        colmap_bin=colmap_bin,
        max_image_size=max_image_size,
    )
    summary["undistortion"] = undistort_result["success"]

    if not summary["undistortion"]:
        logger.warning(
            "[DenseReconstruction] Undistortion failed or skipped. "
            "Continuing in foundation mode."
        )

    # ── Stage 2: Patch Match Stereo ───────────────────────────────────────────
    summary["patch_match_stereo"] = run_patch_match_stereo(
        dense_path=dense_path,
        colmap_bin=colmap_bin,
        gpu_index=gpu_index,
    )

    if not summary["patch_match_stereo"]:
        logger.warning(
            "[DenseReconstruction] Patch match stereo failed or skipped. "
            "Continuing in foundation mode."
        )

    # ── Stage 3: Stereo Fusion ────────────────────────────────────────────────
    from reconstruction.stereo_fusion import run_stereo_fusion

    fusion_result = run_stereo_fusion(
        workspace=workspace,
        dense_path=dense_path,
        colmap_bin=colmap_bin,
        min_num_pixels=min_num_pixels,
    )
    summary["stereo_fusion"] = fusion_result["success"]

    # ── Overall success ───────────────────────────────────────────────────────
    summary["success"] = all(
        [
            summary["undistortion"],
            summary["patch_match_stereo"],
            summary["stereo_fusion"],
        ]
    )

    logger.info("[DenseReconstruction] Pipeline summary: %s", summary)
    return summary
