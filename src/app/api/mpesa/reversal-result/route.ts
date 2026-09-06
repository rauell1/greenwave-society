import { NextRequest, NextResponse } from "next/server";
import { processReversalResult } from "@/lib/payments/reversal-settlement";
import { logger } from "@/lib/logger";

// Safaricom's ResultURL for the Transaction Reversal request. Same rules as
// /api/mpesa/callback: always ACK with 200 within 5s, unauthenticated route.
const ACK = () => NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn("[mpesa:reversal-result] failed to parse body");
    return ACK();
  }
  try {
    await processReversalResult(body);
  } catch (err) {
    logger.error("[mpesa:reversal-result] processing error", err instanceof Error ? err : undefined);
  }
  return ACK();
}
