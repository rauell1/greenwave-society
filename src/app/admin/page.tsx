import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = { title: "Admin Login | Greenwave Society" };

export default async function AdminPage() {
  const authed = await getAdminSession();
  if (authed) redirect("/admin/dashboard");
  return <AdminLoginForm />;
}
