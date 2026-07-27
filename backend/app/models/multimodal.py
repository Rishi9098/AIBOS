import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("student_submissions.id"), nullable=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # PDF, PNG, JPEG, TIFF
    file_size_bytes = Column(Integer, nullable=False)
    storage_path = Column(Text, nullable=False)
    page_count = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    normalized_representation = relationship("NormalizedRepresentation", back_populates="document", uselist=False, cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    image_path = Column(Text, nullable=False)
    width_px = Column(Integer, default=1920)
    height_px = Column(Integer, default=1080)

    document = relationship("UploadedDocument", back_populates="pages")
    ocr_results = relationship("OCRResult", back_populates="page", cascade="all, delete-orphan")


class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    page_id = Column(String(36), ForeignKey("document_pages.id", ondelete="CASCADE"), nullable=False)
    ocr_provider = Column(String(50), default="PaddleOCR") # PaddleOCR, TrOCR, Tesseract, MockProvider
    language_detected = Column(String(50), default="en+hi") # English, Hindi, Devanagari
    overall_confidence = Column(Float, default=0.92)
    processed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    page = relationship("DocumentPage", back_populates="ocr_results")
    regions = relationship("RecognizedRegion", back_populates="ocr_result", cascade="all, delete-orphan")


class RecognizedRegion(Base):
    __tablename__ = "recognized_regions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ocr_result_id = Column(String(36), ForeignKey("ocr_results.id", ondelete="CASCADE"), nullable=False)
    region_type = Column(String(50), nullable=False) # PARAGRAPH, HANDWRITING, MATH_FORMULA, TABLE, DIAGRAM
    bounding_box = Column(JSON, nullable=False) # {"x": 100, "y": 150, "w": 400, "h": 200}
    raw_text = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.90)

    ocr_result = relationship("OCRResult", back_populates="regions")
    diagram_component = relationship("DiagramComponent", back_populates="region", uselist=False, cascade="all, delete-orphan")
    math_expression = relationship("MathematicalExpression", back_populates="region", uselist=False, cascade="all, delete-orphan")


class DiagramComponent(Base):
    __tablename__ = "diagram_components"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    region_id = Column(String(36), ForeignKey("recognized_regions.id", ondelete="CASCADE"), nullable=False)
    diagram_type = Column(String(50), nullable=False) # BIOLOGY, CIRCUIT, FLOWCHART, GRAPH, MAP
    detected_labels = Column(JSON, default=list) # ["Diode D1", "Resistor R1"]
    components_json = Column(JSON, default=dict)

    region = relationship("RecognizedRegion", back_populates="diagram_component")


class MathematicalExpression(Base):
    __tablename__ = "mathematical_expressions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    region_id = Column(String(36), ForeignKey("recognized_regions.id", ondelete="CASCADE"), nullable=False)
    latex_expression = Column(Text, nullable=False) # e.g. \int_0^{\pi} \sin(x) dx
    normalized_ascii = Column(Text, nullable=True)
    is_valid_latex = Column(Boolean, default=True)

    region = relationship("RecognizedRegion", back_populates="math_expression")


class NormalizedRepresentation(Base):
    __tablename__ = "normalized_representations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False)
    submission_id = Column(String(36), nullable=True)
    question_id = Column(String(36), nullable=True)
    
    unified_payload = Column(JSON, nullable=False) # {"cleaned_text": "...", "latex_formulas": [...], "tables": [...], "diagrams": [...]}
    is_teacher_corrected = Column(Boolean, default=False)
    normalized_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    document = relationship("UploadedDocument", back_populates="normalized_representation")
