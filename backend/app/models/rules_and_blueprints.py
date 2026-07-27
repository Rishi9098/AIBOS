import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class BoardProfile(Base):
    __tablename__ = "board_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    board_code = Column(String(50), unique=True, nullable=False, index=True) # e.g. CBSE, ICSE, MP_BOARD
    board_name = Column(String(255), nullable=False)
    country = Column(String(100), default="India")
    state = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship("AcademicSession", back_populates="board", cascade="all, delete-orphan")
    blueprints = relationship("ExamBlueprint", back_populates="board", cascade="all, delete-orphan")
    rules = relationship("ExamRules", back_populates="board", cascade="all, delete-orphan")


class AcademicSession(Base):
    __tablename__ = "academic_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    board_id = Column(String(36), ForeignKey("board_profiles.id"), nullable=False)
    session_name = Column(String(50), nullable=False) # e.g. 2025-2026
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    board = relationship("BoardProfile", back_populates="sessions")


class ExamRules(Base):
    __tablename__ = "exam_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    board_id = Column(String(36), ForeignKey("board_profiles.id"), nullable=False)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=True)
    rule_code = Column(String(100), unique=True, nullable=False)
    rule_name = Column(String(255), nullable=False)

    # Timing & Marks Policy
    duration_minutes = Column(Integer, default=180)
    section_duration_minutes = Column(Integer, nullable=True)
    question_duration_seconds = Column(Integer, nullable=True)
    total_marks = Column(Float, default=100.0)
    passing_marks = Column(Float, default=33.0)
    grace_marks_policy = Column(JSON, default=dict) # e.g. {"max_grace": 5}

    # Scoring & Choice Policy
    negative_marking_enabled = Column(Boolean, default=False)
    negative_marking_ratio = Column(Float, default=0.25)
    internal_choice_enabled = Column(Boolean, default=True)

    # Tool Permissions
    calculator_allowed = Column(Boolean, default=False)
    scientific_calculator_allowed = Column(Boolean, default=False)
    drawing_enabled = Column(Boolean, default=True)
    equation_editor_enabled = Column(Boolean, default=True)

    # Lockdown & Security Policy
    internet_allowed = Column(Boolean, default=False)
    camera_required = Column(Boolean, default=True)
    mic_required = Column(Boolean, default=True)
    fullscreen_mandatory = Column(Boolean, default=True)
    resume_allowed = Column(Boolean, default=True)
    offline_allowed = Column(Boolean, default=True)
    auto_save_interval_seconds = Column(Integer, default=3)

    # Languages & Accessibility
    supported_languages = Column(JSON, default=lambda: ["en", "hi"])
    default_language = Column(String(10), default="en")
    pwd_extra_time_ratio = Column(Float, default=0.33) # 33% extra time
    accessibility_options = Column(JSON, default=dict)

    # Entry/Exit Policy
    late_entry_limit_minutes = Column(Integer, default=30)
    early_exit_min_minutes = Column(Integer, default=60)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    board = relationship("BoardProfile", back_populates="rules")


class ExamBlueprint(Base):
    __tablename__ = "exam_blueprints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    blueprint_code = Column(String(100), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    class_level = Column(String(20), nullable=False)
    board_id = Column(String(36), ForeignKey("board_profiles.id"), nullable=False)
    academic_year = Column(String(50), default="2025-2026")
    total_marks = Column(Float, default=100.0)
    total_questions = Column(Integer, default=30)

    # Structural distributions stored as JSON
    chapter_weightage = Column(JSON, default=dict) # {"Calculus": 30, "Optics": 20}
    difficulty_distribution = Column(JSON, default=dict) # {"easy": 0.3, "medium": 0.5, "hard": 0.2}
    bloom_taxonomy_mapping = Column(JSON, default=dict) # {"remember": 10, "apply": 40, ...}
    question_type_distribution = Column(JSON, default=dict) # {"MCQ": 10, "SHORT": 5}

    status = Column(String(50), default="DRAFT") # DRAFT, UNDER_REVIEW, APPROVED, ACTIVATED, ARCHIVED
    version_number = Column(Integer, default=1)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    reference_textbook = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    board = relationship("BoardProfile", back_populates="blueprints")
    versions = relationship("BlueprintVersion", back_populates="blueprint", cascade="all, delete-orphan")
    sections = relationship("ExamSection", back_populates="blueprint", cascade="all, delete-orphan")


class BlueprintVersion(Base):
    __tablename__ = "blueprint_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    blueprint_id = Column(String(36), ForeignKey("exam_blueprints.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    blueprint_snapshot = Column(JSON, nullable=False)
    changed_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    blueprint = relationship("ExamBlueprint", back_populates="versions")


class ExamSection(Base):
    __tablename__ = "exam_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    blueprint_id = Column(String(36), ForeignKey("exam_blueprints.id"), nullable=True)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=True)
    section_name = Column(String(100), nullable=False) # e.g. Section A, Section B
    section_order = Column(Integer, default=1)
    allocated_marks = Column(Float, default=20.0)
    total_questions = Column(Integer, default=10)
    time_limit_minutes = Column(Integer, nullable=True)

    is_optional = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    is_sequential = Column(Boolean, default=False)
    is_randomized = Column(Boolean, default=False)
    navigation_policy = Column(String(50), default="FREE") # FREE, SEQUENTIAL_ONLY
    review_policy = Column(String(50), default="ALLOWED") # ALLOWED, RESTRICTED

    blueprint = relationship("ExamBlueprint", back_populates="sections")


class QuestionStateTransition(Base):
    __tablename__ = "question_state_transitions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("exam_sessions.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False)
    from_state = Column(String(50), nullable=False) # NOT_VISITED, VISITED, ANSWERED, etc.
    to_state = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    transition_metadata = Column(JSON, default=dict)


class ExamWorkflowHistory(Base):
    __tablename__ = "exam_workflow_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False)
    from_state = Column(String(50), nullable=False) # SCHEDULED, PUBLISHED, OPEN, STARTED, etc.
    to_state = Column(String(50), nullable=False)
    transition_by = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    audit_details = Column(JSON, default=dict)
