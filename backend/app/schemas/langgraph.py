from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ExecuteWorkflowRequest(BaseModel):
    question_id: str
    question_text: str
    student_answer: str
    workflow_name: Optional[str] = "AIBOS_MASTER_EVALUATION_DAG"
    pause_for_human_override: Optional[bool] = False

class AgentRunResponse(BaseModel):
    id: str
    agent_name: str
    prompt_version: str
    model_name: str
    confidence_score: float
    latency_ms: float
    token_count: int
    cost: float
    status: str
    executed_at: datetime

    class Config:
        from_attributes = True

class GraphExecutionResponse(BaseModel):
    id: str
    workflow_name: str
    status: str
    current_node: str
    state_json: Dict[str, Any]
    total_latency_ms: float
    total_tokens: int
    total_cost: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeWorkflowRequest(BaseModel):
    teacher_override_score: Optional[float] = None
    approval_notes: Optional[str] = "Teacher approved graph execution"

class BenchmarkMetricsResponse(BaseModel):
    single_agent_accuracy: float
    multi_agent_accuracy: float
    single_agent_latency_ms: float
    multi_agent_latency_ms: float
    human_agreement_percentage: float
    cost_per_evaluation_usd: float
