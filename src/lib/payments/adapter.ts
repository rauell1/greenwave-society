import "server-only";

import type { PrismaClient } from "@prisma/client";
import type { PaymentRecord, PaymentStatus, StorageAdapter } from "mpesa-stk";
import { mapPaymentRow } from "./mapping";

/**
 * Backs mpesa-stk's StorageAdapter contract with the app's own Postgres via
 * Prisma, instead of the library's bundled PostgresAdapter (which would open
 * a second `pg` pool and its own `mpesa_payments` table).
 */
export class PrismaMembershipPaymentAdapter implements StorageAdapter {
  constructor(private readonly db: PrismaClient) {}

  async createPayment(record: PaymentRecord, idempotencyKey?: string): Promise<void> {
    await this.db.membershipPayment.create({
      data: {
        id: record.id,
        registrationId: record.accountReference,
        phoneNumber: record.phoneNumber,
        amount: record.amount,
        checkoutRequestId: record.checkoutRequestId,
        merchantRequestId: record.merchantRequestId,
        idempotencyKey: idempotencyKey ?? null,
        status: record.status,
        initiatedAt: record.initiatedAt,
      },
    });
  }

  async getPayment(id: string): Promise<PaymentRecord | null> {
    const row = await this.db.membershipPayment.findUnique({ where: { id } });
    return row ? mapPaymentRow(row) : null;
  }

  async getPaymentByCheckoutId(checkoutRequestId: string): Promise<PaymentRecord | null> {
    const row = await this.db.membershipPayment.findUnique({ where: { checkoutRequestId } });
    return row ? mapPaymentRow(row) : null;
  }

  async getPaymentByIdempotencyKey(key: string): Promise<PaymentRecord | null> {
    const row = await this.db.membershipPayment.findUnique({ where: { idempotencyKey: key } });
    return row ? mapPaymentRow(row) : null;
  }

  async updatePayment(id: string, updates: Partial<PaymentRecord>): Promise<void> {
    await this.db.membershipPayment.update({ where: { id }, data: this.toUpdateData(updates) });
  }

  async settlePayment(id: string, updates: Partial<PaymentRecord>): Promise<boolean> {
    const result = await this.db.membershipPayment.updateMany({
      where: { id, status: "PENDING" },
      data: this.toUpdateData(updates),
    });
    return result.count === 1;
  }

  async registerIdempotencyKey(key: string, paymentId: string): Promise<void> {
    await this.db.membershipPayment.update({ where: { id: paymentId }, data: { idempotencyKey: key } });
  }

  async getPaymentsByStatusAndDateRange(statuses: PaymentStatus[], from: Date, to: Date): Promise<PaymentRecord[]> {
    const rows = await this.db.membershipPayment.findMany({
      where: { status: { in: statuses }, initiatedAt: { gte: from, lte: to } },
    });
    return rows.map((row) => mapPaymentRow(row));
  }

  private toUpdateData(updates: Partial<PaymentRecord>) {
    const data: Record<string, unknown> = {};
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.mpesaReceiptNumber !== undefined) data.mpesaReceiptNumber = updates.mpesaReceiptNumber;
    if (updates.failureReason !== undefined) data.failureReason = updates.failureReason;
    if (updates.resultCode !== undefined) data.resultCode = updates.resultCode;
    if (updates.completedAt !== undefined) data.completedAt = updates.completedAt;
    if (updates.rawCallback !== undefined) data.rawCallback = updates.rawCallback as object;
    if (updates.checkoutRequestId !== undefined) data.checkoutRequestId = updates.checkoutRequestId;
    return data;
  }
}
