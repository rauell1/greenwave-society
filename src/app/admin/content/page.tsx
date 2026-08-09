import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { notFound } from "next/navigation";

export default async function ContentPage() {
  await requirePermission(PERMISSIONS.CONTENT_READ);
  if (!(await isCmsFeatureEnabled("content"))) notFound();
  
  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Management</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          This module is coming soon. It is currently under development.
        </p>
      </div>
    </div>
  );
}
