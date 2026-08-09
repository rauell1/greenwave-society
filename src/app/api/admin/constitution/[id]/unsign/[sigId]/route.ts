import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; sigId: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.ROLES_MANAGE);
  if (!auth.ok) return auth.response;
  const email = auth.admin.email;

  const { sigId } = await params;
  const db = getDb();

  const sig = await db.constitutionSignature.update({
    where: { id: sigId },
    data: { status: "pending", signedAt: null, rejectionReason: null, updatedAt: new Date() },
    include: { leader: true },
  });

  await db.auditLog.create({
    data: { id: randomBytes(12).toString("hex"), action: "SIGNATURE_UNSIGNED", actor: email ?? "unknown", detail: `Unsigned ${sig.leader.name} on ${sig.versionTag}` },
  });

  return NextResponse.json({ success: true });
}
