# Database Design

The production database is MySQL database `insightiq`.

| Table | Purpose | Primary key |
| --- | --- | --- |
| `customers` | Customer identity and assigned region | `customer_id` |
| `products` | Product name and category | `product_id` |
| `orders` | Sales transactions | `order_id` |

`orders.customer_id` references `customers.customer_id`; `orders.product_id` references `products.product_id`. Order-date, customer, product, region/category lookup paths will receive indexes as the schema is implemented. Monetary values will use fixed-precision decimal columns rather than floats.
