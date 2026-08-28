"""
Entry point: wires together database, security, ai, services, api, and
realtime layers into a single FastAPI app.

Run with:  uvicorn main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.connection import init_db

# All API routers
from api import auth, assessment, officer, complaint, alerts, support, integration, privacy
from realtime.websocket import router as websocket_router

app = FastAPI(
    title="AI Stress & Trauma Assessment System",
    description="SIH prototype backend — FastAPI + SQLite + AI/NLP assessment layer",
    version="0.1.0",
)

# --- CORS (open for hackathon dev; tighten origins before any real deployment) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Serve uploaded audio evidence back out if needed ---
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- Routers: each api/*.py module owns one feature area ---
app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(officer.router)
app.include_router(complaint.router)
app.include_router(alerts.router)
app.include_router(support.router)
app.include_router(integration.router)
app.include_router(privacy.router)

# --- Realtime: officer dashboard live-alert socket ---
app.include_router(websocket_router)


@app.on_event("startup")
def on_startup():
    init_db()  # creates SQLite tables from database/models.py if they don't exist


@app.get("/")
def root():
    return {"status": "ok", "service": "SIH stress-trauma-assessment backend"}


@app.get("/health")
def health():
    return {"status": "healthy"}
