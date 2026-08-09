# CMS migrations and backfill

Phase 1 uses the additive migration in `prisma/migrations/20260809093000_cms_foundation/migration.sql`.

## Deployment order

1. Take or verify a restorable Neon backup/branch.
2. Run `npx prisma migrate deploy` against the target database.
3. Run `npm run cms:seed` with `CMS_OWNER_EMAIL` set to the owner account when it differs from the default.
4. Deploy the application.
5. Confirm the owner can sign in, inspect `/admin/audit`, and revoke a session.

The seed is idempotent. It creates permissions and system roles, assigns the Owner role, assigns Administrator to existing administrators without a role, and creates disabled CMS feature flags. Audit is the only new module enabled by default.

## Compatibility and rollback

The migration preserves legacy session rows and makes the legacy `token` column nullable. New sessions write only `token_hash`. Rolling application code back leaves the additive tables and columns in place. Do not reverse the schema migration during an incident; roll back the application first and investigate safely.

Legacy sessions should be removed after the migration window by revoking rows where `token_hash IS NULL`, then dropping the legacy `token` column in a later migration.

Never use `prisma migrate reset` or `prisma db push` in production.
