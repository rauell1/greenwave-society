export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "TIMEOUT", "EXPIRED"] as const;
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];
