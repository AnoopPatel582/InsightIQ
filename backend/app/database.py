"""
database.py
-----------
Creates the SQLAlchemy engine and session factory, and provides the
`get_db` dependency used by FastAPI route handlers to obtain a DB session.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
# pool_pre_ping=True makes SQLAlchemy test each connection before using it,
# which avoids "MySQL server has gone away" errors after idle periods.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)


# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
# autocommit=False means we control transactions explicitly.
# autoflush=False prevents premature writes within a session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Declarative base for ORM models
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    """All ORM models inherit from this class."""
    pass


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
def get_db():
    """
    Yield a SQLAlchemy session, then close it when the request is done.

    Usage in a route:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
