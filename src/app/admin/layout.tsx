import { ReactNode } from "react";
import { getCurrentAdmin } from "@/lib/auth/guards";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import { getEnabledCmsFeatures } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import AdminBreadcrumbs from "@/components/admin/layout/AdminBreadcrumbs";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isExecutiveCommitteeMember, requireExecutiveCareersAccess } from "@/lib/careers-admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return <>{children}</>;
  }
  const careersAccessPromise = requireExecutiveCareersAccess(PERMISSIONS.CAREERS_READ);
  const canReadMembers = hasPermission(admin, PERMISSIONS.MEMBERS_READ);
  const [enabledFeatures, careersAccess, executiveMember, pendingMembers] = await Promise.all([
    getEnabledCmsFeatures(),
    careersAccessPromise,
    isExecutiveCommitteeMember(admin),
    canReadMembers ? getDb().memberRegistration.count({ where: { status: "pending" } }) : Promise.resolve(0),
  ]);
  const pendingCareers = careersAccess ? await getDb().careerApplication.count({ where: { status: "new" } }) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} enabledFeatures={enabledFeatures} canViewCareers={Boolean(careersAccess)} canViewGovernance={executiveMember} notificationCounts={{ careers: pendingCareers, members: pendingMembers }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-6 lg:p-8">
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
