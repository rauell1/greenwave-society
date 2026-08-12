import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS, SYSTEM_ROLES } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import ConstitutionDashboard from "./ConstitutionDashboard";

export const metadata = { title: "Admin Dashboard | Greenwave Society" };
export const dynamic  = "force-dynamic";

export default async function DashboardPage() {
  const admin = await requirePermission(PERMISSIONS.DASHBOARD_READ).catch(() => null);
  if (!admin) redirect("/admin/no-access");
  const email = admin.email;

  const db         = getDb();
  const superAdmin = admin.roles.includes(SYSTEM_ROLES.OWNER);

  // Fetch leaders with ALL their signatures (not just one)
  const leaders = await db.executiveLeader.findMany({
    include: {
      signatures: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch all constitution versions
  const versions = await db.constitutionVersion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      signatures: { select: { status: true, leaderId: true } },
    },
  });

  // For the active (published) version, compute signing stats
  const activeVersion = versions.find(v => v.status === "published");
  const activeSigs = activeVersion ? activeVersion.signatures : [];
  const signedCount   = activeSigs.filter(s => s.status === "signed").length;
  const pendingCount  = activeSigs.filter(s => s.status === "pending").length;
  const rejectedCount = activeSigs.filter(s => s.status === "rejected").length;

  // All admins can see registrations
  const registrations = await db.memberRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });

  let subscribers:  { id: string; email: string; createdAt: Date }[] = [];
  let adminUsers:   { id: string; email: string; passwordHash: string | null; createdAt: Date; updatedAt: Date }[] = [];
  let dbStats:      { table: string; count: number }[] = [];
  let auditLogs:    { id: string; action: string; actor: string; detail: string | null; ip: string | null; createdAt: Date }[] = [];

  if (superAdmin) {
    const [subs, users, logs] = await Promise.all([
      db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
      db.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
      db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
    subscribers = subs;
    adminUsers  = users;
    auditLogs   = logs;

    const counts = await Promise.all([
      db.executiveLeader.count(),
      db.constitutionSignature.count(),
      db.newsletterSubscriber.count(),
      db.adminUser.count(),
      db.adminSession.count(),
      db.contactSubmission.count(),
    ]);
    dbStats = [
      { table: "Executive Leaders",       count: counts[0] },
      { table: "Constitution Signatures", count: counts[1] },
      { table: "Newsletter Subscribers",  count: counts[2] },
      { table: "Admin Users",             count: counts[3] },
      { table: "Active Sessions",         count: counts[4] },
      { table: "Contact Submissions",     count: counts[5] },
      { table: "Member Registrations",    count: registrations.length },
    ];
  }

  return (
    <ConstitutionDashboard
      leaders={leaders as any}
      versions={versions as any}
      signedCount={signedCount}
      pendingCount={pendingCount}
      rejectedCount={rejectedCount}
      currentEmail={email ?? ""}
      superAdmin={superAdmin}
      subscribers={subscribers as any}
      adminUsers={adminUsers as any}
      dbStats={dbStats}
      auditLogs={auditLogs as any}
      registrations={registrations as any}
    />
  );
}
