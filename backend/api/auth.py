"""
Registration + login. Issues JWT access tokens used by all other routers.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database.connection import get_db
from database import models
from security.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: str  # Supports email, phone number, or officer ID
    password: str
    role: models.UserRole = models.UserRole.victim


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    clean_identifier = payload.email.strip().lower()
    clean_name = payload.name.strip()

    if not clean_identifier:
        raise HTTPException(status_code=400, detail="Email, phone number or ID is required")
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    if db.query(models.User).filter(models.User.email == clean_identifier).first():
        raise HTTPException(
            status_code=400,
            detail="An account with this email or phone number is already registered. Please sign in instead."
        )

    user = models.User(
        name=clean_name,
        email=clean_identifier,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    clean_username = form_data.username.strip().lower()
    user = db.query(models.User).filter(models.User.email == clean_username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email/phone number or password")

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)