import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { csvCell } from "@/lib/members/validation";
import { PAYMENT_STATUSES } from "@/lib/payments/constants";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function GET(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_EXPORT);
  if (!auth.ok) return auth.response;
  const requestedStatus = request.nextUrl.searchParams.get("status");
  const status = PAYMENT_STATUSES.includes(requestedStatus as typeof PAYMENT_STATUSES[number]) ? requestedStatus : undefined;
  const payments = await getDb().membershipPayment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 10_000,
    include: { registration: { select: { fullName: true, email: true } } },
  });
  const headers = ["Applicant", "Email", "Phone", "Amount (KES)", "Status", "Receipt No.", "Failure Reason", "Checkout Request ID", "Initiated At", "Completed At"];
  const rows = payments.map(payment => [
    payment.registration.fullName,
    payment.registration.email,
    payment.phoneNumber,
    payment.amount,
    payment.status,
    payment.mpesaReceiptNumber,
    payment.failureReason,
    payment.checkoutRequestId,
    payment.initiatedAt.toISOString(),
    payment.completedAt?.toISOString(),
  ].map(csvCell).join(","));
  await getDb().auditLog.create({
    data: {
      action: AUDIT_ACTIONS.MEMBERSHIP_PAYMENTS_EXPORTED,
      actor: auth.admin.email,
      actorUserId: auth.admin.id,
      resourceType: "membership_payment",
      outcome: "SUCCESS",
      detail: `Exported ${payments.length} membership payment records${status ? ` with status ${status}` : ""}`,
    },
  });
  return new NextResponse([headers.map(csvCell).join(","), ...rows].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greenwave-membership-payments-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
