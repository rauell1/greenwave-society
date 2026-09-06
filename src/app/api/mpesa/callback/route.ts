import { NextRequest, NextResponse } from "next/server";
import { getMpesaClient } from "@/lib/payments/client";
import { logger } from "@/lib/logger";

/**
 * Receives STK Push callbacks from Safaricom. Must always ACK with HTTP 200
 * and { ResultCode: 0 } within 5 seconds, even on a malformed payload —
 * Safaricom retries on anything else. Excluded from auth middleware since
 * it must be publicly reachable; consider allowlisting Safaricom's callback
 * IPs at the CDN/WAF once this goes live (see mpesa-stk's README).
 */
const ACK = () => NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn("[mpesa:callback] failed to parse body");
    return ACK();
  }

  try {
    const result = await getMpesaClient().processCallback(body);
    if (!result.isDuplicate) {
      logger.info("[mpesa:callback] processed", { paymentId: result.paymentId, status: result.status });
    }
  } catch (err) {
    logger.error("[mpesa:callback] processing error", err instanceof Error ? err : undefined);
  }

  return ACK();
}
