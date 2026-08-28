"""
Support-resource recommendations shown to the victim (and routed to the
officer dashboard) after an assessment — mapped from BOTH the overall risk
level AND the specific indicators that fired, per the problem statement's
"recommend counselling, legal aid, medical assistance, police intervention,
witness protection, or emergency support based on risk level" requirement.

TODO: replace the static label map with a curated, location-aware resource
directory (district-wise counsellor/legal-aid/police contacts).
"""
from typing import Dict, List, Optional

from database.models import RiskLevel

_BASE_RECOMMENDATIONS: Dict[RiskLevel, List[str]] = {
    RiskLevel.low: ["counselling"],
    RiskLevel.moderate: ["counselling", "legal_aid"],
    RiskLevel.high: ["counselling", "legal_aid", "police_intervention"],
    RiskLevel.critical: ["counselling", "legal_aid", "police_intervention", "emergency_support"],
}

# Extra recommendations triggered by specific indicator categories,
# independent of the overall risk level.
_INDICATOR_RECOMMENDATIONS: Dict[str, List[str]] = {
    "suicidal_ideation": ["emergency_support", "medical_assistance"],
    "severe_violence": ["police_intervention", "medical_assistance", "witness_protection"],
    "intimidation": ["witness_protection", "police_intervention"],
    "social_isolation": ["counselling", "rehabilitation_support"],
    "extreme_vulnerability": ["medical_assistance", "rehabilitation_support"],
    "caste_atrocity_context": ["legal_aid", "district_administration_referral"],
}

_LABELS = {
    "counselling": "Counselling / mental health support",
    "legal_aid": "Free legal aid referral",
    "medical_assistance": "Medical assistance",
    "police_intervention": "Police intervention",
    "witness_protection": "Witness protection",
    "emergency_support": "Emergency support (24/7 crisis line + immediate escalation)",
    "rehabilitation_support": "Rehabilitation / welfare authority referral",
    "district_administration_referral": "District administration referral",
}


def get_recommendations(
    risk_level: RiskLevel,
    indicators: Optional[Dict[str, List[str]]] = None,
) -> List[str]:
    codes = list(_BASE_RECOMMENDATIONS.get(risk_level, _BASE_RECOMMENDATIONS[RiskLevel.low]))

    for category in (indicators or {}):
        for code in _INDICATOR_RECOMMENDATIONS.get(category, []):
            if code not in codes:
                codes.append(code)

    return [_LABELS.get(code, code) for code in codes]
