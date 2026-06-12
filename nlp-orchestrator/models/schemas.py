from pydantic import BaseModel
from typing import List

class ForensicsRequest(BaseModel):
    jobId: str
    videoUrls: List[str]
    citizenDescription: str = ""

class AnalysisStatus(BaseModel):
    jobId: str
    stage: str
    message: str
    progress: int

class LiabilityReport(BaseModel):
    jobId: str
    liabilityVerdict: str
    timelineEvents: List[dict]
    applicableSections: List[dict]

class ModiOCRResponse(BaseModel):
    status: str
    predicted_text: str
    processing_time: str


class SynthesisResult(BaseModel):
    """
    Structured output of the answer synthesizer.

    `answer_markdown` is the human-readable legal opinion (unchanged from the
    previous string return value). `cited_laws` is the explicit array of legal
    provisions the model relied on, e.g. ["IPC Sec 302", "CrPC Sec 144"],
    normalized and de-duplicated.
    """
    answer_markdown: str
    cited_laws: List[str] = []