import "server-only";

import { MpesaStk } from "mpesa-stk";
import { getDb } from "@/lib/db";
import { getMpesaConfig } from "./config";
import { PrismaMembershipPaymentAdapter } from "./adapter";
import { applyMembershipPaymentSettlement } from "./settlement";
import { logger } from "@/lib/logger";

let client: MpesaStk | undefined;

/**
 * Lazily constructed singleton — mirrors getDb()'s pattern. Do not construct
 * MpesaStk per-request; config validation (getMpesaConfig) is deferred to
 * first use so routes unrelated to payments never require MPESA_* env vars.
 */
export function getMpesaClient(): MpesaStk {
  if (!client) {
    const adapter = new PrismaMembershipPaymentAdapter(getDb());
    client = new MpesaStk(getMpesaConfig(), adapter, {
      info: (msg, meta) => logger.info(`[mpesa] ${msg}`, meta),
      warn: (msg, meta) => logger.warn(`[mpesa] ${msg}`, meta),
      error: (msg, meta) => logger.error(`[mpesa] ${msg}`, undefined, meta),
    });
    client.onPaymentSettled(applyMembershipPaymentSettlement);
  }
  return client;
}
