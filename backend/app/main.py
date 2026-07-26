from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, questions, exams

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

@app.get("/")
def root_status():
    return {
        "system": "AI Board Examination Operating System (AIBOS)",
        "version": "1.0.0-milestone1",
        "status": "OPERATIONAL"
    }
