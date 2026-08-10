import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const eventSchema = z.object({
  type: z.string().max(80),
  created_at: z.string().datetime(),
  data: z.object({ email_id: z.string().max(200), to: z.array(z.string().email()).max(10).optional() }).passthrough(),
}).passthrough();

const deliveryState: Record<string, { status: string; dateField?: "deliveredAt" | "bouncedAt" | "complainedAt"; deactivate?: boolean }> = {
  "email.sent": { status: "sent" },
  "email.delivered": { status: "delivered", dateField: "deliveredAt" },
  "email.delivery_delayed": { status: "delayed" },
  "email.bounced": { status: "bounced", dateField: "bouncedAt", deactivate: true },
  "email.failed": { status: "failed" },
  "email.suppressed": { status: "suppressed", deactivate: true },
  "email.complained": { status: "complained", dateField: "complainedAt", deactivate: true },
};

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  const eventId = request.headers.get("svix-id"); const timestamp = request.headers.get("svix-timestamp"); const signature = request.headers.get("svix-signature");
  if (!eventId || !timestamp || !signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const payload = await request.text(); let verified: unknown;
  try { verified = new Resend(process.env.RESEND_API_KEY).webhooks.verify({ payload, headers: { id: eventId, timestamp, signature }, webhookSecret: process.env.RESEND_WEBHOOK_SECRET }); }
  catch { return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); }
  const parsed = eventSchema.safeParse(verified); if (!parsed.success) return NextResponse.json({ error: "Unsupported payload" }, { status: 400 });
  const mapping = deliveryState[parsed.data.type]; const occurredAt = new Date(parsed.data.created_at); const db = getDb();
  try {
    await db.$transaction(async tx => {
      await tx.cmsWebhookEvent.create({ data: { id: eventId, type: parsed.data.type, providerMessageId: parsed.data.data.email_id, payload } });
      if (mapping) {
        const recipient = await tx.cmsCampaignRecipient.findFirst({ where: { providerMessageId: parsed.data.data.email_id }, select: { id: true, subscriberId: true, lastEventAt: true } });
        if (recipient && (!recipient.lastEventAt || recipient.lastEventAt <= occurredAt)) {
          await tx.cmsCampaignRecipient.update({ where: { id: recipient.id }, data: { status: mapping.status, lastEventAt: occurredAt, ...(mapping.dateField ? { [mapping.dateField]: occurredAt } : {}) } });
          if (mapping.deactivate && recipient.subscriberId) await tx.newsletterSubscriber.updateMany({ where: { id: recipient.subscriberId, active: true }, data: { active: false } });
        }
      }
      await tx.cmsWebhookEvent.update({ where: { id: eventId }, data: { processedAt: new Date() } });
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
    console.error(JSON.stringify({ level: "error", message: "Resend webhook processing failed", eventId, type: parsed.data.type }));
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
