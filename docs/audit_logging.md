# Audit Logging & Accountability

This document outlines the implementation of Phase 10 of the Military Asset Management System (MAMS).

## 1. Overview
The Audit Logging system provides an immutable historical record of all critical actions performed across the MAMS platform. It satisfies accountability requirements by answering: WHO did WHAT, to WHICH entity, WHEN, and from WHERE.

## 2. Technical Implementation
- **Data Model:** A centralized `AuditLog` entity stored in the `audit_logs` table tracking `UserId`, `Action`, `EntityType`, `EntityId`, `Description`, and `IpAddress`.
- **IP Address Tracking:** `AuditLogServiceImpl` dynamically extracts the client's IP from the `HttpServletRequest` using `RequestContextHolder`, ensuring the frontend cannot forge IP addresses.
- **Transaction Safety:** Audit log insertion is bound strictly to successful business operations. If a transfer fails due to inventory rules and rolls back, the system ensures no misleading `TRANSFER_COMPLETE` audit log is persisted.
- **Sensitive Data Rules:** JWTs, Passwords, and Password Hashes are strictly barred from the audit log descriptions.

## 3. Audited Events
The system automatically captures the following `AuditAction` events:
- `LOGIN` and `LOGOUT`
- `USER_CREATE`
- `PURCHASE_CREATE`, `UPDATE`, `DELETE`
- `TRANSFER_CREATE`, `TRANSFER_COMPLETE`, `TRANSFER_CANCEL`
- `ASSIGNMENT_CREATE`, `ASSIGNMENT_RETURN`, `ASSIGNMENT_CANCEL`
- `EXPENDITURE_CREATE`

## 4. Security (RBAC)
Audit records span the entire system and do not explicitly bind to a specific `Base` natively without complex cross-table joins. As dictated by Phase 10 rules:
> "If determining base ownership from an audit record is not directly possible, do NOT expose unrelated records."

To prevent a `BASE_COMMANDER` from potentially seeing operations belonging to other bases, the `/api/audit-logs` endpoint strictly requires `ROLE_ADMIN`.

## 5. Frontend UI
- `AuditLogs.jsx` provides a dedicated, Admin-only view.
- Provides server-side filtering (by User, Action, Entity Type, Entity ID, and Date Range).
- A clean **View** button pops up a comprehensive modal showing the exact lifecycle of the logged event.
