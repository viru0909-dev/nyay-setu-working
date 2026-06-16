"""
Phase 3 — COLMAP Feature Matching Stage

Foundation implementation. Delegates to run_colmap_pipeline for actual
COLMAP execution; exposes a clean callable used by reconstruction_runner.
"""

import logging

logger = logging.getLogger(__name__)


def match_features(
    workspace: str,
    colmap_bin: str = "colmap",
    use_gpu: bool = False,
) -> bool:
    """
    Run COLMAP exhaustive feature matching.

    Args:
        workspace:  Path to the COLMAP workspace directory containing
                    the ``database.db`` produced by feature extraction.
        colmap_bin: COLMAP executable name or full path.
        use_gpu:    Enable GPU SIFT matching (default: False).

    Returns:
        ``True`` if feature matching completed without errors, else ``False``.
    """
    logger.info("[Matcher] Starting COLMAP feature matching.")
    logger.info("[Matcher] Workspace : %s", workspace)

    try:
        from reconstruction.run_colmap import run_colmap_pipeline

        result = run_colmap_pipeline(
            workspace=workspace,
            colmap_bin=colmap_bin,
            use_gpu=use_gpu,
        )
        success = result.get("feature_matching", False)
        if success:
            logger.info("[Matcher] Feature matching completed successfully.")
        else:
            logger.warning("[Matcher] Feature matching reported failure.")
        return success

    except FileNotFoundError:
        logger.error(
            "[Matcher] COLMAP binary '%s' not found. "
            "Skipping feature matching (foundation mode).",
            colmap_bin,
        )
        return False
    except Exception as exc:
        logger.error("[Matcher] Unexpected error: %s", exc)
        return False
