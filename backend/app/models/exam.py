import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    total_marks = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    blueprint_config = Column(JSON, nullable=True)  # Difficulty ratios, chapter weightages, section definitions
    status = Column(String(50), default="DRAFT")  # DRAFT, PUBLISHED, LIVE, COMPLETED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam_questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    submissions = relationship("StudentSubmission", back_populates="exam")
    sessions = relationship("ExamSession", back_populates="exam", cascade="all, delete-orphan")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False)
    section_name = Column(String(100), nullable=True, default="Section A")
    question_order = Column(Integer, nullable=False)
    allocated_marks = Column(Integer, nullable=False)

    exam = relationship("Exam", back_populates="exam_questions")
    question = relationship("QuestionBank")


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    current_question_id = Column(String(36), nullable=True)
    active_section = Column(String(100), default="Section A")
    seconds_remaining = Column(Integer, nullable=False)
    section_time_remaining = Column(JSON, nullable=True)  # Map section_name -> seconds_left
    visited_questions_json = Column(JSON, nullable=True, default=list)  # List of visited question IDs
    flagged_questions_json = Column(JSON, nullable=True, default=list)  # List of flagged question IDs
    skipped_questions_json = Column(JSON, nullable=True, default=list)  # List of skipped question IDs
    last_synced_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam = relationship("Exam", back_populates="sessions")
    student = relationship("Student")


class StudentSubmission(Base):
    __tablename__ = "student_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    status = Column(String(50), default="IN_PROGRESS")  # IN_PROGRESS, SUBMITTED, EVALUATED
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    answers_json = Column(JSON, nullable=True)  # Decrypted current active answers
    encrypted_payload = Column(Text, nullable=True)  # AES-256-GCM base64 ciphertext
    payload_nonce = Column(Text, nullable=True)  # AES-256-GCM base64 nonce
    digital_signature = Column(Text, nullable=True)
    hash_chain_checksum = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam = relationship("Exam", back_populates="submissions")
    student = relationship("Student")
    proctoring_logs = relationship("ProctoringLog", back_populates="submission", cascade="all, delete-orphan")
    ai_evaluations = relationship("AIEvaluation", back_populates="submission", cascade="all, delete-orphan")
    version_history = relationship("AnswerVersionHistory", back_populates="submission", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="submission", cascade="all, delete-orphan")


class AnswerVersionHistory(Base):
    __tablename__ = "answer_version_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("student_submissions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False)
    version_number = Column(Integer, nullable=False, default=1)
    answer_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    submission = relationship("StudentSubmission", back_populates="version_history")
    question = relationship("QuestionBank")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("student_submissions.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(50), nullable=False) 
    # EXAM_START, QUESTION_NAVIGATE, AUTO_SAVE, TAB_SWITCH, COPY_PASTE_ATTEMPT, DEVTOOLS_OPEN, REFRESH_ATTEMPT, NETWORK_OFFLINE, NETWORK_ONLINE, EXAM_SUBMIT
    event_details = Column(JSON, nullable=True)

    submission = relationship("StudentSubmission", back_populates="activity_logs")


class ProctoringLog(Base):
    __tablename__ = "proctoring_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("student_submissions.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(50), nullable=False)  # TAB_SWITCH, GAZE_OFF, MULTI_PERSON, PHONE_DETECTED, AUDIO_ANOMALY
    risk_score = Column(Integer, nullable=False, default=0)  # 0 to 100
    evidence_media_path = Column(Text, nullable=True)
    event_metadata = Column(JSON, nullable=True)

    submission = relationship("StudentSubmission", back_populates="proctoring_logs")


class AIEvaluation(Base):
    __tablename__ = "ai_evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("student_submissions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False)
    score_awarded = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    evaluator_agent = Column(String(50), nullable=False)
    reasoning_step_json = Column(JSON, nullable=False)
    human_verified = Column(Boolean, default=False)
    verified_by = Column(String(36), ForeignKey("identity_users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    submission = relationship("StudentSubmission", back_populates="ai_evaluations")
    question = relationship("QuestionBank")
