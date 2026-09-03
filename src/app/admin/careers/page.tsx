import { notFound } from "next/navigation";
import { requireCareersManager } from "@/lib/careers-admin";
import { getDb } from "@/lib/db";
import CareersManager from "./CareersManager";

export const dynamic = "force-dynamic";

export default async function CareersAdminPage() {
  if (!(await requireCareersManager())) notFound();
  const applications = await getDb().careerApplication.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Careers</h1>
        <p className="text-sm text-slate-500">Review applications, manage role availability, and export recruitment data.</p>
      </div>
      <CareersManager initialApplications={applications.map((application) => ({ ...application, createdAt: application.createdAt.toISOString() }))} />
    </section>
  );
}
