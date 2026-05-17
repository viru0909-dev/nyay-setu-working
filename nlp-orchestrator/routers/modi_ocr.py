import logging
import time

from fastapi import APIRouter, File, HTTPException, UploadFile

from models.schemas import ModiOCRResponse
from services.modi_ocr import InvalidImageError, ModiOCRServiceError, recognize_modi_image

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
