from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.identity import User
from app.models.multimodal import (
    UploadedDocument,
    DocumentPage,
    OCRResult,
    RecognizedRegion,
    NormalizedRepresentation
)
from app.schemas.multimodal import (
    DocumentUploadResponse,
    OCRResultResponse,
    RecognizedRegionResponse,
    OCRCorrectionRequest,
    NormalizedRepresentationResponse
)
from app.services.multimodal_service import MultimodalNormalizationEngine

router = APIRouter()

# ----------------------------------------------------
# 1. DOCUMENT INGESTION & PROCESSING ENDPOINTS
# ----------------------------------------------------
@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
    submission_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    file_bytes = file.file.read()
    doc = UploadedDocument(
        submission_id=submission_id,
        file_name=file.filename or "scanned_sheet.pdf",
        file_type=(file.filename or "").split(".")[-1].upper() if "." in file.filename else "PNG",
        file_size_bytes=len(file_bytes),
        storage_path=f"/storage/documents/{file.filename}",
        page_count=1,
        created_at=datetime.now(timezone.utc)
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    page = DocumentPage(
        document_id=doc.id,
        page_number=1,
        image_path=doc.storage_path,
        width_px=1920,
        height_px=1080
    )
    db.add(page)
    db.commit()

    return doc

@router.post("/process/{document_id}", response_model=NormalizedRepresentationResponse)
def process_multimodal_document(
    document_id: str,
    question_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    engine = MultimodalNormalizationEngine(db)
    try:
        norm_result = engine.process_document(document_id, question_id=question_id)
        return norm_result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ----------------------------------------------------
# 2. OCR RESULTS & NORMALIZATION PREVIEW ENDPOINTS
# ----------------------------------------------------
@router.get("/ocr/{document_id}", response_model=List[OCRResultResponse])
def get_ocr_results(document_id: str, db: Session = Depends(get_db)):
    pages = db.query(DocumentPage).filter(DocumentPage.document_id == document_id).all()
    page_ids = [p.id for p in pages]
    results = db.query(OCRResult).filter(OCRResult.page_id.in_(page_ids)).all()
    return results

@router.get("/normalized/{document_id}", response_model=NormalizedRepresentationResponse)
def get_normalized_payload(document_id: str, db: Session = Depends(get_db)):
    norm = db.query(NormalizedRepresentation).filter(NormalizedRepresentation.document_id == document_id).order_by(NormalizedRepresentation.normalized_at.desc()).first()
    if not norm:
        raise HTTPException(status_code=404, detail="Normalized payload not found for this document")
    return norm

# ----------------------------------------------------
# 3. TEACHER OCR CORRECTION ENDPOINT
# ----------------------------------------------------
@router.post("/correct/{region_id}", response_model=RecognizedRegionResponse)
def correct_ocr_region(
    region_id: str,
    corr: OCRCorrectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "TEACHER", "BOARD_OFFICIAL"]))
):
    region = db.query(RecognizedRegion).filter(RecognizedRegion.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Recognized region not found")

    region.raw_text = corr.corrected_text
    region.confidence_score = 1.0 # Teacher verified
    db.commit()
    db.refresh(region)

    # Flag normalized representation as teacher corrected
    ocr_res = db.query(OCRResult).filter(OCRResult.id == region.ocr_result_id).first()
    if ocr_res:
        page = db.query(DocumentPage).filter(DocumentPage.id == ocr_res.page_id).first()
        if page:
            norm = db.query(NormalizedRepresentation).filter(NormalizedRepresentation.document_id == page.document_id).first()
            if norm:
                norm.is_teacher_corrected = True
                db.commit()

    return region
