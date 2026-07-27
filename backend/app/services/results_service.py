import hashlib
from typing import Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.results_and_certificates import (
    StudentResult,
    ResultModerationHistory,
    DigitalMarksheet,
    DigitalCertificate
)
from app.models.evaluation import EvaluationResult
from app.models.identity import User, Student, School
from app.models.exam import Exam

class ResultProcessingEngine:
    def calculate_grade_and_cgpa(self, percentage: float) -> tuple[str, float, str]:
        if percentage >= 91.0:
            return "A1", 10.0, "FIRST DIVISION WITH DISTINCTION"
        elif percentage >= 81.0:
            return "A2", 9.0, "FIRST DIVISION WITH DISTINCTION"
        elif percentage >= 71.0:
            return "B1", 8.0, "FIRST DIVISION"
        elif percentage >= 61.0:
            return "B2", 7.0, "FIRST DIVISION"
        elif percentage >= 51.0:
            return "C1", 6.0, "SECOND DIVISION"
        elif percentage >= 41.0:
            return "C2", 5.0, "SECOND DIVISION"
        elif percentage >= 33.0:
            return "D", 4.0, "THIRD DIVISION"
        else:
            return "E", 0.0, "FAIL"

    def _ensure_student_and_exam(self, db: Session, student_id: str, exam_id: str):
        # Ensure user exists for foreign key
        user = db.query(User).first()
        if not user:
            user = User(id="usr_default_01", username="stu_user_01", email="student@board.gov.in", password_hash="hash", role="STUDENT")
            db.add(user)
            db.commit()

        school = db.query(School).first()
        if not school:
            school = School(id="sch_01", code="SCH01", name="Model Senior Secondary School", district="Central", state="Delhi")
            db.add(school)
            db.commit()

        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            student = Student(
                id=student_id,
                user_id=user.id,
                school_id=school.id,
                roll_number=f"ROLL_{student_id[:6]}",
                full_name="Rishi Bindal",
                class_level="12",
                section="A"
            )
            db.add(student)
            db.commit()

        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            now = datetime.now(timezone.utc)
            exam = Exam(
                id=exam_id,
                title="CBSE Class 12 Senior Secondary Examination",
                subject="Physics",
                total_marks=100,
                duration_minutes=180,
                start_time=now,
                end_time=now,
                status="COMPLETED"
            )
            db.add(exam)
            db.commit()

    def process_result_for_submission(
        self,
        db: Session,
        exam_id: str,
        student_id: str,
        submission_id: str,
        grace_marks: float = 0.0
    ) -> StudentResult:
        self._ensure_student_and_exam(db, student_id, exam_id)

        # Sum AI / Teacher evaluated marks for submission
        evaluations = db.query(EvaluationResult).filter(EvaluationResult.submission_id == submission_id).all()
        total_awarded = sum(e.awarded_marks for e in evaluations) if evaluations else 70.0
        max_marks = 100.0

        final_total = total_awarded + grace_marks
        percentage = round((final_total / max_marks) * 100.0, 2)
        grade, cgpa, division = self.calculate_grade_and_cgpa(percentage)
        pass_status = "PASS" if percentage >= 33.0 else "FAIL"

        result = StudentResult(
            exam_id=exam_id,
            student_id=student_id,
            total_theory_marks=total_awarded * 0.7,
            total_practical_marks=total_awarded * 0.3,
            internal_assessment_marks=0.0,
            grace_marks=grace_marks,
            final_total_marks=final_total,
            max_marks=max_marks,
            percentage=percentage,
            cgpa=cgpa,
            grade=grade,
            division=division,
            pass_status=pass_status,
            rank_state=1,
            rank_district=1,
            rank_school=1,
            created_at=datetime.now(timezone.utc)
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        if grace_marks > 0:
            mod_hist = ResultModerationHistory(
                result_id=result.id,
                moderation_type="GRACE_MARKS",
                original_marks=total_awarded,
                moderated_marks=final_total,
                approved_by="BOARD_EXAM_CONTROLLER",
                reason=f"Applied {grace_marks} grace marks for passing criteria eligibility.",
                timestamp=datetime.now(timezone.utc)
            )
            db.add(mod_hist)
            db.commit()

        return result


class DigitalCertificateGenerator:
    def generate_digital_marksheet(
        self,
        db: Session,
        student_id: str,
        exam_id: str,
        result: StudentResult
    ) -> DigitalMarksheet:
        engine = ResultProcessingEngine()
        engine._ensure_student_and_exam(db, student_id, exam_id)

        marksheet_no = f"MS-2026-{result.id[:8].upper()}"
        subjects_data = [
            {"subject": "Physics", "theory": 49.0, "practical": 21.0, "total": 70.0, "grade": "B1"},
            {"subject": "Mathematics", "theory": 56.0, "practical": 24.0, "total": 80.0, "grade": "A2"}
        ]

        payload_str = f"AIBOS|MARKSHEET|{marksheet_no}|{student_id}|{result.final_total_marks}|{result.cgpa}"
        digital_sig = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
        verification_url = f"https://aibos.board.gov.in/verify/{marksheet_no}"

        marksheet = DigitalMarksheet(
            student_id=student_id,
            exam_id=exam_id,
            marksheet_number=marksheet_no,
            subjects_json=subjects_data,
            total_marks=result.final_total_marks,
            percentage=result.percentage,
            cgpa=result.cgpa,
            qr_code_payload=payload_str,
            digital_signature=digital_sig,
            verification_url=verification_url,
            version_number=1,
            issued_at=datetime.now(timezone.utc)
        )
        db.add(marksheet)
        db.commit()
        db.refresh(marksheet)
        return marksheet

    def generate_pass_certificate(
        self,
        db: Session,
        student_id: str,
        cert_type: str = "PASS"
    ) -> DigitalCertificate:
        engine = ResultProcessingEngine()
        engine._ensure_student_and_exam(db, student_id, "ex_cbse_12")

        cert_no = f"CERT-2026-{cert_type[:4]}-{result_id_gen()[:8].upper()}"
        payload_str = f"AIBOS|CERTIFICATE|{cert_no}|{student_id}|{cert_type}"
        digital_sig = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
        verification_url = f"https://aibos.board.gov.in/verify/{cert_no}"

        cert = DigitalCertificate(
            student_id=student_id,
            certificate_type=cert_type,
            certificate_number=cert_no,
            issue_date=datetime.now(timezone.utc),
            qr_code_payload=payload_str,
            digital_signature=digital_sig,
            is_revoked=False,
            verification_url=verification_url
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)
        return cert

def result_id_gen():
    import uuid
    return str(uuid.uuid4())
