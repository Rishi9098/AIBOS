from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class DocumentUploadResponse(BaseModel):
    id: str
    file_name: str
    file_type: str
    file_size_bytes: int
    page_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecognizedRegionResponse(BaseModel):
    id: str
    region_type: str
    bounding_box: Dict[str, Any]
    raw_text: str
    confidence_score: float

    class Config:
        from_attributes = True


class OCRResultResponse(BaseModel):
    id: str
    page_id: str
    ocr_provider: str
    language_detected: str
    overall_confidence: float
    regions: List[RecognizedRegionResponse] = []

    class Config:
        from_attributes = True


class OCRCorrectionRequest(BaseModel):
    corrected_text: str


class NormalizedRepresentationResponse(BaseModel):
    id: str
    document_id: str
    submission_id: Optional[str] = None
    question_id: Optional[str] = None
    unified_payload: Dict[str, Any]
    is_teacher_corrected: bool
    normalized_at: datetime

    class Config:
        from_attributes = True
