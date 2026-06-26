import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  const { valid } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const versions = await db.constitutionVersion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { signatures: true } },
      signatures: { select: { status: true } },
    },
  });

  return NextResponse.json({ versions });
}

export async function POST(req: NextRequest) {
  const { valid, email } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { versionTag, title, content, contentType } = await req.json();
  if (!versionTag || !content) {
    return NextResponse.json({ error: "versionTag and content are required" }, { status: 400 });
  }

  const db = getDb();
  const id = randomBytes(12).toString("hex");
  const version = await db.constitutionVersion.create({
    data: { id, versionTag, title: title || "Executive Leadership Constitution", content, contentType: contentType || "html", status: "draft" },
  });

  await db.auditLog.create({
    data: { id: randomBytes(12).toString("hex"), action: "VERSION_CREATED", actor: email ?? "unknown", detail: `Created ${versionTag}` },
  });

  return NextResponse.json({ version });
}
