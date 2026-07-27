import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.langgraph import GraphExecution, AgentRun
from app.services.langgraph.agents import (
    EvaluationPlannerAgent,
    QuestionClassificationAgent,
    OCRAgent,
    LanguageAgent,
    MathematicsAgent,
    ScienceAgent,
    DiagramAgent,
    RubricAgent,
    EvidenceAgent,
    ConfidenceAgent,
    ModerationAgent,
    ResultValidationAgent,
    AnalyticsAgent
)

class LangGraphOrchestrator:
    def __init__(self):
        self.agents = {
            "Planner": EvaluationPlannerAgent(),
            "Classifier": QuestionClassificationAgent(),
            "OCR": OCRAgent(),
            "Language": LanguageAgent(),
            "Mathematics": MathematicsAgent(),
            "Science": ScienceAgent(),
            "Diagram": DiagramAgent(),
            "Rubric": RubricAgent(),
            "Evidence": EvidenceAgent(),
            "Confidence": ConfidenceAgent(),
            "Moderation": ModerationAgent(),
            "Validation": ResultValidationAgent(),
            "Analytics": AnalyticsAgent()
        }

    def execute_workflow(
        self,
        db: Session,
        question_id: str,
        question_text: str,
        student_answer: str,
        workflow_name: str = "AIBOS_MASTER_EVALUATION_DAG",
        pause_for_human_override: bool = False
    ) -> GraphExecution:
        state: Dict[str, Any] = {
            "question_id": question_id,
            "question_text": question_text,
            "student_answer": student_answer,
            "agent_history": [],
            "status": "RUNNING"
        }

        graph_exec = GraphExecution(
            workflow_name=workflow_name,
            status="RUNNING",
            current_node="START",
            state_json=state,
            created_at=datetime.now(timezone.utc)
        )
        db.add(graph_exec)
        db.commit()
        db.refresh(graph_exec)

        # 1. Planner & Classifier
        state = self.agents["Planner"].execute(state)
        graph_exec.current_node = "QuestionClassificationAgent"
        state = self.agents["Classifier"].execute(state)
        graph_exec.current_node = "OCRAgent"
        state = self.agents["OCR"].execute(state)

        # 2. Conditional Domain Routing
        domain = state.get("question_domain", "MATHEMATICS")
        if domain == "MATHEMATICS":
            graph_exec.current_node = "MathematicsAgent"
            state = self.agents["Mathematics"].execute(state)
        elif domain == "SCIENCE":
            graph_exec.current_node = "ScienceAgent"
            state = self.agents["Science"].execute(state)
        elif domain == "DIAGRAM":
            graph_exec.current_node = "DiagramAgent"
            state = self.agents["Diagram"].execute(state)
        else:
            graph_exec.current_node = "LanguageAgent"
            state = self.agents["Language"].execute(state)

        # 3. Rubric & Evidence
        graph_exec.current_node = "RubricAgent"
        state = self.agents["Rubric"].execute(state)
        graph_exec.current_node = "EvidenceAgent"
        state = self.agents["Evidence"].execute(state)
        graph_exec.current_node = "ConfidenceAgent"
        state = self.agents["Confidence"].execute(state)

        # 4. Human-in-the-Loop Pause Checkpoint if requested or low confidence
        if pause_for_human_override or state.get("requires_human_moderation", False):
            graph_exec.status = "PAUSED_FOR_HUMAN"
            graph_exec.current_node = "HUMAN_APPROVAL_CHECKPOINT"
            graph_exec.state_json = state
            db.commit()
            return graph_exec

        # 5. Moderation, Validation & Analytics
        graph_exec.current_node = "ModerationAgent"
        state = self.agents["Moderation"].execute(state)
        graph_exec.current_node = "ResultValidationAgent"
        state = self.agents["Validation"].execute(state)
        graph_exec.current_node = "AnalyticsAgent"
        state = self.agents["Analytics"].execute(state)

        # Finalize Execution
        total_latency = sum(h["latency_ms"] for h in state.get("agent_history", []))
        total_tokens = sum(h["token_count"] for h in state.get("agent_history", []))
        total_cost = sum(h["cost"] for h in state.get("agent_history", []))

        graph_exec.status = "COMPLETED"
        graph_exec.current_node = "END"
        graph_exec.state_json = state
        graph_exec.total_latency_ms = total_latency
        graph_exec.total_tokens = total_tokens
        graph_exec.total_cost = total_cost
        db.commit()

        # Save individual agent runs to DB for auditing
        for run in state.get("agent_history", []):
            agent_run = AgentRun(
                graph_execution_id=graph_exec.id,
                agent_name=run["agent_name"],
                prompt_version=run["prompt_version"],
                model_name=run["model_name"],
                confidence_score=run["confidence_score"],
                latency_ms=run["latency_ms"],
                token_count=run["token_count"],
                cost=run["cost"],
                status=run["status"],
                executed_at=datetime.now(timezone.utc)
            )
            db.add(agent_run)
        db.commit()

        return graph_exec

    def resume_human_approval(self, db: Session, graph_id: str, teacher_override_score: Optional[float] = None) -> GraphExecution:
        graph_exec = db.query(GraphExecution).filter(GraphExecution.id == graph_id).first()
        if not graph_exec:
            raise ValueError("Graph execution not found")

        state = graph_exec.state_json or {}
        if teacher_override_score is not None:
            state["total_awarded_marks"] = teacher_override_score
            state["teacher_override_applied"] = True

        state = self.agents["Moderation"].execute(state)
        state = self.agents["Validation"].execute(state)
        state = self.agents["Analytics"].execute(state)

        total_latency = sum(h["latency_ms"] for h in state.get("agent_history", []))
        total_tokens = sum(h["token_count"] for h in state.get("agent_history", []))
        total_cost = sum(h["cost"] for h in state.get("agent_history", []))

        graph_exec.status = "COMPLETED"
        graph_exec.current_node = "END"
        graph_exec.state_json = state
        graph_exec.total_latency_ms = total_latency
        graph_exec.total_tokens = total_tokens
        graph_exec.total_cost = total_cost
        db.commit()
        return graph_exec
