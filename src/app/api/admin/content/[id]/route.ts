import { revalidatePublicContent } from "@/lib/cms/revalidate";
import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { contentInputSchema, serializeMetadata } from "@/lib/cms/content";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.CONTENT_READ);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const item = await getDb().cmsContent.findUnique({ where: { id }, include: { revisions: { orderBy: { version: "desc" }, take: 20, select: { id: true, version: true, status: true, createdAt: true } } } });
  return item ? NextResponse.json({ item }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.CONTENT_UPDATE);
  if (!auth.ok) return auth.response;
  const admin = auth.admin;
  const { id } = await params;
  const parsed = contentInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid content", issues: parsed.error.flatten() }, { status: 400 });
  const db = getDb();
  const before = await db.cmsContent.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const input = parsed.data;
  const nextVersion = before.version + 1;
  const metadata = serializeMetadata(input.metadata);
  const item = await db.$transaction(async (tx) => {
    const updated = await tx.cmsContent.update({ where: { id }, data: { ...input, excerpt: input.excerpt || null, metadata, version: nextVersion, updatedById: admin.id } });
    await tx.cmsContentRevision.create({ data: { contentId: id, version: nextVersion, title: updated.title, excerpt: updated.excerpt, body: updated.body, metadata: updated.metadata, status: updated.status, createdById: admin.id } });
    return updated;
  });
  await logAuditEvent({ action: AUDIT_ACTIONS.CONTENT_UPDATED, actor: admin.email, actorUserId: admin.id, resourceType: "cms_content", resourceId: id, outcome: "SUCCESS", beforeState: { version: before.version, title: before.title, status: before.status }, afterState: { version: item.version, title: item.title, status: item.status } });
  revalidatePublicContent(item.slug);
  if (before.slug !== item.slug) revalidatePublicContent(before.slug);
  return NextResponse.json({ item });
}
