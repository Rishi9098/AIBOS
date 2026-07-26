from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.question import QuestionResponse

class ExamQuestionCreate(BaseModel):
    question_id: str
    question_order: int
    allocated_marks: int

class ExamQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    question_order: int
    allocated_marks: int
    question: QuestionResponse

class ExamCreate(BaseModel):
    title: str
    subject: str
    total_marks: int
    duration_minutes: int
    start_time: datetime
    end_time: datetime
    blueprint_config: Optional[Dict[str, Any]] = None
    questions: List[ExamQuestionCreate]

class ExamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    subject: str
    total_marks: int
    duration_minutes: int
    start_time: datetime
    end_time: datetime
    status: str
    blueprint_config: Optional[Dict[str, Any]] = None
    exam_questions: List[ExamQuestionResponse]

class AnswerSaveRequest(BaseModel):
    exam_id: str
    answers: Dict[str, Any]  # map question_id -> student answer object (text, math, canvas_data, code)

class AnswerSubmitRequest(BaseModel):
    exam_id: str
    answers: Dict[str, Any]
    digital_signature: Optional[str] = None

class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    exam_id: str
    student_id: str
    status: str
    submitted_at: Optional[datetime] = None
    hash_chain_checksum: Optional[str] = None

class ProctoringLogCreate(BaseModel):
    submission_id: str
    event_type: str
    risk_score: int
    evidence_media_path: Optional[str] = None
    event_metadata: Optional[Dict[str, Any]] = None

class ProctoringLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    timestamp: datetime
    event_type: str
    risk_score: int
    evidence_media_path: Optional[str] = None
