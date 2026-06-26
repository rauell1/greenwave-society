import { requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import ConstitutionDashboard from "./ConstitutionDashboard";

export const metadata = { title: "Constitution Dashboard | Greenwave Society Admin" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAdminSession();
  const db = getDb();

  const leaders = await db.executiveLeader.findMany({
    include: { signature: true },
    orderBy: { createdAt: "asc" },
  });

  const signedCount   = leaders.filter(l => l.signature?.status === "signed").length;
  const pendingCount  = leaders.filter(l => l.signature?.status === "pending").length;
  const rejectedCount = leaders.filter(l => l.signature?.status === "rejected").length;

  return (
    <ConstitutionDashboard
      leaders={leaders as any}
      signedCount={signedCount}
      pendingCount={pendingCount}
      rejectedCount={rejectedCount}
    />
  );
}
