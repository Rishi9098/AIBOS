from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.evaluation import Rubric, EvaluationResult, EvaluationEvidence, ModerationDecision, EvaluationHistory
from app.models.question_bank import QuestionBank
from app.services.subject_plugins import get_subject_evaluator

class EvaluationPipeline:
    def __init__(self, db: Session):
        self.db = db

    def execute_pipeline(
        self,
        submission_id: str,
        question_id: str,
        student_answer: Any,
        allocated_marks: float
    ) -> EvaluationResult:
        """
        Executes the 10-Stage Modular AI Evaluation Pipeline.
        """
        # ---------------------------------------------------------
        # STAGE 1: Input Normalization
        # ---------------------------------------------------------
        normalized_answer = self._stage_1_input_normalization(student_answer)

        # ---------------------------------------------------------
        # STAGE 2: Question Classification
        # ---------------------------------------------------------
        question = self.db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
        subject = question.subject if question else "Physics"
        question_text = question.question_text if question else "Explain the given concept."
        model_answer_text = question.model_answer if question else "Default model answer."

        # ---------------------------------------------------------
        # STAGE 3: Rubric Loading
        # ---------------------------------------------------------
        rubric = self.db.query(Rubric).filter(Rubric.question_id == question_id).order_by(Rubric.version_number.desc()).first()
        rubric_data = {
            "expected_concepts": rubric.expected_concepts if rubric else ["working principle", "diode conduction"],
            "keywords": rubric.keywords if rubric else ["positive half cycle", "negative half cycle", "rectifier"],
            "mandatory_points": rubric.mandatory_points if rubric else [],
            "mark_distribution": rubric.mark_distribution if rubric else {}
        }
        rubric_model_answer = rubric.model_answer if rubric else model_answer_text

        # ---------------------------------------------------------
        # STAGE 4: Knowledge Retrieval (RAG Interface Placeholder)
        # ---------------------------------------------------------
        retrieved_context = self._stage_4_knowledge_retrieval(subject, question_text)

        # ---------------------------------------------------------
        # STAGE 5: Subject-Specific Evaluation Plugin Dispatch
        # ---------------------------------------------------------
        evaluator_plugin = get_subject_evaluator(subject)
        raw_eval_result = evaluator_plugin.evaluate(
            question_text=question_text,
            model_answer=rubric_model_answer,
            student_answer=normalized_answer,
            rubric_data=rubric_data,
            allocated_marks=allocated_marks
        )

        # ---------------------------------------------------------
        # STAGE 6: Reasoning Analysis
        # ---------------------------------------------------------
        reasoning_summary = evaluator_plugin.explain(raw_eval_result)

        # ---------------------------------------------------------
        # STAGE 7: Partial Marking Calculation
        # ---------------------------------------------------------
        awarded_marks = evaluator_plugin.score(raw_eval_result, allocated_marks)

        # ---------------------------------------------------------
        # STAGE 8: Confidence Calculation
        # ---------------------------------------------------------
        confidence_score = evaluator_plugin.return_confidence(raw_eval_result)

        # ---------------------------------------------------------
        # STAGE 9: Evidence Extraction
        # ---------------------------------------------------------
        evidence_data = evaluator_plugin.return_evidence(raw_eval_result)

        # ---------------------------------------------------------
        # STAGE 10: Moderation Decision Routing
        # ---------------------------------------------------------
        moderation_status, suggested_teacher_review = self._stage_10_moderation_decision(confidence_score)

        # ---------------------------------------------------------
        # PERSISTENCE & HISTORY SNAPSHOT
        # ---------------------------------------------------------
        eval_record = EvaluationResult(
            submission_id=submission_id,
            question_id=question_id,
            evaluator_type="AI",
            model_name="AIBOS-Evaluator-Engine-v1.0",
            prompt_version="v1.0",
            rubric_version_id=rubric.id if rubric else None,
            allocated_marks=allocated_marks,
            awarded_marks=awarded_marks,
            confidence_score=confidence_score,
            suggested_teacher_review=suggested_teacher_review,
            moderation_status=moderation_status,
            reasoning_summary=reasoning_summary,
            missing_concepts=raw_eval_result.get("missing_concepts", []),
            strong_concepts=raw_eval_result.get("matched_concepts", []),
            evaluated_at=datetime.now(timezone.utc)
        )
        self.db.add(eval_record)
        self.db.commit()
        self.db.refresh(eval_record)

        # Persist Evidence
        evidence_record = EvaluationEvidence(
            evaluation_id=eval_record.id,
            matched_concepts=raw_eval_result.get("matched_concepts", []),
            matched_keywords=raw_eval_result.get("matched_keywords", []),
            supporting_text_snippets=[normalized_answer[:200]] if normalized_answer else [],
            rubric_references=list(rubric_data.keys()),
            deductions_breakdown=raw_eval_result.get("deductions", {})
        )
        self.db.add(evidence_record)

        # Persist Moderation Decision
        mod_record = ModerationDecision(
            evaluation_id=eval_record.id,
            decision=moderation_status,
            confidence_threshold_used=0.85,
            rule_triggered=f"Confidence = {confidence_score:.2f}",
            decided_at=datetime.now(timezone.utc)
        )
        self.db.add(mod_record)

        # Persist History Log
        hist_record = EvaluationHistory(
            evaluation_id=eval_record.id,
            action_type="INITIAL_EVALUATION",
            performed_by="AI_ENGINE",
            snapshot_json={
                "awarded_marks": awarded_marks,
                "confidence_score": confidence_score,
                "moderation_status": moderation_status
            },
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(hist_record)
        self.db.commit()

        return eval_record

    def _stage_1_input_normalization(self, student_answer: Any) -> str:
        if isinstance(student_answer, dict):
            # Extract text / math / diagram
            text_part = student_answer.get("text", "")
            math_part = student_answer.get("math", "")
            return f"{text_part} {math_part}".strip()
        return str(student_answer or "").strip()

    def _stage_4_knowledge_retrieval(self, subject: str, question_text: str) -> str:
        return f"Standard NCERT / Board reference textbook context for {subject}."

    def _stage_10_moderation_decision(self, confidence_score: float) -> tuple[str, bool]:
        if confidence_score >= 0.85:
            return "AUTO_APPROVED", False
        elif confidence_score >= 0.60:
            return "RANDOM_AUDIT", True
        else:
            return "TEACHER_REVIEW_REQUIRED", True
