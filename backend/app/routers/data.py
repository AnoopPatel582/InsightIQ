"""
data.py  (router)
-----------------
POST /api/data/upload — accept a CSV file, validate, clean, and load to MySQL.
"""

import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas import UploadSummary
from app.utils.data_processor import clean_csv, load_to_db, validate_csv

router = APIRouter(prefix="/data", tags=["Data"])


@router.post(
    "/upload",
    response_model=UploadSummary,
    summary="Upload a sales CSV file",
    status_code=status.HTTP_200_OK,
)
async def upload_csv(
    file: UploadFile = File(..., description="Sales CSV file"),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """
    Accept a multipart CSV upload, validate required columns, clean the data,
    and insert/update records in MySQL.

    Returns a summary of how many rows were loaded and skipped.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .csv files are accepted.",
        )

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not parse CSV: {exc}",
        )

    rows_received = len(df)

    # Step 1 — Validate structure
    try:
        validate_csv(df)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    # Step 2 — Clean
    df = clean_csv(df)

    # Step 3 — Load to MySQL
    rows_loaded, rows_skipped = load_to_db(df, db)

    return UploadSummary(
        rows_received=rows_received,
        rows_loaded=rows_loaded,
        rows_skipped=rows_skipped,
        message=f"Successfully processed {file.filename}.",
    )
