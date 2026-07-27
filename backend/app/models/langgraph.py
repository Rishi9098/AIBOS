import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class GraphExecution(Base):
    __tablename__ = "graph_executions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_name = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="RUNNING")  # PENDING, RUNNING, PAUSED_FOR_HUMAN, COMPLETED, FAILED
    current_node = Column(String(100), default="START")
    state_json = Column(JSON, nullable=False, default=dict)
    
    total_latency_ms = Column(Float, default=0.0)
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    agent_runs = relationship("AgentRun", back_populates="graph_execution", cascade="all, delete-orphan")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    graph_execution_id = Column(String(36), ForeignKey("graph_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False, index=True)
    prompt_version = Column(String(50), default="v1.0")
    model_name = Column(String(100), default="OpenAI-GPT-4o-Structured")
    
    inputs_json = Column(JSON, nullable=True)
    outputs_json = Column(JSON, nullable=True)
    confidence_score = Column(Float, default=0.95)
    
    latency_ms = Column(Float, default=0.0)
    token_count = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED, RETRIED
    error_message = Column(Text, nullable=True)
    
    executed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    graph_execution = relationship("GraphExecution", back_populates="agent_runs")


class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    dag_nodes_json = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_name = Column(String(100), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    system_prompt = Column(Text, nullable=False)
    user_template = Column(Text, nullable=False)
    is_default = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
