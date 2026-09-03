import { notFound } from "next/navigation";
import { requireAnyPermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/policy";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import AdminUsersManager from "./AdminUsersManager";

export default async function AdminUsersPage() {
  const admin = await requireAnyPermission([PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_MANAGE]);
  if (!(await isCmsFeatureEnabled("users"))) notFound();
  return <AdminUsersManager currentUserId={admin.id} canManageAccess={hasPermission(admin, PERMISSIONS.ROLES_MANAGE)} />;
}
