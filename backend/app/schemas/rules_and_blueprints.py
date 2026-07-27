from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# Board Profile Schemas
class BoardProfileBase(BaseModel):
    board_code: str
    board_name: str
    country: Optional[str] = "India"
    state: Optional[str] = None
    description: Optional[str] = None

class BoardProfileCreate(BoardProfileBase):
    pass

class BoardProfileResponse(BoardProfileBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Exam Rules Schemas
class ExamRulesBase(BaseModel):
    board_id: str
    rule_code: str
    rule_name: str
    duration_minutes: Optional[int] = 180
    section_duration_minutes: Optional[int] = None
    question_duration_seconds: Optional[int] = None
    total_marks: Optional[float] = 100.0
    passing_marks: Optional[float] = 33.0
    grace_marks_policy: Optional[Dict[str, Any]] = {}
    negative_marking_enabled: Optional[bool] = False
    negative_marking_ratio: Optional[float] = 0.25
    internal_choice_enabled: Optional[bool] = True
    calculator_allowed: Optional[bool] = False
    scientific_calculator_allowed: Optional[bool] = False
    drawing_enabled: Optional[bool] = True
    equation_editor_enabled: Optional[bool] = True
    internet_allowed: Optional[bool] = False
    camera_required: Optional[bool] = True
    mic_required: Optional[bool] = True
    fullscreen_mandatory: Optional[bool] = True
    resume_allowed: Optional[bool] = True
    offline_allowed: Optional[bool] = True
    auto_save_interval_seconds: Optional[int] = 3
    supported_languages: Optional[List[str]] = ["en", "hi"]
    default_language: Optional[str] = "en"
    pwd_extra_time_ratio: Optional[float] = 0.33
    accessibility_options: Optional[Dict[str, Any]] = {}
    late_entry_limit_minutes: Optional[int] = 30
    early_exit_min_minutes: Optional[int] = 60

class ExamRulesCreate(ExamRulesBase):
    pass

class ExamRulesResponse(ExamRulesBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Exam Blueprint Schemas
class ExamBlueprintBase(BaseModel):
    blueprint_code: str
    title: str
    subject: str
    class_level: str
    board_id: str
    academic_year: Optional[str] = "2025-2026"
    total_marks: Optional[float] = 100.0
    total_questions: Optional[int] = 30
    chapter_weightage: Optional[Dict[str, Any]] = {}
    difficulty_distribution: Optional[Dict[str, Any]] = {}
    bloom_taxonomy_mapping: Optional[Dict[str, Any]] = {}
    question_type_distribution: Optional[Dict[str, Any]] = {}
    reference_textbook: Optional[str] = None

class ExamBlueprintCreate(ExamBlueprintBase):
    pass

class BlueprintApprovalSchema(BaseModel):
    approved_by: str
    status: str = "APPROVED" # APPROVED or ACTIVATED

class ExamBlueprintResponse(ExamBlueprintBase):
    id: str
    status: str
    version_number: int
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Exam Section Schemas
class ExamSectionCreate(BaseModel):
    blueprint_id: Optional[str] = None
    exam_id: Optional[str] = None
    section_name: str
    section_order: Optional[int] = 1
    allocated_marks: Optional[float] = 20.0
    total_questions: Optional[int] = 10
    time_limit_minutes: Optional[int] = None
    is_optional: Optional[bool] = False
    is_locked: Optional[bool] = False
    is_sequential: Optional[bool] = False
    is_randomized: Optional[bool] = False

class ExamSectionResponse(ExamSectionCreate):
    id: str

    class Config:
        from_attributes = True


# Workflow Transition Schema
class WorkflowTransitionSchema(BaseModel):
    exam_id: str
    target_state: str # e.g. SCHEDULED, PUBLISHED, OPEN, STARTED, COMPLETED, SUBMITTED
    transition_by: str
    reason: Optional[str] = None
