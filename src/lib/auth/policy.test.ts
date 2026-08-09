import { describe, expect, it } from "vitest";
import { hasPermission } from "./policy";
import { PERMISSIONS, SYSTEM_ROLES } from "./permissions";

const admin = (roles: string[], permissions: string[]) => ({ id: "admin-1", email: "admin@example.com", isActive: true, roles, permissions });

describe("hasPermission", () => {
  it("grants every permission to owners", () => expect(hasPermission(admin([SYSTEM_ROLES.OWNER], []), PERMISSIONS.ROLES_MANAGE)).toBe(true));
  it("grants explicitly assigned permissions", () => expect(hasPermission(admin([SYSTEM_ROLES.ANALYST], [PERMISSIONS.MEMBERS_READ]), PERMISSIONS.MEMBERS_READ)).toBe(true));
  it("denies permissions by default", () => expect(hasPermission(admin([SYSTEM_ROLES.ANALYST], []), PERMISSIONS.MEMBERS_DELETE)).toBe(false));
});
