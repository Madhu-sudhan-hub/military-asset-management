# Frontend Authentication & Navigation

This document explains the frontend authentication and role-based navigation introduced in Phase 5 for the Military Asset Management System (MAMS).

## 1. Authentication Flow
When a user logs in, the React application sends credentials to the backend via `axios`.
If successful, the backend returns a JSON Web Token (JWT) and a `user` object.
These are stored securely in `localStorage` by `authService.js`.

## 2. Axios and Token Injection
We configured a global `axios` instance in `services/api.js`.
It uses an **interceptor** that runs before every outgoing request. If a token exists in `localStorage`, it automatically attaches:
`Authorization: Bearer <TOKEN>`
This guarantees that all protected backend endpoints receive the required credentials.

## 3. AuthContext
React's Context API (`AuthContext.jsx`) is used to manage global state. It provides components with answers to:
- Is the user logged in? (`isAuthenticated`)
- What is their role? (`role`)
- Is the app still checking for a token? (`loading`)

## 4. ProtectedRoute
The `ProtectedRoute.jsx` component wraps our React Router routes.
- If an unauthenticated user tries to visit `/dashboard`, they are instantly redirected to `/login`.
- If an authenticated user tries to visit a route restricted by `allowedRoles`, they are redirected to `/unauthorized`.

## 5. Role-Based Navigation vs Backend RBAC
**Important Security Concept:**
The `Sidebar.jsx` conditionally hides links (like "Assignments") from Logistics Officers. This is purely for **User Experience (UX)**. 

If a clever user manually typed `http://localhost:5173/assignments` into their browser URL, the React router might try to load it. The `ProtectedRoute` component stops them.
However, even if a hacker completely bypassed React, they cannot steal data because the **Backend Spring Security** strictly blocks unauthorized API requests. 
**Frontend UI hiding is UX; Backend Validation is Security.**

## 6. Environment Variables
React relies on the `.env` file to know where the backend lives.
`VITE_API_BASE_URL=http://localhost:8080/api`
We use `import.meta.env.VITE_API_BASE_URL` rather than hardcoding `http://localhost:8080`.

## 7. Logout
Clicking logout simply calls the `AuthContext` logout function, which deletes the JWT from `localStorage` and redirects to the Login page. 
Because JWT is stateless, wiping it from the browser safely logs the user out.
