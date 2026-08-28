"""
ml/data_loader.py
------------------
Loads and prepares training data for stress_model.py, trauma_model.py and
risk_model.py from two HuggingFace datasets:

  1. vikhram-labs/NariRaksha-1K   -> scenario text + severity + risk_type
                                      (used to bootstrap the Stress Vulnerability
                                      severity signal and several trauma-indicator
                                      heuristics)
  2. SungJoo/Cradle-Dialogue       -> clinician-annotated, turn-level crisis
                                      dialogue with multi-label risk annotations
                                      (suicidal ideation, self-harm, child abuse,
                                      domestic violence, past-vs-ongoing risk)
                                      -> used for the highest-stakes trauma labels.

IMPORTANT / READ BEFORE TRAINING ON THE REAL DATA
--------------------------------------------------
This module was written without direct access to the HuggingFace page for
SungJoo/Cradle-Dialogue (it's a very new benchmark, released alongside the
paper "Expert-Level Crisis Detection in Mental Health Conversations"), so its
exact column names could not be verified at authoring time. NariRaksha-1K's
schema (scenario, language, risk_type, severity, reasoning, recommended_action,
legal_context, confidence) WAS verified directly from its dataset card.

To stay safe, every loader here:
  - tries the real HF dataset first,
  - prints the columns it actually finds the first time it loads,
  - auto-detects likely text/label columns from a candidate list,
  - and falls back to a small synthetic dataset if the schema doesn't match
    or the download fails (e.g. no network, gated dataset, renamed columns),
    so the rest of the pipeline still runs end-to-end.

>>> The first time you run this for real, READ the printed column list and,
>>> if the auto-detected columns look wrong, adjust CRADLE_TEXT_COL_CANDIDATES
>>> / CRADLE_LABEL_COL_CANDIDATES below to match what you actually see.
"""

import ast
import random
import numpy as np


def _normalize_label_tokens(raw):
    """Coerce a `labels` cell (which may be a list, dict, or stringified
    version of either, depending on how HF/pyarrow deserialised it) into a
    flat list of lowercase string tokens we can safely substring-match against.
    This is deliberately conservative: it only trusts the labels field itself,
    not unrelated columns like turn_id or text, to avoid false matches."""
    if raw is None:
        return []
    if isinstance(raw, dict):
        # e.g. {'suicide_ideation_current': 1, 'self_harm_past': 0, ...}
        return [str(k).lower() for k, v in raw.items() if v]
    if isinstance(raw, (list, tuple, np.ndarray)):
        return [str(x).lower() for x in raw]
    s = str(raw)
    try:
        parsed = ast.literal_eval(s)
        if parsed != raw:  # avoid infinite recursion on a string that evals to itself
            return _normalize_label_tokens(parsed)
    except (ValueError, SyntaxError):
        pass
    return [s.lower()]

RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

SEVERITY_TO_SCORE = {"low": 20, "medium": 45, "high": 70, "critical": 90}

TRAUMA_LABELS = [
    "fear",
    "depression",
    "suicidal_ideation",
    "intimidation",
    "social_isolation",
    "extreme_vulnerability",
]

# risk_type (NariRaksha-1K) -> trauma indicators it plausibly implies.
# This is a heuristic bridge, not a clinical judgement -- it only backstops
# the model when Cradle-Dialogue coverage of a given text is unavailable.
RISK_TYPE_INDICATOR_MAP = {
    "coercive control": ["social_isolation", "intimidation"],
    "domestic violence": ["fear", "social_isolation", "intimidation"],
    "deepfake abuse": ["fear", "depression"],
    "online harassment": ["fear", "intimidation"],
    "cyberstalking": ["fear", "intimidation"],
    "financial exploitation": ["depression"],
    "workplace harassment": ["fear", "depression"],
    "trafficking indicators": ["fear", "social_isolation", "extreme_vulnerability"],
    "blackmail / extortion": ["fear", "intimidation"],
    "revenge content (ncii)": ["depression", "fear"],
    "public safety / stalking": ["fear", "intimidation"],
    "emotional manipulation": ["social_isolation", "depression"],
}

