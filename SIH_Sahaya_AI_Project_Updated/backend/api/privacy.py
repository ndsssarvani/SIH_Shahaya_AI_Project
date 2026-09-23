"""
Privacy, informed-consent, and ethical-AI disclosure — required reading
before any assessment is submitted through any NHAA-approved channel
(14566 helpline, Integrated Portal, chatbot, IVRS, mobile app).
No auth required: this must be readable before login/consent happens.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/privacy", tags=["privacy"])


@router.get("/policy")
def get_privacy_policy():
    return {
        "purpose": (
            "This AI module assesses psychological stress and vulnerability "
            "only to prioritise support (counselling, legal aid, medical aid, "
            "police intervention, witness protection, emergency response). "
            "It does not make any legal determination of guilt or innocence, "
            "and is not a substitute for a mental health professional's assessment."
        ),
        "consent": (
            "Victims/complainants are informed that their voice and text "
            "interactions may be analysed by an AI system. Consent is recorded "
            "per submission via the `consent_given` field on /assessment/submit. "
            "Assistance is never withheld solely for lack of consent."
        ),
        "confidentiality": (
            "Assessment data is visible only to authorised officers "
            "(role=officer/admin) and is not shared outside the NHAA ecosystem "
            "without consent, except where required to prevent imminent harm."
        ),
        "data_retention": (
            "TODO: define a retention/deletion policy per applicable government "
            "data protection guidelines (e.g. DPDP Act, 2023) before production "
            "deployment."
        ),
        "rights": [
            "Right to be informed before assessment",
            "Right to request human review of an AI-generated risk category",
            "Right to access and correct personal data",
        ],
    }
