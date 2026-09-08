import "server-only";
import { getAdminSession } from "./session";
import { getAdminUserById, getAdminUserByEmail } from "../dal/admin";
import { AdminUserDto } from "./types";
import { PermissionKey } from "./permissions";
import { hasPermission } from "./policy";

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
