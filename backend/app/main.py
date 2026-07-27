from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.models import (
    identity,
    question_bank,
    exam,
    rules_and_blueprints,
    evaluation,
    multimodal
)
from app.api.v1 import (
    auth,
    questions,
    exams,
    rules_and_blueprints as rules_bp_api,
    evaluation as evaluation_api,
    multimodal as multimodal_api
)

# Create DB tables if missing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Enterprise AI Board Examination Operating System (AIBOS) Core API Service"
)

# CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth & Identity"])
app.include_router(questions.router, prefix=f"{settings.API_V1_STR}/questions", tags=["Question Bank"])
app.include_router(exams.router, prefix=f"{settings.API_V1_STR}/exams", tags=["Exam Engine"])
app.include_router(rules_bp_api.router, prefix=f"{settings.API_V1_STR}/rules-blueprints", tags=["Rules Engine & Blueprint Engine"])
app.include_router(evaluation_api.router, prefix=f"{settings.API_V1_STR}/evaluation", tags=["AI Evaluation Platform"])
app.include_router(multimodal_api.router, prefix=f"{settings.API_V1_STR}/multimodal", tags=["Unified Multimodal Understanding Platform"])

@app.get("/")
def root_status():
    return {
        "system": "AI Board Examination Operating System (AIBOS)",
        "version": "1.0.0-milestone5",
        "status": "OPERATIONAL"
    }
