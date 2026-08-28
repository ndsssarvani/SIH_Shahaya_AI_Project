"""
Speech-to-text for uploaded audio evidence.
TODO: wire up a real ASR engine (e.g. Whisper, Vosk, or a cloud STT API).
"""
import os


def transcribe_audio(audio_path: str) -> str:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    # Placeholder — swap for a real speech-to-text call.
    return ""
