# MAMS - Professional Demonstration Guide

This guide is designed for interviews, stakeholder presentations, and technical demonstrations. It provides a structured flow to showcase the Military Asset Management System (MAMS) End-to-End.

## Prerequisites
1. Ensure the MySQL Database, Render Spring Boot Backend, and Vercel React Frontend are active.
2. Have test accounts prepared with credentials for `ADMIN`, `BASE_COMMANDER`, and `LOGISTICS_OFFICER`.

---

## Part 1: Authentication & RBAC (Security Showcase)
**Goal**: Demonstrate stateless JWT authentication and dynamic role-based UI filtering.
1. **Open the Application**: Navigate to the Vercel Frontend URL.
2. **Registration (Negative Test)**: Attempt to register a user. Explain that by default, public registration defaults to `LOGISTICS_OFFICER` to prevent privilege escalation.
3. **Login as Admin**: Enter the `ADMIN` credentials.
4. **Demonstrate UI State**: Show how the Sidebar populates with full administrative modules (Users, Roles, Audit Logs) dynamically based on the JWT payload.

## Part 2: Inventory & Movement (Core Business Logic)
**Goal**: Demonstrate the complex `Net Movement` mathematics and database transactional safety.
1. **Dashboard Check**: Open the Dashboard and note the current `Opening Balance` and `Closing Balance`.
2. **Execute a Purchase**: Navigate to Purchases. Create a purchase of `100 Units` of standard Equipment.
3. **Execute a Transfer**: 
   - Login as a `LOGISTICS_OFFICER`.
   - Transfer `50 Units` from the Main Base to a Secondary Base.
   - Explain how `PENDING` transfers do not affect inventory, emphasizing database referential integrity.
   - *Complete* the transfer. 
4. **Execute an Expenditure**: Note that assets are removed from the system permanently.
5. **Dashboard Re-check**: Navigate back to the Dashboard. Validate the math:
   - *Net Movement = Purchases + Transfer In - Transfer Out*
   - *Closing Balance = Opening Balance + Net Movement - Expenditure*

## Part 3: Base Commander Isolation (IDOR Protection)
**Goal**: Prove the backend validates Object-Level Authorization (IDOR) and isn't just relying on UI hiding.
1. **Login as Base Commander**: Switch sessions to a Commander mapped to `Base A`.
2. **View Reports**: Show that the data tables strictly filter out `Base B` transactions.
3. **API Tamper Attempt (Optional)**: If demonstrating via Postman or browser DevTools, attempt to fetch a `Base B` asset ID directly via `/api/assets/{id}`. Show the API rejecting the request with a `403 Forbidden` standard Global Exception wrapper.

## Part 4: Audit & Accountability (Enterprise Compliance)
**Goal**: Showcase enterprise-grade logging and tracking.
1. **Login as Admin**: Switch back to the Administrative account.
2. **Open Audit Logs**: Navigate to the Audit module.
3. **Trace the Demo**: Filter by the actions performed in Part 2. Point out how the `Purchase`, `Transfer`, and `Expenditure` actions are permanently logged with the User ID, Timestamp, Action Type, and IP address.
4. **Data Privacy Note**: Point out that the logs never expose Passwords or JWT secrets, ensuring security compliance.

## Part 5: Reports & Exporting (Utility)
**Goal**: Demonstrate binary stream processing for external reporting.
1. **Open Reports Module**: Navigate to the Inventory Report.
2. **Filter & Export**: Apply a date-range filter. Click the `Export to CSV` or `Export to Excel` button.
3. **Explain the Architecture**: Briefly explain how Spring Boot uses Apache POI to parse the active database queries into a secure binary stream bypassing unauthorized data exposure.

---
**End of Demo**
