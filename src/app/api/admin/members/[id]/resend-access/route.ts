import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { sendMembershipDecisionEmail } from "@/lib/members/email";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_UPDATE);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const db = getDb();
  const member = await db.memberRegistration.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (member.status !== "approved" || !member.memberToken) return NextResponse.json({ error: "Portal access can only be sent to an approved member." }, { status: 409 });
  const delivery = await sendMembershipDecisionEmail({ fullName: member.fullName, email: member.email, approved: true, memberToken: member.memberToken, reviewNote: member.reviewNote });
  await db.$transaction([
    db.memberRegistration.update({ where: { id }, data: { onboardingEmailStatus: delivery.sent ? "sent" : "failed", onboardingEmailAttempts: { increment: 1 }, onboardingEmailLastError: delivery.error, onboardingEmailSentAt: delivery.sent ? new Date() : member.onboardingEmailSentAt } }),
    db.auditLog.create({ data: { action: "MEMBER_ACCESS_EMAIL_RETRIED", actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "member_registration", resourceId: id, outcome: delivery.sent ? "SUCCESS" : "FAILURE", detail: delivery.sent ? "Member portal access email sent" : "Member portal access email delivery failed" } }),
  ]);
  return NextResponse.json({ sent: delivery.sent, error: delivery.error });
}
