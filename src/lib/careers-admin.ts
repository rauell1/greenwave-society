import "server-only";
import { getCurrentAdmin } from "@/lib/auth/guards";

export async function requireCareersAdmin() {
  const admin=await getCurrentAdmin();
  const allowed=(process.env.ADMIN_EMAIL??"").trim().toLowerCase();
  if(!admin || !allowed || admin.email.toLowerCase()!==allowed) return null;
  return admin;
}
