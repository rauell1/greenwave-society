import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS, SYSTEM_ROLES } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import ConstitutionDashboard from "../dashboard/ConstitutionDashboard";
import { isExecutiveCommitteeMember } from "@/lib/careers-admin";
import { hasPermission } from "@/lib/auth/policy";

export const metadata = { title: "Governance | Greenwave Society" };
export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const admin = await requirePermission(PERMISSIONS.DASHBOARD_READ).catch(() => null);
  if (!admin || !(await isExecutiveCommitteeMember(admin))) redirect("/admin/no-access");
  const db = getDb(); const superAdmin = admin.roles.includes(SYSTEM_ROLES.OWNER);
  const canReadMembers = hasPermission(admin, PERMISSIONS.MEMBERS_READ);
  const [leaders, versions, registrations] = await Promise.all([
    db.executiveLeader.findMany({ include: { signatures: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "asc" } }),
    db.constitutionVersion.findMany({ orderBy: { createdAt: "desc" }, include: { signatures: { select: { status: true, leaderId: true } } } }),
    canReadMembers ? db.memberRegistration.findMany({ orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
  ]);
  let subscribers: unknown[] = []; let adminUsers: unknown[] = []; let auditLogs: unknown[] = []; let dbStats: { table: string; count: number }[] = [];
  if (superAdmin) {
    const [subs, users, logs, leaderCount, signatureCount, subscriberCount, userCount, sessionCount, contactCount] = await Promise.all([
      db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }), db.adminUser.findMany({ orderBy: { createdAt: "asc" } }), db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }), db.executiveLeader.count(), db.constitutionSignature.count(), db.newsletterSubscriber.count(), db.adminUser.count(), db.adminSession.count(), db.contactSubmission.count(),
    ]);
    subscribers = subs; adminUsers = users; auditLogs = logs;
    dbStats = [{ table: "Executive Leaders", count: leaderCount }, { table: "Constitution Signatures", count: signatureCount }, { table: "Newsletter Subscribers", count: subscriberCount }, { table: "Admin Users", count: userCount }, { table: "Active Sessions", count: sessionCount }, { table: "Contact Submissions", count: contactCount }, { table: "Member Registrations", count: registrations.length }];
  }
  const activeVersion = versions.find((version) => version.status === "published"); const signatures = activeVersion?.signatures ?? [];
  return <ConstitutionDashboard leaders={leaders as never} versions={versions as never} signedCount={signatures.filter((item) => item.status === "signed").length} pendingCount={signatures.filter((item) => item.status === "pending").length} rejectedCount={signatures.filter((item) => item.status === "rejected").length} currentEmail={admin.email} superAdmin={superAdmin} subscribers={subscribers as never} adminUsers={adminUsers as never} dbStats={dbStats} auditLogs={auditLogs as never} registrations={registrations as never} />;
}
