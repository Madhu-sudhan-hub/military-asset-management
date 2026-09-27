# Purchases Module

This document explains the implementation of the Purchase module introduced in Phase 6 for the Military Asset Management System (MAMS).

## 1. Purchase Lifecycle
When an authorized user records a purchase, it represents new equipment entering the military base's physical inventory.

The purchase contains:
- The Base receiving the equipment
- The Equipment Type (e.g., Radios, Vehicles)
- Quantity
- Purchase Date
- Supplier & Reference Number (e.g., PO-1001)
- Unit Cost and Total Cost

## 2. Purchase Database Structure
The `purchases` table connects securely to the `bases` and `equipment_types` tables. 
It also records exactly *who* (the `created_by` User) made the purchase to maintain a strict audit trail.

## 3. Purchase APIs
- `GET /api/purchases`: Retrieves a paginated, filtered list of purchases.
- `GET /api/purchases/{id}`: Retrieves a single purchase.
- `POST /api/purchases`: Creates a new purchase.
- `PUT /api/purchases/{id}`: Updates an existing purchase.
- `DELETE /api/purchases/{id}`: Deletes a purchase (only for development/correction).

## 4. Validations
To maintain data integrity, the backend strictly validates:
- Quantity must be > 0.
- Unit Cost must be >= 0.
- The Reference Number must be completely unique across the entire system. Duplicate Reference Numbers throw a `409 Conflict`.
- The `Total Cost` is completely ignored if sent by the frontend; the backend calculates it mathematically: `Total Cost = Quantity * Unit Cost`.

## 5. Role-Based Access Control (RBAC)
Base Commanders are geographically restricted:
- A Base Commander assigned to Base 1 CANNOT create a purchase for Base 2.
- A Base Commander assigned to Base 1 CANNOT view the purchase history of Base 2.
- The Backend forces the security filter on list queries.

## 6. How Purchases Affect Inventory
We do not update an arbitrary `current_balance` number in a database column.
Instead, the Purchase Transaction *is* the inventory.
In future phases, the Dashboard will dynamically calculate:
**Net Inventory = Purchases + Transfers In - Transfers Out - Expenditures**
This prevents "drift" and ensures absolute mathematical certainty.
