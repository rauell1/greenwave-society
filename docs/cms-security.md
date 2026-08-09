# CMS Security Architecture

## Authentication & Sessions
The authentication architecture relies on cryptographically secure, opaque session tokens.
- **Storage**: Raw session IDs are stored in an `HttpOnly`, `Secure` (in production) cookie (`gw_admin_session`).
- **Validation**: Sessions are validated against the `AdminSession` database table. A server-side secret (`SESSION_SECRET`) signs the cookie payload to prevent tampering.
- **Expiration**: 
  - Absolute TTL: 8 hours
  - Idle Timeout: 2 hours (refreshed on interaction)
- **Revocation**: Password changes or role changes must call `revokeAllUserSessions(userId)` to invalidate active sessions instantly.

## Server-Side Authorization
Client-side state or JWT payload roles should never be trusted for security.
All authorization happens dynamically on the server:
- `requireAdmin()`
- `requirePermission(permission)`

## Data Fetching
No sensitive data (like password hashes or raw tokens) is returned to client components. We use `AdminUserDto` to safely transfer user context.
