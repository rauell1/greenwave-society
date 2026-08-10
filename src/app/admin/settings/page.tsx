import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/policy";
import { getDb } from "@/lib/db";

export const metadata = { title: "Settings | Greenwave Admin" };

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");
  if (!hasPermission(admin, PERMISSIONS.SETTINGS_READ)) redirect("/admin/dashboard");
  const features = await getDb().cmsFeatureFlag.findMany({ orderBy: { key: "asc" }, select: { key: true, enabled: true, description: true, updatedAt: true } });
  return <section className="space-y-6">
    <header><h1 className="text-2xl font-semibold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Production CMS configuration and feature availability.</p></header>
    <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
      <div className="border-b px-5 py-4"><h2 className="font-semibold text-slate-900">CMS modules</h2><p className="text-sm text-slate-500">Feature changes are deployment-controlled and audit protected.</p></div>
      <ul className="divide-y">{features.map(feature => <li key={feature.key} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium text-slate-900">{feature.key.replace("cms.", "").replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{feature.description ?? `Greenwave ${feature.key.replace("cms.", "")} management`}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${feature.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{feature.enabled ? "Enabled" : "Disabled"}</span></li>)}</ul>
    </div>
  </section>;
}
