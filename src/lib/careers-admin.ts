import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { SYSTEM_ROLES, type PermissionKey } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import type { AdminUserDto } from "@/lib/auth/types";
import { isExecutiveRoleName } from "@/lib/auth/executive-roles";

export async function isExecutiveCommitteeMember(admin: AdminUserDto) {
  if (admin.roles.includes(SYSTEM_ROLES.OWNER)) return true;
  if (admin.roles.some(isExecutiveRoleName)) return true;
  return Boolean(await getDb().executiveLeader.findUnique({ where: { email: admin.email }, select: { id: true } }));
}

export async function requireExecutiveCareersAccess(permission: PermissionKey) {
  const admin = await requirePermission(permission).catch(() => null);
  if (!admin) return null;
  return (await isExecutiveCommitteeMember(admin)) ? admin : null;
}

export async function requireCareersManager() {
  return requireExecutiveCareersAccess(PERMISSIONS.CAREERS_READ);
}

export async function requireCareersExportAdmin() {
  return requireExecutiveCareersAccess(PERMISSIONS.CAREERS_EXPORT);
}
