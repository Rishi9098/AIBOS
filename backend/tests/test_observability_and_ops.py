import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models # Registers all SQLAlchemy models with Base.metadata

from app.main import app as fastapi_app
from app.core.database import Base, get_db

@pytest.fixture(autouse=True)
def setup_database():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    yield
    fastapi_app.dependency_overrides.clear()

client = TestClient(fastapi_app)

def setup_admin_headers():
    client.post("/api/v1/auth/register", json={
        "username": "ops_admin",
        "email": "ops@board.gov.in",
        "password": "AdminPassword123!",
        "role": "SUPER_ADMIN"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "ops_admin",
        "password": "AdminPassword123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_health_probes_and_prometheus_metrics():
    # Liveness
    live_res = client.get("/health/liveness")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "UP"

    # Readiness
    ready_res = client.get("/health/readiness")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "UP"

    # Startup
    start_res = client.get("/health/startup")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "READY"

    # Prometheus Metrics
    metrics_res = client.get("/metrics")
    assert metrics_res.status_code == 200
    assert "aibos_http_requests_total" in metrics_res.text
    assert "aibos_evaluation_duration_seconds" in metrics_res.text

def test_model_registry_feature_flags_and_pilot_onboarding():
    headers = setup_admin_headers()

    # 1. AI Model Registry
    models_res = client.get("/api/v1/ops/models")
    assert models_res.status_code == 200
    assert len(models_res.json()) > 0

    new_model = client.post("/api/v1/ops/models", json={
        "model_name": "OpenAI-GPT-4o-Structured",
        "provider": "OpenAI",
        "version": "v4.0",
        "accuracy_score": 0.96,
        "mean_latency_ms": 180.0
    }, headers=headers)
    assert new_model.status_code == 200
    assert new_model.json()["model_name"] == "OpenAI-GPT-4o-Structured"

    # 2. Feature Flags
    flags_res = client.get("/api/v1/ops/feature-flags")
    assert flags_res.status_code == 200
    assert len(flags_res.json()) > 0

    toggle_res = client.post("/api/v1/ops/feature-flags/toggle", json={
        "flag_key": "OCR_ENABLED",
        "is_enabled": False
    }, headers=headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_enabled"] is False

    # 3. Pilot School Onboarding
    pilot_res = client.post("/api/v1/ops/pilots/onboard", json={
        "school_name": "Government Model Senior Secondary School",
        "board_code": "CBSE_MAIN",
        "city": "Chandigarh",
        "state": "Chandigarh",
        "student_count": 1500,
        "teacher_count": 45
    }, headers=headers)
    assert pilot_res.status_code == 200
    assert pilot_res.json()["school_name"] == "Government Model Senior Secondary School"
    assert pilot_res.json()["pilot_status"] == "LIVE"
