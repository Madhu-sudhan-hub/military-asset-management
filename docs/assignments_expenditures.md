# Assignments & Expenditures

This document outlines the implementation of the Assignments and Expenditures modules in Phase 8 of the Military Asset Management System (MAMS).

## 1. Module Overview
- **Assignments**: Represents the *temporary* issuance of assets to military personnel. Assignments do NOT subtract from the base's available inventory limit, because the equipment theoretically belongs to the base and will be returned.
- **Expenditures**: Represents equipment being permanently consumed, lost, or destroyed. Expenditures *permanently reduce* the available inventory of the base. 

## 2. Assignments
### Lifecycle
- `ACTIVE`: The asset is currently checked out to personnel.
- `RETURNED`: The asset has been checked back in.
- `CANCELLED`: The assignment was created in error and was cancelled.

### Rules & Validations
- An individual asset can only have ONE `ACTIVE` assignment at any given time.
- If an asset is `EXPENDED`, it physically cannot be assigned.
- Both the `Personnel` and the `Asset` must belong to the logged-in Base Commander's Base (unless the user is an `ADMIN`).

### API Endpoints
- `GET /api/assignments`: Search assignments.
- `GET /api/assignments/{id}`: Single assignment details.
- `POST /api/assignments`: Create a new assignment.
- `PUT /api/assignments/{id}/return`: Mark as returned.
- `PUT /api/assignments/{id}/cancel`: Mark as cancelled.

## 3. Expenditures
### Rules & Validations
- **Bulk Expenditures**: The backend automatically aggregates all past `Purchases + Transfers In - Transfers Out - Expenditures` for that specific base and equipment type. If a bulk expenditure asks to consume 10 radios but only 5 are calculated to exist, the request is violently rejected with `HTTP 400 Bad Request`.
- **Individual Expenditures**: If an individual `assetId` is selected, the specific asset's status is changed permanently to `EXPENDED`. It can no longer be transferred or assigned.
- Historical expenditures cannot be physically deleted.

### API Endpoints
- `GET /api/expenditures`: Search expenditures.
- `GET /api/expenditures/{id}`: View expenditure details.
- `POST /api/expenditures`: Record a new expenditure.

## 4. Transaction Safety & RBAC
- Both modules heavily utilize Spring Data `@Transactional`. A failure at any calculation (e.g. invalid inventory amount) causes a hard rollback.
- Frontend visibility is dynamically restricted based on `AuthContext`, but `SecurityService.canAccessBase()` is strictly enforced on all `POST` requests and heavily intercepts `GET` lists by overriding Base filters for `BASE_COMMANDER`s.
