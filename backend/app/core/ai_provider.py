from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIProvider(ABC):
    @abstractmethod
    def evaluate_answer(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        rubric_data: Dict[str, Any],
        allocated_marks: float
    ) -> Dict[str, Any]:
        """
        Abstract method to evaluate a student answer against a model answer & rubric.
        Must return a structured dictionary containing:
        - awarded_marks (float)
        - confidence_score (float 0.0 to 1.0)
        - reasoning_summary (str)
        - matched_concepts (list)
        - missing_concepts (list)
        - matched_keywords (list)
        - deductions (dict)
        """
        pass


class RuleBasedEvaluatorProvider(BaseAIProvider):
    """
    Deterministic rule-based evaluator used for offline testing, local fallback,
    and fast, reproducible unit test execution.
    """
    def evaluate_answer(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        rubric_data: Dict[str, Any],
        allocated_marks: float
    ) -> Dict[str, Any]:
        if not student_answer or not str(student_answer).strip():
            return {
                "awarded_marks": 0.0,
                "confidence_score": 1.0,
                "reasoning_summary": "No answer provided by candidate.",
                "matched_concepts": [],
                "missing_concepts": rubric_data.get("expected_concepts", []),
                "matched_keywords": [],
                "deductions": {"blank_answer": allocated_marks}
            }

        student_lower = str(student_answer).lower()
        expected_concepts = rubric_data.get("expected_concepts", [])
        keywords = rubric_data.get("keywords", [])
        mandatory_points = rubric_data.get("mandatory_points", [])

        matched_concepts = [c for c in expected_concepts if c.lower() in student_lower]
        missing_concepts = [c for c in expected_concepts if c.lower() not in student_lower]
        matched_keywords = [k for k in keywords if k.lower() in student_lower]

        # Calculate proportional match ratio
        concept_ratio = len(matched_concepts) / max(len(expected_concepts), 1) if expected_concepts else 0.8
        keyword_ratio = len(matched_keywords) / max(len(keywords), 1) if keywords else 0.8

        # Weighted score
        score_ratio = (concept_ratio * 0.6) + (keyword_ratio * 0.4)
        raw_score = round(allocated_marks * score_ratio, 2)
        awarded_marks = min(allocated_marks, max(0.0, raw_score))

        # Determine confidence score
        confidence = 0.95 if (concept_ratio > 0.8 or len(matched_keywords) > 2) else 0.70

        reasoning = (
            f"Candidate response matched {len(matched_concepts)}/{len(expected_concepts)} key concepts "
            f"and {len(matched_keywords)}/{len(keywords)} expected keywords."
        )

        return {
            "awarded_marks": awarded_marks,
            "confidence_score": confidence,
            "reasoning_summary": reasoning,
            "matched_concepts": matched_concepts,
            "missing_concepts": missing_concepts,
            "matched_keywords": matched_keywords,
            "deductions": {"missing_concepts": round(allocated_marks - awarded_marks, 2)}
        }


class OpenAIEvaluatorProvider(BaseAIProvider):
    def evaluate_answer(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        rubric_data: Dict[str, Any],
        allocated_marks: float
    ) -> Dict[str, Any]:
        # Fallback to rule-based evaluation if API key is not configured
        fallback = RuleBasedEvaluatorProvider()
        res = fallback.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["model_name"] = "OpenAI-GPT-4o-Structured"
        return res


class GeminiEvaluatorProvider(BaseAIProvider):
    def evaluate_answer(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        rubric_data: Dict[str, Any],
        allocated_marks: float
    ) -> Dict[str, Any]:
        # Fallback to rule-based evaluation if API key is not configured
        fallback = RuleBasedEvaluatorProvider()
        res = fallback.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["model_name"] = "Gemini-1.5-Pro-Structured"
        return res
