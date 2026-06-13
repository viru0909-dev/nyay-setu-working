"""
ocr.py
------
FastAPI router for OCR text extraction from scanned legal documents.
Endpoint: POST /ocr/extract-text
Closes #1115
"""

import logging
import time

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from services.ocr_service import run_ocr

logger = logging.getLogger("ocr-router")
router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Upload a scanned JPG, PNG, or PDF to extract text via OCR.
    Returns extracted text, word count, char count, and processing time.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    start = time.perf_counter()

    try:
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        result = run_ocr(
            file_bytes=file_bytes,
            content_type=file.content_type or "",
            filename=file.filename,
        )
        result["processing_time"] = f"{time.perf_counter() - start:.2f}s"

        return JSONResponse(status_code=200, content={"success": True, "data": result})

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("OCR endpoint error: %s", e)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {e}")
