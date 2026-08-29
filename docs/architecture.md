# Architecture

InsightIQ uses a small three-layer architecture that keeps HTTP handling separate from business logic and persistence.

Browser dashboard -> FastAPI routers -> services -> SQLAlchemy models -> MySQL

`routers` will validate requests and shape responses. `services` will contain reusable analytics and data-cleaning logic. SQLAlchemy models will define the MySQL schema. The frontend will call authenticated REST APIs and render returned JSON with Chart.js.

This structure stays appropriate for a one-week portfolio project while making its calculation and validation code independently testable.
