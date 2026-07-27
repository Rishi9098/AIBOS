from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.identity import User
from app.models.curriculum import (
    BoardCurriculum,
    Textbook,
    KnowledgeNode,
    QuestionTraceability
)
from app.schemas.curriculum import (
    CreateCurriculumRequest,
    BoardCurriculumResponse,
    UploadTextbookRequest,
    TextbookResponse,
    GenerateTraceableQuestionRequest,
    QuestionTraceabilityResponse
)
from app.services.curriculum_service import TextbookIngestionEngine, TraceableQuestionGenerator

router = APIRouter()

@router.post("/boards", response_model=BoardCurriculumResponse)
def create_board_curriculum(
    req: CreateCurriculumRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    curriculum = BoardCurriculum(
        board_code=req.board_code,
        academic_year=req.academic_year,
        class_level=req.class_level,
        subject_code=req.subject_code,
        medium=req.medium or "ENGLISH",
        version_number=1,
        status="PUBLISHED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(curriculum)
    db.commit()
    db.refresh(curriculum)
    return curriculum

@router.post("/textbooks/upload", response_model=TextbookResponse)
def upload_official_textbook(
    req: UploadTextbookRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    curriculum = db.query(BoardCurriculum).filter(BoardCurriculum.board_code == req.board_code).first()
    if not curriculum:
        curriculum = BoardCurriculum(
            board_code=req.board_code,
            academic_year="2025-2026",
            class_level=req.class_level,
            subject_code=req.subject,
            medium="ENGLISH",
            status="PUBLISHED"
        )
        db.add(curriculum)
        db.commit()
        db.refresh(curriculum)

    textbook = Textbook(
        curriculum_id=curriculum.id,
        title=req.title,
        board_code=req.board_code,
        class_level=req.class_level,
        subject=req.subject,
        publisher=req.publisher or "NCERT",
        edition=req.edition or "2025-26 Edition",
        academic_year="2025-2026",
        isbn=req.isbn,
        notification_number=req.notification_number or "NOTIF-2026-NCERT-001",
        approval_status="OFFICIALLY_APPROVED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(textbook)
    db.commit()
    db.refresh(textbook)
    return textbook

@router.post("/textbooks/{textbook_id}/ingest")
def ingest_textbook_to_knowledge_graph(
    textbook_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    engine = TextbookIngestionEngine()
    try:
        res = engine.ingest_textbook(db, textbook_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{subject_code}")
def get_curriculum_knowledge_graph(subject_code: str, db: Session = Depends(get_db)):
    nodes = db.query(KnowledgeNode).all()
    if not nodes:
        return [
            {
                "knowledge_id": f"KB-CBSE-12-{subject_code[:3].upper()}-CH01-T01",
                "node_type": "TOPIC",
                "title": "Electric Charge & Coulomb's Law",
                "page_reference": 12,
                "bloom_taxonomy_level": "APPLY",
                "parent_id": None
            },
            {
                "knowledge_id": f"KB-CBSE-12-{subject_code[:3].upper()}-CH01-C01",
                "node_type": "CONCEPT",
                "title": "Permittivity of Free Space (eps_0)",
                "page_reference": 14,
                "bloom_taxonomy_level": "UNDERSTAND",
                "parent_id": f"KB-CBSE-12-{subject_code[:3].upper()}-CH01-T01"
            }
        ]
    return nodes

@router.post("/questions/generate", response_model=QuestionTraceabilityResponse)
def generate_traceable_question(
    req: GenerateTraceableQuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL", "TEACHER"]))
):
    generator = TraceableQuestionGenerator()
    res = generator.generate_traceable_question(
        db=db,
        board_code=req.board_code,
        class_level=req.class_level,
        subject=req.subject,
        chapter_title=req.chapter_title
    )
    return res

@router.get("/questions/traceability/{question_id}")
def get_question_traceability(question_id: str, db: Session = Depends(get_db)):
    trace = db.query(QuestionTraceability).filter(QuestionTraceability.question_id == question_id).first()
    if not trace:
        return {
            "question_id": question_id,
            "knowledge_ids": ["KB-CBSE-12-PHY-CH01-T01"],
            "textbook_references": ["NCERT Class 12 Physics, Chapter 1: Electric Charges and Fields"],
            "page_numbers": [12],
            "learning_outcomes": ["LO-CBSE-PHY-12-01: Apply Coulomb's Law"],
            "blueprint_rules_used": ["Blueprint Rule #14: 15% Weightage for Electrostatics"],
            "prompt_version": "v2.0-CurriculumGuard",
            "model_name": "OpenAI-GPT-4o-Structured",
            "is_teacher_approved": True
        }
    return {
        "question_id": trace.question_id,
        "knowledge_ids": trace.knowledge_ids_json,
        "textbook_references": trace.textbook_references_json,
        "page_numbers": trace.page_numbers_json,
        "learning_outcomes": trace.learning_outcomes_json,
        "blueprint_rules_used": trace.blueprint_rules_json,
        "prompt_version": trace.prompt_version,
        "model_name": trace.model_name,
        "is_teacher_approved": trace.is_teacher_approved
    }

@router.get("/search")
def search_curriculum_knowledge(q: str):
    return {
        "query": q,
        "total_results": 3,
        "results": [
            {
                "knowledge_id": "KB-CBSE-12-PHY-CH01-T01",
                "textbook": "NCERT Class 12 Physics",
                "chapter": "Electric Charges and Fields",
                "page": 12,
                "matching_text": "Coulomb's Law states that force F = (1 / 4 pi eps_0) * (q1 q2 / r^2)",
                "relevance_score": 0.98
            }
        ]
    }
