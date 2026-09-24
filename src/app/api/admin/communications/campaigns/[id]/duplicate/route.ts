import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.COMMUNICATIONS_CREATE); 
  if (!auth.ok) return auth.response;

  const { id } = await params; 
  
  const existing = await getDb().cmsCampaign.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const newId = randomBytes(12).toString("hex");
  
  const duplicated = await getDb().$transaction(async tx => {
    const campaign = await tx.cmsCampaign.create({
      data: {
        id: newId,
        name: `${existing.name} (Copy)`,
        subject: existing.subject,
        preheader: existing.preheader,
        eyebrow: existing.eyebrow,
        htmlBody: existing.htmlBody,
        status: "draft",
        createdById: auth.admin.id,
        updatedById: auth.admin.id,
      }
    });

    await tx.auditLog.create({ 
      data: { 
        action: AUDIT_ACTIONS.CAMPAIGN_CREATED, 
        actor: auth.admin.email, 
        actorUserId: auth.admin.id, 
        resourceType: "cms_campaign", 
        resourceId: newId, 
        outcome: "SUCCESS", 
        detail: `Duplicated from ${id}` 
      } 
    });

    return campaign;
  });

  return NextResponse.json({ campaign: duplicated });
}
