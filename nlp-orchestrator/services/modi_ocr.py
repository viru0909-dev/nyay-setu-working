import asyncio
import io
import logging
import os
import re
import threading
from typing import Any

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError
from services.deskew_service import deskew_image

from config import HF_TOKEN, TROCR_DEVICE, TROCR_MODEL_NAME

logger = logging.getLogger("modi-ocr-service")

_processor: Any = None
_model: Any = None
_device: Any = None
_model_lock = threading.Lock()

MAX_IMAGE_DIMENSION = 1280
MIN_IMAGE_DIMENSION = 384

# Bound on how many pages are OCR'd concurrently. OCR is heavy (model
# inference + OpenCV preprocessing), so unbounded concurrency on a large PDF
# would exhaust memory/VRAM. Override with OCR_MAX_CONCURRENCY in the env.
# Defaults to a small multiple of CPU count, capped at 8.
def _default_ocr_concurrency() -> int:
    try:
        raw = os.getenv("OCR_MAX_CONCURRENCY")
        if raw:
            return max(1, int(raw))
    except ValueError:
        logger.warning("Invalid OCR_MAX_CONCURRENCY=%r; using default.", os.getenv("OCR_MAX_CONCURRENCY"))
    return max(1, min(8, (os.cpu_count() or 2)))


OCR_MAX_CONCURRENCY = _default_ocr_concurrency()


class InvalidImageError(ValueError):
    """Raised when uploaded bytes cannot be decoded as an image."""


class ModiOCRServiceError(RuntimeError):
    """Raised when OCR inference cannot be completed."""


def _resolve_device(torch_module: Any) -> Any:
    requested_device = (TROCR_DEVICE or "").strip().lower()

    if requested_device:
        if requested_device.startswith("cuda") and not torch_module.cuda.is_available():
            logger.warning("TROCR_DEVICE=%s requested but CUDA is unavailable. Falling back to CPU.", TROCR_DEVICE)
            return torch_module.device("cpu")
        return torch_module.device(requested_device)

    return torch_module.device("cuda" if torch_module.cuda.is_available() else "cpu")


def _load_model() -> tuple[Any, Any, Any]:
    global _processor, _model, _device

    if _processor is not None and _model is not None and _device is not None:
        return _processor, _model, _device

    with _model_lock:
        if _processor is not None and _model is not None and _device is not None:
            return _processor, _model, _device

        try:
            import torch
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel

            token = HF_TOKEN or None
            logger.info("Loading TrOCR model '%s' for Modi OCR.", TROCR_MODEL_NAME)
            
            try:
                _processor = TrOCRProcessor.from_pretrained(TROCR_MODEL_NAME, token=token, use_fast=True)
            except Exception as proc_exc:
                logger.warning("Fast tokenizer load failed for '%s' (%s); retrying with use_fast=False.", TROCR_MODEL_NAME, proc_exc)
                _processor = TrOCRProcessor.from_pretrained(TROCR_MODEL_NAME, token=token, use_fast=False)
            
            model = VisionEncoderDecoderModel.from_pretrained(TROCR_MODEL_NAME, token=token)
            device = _resolve_device(torch)

            model.to(device)
            model.eval()

            _model = model
            _device = device

            logger.info("TrOCR model loaded on %s.", device)
            return _processor, _model, _device
        except Exception as exc:
            logger.error("Failed to load OCR model '%s': %s", TROCR_MODEL_NAME, exc)
            raise ModiOCRServiceError(f"Failed to load OCR model: {exc}") from exc


def _resize_normalized(image: np.ndarray) -> np.ndarray:
    height, width = image.shape[:2]
    longest = max(height, width)
    shortest = min(height, width)

    scale = 1.0
    if longest > MAX_IMAGE_DIMENSION:
        scale = MAX_IMAGE_DIMENSION / float(longest)
    elif shortest < MIN_IMAGE_DIMENSION:
        scale = MIN_IMAGE_DIMENSION / float(shortest)

    if scale == 1.0:
        return image

    interpolation = cv2.INTER_AREA if scale < 1.0 else cv2.INTER_CUBIC
    new_width = max(1, int(width * scale))
    new_height = max(1, int(height * scale))
    return cv2.resize(image, (new_width, new_height), interpolation=interpolation)


def preprocess_image(image_bytes: bytes) -> Image.Image:
    if not image_bytes:
        raise InvalidImageError("Uploaded image is empty.")

    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("Uploaded file is not a valid image.") from exc
    pil_image = deskew_image(pil_image)
    rgb = np.array(pil_image)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)

    thresholded = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )
    normalized = _resize_normalized(thresholded)
    rgb_normalized = cv2.cvtColor(normalized, cv2.COLOR_GRAY2RGB)

    return Image.fromarray(rgb_normalized)


def cleanup_transliterated_text(text: str) -> str:
    cleaned = text or ""
    cleaned = cleaned.replace("<s>", " ").replace("</s>", " ")
    cleaned = re.sub(r"[\u200b-\u200f\u202a-\u202e]", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"([।,.;:!?])\1{2,}", r"\1", cleaned)
    cleaned = re.sub(r"\s+([।,.;:!?])", r"\1", cleaned)
    return cleaned.strip()


