import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { campaignInputSchema } from "@/lib/communications/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.COMMUNICATIONS_CREATE); if (!auth.ok) return auth.response;
  const { id } = await params; const parsed = campaignInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
  const existing = await getDb().cmsCampaign.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "draft") return NextResponse.json({ error: "Only draft campaigns can be edited" }, { status: 409 });
  const updated = await getDb().$transaction(async tx => {
    const campaign = await tx.cmsCampaign.update({ where: { id }, data: { ...parsed.data, preheader: parsed.data.preheader || null, updatedById: auth.admin.id } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.CAMPAIGN_UPDATED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_campaign", resourceId: id, outcome: "SUCCESS", beforeState: JSON.stringify({ subject: existing.subject }), afterState: JSON.stringify({ subject: campaign.subject }) } });
    return campaign;
  });
  return NextResponse.json({ campaign: updated });
}
