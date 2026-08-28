"""
CRUD + business logic for assessments, complaints, and alerts —
called by the api/ routers so routers stay thin.
"""
import json
import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from database import models
from ai import (
    text_nlp,
    emotion_ai,
    multilingual,
    speech_analytics,
    indicators as indicators_module,
    model_loader,
)
from integrations.channels import notify_officer_channel
from realtime.websocket import dispatch_alert_event

_RISK_MAP = {
    "low": models.RiskLevel.low,
    "moderate": models.RiskLevel.moderate,
    "medium": models.RiskLevel.moderate,
    "high": models.RiskLevel.high,
    "critical": models.RiskLevel.critical,
}


def run_assessment(
    db: Session,
    user_id: int,
    raw_text: str,
    audio_path: Optional[str] = None,
    channel: models.Channel = models.Channel.other,
    consent_given: bool = False,
) -> models.Assessment:
    """Runs the full multilingual + ML text + speech AI pipeline and stores the result."""
    # 1. Multilingual Translation & Transliteration
    language = multilingual.detect_language(raw_text)
    translated_text = multilingual.translate_to_english(raw_text, language)

    # 2. Acoustic Speech Analytics (if audio is provided)
    speech_features = speech_analytics.analyze_voice(audio_path) if audio_path else None

    # 3. ML Risk Engine (StressModel + TraumaMultiLabelModel + Multimodal Fusion)
    engine = model_loader.get_risk_engine()
    ml_result = engine.assess_case(
        text=translated_text or raw_text,
        features=speech_features if speech_features and speech_features.get("analysis") == "ok" else None,
    )

    # 4. Extract Evidentiary Trauma & Caste Atrocity Indicators
    nlp_result = text_nlp.analyze_text(translated_text)
    emotion_scores = emotion_ai.detect_emotion(nlp_result["cleaned_text"])
    flagged = indicators_module.extract_indicators(nlp_result["cleaned_text"], emotion_scores)

    # Overlay ML multi-label classification flags
    trauma_info = ml_result.get("components", {}).get("trauma", {})
    for label in trauma_info.get("flagged_labels", []):
        if label not in flagged:
            flagged[label] = ["ml_classified"]

    # 5. Determine Final SVI Score & Risk Tier
    score = float(ml_result.get("svi_score", 0.0))
    risk_str = ml_result.get("risk_category", "Low").lower()
    risk = _RISK_MAP.get(risk_str, models.RiskLevel.low)

    # Safety backstop override for explicit suicidal ideation / severe violence
    if "suicidal_ideation" in flagged or "severe_violence" in flagged:
        risk = models.RiskLevel.critical
        score = max(score, 88.0)


    assessment = models.Assessment(
        user_id=user_id,
        channel=channel,
        raw_text=raw_text,
        audio_path=audio_path,
        detected_language=language,
        svi_score=score,
        risk_level=risk,
        indicators=json.dumps(flagged),
        consent_given=consent_given,
        consent_timestamp=datetime.datetime.utcnow() if consent_given else None,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    if risk in (models.RiskLevel.high, models.RiskLevel.critical):
        alert_msg = f"{risk.value.upper()} risk assessment (SVI: {score}) via {channel.value}"
        alert = models.Alert(
            assessment_id=assessment.id,
            message=alert_msg,
            level=risk,
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        notify_officer_channel(alert.message)
        dispatch_alert_event({
            "type": "NEW_ALERT",
            "alert_id": alert.id,
            "assessment_id": assessment.id,
            "level": risk.value,
            "svi_score": score,
            "channel": channel.value,
            "message": alert.message,
            "created_at": alert.created_at.isoformat() if alert.created_at else datetime.datetime.utcnow().isoformat(),
        })

    return assessment



def get_assessment(db: Session, assessment_id: int) -> Optional[models.Assessment]:
    return db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()


def list_assessments_for_officer(db: Session) -> List[models.Assessment]:
    return db.query(models.Assessment).order_by(models.Assessment.created_at.desc()).all()


def create_complaint(db: Session, user_id: int, description: str) -> models.Complaint:
    complaint = models.Complaint(user_id=user_id, description=description)
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def list_complaints(db: Session) -> List[models.Complaint]:
    return db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
