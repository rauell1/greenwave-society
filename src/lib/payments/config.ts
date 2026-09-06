import "server-only";

import type { MpesaConfig } from "mpesa-stk";
import { getDb } from "@/lib/db";

export const MEMBERSHIP_FEE_SETTING_KEY = "payments.membership_fee_kes";
export const DEFAULT_MEMBERSHIP_FEE_KES = 500;

/**
 * Admin-editable via /admin/settings (stored in `app_settings`). Falls back to
 * MEMBERSHIP_FEE_KES (env) and then DEFAULT_MEMBERSHIP_FEE_KES if no admin
 * value has been set yet — M-Pesa requires a positive whole-KES integer, so
 * an invalid stored value is never trusted over that fallback chain.
 */
export async function getMembershipFeeKes(): Promise<number> {
  const row = await getDb().appSetting.findUnique({ where: { key: MEMBERSHIP_FEE_SETTING_KEY } });
  const stored = row ? Number(row.value) : NaN;
  if (Number.isInteger(stored) && stored > 0) return stored;

  const fromEnv = Number(process.env.MEMBERSHIP_FEE_KES);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;

  return DEFAULT_MEMBERSHIP_FEE_KES;
}

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
