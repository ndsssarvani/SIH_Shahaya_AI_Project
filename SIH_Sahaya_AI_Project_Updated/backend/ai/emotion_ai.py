"""
Multilingual Multimodal Emotion AI Engine
Analyzes text, sentiment, Indic vocabulary, and acoustic speech prosody
to detect emotional state: Fear, Acute Distress, Sadness, Anger, and Calm/Neutral.
Supports English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Marathi (मराठी), and Kannada (ಕನ್ನಡ).
"""
import re
from typing import Dict, Optional

# Multilingual emotion lexicons
_EMOTION_LEXICON = {
    "fear": {
        "en": [
            "fear", "scared", "afraid", "terrified", "threat", "threatened", "threatening",
            "unsafe", "not safe", "no safety", "in danger", "danger", "panic", "shaking", "trembling",
            "kill us", "kill me", "murder", "attacked", "assaulted", "stalking", "stalker", "stalk",
            "following me", "follow me", "followed me", "following", "chasing", "chased", "watching me",
            "knife", "knives", "gun", "guns", "weapon", "weapons", "sword", "blade", "dagger",
            "pistol", "arms", "acid", "iron rod", "rod", "axe", "lathi", "armed", "cornered",
            "dread", "alarmed", "horrified", "harm me", "hurt me"
        ],
        "te": [
            "భయం", "భయంగా", "భయపడుతున్నాను", "బెదిరింపులు", "బెదిరిస్తున్నారు", "చంపుతామని",
            "చంపేస్తాం", "దాడి", "వణుకు", "ఆందోళన", "భద్రత లేదు", "రక్షణ లేదు", "భయానకం",
            "కత్తి", "తుపాకీ", "ఆయుధం", "ఆయుధాలు", "కత్తులు", "వెంబడిస్తున్నారు", "వెంటపడుతున్నారు",
            "పీచా", "ఆపద", "హాని"
        ],
        "hi": [
            "डर", "डरा", "डरी", "भय", "दहशत", "धमकी", "धमकियां", "जान से मारने",
            "मारा", "पीटा", "असुरक्षित", "हमला", "खौफ", "कांप", "चाकू", "हथियार",
            "बंदूक", "तलवार", "पीछा", "पीछा कर रहा", "पीछा कर रही", "खतरा", "जान का खतरा"
        ],
        "ta": [
            "பயம்", "பயமாக", "மிரட்டல்", "மிரட்டுகிறார்கள்", "கொலை மிரட்டல்", "தாக்கினார்கள்",
            "பாதுகாப்பற்ற", "நடுக்கம்", "அச்சம்", "கத்தி", "துப்பாக்கி", "ஆயுதம்",
            "துரத்துகிறார்கள்", "பின் தொடர்கிறார்கள்", "கொலை", "ஆபத்து"
        ],
        "mr": [
            "भीती", "घाबरलो", "घाबरले", "धमकी", "धमकावले", "हल्ला", "मारहाण",
            "असुरक्षित", "दहशत", "चाकू", "शस्त्र", "बंदूक", "पाठलाग", "धोका", "जीव धोक्यात"
        ],
        "kn": [
            "ಭಯ", "ಹೆದರಿಕೆ", "ಬೆದರಿಕೆ", "ಕೊಲೆ ಬೆದರಿಕೆ", "ಹಲ್ಲೆ", "ಅಸುರಕ್ಷಿತ", "ನಡುಕ",
            "ಕತ್ತಿ", "ಬಂದೂಕು", "ಆಯುಧ", "ಹಿಂಬಾಲಿಸುತ್ತಿದ್ದಾರೆ", "ಕೊಲೆ", "ಅಪಾಯ"
        ]
    },
    "distress": {
        "en": [
            "help", "help me", "urgent", "save me", "trapped", "pain", "hurt", "crying",
            "screaming", "can't bear", "torture", "bleeding", "emergency", "crisis", "suffering",
            "knife", "gun", "stalking", "threatened", "forced", "kidnap", "in danger"
        ],
        "te": [
            "సహాయం", "కాపాడండి", "రక్షించండి", "ఏడుపు", "నొప్పి", "బాధ", "హింస",
            "తట్టుకోలేకపోతున్నాను", "రక్తం", "అత్యవసరం", "ఆపద", "కత్తి", "తుపాకీ"
        ],
        "hi": [
            "मदद", "बचाओ", "रो रहा", "रो रही", "दर्द", "यातना", "सहन नहीं", "तड़प",
            "खून", "आपातकाल", "पीड़ा", "चाकू", "हथियार"
        ],
        "ta": [
            "உதவி", "காப்பாற்றுங்கள்", "அழுகை", "வலி", "துன்பம்", "அவசரம்", "வதை", "கத்தி"
        ],
        "mr": [
            "मदत", "वाचवा", "रडणे", "वेदना", "त्रास", "अत्याचार", "तातडीने", "चाकू"
        ],
        "kn": [
            "ಸಹಾಯ", "ಕಾಪಾಡಿ", "ಅಳು", "ನೋವು", "ಹಿಂಸೆ", "ತುರ್ತು", "ಸಂಕಷ್ಟ", "ಕತ್ತಿ"
        ]
    },
    "sadness": {
        "en": [
            "sad", "hopeless", "worthless", "empty", "alone", "isolated", "crying",
            "grief", "lost everything", "depressed", "depression", "suicide", "want to die",
            "no hope", "abandoned", "boycott", "boycotted", "displaced", "homeless"
        ],
        "te": [
            "విషాదం", "నిరాశ", "ఒంటరి", "ఎవరూ లేరు", "చనిపోవాలని", "ఆత్మహత్య", "ఆశ లేదు",
            "బహిష్కరణ", "ఇల్లు లేదు", "కన్నీరు", "కుంగిపోయాను", "దిక్కులేదు"
        ],
        "hi": [
            "उदास", "उदासी", "निराशा", "अकेला", "अकेली", "आत्महत्या", "मरना चाहता",
            "कोई नहीं", "बहिष्कार", "घर से निकाल", "लाचार", "बेबस"
        ],
        "ta": [
            "துக்கம்", "சோகம்", "நம்பிக்கையற்ற", "தனிமை", "தற்கொலை", "புறக்கணிப்பு", "கண்ணீர்"
        ],
        "mr": [
            "दुःख", "निराशा", "एकटे", "आत्महत्या", "बहिष्कार", "लाचार", "हताश"
        ],
        "kn": [
            "ದುಃಖ", "ನಿರಾಶೆ", "ಒಂಟಿ", "ಆತ್ಮಹತ್ಯೆ", "ಬಹಿಷ್ಕಾರ", "ಕಣ್ಣೀರು", "ಅಸಹಾಯಕ"
        ]
    },
    "anger": {
        "en": [
            "angry", "furious", "outrage", "hate", "unfair", "injustice", "corrupt",
            "oppression", "casteist", "revenge", "insult", "humiliated"
        ],
        "te": [
            "ఆగ్రహం", "కోపం", "అన్యాయం", "అవమానం", "కుల వివక్ష", "మోసం", "పగ"
        ],
        "hi": [
            "गुस्सा", "क्रोध", "अन्याय", "अपमान", "जातिवाद", "बदला", "शोषण"
        ],
        "ta": [
            "கோபம்", "அநீதி", "அவமானம்", "சாதிவெறி", "பழிவாங்குதல்"
        ],
        "mr": [
            "राग", "संताप", "अन्याय", "अपमान", "जातीयता", "शोषक"
        ],
        "kn": [
            "ಕೋಪ", "ಅನ್ಯಾಯ", "ಅವಮಾನ", "ಜಾತಿವಾದ", "ದೌರ್ಜನ್ಯ"
        ]
    },
    "neutral": {
        "en": [
            "hello", "hi", "hey", "good morning", "good evening", "how to", "status",
            "inquiry", "process", "what is", "document", "appointment", "thank you", "okay"
        ],
        "te": [
            "నమస్కారం", "నమస్తే", "బాగున్నారా", "ఎలా", "వివరాలు", "ధన్యవాదాలు", "సరే"
        ],
        "hi": [
            "नमस्ते", "प्रणाम", "कैसे", "जानकारी", "प्रक्रिया", "धन्यवाद", "ठीक है"
        ],
        "ta": [
            "வணக்கம்", "எப்படி", "தகவல்", "நன்றி", "சரி"
        ],
        "mr": [
            "नमस्कार", "कसे", "माहिती", "धन्यवाद", "ठीक आहे"
        ],
        "kn": [
            "ನಮಸ್ಕಾರ", "ಹೇಗೆ", "ಮಾಹಿತಿ", "ಧನ್ಯವಾದ", "ಸರಿ"
        ]
    }
}

