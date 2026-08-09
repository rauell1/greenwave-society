# CMS security architecture

## Authentication and sessions

- The browser receives a 256-bit opaque token in the `gw_admin_session` cookie.
- Only its SHA-256 digest is stored in `admin_sessions.token_hash`.
- Cookies are `HttpOnly`, `SameSite=Lax`, path-scoped to `/`, and `Secure` in production.
- Sessions have an eight-hour absolute lifetime and two-hour idle lifetime.
- Logout and password reset revoke database sessions.
- User roles and permissions are loaded from PostgreSQL on every authorized request, preventing stale cookie privileges.
- Legacy signed sessions are supported temporarily. Production never accepts them without an explicitly configured `SESSION_SECRET`.

## Authorization

`getCurrentAdmin`, `requirePermission`, and `authorizeRoute` form the server-side authorization boundary. Route handlers return `401` for missing sessions and `403` for insufficient permission. Client-side permission checks only control presentation.

## Audit safety

Audit payloads recursively redact password, secret, token, cookie, authorization, and API-key fields. Raw session identifiers and reset tokens must never be logged.

## Operational requirements

- Set a high-entropy `SESSION_SECRET` during the legacy-session compatibility window.
- Run the RBAC seed after every new environment migration.
- Revoke all sessions when an administrator is disabled or their roles change.
- Require recent authentication and MFA before introducing destructive CMS settings in Phase 2.
