import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { requireExecutiveCareersAccess } from "@/lib/careers-admin";

const STATUSES = new Set(["new", "reviewing", "shortlisted", "interview", "accepted", "rejected"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireExecutiveCareersAccess(PERMISSIONS.CAREERS_REVIEW);
  if (!admin) return NextResponse.json({ error: "You do not have permission to review applications." }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  if (body.status !== undefined && (typeof body.status !== "string" || !STATUSES.has(body.status))) return NextResponse.json({ error: "Invalid application stage." }, { status: 400 });
  if (body.rating !== undefined && body.rating !== null && (!Number.isInteger(body.rating) || Number(body.rating) < 1 || Number(body.rating) > 5)) return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  const db = getDb();
  const before = await db.careerApplication.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  const data = {
    ...(body.status !== undefined ? { status: String(body.status), reviewedAt: new Date(), reviewedBy: admin.email } : {}),
    ...(body.internalNotes !== undefined ? { internalNotes: String(body.internalNotes).trim().slice(0, 10000) || null } : {}),
    ...(body.assignedReviewer !== undefined ? { assignedReviewer: String(body.assignedReviewer).trim().slice(0, 200) || null } : {}),
    ...(body.rating !== undefined ? { rating: body.rating === null ? null : Number(body.rating) } : {}),
  };
  const application = await db.$transaction(async (tx) => {
    const updated = await tx.careerApplication.update({ where: { id }, data });
    await tx.auditLog.create({ data: { action: "CAREER_APPLICATION_UPDATED", actor: admin.email, actorUserId: admin.id, detail: `${updated.reference} updated`, resourceType: "career_application", resourceId: id, outcome: "SUCCESS", beforeState: JSON.stringify({ status: before.status, rating: before.rating, assignedReviewer: before.assignedReviewer }), afterState: JSON.stringify({ status: updated.status, rating: updated.rating, assignedReviewer: updated.assignedReviewer }) } });
    return updated;
  });
  return NextResponse.json({ application: { ...application, createdAt: application.createdAt.toISOString(), updatedAt: application.updatedAt.toISOString(), reviewedAt: application.reviewedAt?.toISOString() ?? null } });
}
