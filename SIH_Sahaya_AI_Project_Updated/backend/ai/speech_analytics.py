"""
Speech Analytics: Pitch variation, pause ratio, speech rate, and vocal distress
from uploaded voice recordings, WebM microphone streams, and IVRS calls.
Feeds into the Stress Vulnerability Index (SVI) alongside Text NLP and Emotion AI.
"""
from typing import Dict, Optional
import os

try:
    import numpy as np
    import soundfile as sf
    import librosa
    _LIBROSA_AVAILABLE = True
except ImportError:
    _LIBROSA_AVAILABLE = False


def analyze_voice(audio_path: str) -> Optional[Dict]:
    """
    Analyzes an audio file for vocal markers of acute distress:
      - Pitch variation (f0 jitter & tremors)
      - Pause ratio (silence / emotional choking / breathlessness)
      - Speech rate & articulation tempo
      - RMS energy fluctuations (bursts / crying / agitation)
      - Composite Vocal Distress Index (0-100)
    """
    if not audio_path or not os.path.exists(audio_path):
        return {"analysis": "unavailable", "reason": "audio file not found"}

    if not _LIBROSA_AVAILABLE:
        return {
            "analysis": "unavailable",
            "reason": "librosa/soundfile not installed",
        }

    try:
        y, sr = librosa.load(audio_path, sr=16000)
    except Exception as e:
        # Fallback to soundfile directly if librosa load fails on some containers
        try:
            data, sr = sf.read(audio_path)
            if data.ndim > 1:
                y = data.mean(axis=1)
            else:
                y = data
        except Exception:
            return {"analysis": "unavailable", "reason": f"could not decode audio ({e!r})"}

    if y is None or len(y) == 0:
        return {"analysis": "unavailable", "reason": "empty audio data"}

    total_duration = float(len(y)) / float(sr)
    if total_duration < 0.2:
        return {"analysis": "unavailable", "reason": "audio too short for reliable acoustic analysis"}

    # 1. Pitch (f0) extraction via pyin
    try:
        f0, voiced_flag, _ = librosa.pyin(
            y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr
        )
        voiced_f0 = f0[voiced_flag] if voiced_flag is not None else np.array([])
        pitch_variation = float(np.nanstd(voiced_f0)) if voiced_f0.size else 0.0
        avg_pitch = float(np.nanmean(voiced_f0)) if voiced_f0.size else 0.0
    except Exception:
        pitch_variation, avg_pitch = 0.0, 0.0

    # 2. Silence & Pause detection
    try:
        intervals = librosa.effects.split(y, top_db=25)
        voiced_duration = sum((end - start) for start, end in intervals) / float(sr)
        pause_ratio = max(0.0, min(1.0, 1.0 - (voiced_duration / total_duration)))
        speech_rate = float(len(intervals)) / total_duration if total_duration > 0 else 0.0
    except Exception:
        pause_ratio, speech_rate = 0.0, 0.0

    # 3. RMS Energy & Intensity Fluctuations
    try:
        rms = librosa.feature.rms(y=y)[0]
        rms_mean = float(np.mean(rms))
        rms_std = float(np.std(rms))
        energy_variance = (rms_std / (rms_mean + 1e-6))
    except Exception:
        energy_variance = 0.0

    # 4. Composite Vocal Distress Index (0-100)
    # High pitch jitter + high pause ratio + high energy spikes = elevated vocal distress
    pitch_distress = min(100.0, (pitch_variation / 50.0) * 100.0)
    pause_distress = min(100.0, (pause_ratio / 0.6) * 100.0)
    energy_distress = min(100.0, (energy_variance / 1.2) * 100.0)

    vocal_distress = (0.40 * pitch_distress) + (0.35 * pause_distress) + (0.25 * energy_distress)
    vocal_distress = float(np.clip(vocal_distress, 0.0, 100.0))

    return {
        "analysis": "ok",
        "duration_sec": float(round(total_duration, 2)),
        "avg_pitch_hz": float(round(avg_pitch, 1)),
        "pitch_variation": float(round(pitch_variation, 2)),
        "pause_ratio": float(round(float(pause_ratio), 3)),
        "speech_rate": float(round(float(speech_rate), 2)),
        "vocal_distress_score": float(round(float(vocal_distress), 1)),
        "vocal_markers": {
            "vocal_tremor": bool(float(pitch_variation) > 35.0),
            "breathlessness_or_pauses": bool(float(pause_ratio) > 0.40),
            "intensity_agitation": bool(float(energy_variance) > 0.80),
        },
    }


