import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { canTransitionMember, memberStatusSchema } from "@/lib/members/validation";
import { sendMembershipDecisionEmail } from "@/lib/members/email";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_UPDATE);
  if (!auth.ok) return auth.response;
  const parsed = memberStatusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid member status or reason." }, { status: 400 });
  const { id } = await params;
  const db = getDb();
  const before = await db.memberRegistration.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (!canTransitionMember(before.status, parsed.data.status)) return NextResponse.json({ error: `Cannot move a member from ${before.status} to ${parsed.data.status}.` }, { status: 409 });
  const approving = parsed.data.status === "approved";
  const memberToken = approving ? randomBytes(24).toString("hex") : null;
  const member = await db.$transaction(async tx => {
    const changed = await tx.memberRegistration.updateMany({
      where: { id, status: before.status },
      data: { status: parsed.data.status, active: approving, memberToken, reviewNote: parsed.data.reason || before.reviewNote, reviewedAt: new Date(), reviewedBy: auth.admin.email, ...(approving ? { onboardingEmailStatus: "pending" } : {}) },
    });
    if (changed.count !== 1) return null;
    await tx.memberStatusHistory.create({ data: { registrationId: id, fromStatus: before.status, toStatus: parsed.data.status, reason: parsed.data.reason || null, actorUserId: auth.admin.id, actorEmail: auth.admin.email } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.MEMBER_STATUS_CHANGED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "member_registration", resourceId: id, outcome: "SUCCESS", beforeState: JSON.stringify({ status: before.status }), afterState: JSON.stringify({ status: parsed.data.status }) } });
    return tx.memberRegistration.findUniqueOrThrow({ where: { id }, select: { id: true, fullName: true, email: true, status: true, active: true, memberToken: true } });
  });
  if (!member) return NextResponse.json({ error: "Member status changed in another request. Reload and try again." }, { status: 409 });
  if (approving) {
    const delivery = await sendMembershipDecisionEmail({ fullName: member.fullName, email: member.email, approved: true, memberToken: member.memberToken, reviewNote: parsed.data.reason });
    await db.memberRegistration.update({ where: { id }, data: { onboardingEmailStatus: delivery.sent ? "sent" : "failed", onboardingEmailAttempts: { increment: 1 }, onboardingEmailLastError: delivery.error, onboardingEmailSentAt: delivery.sent ? new Date() : null } });
  }
  return NextResponse.json({ member: { id: member.id, status: member.status, active: member.active }, emailStatus: approving ? "recorded" : undefined });
}
