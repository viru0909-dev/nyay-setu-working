"""Local multilingual named-entity recognition for outbound PII sanitization."""

import logging
import os
from functools import lru_cache
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger("nlp-orchestrator.pii-ner")
router = APIRouter(prefix="/internal/pii", tags=["internal-pii"])


class NerRequest(BaseModel):
    """Text submitted by the backend before an external LLM request."""

    text: str = Field(max_length=50_000)
    minor_protection: bool = False


class DetectedEntity(BaseModel):
    """An exact sensitive span and its normalized entity type."""

    value: str
    type: Literal["PERSON", "ORGANIZATION", "ADDRESS"]


class NerResponse(BaseModel):
    """Sensitive entities detected entirely inside the local deployment."""

    entities: list[DetectedEntity]


@lru_cache(maxsize=1)
def _get_ner_pipeline():
    """Load the configured model once; inference never calls a hosted API."""
    from transformers import pipeline

    model_name = os.getenv("PII_NER_MODEL", "ai4bharat/IndicNER")
    logger.info("Loading local PII NER model: %s", model_name)
    return pipeline(
        "token-classification",
        model=model_name,
        tokenizer=model_name,
        aggregation_strategy="simple",
    )


def detect_sensitive_entities(
    text: str, minor_protection: bool = False
) -> list[DetectedEntity]:
    """Detect person, organization, and location spans in multilingual text."""
    if not text.strip():
        return []

    threshold = 0.35 if minor_protection else 0.55
    detected: list[DetectedEntity] = []
    seen: set[tuple[str, str]] = set()
    label_mapping = {
        "PER": "PERSON",
        "PERSON": "PERSON",
        "ORG": "ORGANIZATION",
        "ORGANIZATION": "ORGANIZATION",
        "LOC": "ADDRESS",
        "LOCATION": "ADDRESS",
        "GPE": "ADDRESS",
    }

    for entity in _get_ner_pipeline()(text):
        score = float(entity.get("score", 0.0))
        raw_label = str(entity.get("entity_group", entity.get("entity", "")))
        normalized_label = raw_label.upper().removeprefix("B-").removeprefix("I-")
        entity_type = label_mapping.get(normalized_label)
        start = entity.get("start")
        end = entity.get("end")
        if entity_type is None or score < threshold or start is None or end is None:
            continue

        value = text[int(start):int(end)].strip()
        key = (value.casefold(), entity_type)
        if value and key not in seen:
            seen.add(key)
            detected.append(DetectedEntity(value=value, type=entity_type))

    return detected


@router.post("/entities", response_model=NerResponse)
def find_pii_entities(request: NerRequest) -> NerResponse:
    """Return sensitive spans without persisting or forwarding the supplied text."""
    return NerResponse(
        entities=detect_sensitive_entities(request.text, request.minor_protection)
    )
