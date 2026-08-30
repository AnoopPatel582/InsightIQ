# Database Documentation

## Database

Name: `insightiq`  
Engine: MySQL 8+ with `utf8mb4` character set.

## Tables

### `users`

Stores application login accounts (not sourced from CSV data).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Internal user ID |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL, INDEX | Login username |
| `hashed_password` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `created_at` | DATETIME | server_default=NOW() | Account creation time |

---

### `customers`

Unique customers extracted from uploaded CSV data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `customer_id` | VARCHAR(50) | PK | Business customer ID (e.g. CUST-0001) |
| `customer_name` | VARCHAR(200) | NOT NULL | Full name |
| `region` | VARCHAR(100) | NOT NULL, INDEX | Sales region |

---

### `products`

Unique products extracted from uploaded CSV data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `product_id` | VARCHAR(50) | PK | Business product ID (e.g. PROD-001) |
| `product_name` | VARCHAR(300) | NOT NULL | Product display name |
| `category` | VARCHAR(100) | NOT NULL, INDEX | Product category |

---

### `orders`

Individual sales transaction records from uploaded CSV data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `order_id` | VARCHAR(50) | PK | Business order ID (e.g. ORD-000001) |
| `order_date` | DATE | NOT NULL, INDEX | Transaction date |
| `customer_id` | VARCHAR(50) | FK → customers | Customer reference |
| `product_id` | VARCHAR(50) | FK → products | Product reference |
| `quantity` | INT | NOT NULL | Units sold (≥ 1) |
| `sales` | FLOAT | NOT NULL | Revenue value (> 0) |
| `profit` | FLOAT | NOT NULL | Profit value (can be negative) |

---

## Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `ix_orders_order_date` | orders | `order_date` | Date range queries |
| `ix_customers_region` | customers | `region` | Region filter |
| `ix_products_category` | products | `category` | Category filter |

---

## Entity-Relationship Diagram

```
users (standalone — application accounts only)

customers ────────────────────┐
  customer_id (PK)            │  1:N
  customer_name               │
  region                      │
                              ▼
                           orders
                            order_id (PK)
products ──────────────────► order_date
  product_id (PK)             customer_id (FK)
  product_name                product_id (FK)
  category                    quantity
                              sales
                              profit
```

---

## Setup SQL

Run this once to create the database (SQLAlchemy creates the tables automatically on first startup):

```sql
CREATE DATABASE insightiq
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## KPI Formulas

```
Total Revenue   = SUM(orders.sales)
Total Profit    = SUM(orders.profit)
Total Orders    = COUNT(DISTINCT orders.order_id)
Total Quantity  = SUM(orders.quantity)
Avg Order Value = Total Revenue / Total Orders
Profit Margin   = (Total Profit / Total Revenue) × 100
```

All calculations run through SQLAlchemy aggregation queries — no Pandas at query time.