LOCALIZED_EMOTION_NAMES = {
    "Fear": {
        "en": "Fear & Panic",
        "te": "భయం & ఆందోళన (Fear)",
        "hi": "भय और दहशत (Fear)",
        "ta": "பயம் மற்றும் நடுக்கம் (Fear)",
        "mr": "भीती आणि दहशत (Fear)",
        "kn": "ಭಯ ಮತ್ತು ಆತಂಕ (Fear)",
    },
    "Acute Distress": {
        "en": "Acute Distress",
        "te": "తీవ్ర సంక్షోభం (Distress)",
        "hi": "गंभीर संकट (Distress)",
        "ta": "கடுமையான துயரம் (Distress)",
        "mr": "तीव्र संकटावस्था (Distress)",
        "kn": "ತೀವ್ರ ಸಂಕಷ್ಟ (Distress)",
    },
    "Sadness": {
        "en": "Sadness & Helplessness",
        "te": "విషాదం & నిస్సహాయత (Sadness)",
        "hi": "उदासी और लाचारी (Sadness)",
        "ta": "சோகம் மற்றும் தனிமை (Sadness)",
        "mr": "नैराश्य आणि लाचारी (Sadness)",
        "kn": "ದುಃಖ ಮತ್ತು ಅಸಹಾಯಕತೆ (Sadness)",
    },
    "Anger": {
        "en": "Anger & Outrage",
        "te": "ఆగ్రహం (Anger)",
        "hi": "क्रोध व आक्रोश (Anger)",
        "ta": "கோபம் (Anger)",
        "mr": "संताप (Anger)",
        "kn": "ಕೋಪ (Anger)",
    },
    "Calm / Neutral": {
        "en": "Calm / Neutral Inquiry",
        "te": "ప్రశాంతత / సాధారణ విచారణ (Neutral)",
        "hi": "शांत / सामान्य पूछताछ (Neutral)",
        "ta": "அமைதியான விசாரணை (Neutral)",
        "mr": "शांत / सर्वसाधारण चौकशी (Neutral)",
        "kn": "ಶಾಂತ / ಸಾಮಾನ್ಯ ವಿಚಾರಣೆ (Neutral)",
    }
}


