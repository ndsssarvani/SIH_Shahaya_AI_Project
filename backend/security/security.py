"""
Password hashing + JWT auth helpers, shared by api/auth.py and other
routers that need to identify the current user.
"""
import os
import datetime
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database.connection import get_db
from database import models

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-.env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == payload["sub"]).first()
    if user is None:
        raise credentials_exception
    return user


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> models.User:
    if token:
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user = db.query(models.User).filter(models.User.email == payload["sub"]).first()
            if user:
                return user

    # Fallback to default guest victim user
    guest_email = "guest_victim@sahaya.gov.in"
    guest = db.query(models.User).filter(models.User.email == guest_email).first()
    if not guest:
        guest = models.User(
            name="Anonymous Complainant",
            email=guest_email,
            hashed_password=hash_password("guest-sahaya-14566"),
            role=models.UserRole.victim,
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
    return guest


def require_officer(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role not in ("officer", "admin"):
        raise HTTPException(status_code=403, detail="Officer access required")
    return user

