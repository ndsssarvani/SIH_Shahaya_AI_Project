"""
Extracts categorized trauma/vulnerability indicators from NLP + emotion
output, matching the categories called out in the problem statement:
severe trauma, fear, depression, suicidal ideation, intimidation, social
isolation, extreme vulnerability — plus SC/ST-atrocity-specific context
(caste violence, social boycott, displacement, gang rape, murder of family).

TODO: this is a keyword rule-set for a hackathon prototype. Replace with a
trained multi-label classifier, and route all non-English text through
ai/multilingual.translate_to_english() before matching (already done in
services/case_service.py).
"""
from typing import Dict, List

_INDICATOR_KEYWORDS: Dict[str, List[str]] = {
    "suicidal_ideation": [
        "suicide", "kill myself", "end my life", "want to die",
        "no point living", "no reason to live", "better off dead", "not alive",
        "wish i was dead", "commit suicide",
    ],
    "severe_violence": [
        "gang rape", "rape", "murder", "murdered", "killed my", "kill us",
        "kill me", "kill", "death threat", "assault", "beaten", "attacked",
        "burn our house", "set on fire", "lynch", "lynched", "cut off",
        "knife", "knives", "gun", "guns", "weapon", "weapons", "sword", "blade",
        "dagger", "pistol", "acid", "iron rod", "armed", "axe",
    ],
    "trauma": [
        "trauma", "flashback", "nightmare", "can't sleep", "cannot sleep",
        "can't forget", "haunted", "panic", "breakdown",
    ],
    "fear": [
        "scared", "afraid", "terrified", "fear", "unsafe", "not safe", "petrified",
        "shaking", "trembling", "in danger", "danger", "following me", "follow me",
        "stalking", "chasing", "cornered", "knife", "weapon", "gun",
    ],
    "depression": [
        "hopeless", "worthless", "empty inside", "give up", "no hope", "numb",
    ],
    "intimidation": [
        "threat", "threats", "threatened", "threatening", "warned me", "silence me",
        "intimidated", "intimidation", "told me not to", "if i speak", "consequences",
        "following me", "follow me", "followed me", "following", "stalking", "stalker",
        "chasing", "chased", "watching me", "seen a knife", "with a knife", "armed",
    ],
    "social_isolation": [
        "alone", "no one helps", "isolated", "no support", "abandoned",
        "nobody listens", "shut out", "cut off", "no one will speak",
    ],
    "extreme_vulnerability": [
        "disabled", "elderly", "pregnant", "widow", "minor", "child victim",
        "nowhere to go", "no money", "homeless", "children's safety",
    ],
    "caste_atrocity_context": [
        "caste", "dalit", "scheduled caste", "scheduled tribe", "untouchable",
        "social boycott", "boycott", "boycotted", "displaced", "displacement",
        "forced out", "land grab", "denied entry", "not allowed to", "paraded",
    ],
}



def extract_indicators(cleaned_text: str, emotion_data: Dict) -> Dict[str, List[str]]:
    """Returns {category: [matched keywords]} for every category that fired."""
    text_lower = (cleaned_text or "").lower()
    flagged: Dict[str, List[str]] = {}

    for category, keywords in _INDICATOR_KEYWORDS.items():
        hits = [kw for kw in keywords if kw in text_lower]
        if hits:
            flagged[category] = hits

    scores_dict = emotion_data.get("scores", emotion_data) if isinstance(emotion_data, dict) else {}
    for emotion, score in scores_dict.items():
        if isinstance(score, (int, float)) and score >= 0.5:
            flagged.setdefault(f"high_{emotion}", []).append(emotion)

    return flagged

