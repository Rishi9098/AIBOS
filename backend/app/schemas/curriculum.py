from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

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

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True

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
    chapter_title: str
    learning_outcome_code: str
    traceability_id: str
    status: str
