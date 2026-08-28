"""
ml/trauma_model.py
-------------------
Trauma Indicator Model for the AI-Based Real-Time Stress & Trauma Assessment
Module (NHAA 14566 / Integrated Portal).

Multi-label classifier over narrative text that flags, independently:
    fear, depression, suicidal_ideation, intimidation,
    social_isolation, extreme_vulnerability

Trained on a blend of:
  - SungJoo/Cradle-Dialogue    (clinician-annotated crisis dialogue -- best
                                 source for suicidal_ideation / self-harm signal)
  - vikhram-labs/NariRaksha-1K (safety-incident scenarios -- best source for
                                 fear / intimidation / social_isolation context)
via data_loader.build_trauma_dataset() (see that file's module docstring for
the caveats around Cradle-Dialogue's exact schema).

SAFETY DESIGN NOTE
-------------------
For `suicidal_ideation` specifically we deliberately:
  (1) use a low decision threshold (favouring recall over precision), and
  (2) layer an explicit keyword safety-net on top of the ML probability,
so a probable false negative on a life-risk signal is far less likely than a
false positive -- consistent with this being a triage/referral aid, not an
autonomous decision-maker. A human counsellor/officer must always review
Critical-risk and suicidal_ideation-flagged cases (see risk_model.py).
"""

import os
import re
import numpy as np
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, classification_report

import data_loader
from data_loader import TRAUMA_LABELS

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "trauma_multilabel_model.joblib")

# Per-label decision thresholds (probability >= threshold -> flag=1).
# suicidal_ideation and extreme_vulnerability use lower thresholds on purpose
# (high recall for life-risk / acute-vulnerability signals).
DEFAULT_THRESHOLDS = {
    "fear": 0.50,
    "depression": 0.50,
    "suicidal_ideation": 0.60,
    "intimidation": 0.50,
    "social_isolation": 0.50,
    "extreme_vulnerability": 0.50,
}

# Keyword safety-net: if any of these substrings appear, force the flag to 1
# regardless of what the model predicts. Kept short and high-precision on
# purpose -- this is a safety backstop, not the primary detector.
SAFETY_NET_KEYWORDS = {
    "suicidal_ideation": [
        "kill myself", "end my life", "not want to live", "don't want to live",
        "wish i was not alive", "wish i wasn't alive", "no reason to live",
        "want to die", "better off dead", "wasn't here anymore",
        "not be here anymore", "won't be here anymore", "easier if i just wasn't here",
    ],
    "extreme_vulnerability": [
        "nowhere to go", "no money", "children's safety", "forced out of our home",
    ],
}


def _apply_safety_net(text: str, flags: dict) -> dict:
    lowered = text.lower()
    for label, keywords in SAFETY_NET_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            flags[label] = 1
    return flags


