from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.identity import User
from app.models.rules_and_blueprints import (
    BoardProfile,
    AcademicSession,
    ExamRules,
    ExamBlueprint,
    BlueprintVersion,
    ExamSection,
    QuestionStateTransition,
    ExamWorkflowHistory
)
from app.schemas.rules_and_blueprints import (
    BoardProfileCreate,
    BoardProfileResponse,
    ExamRulesCreate,
    ExamRulesResponse,
    ExamBlueprintCreate,
    ExamBlueprintResponse,
    BlueprintApprovalSchema,
    ExamSectionCreate,
    ExamSectionResponse,
    WorkflowTransitionSchema
)

router = APIRouter()

# ----------------------------------------------------
# 1. BOARD PROFILE ENDPOINTS
# ----------------------------------------------------
@router.post("/boards", response_model=BoardProfileResponse)
def create_board_profile(
    board_in: BoardProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    existing = db.query(BoardProfile).filter(BoardProfile.board_code == board_in.board_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Board code already registered")

    board = BoardProfile(**board_in.dict())
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.get("/boards", response_model=List[BoardProfileResponse])
def list_board_profiles(db: Session = Depends(get_db)):
    return db.query(BoardProfile).all()

# ----------------------------------------------------
# 2. EXAM RULES ENGINE ENDPOINTS
# ----------------------------------------------------
@router.post("/rules", response_model=ExamRulesResponse)
def create_or_update_exam_rules(
    rules_in: ExamRulesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    existing = db.query(ExamRules).filter(ExamRules.rule_code == rules_in.rule_code).first()
    if existing:
        for key, value in rules_in.dict().items():
            setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    rules = ExamRules(**rules_in.dict())
    db.add(rules)
    db.commit()
    db.refresh(rules)
    return rules

@router.get("/rules/{board_id}", response_model=List[ExamRulesResponse])
def get_rules_by_board(board_id: str, db: Session = Depends(get_db)):
    return db.query(ExamRules).filter(ExamRules.board_id == board_id).all()

@router.post("/rules/validate")
def validate_rules_consistency(rules_in: ExamRulesCreate):
    errors = []
    if rules_in.duration_minutes <= 0:
        errors.append("Exam duration must be greater than 0 minutes")
    if rules_in.passing_marks > rules_in.total_marks:
        errors.append("Passing marks cannot exceed total marks")
    if rules_in.negative_marking_enabled and (rules_in.negative_marking_ratio < 0 or rules_in.negative_marking_ratio > 1):
        errors.append("Negative marking ratio must be between 0.0 and 1.0")

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "checked_at": datetime.utcnow().isoformat()
    }

# ----------------------------------------------------
# 3. BLUEPRINT ENGINE ENDPOINTS
# ----------------------------------------------------
@router.post("/blueprints", response_model=ExamBlueprintResponse)
def create_blueprint(
    bp_in: ExamBlueprintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    existing = db.query(ExamBlueprint).filter(ExamBlueprint.blueprint_code == bp_in.blueprint_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Blueprint code already exists")

    bp = ExamBlueprint(**bp_in.dict())
    db.add(bp)
    db.commit()
    db.refresh(bp)

    # Save initial version snapshot
    version = BlueprintVersion(
        blueprint_id=bp.id,
        version_number=1,
        blueprint_snapshot=bp_in.dict(),
        changed_by=current_user.username
    )
    db.add(version)
    db.commit()

    return bp

@router.get("/blueprints", response_model=List[ExamBlueprintResponse])
def list_blueprints(board_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ExamBlueprint)
    if board_id:
        query = query.filter(ExamBlueprint.board_id == board_id)
    return query.all()

@router.post("/blueprints/{blueprint_id}/approve", response_model=ExamBlueprintResponse)
def approve_blueprint(
    blueprint_id: str,
    approval: BlueprintApprovalSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    bp = db.query(ExamBlueprint).filter(ExamBlueprint.id == blueprint_id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="Blueprint not found")

    bp.status = approval.status
    bp.approved_by = approval.approved_by
    bp.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(bp)
    return bp

@router.post("/blueprints/validate")
def validate_blueprint_consistency(bp_in: ExamBlueprintCreate):
    errors = []
    if bp_in.total_marks <= 0:
        errors.append("Total marks must be greater than 0")
    if bp_in.total_questions <= 0:
        errors.append("Total questions must be greater than 0")

    # Difficulty sum validation
    diff = bp_in.difficulty_distribution or {}
    total_diff = sum(diff.values()) if diff else 1.0
    if abs(total_diff - 1.0) > 0.05 and diff:
        errors.append(f"Difficulty distribution proportions must sum to 1.0 (currently {total_diff})")

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "blueprint_code": bp_in.blueprint_code,
        "checked_at": datetime.utcnow().isoformat()
    }

# ----------------------------------------------------
# 4. EXAM SECTIONS ENDPOINTS
# ----------------------------------------------------
@router.post("/sections", response_model=ExamSectionResponse)
def create_section(
    section_in: ExamSectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL", "TEACHER"]))
):
    section = ExamSection(**section_in.dict())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section

@router.get("/sections/{blueprint_id}", response_model=List[ExamSectionResponse])
def get_sections_by_blueprint(blueprint_id: str, db: Session = Depends(get_db)):
    return db.query(ExamSection).filter(ExamSection.blueprint_id == blueprint_id).order_by(ExamSection.section_order).all()

# ----------------------------------------------------
# 5. WORKFLOW ENGINE ENDPOINTS
# ----------------------------------------------------
VALID_WORKFLOW_STATES = [
    "SCHEDULED", "PUBLISHED", "OPEN", "IDENTITY_VERIFICATION",
    "READY", "STARTED", "PAUSED", "RESUMED", "WARNING",
    "COMPLETED", "SUBMITTED", "LOCKED", "EVALUATION_PENDING",
    "EVALUATION_COMPLETE", "PUBLISHED"
]

@router.post("/workflow/transition")
def transition_exam_workflow(
    transition_in: WorkflowTransitionSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if transition_in.target_state not in VALID_WORKFLOW_STATES:
        raise HTTPException(status_code=400, detail=f"Invalid target state {transition_in.target_state}")

    # Fetch last workflow history item
    last_item = db.query(ExamWorkflowHistory).filter(ExamWorkflowHistory.exam_id == transition_in.exam_id).order_by(ExamWorkflowHistory.timestamp.desc()).first()
    from_state = last_item.to_state if last_item else "SCHEDULED"

    history = ExamWorkflowHistory(
        exam_id=transition_in.exam_id,
        from_state=from_state,
        to_state=transition_in.target_state,
        transition_by=transition_in.transition_by,
        audit_details={"reason": transition_in.reason, "user": current_user.username}
    )
    db.add(history)
    db.commit()

    return {
        "exam_id": transition_in.exam_id,
        "previous_state": from_state,
        "current_state": transition_in.target_state,
        "transitioned_at": datetime.utcnow().isoformat()
    }

@router.get("/workflow/history/{exam_id}")
def get_workflow_history(exam_id: str, db: Session = Depends(get_db)):
    return db.query(ExamWorkflowHistory).filter(ExamWorkflowHistory.exam_id == exam_id).order_by(ExamWorkflowHistory.timestamp.asc()).all()
