"""
deskew_service.py
-----------------
Pre-processing step that detects and corrects skew in scanned PDF page images
before they are passed to the TrOCR pipeline.

Uses OpenCV's Hough Line Transform to estimate skew angle and then rotates
the image to straighten it.
"""

import cv2
import numpy as np
from PIL import Image


def _estimate_skew_angle(gray: np.ndarray) -> float:
    """
    Estimates the skew angle of a grayscale image using Hough Line Transform.

    Returns the angle in degrees (negative = counter-clockwise tilt).
    Returns 0.0 if no dominant angle can be detected.
    """
    # Blur slightly to reduce noise, then detect edges
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, threshold1=50, threshold2=150, apertureSize=3)

    # Detect lines using Hough Transform
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=100,
        minLineLength=100,
        maxLineGap=10,
    )

    if lines is None:
        return 0.0

    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x2 - x1 == 0:
            continue  # skip vertical lines
        angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        # Only consider near-horizontal lines (within ±45°)
        if -45 < angle < 45:
            angles.append(angle)

    if not angles:
        return 0.0

    # Use median to be robust against outliers
    return float(np.median(angles))


def deskew_image(image: Image.Image) -> Image.Image:
    """
    Detects and corrects skew in a PIL Image.

    Args:
        image: A PIL Image (typically one page of a scanned PDF).

    Returns:
        A deskewed PIL Image. If skew is less than 0.5°, returns the
        original image unchanged (avoids unnecessary rotation).
    """
    # Convert PIL → OpenCV (grayscale for angle detection)
    cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

    angle = _estimate_skew_angle(gray)

    # Skip rotation if skew is negligible
    if abs(angle) < 0.5:
        return image

    # Rotate the image to correct the skew
    h, w = gray.shape
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, scale=1.0)

    # Use white background fill (255) to avoid black borders after rotation
    corrected = cv2.warpAffine(
        cv_image,
        rotation_matrix,
        (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(255, 255, 255),
    )

    return Image.fromarray(cv2.cvtColor(corrected, cv2.COLOR_BGR2RGB))


def deskew_images(images: list[Image.Image]) -> list[Image.Image]:
    """
    Applies deskewing to a list of PIL Images (all pages of a PDF).

    Args:
        images: List of PIL Images, one per PDF page.

    Returns:
        List of deskewed PIL Images in the same order.
    """
    return [deskew_image(img) for img in images]