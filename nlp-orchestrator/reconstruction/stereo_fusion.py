"""
Phase 4 — Stereo Fusion Stage

Fuses per-image depth maps (produced by Patch Match Stereo) into a single
dense point cloud. This is the final step of the COLMAP dense pipeline.

Architecture position:
    Patch Match Stereo → [Stereo Fusion] → Dense Point Cloud
"""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


def run_stereo_fusion(
    workspace: str,
    dense_path: Optional[str] = None,
    colmap_bin: str = "colmap",
    min_num_pixels: int = 5,
) -> dict:
    """
    Run COLMAP stereo fusion to produce a dense point cloud.

    Reads depth maps written by Patch Match Stereo and fuses them into
    a single ``fused.ply`` point cloud file inside the dense directory.

    Args:
        workspace:       Path to the COLMAP workspace directory.
        dense_path:      Path to the dense reconstruction directory containing
                         depth maps. Defaults to ``<workspace>/dense``.
        colmap_bin:      COLMAP executable name or full path.
        min_num_pixels:  Minimum number of fused pixels per point. Higher values
                         produce a cleaner but sparser cloud.

    Returns:
        A result dict::

            {
                "stage": "stereo_fusion",
                "workspace": str,
                "dense_path": str,
                "point_cloud": str,   # path to fused.ply
                "success": bool,
            }
    """
    workspace = os.path.abspath(workspace)
    dense_path = dense_path or os.path.join(workspace, "dense")
    point_cloud_path = os.path.join(dense_path, "fused.ply")

    result: dict = {
        "stage": "stereo_fusion",
        "workspace": workspace,
        "dense_path": dense_path,
        "point_cloud": point_cloud_path,
        "success": False,
    }

    logger.info("[StereoFusion] Starting stereo fusion.")
    logger.info("[StereoFusion] Workspace       : %s", workspace)
    logger.info("[StereoFusion] Dense path      : %s", dense_path)
    logger.info("[StereoFusion] Point cloud out : %s", point_cloud_path)
    logger.info("[StereoFusion] Min num pixels  : %d", min_num_pixels)

    try:
        import subprocess

        cmd = [
            colmap_bin,
            "stereo_fusion",
            "--workspace_path",
            dense_path,
            "--workspace_format",
            "COLMAP",
            "--input_type",
            "geometric",
            "--output_path",
            point_cloud_path,
            "--StereoFusion.min_num_pixels",
            str(min_num_pixels),
        ]

        logger.debug("[StereoFusion] Command: %s", " ".join(cmd))
        proc = subprocess.run(cmd, capture_output=True, text=True)

        if proc.returncode == 0:
            logger.info(
                "[StereoFusion] Stereo fusion completed. Point cloud: %s",
                point_cloud_path,
            )
            result["success"] = True
        else:
            logger.warning(
                "[StereoFusion] Fusion exited with code %d: %s",
                proc.returncode,
                proc.stderr.strip(),
            )

    except FileNotFoundError:
        logger.warning(
            "[StereoFusion] COLMAP binary '%s' not found. "
            "Skipping stereo fusion (foundation mode).",
            colmap_bin,
        )
    except Exception as exc:
        logger.error("[StereoFusion] Unexpected error: %s", exc)

    return result