CRADLE_TEXT_COL_CANDIDATES = ["text", "utterance", "turn_text", "dialogue", "content", "message"]
CRADLE_LABEL_COL_CANDIDATES = [
    "labels", "risk_labels", "annotations", "crisis_labels", "risk_type", "category",
]


def _try_load_hf_dataset(name, split="train"):
    """Best-effort HF hub load. Returns a pandas DataFrame or None."""
    try:
        from datasets import load_dataset
        ds = load_dataset(name, split=split)
        df = ds.to_pandas()
        print(f"[data_loader] Loaded '{name}' ({len(df)} rows). Columns: {list(df.columns)}")
        return df
    except Exception as e:
        print(f"[data_loader] Could not load '{name}' from HuggingFace ({e!r}). "
              f"Falling back to synthetic data for this source.")
        return None


def load_nariraksha(split="train"):
    return _try_load_hf_dataset("vikhram-labs/NariRaksha-1K", split=split)


def load_cradle_dialogue(split="train"):
    return _try_load_hf_dataset("SungJoo/Cradle-Dialogue", split=split)


# ----------------------------------------------------------------------------
# Synthetic fallbacks (only used when the real datasets can't be reached / the
# schema doesn't match). Templated but keyword-consistent so a TF-IDF model
# still learns a real signal end-to-end for testing/demo purposes.
# ----------------------------------------------------------------------------

_SUBJECTS = [
    "The complainant", "She", "The victim", "The caller", "A 28-year-old woman",
    "A young woman from a rural district", "The survivor", "The 34-year-old complainant",
]

_STRESS_PHRASES = {
    "low": [
        "wanted to check the status of her complaint",
        "asked about the documents needed for the process",
        "reported a minor disagreement with a neighbour",
        "described a one-off remark that did not cause much distress",
        "is calm and cooperative during the call",
        "just needs information about the next steps",
        "sounded steady and answered questions clearly",
    ],
    "medium": [
        "described repeated taunts over the past weeks and feels anxious",
        "reported ongoing pressure from the community and has trouble sleeping",
        "said the situation is affecting her work and mood",
        "feels uneasy and worried most days",
        "described mounting tension at home and some sleepless nights",
        "sounded tense and hesitated before answering several questions",
    ],
    "high": [
        "broke down describing repeated threats and is afraid to leave home",
        "reported being assaulted and socially boycotted, and feels hopeless",
        "described ongoing intimidation and could barely concentrate during the call",
        "is extremely fearful and could not stop crying",
        "said she feels trapped and unsafe in her own home",
        "spoke in a shaky voice with long pauses between sentences",
    ],
    "critical": [
        "said a family member was murdered and she does not see the point of going on",
        "described a gang assault and constant death threats, and feels like giving up",
        "said she has nothing left to live for after losing everything",
        "feels utterly alone, hopeless, and unsafe every moment",
        "described being displaced and said she cannot go on like this",
        "sounded numb and said she sometimes wishes she was not alive",
    ],
}

_EXTRA_CLAUSES = [
    "She contacted the helpline for support.",
    "This was reported via the mobile application.",
    "The incident occurred in a village setting.",
    "She mentioned she has children depending on her.",
    "The family has faced this for several months.",
    "",
    "",
]


def _synthetic_stress_rows(n=900):
    texts, scores, levels = [], [], []
    level_cycle = list(_STRESS_PHRASES.keys())
    for i in range(n):
        lvl = level_cycle[i % len(level_cycle)]
        subject = random.choice(_SUBJECTS)
        phrase = random.choice(_STRESS_PHRASES[lvl])
        extra = random.choice(_EXTRA_CLAUSES)
        text = f"{subject} {phrase}. {extra}".strip()
        texts.append(text)
        score = SEVERITY_TO_SCORE[lvl] + np.random.uniform(-6, 6)
        scores.append(float(np.clip(score, 0, 100)))
        levels.append(lvl)
    return texts, scores, levels


