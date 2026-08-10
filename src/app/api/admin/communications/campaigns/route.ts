import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { campaignInputSchema } from "@/lib/communications/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function GET() {
  const auth = await authorizeRoute(PERMISSIONS.COMMUNICATIONS_READ); if (!auth.ok) return auth.response;
  const campaigns = await getDb().cmsCampaign.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { recipients: true } } } });
  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.COMMUNICATIONS_CREATE); if (!auth.ok) return auth.response;
  const parsed = campaignInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid campaign", issues: parsed.error.flatten() }, { status: 400 });
  const campaign = await getDb().$transaction(async tx => {
    const created = await tx.cmsCampaign.create({ data: { ...parsed.data, preheader: parsed.data.preheader || null, createdById: auth.admin.id, updatedById: auth.admin.id } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.CAMPAIGN_CREATED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_campaign", resourceId: created.id, outcome: "SUCCESS", afterState: JSON.stringify({ name: created.name, subject: created.subject, status: created.status }) } });
    return created;
  });
  return NextResponse.json({ campaign: { id: campaign.id, name: campaign.name, status: campaign.status } }, { status: 201 });
}
