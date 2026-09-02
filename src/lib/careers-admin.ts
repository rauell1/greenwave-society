import "server-only";
import { getCurrentAdmin } from "@/lib/auth/guards";

export async function requireCareersManager() {
  const admin=await getCurrentAdmin();
  return admin;
}

export async function requireCareersExportAdmin() {
  const admin=await getCurrentAdmin();
  const allowed=(process.env.ADMIN_EMAIL??"").trim().toLowerCase();
  if(!admin || !allowed || admin.email.toLowerCase()!==allowed) return null;
  return admin;
}
