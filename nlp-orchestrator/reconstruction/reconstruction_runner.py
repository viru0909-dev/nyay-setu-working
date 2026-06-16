"""
Phase 3 — Sparse Reconstruction Runner

Orchestrates the full COLMAP sparse reconstruction pipeline:
  feature extraction → feature matching → sparse reconstruction (mapper).
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def run_reconstruction(
    workspace: str,
    images: Optional[str] = None,
    colmap_bin: str = "colmap",
    use_gpu: bool = False,
) -> dict:
    """
    Run the COLMAP sparse reconstruction pipeline.

    Calls feature extraction, feature matching, and the mapper in sequence.
    Each stage gracefully degrades if COLMAP is unavailable (foundation mode).

    Args:
        workspace:  Path to the COLMAP workspace directory.
        images:     Path to the images directory. Defaults to
                    ``<workspace>/images``.
        colmap_bin: COLMAP executable name or full path.
        use_gpu:    Enable GPU acceleration (default: False).

    Returns:
        A dict with per-stage completion flags::

            {
                "workspace": str,
                "feature_extraction": bool,
                "feature_matching": bool,
                "sparse_reconstruction": bool,
            }
    """
    logger.info("[ReconstructionRunner] Sparse reconstruction pipeline starting.")
    logger.info("[ReconstructionRunner] Workspace : %s", workspace)

    try:
        from reconstruction.run_colmap import run_colmap_pipeline

        result = run_colmap_pipeline(
            workspace=workspace,
            images=images,
            colmap_bin=colmap_bin,
            use_gpu=use_gpu,
        )
        logger.info("[ReconstructionRunner] Pipeline result: %s", result)
        return result

    except FileNotFoundError:
        logger.warning(
            "[ReconstructionRunner] COLMAP binary '%s' not found. "
            "Returning placeholder result (foundation mode).",
            colmap_bin,
        )
        return {
            "workspace": workspace,
            "feature_extraction": False,
            "feature_matching": False,
            "sparse_reconstruction": False,
        }
    except Exception as exc:
        logger.error("[ReconstructionRunner] Unexpected error: %s", exc)
        return {
            "workspace": workspace,
            "feature_extraction": False,
            "feature_matching": False,
            "sparse_reconstruction": False,
        }
def run_reconstruction():
    print("Sparse reconstruction pipeline initialized")
