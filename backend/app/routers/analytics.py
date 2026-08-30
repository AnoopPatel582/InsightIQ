"""
analytics.py  (router)
-----------------------
All analytics endpoints — all JWT protected, all support common filter params.

GET /api/analytics/sales-trend
GET /api/analytics/regions
GET /api/analytics/products
GET /api/analytics/categories
GET /api/analytics/customers/top
GET /api/analytics/insights
"""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas import (
    CategoryItem,
    CustomerItem,
    FilterParams,
    InsightItem,
    ProductItem,
    RegionItem,
    SalesTrendItem,
)
from app.services.analytics_service import (
    get_categories,
    get_insights,
    get_products,
    get_regions,
    get_sales_trend,
    get_top_customers,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------------------------------------------------------------------
# Shared filter dependency
# ---------------------------------------------------------------------------
def _filters(
    date_from: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    region: Optional[str] = Query(None, description="Filter by region"),
    category: Optional[str] = Query(None, description="Filter by product category"),
) -> FilterParams:
    return FilterParams(
        date_from=date_from,
        date_to=date_to,
        region=region,
        category=category,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/sales-trend",
    response_model=List[SalesTrendItem],
    summary="Monthly revenue and profit trend",
)
def sales_trend(
    filters: FilterParams = Depends(_filters),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Returns revenue and profit aggregated by calendar month, sorted chronologically."""
    return get_sales_trend(db, filters)


@router.get(
    "/regions",
    response_model=List[RegionItem],
    summary="Revenue and profit by region",
)
def regions(
    filters: FilterParams = Depends(_filters),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Returns revenue, profit, and order count per sales region."""
    return get_regions(db, filters)


@router.get(
    "/products",
    response_model=List[ProductItem],
    summary="Top products by revenue",
)
def products(
    limit: int = Query(10, ge=1, le=100, description="Number of top products to return"),
    filters: FilterParams = Depends(_filters),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Returns the top N products ranked by total revenue."""
    return get_products(db, filters, limit=limit)


@router.get(
    "/categories",
    response_model=List[CategoryItem],
    summary="Revenue and profit by product category",
)
def categories(
    filters: FilterParams = Depends(_filters),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Returns revenue, profit, order count, and profit margin per category."""
    return get_categories(db, filters)


@router.get(
    "/customers/top",
    response_model=List[CustomerItem],
    summary="Top customers by revenue",
)
def top_customers(
    limit: int = Query(10, ge=1, le=50, description="Number of top customers to return"),
    filters: FilterParams = Depends(_filters),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Returns the top N customers ranked by total revenue."""
    return get_top_customers(db, filters, limit=limit)


@router.get(
    "/insights",
    response_model=List[InsightItem],
    summary="Rule-based business insights",
)
def insights(
    filters: FilterParams = Depends(_filters),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Returns 3–5 plain-English rule-based insights from the filtered data."""
    return get_insights(db, filters)
