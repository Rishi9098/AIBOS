import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models

from app.main import app as fastapi_app
from app.core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

fastapi_app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())

client = TestClient(fastapi_app)

def setup_admin_headers():
    admin_res = client.post("/api/v1/auth/register", json={
        "username": "board_admin_rules",
        "email": "rules@board.gov.in",
        "password": "AdminPassword123!",
        "role": "SUPER_ADMIN"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "board_admin_rules",
        "password": "AdminPassword123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_board_profile_and_rules_flow():
    headers = setup_admin_headers()

    # 1. Create Board Profile
    board_res = client.post("/api/v1/rules-blueprints/boards", json={
        "board_code": "CBSE_MAIN",
        "board_name": "Central Board of Secondary Education",
        "country": "India",
        "state": "Delhi",
        "description": "National Board for All India Exams"
    }, headers=headers)
    assert board_res.status_code == 200
    board_data = board_res.json()
    assert board_data["board_code"] == "CBSE_MAIN"
    board_id = board_data["id"]

    # 2. Create Exam Rules Engine Config
    rules_res = client.post("/api/v1/rules-blueprints/rules", json={
        "board_id": board_id,
        "rule_code": "CBSE_12_PHYSICS_RULES",
        "rule_name": "CBSE Class 12 Physics Exam Rules",
        "duration_minutes": 180,
        "total_marks": 100.0,
        "passing_marks": 33.0,
        "negative_marking_enabled": False,
        "calculator_allowed": False,
        "drawing_enabled": True,
        "camera_required": True,
        "pwd_extra_time_ratio": 0.33
    }, headers=headers)
    assert rules_res.status_code == 200
    rules_data = rules_res.json()
    assert rules_data["duration_minutes"] == 180

    # 3. Validate Rules Consistency API
    val_res = client.post("/api/v1/rules-blueprints/rules/validate", json={
        "board_id": board_id,
        "rule_code": "TEST_RULES",
        "rule_name": "Test Rules",
        "duration_minutes": 180,
        "total_marks": 100.0,
        "passing_marks": 33.0
    })
    assert val_res.status_code == 200
    assert val_res.json()["is_valid"] is True

def test_blueprint_engine_and_approval_flow():
    headers = setup_admin_headers()

    board_res = client.post("/api/v1/rules-blueprints/boards", json={
        "board_code": "MP_BOARD",
        "board_name": "Madhya Pradesh Board of Secondary Education",
        "state": "Madhya Pradesh"
    }, headers=headers)
    board_id = board_res.json()["id"]

    # 1. Create Examination Blueprint
    bp_res = client.post("/api/v1/rules-blueprints/blueprints", json={
        "blueprint_code": "MP-12-MATH-2026",
        "title": "Class 12 Higher Mathematics Blueprint",
        "subject": "Mathematics",
        "class_level": "12",
        "board_id": board_id,
        "total_marks": 100.0,
        "total_questions": 30,
        "chapter_weightage": {"Calculus": 40, "Algebra": 30, "Vectors": 30},
        "difficulty_distribution": {"easy": 0.3, "medium": 0.5, "hard": 0.2}
    }, headers=headers)
    assert bp_res.status_code == 200
    bp_data = bp_res.json()
    assert bp_data["status"] == "DRAFT"
    bp_id = bp_data["id"]

    # 2. Approve Blueprint Workflow
    app_res = client.post(f"/api/v1/rules-blueprints/blueprints/{bp_id}/approve", json={
        "approved_by": "Dr. S. Sharma",
        "status": "APPROVED"
    }, headers=headers)
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "APPROVED"

    # 3. Validate Blueprint Consistency API
    val_res = client.post("/api/v1/rules-blueprints/blueprints/validate", json={
        "blueprint_code": "MP-12-MATH-2026",
        "title": "Mathematics Blueprint",
        "subject": "Mathematics",
        "class_level": "12",
        "board_id": board_id,
        "total_marks": 100.0,
        "total_questions": 30,
        "difficulty_distribution": {"easy": 0.3, "medium": 0.5, "hard": 0.2}
    })
    assert val_res.status_code == 200
    assert val_res.json()["is_valid"] is True
