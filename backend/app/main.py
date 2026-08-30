"""
main.py
-------
FastAPI application entry point.

Responsibilities:
  - Create the FastAPI app instance with metadata for Swagger UI.
  - Register all routers under the /api prefix.
  - Configure CORS so the frontend can call the API from a file:// origin.
  - On startup: create all database tables and seed the admin user.
  - Expose GET /api/health for liveness checks.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import engine, get_db, Base
from app.schemas import HealthResponse

# Import models so SQLAlchemy registers them before create_all()
import app.models  # noqa: F401

# Routers (imported after models to avoid circular imports)
from app.routers import auth, data, dashboard, analytics


# ---------------------------------------------------------------------------
# Lifespan — runs on startup and shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed the admin user when the server starts."""
    # Create all tables that don't exist yet (safe to call repeatedly)
    Base.metadata.create_all(bind=engine)

    # Seed the admin account (import here to avoid circular import at module level)
    from app.services.auth_service import create_default_admin
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        create_default_admin(db)
    finally:
        db.close()

    yield  # Application runs here

    # Nothing special needed on shutdown


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="InsightIQ API",
    description=(
        "Business analytics and decision-support platform. "
        "Upload sales CSV data and explore KPIs, trends, and insights."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Allow the plain HTML frontend (opened from disk or a local server) to call
# the API.  In production this list should be narrowed to specific origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------
@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Liveness check",
)
def health_check(db: Session = Depends(get_db)):
    """
    Returns HTTP 200 with {"status": "ok", "database": "connected"}
    if the application is running and can reach the database.
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unreachable"

    return HealthResponse(status="ok", database=db_status)
