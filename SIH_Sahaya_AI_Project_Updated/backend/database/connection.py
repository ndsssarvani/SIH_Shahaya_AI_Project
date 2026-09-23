"""
Database connection setup (SQLite via SQLAlchemy).
Every other module imports `Base`, `SessionLocal`, and `get_db` from here.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite file lives in backend/ by default. Override with env var for prod.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sih.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called once on app startup in main.py."""
    # Import models here (not at top) so they register on Base before create_all.
    from database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
