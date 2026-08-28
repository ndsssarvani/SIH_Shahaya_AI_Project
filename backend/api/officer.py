"""
Officer dashboard endpoints: view assessments/cases ranked by risk,
plus SQL-backed analytics (breakdowns, trends, worklist).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from database import models
from security.security import require_officer
from services.case_service import list_assessments_for_officer
from services import analytical_service as analytics_service

router = APIRouter(prefix="/officer", tags=["officer"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), officer: models.User = Depends(require_officer)):
    """
    Summary cards for the dashboard. Counts now come from real SQL
    (COUNT/GROUP BY in analytics_service) instead of looping over every
    Assessment row in Python.
    """
    summary = analytics_service.get_dashboard_summary(db)
    cases = list_assessments_for_officer(db)
    return {**summary, "cases": cases}


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), officer: models.User = Depends(require_officer)):
    """
    Fuller analytics view for charts: breakdown by risk level, by channel,
    average SVI per risk level, daily trend, and unacknowledged alert counts.
    All computed with SQL aggregate queries, not Python loops.
    """
    return {
        "risk_level_breakdown": analytics_service.get_risk_level_breakdown(db),
        "channel_breakdown": analytics_service.get_channel_breakdown(db),
        "svi_by_risk": analytics_service.get_svi_stats_by_risk(db),
        "daily_trend": analytics_service.get_daily_trend(db),
        "unacknowledged_alerts": analytics_service.get_unacknowledged_alerts_summary(db),
    }


@router.get("/worklist")
def worklist(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    officer: models.User = Depends(require_officer),
):
    """
    High/critical cases joined with victim contact info, sorted by urgency
    then recency — an officer's actual to-do list. Built with a single SQL
    JOIN + ORDER BY (see analytics_service.get_priority_worklist), not a
    Python filter over a full table scan.
    """
    return {"worklist": analytics_service.get_priority_worklist(db, limit=limit)}