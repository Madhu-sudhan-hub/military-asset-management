# Dashboard & Inventory Module

This document outlines the implementation of Phase 9 of the Military Asset Management System (MAMS).

## 1. Module Overview
The Dashboard module acts as the authoritative lens for viewing all inventory movement and available balances.
In compliance with strict architectural requirements, the Dashboard does **not** rely on static "current balance" columns that are prone to drift. Instead, all numeric values are derived purely from historical transactions.

## 2. Core Formulas
The entire dashboard relies on mathematically tracking transactions:
- **Net Movement** = `Purchases + Transfer In - Transfer Out`
- **Closing Balance** = `Opening Balance + Net Movement - Expenditures`

**Assigned Inventory** (Assets currently checked out to personnel) are displayed as a separate count. They do *not* subtract from the Closing Balance because they still belong to the base.

## 3. Date Filtering logic
The Dashboard heavily depends on `startDate` and `endDate`:
- **Opening Balance**: The system automatically queries all `Purchases, Transfers In, Transfers Out, Expenditures` that occurred strictly *before* the `startDate` to establish a starting point.
- **Movement (Purchases/Transfers/Expenditures)**: These are calculated exactly within the `[startDate, endDate]` range.

## 4. Role-Based Access Control (RBAC)
When a `BASE_COMMANDER` views the dashboard, their JWT token is inspected in `DashboardServiceImpl.java`. The `baseId` filter is hardcoded to their legally assigned domain. Even if they attempt to modify the HTTP request to peek at `baseId=999`, the backend will override it and restrict all aggregation to their own base.

## 5. Frontend Implementation
The `Dashboard.jsx` interface provides:
- Date, Base, and Equipment Type filters.
- A Grid of 8 distinct Summary Cards, mathematically matching the formulas.
- A clickable **Net Movement** card that opens a Modal specifically breaking down exactly how the Net Movement integer was calculated (showing exactly how much was Purchased, Transferred In, and Transferred Out).