_TRAUMA_PHRASES = {
    "fear": [
        "I am scared they will come back and hurt me again, I keep checking the door.",
        "I feel terrified every time I hear a noise outside my house.",
        "I am afraid to walk alone since the incident happened.",
    ],
    "depression": [
        "I don't feel like eating or doing anything anymore, everything feels heavy and pointless.",
        "I can't sleep and I feel numb most of the day.",
        "I have lost interest in things I used to enjoy and feel empty inside.",
    ],
    "suicidal_ideation": [
        "Sometimes I think it would be easier if I just wasn't here anymore.",
        "I have thought about ending my life because the pain feels too much.",
        "I don't see a reason to keep going some days.",
    ],
    "intimidation": [
        "They told me if I go to the police again they will make sure I regret it.",
        "The accused's family keeps warning us to withdraw the complaint or face consequences.",
        "I received threats telling me to stay silent about what happened.",
    ],
    "social_isolation": [
        "Nobody in the village will speak to my family since we filed the complaint.",
        "We have been cut off from the community and no one helps us anymore.",
        "My neighbours avoid us completely now and we feel shut out.",
    ],
    "extreme_vulnerability": [
        "I have nowhere to go, no money, and I am afraid for my children's safety.",
        "We were forced out of our home and have no support left.",
        "I am alone, without income, and do not know how we will survive this.",
    ],
    "none": [
        "I wanted to ask about the status of my complaint and what documents I still need to submit.",
        "Could you tell me the next steps in the legal process?",
        "I am calling to confirm my appointment with the counsellor.",
        "Hello",
        "Hi",
        "Hello hello",
        "Hello can you hear me",
        "Good morning",
        "Good evening",
        "Namaste",
        "Vanakkam",
        "Namaskaram",
        "Testing the microphone",
        "Is someone available to talk?",
        "I am just checking how this app works",
        "Thank you for the help",
        "Okay understood",
        "What are the office working hours?",
        "Please tell me the helpline number",
    ],
}



def _synthetic_trauma_rows(n=900):
    texts, label_rows = [], []
    keys = list(_TRAUMA_PHRASES.keys())
    for i in range(n):
        k = keys[i % len(keys)]
        subject = random.choice(_SUBJECTS)
        phrase = random.choice(_TRAUMA_PHRASES[k])
        extra = random.choice(_EXTRA_CLAUSES)
        text = f"{subject} said: \"{phrase}\" {extra}".strip()
        texts.append(text)
        row = {lbl: 0 for lbl in TRAUMA_LABELS}
        if k != "none":
            row[k] = 1
        # occasionally combine two indicators, like real narratives do
        if k != "none" and random.random() < 0.25:
            other = random.choice([x for x in TRAUMA_LABELS if x != k])
            row[other] = 1
        label_rows.append(row)
    label_matrix = np.array([[r[lbl] for lbl in TRAUMA_LABELS] for r in label_rows])
    return texts, label_matrix


# ----------------------------------------------------------------------------
# Public builders used by stress_model.py / trauma_model.py
# ----------------------------------------------------------------------------

def build_stress_dataset():
    """Returns (texts: list[str], scores: list[float 0-100], levels: list[str])."""
    df = load_nariraksha()
    if df is None or "scenario" not in df.columns or "severity" not in df.columns:
        if df is not None:
            print("[data_loader] NariRaksha-1K columns don't match the expected "
                  "schema (need 'scenario' + 'severity'); using synthetic fallback.")
        return _synthetic_stress_rows()

    texts = df["scenario"].astype(str).tolist()
    sev = df["severity"].astype(str).str.lower().tolist()
    scores, levels = [], []
    for s in sev:
        base = SEVERITY_TO_SCORE.get(s, 50)
        scores.append(float(np.clip(base + np.random.uniform(-6, 6), 0, 100)))
        levels.append(s if s in SEVERITY_TO_SCORE else "medium")
    return texts, scores, levels


