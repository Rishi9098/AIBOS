from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.identity import User
from app.models.evaluation import (
    Rubric,
    RubricVersion,
    EvaluationResult,
    EvaluationEvidence,
    ModerationDecision,
    TeacherOverride,
    EvaluationHistory
)
from app.schemas.evaluation import (
    RubricCreate,
    RubricResponse,
    EvaluateAnswerRequest,
    EvaluationResultResponse,
    TeacherOverrideRequest
)
from app.services.evaluation_pipeline import EvaluationPipeline

router = APIRouter()

# ----------------------------------------------------
# 1. RUBRIC ENGINE ENDPOINTS
# ----------------------------------------------------
@router.post("/rubrics", response_model=RubricResponse)
def create_or_update_rubric(
    rubric_in: RubricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL", "TEACHER"]))
):
    existing = db.query(Rubric).filter(Rubric.question_id == rubric_in.question_id).order_by(Rubric.version_number.desc()).first()
    
    if existing:
        next_ver = existing.version_number + 1
        rubric = Rubric(
            question_id=rubric_in.question_id,
            version_number=next_ver,
            model_answer=rubric_in.model_answer,
            expected_concepts=rubric_in.expected_concepts,
            keywords=rubric_in.keywords,
            mandatory_points=rubric_in.mandatory_points,
            optional_points=rubric_in.optional_points,
            mark_distribution=rubric_in.mark_distribution,
            negative_conditions=rubric_in.negative_conditions,
            formula_requirements=rubric_in.formula_requirements,
            reasoning_expectations=rubric_in.reasoning_expectations,
            partial_marks_rules=rubric_in.partial_marks_rules
        )
        db.add(rubric)
        db.commit()
        db.refresh(rubric)

        # Snapshot version
        version = RubricVersion(
            rubric_id=rubric.id,
            version_number=next_ver,
            rubric_snapshot=rubric_in.dict(),
            changed_by=current_user.username
        )
        db.add(version)
        db.commit()
        return rubric

    rubric = Rubric(**rubric_in.dict(), version_number=1)
    db.add(rubric)
    db.commit()
    db.refresh(rubric)

    version = RubricVersion(
        rubric_id=rubric.id,
        version_number=1,
        rubric_snapshot=rubric_in.dict(),
        changed_by=current_user.username
    )
    db.add(version)
    db.commit()
    return rubric

@router.get("/rubrics/{question_id}", response_model=RubricResponse)
def get_rubric_by_question(question_id: str, db: Session = Depends(get_db)):
    rubric = db.query(Rubric).filter(Rubric.question_id == question_id).order_by(Rubric.version_number.desc()).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found for this question")
    return rubric

# ----------------------------------------------------
# 2. EVALUATION PIPELINE EXECUTION
# ----------------------------------------------------
@router.post("/evaluate", response_model=EvaluationResultResponse)
def evaluate_student_answer(
    req: EvaluateAnswerRequest,
    db: Session = Depends(get_db)
):
    pipeline = EvaluationPipeline(db)
    result = pipeline.execute_pipeline(
        submission_id=req.submission_id,
        question_id=req.question_id,
        student_answer=req.student_answer,
        allocated_marks=req.allocated_marks or 5.0
    )
    return result

@router.get("/moderation-queue/list", response_model=List[EvaluationResultResponse])
def list_moderation_queue(db: Session = Depends(get_db)):
    return db.query(EvaluationResult).filter(
        EvaluationResult.moderation_status.in_(["TEACHER_REVIEW_REQUIRED", "RANDOM_AUDIT"])
    ).order_by(EvaluationResult.confidence_score.asc()).all()

@router.get("/{evaluation_id}", response_model=EvaluationResultResponse)
def get_evaluation_result(evaluation_id: str, db: Session = Depends(get_db)):
    res = db.query(EvaluationResult).filter(EvaluationResult.id == evaluation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Evaluation result not found")
    return res

# ----------------------------------------------------
# 3. TEACHER MARK OVERRIDE & AUDIT LOGGING
# ----------------------------------------------------
@router.post("/{evaluation_id}/override", response_model=EvaluationResultResponse)
def override_evaluation(
    evaluation_id: str,
    override_in: TeacherOverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "TEACHER", "BOARD_OFFICIAL"]))
):
    res = db.query(EvaluationResult).filter(EvaluationResult.id == evaluation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Evaluation result not found")

    original_marks = res.awarded_marks
    res.awarded_marks = override_in.overridden_marks
    res.moderation_status = "OVERRIDDEN"
    res.suggested_teacher_review = False

    # Store Teacher Override Record
    override = TeacherOverride(
        evaluation_id=res.id,
        teacher_id=current_user.id,
        original_ai_marks=original_marks,
        overridden_marks=override_in.overridden_marks,
        teacher_comments=override_in.teacher_comments,
        override_reason=override_in.override_reason,
        overridden_at=datetime.now(timezone.utc)
    )
    db.add(override)

    # Log Immutable Audit History
    hist = EvaluationHistory(
        evaluation_id=res.id,
        action_type="TEACHER_OVERRIDE",
        performed_by=current_user.username,
        snapshot_json={
            "original_marks": original_marks,
            "overridden_marks": override_in.overridden_marks,
            "comments": override_in.teacher_comments
        },
        timestamp=datetime.now(timezone.utc)
    )
    db.add(hist)
    db.commit()
    db.refresh(res)
    return res

@router.get("/history/{evaluation_id}")
def get_evaluation_history(evaluation_id: str, db: Session = Depends(get_db)):
    return db.query(EvaluationHistory).filter(EvaluationHistory.evaluation_id == evaluation_id).order_by(EvaluationHistory.timestamp.asc()).all()
