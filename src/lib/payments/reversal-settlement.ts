import "server-only";

import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

interface DarajaResultEnvelope {
  Result?: {
    ResultCode?: number;
    ResultDesc?: string;
    ConversationID?: string;
    OriginatorConversationID?: string;
  };
}

/**
 * Shared by /api/mpesa/reversal-result and /api/mpesa/reversal-timeout —
 * Safaricom posts the same Result envelope shape to both. Looks up the
 * MembershipRefund by ConversationID and atomically transitions it out of
 * PENDING, mirroring the STK callback's compare-and-swap dedup guard so a
 * retried delivery never double-processes.
 */
export async function processReversalResult(body: unknown): Promise<void> {
  const envelope = body as DarajaResultEnvelope;
  const result = envelope.Result;
  const conversationId = result?.ConversationID;
  if (!result || typeof conversationId !== "string") {
    logger.warn("[mpesa:reversal] callback missing Result.ConversationID — ignoring", { body });
    return;
  }

  const db = getDb();
  const refund = await db.membershipRefund.findUnique({ where: { conversationId } });
  if (!refund) {
    logger.warn("[mpesa:reversal] no refund found for ConversationID — ignoring", { conversationId });
    return;
  }
  if (refund.status !== "PENDING") {
    logger.warn("[mpesa:reversal] duplicate result for already-settled refund — ignoring", { refundId: refund.id, status: refund.status });
    return;
  }

  const resultCode = result.ResultCode ?? -1;
  const status = resultCode === 0 ? "SUCCESS" : "FAILED";

  const claimed = await db.membershipRefund.updateMany({
    where: { id: refund.id, status: "PENDING" },
    data: { status, resultCode, resultDesc: result.ResultDesc ?? null, rawResult: body as object, completedAt: new Date() },
  });
  if (claimed.count !== 1) {
    logger.warn("[mpesa:reversal] duplicate result lost race — ignored", { refundId: refund.id });
  }
}
