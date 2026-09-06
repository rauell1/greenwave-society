import "server-only";

import { getDb } from "@/lib/db";

const FLAG_KEY = "payments.mpesa_membership";

/**
 * Off by default everywhere (dev, staging, prod) until explicitly turned on —
 * this is the "not live yet" switch for the M-Pesa membership fee flow.
 * FEATURE_MPESA_MEMBERSHIP=true forces it on (e.g. for local/sandbox testing)
 * regardless of what's stored in the DB; the DB flag is what ops flips for a
 * real rollout without a deploy.
 */
export async function isMpesaMembershipEnabled(): Promise<boolean> {
  if (process.env.FEATURE_MPESA_MEMBERSHIP === "true") return true;
  const row = await getDb().cmsFeatureFlag.findUnique({ where: { key: FLAG_KEY } });
  return row?.enabled ?? false;
}

export const MPESA_MEMBERSHIP_FLAG_KEY = FLAG_KEY;
