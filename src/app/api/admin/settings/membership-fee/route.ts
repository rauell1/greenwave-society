import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { MEMBERSHIP_FEE_SETTING_KEY, getMembershipFeeKes } from "@/lib/payments/config";

// M-Pesa requires a positive whole-KES integer (no fractional amounts).
const bodySchema = z.object({ amountKes: z.number().int().positive().max(250_000) });

export async function PATCH(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.SETTINGS_MANAGE);
  if (!auth.ok) return auth.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "amountKes must be a positive whole number of KES (max 250,000)." }, { status: 400 });
  }

  const db = getDb();
  const before = await getMembershipFeeKes();

  await db.appSetting.upsert({
    where: { key: MEMBERSHIP_FEE_SETTING_KEY },
    create: {
      key: MEMBERSHIP_FEE_SETTING_KEY,
      value: String(parsed.data.amountKes),
      description: "Membership fee (KES) charged via M-Pesa on the join form.",
      updatedBy: auth.admin.email,
    },
    update: { value: String(parsed.data.amountKes), updatedBy: auth.admin.email },
  });

  await db.auditLog.create({
    data: {
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      actor: auth.admin.email,
      actorUserId: auth.admin.id,
      resourceType: "app_setting",
      resourceId: MEMBERSHIP_FEE_SETTING_KEY,
      outcome: "SUCCESS",
      beforeState: JSON.stringify({ amountKes: before }),
      afterState: JSON.stringify({ amountKes: parsed.data.amountKes }),
    },
  });

  return NextResponse.json({ amountKes: parsed.data.amountKes });
}
