from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    username: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "STUDENT"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    role: str
    is_active: bool

class UserLogin(BaseModel):
    username: str
    password: str

class SchoolCreate(BaseModel):
    code: str
    name: str
    district: str
    state: str

class SchoolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    district: str
    state: str

class StudentCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    roll_number: str
    full_name: str
    class_level: str
    section: str
    school_code: Optional[str] = None

class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    roll_number: str
    full_name: str
    class_level: str
    section: str
    school_id: Optional[str] = None
