import "server-only";

import { publicEncrypt, constants as cryptoConstants } from "crypto";
import { getMpesaConfig } from "./config";
import { getReversalConfig } from "./reversal-config";
import { SITE_URL } from "@/lib/email-template";

function getBaseUrl(environment: "sandbox" | "production"): string {
  return environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

/**
 * Environment variables rarely carry real newlines — Vercel/Docker/systemd
 * hand the process the two characters `\` and `n`, and OpenSSL then rejects
 * the certificate with an opaque decoder error instead of naming the actual
 * problem. Repairing it here costs nothing for a PEM that's already correct.
 */
function normalisePem(pem: string): string {
  const repaired = pem.trim().replace(/\\r\\n|\\n|\\r/g, "\n").replace(/\r\n/g, "\n");
  if (!repaired.includes("-----BEGIN")) {
    throw new Error('MPESA_REVERSAL_CERTIFICATE is not PEM — expected a "-----BEGIN …-----" block');
  }
  return repaired.endsWith("\n") ? repaired : `${repaired}\n`;
}

/** Daraja's SecurityCredential: the initiator password RSA-encrypted (PKCS#1 v1.5) under Safaricom's certificate, base64-encoded. */
function securityCredential(initiatorPassword: string, certificatePem: string): string {
  return publicEncrypt(
    { key: normalisePem(certificatePem), padding: cryptoConstants.RSA_PKCS1_PADDING },
    Buffer.from(initiatorPassword),
  ).toString("base64");
}

async function fetchAccessToken(consumerKey: string, consumerSecret: string, environment: "sandbox" | "production"): Promise<string> {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await fetch(`${getBaseUrl(environment)}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch M-Pesa access token (HTTP ${res.status})`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("M-Pesa token response contained no access_token");
  return data.access_token;
}

export interface ReversalRequestResult {
  conversationId: string;
  originatorConversationId: string;
}

/**
 * Reverses a settled STK Push payment, crediting the amount back to whoever
 * paid. Uses the same Consumer Key/Secret as STK Push (one Daraja app
 * authenticates every product enabled on it) but a separate, more privileged
 * Initiator identity for the reversal itself.
 */
export async function requestTransactionReversal(params: {
  transactionId: string;
  amount: number;
  remarks: string;
}): Promise<ReversalRequestResult> {
  const mpesaConfig = getMpesaConfig();
  const reversalConfig = getReversalConfig();

  const token = await fetchAccessToken(mpesaConfig.consumerKey, mpesaConfig.consumerSecret, reversalConfig.environment);
  const credential = securityCredential(reversalConfig.initiatorPassword, reversalConfig.certificatePem);

  const res = await fetch(`${getBaseUrl(reversalConfig.environment)}/mpesa/reversal/v1/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      Initiator: reversalConfig.initiatorName,
      SecurityCredential: credential,
      CommandID: "TransactionReversal",
      TransactionID: params.transactionId,
      Amount: params.amount,
      ReceiverParty: reversalConfig.shortCode,
      RecieverIdentifierType: "11",
      ResultURL: `${SITE_URL}/api/mpesa/reversal-result`,
      QueueTimeOutURL: `${SITE_URL}/api/mpesa/reversal-timeout`,
      Remarks: params.remarks.slice(0, 100),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    ConversationID?: string;
    OriginatorConversationID?: string;
    errorMessage?: string;
    ResponseDescription?: string;
  };

  if (!res.ok || !data.ConversationID) {
    throw new Error(`M-Pesa reversal request failed: ${data.errorMessage ?? data.ResponseDescription ?? `HTTP ${res.status}`}`);
  }

  return { conversationId: data.ConversationID, originatorConversationId: data.OriginatorConversationID ?? data.ConversationID };
}
