import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_aibos.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_root_status():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "OPERATIONAL"

def test_user_registration_and_login():
    # Register Super Admin
    reg_res = client.post("/api/v1/auth/register", json={
        "username": "admin_test",
        "email": "admin@aibos.org",
        "password": "Password123!",
        "role": "SUPER_ADMIN"
    })
    assert reg_res.status_code == 200
    assert reg_res.json()["username"] == "admin_test"

    # Login
    login_res = client.post("/api/v1/auth/login", data={
        "username": "admin_test",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Verify Profile /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "SUPER_ADMIN"

def test_question_bank_flow():
    # Register Teacher
    client.post("/api/v1/auth/register", json={
        "username": "teacher_math",
        "email": "math@board.org",
        "password": "TeacherPassword123!",
        "role": "TEACHER"
    })

    # Login
    login_res = client.post("/api/v1/auth/login", data={
        "username": "teacher_math",
        "password": "TeacherPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Question
    question_res = client.post("/api/v1/questions/", json={
        "subject": "Mathematics",
        "chapter": "Calculus",
        "topic": "Integration",
        "bloom_level": "Apply",
        "difficulty_score": 0.7,
        "question_type": "MATH",
        "question_text": "Evaluate the integral: $\\int_0^{\\pi} \\sin(x) dx$",
        "model_answer": "Step 1: Anti-derivative is $-\\cos(x)$. Step 2: Evaluation gives 2.",
        "rubric_json": {"step1": 1, "step2": 1, "final_answer": 2},
        "expected_time_seconds": 300
    }, headers=headers)
    assert question_res.status_code == 200
    question_data = question_res.json()
    assert question_data["subject"] == "Mathematics"

    # List Questions
    list_res = client.get("/api/v1/questions/?subject=Mathematics", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
