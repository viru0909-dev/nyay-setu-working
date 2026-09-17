"""
FastAPI Router for Real-Time Court Order Translation Endpoint.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any
from services.translation_service import CourtOrderTranslator

router = APIRouter(prefix="/api/v1/translate", tags=["Translation"])
translator = CourtOrderTranslator()


class TranslationRequest(BaseModel):
    """Payload model for translation requests."""
    text: str = Field(..., description="English court order text to be translated")
    target_language: str = Field("hi", description="ISO 639-1 code of target Indic language")


class TranslationResponse(BaseModel):
    """Response model for translation endpoints."""
    original_text: str
    translated_text: str
    target_language_code: str
    target_language_name: str
    word_count: int
    processing_time_ms: float
    status: str


@router.post("/court-order", response_model=TranslationResponse, status_code=status.HTTP_200_OK)
def translate_court_order_endpoint(payload: TranslationRequest) -> Dict[str, Any]:
    """Endpoint to translate court orders into supported Indic languages."""
    try:
        result = translator.translate_court_order(
            text=payload.text,
            target_language=payload.target_language
        )
        return result
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.get("/languages", status_code=status.HTTP_200_OK)
def get_supported_languages_endpoint() -> Dict[str, Any]:
    """Return dictionary of supported target Indic languages."""
    return {"supported_languages": translator.get_supported_languages()}
