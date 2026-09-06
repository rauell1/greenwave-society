import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/policy";
import { getDb } from "@/lib/db";
import { MPESA_MEMBERSHIP_FLAG_KEY } from "@/lib/payments/feature-flag";
import { getMembershipFeeKes } from "@/lib/payments/config";
import { MpesaFeatureToggle } from "@/components/admin/settings/MpesaFeatureToggle";
import { MembershipFeeControl } from "@/components/admin/settings/MembershipFeeControl";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings | Greenwave Admin" };

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");
  if (!hasPermission(admin, PERMISSIONS.SETTINGS_READ)) redirect("/admin/dashboard");
  const canManage = hasPermission(admin, PERMISSIONS.SETTINGS_MANAGE);
  const [features, mpesaFlag, feeKes] = await Promise.all([
    getDb().cmsFeatureFlag.findMany({ orderBy: { key: "asc" }, select: { key: true, enabled: true, description: true, updatedAt: true } }),
    getDb().cmsFeatureFlag.findUnique({ where: { key: MPESA_MEMBERSHIP_FLAG_KEY } }),
    getMembershipFeeKes(),
  ]);
  return <section className="space-y-6">
    <header><h1 className="text-2xl font-semibold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Production CMS configuration and feature availability.</p></header>
    <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
      <div className="border-b px-5 py-4"><h2 className="font-semibold text-slate-900">CMS modules</h2><p className="text-sm text-slate-500">Feature changes are deployment-controlled and audit protected.</p></div>
      <ul className="divide-y">{features.map(feature => <li key={feature.key} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium text-slate-900">{feature.key.replace("cms.", "").replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{feature.description ?? `Greenwave ${feature.key.replace("cms.", "")} management`}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${feature.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{feature.enabled ? "Enabled" : "Disabled"}</span></li>)}</ul>
    </div>
    <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
      <div className="border-b px-5 py-4"><h2 className="font-semibold text-slate-900">Membership payments</h2><p className="text-sm text-slate-500">Toggle this on to go live — no deployment required. Changes are audit logged.</p></div>
      <ul className="divide-y">
        <li className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium text-slate-900">M-Pesa membership fee</p>
            <p className="text-xs text-slate-500">
              When enabled, join applicants must pay the membership fee via M-Pesa STK Push and are auto-approved on
              successful payment. Requires MPESA_* credentials to be configured first.
            </p>
          </div>
          <MpesaFeatureToggle initialEnabled={mpesaFlag?.enabled ?? false} canManage={canManage} />
        </li>
        <li className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium text-slate-900">Membership fee amount</p>
            <p className="text-xs text-slate-500">The KES amount charged per membership application.</p>
          </div>
          <MembershipFeeControl initialFeeKes={feeKes} canManage={canManage} />
        </li>
      </ul>
    </div>
  </section>;
}
