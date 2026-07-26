from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.identity import User
from app.models.question_bank import QuestionBank
from app.schemas.question import QuestionCreate, QuestionResponse
from app.api.deps import get_current_user, require_roles

router = APIRouter()

@router.post("/", response_model=QuestionResponse)
def create_question(
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TEACHER", "BOARD_OFFICIAL", "SUPER_ADMIN"]))
):
    question = QuestionBank(
        subject=question_in.subject,
        chapter=question_in.chapter,
        topic=question_in.topic,
        bloom_level=question_in.bloom_level,
        difficulty_score=question_in.difficulty_score,
        question_type=question_in.question_type,
        question_text=question_in.question_text,
        model_answer=question_in.model_answer,
        rubric_json=question_in.rubric_json,
        expected_time_seconds=question_in.expected_time_seconds,
        created_by=current_user.id
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

@router.get("/", response_model=List[QuestionResponse])
def list_questions(
    db: Session = Depends(get_db),
    subject: Optional[str] = Query(None),
    chapter: Optional[str] = Query(None),
    bloom_level: Optional[str] = Query(None),
    question_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    query = db.query(QuestionBank)
    if subject:
        query = query.filter(QuestionBank.subject == subject)
    if chapter:
        query = query.filter(QuestionBank.chapter == chapter)
    if bloom_level:
        query = query.filter(QuestionBank.bloom_level == bloom_level)
    if question_type:
        query = query.filter(QuestionBank.question_type == question_type)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
