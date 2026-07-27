from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# Rubric Schemas
class RubricBase(BaseModel):
    question_id: str
    model_answer: str
    expected_concepts: Optional[List[str]] = []
    keywords: Optional[List[str]] = []
    mandatory_points: Optional[List[str]] = []
    optional_points: Optional[List[str]] = []
    mark_distribution: Optional[Dict[str, float]] = {}
    negative_conditions: Optional[List[str]] = []
    formula_requirements: Optional[List[str]] = []
    reasoning_expectations: Optional[List[str]] = []
    partial_marks_rules: Optional[Dict[str, Any]] = {}

class RubricCreate(RubricBase):
    pass

class RubricResponse(RubricBase):
    id: str
    version_number: int
    created_at: datetime

    class Config:
        from_attributes = True


# Evaluation Request Schema
class EvaluateAnswerRequest(BaseModel):
    submission_id: str
    question_id: str
    student_answer: Any
    allocated_marks: Optional[float] = 5.0


# Evaluation Evidence Schema
class EvaluationEvidenceResponse(BaseModel):
    matched_concepts: List[str]
    matched_keywords: List[str]
    supporting_text_snippets: List[str]
    rubric_references: List[str]
    deductions_breakdown: Dict[str, Any]

    class Config:
        from_attributes = True


# Teacher Override Request Schema
class TeacherOverrideRequest(BaseModel):
    overridden_marks: float
    teacher_comments: str
    override_reason: Optional[str] = "Manual review correction"


# Evaluation Result Response Schema
class EvaluationResultResponse(BaseModel):
    id: str
    submission_id: str
    question_id: str
    evaluator_type: str
    model_name: str
    allocated_marks: float
    awarded_marks: float
    confidence_score: float
    suggested_teacher_review: bool
    moderation_status: str
    reasoning_summary: Optional[str] = None
    missing_concepts: List[str] = []
    strong_concepts: List[str] = []
    evaluated_at: datetime
    evidence: Optional[EvaluationEvidenceResponse] = None

    class Config:
        from_attributes = True
