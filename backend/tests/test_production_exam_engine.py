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

def setup_test_environment():
    admin_res = client.post("/api/v1/auth/register", json={
        "username": "board_admin",
        "email": "admin@board.gov.in",
        "password": "AdminPassword123!",
        "role": "SUPER_ADMIN"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "board_admin",
        "password": "AdminPassword123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    q_res = client.post("/api/v1/questions/", json={
        "subject": "Physics",
        "chapter": "Optics",
        "bloom_level": "Apply",
        "difficulty_score": 0.5,
        "question_type": "SHORT",
        "question_text": "State Snell's Law of Refraction.",
        "model_answer": "n1 sin(i) = n2 sin(r)",
        "rubric_json": {"correct_formula": 2},
        "expected_time_seconds": 120
    }, headers=headers).json()

    exam_res = client.post("/api/v1/exams/", json={
        "title": "Physics Board Exam 2026",
        "subject": "Physics",
        "total_marks": 5,
        "duration_minutes": 60,
        "start_time": "2026-07-27T00:00:00Z",
        "end_time": "2026-07-27T23:59:59Z",
        "questions": [
            {
                "question_id": q_res["id"],
                "question_order": 1,
                "allocated_marks": 5,
                "section_name": "Section A"
            }
        ]
    }, headers=headers).json()

    student_res = client.post("/api/v1/auth/register-student", json={
        "username": "student_test",
        "email": "student@school.edu",
        "password": "StudentPassword123!",
        "roll_number": "ROLL-2026-001",
        "full_name": "Test Candidate",
        "class_level": "12",
        "section": "A"
    }).json()

    student_token = client.post("/api/v1/auth/login", data={
        "username": "student_test",
        "password": "StudentPassword123!"
    }).json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    return exam_res["id"], q_res["id"], student_headers

def test_production_exam_engine_lifecycle():
    exam_id, question_id, student_headers = setup_test_environment()

    # 1. Start Session / Resume State
    start_res = client.post("/api/v1/exams/session/start", json={"exam_id": exam_id}, headers=student_headers)
    assert start_res.status_code == 200
    session_data = start_res.json()
    assert session_data["exam_id"] == exam_id
    assert session_data["seconds_remaining"] == 3600

    # 2. Auto-Save with Version History Tracking
    save_res_1 = client.post("/api/v1/exams/auto-save", json={
        "exam_id": exam_id,
        "question_id": question_id,
        "answer_data": {"text": "Snell's Law states ratio of sines of angles is constant."},
        "seconds_remaining": 3550,
        "visited_questions": [question_id],
        "flagged_questions": [],
        "skipped_questions": []
    }, headers=student_headers)
    assert save_res_1.status_code == 200
    assert save_res_1.json()["version_number"] == 1

    # Second Auto-Save (Version 2)
    save_res_2 = client.post("/api/v1/exams/auto-save", json={
        "exam_id": exam_id,
        "question_id": question_id,
        "answer_data": {"text": "n1 sin(i) = n2 sin(r). Snell's Law states ratio of sines of angles is constant."},
        "seconds_remaining": 3500,
        "visited_questions": [question_id],
        "flagged_questions": [],
        "skipped_questions": []
    }, headers=student_headers)
    assert save_res_2.status_code == 200
    assert save_res_2.json()["version_number"] == 2

    # 3. Batch Offline Sync Test
    sync_res = client.post("/api/v1/exams/sync-offline", json={
        "exam_id": exam_id,
        "queued_changes": [
            {
                "question_id": question_id,
                "answer_data": {"text": "Final answer with offline sync."},
                "timestamp": "2026-07-27T01:00:00Z"
            }
        ],
        "activity_logs": [
            {"event_type": "NETWORK_OFFLINE", "event_details": {"reason": "Network disconnected"}}
        ]
    }, headers=student_headers)
    assert sync_res.status_code == 200
    assert sync_res.json()["synced_count"] == 1

    # 4. Submission Validation Pre-check
    val_res = client.post("/api/v1/exams/validate-submission", json={
        "exam_id": exam_id,
        "answers": {question_id: {"text": "Final answer"}}
    }, headers=student_headers)
    assert val_res.status_code == 200
    assert val_res.json()["answered_count"] == 1

    # 5. Final Exam Submission & Hash Locking
    sub_res = client.post("/api/v1/exams/submit", json={
        "exam_id": exam_id,
        "answers": {question_id: {"text": "Final answer"}},
        "digital_signature": "ECDSA-P256-TEST-SIGNATURE"
    }, headers=student_headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["status"] == "SUBMITTED"
    assert "hash_chain_checksum" in sub_data
