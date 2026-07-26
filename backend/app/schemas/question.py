from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any

class QuestionCreate(BaseModel):
    subject: str
    chapter: str
    topic: Optional[str] = None
    bloom_level: str  # Remember, Understand, Apply, Analyze, Evaluate, Create
    difficulty_score: float = Field(..., ge=0.0, le=1.0)
    question_type: str  # MCQ, SHORT, LONG, DIAGRAM, CODE, MATH
    question_text: str
    model_answer: str
    rubric_json: Dict[str, Any]
    expected_time_seconds: int = 300

class QuestionResponse(QuestionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    created_by: Optional[str] = None

class QuestionFilter(BaseModel):
    subject: Optional[str] = None
    chapter: Optional[str] = None
    bloom_level: Optional[str] = None
    question_type: Optional[str] = None
