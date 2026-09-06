import { describe, expect, it } from "vitest";
import { mapPaymentRow } from "./mapping";
import type { MembershipPayment as MembershipPaymentRow } from "@prisma/client";

function row(overrides: Partial<MembershipPaymentRow> = {}): MembershipPaymentRow {
  return {
    id: "pay_1",
    registrationId: "reg_1",
    phoneNumber: "254712345678",
    amount: 500,
    checkoutRequestId: "ws_CO_1",
    merchantRequestId: "mr_1",
    idempotencyKey: "reg_1",
    status: "PENDING",
    mpesaReceiptNumber: null,
    failureReason: null,
    resultCode: null,
    initiatedAt: new Date("2026-01-01T00:00:00Z"),
    completedAt: null,
    rawCallback: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("mapPaymentRow", () => {
  it("maps registrationId to accountReference so the settlement handler can find the applicant", () => {
    const record = mapPaymentRow(row());
    expect(record.accountReference).toBe("reg_1");
  });

  it("omits nullable fields entirely rather than passing through null", () => {
    const record = mapPaymentRow(row());
    expect(record).not.toHaveProperty("mpesaReceiptNumber");
    expect(record).not.toHaveProperty("failureReason");
    expect(record).not.toHaveProperty("resultCode");
    expect(record).not.toHaveProperty("completedAt");
    expect(record).not.toHaveProperty("rawCallback");
  });

  it("carries a successful payment's receipt and completion details", () => {
    const record = mapPaymentRow(
      row({
        status: "SUCCESS",
        mpesaReceiptNumber: "QGH7XYZ123",
        completedAt: new Date("2026-01-01T00:01:00Z"),
        rawCallback: { Body: { stkCallback: { ResultCode: 0 } } },
      }),
    );
    expect(record.status).toBe("SUCCESS");
    expect(record.mpesaReceiptNumber).toBe("QGH7XYZ123");
    expect(record.completedAt).toEqual(new Date("2026-01-01T00:01:00Z"));
    expect(record.rawCallback).toEqual({ Body: { stkCallback: { ResultCode: 0 } } });
  });
});
