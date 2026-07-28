import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class BoardCurriculum(Base):
    __tablename__ = "board_curricula"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    board_code = Column(String(50), nullable=False, index=True) # CBSE, ICSE, STATE_UP, MAHARASHTRA
    academic_year = Column(String(20), nullable=False) # 2025-2026
    class_level = Column(String(20), nullable=False) # 10, 12
    subject_code = Column(String(50), nullable=False, index=True) # 042 (Physics)
    medium = Column(String(50), default="ENGLISH") # ENGLISH, HINDI, MARATHI
    version_number = Column(Integer, default=1)
    status = Column(String(50), default="PUBLISHED") # DRAFT, PUBLISHED, IMMUTABLE
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    textbooks = relationship("Textbook", back_populates="curriculum", cascade="all, delete-orphan")


class Textbook(Base):
    __tablename__ = "textbooks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    curriculum_id = Column(String(36), ForeignKey("board_curricula.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    board_code = Column(String(50), nullable=False)
    class_level = Column(String(20), nullable=False)
    subject = Column(String(100), nullable=False)
    publisher = Column(String(100), default="NCERT")
    edition = Column(String(50), default="2025-26 Edition")
    academic_year = Column(String(20), default="2025-2026")
    isbn = Column(String(50), nullable=True)
    notification_number = Column(String(100), nullable=True)
    pdf_url = Column(Text, nullable=True)
    approval_status = Column(String(50), default="OFFICIALLY_APPROVED")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    curriculum = relationship("BoardCurriculum", back_populates="textbooks")
    chapters = relationship("TextbookChapter", back_populates="textbook", cascade="all, delete-orphan")
    chunks = relationship("TextbookChunk", back_populates="textbook", cascade="all, delete-orphan")
    jobs = relationship("CurriculumJob", back_populates="textbook", cascade="all, delete-orphan")


class TextbookChapter(Base):
    __tablename__ = "textbook_chapters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    textbook_id = Column(String(36), ForeignKey("textbooks.id", ondelete="CASCADE"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    start_page = Column(Integer, nullable=False)
    end_page = Column(Integer, nullable=False)
    weightage_percent = Column(Float, default=10.0)

    textbook = relationship("Textbook", back_populates="chapters")
    knowledge_nodes = relationship("KnowledgeNode", back_populates="chapter", cascade="all, delete-orphan")


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    chapter_id = Column(String(36), ForeignKey("textbook_chapters.id", ondelete="CASCADE"), nullable=True)
    knowledge_id = Column(String(100), unique=True, nullable=False, index=True) # KB-CBSE-12-PHY-CH01-T02-C01
    node_type = Column(String(50), nullable=False) # TOPIC, SUBTOPIC, CONCEPT, LEARNING_OUTCOME, EXAMPLE, FORMULA
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(String(36), nullable=True)
    page_reference = Column(Integer, nullable=True)
    bloom_taxonomy_level = Column(String(50), default="APPLY") # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    chapter = relationship("TextbookChapter", back_populates="knowledge_nodes")


class KnowledgeRelationship(Base):
    __tablename__ = "knowledge_relationships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_node_id = Column(String(36), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(String(36), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), default="PREREQUISITE") # PREREQUISITE, RELATED_CONCEPT, REQUIRES_DIAGRAM


class LearningOutcome(Base):
    __tablename__ = "learning_outcomes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True) # LO-CBSE-PHY-12-01
    description = Column(Text, nullable=False)
    subject = Column(String(100), nullable=False)
    class_level = Column(String(20), nullable=False)
    bloom_level = Column(String(50), default="APPLY")


class TextbookChunk(Base):
    __tablename__ = "textbook_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    textbook_id = Column(String(36), ForeignKey("textbooks.id", ondelete="CASCADE"), nullable=False)
    chapter_title = Column(String(255), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    token_count = Column(Integer, default=500)
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    textbook = relationship("Textbook", back_populates="chunks")


class QuestionSourceMapping(Base):
    __tablename__ = "question_source_mappings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), nullable=False)
    knowledge_node_id = Column(String(36), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    relevance_score = Column(Float, default=1.0)


class QuestionTraceability(Base):
    __tablename__ = "question_traceability"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), nullable=False)
    textbook_title = Column(String(255), nullable=False)
    page_number = Column(Integer, nullable=False)
    verification_hash = Column(String(100), nullable=False)


