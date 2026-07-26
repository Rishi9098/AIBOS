import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.identity import User, Student
from app.models.exam import Exam, ExamQuestion, StudentSubmission, ProctoringLog
from app.schemas.exam import ExamCreate, ExamResponse, AnswerSaveRequest, AnswerSubmitRequest, SubmissionResponse, ProctoringLogCreate, ProctoringLogResponse
from app.api.deps import get_current_user, require_roles

router = APIRouter()

@router.post("/", response_model=ExamResponse)
def create_exam(
    exam_in: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["BOARD_OFFICIAL", "TEACHER", "SUPER_ADMIN"]))
):
    exam = Exam(
        title=exam_in.title,
        subject=exam_in.subject,
        total_marks=exam_in.total_marks,
        duration_minutes=exam_in.duration_minutes,
        start_time=exam_in.start_time,
        end_time=exam_in.end_time,
        blueprint_config=exam_in.blueprint_config,
        status="PUBLISHED"
    )
    db.add(exam)
    db.flush()

    for eq in exam_in.questions:
        exam_question = ExamQuestion(
            exam_id=exam.id,
            question_id=eq.question_id,
            question_order=eq.question_order,
            allocated_marks=eq.allocated_marks
        )
        db.add(exam_question)
    
    db.commit()
    db.refresh(exam)
    return exam

@router.get("/", response_model=List[ExamResponse])
def list_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Exam).all()

@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam_details(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.post("/save-draft", response_model=SubmissionResponse)
def save_draft_response(
    save_req: AnswerSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Current user is not registered as a student")

    submission = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == save_req.exam_id,
        StudentSubmission.student_id == student.id
    ).first()

    if not submission:
        submission = StudentSubmission(
            exam_id=save_req.exam_id,
            student_id=student.id,
            status="IN_PROGRESS",
            answers_json=save_req.answers
        )
        db.add(submission)
    else:
        if submission.status == "SUBMITTED":
            raise HTTPException(status_code=400, detail="Exam already submitted")
        submission.answers_json = save_req.answers

    db.commit()
    db.refresh(submission)
    return submission

@router.post("/submit", response_model=SubmissionResponse)
def submit_exam(
    submit_req: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Current user is not registered as a student")

    submission = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == submit_req.exam_id,
        StudentSubmission.student_id == student.id
    ).first()

    now = datetime.now(timezone.utc)
    answers_str = json.dumps(submit_req.answers, sort_keys=True)
    hash_checksum = hashlib.sha256(f"{submit_req.exam_id}:{student.id}:{answers_str}:{now.isoformat()}".encode()).hexdigest()

    if not submission:
        submission = StudentSubmission(
            exam_id=submit_req.exam_id,
            student_id=student.id,
            status="SUBMITTED",
            submitted_at=now,
            answers_json=submit_req.answers,
            digital_signature=submit_req.digital_signature or f"SIG-{student.id[:8]}-{hash_checksum[:12]}",
            hash_chain_checksum=hash_checksum,
            encrypted_payload_path=f"submissions/{submit_req.exam_id}/{student.id}.json"
        )
        db.add(submission)
    else:
        submission.status = "SUBMITTED"
        submission.submitted_at = now
        submission.answers_json = submit_req.answers
        submission.digital_signature = submit_req.digital_signature or f"SIG-{student.id[:8]}-{hash_checksum[:12]}"
        submission.hash_chain_checksum = hash_checksum
        submission.encrypted_payload_path = f"submissions/{submit_req.exam_id}/{student.id}.json"

    db.commit()
    db.refresh(submission)
    return submission

@router.post("/proctor-log", response_model=ProctoringLogResponse)
def record_proctor_log(
    log_in: ProctoringLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proctor_log = ProctoringLog(
        submission_id=log_in.submission_id,
        event_type=log_in.event_type,
        risk_score=log_in.risk_score,
        evidence_media_path=log_in.evidence_media_path,
        event_metadata=log_in.event_metadata
    )
    db.add(proctor_log)
    db.commit()
    db.refresh(proctor_log)
    return proctor_log
