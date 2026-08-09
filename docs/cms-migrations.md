# Migrations and Backfill

## Database Migrations
All Prisma changes are strictly additive:
1. Extended `AuditLog` with structured fields (`resourceType`, `outcome`, `beforeState`, `afterState`).
2. Extended `AdminSession` with `userId`, `userAgent`, `idleExpiresAt`, and `revokedAt`.
3. Created `AdminRole`, `AdminPermission`, `AdminRolePermission`, `AdminUserRole`.

**To execute the migration locally:**
```bash
npx prisma migrate dev --name cms_rbac_foundation
```

**Note on Rollbacks:**
Since all changes are additive, rolling back the application code to `main` will continue to function normally with the updated database schema, because existing application code does not rely on or strictly validate the presence of the new columns/tables.

## Data Backfill
Since the CMS now requires `AdminRole` assignments, existing administrators must be backfilled into the new `AdminUser` records.

A backfill script can be executed idempotently using the following logic:

```typescript
// scripts/backfill-admin-roles.ts
import { getDb } from "../src/lib/db";
import { SYSTEM_ROLES } from "../src/lib/auth/permissions";

async function run() {
  const db = getDb();
  // Idempotently create roles...
  const ownerRole = await db.adminRole.upsert({
    where: { name: SYSTEM_ROLES.OWNER },
    update: {},
    create: { name: SYSTEM_ROLES.OWNER, isSystem: true },
  });
  
  // Assign owner role to super admin...
  const superAdmin = await db.adminUser.findUnique({ where: { email: "royokola3@gmail.com" } });
  if (superAdmin) {
    await db.adminUserRole.upsert({
      where: { userId_roleId: { userId: superAdmin.id, roleId: ownerRole.id } },
      update: {},
      create: { userId: superAdmin.id, roleId: ownerRole.id },
    });
  }
}
```
*(This can be run as a standard Node script or added to the Prisma seed).*
