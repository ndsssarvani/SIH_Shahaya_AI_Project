"""
backend/ai/model_loader.py
---------------------------
Singleton bridge to load and execute trained ML models from ml/
for Stress & Trauma Assessment.
"""
import os
import sys
from typing import Dict, Any, Optional

# Add ml/ directory to sys.path
ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from stress_model import StressAssessmentModel
from trauma_model import TraumaIndicatorModel
from risk_model import RiskEngine

_RISK_ENGINE_INSTANCE: Optional[RiskEngine] = None


def get_risk_engine() -> RiskEngine:
    global _RISK_ENGINE_INSTANCE
    if _RISK_ENGINE_INSTANCE is None:
        stress_path = os.path.join(ML_DIR, "saved_models", "stress_text_model.joblib")
        trauma_path = os.path.join(ML_DIR, "saved_models", "trauma_multilabel_model.joblib")

        engine = RiskEngine()
        if os.path.exists(stress_path) and os.path.exists(trauma_path):
            try:
                engine.load(stress_path=stress_path, trauma_path=trauma_path)
                print("[model_loader] Loaded trained ML models from disk.")
            except Exception as e:
                print(f"[model_loader] Failed to load saved models ({e!r}), retraining on the fly...")
                engine.ensure_trained()
                engine.save(stress_path=stress_path, trauma_path=trauma_path)
        else:
            print("[model_loader] Saved models not found, training on the fly...")
            engine.ensure_trained()
            engine.save(stress_path=stress_path, trauma_path=trauma_path)

        _RISK_ENGINE_INSTANCE = engine

    return _RISK_ENGINE_INSTANCE
