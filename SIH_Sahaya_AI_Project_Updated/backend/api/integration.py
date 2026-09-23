"""
Webhook endpoint for external systems (e.g. police case management,
government portals) to push/pull case updates.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from security.security import require_officer

router = APIRouter(prefix="/integration", tags=["integration"])


@router.post("/webhook")
def receive_external_update(payload: dict, officer=Depends(require_officer), db: Session = Depends(get_db)):
    # TODO: validate payload schema and route to the right service.
    return {"status": "received", "payload": payload}
