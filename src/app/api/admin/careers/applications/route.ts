import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { requireExecutiveCareersAccess } from "@/lib/careers-admin";

const STATUSES = new Set(["new", "reviewing", "shortlisted", "interview", "accepted", "rejected"]);

export async function PATCH(request: NextRequest) {
  const admin = await requireExecutiveCareersAccess(PERMISSIONS.CAREERS_REVIEW);
  if (!admin) return NextResponse.json({ error: "You do not have permission to review applications." }, { status: 403 });
  const body = await request.json() as { ids?: unknown; status?: unknown };
  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 100 || !body.ids.every((id) => typeof id === "string")) return NextResponse.json({ error: "Select between 1 and 100 applications." }, { status: 400 });
  if (typeof body.status !== "string" || !STATUSES.has(body.status)) return NextResponse.json({ error: "Invalid application stage." }, { status: 400 });
  const ids = [...new Set(body.ids)];
  const db = getDb();
  const result = await db.$transaction(async (tx) => {
    const updated = await tx.careerApplication.updateMany({ where: { id: { in: ids } }, data: { status: body.status as string, reviewedAt: new Date(), reviewedBy: admin.email } });
    await tx.auditLog.create({ data: { action: "CAREER_APPLICATION_UPDATED", actor: admin.email, actorUserId: admin.id, detail: `Bulk changed ${updated.count} applications to ${body.status}`, resourceType: "career_application", outcome: "SUCCESS", afterState: JSON.stringify({ ids, status: body.status }) } });
    return updated;
  });
  return NextResponse.json({ updated: result.count });
}
