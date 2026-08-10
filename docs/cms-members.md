# CMS Member Management

Phase 3 moves membership operations into a dedicated feature-flagged module while preserving the existing application form, member portal, personal-data export, and erasure flows.

## Capabilities

- Search and filter by name, email, county, and lifecycle status.
- Paginated server-side member lists and status counts.
- Dedicated member profiles with application data and portal activity.
- Immutable lifecycle history for pending, approved, rejected, suspended, and inactive states.
- Internal notes visible only to membership reviewers and managers.
- Permission-controlled, server-generated CSV exports with spreadsheet-injection protection.
- Approval and rejection emails using the existing Greenwave branded template.
- Recorded email delivery state and an audited retry action for portal-access emails.

## Security and privacy

- Status writes assert the expected previous state, preventing concurrent requests from producing contradictory history.
- Approval and reactivation rotate the portal bearer token. Suspension, rejection, and deactivation revoke it.
- API mutation responses never include the member portal token.
- Status changes, notes, exports, access-email retries, and erasure actions are audited.
- Status history and internal notes cascade when a member exercises the existing erasure workflow.
- Public member portal and privacy endpoints remain unchanged.

## Rollout

Apply `prisma/migrations/20260810103000_cms_members/migration.sql` on an isolated Neon branch after the Phase 1 and Phase 2 migrations. The migration adds two tables, email-delivery fields, indexes, foreign keys, and a status-history backfill. Enable `cms.members` only after migration verification and RBAC seeding.
