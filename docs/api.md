# API Documentation

Base URL: `http://127.0.0.1:8000`

Interactive Swagger UI: `GET /docs`  
ReDoc: `GET /redoc`

All protected endpoints require the header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /api/auth/login

Login and receive a JWT access token.

**Request body (JSON):**
```json
{ "username": "admin", "password": "insightiq2026" }
```

**Response 200:**
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

**Response 401:** Invalid credentials.

---

### GET /api/auth/me

Returns the currently authenticated user.

**Response 200:**
```json
{ "id": 1, "username": "admin" }
```

---

## Health

### GET /api/health

Liveness check — no auth required.

**Response 200:**
```json
{ "status": "ok", "database": "connected" }
```

---

## Dashboard

### GET /api/dashboard/kpis

Returns the six summary KPI metrics.

**Query parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `date_from` | date | Start date `YYYY-MM-DD` |
| `date_to` | date | End date `YYYY-MM-DD` |
| `region` | string | Filter by region name |
| `category` | string | Filter by product category |

**Response 200:**
```json
{
  "total_revenue": 1234567.89,
  "total_profit": 345678.90,
  "total_orders": 4800,
  "total_quantity": 18500,
  "avg_order_value": 257.20,
  "profit_margin": 28.0
}
```

---

## Analytics

All analytics endpoints accept the same optional filter query parameters as `/api/dashboard/kpis`.

### GET /api/analytics/sales-trend

Monthly revenue and profit, sorted chronologically.

**Response 200:**
```json
[
  { "month": "2022-01", "revenue": 85000.0, "profit": 21000.0 },
  { "month": "2022-02", "revenue": 92000.0, "profit": 24000.0 }
]
```

---

### GET /api/analytics/regions

Revenue, profit, and order count per sales region.

**Response 200:**
```json
[
  { "region": "East", "revenue": 350000.0, "profit": 90000.0, "orders": 1200 },
  { "region": "West", "revenue": 280000.0, "profit": 72000.0, "orders": 980 }
]
```

---

### GET /api/analytics/products

Top products by revenue.

**Additional query parameter:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit` | `10` | Number of products to return (1–100) |

**Response 200:**
```json
[
  {
    "product_id": "PROD-004",
    "product_name": "4K Monitor",
    "category": "Technology",
    "revenue": 94500.0,
    "profit": 22000.0,
    "quantity": 420
  }
]
```

---

### GET /api/analytics/categories

Revenue, profit, order count, and profit margin per product category.

**Response 200:**
```json
[
  {
    "category": "Technology",
    "revenue": 580000.0,
    "profit": 148000.0,
    "orders": 1800,
    "profit_margin": 25.5
  }
]
```

---

### GET /api/analytics/customers/top

Top customers by total revenue.

**Additional query parameter:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit` | `10` | Number of customers to return (1–50) |

**Response 200:**
```json
[
  {
    "customer_id": "CUST-0042",
    "customer_name": "Emma Johnson",
    "region": "East",
    "revenue": 12450.0,
    "orders": 18
  }
]
```

---

### GET /api/analytics/insights

Rule-based business insights (3–5 items).

**Response 200:**
```json
[
  {
    "title": "Top Revenue Region",
    "description": "East is your highest-revenue region.",
    "value": "$350,000.00"
  },
  {
    "title": "Month-over-Month Revenue",
    "description": "Revenue is up 12.3% compared to the previous month (2024-11 → 2024-12).",
    "value": "+12.3%"
  }
]
```

---

## Data

### POST /api/data/upload

Upload a sales CSV file. Validates, cleans, and loads data into MySQL.

**Content-Type:** `multipart/form-data`

**Form field:** `file` — a `.csv` file

**Required CSV columns:**
`Order_ID`, `Order_Date`, `Customer_ID`, `Customer_Name`, `Product_ID`, `Product_Name`, `Category`, `Region`, `Quantity`, `Sales`, `Profit`

**Response 200:**
```json
{
  "rows_received": 5100,
  "rows_loaded": 5000,
  "rows_skipped": 100,
  "message": "Successfully processed sample_sales.csv."
}
```

**Response 400:** Not a CSV file, or parse error.  
**Response 422:** Missing required columns.
