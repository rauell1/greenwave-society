import "server-only";

import { randomBytes } from "crypto";
import type { PaymentRecord } from "mpesa-stk";
import { getDb } from "@/lib/db";
import { sendMembershipDecisionEmail } from "@/lib/members/email";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { logger } from "@/lib/logger";

const SYSTEM_ACTOR = "system:mpesa";

/**
 * Fires once a membership payment reaches a terminal state (mpesa-stk's
 * onPaymentSettled). `payment.accountReference` is the MemberRegistration id
 * (see adapter.ts). A successful payment auto-approves the applicant — but
 * only if they are still "pending": if an admin already rejected/suspended
 * them before the callback arrived, we record the payment as paid without
 * reviving a decision a human already made.
 */
export async function applyMembershipPaymentSettlement(payment: PaymentRecord): Promise<void> {
  const registrationId = payment.accountReference;
  const db = getDb();

  if (payment.status !== "SUCCESS") {
    await db.memberRegistration
      .update({ where: { id: registrationId }, data: { membershipFeeStatus: "failed" } })
      .catch((err) => logger.error("Failed to record membership fee failure", err as Error, { registrationId }));
    return;
  }

  const memberToken = randomBytes(24).toString("hex");

  const approved = await db.$transaction(async (tx) => {
    const before = await tx.memberRegistration.findUnique({ where: { id: registrationId } });
    if (!before) return null;

    if (before.status !== "pending") {
      await tx.memberRegistration.update({
        where: { id: registrationId },
        data: { membershipFeeStatus: "paid", membershipFeePaidAt: new Date() },
      });
      return null;
    }

    const changed = await tx.memberRegistration.updateMany({
      where: { id: registrationId, status: "pending" },
      data: {
        status: "approved",
        active: true,
        memberToken,
        membershipFeeStatus: "paid",
        membershipFeePaidAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: SYSTEM_ACTOR,
        onboardingEmailStatus: "pending",
      },
    });
    if (changed.count !== 1) return null;

    await tx.memberStatusHistory.create({
      data: {
        registrationId,
        fromStatus: before.status,
        toStatus: "approved",
        reason: "Auto-approved after successful M-Pesa membership fee payment.",
        actorEmail: SYSTEM_ACTOR,
      },
    });
    await tx.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.MEMBER_STATUS_CHANGED,
        actor: SYSTEM_ACTOR,
        resourceType: "member_registration",
        resourceId: registrationId,
        outcome: "SUCCESS",
        beforeState: JSON.stringify({ status: before.status }),
        afterState: JSON.stringify({ status: "approved" }),
      },
    });

    return tx.memberRegistration.findUniqueOrThrow({
      where: { id: registrationId },
      select: { id: true, fullName: true, email: true, memberToken: true },
    });
  });

  if (!approved) return;

  const delivery = await sendMembershipDecisionEmail({
    fullName: approved.fullName,
    email: approved.email,
    approved: true,
    memberToken: approved.memberToken,
  });
  await db.memberRegistration.update({
    where: { id: registrationId },
    data: {
      onboardingEmailStatus: delivery.sent ? "sent" : "failed",
      onboardingEmailAttempts: { increment: 1 },
      onboardingEmailLastError: delivery.error,
      onboardingEmailSentAt: delivery.sent ? new Date() : null,
    },
  });
}
