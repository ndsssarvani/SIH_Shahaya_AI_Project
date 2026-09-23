"""
Text preprocessing + NLP feature extraction for assessment submissions.
TODO: replace the keyword pass with a proper NLP pipeline (spaCy/transformers).
"""
import re
from typing import List


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z']+", text.lower())


def analyze_text(text: str) -> dict:
    """Returns basic NLP features used downstream by indicators.py / svi.py."""
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    return {
        "cleaned_text": cleaned,
        "tokens": tokens,
        "word_count": len(tokens),
    }
