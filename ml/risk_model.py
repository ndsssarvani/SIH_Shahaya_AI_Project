"""
ml/risk_model.py
-----------------
Risk Engine for the AI-Based Real-Time Stress & Trauma Assessment Module
(NHAA 14566 / Integrated Portal).

Combines:
  - stress_model.StressAssessmentModel  -> stress_score (0-100)
  - trauma_model.TraumaIndicatorModel   -> trauma indicator flags/probabilities
  - case-context vulnerability factors  -> crime severity, repeat victimisation,
                                            social boycott, displacement, threats,
                                            prior trauma history (NOT identity
                                            attributes such as caste/religion --
                                            see design note below)

...into a single **Stress Vulnerability Index (SVI)** on a 0-100 scale,
a risk category (Low / Moderate / High / Critical), and a recommended set
of interventions (counselling, legal aid, medical assistance, police
intervention, witness protection, emergency support).

DESIGN / ETHICS NOTE
---------------------
Per the problem statement's requirement to "maintain privacy, informed
consent, confidentiality, and ethical AI standards", the vulnerability
context features intentionally describe the *incident* (severity, threats,
displacement, repeat victimisation) rather than the victim's caste/religion/
identity. Identity should never be used as a scoring feature -- it can
inform *service allocation* (e.g. routing to SC/ST-specific legal aid) but
must never inflate or deflate someone's individual risk score.

SAFETY OVERRIDE
-----------------
Regardless of the computed numeric SVI, if the trauma model flags
`suicidal_ideation`, the case is force-escalated to Critical with emergency
support recommended. A human counsellor/officer must always review
Critical-risk cases -- this module is a triage aid, not an autonomous
decision-maker.
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from stress_model import StressAssessmentModel
from trauma_model import TraumaIndicatorModel

SVI_THRESHOLDS = [
    (25, "Low"),
    (50, "Moderate"),
    (75, "High"),
    (101, "Critical"),
]

# Weights for combining the three input signals into the SVI (must sum to 1.0
# across stress + trauma + context).
WEIGHTS = {
    "stress": 0.35,
    "trauma": 0.40,
    "context": 0.25,
}

# Context vulnerability factors and how much each contributes (0-1 scale,
# combined with equal-ish emphasis then scaled by WEIGHTS['context']).
CONTEXT_FACTOR_WEIGHTS = {
    "crime_severity": 0.30,          # 1 (minor) - 5 (murder/rape/gang violence) -> normalised /5
    "repeat_victimization": 0.15,    # bool
    "social_boycott_flag": 0.15,     # bool
    "displacement_flag": 0.15,       # bool
    "threat_intimidation_flag": 0.15,  # bool
    "prior_trauma_history": 0.10,    # bool
}

RECOMMENDATION_RULES = {
    "Low": ["counselling_info_pack"],
    "Moderate": ["counselling", "legal_aid_info"],
    "High": ["counselling", "legal_aid", "medical_assistance"],
    "Critical": ["counselling", "legal_aid", "medical_assistance",
                 "police_intervention", "emergency_support"],
}


def svi_category(score: float) -> str:
    for threshold, label in SVI_THRESHOLDS:
        if score < threshold:
            return label
    return "Critical"


def _context_score(context: dict) -> float:
    """Normalise a context/vulnerability dict into a 0-1 score."""
    if not context:
        return 0.0
    total_weight, weighted_sum = 0.0, 0.0
    for key, weight in CONTEXT_FACTOR_WEIGHTS.items():
        if key not in context or context[key] is None:
            continue
        val = context[key]
        if key == "crime_severity":
            val = float(np.clip(val, 1, 5) - 1) / 4.0  # 1-5 -> 0-1
        else:
            val = float(bool(val))
        weighted_sum += weight * val
        total_weight += weight
    if total_weight == 0:
        return 0.0
    return weighted_sum / total_weight


class RiskEngine:
    """Ties StressAssessmentModel + TraumaIndicatorModel + case context into
    a single Stress Vulnerability Index (SVI) and recommended interventions."""

    def __init__(self, stress_model: StressAssessmentModel = None,
                 trauma_model: TraumaIndicatorModel = None):
        self.stress_model = stress_model or StressAssessmentModel()
        self.trauma_model = trauma_model or TraumaIndicatorModel()

    def ensure_trained(self):
        """Convenience: train both sub-models from scratch if not already loaded."""
        if self.stress_model.pipeline is None:
            self.stress_model.train()
        if self.trauma_model.pipeline is None:
            self.trauma_model.train()

    def assess_case(self, text: str, features: dict = None, context: dict = None) -> dict:
        """
        text: victim/complainant narrative (chatbot, IVRS transcript, portal text, etc.)
        features: optional pre-extracted multimodal features (see stress_model.RULE_WEIGHTS)
        context: optional case/vulnerability context (see CONTEXT_FACTOR_WEIGHTS)
        """
        stress_result = self.stress_model.assess(text=text, features=features)
        trauma_result = self.trauma_model.predict(text)
        context_score_0_1 = _context_score(context or {})

        stress_component = stress_result["stress_score"]
        trauma_component = trauma_result["trauma_severity_score"]
        context_component = 100 * context_score_0_1

        svi = (
            WEIGHTS["stress"] * stress_component
            + WEIGHTS["trauma"] * trauma_component
            + WEIGHTS["context"] * context_component
        )
        svi = float(np.clip(svi, 0, 100))
        category = svi_category(svi)

        safety_override_applied = False
        if trauma_result["indicators"].get("suicidal_ideation") == 1:
            svi = max(svi, 90)
            category = "Critical"
            safety_override_applied = True

        recommendations = list(RECOMMENDATION_RULES[category])
        if trauma_result["indicators"].get("intimidation") or (context or {}).get("threat_intimidation_flag"):
            if "witness_protection" not in recommendations:
                recommendations.append("witness_protection")
        if trauma_result["indicators"].get("extreme_vulnerability") and "medical_assistance" not in recommendations:
            recommendations.append("medical_assistance")

        return {
            "svi_score": round(svi, 1),
            "risk_category": category,
            "safety_override_applied": safety_override_applied,
            "recommended_actions": recommendations,
            "requires_human_review": category in ("High", "Critical"),
            "components": {
                "stress": stress_result,
                "trauma": trauma_result,
                "context_score_0_100": round(context_component, 1),
            },
        }

    # --------------------------------------------------------- persistence
    def save(self, stress_path=None, trauma_path=None):
        self.stress_model.save_model(**({"path": stress_path} if stress_path else {}))
        self.trauma_model.save_model(**({"path": trauma_path} if trauma_path else {}))

    def load(self, stress_path=None, trauma_path=None):
        self.stress_model.load_model(**({"path": stress_path} if stress_path else {}))
        self.trauma_model.load_model(**({"path": trauma_path} if trauma_path else {}))
        return self


# ------------------------------------------------------------------ self-test
if __name__ == "__main__":
    engine = RiskEngine()
    engine.ensure_trained()
    engine.save()

    print("\n=== Case 1: routine status enquiry ===")
    r1 = engine.assess_case(
        text="I wanted to check the status of my complaint and what documents are pending.",
        context={"crime_severity": 1, "repeat_victimization": False},
    )
    print({"svi_score": r1["svi_score"], "risk_category": r1["risk_category"],
           "recommended_actions": r1["recommended_actions"]})

    print("\n=== Case 2: repeated intimidation, moderate-high context ===")
    r2 = engine.assess_case(
        text="They told me if I go to the police again they will make sure I regret it, I'm terrified.",
        context={"crime_severity": 3, "threat_intimidation_flag": True, "repeat_victimization": True},
    )
    print({"svi_score": r2["svi_score"], "risk_category": r2["risk_category"],
           "recommended_actions": r2["recommended_actions"]})

    print("\n=== Case 3: severe incident with suicidal ideation (safety override) ===")
    r3 = engine.assess_case(
        text="My brother was murdered and I want to kill myself, I can't go on living, I have nothing left.",
        context={"crime_severity": 5, "displacement_flag": True, "social_boycott_flag": True,
                 "threat_intimidation_flag": True, "prior_trauma_history": True},
    )
    print({"svi_score": r3["svi_score"], "risk_category": r3["risk_category"],
           "safety_override_applied": r3["safety_override_applied"],
           "recommended_actions": r3["recommended_actions"]})

    # --------------------------------------------------- basic sanity checks
    assert r1["risk_category"] in ("Low", "Moderate")
    assert r3["risk_category"] == "Critical" and r3["safety_override_applied"] is True
    assert r3["svi_score"] > r1["svi_score"]
    assert "emergency_support" in r3["recommended_actions"]
    assert r1["svi_score"] <= r2["svi_score"] <= r3["svi_score"] or r2["risk_category"] != "Low"
    print("\n[SELF-TEST] All sanity checks passed.")