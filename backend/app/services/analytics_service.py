"""
analytics_service.py
--------------------
All database queries and calculations for the analytics API.

Each public function accepts a SQLAlchemy Session and a FilterParams object,
runs a parameterised query, and returns plain Python objects that the routers
serialise into JSON.

No raw SQL strings — all queries use the SQLAlchemy ORM so they are safe
from SQL injection.

Database compatibility:
  MySQL  (production) — uses date_format(date, '%Y-%m')
  SQLite (tests)      — uses strftime('%Y-%m', date)
The _month_expr() helper selects the right expression automatically.
"""

from __future__ import annotations

from datetime import date
from typing import List, Optional

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.models import Customer, Order, Product
from app.schemas import (
    CategoryItem,
    CustomerItem,
    FilterParams,
    InsightItem,
    KPIResponse,
    ProductItem,
    RegionItem,
    SalesTrendItem,
)


# ---------------------------------------------------------------------------
# Internal helper — dialect-aware month expression
# ---------------------------------------------------------------------------

def _month_expr(db: Session):
    """
    Return a SQLAlchemy column expression that formats order_date as 'YYYY-MM'.

    - MySQL  → date_format(order_date, '%Y-%m')
    - SQLite → strftime('%Y-%m', order_date)   (used during tests)
    """
    try:
        dialect = db.get_bind().dialect.name
    except Exception:
        dialect = "mysql"
    if dialect == "sqlite":
        return func.strftime("%Y-%m", Order.order_date)
    return func.date_format(Order.order_date, "%Y-%m")


# ---------------------------------------------------------------------------
# Internal helper — apply filters to an Order query
# ---------------------------------------------------------------------------

def _apply_filters(query, filters: FilterParams):
    """
    Attach WHERE clauses to an SQLAlchemy query based on FilterParams.

    The query must already have joined Customer and Product if region/category
    filters are needed.
    """
    if filters.date_from:
        query = query.filter(Order.order_date >= filters.date_from)
    if filters.date_to:
        query = query.filter(Order.order_date <= filters.date_to)
    if filters.region:
        query = query.filter(Customer.region == filters.region)
    if filters.category:
        query = query.filter(Product.category == filters.category)
    return query


# ---------------------------------------------------------------------------
# KPIs
# ---------------------------------------------------------------------------

def get_kpis(db: Session, filters: FilterParams) -> KPIResponse:
    """
    Calculate dashboard KPI cards:
      - Total Revenue, Total Profit, Total Orders,
        Total Quantity, Average Order Value, Profit Margin.
    """
    query = (
        db.query(
            func.sum(Order.sales).label("total_revenue"),
            func.sum(Order.profit).label("total_profit"),
            func.count(Order.order_id.distinct()).label("total_orders"),
            func.sum(Order.quantity).label("total_quantity"),
        )
        .join(Customer, Order.customer_id == Customer.customer_id)
        .join(Product, Order.product_id == Product.product_id)
    )
    query = _apply_filters(query, filters)
    row = query.one()

    total_revenue = float(row.total_revenue or 0)
    total_profit = float(row.total_profit or 0)
    total_orders = int(row.total_orders or 0)
    total_quantity = int(row.total_quantity or 0)

    avg_order_value = total_revenue / total_orders if total_orders else 0.0
    profit_margin = (total_profit / total_revenue * 100) if total_revenue else 0.0

    return KPIResponse(
        total_revenue=round(total_revenue, 2),
        total_profit=round(total_profit, 2),
        total_orders=total_orders,
        total_quantity=total_quantity,
        avg_order_value=round(avg_order_value, 2),
        profit_margin=round(profit_margin, 2),
    )


# ---------------------------------------------------------------------------
# Sales Trend
# ---------------------------------------------------------------------------

