"""
generate_sample_data.py
-----------------------
Generates a synthetic sales dataset of ~5,000 records and saves it to
data/sample_sales.csv.

Run from the project root:
    python data/generate_sample_data.py

No personally identifiable information is used — all names are fictional.
"""

import random
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

# ── Reproducibility ────────────────────────────────────────────────────────
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# ── Configuration ──────────────────────────────────────────────────────────
N_RECORDS = 5_000
START_DATE = date(2022, 1, 1)
END_DATE = date(2024, 12, 31)

OUTPUT_PATH = Path(__file__).parent / "sample_sales.csv"

# ── Reference data ─────────────────────────────────────────────────────────
REGIONS = ["East", "West", "North", "South", "Central"]

CATEGORIES = {
    "Technology": [
        ("PROD-001", "Laptop Pro 15"),
        ("PROD-002", "Wireless Mouse"),
        ("PROD-003", "USB-C Hub"),
        ("PROD-004", "4K Monitor"),
        ("PROD-005", "Mechanical Keyboard"),
        ("PROD-006", "Webcam HD"),
        ("PROD-007", "External SSD 1TB"),
        ("PROD-008", "Noise-Cancelling Headphones"),
    ],
    "Furniture": [
        ("PROD-011", "Ergonomic Chair"),
        ("PROD-012", "Standing Desk"),
        ("PROD-013", "Bookshelf Oak"),
        ("PROD-014", "Filing Cabinet"),
        ("PROD-015", "Monitor Arm"),
        ("PROD-016", "Office Desk Lamp"),
    ],
    "Office Supplies": [
        ("PROD-021", "Whiteboard Markers Set"),
        ("PROD-022", "Legal Pads (12-pack)"),
        ("PROD-023", "Stapler Heavy Duty"),
        ("PROD-024", "Ballpoint Pens 50-pack"),
        ("PROD-025", "Sticky Notes Bulk"),
        ("PROD-026", "Paper Shredder"),
        ("PROD-027", "Desk Organiser"),
    ],
    "Apparel": [
        ("PROD-031", "Business Casual Shirt"),
        ("PROD-032", "Formal Trousers"),
        ("PROD-033", "Corporate Polo"),
        ("PROD-034", "Blazer Classic"),
    ],
    "Sports & Outdoors": [
        ("PROD-041", "Yoga Mat Premium"),
        ("PROD-042", "Resistance Bands Set"),
        ("PROD-043", "Water Bottle Insulated"),
        ("PROD-044", "Running Shoes"),
        ("PROD-045", "Fitness Tracker"),
    ],
}

# Profit margin range per category (min, max) — Technology is high-margin
MARGINS = {
    "Technology": (0.12, 0.35),
    "Furniture": (0.08, 0.25),
    "Office Supplies": (0.05, 0.20),
    "Apparel": (0.10, 0.30),
    "Sports & Outdoors": (0.08, 0.28),
}

# Price ranges per category
PRICE_RANGE = {
    "Technology": (20, 1500),
    "Furniture": (50, 800),
    "Office Supplies": (5, 200),
    "Apparel": (15, 250),
    "Sports & Outdoors": (10, 300),
}

# ── Customer pool ──────────────────────────────────────────────────────────
FIRST_NAMES = [
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia",
    "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Charlotte", "Alexander",
    "Amelia", "Mason", "Harper", "Ethan", "Evelyn", "Daniel", "Abigail",
    "Matthew", "Emily", "Aiden", "Elizabeth", "Jackson", "Sofia", "Sebastian",
    "Madison", "Owen", "Avery", "Carter", "Ella", "Wyatt", "Scarlett",
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Jackson", "White",
    "Harris", "Martin", "Thompson", "Young", "Allen", "King", "Wright",
    "Scott", "Torres", "Nguyen", "Hill", "Green", "Adams", "Baker",
    "Gonzalez", "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Phillips",
]

N_CUSTOMERS = 300


def _build_customers():
    customers = []
    used_names = set()
    for i in range(1, N_CUSTOMERS + 1):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break
        customers.append({
            "customer_id": f"CUST-{i:04d}",
            "customer_name": name,
            "region": random.choice(REGIONS),
        })
    return customers


def _random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def _build_product_list():
    """Flatten the categories dict into a list of (product_id, name, category)."""
    products = []
    for category, items in CATEGORIES.items():
        for pid, pname in items:
            products.append((pid, pname, category))
    return products


# ── Main generation ────────────────────────────────────────────────────────

def generate(n: int = N_RECORDS) -> pd.DataFrame:
    customers = _build_customers()
    products = _build_product_list()

    rows = []
    order_counter = 1

    for _ in range(n):
        cust = random.choice(customers)
        prod_id, prod_name, category = random.choice(products)

        order_date = _random_date(START_DATE, END_DATE)

        # Seasonal boost: Q4 (Oct–Dec) has 40% higher sales volume
        if order_date.month in (10, 11, 12):
            quantity = random.randint(1, 8)
        else:
            quantity = random.randint(1, 5)

        lo, hi = PRICE_RANGE[category]
        unit_price = round(random.uniform(lo, hi), 2)
        sales = round(unit_price * quantity, 2)

        margin_lo, margin_hi = MARGINS[category]
        margin = random.uniform(margin_lo, margin_hi)
        profit = round(sales * margin, 2)

        rows.append({
            "Order_ID": f"ORD-{order_counter:06d}",
            "Order_Date": order_date.strftime("%Y-%m-%d"),
            "Customer_ID": cust["customer_id"],
            "Customer_Name": cust["customer_name"],
            "Product_ID": prod_id,
            "Product_Name": prod_name,
            "Category": category,
            "Region": cust["region"],
            "Quantity": quantity,
            "Sales": sales,
            "Profit": profit,
        })
        order_counter += 1

    df = pd.DataFrame(rows)

    # Introduce ~2% duplicates to validate deduplication logic
    n_dupes = int(n * 0.02)
    dupes = df.sample(n=n_dupes, random_state=SEED)
    df = pd.concat([df, dupes], ignore_index=True)

    # Shuffle
    df = df.sample(frac=1, random_state=SEED).reset_index(drop=True)
    return df


if __name__ == "__main__":
    print("Generating synthetic sales dataset...")
    df = generate()
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved {len(df):,} rows to {OUTPUT_PATH}")
    print(f"  Unique orders : {df['Order_ID'].nunique():,}")
    print(f"  Date range    : {df['Order_Date'].min()} -> {df['Order_Date'].max()}")
    print(f"  Regions       : {sorted(df['Region'].unique())}")
    print(f"  Categories    : {sorted(df['Category'].unique())}")
