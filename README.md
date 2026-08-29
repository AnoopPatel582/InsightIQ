# InsightIQ

InsightIQ is a business analytics and decision-support platform that turns sales transaction CSV data into reliable KPIs, interactive visualizations, and practical rule-based insights.

## Planned capabilities

- Secure login with hashed passwords and JWT-protected APIs.
- CSV validation, cleaning, deduplication, and MySQL storage.
- Filterable revenue, profit, order, quantity, order-value, and profit-margin KPIs.
- Sales trends and regional, category, product, and customer analysis.
- A responsive HTML, CSS, JavaScript, and Chart.js dashboard.
- Swagger API documentation and meaningful automated tests.

## Technology

- Backend: Python, FastAPI, SQLAlchemy, Pandas, NumPy, and MySQL.
- Frontend: HTML, CSS, JavaScript, and Chart.js.
- Testing: Pytest and FastAPI TestClient.

## Repository layout

`backend/` contains the FastAPI application and tests. `frontend/` will contain the login and dashboard assets. `data/` holds local sample datasets and uploads. `docs/` provides requirements, architecture, database, and API documentation.

## Development status

The repository foundation is in place. The next increment will implement the FastAPI application configuration, database connection, health endpoint, and test baseline.

## Local setup

1. Copy `.env.example` to `backend/.env` and replace placeholder values.
2. Create the MySQL `insightiq` database.
3. Install `backend/requirements.txt` in a virtual environment.
4. Run the FastAPI app and open `/docs` for interactive API documentation.

Detailed design documents are in [docs](docs/).
