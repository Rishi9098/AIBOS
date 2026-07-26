from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.identity import User, School, Student
from app.schemas.auth import Token, UserCreate, UserResponse, StudentCreate, StudentResponse, SchoolCreate, SchoolResponse
from app.api.deps import get_current_user, require_roles

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "username": user.username
    }

@router.post("/register", response_model=UserResponse)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    existing_username = db.query(User).filter(User.username == user_in.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/schools", response_model=SchoolResponse)
def create_school(
    school_in: SchoolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "BOARD_OFFICIAL"]))
):
    existing = db.query(School).filter(School.code == school_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="School code already exists")
    school = School(
        code=school_in.code,
        name=school_in.name,
        district=school_in.district,
        state=school_in.state
    )
    db.add(school)
    db.commit()
    db.refresh(school)
    return school

@router.post("/register-student", response_model=StudentResponse)
def register_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.username == student_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    school_id = None
    if student_in.school_code:
        school = db.query(School).filter(School.code == student_in.school_code).first()
        if school:
            school_id = school.id

    new_user = User(
        username=student_in.username,
        email=student_in.email,
        password_hash=get_password_hash(student_in.password),
        role="STUDENT"
    )
    db.add(new_user)
    db.flush()

    new_student = Student(
        user_id=new_user.id,
        school_id=school_id,
        roll_number=student_in.roll_number,
        full_name=student_in.full_name,
        class_level=student_in.class_level,
        section=student_in.section
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
