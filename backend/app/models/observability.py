import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AIModelRegistry(Base):
    __tablename__ = "ai_model_registry"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_name = Column(String(100), nullable=False) # Gemini-1.5-Pro, RuleBasedEvaluator
    provider = Column(String(50), nullable=False) # Google, OpenAI, Internal
    version = Column(String(50), nullable=False) # v1.0, v2.1
    prompt_version = Column(String(50), default="v1.0")
    rubric_version = Column(String(50), default="v1.0")
    
    deployment_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="ACTIVE") # ACTIVE, DEPRECATED, ROLLBACK
    accuracy_score = Column(Float, default=0.95)
    mean_latency_ms = Column(Float, default=240.0)
    cost_per_eval = Column(Float, default=0.002)
    rollback_version_id = Column(String(36), nullable=True)

    benchmarks = relationship("AIBenchmarkResult", back_populates="model_registry", cascade="all, delete-orphan")


class AIBenchmarkResult(Base):
    __tablename__ = "ai_benchmark_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_registry_id = Column(String(36), ForeignKey("ai_model_registry.id", ondelete="CASCADE"), nullable=False)
    dataset_name = Column(String(100), default="State_Board_Benchmark_2026")
    
    accuracy = Column(Float, default=0.948)
    precision = Column(Float, default=0.952)
    recall = Column(Float, default=0.941)
    f1_score = Column(Float, default=0.946)
    confidence_calibration = Column(Float, default=0.93)
    mean_latency_ms = Column(Float, default=240.0)
    evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    model_registry = relationship("AIModelRegistry", back_populates="benchmarks")


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    flag_key = Column(String(100), unique=True, nullable=False, index=True) # OCR_ENABLED, AI_EVALUATION_ENABLED
    flag_name = Column(String(150), nullable=False)
    is_enabled = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PilotSchoolOnboarding(Base):
    __tablename__ = "pilot_school_onboarding"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    school_name = Column(String(255), nullable=False)
    board_code = Column(String(50), nullable=False, index=True) # CBSE_MAIN, MP_BOARD
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    student_count = Column(Integer, default=500)
    teacher_count = Column(Integer, default=30)
    pilot_status = Column(String(50), default="ONBOARDED") # ONBOARDED, TESTING, LIVE, COMPLETED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
