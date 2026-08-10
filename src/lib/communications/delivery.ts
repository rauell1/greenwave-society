import "server-only";
import { Resend } from "resend";
import { brandedEmail, FROM_EMAIL, SITE_URL } from "@/lib/email-template";

export type DeliveryResult = { ok: true; id: string | null } | { ok: false; error: string };

export function renderCampaign(input: { eyebrow: string; subject: string; preheader?: string | null; htmlBody: string; unsubscribeToken?: string | null }) {
  const unsubscribe = input.unsubscribeToken ? `<p style="margin:24px 0 0;text-align:center;font-size:12px;color:#607068">No longer want these updates? <a href="${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(input.unsubscribeToken)}" style="color:#1A5C38">Unsubscribe</a>.</p>` : "";
  return brandedEmail({ eyebrow: input.eyebrow, title: input.subject, preheader: input.preheader ?? input.subject, body: `${input.htmlBody}${unsubscribe}` });
}

export async function deliverCampaignEmail(to: string, subject: string, html: string): Promise<DeliveryResult> {
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "Email provider is not configured" };
  try {
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM_EMAIL, to, subject, html });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id ?? null };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Delivery failed" }; }
}
