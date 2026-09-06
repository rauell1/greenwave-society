import type { MembershipPayment as MembershipPaymentRow } from "@prisma/client";
import type { PaymentRecord, PaymentStatus } from "mpesa-stk";

/**
 * Pure row → PaymentRecord mapping, kept out of adapter.ts (which is
 * "server-only") so it can be unit tested without a live Prisma client.
 * `accountReference` is always the MemberRegistration id — every payment row
 * is created through initiateMembershipPayment(), which enforces that
 * invariant — so it doubles as the foreign key back to the registration.
 */
export function mapPaymentRow(row: MembershipPaymentRow): PaymentRecord {
  const record: PaymentRecord = {
    id: row.id,
    checkoutRequestId: row.checkoutRequestId,
    merchantRequestId: row.merchantRequestId,
    phoneNumber: row.phoneNumber,
    amount: row.amount,
    accountReference: row.registrationId,
    status: row.status as PaymentStatus,
    initiatedAt: row.initiatedAt,
  };
  if (row.mpesaReceiptNumber !== null) record.mpesaReceiptNumber = row.mpesaReceiptNumber;
  if (row.failureReason !== null) record.failureReason = row.failureReason;
  if (row.resultCode !== null) record.resultCode = row.resultCode;
  if (row.completedAt !== null) record.completedAt = row.completedAt;
  if (row.rawCallback !== null) record.rawCallback = row.rawCallback;
  return record;
}
