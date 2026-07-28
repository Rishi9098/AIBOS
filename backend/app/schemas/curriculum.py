from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CreateCurriculumRequest(BaseModel):
    board_code: str
    academic_year: str
    class_level: str
    subject_code: str
    medium: Optional[str] = "ENGLISH"

class BoardCurriculumResponse(BaseModel):
    id: str
    board_code: str
    academic_year: str
    class_level: str
    subject_code: str
    medium: str
    version_number: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UploadTextbookRequest(BaseModel):
    title: str
    board_code: str
    class_level: str
    subject: str
    publisher: Optional[str] = "NCERT"
    edition: Optional[str] = "2025-26 Edition"
    isbn: Optional[str] = None
    notification_number: Optional[str] = None

class TextbookResponse(BaseModel):
    id: str
    title: str
    board_code: str
    class_level: str
    subject: str
    publisher: str
    edition: str = "2025-26 Edition"
    approval_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CurriculumJobResponse(BaseModel):
    id: str
    textbook_id: str
    status: str
    current_stage: str
    progress_percentage: float
    eta_seconds: int
    total_pages: int
    processed_pages: int
    total_chunks: int
    total_embeddings: int
    total_nodes: int
    total_relationships: int
    ocr_accuracy: float
    error_message: Optional[str] = None
    failed_stage: Optional[str] = None
    retry_count: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class JobLogResponse(BaseModel):
    id: str
    job_id: str
    stage_name: str
    log_level: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TextbookChunkResponse(BaseModel):
    id: str
    textbook_id: str
    chapter_title: str
    chunk_index: int
    token_count: int
    page_number: int
    text_content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GenerateTraceableQuestionRequest(BaseModel):
    board_code: str
    class_level: str
    subject: str
    chapter_title: str

class QuestionTraceabilityResponse(BaseModel):
    question_id: str
    question_text: str
    knowledge_id: str
    textbook_title: str
    page_number: int
    bloom_level: str
    verification_hash: str
