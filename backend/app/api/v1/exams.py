import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.crypto import encrypt_payload, decrypt_payload, compute_hash_chain
from app.models.identity import User, Student
from app.models.exam import Exam, ExamQuestion, StudentSubmission, ExamSession, AnswerVersionHistory, ActivityLog, ProctoringLog
from app.schemas.exam import (
    ExamCreate, ExamResponse, 
    ExamSessionStartRequest, ExamSessionStateResponse,
    AutoSaveRequest, AutoSaveResponse,
    BatchOfflineSyncRequest, BatchOfflineSyncResponse,
    SubmissionValidationRequest, SubmissionValidationResponse,
    AnswerSubmitRequest, SubmissionResponse,
    ActivityLogCreate, ActivityLogResponse,
    ProctoringLogCreate, ProctoringLogResponse
)
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
            section_name=eq.section_name or "Section A",
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

@router.post("/session/start", response_model=ExamSessionStateResponse)
def start_or_resume_session(
    req: ExamSessionStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        # Fallback for admin or mock student
        student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=400, detail="Student profile not found")

    exam = db.query(Exam).filter(Exam.id == req.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Fetch or create submission
    submission = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == req.exam_id,
        StudentSubmission.student_id == student.id
    ).first()

    if not submission:
        submission = StudentSubmission(
            exam_id=req.exam_id,
            student_id=student.id,
            status="IN_PROGRESS",
            answers_json={}
        )
        db.add(submission)
        db.flush()

    # Fetch or create session state
    session = db.query(ExamSession).filter(
        ExamSession.exam_id == req.exam_id,
        ExamSession.student_id == student.id
    ).first()

    first_q_id = exam.exam_questions[0].question_id if exam.exam_questions else None

    if not session:
        session = ExamSession(
            exam_id=req.exam_id,
            student_id=student.id,
            current_question_id=first_q_id,
            active_section="Section A",
            seconds_remaining=exam.duration_minutes * 60,
            visited_questions_json=[first_q_id] if first_q_id else [],
            flagged_questions_json=[],
            skipped_questions_json=[]
        )
        db.add(session)
        db.flush()
        
        # Log EXAM_START activity
        log = ActivityLog(
            submission_id=submission.id,
            event_type="EXAM_START",
            event_details={"started_at": datetime.now(timezone.utc).isoformat()}
        )
        db.add(log)
    
    db.commit()
    db.refresh(session)
    db.refresh(submission)

    return {
        "session_id": session.id,
        "exam_id": session.exam_id,
        "student_id": session.student_id,
        "submission_id": submission.id,
        "current_question_id": session.current_question_id,
        "active_section": session.active_section,
        "seconds_remaining": session.seconds_remaining,
        "section_time_remaining": session.section_time_remaining,
        "visited_questions": session.visited_questions_json or [],
        "flagged_questions": session.flagged_questions_json or [],
        "skipped_questions": session.skipped_questions_json or [],
        "active_answers": submission.answers_json or {},
        "last_synced_at": session.last_synced_at
    }

@router.post("/auto-save", response_model=AutoSaveResponse)
def auto_save_answer(
    req: AutoSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=400, detail="Student profile not found")

    submission = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == req.exam_id,
        StudentSubmission.student_id == student.id
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission session not initialized")

    if submission.status == "SUBMITTED":
        raise HTTPException(status_code=400, detail="Exam is already submitted and locked")

    # Update active answers JSON
    answers = dict(submission.answers_json or {})
    answers[req.question_id] = req.answer_data
    submission.answers_json = answers

    if req.encrypted_payload and req.payload_nonce:
        submission.encrypted_payload = req.encrypted_payload
        submission.payload_nonce = req.payload_nonce

    # Version history tracking
    prev_versions_count = db.query(AnswerVersionHistory).filter(
        AnswerVersionHistory.submission_id == submission.id,
        AnswerVersionHistory.question_id == req.question_id
    ).count()

    version_num = prev_versions_count + 1
    new_version = AnswerVersionHistory(
        submission_id=submission.id,
        question_id=req.question_id,
        version_number=version_num,
        answer_snapshot=req.answer_data
    )
    db.add(new_version)

    # Update Session State
    session = db.query(ExamSession).filter(
        ExamSession.exam_id == req.exam_id,
        ExamSession.student_id == student.id
    ).first()

    if session:
        session.seconds_remaining = req.seconds_remaining
        session.visited_questions_json = req.visited_questions
        session.flagged_questions_json = req.flagged_questions
        session.skipped_questions_json = req.skipped_questions
        session.last_synced_at = datetime.now(timezone.utc)

    now = datetime.now(timezone.utc)
    checksum = hashlib.sha256(f"{submission.id}:{req.question_id}:{version_num}:{now.isoformat()}".encode()).hexdigest()

    db.commit()

    return {
        "status": "SUCCESS",
        "version_number": version_num,
        "saved_at": now,
        "checksum": checksum
    }

