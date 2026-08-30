"""
data_processor.py
-----------------
CSV validation, cleaning, and database loading pipeline.

Three public functions, called in order:
  1. validate_csv(df)   — check structure and raise on fatal errors
  2. clean_csv(df)      — normalise and sanitise the data
  3. load_to_db(df, db) — upsert rows into the database

MySQL-specific ON DUPLICATE KEY UPDATE is used in production.
For SQLite (used in tests) we fall back to a merge/ignore approach.
"""

from __future__ import annotations

import logging
from typing import Tuple

import pandas as pd
from sqlalchemy.orm import Session

from app.models import Customer, Order, Product

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {
    "order_id", "order_date", "customer_id", "customer_name",
    "product_id", "product_name", "category", "region",
    "quantity", "sales", "profit",
}


# ---------------------------------------------------------------------------
# Step 1 — Validate
# ---------------------------------------------------------------------------

def validate_csv(df: pd.DataFrame) -> None:
    """
    Check that the DataFrame has the required columns and sensible structure.
    Raises ValueError with a descriptive message on any fatal problem.
    """
    actual_columns = {c.strip().lower() for c in df.columns}
    missing = REQUIRED_COLUMNS - actual_columns
    if missing:
        raise ValueError(f"CSV is missing required columns: {sorted(missing)}")
    if df.empty:
        raise ValueError("CSV file contains no data rows.")


# ---------------------------------------------------------------------------
# Step 2 — Clean
# ---------------------------------------------------------------------------

def clean_csv(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalise and sanitise the DataFrame.

    Steps:
      - Normalise column names to lowercase with underscores.
      - Parse order_date to datetime.Date.
      - Cast quantity to int, sales and profit to float.
      - Drop rows with missing values in key columns.
      - Drop rows where quantity < 1 (negative/zero quantities are invalid).
      - Drop rows where sales <= 0.
      - Remove exact duplicate order_id + product_id + customer_id rows.

    Returns a clean copy; the original is not modified.
    """
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df = df.dropna(subset=["order_date"])
    df["order_date"] = df["order_date"].dt.date

    str_cols = ["order_id", "customer_id", "customer_name",
                "product_id", "product_name", "category", "region"]
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()

    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["sales"]    = pd.to_numeric(df["sales"],    errors="coerce")
    df["profit"]   = pd.to_numeric(df["profit"],   errors="coerce")

    df = df.dropna(subset=["order_id", "customer_id", "product_id",
                            "quantity", "sales", "profit"])
    df = df[df["quantity"] >= 1]
    df = df[df["sales"] > 0]
    df["quantity"] = df["quantity"].astype(int)
    df = df.drop_duplicates(subset=["order_id", "product_id", "customer_id"])
    df = df.reset_index(drop=True)

    logger.info("Cleaned DataFrame: %d rows remaining.", len(df))
    return df


# ---------------------------------------------------------------------------
# Step 3 — Load to database
# ---------------------------------------------------------------------------

def _upsert_customer(db: Session, row: pd.Series) -> None:
    """Insert or update a customer row."""
    existing = db.get(Customer, row["customer_id"])
    if existing:
        existing.customer_name = row["customer_name"]
        existing.region        = row["region"]
    else:
        db.add(Customer(
            customer_id=row["customer_id"],
            customer_name=row["customer_name"],
            region=row["region"],
        ))


def _upsert_product(db: Session, row: pd.Series) -> None:
    """Insert or update a product row."""
    existing = db.get(Product, row["product_id"])
    if existing:
        existing.product_name = row["product_name"]
        existing.category     = row["category"]
    else:
        db.add(Product(
            product_id=row["product_id"],
            product_name=row["product_name"],
            category=row["category"],
        ))


def _upsert_order(db: Session, row: pd.Series) -> None:
    """Insert or update an order row."""
    existing = db.get(Order, row["order_id"])
    if existing:
        existing.order_date  = row["order_date"]
        existing.customer_id = row["customer_id"]
        existing.product_id  = row["product_id"]
        existing.quantity    = int(row["quantity"])
        existing.sales       = float(row["sales"])
        existing.profit      = float(row["profit"])
    else:
        db.add(Order(
            order_id=row["order_id"],
            order_date=row["order_date"],
            customer_id=row["customer_id"],
            product_id=row["product_id"],
            quantity=int(row["quantity"]),
            sales=float(row["sales"]),
            profit=float(row["profit"]),
        ))


def load_to_db(df: pd.DataFrame, db: Session) -> Tuple[int, int]:
    """
    Upsert cleaned rows into customers, products, and orders tables.

    Uses db.get() + add() pattern which works with any SQLAlchemy-supported
    database (MySQL, SQLite, PostgreSQL).

    Returns:
        (rows_loaded, rows_skipped) tuple.
    """
    rows_loaded  = 0
    rows_skipped = 0

    for _, row in df.iterrows():
        try:
            _upsert_customer(db, row)
            _upsert_product(db, row)
            # Flush so FK constraints are satisfied before inserting the order
            db.flush()
            _upsert_order(db, row)
            rows_loaded += 1
        except Exception as exc:
            logger.warning("Skipping row %s: %s", row.get("order_id"), exc)
            db.rollback()
            rows_skipped += 1

    db.commit()
    logger.info("Load complete: %d loaded, %d skipped.", rows_loaded, rows_skipped)
    return rows_loaded, rows_skipped
