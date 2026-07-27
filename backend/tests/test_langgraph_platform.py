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
        "username": "agent_admin",
        "email": "agents@board.gov.in",
        "password": "AdminPassword123!",
        "role": "SUPER_ADMIN"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": "agent_admin",
        "password": "AdminPassword123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_langgraph_workflow_execution_and_resumption():
    headers = setup_admin_headers()

    # 1. Execute Multi-Agent Workflow
    exec_res = client.post("/api/v1/langgraph/execute", json={
        "question_id": "q_101",
        "question_text": "Calculate Electric Field E = 1/(4 pi eps_0) * Q / r^2 for point charge",
        "student_answer": "E = 9x10^9 * 2x10^-6 / 0.0025 = 7.2x10^6 N/C",
        "workflow_name": "AIBOS_MASTER_EVALUATION_DAG",
        "pause_for_human_override": False
    }, headers=headers)
    assert exec_res.status_code == 200
    graph_data = exec_res.json()
    assert graph_data["status"] == "COMPLETED"
    assert graph_data["total_latency_ms"] > 0
    assert "agent_history" in graph_data["state_json"]

    # 2. Execute Pause for Human Approval Checkpoint
    pause_res = client.post("/api/v1/langgraph/execute", json={
        "question_id": "q_102",
        "question_text": "Draw vector diagram of electric flux",
        "student_answer": "Diagram drawn on sheet",
        "pause_for_human_override": True
    }, headers=headers)
    assert pause_res.status_code == 200
    paused_data = pause_res.json()
    assert paused_data["status"] == "PAUSED_FOR_HUMAN"

    # 3. Resume Paused Workflow
    resume_res = client.post(f"/api/v1/langgraph/executions/{paused_data['id']}/resume", json={
        "teacher_override_score": 5.0,
        "approval_notes": "Approved diagram accuracy"
    }, headers=headers)
    assert resume_res.status_code == 200
    assert resume_res.json()["status"] == "COMPLETED"

def test_langgraph_templates_prompts_and_benchmarks():
    headers = setup_admin_headers()

    # Templates
    tpl_res = client.get("/api/v1/langgraph/templates", headers=headers)
    assert tpl_res.status_code == 200
    assert len(tpl_res.json()) > 0

    # Prompts
    prompt_res = client.get("/api/v1/langgraph/prompts", headers=headers)
    assert prompt_res.status_code == 200
    assert len(prompt_res.json()) > 0

    # Benchmark
    bench_res = client.get("/api/v1/langgraph/benchmark", headers=headers)
    assert bench_res.status_code == 200
    assert bench_res.json()["multi_agent_accuracy"] == 0.968
