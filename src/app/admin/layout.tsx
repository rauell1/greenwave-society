import { ReactNode } from "react";
import { getCurrentAdmin } from "@/lib/auth/guards";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import { getEnabledCmsFeatures } from "@/lib/cms/feature-flags";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return <>{children}</>;
  }
  const enabledFeatures = await getEnabledCmsFeatures();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} enabledFeatures={enabledFeatures} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
