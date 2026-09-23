"""
Combines SVI score + indicators into Low / Moderate / High / Critical,
per the problem statement's four-tier risk categorization.
"""
from typing import Dict, List
from database.models import RiskLevel

# Indicators that should force Critical regardless of the numeric SVI score —
# these map directly to "signs of severe trauma... suicidal ideation" etc.
_CRITICAL_OVERRIDE_CATEGORIES = {"suicidal_ideation", "severe_violence"}


def assess_risk(svi_score: float, indicators: Dict[str, List[str]]) -> RiskLevel:
    if _CRITICAL_OVERRIDE_CATEGORIES & indicators.keys():
        return RiskLevel.critical
    if svi_score >= 75:
        return RiskLevel.critical
    if svi_score >= 50 or "intimidation" in indicators:
        return RiskLevel.high
    if svi_score >= 25:
        return RiskLevel.moderate
    return RiskLevel.low
