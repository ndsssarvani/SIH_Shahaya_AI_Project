"""
Public support-resource info (helplines etc.) — no auth required.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/resources")
def get_support_resources():
    # TODO: move to DB / config so it's editable without a redeploy.
    return {
        "helpline": "1091",
        "resources": [
            {"name": "National Commission for Women Helpline", "contact": "7827170170"},
            {"name": "KIRAN Mental Health Helpline", "contact": "1800-599-0019"},
        ],
    }
