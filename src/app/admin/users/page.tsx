import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import AdminUsersManager from "./AdminUsersManager";

export default async function AdminUsersPage() {
  const admin = await requirePermission(PERMISSIONS.ROLES_MANAGE);
  if (!(await isCmsFeatureEnabled("users"))) notFound();
  return <AdminUsersManager currentUserId={admin.id} />;
}
