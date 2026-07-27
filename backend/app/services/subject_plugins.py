from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.core.ai_provider import RuleBasedEvaluatorProvider

class SubjectEvaluatorPlugin(ABC):
    @abstractmethod
    def evaluate(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        rubric_data: Dict[str, Any],
        allocated_marks: float
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        pass

    @abstractmethod
    def explain(self, raw_result: Dict[str, Any]) -> str:
        pass

    @abstractmethod
    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        pass


class MathEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Mathematics Evaluation Plugin: Focuses on step-wise derivation, formulas, and final values."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Mathematics"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Math Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "matched_concepts": raw_result.get("matched_concepts", []),
            "matched_keywords": raw_result.get("matched_keywords", []),
            "deductions": raw_result.get("deductions", {})
        }

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.9)


class PhysicsEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Physics Evaluation Plugin: Focuses on physical laws, units, formulas, and principles."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Physics"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Physics Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "matched_concepts": raw_result.get("matched_concepts", []),
            "matched_keywords": raw_result.get("matched_keywords", [])
        }

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.95)


class ChemistryEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Chemistry Evaluation Plugin: Focuses on chemical equations, reagents, and reaction mechanisms."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Chemistry"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Chemistry Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_concepts": raw_result.get("matched_concepts", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.90)


class BiologyEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Biology Evaluation Plugin: Focuses on biological terminology, functions, and key processes."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Biology"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Biology Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_concepts": raw_result.get("matched_concepts", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.90)


class EnglishEvaluatorPlugin(SubjectEvaluatorPlugin):
    """English Evaluation Plugin: Focuses on grammar, vocabulary, structure, and thematic clarity."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "English"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[English Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_keywords": raw_result.get("matched_keywords", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.85)


class HindiEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Hindi Evaluation Plugin: Devanagari text matching & linguistic coverage."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Hindi"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Hindi Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_keywords": raw_result.get("matched_keywords", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.85)


class HistoryEvaluatorPlugin(SubjectEvaluatorPlugin):
    """History Evaluation Plugin: Chronological facts, dates, events, cause-effect analysis."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "History"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[History Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_concepts": raw_result.get("matched_concepts", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.88)


class GeographyEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Geography Evaluation Plugin: Spatial terms, landforms, climate & resources."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Geography"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Geography Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_concepts": raw_result.get("matched_concepts", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.88)


class EconomicsEvaluatorPlugin(SubjectEvaluatorPlugin):
    """Economics Evaluation Plugin: Economic principles, terms, graphs & policies."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Economics"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[Economics Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_concepts": raw_result.get("matched_concepts", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.88)


class ComputerSciencePlugin(SubjectEvaluatorPlugin):
    """Computer Science Evaluation Plugin: Code logic, syntax, data structures, algorithms."""
    def evaluate(self, question_text: str, model_answer: str, student_answer: str, rubric_data: Dict[str, Any], allocated_marks: float) -> Dict[str, Any]:
        provider = RuleBasedEvaluatorProvider()
        res = provider.evaluate_answer(question_text, model_answer, student_answer, rubric_data, allocated_marks)
        res["subject"] = "Computer Science"
        return res

    def score(self, raw_result: Dict[str, Any], allocated_marks: float) -> float:
        return raw_result.get("awarded_marks", 0.0)

    def explain(self, raw_result: Dict[str, Any]) -> str:
        return f"[CS Evaluation]: {raw_result.get('reasoning_summary', '')}"

    def return_evidence(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        return {"matched_keywords": raw_result.get("matched_keywords", [])}

    def return_confidence(self, raw_result: Dict[str, Any]) -> float:
        return raw_result.get("confidence_score", 0.92)


# Plugin Dispatch Registry
SUBJECT_PLUGIN_REGISTRY: Dict[str, SubjectEvaluatorPlugin] = {
    "MATHEMATICS": MathEvaluatorPlugin(),
    "PHYSICS": PhysicsEvaluatorPlugin(),
    "CHEMISTRY": ChemistryEvaluatorPlugin(),
    "BIOLOGY": BiologyEvaluatorPlugin(),
    "ENGLISH": EnglishEvaluatorPlugin(),
    "HINDI": HindiEvaluatorPlugin(),
    "HISTORY": HistoryEvaluatorPlugin(),
    "GEOGRAPHY": GeographyEvaluatorPlugin(),
    "ECONOMICS": EconomicsEvaluatorPlugin(),
    "COMPUTER SCIENCE": ComputerSciencePlugin()
}

def get_subject_evaluator(subject: str) -> SubjectEvaluatorPlugin:
    sub_key = (subject or "MATHEMATICS").upper()
    return SUBJECT_PLUGIN_REGISTRY.get(sub_key, MathEvaluatorPlugin())
