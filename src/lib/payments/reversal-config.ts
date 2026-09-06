import "server-only";

/**
 * Separate, more privileged Daraja credential set from STK Push — Transaction
 * Reversal (sending money back to whoever paid) requires an Initiator
 * identity and Safaricom's public certificate for the environment, which
 * most Daraja sandbox apps don't have configured by default.
 */
export interface ReversalConfig {
  shortCode: string;
  initiatorName: string;
  initiatorPassword: string;
  certificatePem: string;
  environment: "sandbox" | "production";
}

export function getReversalConfig(): ReversalConfig {
  const required = [
    "MPESA_SHORTCODE",
    "MPESA_INITIATOR_NAME",
    "MPESA_INITIATOR_PASSWORD",
    "MPESA_REVERSAL_CERTIFICATE",
  ] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `M-Pesa refunds are not configured yet — missing: ${missing.join(", ")}. ` +
      "See docs/mpesa-membership-payments.md for how to obtain these from Safaricom.",
    );
  }

  return {
    shortCode: process.env.MPESA_SHORTCODE!,
    initiatorName: process.env.MPESA_INITIATOR_NAME!,
    initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD!,
    certificatePem: process.env.MPESA_REVERSAL_CERTIFICATE!,
    environment: process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox",
  };
}