def get_sales_trend(db: Session, filters: FilterParams) -> List[SalesTrendItem]:
    """
    Aggregate revenue and profit by calendar month (YYYY-MM).
    Results are sorted chronologically.
    Works with both MySQL (production) and SQLite (tests).
    """
    month_expr = _month_expr(db).label("month")
    query = (
        db.query(
            month_expr,
            func.sum(Order.sales).label("revenue"),
            func.sum(Order.profit).label("profit"),
        )
        .join(Customer, Order.customer_id == Customer.customer_id)
        .join(Product, Order.product_id == Product.product_id)
        .group_by(month_expr)
        .order_by(month_expr)
    )
    query = _apply_filters(query, filters)
    rows = query.all()

    return [
        SalesTrendItem(
            month=row.month,
            revenue=round(float(row.revenue or 0), 2),
            profit=round(float(row.profit or 0), 2),
        )
        for row in rows
    ]


# ---------------------------------------------------------------------------
# Regions
# ---------------------------------------------------------------------------

def get_regions(db: Session, filters: FilterParams) -> List[RegionItem]:
    """
    Aggregate revenue, profit, and order count by region.
    Sorted by revenue descending.
    """
    query = (
        db.query(
            Customer.region.label("region"),
            func.sum(Order.sales).label("revenue"),
            func.sum(Order.profit).label("profit"),
            func.count(Order.order_id.distinct()).label("orders"),
        )
        .join(Customer, Order.customer_id == Customer.customer_id)
        .join(Product, Order.product_id == Product.product_id)
        .group_by(Customer.region)
        .order_by(func.sum(Order.sales).desc())
    )
    query = _apply_filters(query, filters)
    rows = query.all()

    return [
        RegionItem(
            region=row.region,
            revenue=round(float(row.revenue or 0), 2),
            profit=round(float(row.profit or 0), 2),
            orders=int(row.orders or 0),
        )
        for row in rows
    ]


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

def get_products(
    db: Session, filters: FilterParams, limit: int = 10
) -> List[ProductItem]:
    """
    Top products by revenue.  Default limit 10 (for the "Top 10" chart).
    """
    query = (
        db.query(
            Product.product_id.label("product_id"),
            Product.product_name.label("product_name"),
            Product.category.label("category"),
            func.sum(Order.sales).label("revenue"),
            func.sum(Order.profit).label("profit"),
            func.sum(Order.quantity).label("quantity"),
        )
        .join(Customer, Order.customer_id == Customer.customer_id)
        .join(Product, Order.product_id == Product.product_id)
        .group_by(Product.product_id, Product.product_name, Product.category)
        .order_by(func.sum(Order.sales).desc())
        .limit(limit)
    )
    query = _apply_filters(query, filters)
    rows = query.all()

    return [
        ProductItem(
            product_id=row.product_id,
            product_name=row.product_name,
            category=row.category,
            revenue=round(float(row.revenue or 0), 2),
            profit=round(float(row.profit or 0), 2),
            quantity=int(row.quantity or 0),
        )
        for row in rows
    ]


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------

def get_categories(db: Session, filters: FilterParams) -> List[CategoryItem]:
    """
    Aggregate revenue, profit, and order count by product category.
    Sorted by revenue descending.
    """
    query = (
        db.query(
            Product.category.label("category"),
            func.sum(Order.sales).label("revenue"),
            func.sum(Order.profit).label("profit"),
            func.count(Order.order_id.distinct()).label("orders"),
        )
        .join(Customer, Order.customer_id == Customer.customer_id)
        .join(Product, Order.product_id == Product.product_id)
        .group_by(Product.category)
        .order_by(func.sum(Order.sales).desc())
    )
    query = _apply_filters(query, filters)
    rows = query.all()

    result = []
    for row in rows:
        revenue = float(row.revenue or 0)
        profit = float(row.profit or 0)
        margin = (profit / revenue * 100) if revenue else 0.0
        result.append(
            CategoryItem(
                category=row.category,
                revenue=round(revenue, 2),
                profit=round(profit, 2),
                orders=int(row.orders or 0),
                profit_margin=round(margin, 2),
            )
        )
    return result


# ---------------------------------------------------------------------------
# Top Customers
# ---------------------------------------------------------------------------

