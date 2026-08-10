import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { deliverCampaignEmail, renderCampaign } from "@/lib/communications/delivery";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.COMMUNICATIONS_SEND); if (!auth.ok) return auth.response;
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email provider is not configured" }, { status: 503 });
  const id = (await params).id; const db = getDb();
  const campaign = await db.cmsCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status === "sent") return NextResponse.json({ error: "Campaign has already been sent" }, { status: 409 });
  if (["draft", "failed"].includes(campaign.status)) {
    const claimed = await db.cmsCampaign.updateMany({ where: { id, status: campaign.status }, data: { status: "sending", updatedById: auth.admin.id } });
    if (claimed.count !== 1) return NextResponse.json({ error: "Campaign state changed; refresh and try again" }, { status: 409 });
    if (campaign.status === "failed") await db.cmsCampaignRecipient.updateMany({ where: { campaignId: id, status: "failed" }, data: { status: "pending" } });
    else {
      const subscribers = await db.newsletterSubscriber.findMany({ where: { active: true, unsubscribeToken: { not: null } }, select: { id: true, email: true } });
      await db.$transaction(async tx => {
        await tx.cmsCampaignRecipient.createMany({ data: subscribers.map(item => ({ campaignId: id, subscriberId: item.id, email: item.email })), skipDuplicates: true });
        await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.CAMPAIGN_RECIPIENTS_SNAPSHOTTED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_campaign", resourceId: id, outcome: "SUCCESS", afterState: JSON.stringify({ count: subscribers.length }) } });
      });
    }
  } else if (campaign.status !== "sending") return NextResponse.json({ error: "Campaign cannot be sent from its current state" }, { status: 409 });
  const batch = await db.cmsCampaignRecipient.findMany({ where: { campaignId: id, status: "pending" }, orderBy: { createdAt: "asc" }, take: 25, include: { subscriber: { select: { active: true, unsubscribeToken: true } } } });
  let sent = 0; let failed = 0;
  for (const recipient of batch) {
    const reserved = await db.cmsCampaignRecipient.updateMany({ where: { id: recipient.id, status: "pending" }, data: { status: "processing", attempts: { increment: 1 } } });
    if (reserved.count !== 1) continue;
    if (!recipient.subscriber?.active || !recipient.subscriber.unsubscribeToken) { await db.cmsCampaignRecipient.update({ where: { id: recipient.id }, data: { status: "skipped", lastError: "Subscriber opted out before delivery" } }); continue; }
    const result = await deliverCampaignEmail(recipient.email, campaign.subject, renderCampaign({ ...campaign, unsubscribeToken: recipient.subscriber.unsubscribeToken }));
    await db.cmsCampaignRecipient.update({ where: { id: recipient.id }, data: result.ok ? { status: "sent", sentAt: new Date(), providerMessageId: result.id, lastError: null } : { status: "failed", lastError: result.error.slice(0, 2000) } });
    if (result.ok) sent++; else failed++;
  }
  const [remaining, totalFailed] = await Promise.all([db.cmsCampaignRecipient.count({ where: { campaignId: id, status: "pending" } }), db.cmsCampaignRecipient.count({ where: { campaignId: id, status: "failed" } })]);
  await db.$transaction(async tx => {
    await tx.cmsCampaign.update({ where: { id }, data: remaining ? { status: "sending" } : { status: totalFailed ? "failed" : "sent", sentAt: totalFailed ? null : new Date() } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.CAMPAIGN_SENT, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_campaign", resourceId: id, outcome: failed ? "FAILURE" : "SUCCESS", afterState: JSON.stringify({ sent, failed }) } });
  });
  return NextResponse.json({ sent, failed, remaining }, { status: remaining ? 202 : failed ? 207 : 200 });
}
