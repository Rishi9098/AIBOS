from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# AI Model Registry Schemas
class AIModelRegistryCreate(BaseModel):
    model_name: str
    provider: str
    version: str
    prompt_version: Optional[str] = "v1.0"
    rubric_version: Optional[str] = "v1.0"
    accuracy_score: Optional[float] = 0.95
    mean_latency_ms: Optional[float] = 240.0
    cost_per_eval: Optional[float] = 0.002

class AIModelRegistryResponse(AIModelRegistryCreate):
    id: str
    status: str
    deployment_date: datetime

    class Config:
        from_attributes = True


# Feature Flag Schemas
class FeatureFlagCreate(BaseModel):
    flag_key: str
    flag_name: str
    is_enabled: bool = True
    description: Optional[str] = None

class FeatureFlagToggleRequest(BaseModel):
    flag_key: str
    is_enabled: bool

class FeatureFlagResponse(FeatureFlagCreate):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True


# Pilot School Onboarding Schemas
class PilotSchoolOnboardingCreate(BaseModel):
    school_name: str
    board_code: str
    city: str
    state: str
    student_count: Optional[int] = 500
    teacher_count: Optional[int] = 30

class PilotSchoolOnboardingResponse(PilotSchoolOnboardingCreate):
    id: str
    pilot_status: str
    created_at: datetime

    class Config:
        from_attributes = True
