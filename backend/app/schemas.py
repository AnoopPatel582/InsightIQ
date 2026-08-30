"""
schemas.py
----------
Pydantic v2 models used for:
  - Request bodies  (what the client sends)
  - Response bodies (what the API returns)

Keeping schemas separate from ORM models means the API contract can
change independently of the database schema.
"""

from __future__ import annotations

from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


# ===========================================================================
# Auth schemas
# ===========================================================================

class LoginRequest(BaseModel):
    """Payload sent by the client to the login endpoint."""
    username: str
    password: str


class Token(BaseModel):
    """JWT token returned after a successful login."""
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    """Public user information (password never exposed)."""
    id: int
    username: str

    model_config = {"from_attributes": True}


# ===========================================================================
# Filter schemas  (shared query parameters)
# ===========================================================================

class FilterParams(BaseModel):
    """
    Common filters applied to all analytics endpoints.
    All fields are optional — omitting them means "no filter applied".
    """
    date_from: Optional[date] = Field(None, description="Start date (YYYY-MM-DD)")
    date_to: Optional[date] = Field(None, description="End date (YYYY-MM-DD)")
    region: Optional[str] = Field(None, description="Filter by region name")
    category: Optional[str] = Field(None, description="Filter by product category")


# ===========================================================================
# Dashboard KPI schema
# ===========================================================================

class KPIResponse(BaseModel):
    """Top-level KPI metrics for the dashboard summary cards."""
    total_revenue: float = Field(..., description="Sum of all Sales values")
    total_profit: float = Field(..., description="Sum of all Profit values")
    total_orders: int = Field(..., description="Count of distinct Order IDs")
    total_quantity: int = Field(..., description="Sum of all Quantity values")
    avg_order_value: float = Field(
        ..., description="Total Revenue / Total Orders"
    )
    profit_margin: float = Field(
        ..., description="(Total Profit / Total Revenue) × 100"
    )


# ===========================================================================
# Analytics schemas
# ===========================================================================

class SalesTrendItem(BaseModel):
    """Revenue and profit aggregated by calendar month."""
    month: str = Field(..., description="Month label, e.g. '2023-01'")
    revenue: float
    profit: float


class RegionItem(BaseModel):
    """Revenue and profit aggregated by sales region."""
    region: str
    revenue: float
    profit: float
    orders: int


class ProductItem(BaseModel):
    """Revenue and profit for a single product."""
    product_id: str
    product_name: str
    category: str
    revenue: float
    profit: float
    quantity: int


class CategoryItem(BaseModel):
    """Revenue and profit aggregated by product category."""
    category: str
    revenue: float
    profit: float
    orders: int
    profit_margin: float = Field(
        ..., description="(profit / revenue) × 100"
    )


class CustomerItem(BaseModel):
    """Revenue summary for a single customer."""
    customer_id: str
    customer_name: str
    region: str
    revenue: float
    orders: int


# ===========================================================================
# Insights schema
# ===========================================================================

class InsightItem(BaseModel):
    """A single rule-based business insight."""
    title: str = Field(..., description="Short headline for the insight")
    description: str = Field(..., description="One-sentence explanation")
    value: Optional[str] = Field(
        None, description="Key metric supporting the insight (optional)"
    )


# ===========================================================================
# Data upload schema
# ===========================================================================

class UploadSummary(BaseModel):
    """Summary returned after a successful CSV upload."""
    rows_received: int
    rows_loaded: int
    rows_skipped: int
    message: str


# ===========================================================================
# Health schema
# ===========================================================================

class HealthResponse(BaseModel):
    status: str
    database: str
