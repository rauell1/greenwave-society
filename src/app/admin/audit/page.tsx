import { requireAdmin } from "@/lib/auth/guards";
import { APP_CONFIG } from "@/config/app.config";
import { notFound } from "next/navigation";

export default async function AuditPage() {
  await requireAdmin();
  
  if (!APP_CONFIG.features.cms.audit) {
    notFound();
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Logs</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          This module is coming soon. In Phase 2, this section will contain a paginated and filterable list of all administrative actions.
        </p>
      </div>
    </div>
  );
}
