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
        "username": "result_admin",
        "email": "results@board.gov.in",
        "password": "AdminPassword123!",
        "role": "SUPER_ADMIN"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "result_admin",
        "password": "AdminPassword123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_result_processing_and_moderation():
    headers = setup_admin_headers()

    # 1. Process Result
    proc_res = client.post("/api/v1/results/process/ex_cbse_12", json={
        "submission_id": "sub_101",
        "grace_marks": 2.0
    }, headers=headers)
    assert proc_res.status_code == 200
    res_data = proc_res.json()
    assert res_data["pass_status"] == "PASS"
    assert res_data["grace_marks"] == 2.0
    assert "cgpa" in res_data
    assert "grade" in res_data

    # 2. Result Moderation
    mod_res = client.post("/api/v1/results/moderate", json={
        "result_id": res_data["id"],
        "grace_marks": 3.0,
        "reason": "Out of syllabus question credit"
    }, headers=headers)
    assert mod_res.status_code == 200
    assert mod_res.json()["grace_marks"] == 5.0

def test_digital_certificates_and_public_verification():
    headers = setup_admin_headers()

    # 1. Issue Marksheet & Pass Certificate
    issue_res = client.post("/api/v1/results/certificates/issue?student_id=stu_001&exam_id=ex_cbse_12", headers=headers)
    assert issue_res.status_code == 200
    marksheet = issue_res.json()
    assert "marksheet_number" in marksheet
    assert "digital_signature" in marksheet

    # 2. Public Verification
    verify_res = client.get(f"/api/v1/results/verify/{marksheet['marksheet_number']}")
    assert verify_res.status_code == 200
    assert verify_res.json()["is_valid"] is True
    assert verify_res.json()["details"]["status"] == "VERIFIED_GENUINE"

def test_revaluation_and_analytics():
    headers = setup_admin_headers()

    # 1. Submit Revaluation Request
    reval_res = client.post("/api/v1/results/revaluation/request", json={
        "result_id": "res_default_01",
        "subject": "Physics",
        "fee_paid": 500.0
    }, headers=headers)
    assert reval_res.status_code == 200
    assert reval_res.json()["status"] == "SUBMITTED"

    # 2. Board Analytics
    analytics_res = client.get("/api/v1/results/analytics/ex_cbse_12", headers=headers)
    assert analytics_res.status_code == 200
    assert analytics_res.json()["pass_percentage"] == 94.4
