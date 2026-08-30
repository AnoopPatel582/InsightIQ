"""
test_api.py
-----------
Integration tests for FastAPI endpoints using the TestClient.
Covers authentication, all major analytics endpoints, and error cases.
"""

import io
import pytest


# ===========================================================================
# Test 1 — Health endpoint returns 200 with expected fields
# ===========================================================================

def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "database" in body


# ===========================================================================
# Test 2 — Login with valid credentials returns a JWT
# ===========================================================================

def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpass123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


# ===========================================================================
# Test 3 — Login with wrong password returns 401
# ===========================================================================

def test_login_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "wrongpassword"},
    )
    assert response.status_code == 401


# ===========================================================================
# Test 4 — Protected endpoint rejects requests without a token
# ===========================================================================

def test_kpis_requires_auth(client):
    response = client.get("/api/dashboard/kpis")
    assert response.status_code == 401


# ===========================================================================
# Test 5 — KPI endpoint returns expected fields when authenticated
# ===========================================================================

def test_kpis_authenticated(client, auth_headers):
    response = client.get("/api/dashboard/kpis", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    for field in [
        "total_revenue", "total_profit", "total_orders",
        "total_quantity", "avg_order_value", "profit_margin",
    ]:
        assert field in body, f"Missing field: {field}"


# ===========================================================================
# Test 6 — Sales trend endpoint returns a list (possibly empty)
# ===========================================================================

def test_sales_trend(client, auth_headers):
    response = client.get("/api/analytics/sales-trend", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ===========================================================================
# Test 7 — Regions endpoint returns a list
# ===========================================================================

def test_regions(client, auth_headers):
    response = client.get("/api/analytics/regions", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ===========================================================================
# Test 8 — Products endpoint returns a list
# ===========================================================================

def test_products(client, auth_headers):
    response = client.get("/api/analytics/products", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ===========================================================================
# Test 9 — CSV upload rejects non-CSV files
# ===========================================================================

def test_upload_non_csv(client, auth_headers):
    fake_file = io.BytesIO(b"this is not a csv")
    response = client.post(
        "/api/data/upload",
        files={"file": ("data.txt", fake_file, "text/plain")},
        headers=auth_headers,
    )
    assert response.status_code == 400


# ===========================================================================
# Test 10 — CSV upload with missing columns returns 422
# ===========================================================================

def test_upload_missing_columns(client, auth_headers):
    bad_csv = b"Order_ID,Sales\nO1,100\n"
    response = client.post(
        "/api/data/upload",
        files={"file": ("data.csv", io.BytesIO(bad_csv), "text/csv")},
        headers=auth_headers,
    )
    assert response.status_code == 422


# ===========================================================================
# Test 11 — Valid CSV upload returns upload summary
# ===========================================================================

VALID_CSV = (
    "Order_ID,Order_Date,Customer_ID,Customer_Name,Product_ID,"
    "Product_Name,Category,Region,Quantity,Sales,Profit\n"
    "O001,2023-01-15,C001,Alice Smith,P001,Laptop,Technology,East,2,2000.0,400.0\n"
    "O002,2023-02-10,C002,Bob Jones,P002,Chair,Furniture,West,1,500.0,75.0\n"
)


def test_upload_valid_csv(client, auth_headers):
    response = client.post(
        "/api/data/upload",
        files={"file": ("data.csv", io.BytesIO(VALID_CSV.encode()), "text/csv")},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["rows_received"] == 2
    assert body["rows_loaded"] == 2
    assert body["rows_skipped"] == 0


# ===========================================================================
# Test 12 — KPIs reflect uploaded data
# ===========================================================================

def test_kpis_after_upload(client, auth_headers):
    # Upload data first
    client.post(
        "/api/data/upload",
        files={"file": ("data.csv", io.BytesIO(VALID_CSV.encode()), "text/csv")},
        headers=auth_headers,
    )
    # Then verify KPIs
    response = client.get("/api/dashboard/kpis", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["total_revenue"] == 2500.0
    assert body["total_orders"] == 2


# ===========================================================================
# Test 13 — Unknown endpoint returns 404
# ===========================================================================

def test_unknown_endpoint(client):
    response = client.get("/api/nonexistent")
    assert response.status_code == 404


# ===========================================================================
# Test 14 — /api/auth/me returns username of current user
# ===========================================================================

def test_auth_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testadmin"


# ===========================================================================
# Test 15 — Insights endpoint returns a list of insight objects
# ===========================================================================

def test_insights_after_upload(client, auth_headers):
    client.post(
        "/api/data/upload",
        files={"file": ("data.csv", io.BytesIO(VALID_CSV.encode()), "text/csv")},
        headers=auth_headers,
    )
    response = client.get("/api/analytics/insights", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    if body:  # may be empty with only 2 records
        assert "title" in body[0]
        assert "description" in body[0]
