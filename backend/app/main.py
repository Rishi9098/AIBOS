from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.models import (
    identity,
    question_bank,
    exam,
    rules_and_blueprints,
    evaluation,
    multimodal,
    observability,
    results_and_certificates,
    langgraph,
    curriculum
)
from app.api.v1 import (
    auth,
    questions,
    exams,
    rules_and_blueprints as rules_bp_api,
    evaluation as evaluation_api,
    multimodal as multimodal_api,
    health,
    ops,
    results as results_api,
    langgraph as langgraph_api,
    curriculum as curriculum_api
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
app.include_router(health.router, prefix="/health", tags=["Health & Diagnostics Probes"])
app.include_router(ops.router, prefix=f"{settings.API_V1_STR}/ops", tags=["Operations & Government Pilot Readiness"])
app.include_router(results_api.router, prefix=f"{settings.API_V1_STR}/results", tags=["Results, Certification & Board Management Platform"])
app.include_router(langgraph_api.router, prefix=f"{settings.API_V1_STR}/langgraph", tags=["LangGraph Multi-Agent Intelligence Platform"])
app.include_router(curriculum_api.router, prefix=f"{settings.API_V1_STR}/curriculum", tags=["Curriculum Intelligence & Textbook Knowledge Platform"])

@app.get("/metrics")
def prometheus_metrics():
    return health.prometheus_metrics()

@app.get("/")
def root_status():
    return {
        "system": "AI Board Examination Operating System (AIBOS)",
        "version": "1.0.0-milestone9",
        "status": "OPERATIONAL"
    }