def build_trauma_dataset():
    """
    Returns (texts: list[str], label_matrix: np.ndarray [n, len(TRAUMA_LABELS)]).
    Combines Cradle-Dialogue's clinical crisis labels (best source for
    suicidal_ideation / extreme_vulnerability) with NariRaksha-1K's risk_type
    context (best source for fear / intimidation / social_isolation), since
    the two datasets cover complementary parts of the trauma-indicator space.
    """
    texts, label_rows = [], []

    cradle = load_cradle_dialogue()
    if cradle is not None:
        text_col = next((c for c in CRADLE_TEXT_COL_CANDIDATES if c in cradle.columns), None)
        label_col = next((c for c in CRADLE_LABEL_COL_CANDIDATES if c in cradle.columns), None)

        if text_col is None:
            print(f"[data_loader] Cradle-Dialogue: none of {CRADLE_TEXT_COL_CANDIDATES} "
                  f"found in columns {list(cradle.columns)}; skipping this source.")
        else:
            if label_col:
                sample_vals = cradle[label_col].dropna().head(3).tolist()
                print(f"[data_loader] Cradle-Dialogue: using text column '{text_col}' and "
                      f"label column '{label_col}'. Sample label values: {sample_vals}")
            else:
                print(f"[data_loader] Cradle-Dialogue: no recognizable label column found in "
                      f"{list(cradle.columns)}; every row will be treated as unlabeled (all-zero) "
                      f"unless you add its real column name to CRADLE_LABEL_COL_CANDIDATES.")

            n_matched = 0
            for _, row in cradle.iterrows():
                t = str(row[text_col])
                label_tokens = _normalize_label_tokens(row[label_col]) if label_col else []
                joined_tokens = " | ".join(label_tokens)

                labels = {k: 0 for k in TRAUMA_LABELS}
                if any(k in joined_tokens for k in ["suicid"]):
                    labels["suicidal_ideation"] = 1
                if any(k in joined_tokens for k in ["self_harm", "self-harm", "selfharm", "self harm"]):
                    labels["depression"] = 1
                if any(k in joined_tokens for k in ["child_abuse", "child abuse"]):
                    labels["extreme_vulnerability"] = 1
                if any(k in joined_tokens for k in ["domestic_violence", "domestic violence"]):
                    labels["fear"] = 1
                    labels["intimidation"] = 1

                if any(labels.values()):
                    n_matched += 1
                texts.append(t)
                label_rows.append(labels)

            if label_col:
                print(f"[data_loader] Cradle-Dialogue: {n_matched}/{len(cradle)} rows matched at "
                      f"least one trauma label from '{label_col}'. If this looks too low, inspect "
                      f"the sample label values printed above and adjust the keyword matches in "
                      f"build_trauma_dataset() to fit the real label vocabulary.")

    nari = load_nariraksha()
    if nari is not None and "scenario" in nari.columns and "risk_type" in nari.columns:
        for _, row in nari.iterrows():
            t = str(row["scenario"])
            rt = str(row["risk_type"]).lower()
            sev = str(row.get("severity", "medium")).lower()
            labels = {k: 0 for k in TRAUMA_LABELS}
            for ind in RISK_TYPE_INDICATOR_MAP.get(rt, []):
                labels[ind] = 1
            if sev == "critical":
                labels["extreme_vulnerability"] = 1
            texts.append(t)
            label_rows.append(labels)

    if not texts:
        print("[data_loader] Neither real dataset was usable; using fully synthetic trauma data.")
        return _synthetic_trauma_rows()

    label_matrix = np.array([[r[lbl] for lbl in TRAUMA_LABELS] for r in label_rows])
    return texts, label_matrix


if __name__ == "__main__":
    print("\n--- Stress dataset ---")
    texts, scores, levels = build_stress_dataset()
    print(f"{len(texts)} rows | example: {texts[0][:80]!r} -> score={scores[0]:.1f}, level={levels[0]}")

    print("\n--- Trauma dataset ---")
    texts, labels = build_trauma_dataset()
    print(f"{len(texts)} rows | label matrix shape={labels.shape} | positive rate per label:")
    for i, lbl in enumerate(TRAUMA_LABELS):
        print(f"   {lbl}: {labels[:, i].mean():.2%}")