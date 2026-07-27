import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Rubric(Base):
    __tablename__ = "rubrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False, index=True)
    version_number = Column(Integer, default=1, nullable=False)
    
    model_answer = Column(Text, nullable=False)
    expected_concepts = Column(JSON, default=list) # ["Snell's Law", "Refractive Index ratio"]
    keywords = Column(JSON, default=list) # ["sin(i)", "sin(r)", "n1", "n2", "constant"]
    mandatory_points = Column(JSON, default=list)
    optional_points = Column(JSON, default=list)
    mark_distribution = Column(JSON, default=dict) # {"formula": 2.0, "statement": 2.0, "diagram": 1.0}
    negative_conditions = Column(JSON, default=list) # ["incorrect_units", "reversed_ratio"]
    formula_requirements = Column(JSON, default=list)
    reasoning_expectations = Column(JSON, default=list)
    partial_marks_rules = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    question = relationship("QuestionBank")
    versions = relationship("RubricVersion", back_populates="rubric", cascade="all, delete-orphan")


class RubricVersion(Base):
    __tablename__ = "rubric_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rubric_id = Column(String(36), ForeignKey("rubrics.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    rubric_snapshot = Column(JSON, nullable=False)
    changed_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    rubric = relationship("Rubric", back_populates="versions")


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("student_submissions.id"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False)
    evaluator_type = Column(String(50), default="AI") # AI or HUMAN
    model_name = Column(String(100), default="RuleBasedEvaluator") # Gemini-1.5-Pro, OpenAI, etc.
    prompt_version = Column(String(50), default="v1.0")
    rubric_version_id = Column(String(36), nullable=True)

    allocated_marks = Column(Float, nullable=False)
    awarded_marks = Column(Float, nullable=False)
    confidence_score = Column(Float, default=1.0) # 0.0 to 1.0
    suggested_teacher_review = Column(Boolean, default=False)
    moderation_status = Column(String(50), default="AUTO_APPROVED") # AUTO_APPROVED, RANDOM_AUDIT, TEACHER_REVIEW_REQUIRED, OVERRIDDEN

    reasoning_summary = Column(Text, nullable=True)
    missing_concepts = Column(JSON, default=list)
    strong_concepts = Column(JSON, default=list)
    evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    submission = relationship("StudentSubmission")
    question = relationship("QuestionBank")
    evidence = relationship("EvaluationEvidence", back_populates="evaluation", uselist=False, cascade="all, delete-orphan")
    moderation = relationship("ModerationDecision", back_populates="evaluation", uselist=False, cascade="all, delete-orphan")
    override = relationship("TeacherOverride", back_populates="evaluation", uselist=False, cascade="all, delete-orphan")
    history = relationship("EvaluationHistory", back_populates="evaluation", cascade="all, delete-orphan")


class EvaluationEvidence(Base):
    __tablename__ = "evaluation_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluation_results.id", ondelete="CASCADE"), nullable=False)
    
    matched_concepts = Column(JSON, default=list)
    matched_keywords = Column(JSON, default=list)
    supporting_text_snippets = Column(JSON, default=list)
    rubric_references = Column(JSON, default=list)
    deductions_breakdown = Column(JSON, default=dict)

    evaluation = relationship("EvaluationResult", back_populates="evidence")


class ModerationDecision(Base):
    __tablename__ = "moderation_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluation_results.id", ondelete="CASCADE"), nullable=False)
    
    decision = Column(String(50), nullable=False) # AUTO_APPROVE, AUDIT_FLAG, TEACHER_ASSIGNED
    confidence_threshold_used = Column(Float, default=0.85)
    rule_triggered = Column(String(255), nullable=True)
    decided_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    evaluation = relationship("EvaluationResult", back_populates="moderation")


class TeacherOverride(Base):
    __tablename__ = "teacher_overrides"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluation_results.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String(36), ForeignKey("identity_users.id"), nullable=False)
    
    original_ai_marks = Column(Float, nullable=False)
    overridden_marks = Column(Float, nullable=False)
    teacher_comments = Column(Text, nullable=False)
    override_reason = Column(String(255), nullable=True)
    overridden_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    evaluation = relationship("EvaluationResult", back_populates="override")
    teacher = relationship("User")


class EvaluationHistory(Base):
    __tablename__ = "evaluation_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluation_results.id", ondelete="CASCADE"), nullable=False)
    
    action_type = Column(String(50), nullable=False) # INITIAL_EVALUATION, TEACHER_OVERRIDE, RE_EVALUATED
    performed_by = Column(String(100), nullable=False)
    snapshot_json = Column(JSON, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    evaluation = relationship("EvaluationResult", back_populates="history")
