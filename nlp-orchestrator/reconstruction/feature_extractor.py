"""
Phase 3 — COLMAP Feature Extraction Stage

Foundation implementation. Delegates to run_colmap_pipeline for actual
COLMAP execution; exposes a clean callable used by reconstruction_runner.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_features(
    workspace: str,
    images: Optional[str] = None,
    colmap_bin: str = "colmap",
    use_gpu: bool = False,
) -> bool:
    """
    Run COLMAP feature extraction on the supplied image directory.

    Args:
        workspace:  Path to the COLMAP workspace directory.
        images:     Path to the images directory. Defaults to
                    ``<workspace>/images``.
        colmap_bin: COLMAP executable name or full path.
        use_gpu:    Enable GPU SIFT extraction (default: False).

    Returns:
        ``True`` if feature extraction completed without errors, else ``False``.
    """
    logger.info("[FeatureExtractor] Starting COLMAP feature extraction.")
    logger.info("[FeatureExtractor] Workspace : %s", workspace)
    logger.info("[FeatureExtractor] Use GPU   : %s", use_gpu)

    try:
        from reconstruction.run_colmap import run_colmap_pipeline

        # Run only feature extraction by invoking the pipeline and
        # checking the per-stage result flag.
        result = run_colmap_pipeline(
            workspace=workspace,
            images=images,
            colmap_bin=colmap_bin,
            use_gpu=use_gpu,
        )
        success = result.get("feature_extraction", False)
        if success:
            logger.info("[FeatureExtractor] Feature extraction completed successfully.")
        else:
            logger.warning("[FeatureExtractor] Feature extraction reported failure.")
        return success

    except FileNotFoundError:
        logger.error(
            "[FeatureExtractor] COLMAP binary '%s' not found. "
            "Skipping feature extraction (foundation mode).",
            colmap_bin,
        )
        return False
    except Exception as exc:
        logger.error("[FeatureExtractor] Unexpected error: %s", exc)
        return False