def detect_emotion(text: str, detected_language: str = "en", speech_features: Optional[Dict] = None) -> Dict:
    """
    Multilingual emotion analysis with multimodal voice prosody integration.
    Returns:
      {
        'primary': 'Fear',
        'primary_local': 'భయం & ఆందోళన (Fear)',
        'confidence': 0.88,
        'arousal': 0.82,
        'valence': -0.75,
        'scores': { 'fear': 0.88, 'distress': 0.74, 'sadness': 0.35, 'anger': 0.20, 'neutral': 0.05 }
      }
    """
    text_lower = (text or "").strip().lower()
    raw_scores = {"fear": 0.05, "distress": 0.05, "sadness": 0.05, "anger": 0.05, "neutral": 0.10}

    if not text_lower:
        return {
            "primary": "Calm / Neutral",
            "primary_local": LOCALIZED_EMOTION_NAMES["Calm / Neutral"].get(detected_language, "Calm / Neutral Inquiry"),
            "confidence": 0.50,
            "arousal": 0.10,
            "valence": 0.0,
            "scores": raw_scores
        }

    # Match multilingual keywords
    for emotion, lang_dicts in _EMOTION_LEXICON.items():
        score = 0.0
        for lang_code, words in lang_dicts.items():
            for kw in words:
                if kw in text_lower:
                    # Longer or exact match yields stronger weight
                    weight = 0.45 if len(kw.split()) > 1 else 0.30
                    score += weight
        if score > 0:
            raw_scores[emotion] = min(0.98, raw_scores[emotion] + score)

    # Greeting / short neutral phrase boost
    greetings = ["hello", "hi", "hey", "hello hello", "good morning", "good evening", "namaste", "నమస్కారం", "నమస్తే", "नमस्ते", "வணக்கம்", "नमस्कार", "ನಮಸ್ಕಾರ"]
    if text_lower in greetings or (len(text_lower.split()) <= 2 and raw_scores["fear"] == 0.05 and raw_scores["distress"] == 0.05):
        raw_scores["neutral"] = 0.85
        raw_scores["fear"] = 0.02
        raw_scores["distress"] = 0.02
    elif raw_scores["fear"] > 0.10 or raw_scores["distress"] > 0.10 or raw_scores["sadness"] > 0.10 or raw_scores["anger"] > 0.10:
        raw_scores["neutral"] = 0.02

    # Multimodal integration with Speech Prosody (if voice recording provided)
    if speech_features and speech_features.get("analysis") == "ok":
        vocal_distress = float(speech_features.get("vocal_distress_score", 0.0)) / 100.0
        pitch_var = float(speech_features.get("pitch_variation", 0.0))
        
        # High vocal distress & tremor heavily correlates with fear/panic
        if vocal_distress > 0.40 or pitch_var > 35.0:
            raw_scores["fear"] = min(0.98, max(raw_scores["fear"], vocal_distress * 0.90))
            raw_scores["distress"] = min(0.98, max(raw_scores["distress"], vocal_distress * 0.85))
            raw_scores["neutral"] = max(0.02, raw_scores["neutral"] - 0.40)

    # Normalize scores
    total = sum(raw_scores.values()) or 1.0
    normalized = {k: round(v / total, 3) for k, v in raw_scores.items()}

    # Determine primary emotion
    sorted_emotions = sorted(raw_scores.items(), key=lambda kv: kv[1], reverse=True)
    top_emotion_key, top_score = sorted_emotions[0]

    emotion_name_map = {
        "fear": "Fear",
        "distress": "Acute Distress",
        "sadness": "Sadness",
        "anger": "Anger",
        "neutral": "Calm / Neutral"
    }
    primary_name = emotion_name_map.get(top_emotion_key, "Calm / Neutral")
    
    # Compute Arousal & Valence
    # Valence: Negative (-1.0) to Positive (+1.0)
    # Arousal: Low intensity (0.0) to High intensity (1.0)
    arousal = min(1.0, (raw_scores["fear"] * 0.9 + raw_scores["distress"] * 0.85 + raw_scores["anger"] * 0.75 + (1.0 - raw_scores["neutral"]) * 0.3))
    valence = (-0.9 * raw_scores["fear"] - 0.8 * raw_scores["distress"] - 0.7 * raw_scores["sadness"] - 0.6 * raw_scores["anger"] + 0.3 * raw_scores["neutral"])
    valence = max(-1.0, min(1.0, valence))

    confidence = round(float(top_score / (top_score + sorted_emotions[1][1] + 1e-6)), 2)
    confidence = min(0.98, max(0.40, confidence))

    # Map language code
    lang_code = detected_language if detected_language in LOCALIZED_EMOTION_NAMES[primary_name] else "en"
    local_name = LOCALIZED_EMOTION_NAMES[primary_name].get(lang_code, LOCALIZED_EMOTION_NAMES[primary_name]["en"])

    return {
        "primary": primary_name,
        "primary_local": local_name,
        "confidence": confidence,
        "arousal": round(float(arousal), 2),
        "valence": round(float(valence), 2),
        "scores": {k: round(v, 2) for k, v in raw_scores.items()},
        "normalized_scores": normalized
    }