import { notFound } from "next/navigation";
import { requireCareersManager } from "@/lib/careers-admin";
import { getDb } from "@/lib/db";
import CareersManager from "./CareersManager";
<<<<<<< Updated upstream
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
=======
>>>>>>> Stashed changes

export const dynamic = "force-dynamic";

export default async function CareersAdminPage() {
<<<<<<< Updated upstream
  const admin = await requireCareersManager();
  if (!admin) notFound();
  const applications = await getDb().careerApplication.findMany({ orderBy: { createdAt: "desc" } });
=======
  if (!(await requireCareersManager())) notFound();

  const applications = await getDb().careerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
>>>>>>> Stashed changes

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Careers</h1>
<<<<<<< Updated upstream
        <p className="text-sm text-slate-500">Review applications, manage role availability, and export recruitment data.</p>
      </div>
      <CareersManager
        initialApplications={applications.map((application) => ({ ...application, createdAt: application.createdAt.toISOString(), updatedAt: application.updatedAt.toISOString(), reviewedAt: application.reviewedAt?.toISOString() ?? null }))}
        capabilities={{ review: hasPermission(admin, PERMISSIONS.CAREERS_REVIEW), export: hasPermission(admin, PERMISSIONS.CAREERS_EXPORT), manage: hasPermission(admin, PERMISSIONS.CAREERS_MANAGE) }}
=======
        <p className="text-sm text-slate-500">
          Review every application, manage role availability, and export stored applications.
        </p>
      </div>
      <CareersManager
        applications={applications.map((application) => ({
          ...application,
          createdAt: application.createdAt.toISOString(),
        }))}
>>>>>>> Stashed changes
      />
    </section>
  );
}
