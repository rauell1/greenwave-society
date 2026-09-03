import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS, SYSTEM_ROLES } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import GovernanceManager from "./GovernanceManager";
import { isExecutiveCommitteeMember } from "@/lib/careers-admin";

export const metadata = { title: "Governance | Greenwave Society" };
export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const admin = await requirePermission(PERMISSIONS.DASHBOARD_READ).catch(() => null);
  if (!admin || !(await isExecutiveCommitteeMember(admin))) redirect("/admin/no-access");
  const db = getDb();
  const superAdmin = admin.roles.includes(SYSTEM_ROLES.OWNER);
  const [leaders, versions] = await Promise.all([
    db.executiveLeader.findMany({ include: { signatures: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "asc" } }),
    db.constitutionVersion.findMany({ orderBy: { createdAt: "desc" }, include: { signatures: { select: { status: true, leaderId: true } } } }),
  ]);
  return <GovernanceManager leaders={leaders as never} versions={versions as never} canResetSignatures={superAdmin} />;
}
