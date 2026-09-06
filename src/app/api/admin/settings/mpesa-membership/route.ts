import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { MPESA_MEMBERSHIP_FLAG_KEY } from "@/lib/payments/feature-flag";

const bodySchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.SETTINGS_MANAGE);
  if (!auth.ok) return auth.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const db = getDb();
  const before = await db.cmsFeatureFlag.findUnique({ where: { key: MPESA_MEMBERSHIP_FLAG_KEY } });

  const flag = await db.cmsFeatureFlag.upsert({
    where: { key: MPESA_MEMBERSHIP_FLAG_KEY },
    create: {
      key: MPESA_MEMBERSHIP_FLAG_KEY,
      enabled: parsed.data.enabled,
      description: "M-Pesa membership fee on the join form — auto-approves on successful payment.",
      updatedBy: auth.admin.email,
    },
    update: { enabled: parsed.data.enabled, updatedBy: auth.admin.email },
  });

  await db.auditLog.create({
    data: {
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      actor: auth.admin.email,
      actorUserId: auth.admin.id,
      resourceType: "cms_feature_flag",
      resourceId: MPESA_MEMBERSHIP_FLAG_KEY,
      outcome: "SUCCESS",
      beforeState: JSON.stringify({ enabled: before?.enabled ?? false }),
      afterState: JSON.stringify({ enabled: flag.enabled }),
    },
  });

  return NextResponse.json({ enabled: flag.enabled });
}
