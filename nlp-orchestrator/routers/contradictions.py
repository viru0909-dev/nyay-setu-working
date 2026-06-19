from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.contradiction_detector import detect_contradictions

router = APIRouter(prefix="/api/contradictions", tags=["Contradiction Detection"])

REPORT_STORE: dict[str, dict] = {}


class CaseDocument(BaseModel):
    id: str
    name: str
    type: str = "document"
    text: str = Field(..., min_length=1)


class ContradictionAnalysisRequest(BaseModel):
    case_id: str | None = None
    documents: list[CaseDocument] = Field(..., min_length=2)


class ReviewStatusRequest(BaseModel):
    status: Literal["pending", "confirmed", "dismissed"]


@router.post("/analyze")
async def analyze_contradictions(payload: ContradictionAnalysisRequest):
    report = detect_contradictions(
        documents=[document.model_dump() for document in payload.documents],
        case_id=payload.case_id,
    )

    REPORT_STORE[report["report_id"]] = report
    return report


@router.get("/reports/{report_id}")
async def get_contradiction_report(report_id: str):
    report = REPORT_STORE.get(report_id)

    if not report:
        raise HTTPException(status_code=404, detail="Contradiction report not found")

    return report


@router.patch("/reports/{report_id}/contradictions/{contradiction_id}/status")
async def update_contradiction_status(
    report_id: str,
    contradiction_id: str,
    payload: ReviewStatusRequest,
):
    report = REPORT_STORE.get(report_id)

    if not report:
        raise HTTPException(status_code=404, detail="Contradiction report not found")

    for contradiction in report["contradictions"]:
        if contradiction["id"] == contradiction_id:
            contradiction["status"] = payload.status
            return contradiction

    raise HTTPException(status_code=404, detail="Contradiction not found")
