"""
Stress Vulnerability Index (SVI) calculation — 0-100 scale.
Combines Emotion AI output, text-based indicators, and (when available)
voice-based speech analytics (pitch variation, pauses).

TODO: this weighted formula is a reasonable hackathon baseline, not a
clinically validated instrument — get it reviewed by the counsellors/mental
health professionals listed as stakeholders before relying on it operationally.
"""
from typing import Dict, List, Optional


def calculate_svi(
    emotion_scores: Dict[str, float],
    indicators: Dict[str, List[str]],
    speech_features: Optional[Dict] = None,
) -> float:
    emotion_component = sum(emotion_scores.values()) / max(len(emotion_scores), 1)
    indicator_component = min(1.0, len(indicators) / 5)

    speech_component = 0.0
    if speech_features and speech_features.get("analysis") == "ok":
        # Erratic pitch + more pauses are treated as distress signals.
        pitch_signal = min(1.0, speech_features["pitch_variation"] / 50)
        pause_signal = min(1.0, speech_features["pause_ratio"])
        speech_component = (pitch_signal + pause_signal) / 2

    if speech_component:
        svi = (0.45 * emotion_component + 0.35 * indicator_component + 0.20 * speech_component) * 100
    else:
        svi = (0.6 * emotion_component + 0.4 * indicator_component) * 100

    return round(svi, 2)
