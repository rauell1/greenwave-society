import { getAdminSession, isSuperAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import ConstitutionDashboard from "./ConstitutionDashboard";

export const metadata = { title: "Admin Dashboard | Greenwave Society" };
export const dynamic  = "force-dynamic";

export default async function DashboardPage() {
  const { valid, email } = await getAdminSession();
  if (!valid) redirect("/admin");

  const db       = getDb();
  const superAdmin = isSuperAdmin(email);

  const leaders = await db.executiveLeader.findMany({
    include:  { signature: true },
    orderBy:  { createdAt: "asc" },
  });

  const signedCount   = leaders.filter(l => l.signature?.status === "signed").length;
  const pendingCount  = leaders.filter(l => l.signature?.status === "pending").length;
  const rejectedCount = leaders.filter(l => l.signature?.status === "rejected").length;

  let subscribers:    { id: string; email: string; createdAt: Date }[] = [];
  let adminUsers:     { id: string; email: string; passwordHash: string | null; createdAt: Date; updatedAt: Date }[] = [];
  let dbStats:        { table: string; count: number }[] = [];

  if (superAdmin) {
    const [subs, users] = await Promise.all([
      db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
      db.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    ]);
    subscribers = subs;
    adminUsers  = users;

    // DB table counts via raw queries
    const counts = await Promise.all([
      db.executiveLeader.count(),
      db.constitutionSignature.count(),
      db.newsletterSubscriber.count(),
      db.adminUser.count(),
      db.adminSession.count(),
      db.contactSubmission.count(),
    ]);
    dbStats = [
      { table: "Executive Leaders",        count: counts[0] },
      { table: "Constitution Signatures",  count: counts[1] },
      { table: "Newsletter Subscribers",   count: counts[2] },
      { table: "Admin Users",              count: counts[3] },
      { table: "Active Sessions",          count: counts[4] },
      { table: "Contact Submissions",      count: counts[5] },
    ];
  }

  return (
    <ConstitutionDashboard
      leaders={leaders as any}
      signedCount={signedCount}
      pendingCount={pendingCount}
      rejectedCount={rejectedCount}
      currentEmail={email ?? ""}
      superAdmin={superAdmin}
      subscribers={subscribers as any}
      adminUsers={adminUsers as any}
      dbStats={dbStats}
    />
  );
}
