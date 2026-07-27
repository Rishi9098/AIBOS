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
    chapter_id = Column(String(36), ForeignKey("textbook_chapters.id"), nullable=True)
    knowledge_id = Column(String(100), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    section_heading = Column(String(255), nullable=False)
    content_text = Column(Text, nullable=False)
    embedding_vector_json = Column(JSON, nullable=True)
    language = Column(String(20), default="ENGLISH")

    textbook = relationship("Textbook", back_populates="chunks")


class QuestionSourceMapping(Base):
    __tablename__ = "question_source_mappings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False, index=True)
    knowledge_id = Column(String(100), nullable=False, index=True)
    textbook_id = Column(String(36), ForeignKey("textbooks.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    chapter_title = Column(String(255), nullable=False)
    learning_outcome_code = Column(String(50), nullable=False)
    bloom_level = Column(String(50), default="APPLY")
    difficulty = Column(String(50), default="MEDIUM")

    question = relationship("QuestionBank")
    textbook = relationship("Textbook")


class QuestionTraceability(Base):
    __tablename__ = "question_traceability"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("question_bank.id"), nullable=False, index=True)
    knowledge_ids_json = Column(JSON, nullable=False)
    textbook_references_json = Column(JSON, nullable=False)
    page_numbers_json = Column(JSON, nullable=False)
    learning_outcomes_json = Column(JSON, nullable=False)
    blueprint_rules_json = Column(JSON, nullable=False)
    
    prompt_version = Column(String(50), default="v1.0")
    model_name = Column(String(100), default="OpenAI-GPT-4o-Structured")
    is_teacher_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    question = relationship("QuestionBank")
