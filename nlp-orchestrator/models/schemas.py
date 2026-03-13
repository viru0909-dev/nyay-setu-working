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
