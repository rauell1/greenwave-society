# CMS Permissions Matrix

## Roles
The system introduces standard database-backed roles for granular access control:

- **Owner**: Implicitly has all permissions. The legacy super-admin is automatically mapped here.
- **Administrator**: Full read/write over core functions, but restricted from managing other roles.
- **Content Manager**: Can manage content, pages, and programs.
- **Membership Manager**: Can manage members, view applications, and export member data.
- **Events Manager**: Can create and publish events, and manage attendance.
- **Communications Manager**: Can send newsletters and communications.
- **Reviewer**: Can review content and member applications, but cannot publish/export.
- **Analyst**: Can view data and dashboards but cannot mutate.
- **Auditor**: Can view audit logs but cannot mutate data or manage roles.

## Permission Implementation
Permissions are defined in `src/lib/auth/permissions.ts`. They are strings mapping to `AdminPermission` records in the database.

Example keys:
- `content.read`, `content.create`, `content.publish`
- `members.read`, `members.export`
- `roles.manage`, `audit.read`

## Guarding Routes
Use the helper functions from `src/lib/auth/guards.ts` inside Server Components and API Route Handlers:

```typescript
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function ContentPage() {
  const admin = await requirePermission(PERMISSIONS.CONTENT_READ);
  // Safe to proceed
}
```
