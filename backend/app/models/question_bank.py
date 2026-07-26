import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class QuestionBank(Base):
    __tablename__ = "question_bank"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subject = Column(String(100), nullable=False, index=True)
    chapter = Column(String(150), nullable=False, index=True)
    topic = Column(String(150), nullable=True)
    bloom_level = Column(String(50), nullable=False)  # Remember, Understand, Apply, Analyze, Evaluate, Create
    difficulty_score = Column(Float, nullable=False, default=0.5)  # 0.0 to 1.0
    question_type = Column(String(50), nullable=False)  # MCQ, SHORT, LONG, DIAGRAM, CODE, MATH
    question_text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    rubric_json = Column(JSON, nullable=False)  # Step-wise grading criteria & keywords
    expected_time_seconds = Column(Integer, nullable=False, default=300)
    version = Column(Integer, default=1)
    created_by = Column(String(36), ForeignKey("identity_users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
