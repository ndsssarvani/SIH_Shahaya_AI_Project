# SAHAYA AI — AI-Based Real-Time Stress & Trauma Assessment Module
### Smart India Hackathon (SIH 2026) | National Helpline Against Atrocities (NHAA 14566)

An AI-driven psychological stress, trauma, fear, anxiety, and vulnerability assessment engine tailored for Scheduled Caste and Scheduled Tribe (SC/ST) victims and complainants interacting with **NHAA 14566**, the Integrated Portal, chatbot, mobile application, and IVRS.

---

## 📂 Project Architecture & Directory Structure

```
d:\SIH\
├── backend/                        # FastAPI High-Performance Backend
│   ├── ai/                         # Unified AI, NLP & Speech Analytics Engine
│   │   ├── emotion_ai.py           # VAD & Emotion Valence-Arousal extraction
│   │   ├── indicators.py           # SC/ST PoA Act trauma indicators & safety nets
│   │   ├── model_loader.py         # Singleton bridge to ML models
│   │   ├── multilingual.py         # 11+ Indian languages & Hinglish translation engine
│   │   ├── speech_analytics.py     # Librosa & SoundFile Acoustic Prosody DSP
│   │   ├── svi.py                  # Stress Vulnerability Index (0-100) scoring formula
│   │   └── text_nlp.py             # Text cleaning, lemmatization & tokenization
│   ├── api/                        # REST API Routers
│   │   ├── alerts.py               # Officer emergency alert endpoints & acknowledge
│   │   ├── assessment.py           # Multi-modal intake submission & audio streaming
│   │   ├── auth.py                 # JWT authentication & user registration
│   │   ├── complaint.py            # Grievance registration & status endpoints
│   │   ├── officer.py              # Officer worklists, aggregate analytics & review
│   │   ├── privacy.py              # DPDP Act compliance & consent policies
│   │   └── support.py              # Statutory emergency helpline directories
│   ├── database/                   # Database Layer (SQLAlchemy ORM + SQLite)
│   │   ├── connection.py           # Database engine & session manager
│   │   └── models.py               # Schema: User, Assessment, Complaint, Alert
│   ├── realtime/                   # Real-Time WebSocket Infrastructure
│   │   └── websocket.py            # Reconnecting WebSocket broadcaster (/ws/officer)
│   ├── security/                   # Authentication & Access Control
│   │   └── security.py             # Bcrypt hashing & PyJWT token verification
│   ├── services/                   # Business Logic & Case Management
│   │   ├── analytical_service.py   # SQL aggregate queries for officer dashboard
│   │   ├── case_service.py         # Multi-modal assessment execution & alert dispatch
│   │   └── recommendation.py       # SC/ST PoA Act statutory support rules
│   ├── uploads/audio/              # Secure local storage for recorded audio streams
│   ├── main.py                     # FastAPI application entrypoint & CORS middleware
│   └── requirements.txt            # Python dependencies (FastAPI, Scikit-Learn, Librosa, etc.)
│
├── frontend/                       # React 18 + Vite Modern Web Client
│   ├── src/
│   │   ├── pages/                  # Application Routes & Screen Views
│   │   │   ├── Home.jsx            # Public landing page with triage options & helpline info
│   │   │   ├── Login.jsx           # Officer & victim authentication portal
│   │   │   ├── Register.jsx        # Account registration
│   │   │   ├── Consent.jsx         # Informed consent & privacy terms (DPDP compliant)
│   │   │   ├── Complaint.jsx       # Real-time victim chat with SVI gauge & microphone intake
│   │   │   ├── Support.jsx         # 24/7 Helplines Directory (14566, Tele-MANAS, KIRAN)
│   │   │   ├── Status.jsx          # Grievance status & triage tracking by Case ID
│   │   │   └── officer/            # Response Team & Nodal Officer Portal
│   │   │       ├── Dashboard.jsx   # Overview metrics, recent cases & live WebSocket alerts
│   │   │       ├── Cases.jsx       # Case search & multi-filter table (Channel, Risk Tier)
│   │   │       ├── CaseDetails.jsx # Detailed audit view with audio playback & DSP prosody
│   │   │       ├── Alerts.jsx      # High-priority alert feed with 1-click acknowledge
│   │   │       └── Reports.jsx     # Exportable risk distribution & aggregate analytics
│   │   ├── services/               # API & WebSocket Client Integrations
│   │   │   ├── api.js              # Axios HTTP client with JWT interceptor
│   │   │   └── websocket.js        # OfficerAlertsWebSocket client with auto-reconnect
│   │   ├── App.jsx                 # Client router configuration
│   │   └── main.jsx                # React DOM entrypoint
│   ├── package.json                # Frontend dependencies & npm scripts
│   └── vite.config.js              # Vite build configuration
│
└── ml/                             # Machine Learning Training & Inference Pipelines
    ├── saved_models/               # Serialized ML Models
    │   ├── stress_text_model.joblib        # TF-IDF + Random Forest Stress Regressor
    │   └── trauma_multilabel_model.joblib  # One-vs-Rest Multi-Label Classifier
    ├── data_loader.py              # Dataset builder (NariRaksha-1K, Cradle-Dialogue, Synthetic)
    ├── stress_model.py             # Continuous psychological stress estimation (0-100)
    ├── trauma_model.py             # Multi-label classification (Fear, Suicide, Boycott, etc.)
    └── risk_model.py               # RiskEngine & SVI fusion rules
```

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Setup & Startup
```powershell
# Navigate to backend directory
cd d:\SIH\backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```
* **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Frontend Setup & Startup
```powershell
# In a new terminal, navigate to frontend directory
cd d:\SIH\frontend

# Install dependencies (if not already done)
npm install

# Start Vite development server on port 5173
npm run dev
```
* **Client App**: [http://localhost:5173](http://localhost:5173)
* **Officer Portal**: [http://localhost:5173/officer/dashboard](http://localhost:5173/officer/dashboard)

---

## 🛡️ Key Features & Capabilities

1. **Multimodal Crisis Assessment**: Integrates live text statements, Indic speech transcripts, and browser microphone audio streams.
2. **Indic Multilingual Engine**: Native support for 11+ Indian languages (Hindi, Telugu, Tamil, Marathi, Bengali, etc.) and Hinglish transliteration.
3. **Acoustic Prosody DSP**: Extracts pitch ($f_0$) tremors, speech pause ratios, and vocal agitation metrics via `librosa` and `soundfile`.
4. **Explainable SVI (0–100)**: Transparent 4-tier risk classification (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) with statutory PoA Act relief mapping.
5. **Real-Time Officer Triage**: WebSocket push notifications broadcast emergency alerts to duty officers within milliseconds.
6. **DPDP Act & Ethical AI Standards**: Informed consent recording, privacy preservation, and mandatory Human-in-the-Loop oversight for legal escalations.

