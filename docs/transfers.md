# Transfers Module

This document explains the implementation of the Transfer module introduced in Phase 7 for the Military Asset Management System (MAMS).

## 1. Transfer Lifecycle
Transfers move equipment (either in bulk quantities or individual tracked assets) from one military base to another.

A transfer goes through three strictly controlled states:
1. **PENDING**: The transfer is drafted. No inventory has actually moved yet.
2. **COMPLETED**: The transfer is finalized. Source inventory decreases, destination inventory increases. Individual assets physically update their `current_base_id`.
3. **CANCELLED**: The pending transfer is rejected and will not affect inventory.

## 2. Transfer Database Structure
The system uses the `transfers` table for the header (From Base, To Base, Date, Ref#) and the `transfer_items` table for the lines (Equipment Type, Asset, Quantity).

## 3. Transfer APIs
- `GET /api/transfers`: Retrieves a paginated, filterable list of transfers.
- `GET /api/transfers/{id}`: Retrieves full details of a specific transfer and its items.
- `POST /api/transfers`: Creates a new `PENDING` transfer.
- `PUT /api/transfers/{id}/complete`: Finalizes the transfer, atomically moving the inventory.
- `PUT /api/transfers/{id}/cancel`: Cancels the pending transfer.

## 4. Validations & Transaction Safety
- `fromBaseId` and `toBaseId` must be logically different.
- Bulk equipment requires a `Quantity > 0`.
- Individual transfers require a specific `assetId`, and the backend guarantees the asset still belongs to the `fromBaseId` before finalizing.
- **Inventory Check**: You cannot complete a transfer if the source base does not mathematically possess enough of the requested equipment.
- **Transaction Safe**: The entire `/complete` API runs under Spring `@Transactional`. If an inventory calculation fails halfway through, the entire transfer completion is rolled back instantly.

## 5. Role-Based Access Control (RBAC)
Base Commanders are restricted to their own geographical domain.
- They can only view transfers where `fromBaseId == userBaseId` or `toBaseId == userBaseId`.
- The Backend forces this security on list queries, aggressively overriding tampered filters.
- They cannot initiate a transfer *from* a base they do not command.

## 6. How Transfers Affect Inventory
Inventory is dynamically calculated via transaction summation, protecting against drift:
**Available Inventory = Purchases + Transfers In - Transfers Out**

When a transfer goes to `COMPLETED`, its internal lines are mathematically injected into this equation across the system.
