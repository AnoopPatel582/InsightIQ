# InsightIQ

**InsightIQ** is a business analytics and decision-support platform that converts raw sales transaction CSV data into meaningful KPIs, interactive visualisations, and simple rule-based business insights.

---

## Features

- 🔐 **Secure login** — bcrypt password hashing + JWT-protected API endpoints.
- 📤 **CSV upload** — validates columns, cleans data, deduplicates, and stores in MySQL.
- 📊 **Interactive dashboard** — six KPI cards + four Chart.js charts.
- 🔍 **Filters** — date range, region, and category filters on every metric.
- 💡 **Rule-based insights** — 3–5 automatic plain-English business observations.
- 🧪 **Tested** — 15 Pytest tests (unit + API integration).
- 📖 **Auto API docs** — FastAPI Swagger UI at `/docs`.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, SQLAlchemy |
| Database | MySQL 8+ |
| Data processing | Pandas, NumPy |
| Authentication | passlib (bcrypt), python-jose (JWT) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Chart.js 4 |
| Testing | Pytest, FastAPI TestClient, httpx |

---

## Architecture

```
Browser  ──►  HTML/CSS/JS (frontend/)
                  │  REST (JSON + JWT)
                  ▼
            FastAPI (backend/app/main.py)
                  │
         ┌────────┴────────┐
      routers/          services/
    (HTTP layer)      (business logic)
                          │
                     SQLAlchemy ORM
                          │
                       MySQL
```

See [`docs/architecture.md`](docs/architecture.md) for more detail.

---

## Project Structure

```
InsightIQ/
├── backend/
│   ├── app/
│   │   ├── config.py          # Settings from .env
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models.py          # ORM models (users, customers, products, orders)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── main.py            # FastAPI app, CORS, startup
│   │   ├── routers/
│   │   │   ├── auth.py        # POST /api/auth/login, GET /api/auth/me
│   │   │   ├── dashboard.py   # GET /api/dashboard/kpis
│   │   │   ├── analytics.py   # GET /api/analytics/*
│   │   │   └── data.py        # POST /api/data/upload
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── analytics_service.py
│   │   └── utils/
│   │       ├── security.py    # Hashing + JWT helpers
│   │       └── data_processor.py  # CSV pipeline
│   ├── tests/
│   │   ├── conftest.py        # Pytest fixtures
│   │   ├── test_analytics.py  # 9 unit tests
│   │   └── test_api.py        # 15 API integration tests
│   └── requirements.txt
├── frontend/
│   ├── index.html             # Login page
│   ├── dashboard.html         # Analytics dashboard
│   ├── css/style.css          # Dark-mode design system
│   └── js/
│       ├── auth.js            # Login form logic
│       └── dashboard.js       # Chart rendering + API calls
├── data/
│   ├── generate_sample_data.py
│   └── sample_sales.csv       # ~5,100 synthetic records (after generation)
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── database.md
│   └── requirements.md
├── .env.example
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.11 or later
- MySQL 8 or later
- Git

### 1. Clone the repository

```bash
git clone https://github.com/AnoopPatel582/InsightIQ.git
cd InsightIQ
```

### 2. Create a Python virtual environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up MySQL

Log in to MySQL as root and run:

```sql
CREATE DATABASE insightiq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Optional: create a dedicated user
CREATE USER 'insightiq_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON insightiq.* TO 'insightiq_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Configure environment variables

```bash
# From the project root
cp .env.example backend/.env
```

Edit `backend/.env` and set your values:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/insightiq
SECRET_KEY=replace-with-a-long-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_USERNAME=admin
ADMIN_PASSWORD=insightiq2026
```

---

## Running the Backend

```bash
# From the backend/ directory with .venv active
cd backend
uvicorn app.main:app --reload
```

The API starts at **http://127.0.0.1:8000**.  
Swagger UI: **http://127.0.0.1:8000/docs**

On first startup, the server will:
1. Create all MySQL tables automatically.
2. Seed the admin account using `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## Loading Sample Data

```bash
# From the project root
cd data
python generate_sample_data.py
```

This generates `data/sample_sales.csv` (~5,100 synthetic rows).

Then upload via the dashboard (CSV Upload section) or curl:

```bash
curl -X POST http://127.0.0.1:8000/api/data/upload \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@data/sample_sales.csv"
```

---

## Running the Frontend

Open `frontend/index.html` in your browser (no build step needed).

Log in with:
- **Username:** `admin`
- **Password:** `insightiq2026` (or whatever you set in `.env`)

---

## Running Tests

```bash
# From the backend/ directory with .venv active
cd backend
pytest tests/ -v
```

Tests use an in-memory SQLite database — no MySQL needed.

Expected: **15 tests pass**.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | SQLAlchemy MySQL connection string |
| `SECRET_KEY` | dev key | JWT signing secret — **change in production** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime in minutes |
| `ADMIN_USERNAME` | `admin` | Seeded admin username |
| `ADMIN_PASSWORD` | `insightiq2026` | Seeded admin password |

---

## API Documentation

Full endpoint reference: [`docs/api.md`](docs/api.md)  
Interactive docs: `http://127.0.0.1:8000/docs` (Swagger UI)

### Quick reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Liveness check |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/dashboard/kpis` | Yes | Six KPI metrics |
| GET | `/api/analytics/sales-trend` | Yes | Monthly revenue/profit |
| GET | `/api/analytics/regions` | Yes | By region |
| GET | `/api/analytics/products` | Yes | Top products |
| GET | `/api/analytics/categories` | Yes | By category |
| GET | `/api/analytics/customers/top` | Yes | Top customers |
| GET | `/api/analytics/insights` | Yes | Rule-based insights |
| POST | `/api/data/upload` | Yes | Upload CSV |

All analytics endpoints accept `date_from`, `date_to`, `region`, `category` query parameters.

---

## Future Improvements

- Export dashboard as PDF.
- Role-based access control (admin vs viewer).
- Email alerts when KPIs cross thresholds.
- Dark/light mode toggle.
- Unit breakdown by sub-category.
- PostgreSQL support (minor config change).
