import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { requestTransactionReversal } from "@/lib/payments/reversal";

const bodySchema = z.object({ reason: z.string().trim().max(500).optional().default("") });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.PAYMENTS_REFUND);
  if (!auth.ok) return auth.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const { id } = await params;
  const db = getDb();
  const payment = await db.membershipPayment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "SUCCESS" || !payment.mpesaReceiptNumber) {
    return NextResponse.json({ error: "Only a successfully paid transaction (with an M-Pesa receipt) can be refunded." }, { status: 409 });
  }

  const existingActiveRefund = await db.membershipRefund.findFirst({
    where: { paymentId: id, status: { in: ["PENDING", "SUCCESS"] } },
  });
  if (existingActiveRefund) {
    return NextResponse.json({ error: `This payment already has a ${existingActiveRefund.status.toLowerCase()} refund.` }, { status: 409 });
  }

  let reversal;
  try {
    reversal = await requestTransactionReversal({
      transactionId: payment.mpesaReceiptNumber,
      amount: payment.amount,
      remarks: parsed.data.reason || "Greenwave Society membership fee refund",
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Refund request failed." }, { status: 502 });
  }

  const refund = await db.membershipRefund.create({
    data: {
      paymentId: id,
      amount: payment.amount,
      reason: parsed.data.reason || null,
      status: "PENDING",
      conversationId: reversal.conversationId,
      originatorConversationId: reversal.originatorConversationId,
      requestedBy: auth.admin.email,
    },
  });

  await db.auditLog.create({
    data: {
      action: AUDIT_ACTIONS.MEMBERSHIP_PAYMENT_REFUND_INITIATED,
      actor: auth.admin.email,
      actorUserId: auth.admin.id,
      resourceType: "membership_payment",
      resourceId: id,
      outcome: "SUCCESS",
      detail: parsed.data.reason || undefined,
      afterState: JSON.stringify({ refundId: refund.id, amount: refund.amount }),
    },
  });

  return NextResponse.json({ refundId: refund.id, status: refund.status });
}
