import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { getAdminSession } from "@/lib/admin-auth";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

export async function POST() {
  const session = await getAdminSession();
  await clearAdminSessionCookie();
  if (session.email) await logAuditEvent({ action: AUDIT_ACTIONS.AUTH_LOGOUT, actor: session.email, outcome: "SUCCESS" });
  return NextResponse.json({ success: true });
}
