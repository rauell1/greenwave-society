"use client";

import { ReactNode } from "react";
import { AdminUserDto } from "@/lib/auth/types";
import { PermissionKey, SYSTEM_ROLES } from "@/lib/auth/permissions";

interface PermissionGuardProps {
  admin: AdminUserDto | null;
  permissions: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  admin,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  if (!admin) return fallback;

  if (admin.roles.includes(SYSTEM_ROLES.OWNER)) {
    return <>{children}</>;
  }

  const perms = Array.isArray(permissions) ? permissions : [permissions];
  
  if (perms.length === 0) return <>{children}</>;

  const hasAccess = requireAll
    ? perms.every((p) => admin.permissions.includes(p))
    : perms.some((p) => admin.permissions.includes(p));

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}
