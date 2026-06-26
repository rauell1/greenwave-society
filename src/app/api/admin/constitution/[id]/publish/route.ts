import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { sendSigningEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, email } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const version = await db.constitutionVersion.findUnique({ where: { id } });
  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });
  if (version.status === "archived") return NextResponse.json({ error: "Cannot publish archived version" }, { status: 400 });

  await db.constitutionVersion.updateMany({
    where: { status: "published", id: { not: id } },
    data: { status: "archived" },
  });

  await db.constitutionVersion.update({
    where: { id },
    data: { status: "published", publishedAt: new Date(), updatedAt: new Date() },
  });

  const leaders = await db.executiveLeader.findMany();
  const results: { name: string; status: string }[] = [];

  for (const leader of leaders) {
    const existing = await db.constitutionSignature.findFirst({
      where: { leaderId: leader.id, versionId: id },
    });
    if (existing) { results.push({ name: leader.name, status: "already_exists" }); continue; }

    const token = randomBytes(32).toString("hex");
    const sig = await db.constitutionSignature.create({
      data: { id: randomBytes(12).toString("hex"), leaderId: leader.id, versionId: id, versionTag: version.versionTag, status: "pending", token },
    });

    const sent = await sendSigningEmail({ to: leader.email, name: leader.name, role: leader.role, token });
    await db.constitutionSignature.update({ where: { id: sig.id }, data: { emailSentAt: sent ? new Date() : undefined } });
    results.push({ name: leader.name, status: sent ? "invited" : "created_no_email" });
  }

  await db.auditLog.create({
    data: { id: randomBytes(12).toString("hex"), action: "VERSION_PUBLISHED", actor: email ?? "unknown", detail: `Published ${version.versionTag}` },
  });

  return NextResponse.json({ success: true, versionTag: version.versionTag, results });
}
