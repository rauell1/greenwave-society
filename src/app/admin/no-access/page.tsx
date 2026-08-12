import { ShieldAlert } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export const metadata = { title: "Access Restricted | Greenwave Society" };

export default async function NoAccessPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Access Restricted</h1>
      <p className="text-slate-500 max-w-sm mb-6">
        Your account (<span className="font-medium text-slate-700">{admin.email}</span>) does not
        have permission to access any admin sections. Contact an Owner to update your role.
      </p>
      <form action="/api/admin/logout" method="POST">
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
