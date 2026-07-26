from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.question import QuestionResponse

class ExamQuestionCreate(BaseModel):
    question_id: str
    question_order: int
    allocated_marks: int
    section_name: Optional[str] = "Section A"

class ExamQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    question_order: int
    allocated_marks: int
    section_name: Optional[str] = "Section A"
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

class ExamSessionStartRequest(BaseModel):
    exam_id: str

class ExamSessionStateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    exam_id: str
    student_id: str
    submission_id: str
    current_question_id: Optional[str] = None
    active_section: str = "Section A"
    seconds_remaining: int
    section_time_remaining: Optional[Dict[str, int]] = None
    visited_questions: List[str] = []
    flagged_questions: List[str] = []
    skipped_questions: List[str] = []
    active_answers: Dict[str, Any] = {}
    last_synced_at: datetime

class AutoSaveRequest(BaseModel):
    exam_id: str
    question_id: str
    answer_data: Dict[str, Any]
    encrypted_payload: Optional[str] = None
    payload_nonce: Optional[str] = None
    seconds_remaining: int
    visited_questions: List[str] = []
    flagged_questions: List[str] = []
    skipped_questions: List[str] = []

class AutoSaveResponse(BaseModel):
    status: str
    version_number: int
    saved_at: datetime
    checksum: str

class BatchOfflineSyncItem(BaseModel):
    question_id: str
    answer_data: Dict[str, Any]
    timestamp: datetime

class BatchOfflineSyncRequest(BaseModel):
    exam_id: str
    queued_changes: List[BatchOfflineSyncItem]
    activity_logs: List[Dict[str, Any]] = []

class BatchOfflineSyncResponse(BaseModel):
    synced_count: int
    status: str
    last_synced_at: datetime

class ActivityLogCreate(BaseModel):
    submission_id: str
    event_type: str
    event_details: Optional[Dict[str, Any]] = None

class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    timestamp: datetime
    event_type: str
    event_details: Optional[Dict[str, Any]] = None

class SubmissionValidationRequest(BaseModel):
    exam_id: str
    answers: Dict[str, Any]

class SubmissionValidationResponse(BaseModel):
    is_valid: bool
    total_questions: int
    answered_count: int
    skipped_count: int
    flagged_count: int
    missing_question_ids: List[str] = []
    warnings: List[str] = []

class AnswerSubmitRequest(BaseModel):
    exam_id: str
    answers: Dict[str, Any]
    encrypted_payload: Optional[str] = None
    payload_nonce: Optional[str] = None
    digital_signature: Optional[str] = None

class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    exam_id: str
    student_id: str
    status: str
    submitted_at: Optional[datetime] = None
    hash_chain_checksum: Optional[str] = None
    digital_signature: Optional[str] = None

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
