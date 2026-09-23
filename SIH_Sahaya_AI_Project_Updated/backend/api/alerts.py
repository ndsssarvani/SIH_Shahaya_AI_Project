"""
High-risk alert listing / acknowledgement for officers.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database import models
from security.security import require_officer

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/")
def list_alerts(db: Session = Depends(get_db), officer: models.User = Depends(require_officer)):
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db), officer: models.User = Depends(require_officer)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        alert.acknowledged = True
        db.commit()
    return alert
