# MAMS Security Architecture

This document explains the security implementation for the Military Asset Management System (MAMS) introduced in Phase 4.

## 1. What is Authentication vs Authorization?
- **Authentication**: Verifying *who* you are (Logging in with a username and password).
- **Authorization**: Verifying *what* you are allowed to do (e.g. Can you delete a base?). 

## 2. Stateless JWT Authentication
MAMS uses **JSON Web Tokens (JWT)**.
Instead of the backend remembering that you are logged in (session state), the backend signs a secure token when you successfully log in. You must send this token back with every subsequent request. Because the server only has to mathematically verify the token signature, it is completely stateless and highly scalable.

### Token Secrets
The `jwt.secret` is located in `application.properties`. **In production, this must be an environment variable and NEVER committed to source control.**

### Logout Strategy
Since JWTs are stateless, they cannot easily be "destroyed" by the server without keeping track of them in a database (which defeats the purpose of being stateless). Therefore, when a user clicks "Logout", the frontend must simply delete the JWT from its local storage. The token itself will mathematically expire based on `jwt.expiration`.

## 3. Role-Based Access Control (RBAC)
There are three core roles:
- **ADMIN**: Ultimate authority. Can manage users, create bases, and access everything.
- **BASE_COMMANDER**: Can manage assets, personnel, and operations *only for their assigned base*.
- **LOGISTICS_OFFICER**: Similar to Base Commander, but limited strictly to inventory operations (no personnel or base metadata management).

## 4. Base-Level Security (The `@PreAuthorize` Model)
Simply checking roles is not enough. If John is a Base Commander for Base 1, he should not be able to edit Base 2 by manipulating an API request.
MAMS enforces this via Spring Security's Method Security:
```java
@PreAuthorize("@securityService.canAccessBase(#request.baseId)")
```
This custom logic intercepts the request, checks the authenticated user's token, fetches their assigned `baseId`, and verifies it matches the target data in the HTTP request.

## 5. Security Validation Rules
- **Passwords**: Never stored in plain-text. They are hashed using `BCryptPasswordEncoder`.
- **Registration**: The public registration endpoint (`/api/auth/register`) strictly assigns the `LOGISTICS_OFFICER` role to prevent privilege escalation. Only an ADMIN can update a user's role to `ADMIN` or `BASE_COMMANDER` via the protected `/api/users/{id}/role` endpoint.
- **Account Lockout**: Users with an `INACTIVE` or `LOCKED` status are denied login via the `UserDetails` override logic.
