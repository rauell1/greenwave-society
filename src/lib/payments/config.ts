import "server-only";

import type { MpesaConfig } from "mpesa-stk";

/** Default membership fee in whole KES. Override with MEMBERSHIP_FEE_KES if it ever changes. */
export const MEMBERSHIP_FEE_KES = Number(process.env.MEMBERSHIP_FEE_KES ?? 500);

export function getMpesaConfig(): MpesaConfig {
  const required = [
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET",
    "MPESA_SHORTCODE",
    "MPESA_PASSKEY",
    "MPESA_CALLBACK_URL",
  ] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing M-Pesa configuration: ${missing.join(", ")}`);
  }

  return {
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    shortCode: process.env.MPESA_SHORTCODE!,
    passKey: process.env.MPESA_PASSKEY!,
    callbackUrl: process.env.MPESA_CALLBACK_URL!,
    environment: process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox",
  };
}
