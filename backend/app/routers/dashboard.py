"""
dashboard.py  (router)
----------------------
GET /api/dashboard/kpis — return the six KPI summary metrics.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas import FilterParams, KPIResponse
from app.services.analytics_service import get_kpis

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/kpis",
    response_model=KPIResponse,
    summary="Get dashboard KPI metrics",
)
def dashboard_kpis(
    date_from: Optional[date] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter end date (YYYY-MM-DD)"),
    region: Optional[str] = Query(None, description="Filter by region"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """
    Returns Total Revenue, Total Profit, Total Orders, Total Quantity,
    Average Order Value, and Profit Margin for the selected filters.
    """
    filters = FilterParams(
        date_from=date_from,
        date_to=date_to,
        region=region,
        category=category,
    )
    return get_kpis(db, filters)
