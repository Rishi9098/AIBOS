import pytest
import io
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

def setup_teacher_headers():
    client.post("/api/v1/auth/register", json={
        "username": "ocr_teacher",
        "email": "ocr@board.gov.in",
        "password": "TeacherPassword123!",
        "role": "TEACHER"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "ocr_teacher",
        "password": "TeacherPassword123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_multimodal_upload_processing_and_normalization():
    headers = setup_teacher_headers()

    # 1. Upload Scanned Document Sheet
    fake_file = io.BytesIO(b"Fake scanned PDF content for testing")
    upload_res = client.post("/api/v1/multimodal/upload", files={
        "file": ("answer_sheet_01.pdf", fake_file, "application/pdf")
    })
    assert upload_res.status_code == 200
    doc_data = upload_res.json()
    assert doc_data["file_name"] == "answer_sheet_01.pdf"
    doc_id = doc_data["id"]

    # 2. Process Multimodal Document OCR & Layout Analysis
    proc_res = client.post(f"/api/v1/multimodal/process/{doc_id}")
    assert proc_res.status_code == 200
    norm_data = proc_res.json()
    assert "unified_payload" in norm_data
    payload = norm_data["unified_payload"]
    assert "cleaned_text" in payload
    assert "latex_formulas" in payload
    assert "diagrams" in payload
    assert payload["confidence_summary"] >= 0.85

    # 3. Retrieve OCR Regions
    ocr_res = client.get(f"/api/v1/multimodal/ocr/{doc_id}")
    assert ocr_res.status_code == 200
    ocr_list = ocr_res.json()
    assert len(ocr_list) > 0
    region_id = ocr_list[0]["regions"][0]["id"]

    # 4. Teacher OCR Correction
    corr_res = client.post(f"/api/v1/multimodal/correct/{region_id}", json={
        "corrected_text": "Corrected Full Wave Bridge Rectifier handwriting text"
    }, headers=headers)
    assert corr_res.status_code == 200
    assert corr_res.json()["raw_text"] == "Corrected Full Wave Bridge Rectifier handwriting text"
    assert corr_res.json()["confidence_score"] == 1.0
