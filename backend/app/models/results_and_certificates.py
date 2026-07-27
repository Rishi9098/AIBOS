import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class StudentResult(Base):
    __tablename__ = "student_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    
    total_theory_marks = Column(Float, default=0.0)
    total_practical_marks = Column(Float, default=0.0)
    internal_assessment_marks = Column(Float, default=0.0)
    grace_marks = Column(Float, default=0.0)
    final_total_marks = Column(Float, nullable=False)
    max_marks = Column(Float, default=100.0)
    
    percentage = Column(Float, nullable=False)
    cgpa = Column(Float, nullable=False)
    grade = Column(String(10), nullable=False) # A1, A2, B1, B2, C1, C2, D, E
    division = Column(String(50), default="FIRST DIVISION")
    pass_status = Column(String(50), default="PASS") # PASS, FAIL, COMPARTMENT
    
    rank_state = Column(Integer, nullable=True)
    rank_district = Column(Integer, nullable=True)
    rank_school = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam = relationship("Exam")
    student = relationship("Student")
    moderation_history = relationship("ResultModerationHistory", back_populates="result", cascade="all, delete-orphan")


class ResultModerationHistory(Base):
    __tablename__ = "result_moderation_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    result_id = Column(String(36), ForeignKey("student_results.id", ondelete="CASCADE"), nullable=False)
    moderation_type = Column(String(50), nullable=False) # GRACE_MARKS, BORDERLINE, MANUAL
    original_marks = Column(Float, nullable=False)
    moderated_marks = Column(Float, nullable=False)
    approved_by = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    result = relationship("StudentResult", back_populates="moderation_history")


class DigitalMarksheet(Base):
    __tablename__ = "digital_marksheets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False)
    marksheet_number = Column(String(100), unique=True, nullable=False, index=True)
    
    subjects_json = Column(JSON, nullable=False) # List of subject wise breakdown
    total_marks = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    cgpa = Column(Float, nullable=False)
    
    qr_code_payload = Column(Text, nullable=False)
    digital_signature = Column(Text, nullable=False)
    verification_url = Column(Text, nullable=False)
    version_number = Column(Integer, default=1)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("Student")
    exam = relationship("Exam")


class DigitalCertificate(Base):
    __tablename__ = "digital_certificates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    certificate_type = Column(String(50), nullable=False) # PASS, MIGRATION, PROVISIONAL, MERIT, CHARACTER, DUPLICATE
    certificate_number = Column(String(100), unique=True, nullable=False, index=True)
    issue_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    qr_code_payload = Column(Text, nullable=False)
    digital_signature = Column(Text, nullable=False)
    is_revoked = Column(Boolean, default=False)
    revocation_reason = Column(Text, nullable=True)
    verification_url = Column(Text, nullable=False)

    student = relationship("Student")


class ResultPublication(Base):
    __tablename__ = "result_publications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False)
    board_code = Column(String(50), nullable=False, index=True)
    scope = Column(String(50), default="BOARD_WIDE") # BOARD_WIDE, DISTRICT, SCHOOL
    publication_status = Column(String(50), default="SCHEDULED") # SCHEDULED, PUBLISHED
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)

    exam = relationship("Exam")


class RevaluationRequest(Base):
    __tablename__ = "revaluation_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    result_id = Column(String(36), ForeignKey("student_results.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    fee_paid = Column(Float, default=500.0)
    status = Column(String(50), default="SUBMITTED") # SUBMITTED, ASSIGNED, RE_EVALUATED, APPROVED
    original_marks = Column(Float, nullable=False)
    revised_marks = Column(Float, nullable=True)
    difference_report = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    result = relationship("StudentResult")
    student = relationship("Student")
