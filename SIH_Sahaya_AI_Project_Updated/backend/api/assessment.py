"""
Victim-facing endpoint: submit a text/voice statement (via helpline,
Integrated Portal, chatbot, IVRS, or mobile app) and get back an
AI-generated Stress Vulnerability Index, risk category, and support
recommendations.
"""
import os
import json
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, Body, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database.connection import get_db
from database import models
from security.security import get_optional_current_user
from services.case_service import run_assessment
from services.recommendation import get_recommendations

router = APIRouter(prefix="/assessment", tags=["assessment"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "audio")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AssessmentPayload(BaseModel):
    text: str = ""
    channel: models.Channel = models.Channel.other
    consent_given: bool = True


@router.post("/submit")
async def submit_assessment(
    request: Request,
    text: str = Form(None),
    channel: Optional[models.Channel] = Form(None),
    consent_given: Optional[bool] = Form(None),
    audio: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_optional_current_user),
):
    # Support both JSON Body and Form/Multipart Data
    content_type = request.headers.get("content-type", "")
    submission_text = text or ""
    submission_channel = channel or models.Channel.chatbot
    submission_consent = True if consent_given is None else bool(consent_given)

    if "application/json" in content_type:
        try:
            body = await request.json()
            submission_text = body.get("text", submission_text)
            if "channel" in body:
                submission_channel = models.Channel(body.get("channel"))
            if "consent_given" in body:
                submission_consent = bool(body.get("consent_given"))
        except Exception:
            pass

    audio_path = None
    if audio is not None:
        filename = f"{uuid.uuid4().hex}_{audio.filename}"
        audio_path = os.path.join(UPLOAD_DIR, filename)
        with open(audio_path, "wb") as f:
            f.write(await audio.read())

    assessment = run_assessment(
        db,
        current_user.id,
        raw_text=submission_text,
        audio_path=audio_path,
        channel=submission_channel,
        consent_given=submission_consent,
    )
    flagged_indicators = json.loads(assessment.indicators or "{}")
    recommendations = get_recommendations(assessment.risk_level, flagged_indicators)

    from ai.speech_analytics import analyze_voice
    from ai.chat_assistant import generate_conversational_reply
    speech_data = analyze_voice(audio_path) if audio_path else None

    risk_str = assessment.risk_level.value if hasattr(assessment.risk_level, "value") else str(assessment.risk_level)
    bot_reply = generate_conversational_reply(
        user_text=assessment.raw_text,
        detected_language=assessment.detected_language,
        risk_level=risk_str,
        svi_score=assessment.svi_score,
    )

    response = {
        "assessment_id": assessment.id,
        "channel": assessment.channel.value if hasattr(assessment.channel, "value") else str(assessment.channel),
        "raw_text": assessment.raw_text,
        "audio_url": f"/assessment/audio/{os.path.basename(audio_path)}" if audio_path else None,
        "speech_features": speech_data if speech_data and speech_data.get("analysis") == "ok" else None,
        "detected_language": assessment.detected_language,
        "svi_score": assessment.svi_score,
        "risk_level": risk_str,
        "indicators": flagged_indicators,
        "recommendations": recommendations,
        "bot_reply": bot_reply,
        "emotion": getattr(assessment, "emotion_result", None),
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
    }
    if not submission_consent:
        response["notice"] = (
            "Processed without recorded informed consent. See GET /privacy/policy."
        )
    return response


@router.get("/audio/{filename}")
def stream_audio(filename: str):
    from fastapi import HTTPException
    from fastapi.responses import FileResponse
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio recording not found")
    return FileResponse(file_path)



@router.get("/{assessment_id}")
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    from services.case_service import get_assessment as fetch
    from ai.speech_analytics import analyze_voice
    assessment = fetch(db, assessment_id)
    if not assessment:
        return {"error": "Assessment not found", "id": assessment_id}
    
    flagged_indicators = json.loads(assessment.indicators or "{}")
    recommendations = get_recommendations(assessment.risk_level, flagged_indicators)
    speech_data = analyze_voice(assessment.audio_path) if assessment.audio_path else None
    
    return {
        "id": assessment.id,
        "user_id": assessment.user_id,
        "channel": assessment.channel.value if hasattr(assessment.channel, "value") else str(assessment.channel),
        "raw_text": assessment.raw_text,
        "audio_url": f"/assessment/audio/{os.path.basename(assessment.audio_path)}" if assessment.audio_path else None,
        "speech_features": speech_data if speech_data and speech_data.get("analysis") == "ok" else None,
        "detected_language": assessment.detected_language,
        "svi_score": assessment.svi_score,
        "risk_level": assessment.risk_level.value if hasattr(assessment.risk_level, "value") else str(assessment.risk_level),
        "indicators": flagged_indicators,
        "recommendations": recommendations,
        "emotion": getattr(assessment, "emotion_result", None),
        "consent_given": assessment.consent_given,
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
    }