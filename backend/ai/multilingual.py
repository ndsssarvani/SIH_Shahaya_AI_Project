"""
Language detection + translation-to-English for multilingual victim intake
across NHAA (14566), Integrated Portal, chatbot, IVRS, and mobile app —
covering Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati,
Punjabi, Odia, Urdu, Hinglish, and English.
"""
import re
from typing import Optional

# (start, end) inclusive Unicode code-point ranges per script.
_SCRIPT_RANGES = {
    "hi": (0x0900, 0x097F),  # Devanagari — Hindi, Marathi, etc.
    "bn": (0x0980, 0x09FF),  # Bengali / Assamese
    "pa": (0x0A00, 0x0A7F),  # Gurmukhi — Punjabi
    "gu": (0x0A80, 0x0AFF),  # Gujarati
    "or": (0x0B00, 0x0B7F),  # Odia
    "ta": (0x0B80, 0x0BFF),  # Tamil
    "te": (0x0C00, 0x0C7F),  # Telugu
    "kn": (0x0C80, 0x0CFF),  # Kannada
    "ml": (0x0D00, 0x0D7F),  # Malayalam
    "ur": (0x0600, 0x06FF),  # Arabic script — Urdu
}

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "bn": "Bengali", "pa": "Punjabi",
    "gu": "Gujarati", "or": "Odia", "ta": "Tamil", "te": "Telugu",
    "kn": "Kannada", "ml": "Malayalam", "ur": "Urdu", "hinglish": "Hinglish",
}

# Romanized / code-mixed Indic triggers (Hinglish / Tanglish)
_HINGLISH_PATTERNS = [
    r"\b(humko|mujhko|meri|mera|humein|hamari|unhone|unka|hamare)\b",
    r"\b(dhamki|maar|maara|peta|peeta|jaan se|maar denge|chhod|chhodna)\b",
    r"\b(madad|bachao|bachaoo|dar|darr|darr lag raha|dar lag|chinta)\b",
    r"\b(boycott|bahishkar|gaon se nikal|nikal diya|paani nahi)\b",
    r"\b(police|shikayat|darj|report|thane)\b",
    r"\b(bhayam|bayamaaga|chachipothanu|sagavendum)\b",
]

# Offline fallback translations for acute crisis keywords when offline
_OFFLINE_INDIC_FALLBACK = {
    # Hindi / Hinglish
    "dhamki": "threat",
    "dhamkiyan": "threats",
    "jaan se maar denge": "death threat",
    "maar peet": "assault and battery",
    "peeta": "beaten",
    "maara": "attacked",
    "bahishkar": "social boycott",
    "samajik bahishkar": "social boycott",
    "nikal diya": "displaced forced out",
    "dar lag raha hai": "terrified scared",
    "darr": "fear",
    "madad chahiye": "need urgent help",
    "bachao": "save me help",
    "khudkushi": "suicide",
    "mar jaunga": "suicide want to die",
    "mar jaungi": "suicide want to die",
    "marne ka man": "suicidal thoughts",
    "koi nahi sun raha": "no one is listening alone",
    "koi madad nahi": "no support isolated",
    "ghar se nikal diya": "displaced from home",
    "shikayat": "complaint",
    "police": "police",
    "chhuachhut": "untouchability discrimination",
    "jati": "caste",
    "dalit": "dalit scheduled caste",
    
    # Telugu (Devanagari/Latin)
    "bhayam": "fear scared",
    "chachipovali": "want to die suicide",
    "champesthamu": "death threat kill",
    "bediristunnaru": "threatening",
    "kottaru": "beaten assaulted",
    
    # Tamil (Latin)
    "bayamaaga": "fear scared",
    "kolai mirattal": "death threat",
    "adithargal": "beaten assaulted",
}


def detect_language(text: str) -> str:
    """Detects native Indic scripts or Romanized code-mixed Indic (Hinglish)."""
    clean = (text or "").strip()
    if not clean:
        return "en"

    # 1. Native script detection
    counts = {code: 0 for code in _SCRIPT_RANGES}
    for ch in clean:
        cp = ord(ch)
        for code, (start, end) in _SCRIPT_RANGES.items():
            if start <= cp <= end:
                counts[code] += 1
                break

    best_code, best_count = max(counts.items(), key=lambda kv: kv[1])
    if best_count >= 2 or (best_count > 0 and len(clean) < 10):
        return best_code

    # 2. Check for Romanized Indic (Hinglish)
    clean_lower = clean.lower()
    for pattern in _HINGLISH_PATTERNS:
        if re.search(pattern, clean_lower):
            return "hinglish"

    return "en"


def _offline_indic_mapper(text: str) -> str:
    """Substitutes known Indic distress terms with English equivalents."""
    mapped = text.lower()
    for indic_term, en_term in _OFFLINE_INDIC_FALLBACK.items():
        if indic_term in mapped:
            mapped = mapped.replace(indic_term, f" {en_term} ")
    return mapped


def translate_to_english(text: str, source_lang: Optional[str] = None) -> str:
    """
    Translates input text from any Indian language or Hinglish into English
    using deep-translator (Google Translate) with an offline dictionary fallback.
    """
    if not text or not text.strip():
        return ""

    lang = source_lang or detect_language(text)
    clean_text = text.strip()

    if lang == "en":
        # Even for English, apply Hinglish mapper in case of transliterated phrases
        return _offline_indic_mapper(clean_text)

    # If Hinglish, map keywords first
    if lang == "hinglish":
        enriched = _offline_indic_mapper(clean_text)
        try:
            from deep_translator import GoogleTranslator
            translated = GoogleTranslator(source="auto", target="en").translate(enriched)
            return translated if translated else enriched
        except Exception:
            return enriched

    # Native Indic Script translation via Google Translate
    try:
        from deep_translator import GoogleTranslator
        src_code = lang if lang in ("hi", "bn", "pa", "gu", "ta", "te", "kn", "ml", "ur", "mr", "or") else "auto"
        translated = GoogleTranslator(source=src_code, target="en").translate(clean_text)
        if translated and translated.strip():
            return translated.strip()
    except Exception as e:
        print(f"[Multilingual Translation Fallback] MT call failed ({e!r}), using offline dictionary.")

    # Offline dictionary fallback for native or non-English text
    return _offline_indic_mapper(clean_text)


