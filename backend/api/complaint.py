"""
Complaint submission + listing.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.connection import get_db
from database import models
from security.security import get_current_user, require_officer
from services.case_service import create_complaint, list_complaints

router = APIRouter(prefix="/complaint", tags=["complaint"])


class ComplaintRequest(BaseModel):
    description: str


@router.post("/")
def submit_complaint(
    payload: ComplaintRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return create_complaint(db, current_user.id, payload.description)


@router.get("/")
def get_complaints(db: Session = Depends(get_db), officer: models.User = Depends(require_officer)):
    return list_complaints(db)
