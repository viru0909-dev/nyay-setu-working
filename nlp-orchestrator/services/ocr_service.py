"""
ocr_service.py
--------------
OCR processing for scanned legal documents (JPG, PNG, PDF).
Uses Tesseract + OpenCV preprocessing + pdf2image for PDFs.
Closes #1115
"""

import io
import logging
from PIL import Image
import pytesseract
import cv2
import numpy as np

logger = logging.getLogger("ocr-service")

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png"}
SUPPORTED_PDF_TYPE = "application/pdf"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def _preprocess(image: Image.Image) -> np.ndarray:
    """Convert PIL image to grayscale + Otsu threshold for better OCR accuracy."""
    cv_img = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(cv_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh


def _extract_from_image(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    processed = _preprocess(image)
    text = pytesseract.image_to_string(processed, lang="eng")
    if not text.strip():
        raise ValueError("No readable text found in the image.")
    return text.strip()


def _extract_from_pdf(file_bytes: bytes) -> str:
    from pdf2image import convert_from_bytes
    from services.deskew_service import deskew_images

    pages = convert_from_bytes(file_bytes, dpi=300)
    if not pages:
        raise ValueError("Could not convert PDF pages to images.")
    pages = deskew_images(pages)
    parts = []
    for i, page in enumerate(pages):
        text = pytesseract.image_to_string(_preprocess(page), lang="eng")
        parts.append(f"--- Page {i + 1} ---\n{text.strip()}")
    combined = "\n\n".join(parts)
    if not combined.strip():
        raise ValueError("No readable text found in the PDF.")
    return combined


def run_ocr(file_bytes: bytes, content_type: str, filename: str) -> dict:
    """
    Main OCR entry point. Routes to image or PDF handler.
    Returns dict with extracted text and metadata.
    """
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("File size exceeds the 20MB limit.")

    ct = content_type.lower().strip()

    if ct in SUPPORTED_IMAGE_TYPES:
        text = _extract_from_image(file_bytes)
        doc_type = "image"
    elif ct == SUPPORTED_PDF_TYPE:
        text = _extract_from_pdf(file_bytes)
