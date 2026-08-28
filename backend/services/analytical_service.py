"""
Dashboard analytics — real SQL (GROUP BY / JOIN / aggregates), not Python loops.

Previously, api/officer.py pulled every Assessment row into Python objects
via the ORM and counted risk levels with `sum(1 for a in assessments if ...)`.
That works, but it means every dashboard refresh drags the full assessments
table over the wire just to compute a handful of numbers, and it can't express
things like "average SVI per risk level" or "cases per day" without more
Python loops.

These functions push that work down to SQLite with actual SQL statements,
executed via SQLAlchemy's `text()` (parameterized to avoid injection), and
return plain dicts/lists ready to serialize to JSON.

All queries are read-only (SELECT) and safe to call as often as the
dashboard is refreshed.
"""
from typing import Dict, List

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_risk_level_breakdown(db: Session) -> List[Dict]:
    """COUNT(*) of assessments per risk level, e.g. for the dashboard cards."""
    sql = text(
        """
        SELECT risk_level, COUNT(*) AS count
        FROM assessments
        WHERE risk_level IS NOT NULL
        GROUP BY risk_level
        """
    )
    rows = db.execute(sql).mappings().all()
    return [dict(r) for r in rows]


def get_channel_breakdown(db: Session) -> List[Dict]:
    """COUNT(*) of assessments per intake channel (helpline, IVRS, chatbot...)."""
    sql = text(
        """
        SELECT channel, COUNT(*) AS count
        FROM assessments
        GROUP BY channel
        ORDER BY count DESC
        """
    )
    rows = db.execute(sql).mappings().all()
    return [dict(r) for r in rows]


def get_svi_stats_by_risk(db: Session) -> List[Dict]:
    """AVG / MIN / MAX Stress Vulnerability Index per risk level."""
    sql = text(
        """
        SELECT
            risk_level,
            ROUND(AVG(svi_score), 2) AS avg_svi,
            MIN(svi_score) AS min_svi,
            MAX(svi_score) AS max_svi,
            COUNT(*) AS n
        FROM assessments
        WHERE svi_score IS NOT NULL AND risk_level IS NOT NULL
        GROUP BY risk_level
        """
    )
    rows = db.execute(sql).mappings().all()
    return [dict(r) for r in rows]


def get_daily_trend(db: Session, days: int = 30) -> List[Dict]:
    """
    Cases per day for the last `days` days, split out critical-risk count,
    for a trend chart on the dashboard.
    """
    sql = text(
        """
        SELECT
            DATE(created_at) AS day,
            COUNT(*) AS total_cases,
            SUM(CASE WHEN risk_level = 'critical' THEN 1 ELSE 0 END) AS critical_cases,
            SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) AS high_cases
        FROM assessments
        WHERE created_at >= DATE('now', :days_ago)
        GROUP BY DATE(created_at)
        ORDER BY day
        """
    )
    rows = db.execute(sql, {"days_ago": f"-{days} days"}).mappings().all()
    return [dict(r) for r in rows]


def get_unacknowledged_alerts_summary(db: Session) -> List[Dict]:
    """COUNT of un-acknowledged alerts per severity — surfaces what officers still owe attention."""
    sql = text(
        """
        SELECT level, COUNT(*) AS count
        FROM alerts
        WHERE acknowledged = 0
        GROUP BY level
        ORDER BY
            CASE level
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'moderate' THEN 3
                ELSE 4
            END
        """
    )
    rows = db.execute(sql).mappings().all()
    return [dict(r) for r in rows]


def get_priority_worklist(db: Session, limit: int = 50) -> List[Dict]:
    """
    High/critical cases joined with the victim's contact info — the officer's
    actual worklist, ordered so the most urgent + most recent cases sort first.
    """
    sql = text(
        """
        SELECT
            a.id            AS assessment_id,
            u.id            AS user_id,
            u.name          AS user_name,
            u.email         AS user_email,
            a.channel       AS channel,
            a.svi_score     AS svi_score,
            a.risk_level    AS risk_level,
            a.detected_language AS detected_language,
            a.created_at    AS created_at
        FROM assessments a
        JOIN users u ON u.id = a.user_id
        WHERE a.risk_level IN ('critical', 'high')
        ORDER BY
            CASE a.risk_level WHEN 'critical' THEN 0 WHEN 'high' THEN 1 ELSE 2 END,
            a.created_at DESC
        LIMIT :limit
        """
    )
    rows = db.execute(sql, {"limit": limit}).mappings().all()
    return [dict(r) for r in rows]


def get_dashboard_summary(db: Session) -> Dict:
    """
    Single call bundling everything the officer dashboard needs — total count
    via SQL COUNT(*), plus the breakdowns above. This replaces the old
    `len(assessments)` / `sum(1 for a in assessments if ...)` Python loop.
    """
    total_sql = text("SELECT COUNT(*) AS total FROM assessments")
    total = db.execute(total_sql).scalar_one()

    breakdown = {row["risk_level"]: row["count"] for row in get_risk_level_breakdown(db)}

    return {
        "total_cases": total,
        "critical": breakdown.get("critical", 0),
        "high": breakdown.get("high", 0),
        "moderate": breakdown.get("moderate", 0),
        "low": breakdown.get("low", 0),
        "by_channel": get_channel_breakdown(db),
        "svi_by_risk": get_svi_stats_by_risk(db),
        "unacknowledged_alerts": get_unacknowledged_alerts_summary(db),
    }