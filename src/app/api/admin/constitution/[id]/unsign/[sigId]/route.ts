import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, isSuperAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; sigId: string }> }) {
  const { valid, email } = await getAdminSession();
  if (!valid || !isSuperAdmin(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