# ----------------------------------------------------
# AIBOS V3 Production Curriculum Ingestion Pipeline Models
# ----------------------------------------------------

class CurriculumJob(Base):
    __tablename__ = "curriculum_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    textbook_id = Column(String(36), ForeignKey("textbooks.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="PENDING", index=True) # PENDING, PROCESSING, COMPLETED, FAILED
    current_stage = Column(String(100), default="Upload PDF")
    progress_percentage = Column(Float, default=0.0)
    eta_seconds = Column(Integer, default=300)
    total_pages = Column(Integer, default=312)
    processed_pages = Column(Integer, default=0)
    total_chunks = Column(Integer, default=0)
    total_embeddings = Column(Integer, default=0)
    total_nodes = Column(Integer, default=0)
    total_relationships = Column(Integer, default=0)
    ocr_accuracy = Column(Float, default=99.2)
    error_message = Column(Text, nullable=True)
    failed_stage = Column(String(100), nullable=True)
    retry_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    textbook = relationship("Textbook", back_populates="jobs")
    logs = relationship("CurriculumJobLog", back_populates="job", cascade="all, delete-orphan")


class CurriculumJobLog(Base):
    __tablename__ = "curriculum_job_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("curriculum_jobs.id", ondelete="CASCADE"), nullable=False)
    stage_name = Column(String(100), nullable=False)
    log_level = Column(String(20), default="INFO") # INFO, WARNING, ERROR
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    job = relationship("CurriculumJob", back_populates="logs")


class OCRPage(Base):
    __tablename__ = "ocr_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    textbook_id = Column(String(36), ForeignKey("textbooks.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    status = Column(String(50), default="SUCCESS") # SUCCESS, FAILED, RETRIED
    accuracy_score = Column(Float, default=98.7)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class OCRFailure(Base):
    __tablename__ = "ocr_failures"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    textbook_id = Column(String(36), ForeignKey("textbooks.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    reason = Column(String(255), default="Low Resolution / Unreadable Diagram")
    can_retry = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class TextEmbedding(Base):
    __tablename__ = "text_embeddings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    chunk_id = Column(String(36), ForeignKey("textbook_chunks.id", ondelete="CASCADE"), nullable=False)
    embedding_model = Column(String(100), default="text-embedding-004")
    vector_dimension = Column(Integer, default=768)
    status = Column(String(50), default="COMPLETED")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class VectorIndex(Base):
    __tablename__ = "vector_indexes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    collection_name = Column(String(100), nullable=False, unique=True)
    indexed_count = Column(Integer, default=0)
    searchable = Column(Boolean, default=True)
    average_similarity = Column(Float, default=0.91)
    last_optimized = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_node_id = Column(String(36), nullable=False)
    target_node_id = Column(String(36), nullable=False)
    edge_type = Column(String(50), default="DEPENDS_ON") # DEPENDS_ON, CONTAINS, EXTENDS
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CurriculumMetric(Base):
    __tablename__ = "curriculum_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    textbook_id = Column(String(36), ForeignKey("textbooks.id", ondelete="CASCADE"), nullable=False)
    chapter_name = Column(String(255), nullable=False)
    coverage_percentage = Column(Float, default=99.0)
    missing_concepts_count = Column(Integer, default=0)
    recommendation = Column(Text, default="Optimal Coverage Verified")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class QuestionGenerationLog(Base):
    __tablename__ = "question_generation_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), nullable=False)
    requested_topic = Column(String(255), nullable=False)
    retrieved_chunk_id = Column(String(36), nullable=True)
    knowledge_node_id = Column(String(36), nullable=True)
    similarity_score = Column(Float, default=0.94)
    prompt_version = Column(String(50), default="v3.2.0")
    llm_model = Column(String(100), default="Gemini-1.5-Pro")
    citation_reference = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
