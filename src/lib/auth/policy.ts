import type { AdminUserDto } from "./types";
import type { PermissionKey } from "./permissions";
import { SYSTEM_ROLES } from "./permissions";

export function hasPermission(admin: AdminUserDto, permission: PermissionKey): boolean {
  return admin.roles.includes(SYSTEM_ROLES.OWNER) || admin.permissions.includes(permission);
}
