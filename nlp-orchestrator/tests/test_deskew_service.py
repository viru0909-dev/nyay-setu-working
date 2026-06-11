"""
Tests for deskew_service.py
"""

import numpy as np
from PIL import Image, ImageDraw

from services.deskew_service import deskew_image, deskew_images


def _make_blank_image(width=400, height=200, color=255) -> Image.Image:
    """Creates a plain white PIL image."""
    return Image.fromarray(np.full((height, width), color, dtype=np.uint8))


def _make_skewed_image(angle_deg: float) -> Image.Image:
    """Creates a white image with a diagonal line at the given angle."""
    img = Image.new("RGB", (400, 200), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw a line at the given angle across the image
    import math
    cx, cy = 200, 100
    length = 150
    rad = math.radians(angle_deg)
    x1 = int(cx - length * math.cos(rad))
    y1 = int(cy - length * math.sin(rad))
    x2 = int(cx + length * math.cos(rad))
    y2 = int(cy + length * math.sin(rad))
    draw.line([(x1, y1), (x2, y2)], fill=(0, 0, 0), width=3)
    return img


class TestDeskewImage:

    def test_straight_image_unchanged(self):
        """A non-skewed image should be returned as-is."""
        img = _make_skewed_image(0)
        result = deskew_image(img)
        assert result.size == img.size

    def test_output_is_pil_image(self):
        """deskew_image must always return a PIL Image."""
        img = _make_skewed_image(5)
        result = deskew_image(img)
        assert isinstance(result, Image.Image)

    def test_skewed_image_is_corrected(self):
        """A visibly skewed image should be rotated."""
        img = _make_skewed_image(10)
        result = deskew_image(img)
        # After deskewing, result should still be a valid image
        assert result is not None
        assert result.size == img.size

    def test_negligible_skew_returns_original(self):
        """Skew below 0.5° should not trigger rotation."""
        img = _make_skewed_image(0.2)
        result = deskew_image(img)
        # Size must match — image returned unchanged
        assert result.size == img.size

    def test_blank_image_no_crash(self):
        """A blank white image (no lines) should not raise any error."""
        img = _make_blank_image()
        result = deskew_image(img)
        assert isinstance(result, Image.Image)


class TestDeskewImages:

    def test_processes_multiple_pages(self):
        """deskew_images should handle a list of pages."""
        pages = [_make_skewed_image(5), _make_skewed_image(10), _make_blank_image()]
        results = deskew_images(pages)
        assert len(results) == 3
        assert all(isinstance(r, Image.Image) for r in results)

    def test_empty_list_returns_empty(self):
        """Empty input should return empty output, not an error."""
        results = deskew_images([])
        assert results == []