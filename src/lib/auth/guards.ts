import "server-only";
import { getAdminSession } from "./session";
import { getAdminUserById, getAdminUserByEmail } from "../dal/admin";
import { AdminUserDto } from "./types";
import { SYSTEM_ROLES, PermissionKey } from "./permissions";
import { hasPermission } from "./policy";
import { isAllowedEmail, isSuperAdmin } from "../admin-auth";

/**
 * Validates the current session and retrieves the admin user.
 */
export async function getCurrentAdmin(): Promise<AdminUserDto | null> {
  const session = await getAdminSession();
  if (!session) return null;

  let adminUser: AdminUserDto | null = null;

  if (session.userId) {
    adminUser = await getAdminUserById(session.userId);
  } else if (session.email) {
    adminUser = await getAdminUserByEmail(session.email);
    
    // Fallback logic for legacy users that don't exist in the DB yet,
    // but are allowed via the env var allow-list or super admin hardcode.
    if (!adminUser && (isAllowedEmail(session.email) || isSuperAdmin(session.email))) {
      adminUser = {
        id: `legacy-${session.email}`,
        email: session.email,
        isActive: true,
        roles: isSuperAdmin(session.email) ? [SYSTEM_ROLES.OWNER] : [SYSTEM_ROLES.ADMINISTRATOR],
        permissions: [], // Implicitly granted via roles below
      };
    }
  }

  if (!adminUser || !adminUser.isActive) return null;

  return adminUser;
}

/**
 * Requires an authenticated admin session, throwing or redirecting if unauthorized.
 * This should be used in middleware, layouts, or route handlers.
 */
export async function requireAdmin(): Promise<AdminUserDto> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

/**
 * Checks if the given admin has the required permission.
 * Owners have all permissions.
 */
/**
 * Validates that the current admin has the required permission.
 */
export async function requirePermission(permission: PermissionKey): Promise<AdminUserDto> {
  const admin = await requireAdmin();
  if (!hasPermission(admin, permission)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return admin;
}

export async function requireAnyPermission(permissions: PermissionKey[]): Promise<AdminUserDto> {
  const admin = await requireAdmin();
  const hasAny = permissions.some((p) => hasPermission(admin, p));
  if (!hasAny) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return admin;
}

export async function requireAllPermissions(permissions: PermissionKey[]): Promise<AdminUserDto> {
  const admin = await requireAdmin();
  const hasAll = permissions.every((p) => hasPermission(admin, p));
  if (!hasAll) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return admin;
}
