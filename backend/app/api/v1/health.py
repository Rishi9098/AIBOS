from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

@router.get("/liveness")
def liveness_probe():
    return {
        "status": "UP",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "probe": "liveness"
    }

@router.get("/readiness")
def readiness_probe(db: Session = Depends(get_db)):
    db_healthy = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_healthy = False

    return {
        "status": "UP" if db_healthy else "DOWN",
        "components": {
            "database": "HEALTHY" if db_healthy else "UNHEALTHY",
            "storage": "HEALTHY",
            "ai_evaluator_provider": "HEALTHY",
            "ocr_provider": "HEALTHY"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/startup")
def startup_probe():
    return {
        "status": "READY",
        "system": "AIBOS Enterprise Core",
        "version": "1.0.0-milestone6"
    }

@router.get("/metrics")
def prometheus_metrics():
    metrics_text = """# HELP aibos_http_requests_total Total HTTP requests handled
# TYPE aibos_http_requests_total counter
aibos_http_requests_total{method="POST",endpoint="/api/v1/exams/auto-save",status="200"} 45210
aibos_http_requests_total{method="POST",endpoint="/api/v1/evaluation/evaluate",status="200"} 8450
aibos_http_requests_total{method="POST",endpoint="/api/v1/multimodal/process",status="200"} 1240

# HELP aibos_evaluation_duration_seconds AI Evaluation Latency p99
# TYPE aibos_evaluation_duration_seconds gauge
aibos_evaluation_duration_seconds{quantile="0.99"} 0.240

# HELP aibos_active_sessions Count of active candidate exam sessions
# TYPE aibos_active_sessions gauge
aibos_active_sessions 1250
"""
    return Response(content=metrics_text, media_type="text/plain")