def get_top_customers(
    db: Session, filters: FilterParams, limit: int = 10
) -> List[CustomerItem]:
    """Top customers by total revenue, default top 10."""
    query = (
        db.query(
            Customer.customer_id.label("customer_id"),
            Customer.customer_name.label("customer_name"),
            Customer.region.label("region"),
            func.sum(Order.sales).label("revenue"),
            func.count(Order.order_id.distinct()).label("orders"),
        )
        .join(Customer, Order.customer_id == Customer.customer_id)
        .join(Product, Order.product_id == Product.product_id)
        .group_by(
            Customer.customer_id,
            Customer.customer_name,
            Customer.region,
        )
        .order_by(func.sum(Order.sales).desc())
        .limit(limit)
    )
    query = _apply_filters(query, filters)
    rows = query.all()

    return [
        CustomerItem(
            customer_id=row.customer_id,
            customer_name=row.customer_name,
            region=row.region,
            revenue=round(float(row.revenue or 0), 2),
            orders=int(row.orders or 0),
        )
        for row in rows
    ]


# ---------------------------------------------------------------------------
# Business Insights (rule-based, no ML)
# ---------------------------------------------------------------------------

def get_insights(db: Session, filters: FilterParams) -> List[InsightItem]:
    """
    Generate 3–5 plain-English business insights using simple rules.

    All insights are derived from the same filtered data the dashboard shows.
    """
    insights: List[InsightItem] = []

    # --- Highest revenue region ---
    regions = get_regions(db, filters)
    if regions:
        top_region = regions[0]
        insights.append(
            InsightItem(
                title="Top Revenue Region",
                description=(
                    f"{top_region.region} is your highest-revenue region."
                ),
                value=f"${top_region.revenue:,.2f}",
            )
        )

    # --- Highest revenue category ---
    categories = get_categories(db, filters)
    if categories:
        top_cat = categories[0]
        insights.append(
            InsightItem(
                title="Leading Category",
                description=(
                    f"{top_cat.category} generates the most revenue "
                    f"with a {top_cat.profit_margin:.1f}% profit margin."
                ),
                value=f"${top_cat.revenue:,.2f}",
            )
        )

    # --- Category with highest profit margin ---
    if categories:
        best_margin_cat = max(categories, key=lambda c: c.profit_margin)
        if best_margin_cat.category != categories[0].category:
            insights.append(
                InsightItem(
                    title="Best Profit Margin Category",
                    description=(
                        f"{best_margin_cat.category} has the highest "
                        f"profit margin at {best_margin_cat.profit_margin:.1f}%."
                    ),
                    value=f"{best_margin_cat.profit_margin:.1f}%",
                )
            )

    # --- Highest revenue product ---
    products = get_products(db, filters, limit=1)
    if products:
        top_prod = products[0]
        insights.append(
            InsightItem(
                title="Best-Selling Product",
                description=(
                    f"{top_prod.product_name} leads all products in revenue."
                ),
                value=f"${top_prod.revenue:,.2f}",
            )
        )

    # --- Best performing customer ---
    customers = get_top_customers(db, filters, limit=1)
    if customers:
        top_cust = customers[0]
        insights.append(
            InsightItem(
                title="Top Customer",
                description=(
                    f"{top_cust.customer_name} ({top_cust.region}) is your "
                    f"highest-value customer with {top_cust.orders} orders."
                ),
                value=f"${top_cust.revenue:,.2f}",
            )
        )

    # --- Month-over-month revenue change ---
    trend = get_sales_trend(db, filters)
    if len(trend) >= 2:
        prev = trend[-2].revenue
        curr = trend[-1].revenue
        if prev > 0:
            change_pct = ((curr - prev) / prev) * 100
            direction = "up" if change_pct >= 0 else "down"
            insights.append(
                InsightItem(
                    title="Month-over-Month Revenue",
                    description=(
                        f"Revenue is {direction} {abs(change_pct):.1f}% "
                        f"compared to the previous month "
                        f"({trend[-2].month} → {trend[-1].month})."
                    ),
                    value=f"{change_pct:+.1f}%",
                )
            )

    # Return at most 5 insights
    return insights[:5]
