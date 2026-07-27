import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models

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

def setup_test_data():
    client.post("/api/v1/auth/register", json={
        "username": "eval_teacher",
        "email": "teacher@board.gov.in",
        "password": "TeacherPassword123!",
        "role": "TEACHER"
    })

    login_res = client.post("/api/v1/auth/login", data={
        "username": "eval_teacher",
        "password": "TeacherPassword123!"
    }).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    q_res = client.post("/api/v1/questions/", json={
        "subject": "Physics",
        "chapter": "Optics",
        "bloom_level": "Apply",
        "difficulty_score": 0.5,
        "question_type": "SHORT",
        "question_text": "State Snell's Law of Refraction.",
        "model_answer": "Snell's Law states n1 sin(i) = n2 sin(r). Ratio of sines is constant.",
        "rubric_json": {},
        "expected_time_seconds": 120
    }, headers=headers).json()

    rubric_res = client.post("/api/v1/evaluation/rubrics", json={
        "question_id": q_res["id"],
        "model_answer": "Snell's Law states n1 sin(i) = n2 sin(r). Ratio of sines is constant.",
        "expected_concepts": ["Snell's Law", "Refractive Index ratio", "sin(i)", "sin(r)"],
        "keywords": ["sin", "constant", "refraction", "angle"],
        "mandatory_points": ["Formula n1 sin(i) = n2 sin(r)"],
        "mark_distribution": {"formula": 2.5, "statement": 2.5}
    }, headers=headers).json()

    return q_res["id"], rubric_res["id"], headers

def test_ai_evaluation_pipeline_and_evidence():
    q_id, rubric_id, headers = setup_test_data()

    eval_res = client.post("/api/v1/evaluation/evaluate", json={
        "submission_id": "sub_test_101",
        "question_id": q_id,
        "student_answer": "Snell's Law states ratio of sin(i) to sin(r) is constant and n1 sin(i) = n2 sin(r).",
        "allocated_marks": 5.0
    })
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["awarded_marks"] > 0.0
    assert data["confidence_score"] >= 0.70
    assert "evidence" in data
    assert len(data["evidence"]["matched_concepts"]) > 0
    eval_id = data["id"]

    mod_res = client.get("/api/v1/evaluation/moderation-queue/list")
    assert mod_res.status_code == 200

    override_res = client.post(f"/api/v1/evaluation/{eval_id}/override", json={
        "overridden_marks": 4.5,
        "teacher_comments": "Granted credit for clear formula and law statement.",
        "override_reason": "Manual teacher review adjustment"
    }, headers=headers)
    assert override_res.status_code == 200
    assert override_res.json()["awarded_marks"] == 4.5
    assert override_res.json()["moderation_status"] == "OVERRIDDEN"

    hist_res = client.get(f"/api/v1/evaluation/history/{eval_id}")
    assert hist_res.status_code == 200
    history_items = hist_res.json()
    assert len(history_items) >= 2
