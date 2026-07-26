import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "identity_users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="STUDENT") # STUDENT, TEACHER, SCHOOL_ADMIN, DISTRICT_OFFICER, EVALUATOR, BOARD_OFFICIAL, SUPER_ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("Student", back_populates="user", uselist=False)


class School(Base):
    __tablename__ = "schools"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    students = relationship("Student", back_populates="school")


class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False)
    school_id = Column(String(36), ForeignKey("schools.id"), nullable=True)
    roll_number = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    class_level = Column(String(20), nullable=False)
    section = Column(String(10), nullable=False)
    biometric_hash = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student_profile")
    school = relationship("School", back_populates="students")