def apply_modi_to_devanagari_mapping(text: str) -> str:
    # Most TrOCR checkpoints return Unicode text directly. This hook keeps future
    # Modi-specific character mapping isolated from route and inference code.
    modi_to_devanagari = {
        "\U00011600": "\u0905",
        "\U00011601": "\u0906",
        "\U00011602": "\u0907",
        "\U00011603": "\u0908",
        "\U00011604": "\u0909",
        "\U00011605": "\u090a",
        "\U00011606": "\u090b",
        "\U00011607": "\u0960",
        "\U00011608": "\u090c",
        "\U00011609": "\u0961",
        "\U0001160a": "\u090f",
        "\U0001160b": "\u0910",
        "\U0001160c": "\u0913",
        "\U0001160d": "\u0914",
        "\U0001160e": "\u0915",
        "\U0001160f": "\u0916",
        "\U00011610": "\u0917",
        "\U00011611": "\u0918",
        "\U00011612": "\u0919",
        "\U00011613": "\u091a",
        "\U00011614": "\u091b",
        "\U00011615": "\u091c",
        "\U00011616": "\u091d",
        "\U00011617": "\u091e",
        "\U00011618": "\u091f",
        "\U00011619": "\u0920",
        "\U0001161a": "\u0921",
        "\U0001161b": "\u0922",
        "\U0001161c": "\u0923",
        "\U0001161d": "\u0924",
        "\U0001161e": "\u0925",
        "\U0001161f": "\u0926",
        "\U00011620": "\u0927",
        "\U00011621": "\u0928",
        "\U00011622": "\u092a",
        "\U00011623": "\u092b",
        "\U00011624": "\u092c",
        "\U00011625": "\u092d",
        "\U00011626": "\u092e",
        "\U00011627": "\u092f",
        "\U00011628": "\u0930",
        "\U00011629": "\u0932",
        "\U0001162a": "\u0935",
        "\U0001162b": "\u0936",
        "\U0001162c": "\u0937",
        "\U0001162d": "\u0938",
        "\U0001162e": "\u0939",
        "\U0001162f": "\u0933",
        "\U00011630": "\u093e",
        "\U00011631": "\u093f",
        "\U00011632": "\u0940",
        "\U00011633": "\u0941",
        "\U00011634": "\u0942",
        "\U00011635": "\u0943",
        "\U00011636": "\u0944",
        "\U00011637": "\u0947",
        "\U00011638": "\u0948",
        "\U00011639": "\u094b",
        "\U0001163a": "\u094c",
        "\U0001163b": "\u094d",
        "\U0001163c": "\u0902",
        "\U0001163d": "\u0903",
        "\U0001163e": "\u0901",
        "\U0001163f": "\u093c",
        "\U00011640": "\u0964",
    }
    return "".join(modi_to_devanagari.get(char, char) for char in text)


def _run_ocr(image_bytes: bytes) -> str:
    try:
        import torch

        image = preprocess_image(image_bytes)
        processor, model, device = _load_model()

        pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
        with torch.no_grad():
            generated_ids = model.generate(
                pixel_values,
                max_length=256,
                num_beams=4,
                early_stopping=True,
            )

        predicted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        predicted_text = apply_modi_to_devanagari_mapping(predicted_text)
        return cleanup_transliterated_text(predicted_text)
    except InvalidImageError:
        raise
    except ModiOCRServiceError:
        raise
    except Exception as exc:
        logger.error("Modi OCR inference failed: %s", exc)
        raise ModiOCRServiceError(f"OCR inference failed: {exc}") from exc


async def recognize_modi_image(image_bytes: bytes) -> str:
    return await asyncio.to_thread(_run_ocr, image_bytes)


async def recognize_modi_pages(
    pages: list[bytes],
    max_concurrency: int | None = None,
) -> list[dict]:
    """
    OCR many page images concurrently and return per-page results in input order.

    Previously a multi-page document (e.g. a 50-page PDF rendered to images) was
    processed one page at a time. Here each page is dispatched through
    `recognize_modi_image` (which offloads the blocking model inference to a
    worker thread) and run concurrently via `asyncio.gather`, bounded by a
    semaphore so a large document cannot exhaust memory/VRAM.

    A failure on one page is captured for that page only and does NOT abort the
    rest of the batch.

    Returns a list of dicts, one per input page, each shaped:
        {
            "page": <1-based index>,
            "status": "success" | "error",
            "predicted_text": <str>,   # "" on error
            "error": <str|None>,
        }
    """
    if not pages:
        return []

    limit = max_concurrency if max_concurrency and max_concurrency > 0 else OCR_MAX_CONCURRENCY
    semaphore = asyncio.Semaphore(limit)

    async def _process(index: int, image_bytes: bytes) -> dict:
        async with semaphore:
            try:
                text = await recognize_modi_image(image_bytes)
                return {
                    "page": index + 1,
                    "status": "success",
                    "predicted_text": text,
                    "error": None,
                }
            except (InvalidImageError, ModiOCRServiceError) as exc:
                logger.error("OCR failed on page %d: %s", index + 1, exc)
                return {
                    "page": index + 1,
                    "status": "error",
                    "predicted_text": "",
                    "error": str(exc),
                }
            except Exception as exc:  # defensive: never let one page sink the batch
                logger.error("Unexpected OCR error on page %d: %s", index + 1, exc)
                return {
                    "page": index + 1,
                    "status": "error",
                    "predicted_text": "",
                    "error": f"Unexpected error: {exc}",
                }

    tasks = [_process(i, page) for i, page in enumerate(pages)]
    results = await asyncio.gather(*tasks)
    # gather preserves task order, which matches input page order.
    return list(results)
