from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.identity import User
from app.models.observability import (
    AIModelRegistry,
    FeatureFlag,
    PilotSchoolOnboarding
)
from app.schemas.ops import (
    AIModelRegistryCreate,
    AIModelRegistryResponse,
    FeatureFlagCreate,
    FeatureFlagToggleRequest,
    FeatureFlagResponse,
    PilotSchoolOnboardingCreate,
    PilotSchoolOnboardingResponse
)

router = APIRouter()

# ----------------------------------------------------
# 1. AI MODEL REGISTRY ENDPOINTS
# ----------------------------------------------------
@router.get("/models", response_model=List[AIModelRegistryResponse])
def list_ai_models(db: Session = Depends(get_db)):
    models = db.query(AIModelRegistry).order_by(AIModelRegistry.deployment_date.desc()).all()
    if not models:
        # Default seeding for initial readiness
        default_model = AIModelRegistry(
            model_name="Gemini-1.5-Pro-Structured",
            provider="Google",
            version="v1.5",
            status="ACTIVE"
        )
        db.add(default_model)
        db.commit()
        db.refresh(default_model)
        return [default_model]
    return models

@router.post("/models", response_model=AIModelRegistryResponse)
def register_ai_model(
    model_in: AIModelRegistryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    model = AIModelRegistry(**model_in.dict(), status="ACTIVE")
    db.add(model)
    db.commit()
    db.refresh(model)
    return model

# ----------------------------------------------------
# 2. FEATURE FLAGS ENGINE ENDPOINTS
# ----------------------------------------------------
@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
def list_feature_flags(db: Session = Depends(get_db)):
    flags = db.query(FeatureFlag).all()
    if not flags:
        default_flags = [
            FeatureFlag(flag_key="OCR_ENABLED", flag_name="Multimodal OCR Processing Engine", is_enabled=True),
            FeatureFlag(flag_key="AI_EVALUATION_ENABLED", flag_name="AI Evaluation Platform Pipeline", is_enabled=True),
            FeatureFlag(flag_key="TEACHER_OVERRIDE_ENABLED", flag_name="Teacher Review & Override Console", is_enabled=True),
            FeatureFlag(flag_key="MULTIMODAL_ENABLED", flag_name="Unified Multimodal Normalization", is_enabled=True)
        ]
        db.add_all(default_flags)
        db.commit()
        return default_flags
    return flags

@router.post("/feature-flags/toggle", response_model=FeatureFlagResponse)
def toggle_feature_flag(
    req: FeatureFlagToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    flag = db.query(FeatureFlag).filter(FeatureFlag.flag_key == req.flag_key).first()
    if not flag:
        flag = FeatureFlag(
            flag_key=req.flag_key,
            flag_name=req.flag_key,
            is_enabled=req.is_enabled
        )
        db.add(flag)
    else:
        flag.is_enabled = req.is_enabled

    db.commit()
    db.refresh(flag)
    return flag

# ----------------------------------------------------
# 3. PILOT SCHOOL ONBOARDING ENDPOINTS
# ----------------------------------------------------
@router.get("/pilots", response_model=List[PilotSchoolOnboardingResponse])
def list_pilot_schools(db: Session = Depends(get_db)):
    return db.query(PilotSchoolOnboarding).order_by(PilotSchoolOnboarding.created_at.desc()).all()

@router.post("/pilots/onboard", response_model=PilotSchoolOnboardingResponse)
def onboard_pilot_school(
    pilot_in: PilotSchoolOnboardingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    pilot = PilotSchoolOnboarding(**pilot_in.dict(), pilot_status="LIVE")
    db.add(pilot)
    db.commit()
    db.refresh(pilot)
    return pilot
