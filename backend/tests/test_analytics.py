"""
test_analytics.py
-----------------
Unit tests for the data processing pipeline and analytics service logic.

These tests run against an in-memory SQLite database — no MySQL needed.
"""

import io
from datetime import date

import pandas as pd
import pytest
from sqlalchemy.orm import Session

from app.models import Customer, Order, Product
from app.schemas import FilterParams
from app.services.analytics_service import (
    get_categories,
    get_kpis,
    get_products,
    get_regions,
    get_sales_trend,
    get_top_customers,
    get_insights,
)
from app.utils.data_processor import clean_csv, validate_csv


# ===========================================================================
# Helpers — seed sample data into the test DB
# ===========================================================================

def _seed_data(db: Session):
    """Insert minimal test data so analytics queries return results."""
    db.add(Customer(customer_id="C001", customer_name="Alice Smith", region="East"))
    db.add(Customer(customer_id="C002", customer_name="Bob Jones", region="West"))
    db.add(Product(product_id="P001", product_name="Laptop", category="Technology"))
    db.add(Product(product_id="P002", product_name="Chair", category="Furniture"))
    db.add_all([
        Order(order_id="O001", order_date=date(2023, 1, 15),
              customer_id="C001", product_id="P001",
              quantity=2, sales=2000.0, profit=400.0),
        Order(order_id="O002", order_date=date(2023, 2, 10),
              customer_id="C002", product_id="P002",
              quantity=1, sales=500.0, profit=75.0),
        Order(order_id="O003", order_date=date(2023, 2, 20),
              customer_id="C001", product_id="P002",
              quantity=3, sales=300.0, profit=30.0),
    ])
    db.commit()


# ===========================================================================
# Test 1 — KPI calculations are arithmetically correct
# ===========================================================================

def test_kpi_calculations(db):
    _seed_data(db)
    filters = FilterParams()
    kpis = get_kpis(db, filters)

    assert kpis.total_revenue == 2800.0
    assert kpis.total_profit == 505.0
    assert kpis.total_orders == 3
    assert kpis.total_quantity == 6
    assert kpis.avg_order_value == round(2800.0 / 3, 2)
    assert kpis.profit_margin == round(505.0 / 2800.0 * 100, 2)


# ===========================================================================
# Test 2 — Region filter scopes KPIs correctly
# ===========================================================================

def test_kpi_region_filter(db):
    _seed_data(db)
    filters = FilterParams(region="East")
    kpis = get_kpis(db, filters)

    # Only Alice's orders (O001, O003)
    assert kpis.total_revenue == 2300.0
    assert kpis.total_orders == 2


# ===========================================================================
# Test 3 — Sales trend returns months in order
# ===========================================================================

def test_sales_trend_order(db):
    _seed_data(db)
    trend = get_sales_trend(db, FilterParams())

    months = [item.month for item in trend]
    assert months == sorted(months), "Sales trend months are not in chronological order"
    assert "2023-01" in months
    assert "2023-02" in months


# ===========================================================================
# Test 4 — Regions aggregation
# ===========================================================================

def test_regions(db):
    _seed_data(db)
    regions = get_regions(db, FilterParams())

    region_names = {r.region for r in regions}
    assert "East" in region_names
    assert "West" in region_names
    # East should have higher revenue than West (2300 vs 500)
    east = next(r for r in regions if r.region == "East")
    west = next(r for r in regions if r.region == "West")
    assert east.revenue > west.revenue


# ===========================================================================
# Test 5 — Validate CSV rejects missing columns
# ===========================================================================

def test_validate_csv_missing_columns():
    df = pd.DataFrame({"Order_ID": ["O1"], "Sales": [100]})
    with pytest.raises(ValueError, match="missing required columns"):
        validate_csv(df)


# ===========================================================================
# Test 6 — Validate CSV rejects empty DataFrame
# ===========================================================================

def test_validate_csv_empty():
    columns = [
        "Order_ID", "Order_Date", "Customer_ID", "Customer_Name",
        "Product_ID", "Product_Name", "Category", "Region",
        "Quantity", "Sales", "Profit",
    ]
    df = pd.DataFrame(columns=columns)
    with pytest.raises(ValueError, match="no data rows"):
        validate_csv(df)


# ===========================================================================
# Test 7 — Clean CSV removes negative quantities
# ===========================================================================

def test_clean_csv_removes_negative_quantity():
    df = pd.DataFrame({
        "Order_ID": ["O1", "O2"],
        "Order_Date": ["2023-01-01", "2023-01-02"],
        "Customer_ID": ["C1", "C2"],
        "Customer_Name": ["Alice", "Bob"],
        "Product_ID": ["P1", "P2"],
        "Product_Name": ["Laptop", "Chair"],
        "Category": ["Tech", "Furniture"],
        "Region": ["East", "West"],
        "Quantity": [-1, 3],    # O1 has invalid negative quantity
        "Sales": [100.0, 50.0],
        "Profit": [20.0, 10.0],
    })
    cleaned = clean_csv(df)
    assert len(cleaned) == 1
    assert cleaned.iloc[0]["order_id"] == "O2"


# ===========================================================================
# Test 8 — Clean CSV removes duplicate order rows
# ===========================================================================

def test_clean_csv_removes_duplicates():
    row = {
        "Order_ID": "O1",
        "Order_Date": "2023-01-01",
        "Customer_ID": "C1",
        "Customer_Name": "Alice",
        "Product_ID": "P1",
        "Product_Name": "Laptop",
        "Category": "Tech",
        "Region": "East",
        "Quantity": 2,
        "Sales": 200.0,
        "Profit": 40.0,
    }
    df = pd.DataFrame([row, row])  # exact duplicate
    cleaned = clean_csv(df)
    assert len(cleaned) == 1


# ===========================================================================
# Test 9 — Clean CSV drops rows with invalid (non-numeric) sales
# ===========================================================================

def test_clean_csv_invalid_sales():
    df = pd.DataFrame({
        "Order_ID": ["O1", "O2"],
        "Order_Date": ["2023-01-01", "2023-01-02"],
        "Customer_ID": ["C1", "C2"],
        "Customer_Name": ["Alice", "Bob"],
        "Product_ID": ["P1", "P2"],
        "Product_Name": ["Laptop", "Chair"],
        "Category": ["Tech", "Furniture"],
        "Region": ["East", "West"],
        "Quantity": [1, 2],
        "Sales": ["NOT_A_NUMBER", 50.0],   # O1 has invalid sales
        "Profit": [10.0, 5.0],
    })
    cleaned = clean_csv(df)
    assert len(cleaned) == 1
    assert cleaned.iloc[0]["order_id"] == "O2"
