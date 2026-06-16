import logging
import time
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from models.schemas import ModiOCRResponse
from services.modi_ocr import (
    InvalidImageError,
    ModiOCRServiceError,
    recognize_modi_image,
    recognize_modi_pages,
)

logger = logging.getLogger("modi-ocr-router")
router = APIRouter(prefix="/ocr", tags=["OCR"])

ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}


# Batch responses are shaped locally (rather than in models/schemas.py) to keep
# this feature self-contained.
class ModiOCRPageResult(BaseModel):
    page: int
    status: str
    predicted_text: str
    error: Optional[str] = None


class ModiOCRBatchResponse(BaseModel):
    status: str
    pages: int
    succeeded: int
    failed: int
    processing_time: str
    results: List[ModiOCRPageResult]


@router.post("/modi", response_model=ModiOCRResponse)
async def ocr_modi_document(file: UploadFile = File(...)):
    """Run OCR and Devanagari cleanup on an uploaded Modi script document image."""
    if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Upload a valid image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    start_time = time.perf_counter()
    try:
        logger.info("Running Modi OCR for uploaded file '%s'.", file.filename)
        predicted_text = await recognize_modi_image(image_bytes)
        processing_time = f"{time.perf_counter() - start_time:.2f}s"

        return ModiOCRResponse(
            status="success",
            predicted_text=predicted_text,
            processing_time=processing_time,
        )
    except InvalidImageError as exc:
        logger.error("Invalid Modi OCR image upload: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ModiOCRServiceError as exc:
        logger.error("Modi OCR service error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Unexpected Modi OCR endpoint error: %s", exc)
        raise HTTPException(status_code=500, detail="OCR inference failed.") from exc


@router.post("/modi/batch", response_model=ModiOCRBatchResponse)
async def ocr_modi_documents(files: List[UploadFile] = File(...)):
    """
    Run OCR on multiple Modi-script page images concurrently.

    Intended for multi-page documents (e.g. each page of a scanned PDF uploaded
    as an image). Pages are processed in parallel; per-page failures are
    reported in `results` without failing the whole request.
    """
    if not files:
        raise HTTPException(status_code=400, detail="Upload at least one image file.")

    pages: list[bytes] = []
    for file in files:
        if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"'{file.filename}' is not a valid image file.",
            )
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=400,
                detail=f"'{file.filename}' is empty.",
            )
        pages.append(content)

    start_time = time.perf_counter()
    logger.info("Running batch Modi OCR for %d page(s).", len(pages))
    results = await recognize_modi_pages(pages)
    processing_time = f"{time.perf_counter() - start_time:.2f}s"

    succeeded = sum(1 for r in results if r["status"] == "success")
    failed = len(results) - succeeded

    return ModiOCRBatchResponse(
        status="success" if failed == 0 else "partial",
        pages=len(results),
        succeeded=succeeded,
        failed=failed,
        processing_time=processing_time,
        results=[ModiOCRPageResult(**r) for r in results],
    )