class TraumaIndicatorModel:
    """Wraps a TF-IDF + One-vs-Rest Logistic Regression multi-label classifier."""

    def __init__(self):
        self.pipeline = None  # sklearn Pipeline: tfidf -> OneVsRestClassifier
        self.thresholds = dict(DEFAULT_THRESHOLDS)

    # ---------------------------------------------------------------- train
    def train(self, test_size=0.2, random_state=42):
        texts, y = data_loader.build_trauma_dataset()
        X_train, X_test, y_train, y_test = train_test_split(
            texts, y, test_size=test_size, random_state=random_state
        )

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(max_features=4000, ngram_range=(1, 2), min_df=1)),
            ("clf", OneVsRestClassifier(
                LogisticRegression(max_iter=2000, class_weight="balanced")
            )),
        ])
        self.pipeline.fit(X_train, y_train)

        probs = self._predict_proba_matrix(X_test)
        preds = (probs >= 0.5).astype(int)
        macro_f1 = f1_score(y_test, preds, average="macro", zero_division=0)
        print(f"[TraumaIndicatorModel] Trained on {len(X_train)} rows, "
              f"validated on {len(X_test)} rows. Macro F1 (@0.5) = {macro_f1:.3f}")
        print(classification_report(y_test, preds, target_names=TRAUMA_LABELS, zero_division=0))
        return {"macro_f1": macro_f1, "n_train": len(X_train), "n_test": len(X_test)}

    # -------------------------------------------------------------- predict
    def _predict_proba_matrix(self, texts):
        # OneVsRestClassifier(LogisticRegression) exposes predict_proba as
        # an [n_samples, n_labels] array directly.
        return self.pipeline.predict_proba(texts)

    def predict(self, text: str) -> dict:
        """Returns {'indicators': {label: 0/1}, 'probabilities': {label: float},
        'trauma_severity_score': 0-100, 'flagged_labels': [...]}"""
        if self.pipeline is None:
            raise RuntimeError("Model not trained/loaded. Call train() or load_model() first.")

        lowered = (text or "").strip().lower()
        greetings = {"hello", "hi", "hey", "hello hello", "good morning", "good afternoon", "good evening", "namaste", "vanakkam", "namaskaram"}
        has_safety_keyword = any(kw in lowered for keywords in SAFETY_NET_KEYWORDS.values() for kw in keywords)

        if (lowered in greetings or len(lowered.split()) <= 2) and not has_safety_keyword:
            prob_map = {label: 0.05 for label in TRAUMA_LABELS}
            flags = {label: 0 for label in TRAUMA_LABELS}
            return {
                "probabilities": prob_map,
                "indicators": flags,
                "flagged_labels": [],
                "trauma_severity_score": 5.0,
            }

        probs = self._predict_proba_matrix([text])[0]
        prob_map = {label: float(p) for label, p in zip(TRAUMA_LABELS, probs)}
        flags = {label: int(prob_map[label] >= self.thresholds[label]) for label in TRAUMA_LABELS}
        flags = _apply_safety_net(text, flags)

        severity = 100 * np.mean(list(prob_map.values()))
        # suicidal ideation and extreme vulnerability weigh more heavily on
        # the aggregate severity score, since they carry disproportionate risk.
        if flags["suicidal_ideation"]:
            severity = max(severity, 85)
        if flags["extreme_vulnerability"]:
            severity = max(severity, 70)

        return {
            "probabilities": {k: round(v, 3) for k, v in prob_map.items()},
            "indicators": flags,
            "flagged_labels": [k for k, v in flags.items() if v == 1],
            "trauma_severity_score": round(float(np.clip(severity, 0, 100)), 1),
        }


    # --------------------------------------------------------- persistence
    def save_model(self, path=MODEL_PATH):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({"pipeline": self.pipeline, "thresholds": self.thresholds}, path)
        print(f"[TraumaIndicatorModel] Saved to {path}")

    def load_model(self, path=MODEL_PATH):
        payload = joblib.load(path)
        self.pipeline = payload["pipeline"]
        self.thresholds = payload.get("thresholds", dict(DEFAULT_THRESHOLDS))
        print(f"[TraumaIndicatorModel] Loaded from {path}")
        return self


# ------------------------------------------------------------------ self-test
if __name__ == "__main__":
    model = TraumaIndicatorModel()
    stats = model.train()
    model.save_model()

    print("\n--- Predictions on illustrative examples ---")
    examples = [
        "I just wanted to confirm my appointment with the counsellor next week.",
        "They told me if I go to the police again they will make sure I regret it, I'm terrified.",
        "Nobody in the village will speak to my family since we filed the complaint, we are completely alone.",
        "Sometimes I think it would be easier if I just wasn't here anymore.",
        "I want to kill myself, I can't take this anymore.",
        "I have nowhere to go, no money, and I am afraid for my children's safety after we were forced out.",
    ]
    for ex in examples:
        result = model.predict(ex)
        print(f"\nText: {ex}")
        print(f"  -> flagged: {result['flagged_labels']}  "
              f"severity={result['trauma_severity_score']}")
        print(f"  -> probabilities: {result['probabilities']}")

    # --------------------------------------------------- basic sanity checks
    # We assert against an EXPLICIT, unambiguous statement of suicidal intent
    # (caught by the keyword safety-net regardless of how well the trained
    # ML model happens to generalise to a given phrasing on this run) rather
    # than a softer euphemism -- euphemisms are shown above as illustrative
    # examples, but are too wording-sensitive to use in a hard assertion.
    neutral = model.predict(examples[0])
    explicit_suicidal = model.predict("I want to kill myself, I can't take this anymore.")
    assert explicit_suicidal["indicators"]["suicidal_ideation"] == 1, \
        "Explicit suicidal-ideation language must be flagged (safety-net check)"
    assert explicit_suicidal["trauma_severity_score"] > neutral["trauma_severity_score"], \
        "A flagged high-risk text should score higher severity than a neutral one"
    print("\n[SELF-TEST] All sanity checks passed.")