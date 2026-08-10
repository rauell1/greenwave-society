import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { sendMembershipDecisionEmail } from "@/lib/members/email";


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_REVIEW);
  if (!auth.ok) return auth.response;
  const email = auth.admin.email;

  const { id }                     = await params;
  const { action, reviewNote }     = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const db = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reg.status !== "pending") {
    return NextResponse.json({ error: "Application already reviewed" }, { status: 409 });
  }

  const cleanNote = typeof reviewNote === "string" ? reviewNote.trim().slice(0, 2000) : "";
  const memberToken = action === "approve" ? randomBytes(24).toString("hex") : null;

  const nextStatus = action === "approve" ? "approved" : "rejected";
  const updated = await db.$transaction(async tx => {
    const changed = await tx.memberRegistration.updateMany({
      where: { id, status: "pending" },
      data: { status: nextStatus, active: action === "approve", reviewNote: cleanNote || null, reviewedAt: new Date(), reviewedBy: email ?? "admin", updatedAt: new Date(), memberToken, ...(action === "approve" ? { onboardingEmailStatus: "pending" } : {}) },
    });
    if (changed.count !== 1) return null;
    await tx.memberStatusHistory.create({ data: { registrationId: id, fromStatus: reg.status, toStatus: nextStatus, reason: cleanNote || null, actorUserId: auth.admin.id, actorEmail: auth.admin.email } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.MEMBER_STATUS_CHANGED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "member_registration", resourceId: id, outcome: "SUCCESS", detail: `${action === "approve" ? "Approved" : "Rejected"} application`, beforeState: JSON.stringify({ status: reg.status }), afterState: JSON.stringify({ status: nextStatus }) } });
    return tx.memberRegistration.findUniqueOrThrow({ where: { id }, select: { id: true, fullName: true, email: true, status: true, active: true } });
  });
  if (!updated) return NextResponse.json({ error: "Application was reviewed in another request. Reload and try again." }, { status: 409 });
  const delivery = await sendMembershipDecisionEmail({ fullName: reg.fullName, email: reg.email, approved: action === "approve", memberToken, reviewNote: cleanNote });
  if (action === "approve") await db.memberRegistration.update({ where: { id }, data: { onboardingEmailStatus: delivery.sent ? "sent" : "failed", onboardingEmailAttempts: { increment: 1 }, onboardingEmailLastError: delivery.error, onboardingEmailSentAt: delivery.sent ? new Date() : null } });
  return NextResponse.json({ success: true, registration: updated, emailStatus: delivery.sent ? "sent" : "failed" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_DELETE);
  if (!auth.ok) return auth.response;
  const email = auth.admin.email;

  const { id } = await params;
  const db = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

  const userEmail = reg.email;
  const userName = reg.fullName;

  // Cascade deletion of member registration & related newsletter/contact data
  await db.$transaction([
    db.memberRegistration.delete({ where: { id } }),
    db.newsletterSubscriber.deleteMany({ where: { email: userEmail } }),
    db.contactSubmission.deleteMany({ where: { email: userEmail } }),
  ]);

  await db.auditLog.create({
    data: {
      id: randomBytes(12).toString("hex"),
      action: "ADMIN_MEMBER_DATA_ERASED",
      actor: email ?? "admin",
      detail: `Permanently deleted member registration & scrubbed data for ${userName} (ID: ${id}) per privacy compliance request`,
    },
  });

  return NextResponse.json({ success: true, message: `Member ${userName} and associated data successfully erased.` });
}
