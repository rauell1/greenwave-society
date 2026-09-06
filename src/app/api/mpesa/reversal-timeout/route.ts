import { NextRequest, NextResponse } from "next/server";
import { processReversalResult } from "@/lib/payments/reversal-settlement";
import { logger } from "@/lib/logger";

// Safaricom's QueueTimeOutURL for the Transaction Reversal request — posts
// the same Result envelope shape as reversal-result when the request times out.
const ACK = () => NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn("[mpesa:reversal-timeout] failed to parse body");
    return ACK();
  }
  try {
    await processReversalResult(body);
  } catch (err) {
    logger.error("[mpesa:reversal-timeout] processing error", err instanceof Error ? err : undefined);
  }
  return ACK();
}
