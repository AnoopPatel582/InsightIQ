# Architecture

InsightIQ uses a clean three-layer architecture that keeps HTTP handling, business logic, and data access completely separate.

## System Diagram

```
┌──────────────────────────────────────────────┐
│                  BROWSER                     │
│  frontend/index.html   frontend/dashboard.html│
│  frontend/js/auth.js   frontend/js/dashboard.js│
│  (Vanilla JS + Chart.js)                     │
└──────────────┬───────────────────────────────┘
               │ HTTP REST (JSON + JWT Bearer)
               ▼
┌──────────────────────────────────────────────┐
│              FastAPI (backend/)              │
│                                              │
│  app/main.py ─── CORS, startup, /api/health  │
│                                              │
│  routers/                                    │
│    auth.py     POST /api/auth/login          │
│    dashboard.py GET /api/dashboard/kpis      │
│    analytics.py GET /api/analytics/*         │
│    data.py     POST /api/data/upload         │
│                                              │
│  services/                                   │
│    auth_service.py    user lookup, seeding   │
│    analytics_service.py  KPI/chart queries   │
│                                              │
│  utils/                                      │
│    security.py        bcrypt + JWT           │
│    data_processor.py  CSV pipeline           │
└──────────────┬───────────────────────────────┘
               │ SQLAlchemy ORM (parameterised)
               ▼
┌──────────────────────────────────────────────┐
│                  MySQL                       │
│  tables: users, customers, products, orders  │
└──────────────────────────────────────────────┘
```

## Layer Responsibilities

### Routers (`app/routers/`)
- Parse and validate HTTP request parameters.
- Call service functions with clean inputs.
- Shape responses using Pydantic schemas.
- Never contain business logic or SQL.

### Services (`app/services/`)
- Contain all business logic and analytics calculations.
- Accept a database session and filter parameters.
- Return plain Python objects (not HTTP responses).
- Independently testable without an HTTP layer.

### Utils (`app/utils/`)
- `security.py` — bcrypt hashing and JWT operations. No DB knowledge.
- `data_processor.py` — CSV validation, cleaning, and DB loading. Testable with just a DataFrame and a session.

### Database (`app/database.py`, `app/models.py`)
- `database.py` creates the SQLAlchemy engine and the `get_db` dependency.
- `models.py` defines ORM models. No business logic; pure schema definition.

### Frontend
- Pure HTML/CSS/JavaScript — no build step, no framework.
- Reads JWT from `localStorage`, sends it as a Bearer header on every API call.
- Uses Chart.js 4 (CDN) to render all charts.

## Data Flow — CSV Upload

```
Browser  ──POST multipart CSV──►  data.py router
                                      │
                               validate_csv(df)   ← raises ValueError on bad structure
                                      │
                               clean_csv(df)      ← normalise, dedup, coerce types
                                      │
                               load_to_db(df, db) ← INSERT … ON DUPLICATE KEY UPDATE
                                      │
                              UploadSummary JSON  ──► Browser
```

## Data Flow — Analytics Query

```
Browser  ──GET /api/dashboard/kpis?region=East──►  dashboard.py router
                                                        │
                                              FilterParams(region="East")
                                                        │
                                             analytics_service.get_kpis(db, filters)
                                                        │
                                     SQLAlchemy JOIN + SUM + WHERE region="East"
                                                        │
                                               KPIResponse JSON  ──► Browser
```

## Security Design

- Passwords are hashed with bcrypt (never stored plain).
- JWT tokens are signed with HS256 using a secret key from `.env`.
- All analytics and upload endpoints require a valid JWT.
- All database queries use SQLAlchemy ORM (no string interpolation → no SQL injection).
- Secrets are loaded from `.env` and never committed.
