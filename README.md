# Military Asset Management System (MAMS)

## 1. Project Overview & Purpose
The **Military Asset Management System (MAMS)** is an enterprise-grade administrative logistics and inventory management system. It is purposefully designed to meticulously track military equipment, assets, purchases, transfers, assignments, and expenditures across multiple isolated military bases.

MAMS guarantees strict accountability via comprehensive audit logging, prevents unauthorized lateral data access via Object-Level Base Authorization (IDOR protection), and maintains accurate global inventory balances using stringent transactional mathematics.

---

## 2. Technology Stack
**Frontend:**
- **ReactJS**: Component-based UI library.
- **Vite**: Ultra-fast frontend build tooling.
- **React Router**: Single Page Application (SPA) declarative routing.
- **Axios**: Promise-based HTTP client for REST APIs.
- **Tailwind CSS / Vanilla CSS**: Responsive UI styling.

**Backend:**
- **Java 17**: Core programming language.
- **Spring Boot 3.x**: Enterprise backend framework.
- **Spring Data JPA / Hibernate**: Object-Relational Mapping (ORM) and database interactions.
- **Spring Security**: Application-level access control.
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism.
- **Maven**: Dependency management and build automation.

**Database & Infrastructure:**
- **MySQL 8+**: Relational database.
- **Flyway**: Database schema migration and version control.
- **Vercel**: Edge network for React Frontend hosting.
- **Render**: Scalable Web Service for Spring Boot Backend hosting.

---

## 3. System Architecture
MAMS operates on a decoupled Client-Server architecture utilizing secure stateless APIs.

**Application Flow:**
`User Browser` ➔ `ReactJS Frontend` ➔ `REST API (HTTPS)` ➔ `Spring Boot Controllers` ➔ `Service Layer` ➔ `Repository / JPA` ➔ `MySQL Database`

**Authentication Flow:**
`React` ➔ `Login API` ➔ `Spring Security validates BCrypt hash` ➔ `Generates JWT` ➔ `React attaches JWT to subsequent Protected API calls`

**Deployment Architecture:**
`User` ➔ `Vercel (React)` ➔ `Render (Spring Boot)` ➔ `Hosted MySQL`

---

## 4. Database Design
MAMS is governed by a robust 13-table relational structure ensuring strict referential integrity.

1. **`bases`**: Tracks military installations. (*Base → Personnel, Base → Users*)
2. **`personnel`**: Tracks military members. (*Personnel → Assignments*)
3. **`equipment_types`**: Classifies standardized military gear. (*Equipment Type → Assets, Expenditures*)
4. **`assets`**: Tracks individual serialized instances of an `equipment_type` located at a specific `base`.
5. **`users`**: Application user credentials. (*Users → Audit Logs, Roles*)
6. **`roles`**: Authorization descriptors (e.g., ADMIN).
7. **`user_roles`**: Join table mapping Users to Roles.
8. **`purchases`**: Inbound inventory acquisition logs.
9. **`transfers`**: High-level movement of inventory between two distinct Bases.
10. **`transfer_items`**: Granular quantities of `equipment_types` tied to a specific `transfer`.
11. **`assignments`**: Tracks the temporary issuance of an `asset` to a `personnel` member.
12. **`expenditures`**: Tracks consumed, destroyed, or decommissioned assets permanently removed from inventory.
13. **`audit_logs`**: Immutable ledger of all authenticated CRUD actions.

---

## 5. Role-Based Access Control (RBAC)
Frontend navigation dynamically hides unauthorized menus to improve User Experience, but **Backend Authorization provides the actual security**, aggressively rejecting unauthorized API requests.

- **ADMIN**: Absolute system clearance. Can manage Users, Roles, Base global settings, and view all system-wide Audit Logs.
- **BASE_COMMANDER**: Highly scoped access. Permitted to view and manage inventory, personnel, and operations strictly restricted to their designated Base. Backend logic actively blocks IDOR (Insecure Direct Object Reference) attempts if a Commander modifies an HTTP request to target a different Base's ID.
- **LOGISTICS_OFFICER**: Tasked specifically with Inventory Movement. Permitted to create Purchases and execute Transfers across the logistics network. Cannot access administrative user settings.

---

## 6. Inventory Calculation Mathematics
MAMS dynamically aggregates real-time inventory balances from transactional tables rather than relying on brittle static counters.

* **Net Movement** = `Purchases` + `Transfer In` - `Transfer Out`
* **Closing Balance** = `Opening Balance` + `Net Movement` - `Expenditures`

