"""
conftest.py
-----------
Pytest fixtures shared across all test modules.

Strategy:
  - Use a module-scoped in-memory SQLite engine so all tests in a session
    share the same database connection (in-memory SQLite disappears when
    all connections close, so we keep one connection open for the module).
  - The `db` fixture wraps each test in a transaction that is rolled back
    afterwards, giving test isolation without recreation overhead.
  - The FastAPI test app is built without the MySQL lifespan, pointing
    entirely at the SQLite engine via dependency_overrides.
"""

import pytest
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.models import User
from app.schemas import HealthResponse
from app.routers import auth, data, dashboard, analytics
from app.utils.security import hash_password

# ---------------------------------------------------------------------------
# Single shared in-memory SQLite engine
# Keep connect_args check_same_thread=False so SQLAlchemy can use the
# connection from multiple threads (FastAPI TestClient uses threads).
# Use a named in-memory DB so the same data is visible to all connections.
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite:///file:testdb?mode=memory&cache=shared&uri=true"

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False, "uri": True},
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine_test
)


# ---------------------------------------------------------------------------
# Build a lightweight test FastAPI app (no MySQL lifespan)
# ---------------------------------------------------------------------------

def _make_test_app():
    """
    Mirror main.py but without the lifespan event that connects to MySQL.
    The get_db dependency is overridden per test via dependency_overrides.
    """
    app = FastAPI(title="InsightIQ Test")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router,      prefix="/api")
    app.include_router(data.router,      prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
    app.include_router(analytics.router, prefix="/api")

    @app.get("/api/health", response_model=HealthResponse, tags=["Health"])
    def health():
        return HealthResponse(status="ok", database="sqlite-test")

    return app


# Module-level app instance (routes registered once)
_test_app = _make_test_app()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="function")
def db():
    """
    Create all tables, seed an admin user, yield a session, then drop all
    tables so the next test starts fresh.
    """
    Base.metadata.create_all(bind=engine_test)

    session = TestingSessionLocal()
    session.add(
        User(username="testadmin", hashed_password=hash_password("testpass123"))
    )
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(scope="function")
def client(db):
    """
    TestClient whose get_db dependency returns the same session as `db`,
    so the pre-seeded data is visible to every request handler.
    """
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    _test_app.dependency_overrides[get_db] = _override_get_db

    with TestClient(_test_app, raise_server_exceptions=True) as c:
        yield c

    _test_app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_headers(client):
    """Return Authorization: Bearer headers for the seeded testadmin user."""
    resp = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpass123"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
