from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ProcessResultRequest(BaseModel):
    submission_id: str
    grace_marks: Optional[float] = 0.0

class StudentResultResponse(BaseModel):
    id: str
    exam_id: str
    student_id: str
    total_theory_marks: float
    total_practical_marks: float
    grace_marks: float
    final_total_marks: float
    max_marks: float
    percentage: float
    cgpa: float
    grade: str
    division: str
    pass_status: str
    rank_state: Optional[int] = 1
    rank_district: Optional[int] = 1
    rank_school: Optional[int] = 1
    created_at: datetime

    class Config:
        from_attributes = True


class ModerateResultRequest(BaseModel):
    result_id: str
    grace_marks: float
    reason: str


class DigitalMarksheetResponse(BaseModel):
    id: str
    student_id: str
    exam_id: str
    marksheet_number: str
    subjects_json: List[Dict[str, Any]]
    total_marks: float
    percentage: float
    cgpa: float
    qr_code_payload: str
    digital_signature: str
    verification_url: str
    version_number: int
    issued_at: datetime

    class Config:
        from_attributes = True


class DigitalCertificateResponse(BaseModel):
    id: str
    student_id: str
    certificate_type: str
    certificate_number: str
    issue_date: datetime
    qr_code_payload: str
    digital_signature: str
    is_revoked: bool
    verification_url: str

    class Config:
        from_attributes = True


class VerificationResponse(BaseModel):
    is_valid: bool
    document_type: str
    document_number: str
    student_name: str
    issued_at: datetime
    digital_signature: str
    details: Dict[str, Any]


class RevaluationRequestCreate(BaseModel):
    result_id: str
    subject: str
    fee_paid: Optional[float] = 500.0


class RevaluationRequestResponse(BaseModel):
    id: str
    result_id: str
    student_id: str
    subject: str
    fee_paid: float
    status: str
    original_marks: float
    revised_marks: Optional[float] = None
    difference_report: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
