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
        "username": "curriculum_admin",
        "email": "curriculum@board.gov.in",
        "password": "AdminPassword123!",
        "role": "SUPER_ADMIN"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "curriculum_admin",
        "password": "AdminPassword123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_board_curriculum_and_textbook_ingestion():
    headers = setup_admin_headers()

    # 1. Create Board Curriculum
    curr_res = client.post("/api/v1/curriculum/boards", json={
        "board_code": "CBSE",
        "academic_year": "2025-2026",
        "class_level": "12",
        "subject_code": "Physics",
        "medium": "ENGLISH"
    }, headers=headers)
    assert curr_res.status_code == 200
    assert curr_res.json()["board_code"] == "CBSE"

    # 2. Upload Official Textbook
    tb_res = client.post("/api/v1/curriculum/textbooks/upload", json={
        "title": "NCERT Class 12 Physics Part I",
        "board_code": "CBSE",
        "class_level": "12",
        "subject": "Physics",
        "publisher": "NCERT"
    }, headers=headers)
    assert tb_res.status_code == 200
    tb_data = tb_res.json()
    assert tb_data["approval_status"] == "OFFICIALLY_APPROVED"

    # 3. Trigger Ingestion & Knowledge Graph Construction
    ingest_res = client.post(f"/api/v1/curriculum/textbooks/{tb_data['id']}/ingest", headers=headers)
    assert ingest_res.status_code == 200
    assert ingest_res.json()["status"] == "INGESTION_COMPLETED"

def test_traceable_question_generation_and_verification():
    headers = setup_admin_headers()

    # 1. Generate Traceable Question
    gen_res = client.post("/api/v1/curriculum/questions/generate", json={
        "board_code": "CBSE",
        "class_level": "12",
        "subject": "Physics",
        "chapter_title": "Electric Charges and Fields"
    }, headers=headers)
    assert gen_res.status_code == 200
    q_data = gen_res.json()
    assert "knowledge_id" in q_data
    assert q_data["page_number"] == 12
    assert q_data["status"] == "GENERATED_WITH_100_PCT_TRACEABILITY"

    # 2. Retrieve Immutable Question Traceability Card
    trace_res = client.get(f"/api/v1/curriculum/questions/traceability/{q_data['question_id']}")
    assert trace_res.status_code == 200
    assert trace_res.json()["is_teacher_approved"] is True
    assert len(trace_res.json()["page_numbers"]) > 0

    # 3. Multilingual Curriculum Search
    search_res = client.get("/api/v1/curriculum/search?q=coulomb")
    assert search_res.status_code == 200
    assert search_res.json()["total_results"] > 0
