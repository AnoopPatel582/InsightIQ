"""
models.py
---------
SQLAlchemy ORM models.  Each class maps to one MySQL table.

Table layout
------------
users       — application accounts (login only, not from CSV data)
customers   — unique customers extracted from uploaded CSV data
products    — unique products extracted from uploaded CSV data
orders      — individual sales records from uploaded CSV data
"""

from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# ---------------------------------------------------------------------------
# Users (application accounts — not from CSV data)
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Customers (sourced from CSV uploads)
# ---------------------------------------------------------------------------
class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(50), primary_key=True)
    customer_name = Column(String(200), nullable=False)
    region = Column(String(100), nullable=False)

    # One customer can have many orders
    orders = relationship("Order", back_populates="customer")


# ---------------------------------------------------------------------------
# Products (sourced from CSV uploads)
# ---------------------------------------------------------------------------
class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(50), primary_key=True)
    product_name = Column(String(300), nullable=False)
    category = Column(String(100), nullable=False)

    # One product can appear in many orders
    orders = relationship("Order", back_populates="product")


# ---------------------------------------------------------------------------
# Orders (individual sales transactions from CSV uploads)
# ---------------------------------------------------------------------------
class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String(50), primary_key=True)
    order_date = Column(Date, nullable=False)

    # Foreign keys link to the normalised dimension tables
    customer_id = Column(
        String(50), ForeignKey("customers.customer_id"), nullable=False
    )
    product_id = Column(
        String(50), ForeignKey("products.product_id"), nullable=False
    )

    quantity = Column(Integer, nullable=False)
    sales = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)

    # Relationships for easy joins
    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product", back_populates="orders")


# ---------------------------------------------------------------------------
# Composite indexes for common filter patterns
# ---------------------------------------------------------------------------
# Speeds up date-range queries on the orders table
Index("ix_orders_order_date", Order.order_date)
# Speeds up region filter (via customer join)
Index("ix_customers_region", Customer.region)
# Speeds up category filter (via product join)
Index("ix_products_category", Product.category)
