import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

const schema = z.object({ status: z.enum(["review", "published", "archived"]) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const permission = parsed.data.status === "published" ? PERMISSIONS.CONTENT_PUBLISH : parsed.data.status === "archived" ? PERMISSIONS.CONTENT_ARCHIVE : PERMISSIONS.CONTENT_REVIEW;
  const admin = await requirePermission(permission);
  const { id } = await params;
  const db = getDb();
  const before = await db.cmsContent.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const item = await db.cmsContent.update({ where: { id }, data: { status: parsed.data.status, publishedAt: parsed.data.status === "published" ? new Date() : before.publishedAt, updatedById: admin.id } });
  const action = parsed.data.status === "published" ? AUDIT_ACTIONS.CONTENT_PUBLISHED : parsed.data.status === "archived" ? AUDIT_ACTIONS.CONTENT_ARCHIVED : AUDIT_ACTIONS.CONTENT_UPDATED;
  await logAuditEvent({ action, actor: admin.email, actorUserId: admin.id, resourceType: "cms_content", resourceId: id, outcome: "SUCCESS", beforeState: { status: before.status }, afterState: { status: item.status } });
  return NextResponse.json({ item });
}
