# Product Requirements

## Goal

Provide a simple, understandable business analytics platform for sales transaction data. InsightIQ must make its calculation rules transparent and return useful error messages for invalid data.

## Primary workflow

1. An authenticated user uploads a sales CSV.
2. The backend validates and cleans the data with Pandas.
3. Cleaned customers, products, and orders are stored in MySQL.
4. The dashboard requests filtered analytics from REST endpoints.
5. The user reviews charts and rule-based business insights.

## Dataset contract

Each input CSV requires `Order_ID`, `Order_Date`, `Customer_ID`, `Customer_Name`, `Product_ID`, `Product_Name`, `Category`, `Region`, `Quantity`, `Sales`, and `Profit`. The system will reject missing columns and invalid quantities, safely clean usable fields, and remove duplicate order records.

## Acceptance scope

The platform will provide login, a protected dashboard, the six specified KPIs, filters, CSV upload, analytics endpoints, Chart.js visualizations, MySQL persistence, API documentation, and a focused Pytest suite.