*Business Rules:*
- **Assignments** do *not* automatically reduce inventory (the asset is still owned by the base).
- Only actual **Expenditures** reduce inventory permanently.
- Only **COMPLETED** transfers affect inventory (Pending or Cancelled transfers are ignored).

---

## 7. Business Modules
- **Authentication**: JWT-based login, registration, and logout workflows.
- **Bases**: Base administrative management.
- **Personnel**: Active military personnel tracking.
- **Equipment Types**: Standardized asset classification definitions.
- **Assets**: Serialized physical unit tracking.
- **Purchases**: Recording inbound bulk acquisitions and historical cost tracking.
- **Transfers**: Creating, validating, completing, and canceling multi-base inventory logistics.
- **Assignments**: Issuing and returning individual assets to active personnel.
- **Expenditures**: Recording permanent asset consumption and tracking the resulting inventory impact.
- **Dashboard**: Real-time analytical view of Opening Balances, Net Movements, and active Assignments.
- **Reports**: Advanced tabular filtering and exporting (CSV/Excel) of historical transactions.
- **Audit Logs**: Immutable tracking of "Who did What, When, and from Where."

---

## 8. API Structure
MAMS exposes a strictly RESTful interface. *Note: Valid JWT `Bearer` tokens are required for all endpoints except public Auth endpoints.*

- **`/api/auth/*`**: `POST /login`, `POST /register` (Public).
- **`/api/bases/*`**: `GET`, `POST`, `PUT` Base management (Protected).
- **`/api/personnel/*`**: Personnel management endpoints (Protected).
- **`/api/equipment-types/*`**: Equipment catalog endpoints (Protected).
- **`/api/assets/*`**: Asset lifecycle endpoints (Protected).
- **`/api/purchases/*`**: Inbound logistics endpoints (Protected).
- **`/api/transfers/*`**: Outbound logistics endpoints (Protected).
- **`/api/assignments/*`**: Personnel issuance endpoints (Protected).
- **`/api/expenditures/*`**: Asset destruction/consumption endpoints (Protected).
- **`/api/dashboard/*`**: Aggregation endpoints for UI metrics (Protected).
- **`/api/reports/*`**: Data extraction and binary stream export endpoints (Protected).
- **`/api/audit-logs/*`**: System accountability endpoints (ADMIN Protected).

---

## 9. Security & Audit Logging
**Security Implementations:**
- **BCrypt**: Passwords are mathematically hashed and never stored in plain-text.
- **JWT**: Tokens expire automatically and prevent session hijacking.
- **Global Exception Handling**: Unexpected `500` server errors are wrapped cleanly, explicitly scrubbing SQL strings and Java Stack Traces from the HTTP response payload.
- **CORS**: Render backend strictly cross-references `CORS_ALLOWED_ORIGINS` to whitelist the exact Vercel URL.
- **Parameterization**: Spring Data JPA fundamentally eliminates SQL Injection vulnerabilities.

**Audit Logging:**
MAMS requires strict military accountability. Important actions (Login, Logout, Create, Update, Delete, Transfers, Purchases, Expenditures) immediately cast an Audit record.
*Audit logs permanently capture the Authenticated User, the specific Action, the Entity ID affected, the Timestamp, and the IP Address.*
*Note: Passwords, JWTs, and database secrets are explicitly blacklisted from being logged to ensure absolute compliance.*

---

## 10. Deployment & Environment Setup
MAMS is cloud-native and operates effectively across Edge and Containerized Web Services.

### Environment Variables (`.env.example` placeholders)
**Vercel (Frontend):**
* `VITE_API_BASE_URL=https://your-render-api.com/api`

**Render (Backend):**
* `SPRING_PROFILES_ACTIVE=prod`
* `PORT=8080`
* `DB_HOST=your-hosted-mysql.com`
* `DB_PORT=3306`
* `DB_NAME=mams`
* `DB_USERNAME=your_username`
* `DB_PASSWORD=your_secure_password`
* `JWT_SECRET=your_long_secure_jwt_secret`
* `CORS_ALLOWED_ORIGINS=https://your-vercel-frontend.app`

### Build & Deploy Instructions
**Vercel React Frontend:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Routing**: `vercel.json` natively intercepts React Router SPA navigation.

**Render Spring Boot Backend:**
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/mams-backend-0.0.1-SNAPSHOT.jar`
- **Health Check**: `/actuator/health`

### Database Backups
Automated logical backups of the MySQL Database should be routed securely via cronjobs utilizing `mysqldump`. Never store disaster recovery snapshots on the same host as the active database.
