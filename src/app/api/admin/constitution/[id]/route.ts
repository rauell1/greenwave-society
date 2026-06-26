import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, email } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = getDb();

  const version = await db.constitutionVersion.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.contentType !== undefined && { contentType: body.contentType }),
      ...(body.status !== undefined && { status: body.status }),
      updatedAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: { id: randomBytes(12).toString("hex"), action: "VERSION_UPDATED", actor: email ?? "unknown", detail: `Updated ${version.versionTag}` },
  });

  return NextResponse.json({ version });
}