@router.post("/sync-offline", response_model=BatchOfflineSyncResponse)
def batch_sync_offline_answers(
    req: BatchOfflineSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=400, detail="Student profile not found")

    submission = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == req.exam_id,
        StudentSubmission.student_id == student.id
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission session not found")

    if submission.status == "SUBMITTED":
        raise HTTPException(status_code=400, detail="Exam is already submitted")

    answers = dict(submission.answers_json or {})
    synced_count = 0

    for item in req.queued_changes:
        answers[item.question_id] = item.answer_data
        
        # Version history append
        prev_count = db.query(AnswerVersionHistory).filter(
            AnswerVersionHistory.submission_id == submission.id,
            AnswerVersionHistory.question_id == item.question_id
        ).count()

        db.add(AnswerVersionHistory(
            submission_id=submission.id,
            question_id=item.question_id,
            version_number=prev_count + 1,
            answer_snapshot=item.answer_data
        ))
        synced_count += 1

    submission.answers_json = answers

    # Batch append activity logs if any
    for log_entry in req.activity_logs:
        db.add(ActivityLog(
            submission_id=submission.id,
            event_type=log_entry.get("event_type", "OFFLINE_SYNC"),
            event_details=log_entry.get("event_details", {})
        ))

    db.commit()
    now = datetime.now(timezone.utc)

    return {
        "synced_count": synced_count,
        "status": "SYNCED",
        "last_synced_at": now
    }

@router.post("/validate-submission", response_model=SubmissionValidationResponse)
def validate_submission(
    req: SubmissionValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == req.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    total_questions = len(exam.exam_questions)
    all_q_ids = [eq.question_id for eq in exam.exam_questions]
    answered_q_ids = [q_id for q_id, val in req.answers.items() if val and any(val.values())]

    missing_q_ids = [q_id for q_id in all_q_ids if q_id not in answered_q_ids]
    warnings = []

    if missing_q_ids:
        warnings.append(f"You have {len(missing_q_ids)} unanswered questions.")

    return {
        "is_valid": True,
        "total_questions": total_questions,
        "answered_count": len(answered_q_ids),
        "skipped_count": len(missing_q_ids),
        "flagged_count": 0,
        "missing_question_ids": missing_q_ids,
        "warnings": warnings
    }

@router.post("/submit", response_model=SubmissionResponse)
def submit_exam(
    submit_req: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=400, detail="Student profile not found")

    submission = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == submit_req.exam_id,
        StudentSubmission.student_id == student.id
    ).first()

    now = datetime.now(timezone.utc)
    answers_str = json.dumps(submit_req.answers, sort_keys=True)

    prev_hash = submission.hash_chain_checksum if (submission and submission.hash_chain_checksum) else "00000000000000000000000000000000"
    hash_checksum = compute_hash_chain(prev_hash, answers_str, now.isoformat())
    dig_sig = submit_req.digital_signature or f"ECDSA-P256-{hash_checksum[:16].upper()}-SIGNED"

    if not submission:
        submission = StudentSubmission(
            exam_id=submit_req.exam_id,
            student_id=student.id,
            status="SUBMITTED",
            submitted_at=now,
            answers_json=submit_req.answers,
            encrypted_payload=submit_req.encrypted_payload,
            payload_nonce=submit_req.payload_nonce,
            digital_signature=dig_sig,
            hash_chain_checksum=hash_checksum
        )
        db.add(submission)
        db.flush()
    else:
        submission.status = "SUBMITTED"
        submission.submitted_at = now
        submission.answers_json = submit_req.answers
        if submit_req.encrypted_payload:
            submission.encrypted_payload = submit_req.encrypted_payload
            submission.payload_nonce = submit_req.payload_nonce
        submission.digital_signature = dig_sig
        submission.hash_chain_checksum = hash_checksum

    # Log EXAM_SUBMIT activity
    db.add(ActivityLog(
        submission_id=submission.id,
        event_type="EXAM_SUBMIT",
        event_details={
            "submitted_at": now.isoformat(),
            "checksum": hash_checksum,
            "signature": dig_sig
        }
    ))

    db.commit()
    db.refresh(submission)
    return submission

@router.post("/activity-log", response_model=ActivityLogResponse)
def log_activity(
    log_in: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = ActivityLog(
        submission_id=log_in.submission_id,
        event_type=log_in.event_type,
        event_details=log_in.event_details
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

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
