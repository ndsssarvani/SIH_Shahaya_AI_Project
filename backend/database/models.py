"""
SQLAlchemy ORM models for the Stress & Trauma Assessment System.
"""
import datetime
import enum

from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship

from database.connection import Base


class UserRole(str, enum.Enum):
    victim = "victim"
    officer = "officer"
    admin = "admin"


class RiskLevel(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"


class Channel(str, enum.Enum):
    """Which NHAA-approved digital interface the victim/complainant used."""
    helpline_14566 = "helpline_14566"
    integrated_portal = "integrated_portal"
    chatbot = "chatbot"
    ivrs = "ivrs"
    mobile_app = "mobile_app"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.victim, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessments = relationship("Assessment", back_populates="user")
    complaints = relationship("Complaint", back_populates="user")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    channel = Column(Enum(Channel), default=Channel.other, nullable=False)

    raw_text = Column(Text, nullable=True)
    audio_path = Column(String, nullable=True)
    detected_language = Column(String, nullable=True)

    svi_score = Column(Float, nullable=True)          # Stress Vulnerability Index
    risk_level = Column(Enum(RiskLevel), nullable=True)
    indicators = Column(Text, nullable=True)           # JSON-encoded {category: [matched keywords]}

    # --- Informed consent (required by the problem statement's ethical-AI standards) ---
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_timestamp = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    alerts = relationship("Alert", back_populates="assessment")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="open")  # open, in_review, resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="complaints")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    message = Column(String, nullable=False)
    level = Column(Enum(RiskLevel), nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="alerts")
