# API Reference

All dashboard and analytics endpoints will require a bearer token once authentication is implemented. FastAPI will expose the live OpenAPI interface at `/docs`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health check |
| GET | `/api/dashboard/kpis` | Dashboard KPIs |
| GET | `/api/analytics/sales-trend` | Revenue and profit by month |
| GET | `/api/analytics/regions` | Regional performance |
| GET | `/api/analytics/products` | Product performance |
| GET | `/api/analytics/categories` | Category performance |
| GET | `/api/analytics/customers/top` | Top customers by revenue |
| POST | `/api/data/upload` | Validate, clean, and import a sales CSV |

Where applicable, analytics endpoints will accept optional `start_date`, `end_date`, `region`, and `category` filters. API response schemas and error examples will be added alongside their implementation.
