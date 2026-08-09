import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { contentInputSchema, serializeMetadata } from "@/lib/cms/content";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

export async function GET(request: NextRequest) {
  await requirePermission(PERMISSIONS.CONTENT_READ);
  const status = request.nextUrl.searchParams.get("status");
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const items = await getDb().cmsContent.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: { id: true, type: true, slug: true, title: true, excerpt: true, status: true, version: true, publishedAt: true, updatedAt: true },
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const admin = await requirePermission(PERMISSIONS.CONTENT_CREATE);
  const parsed = contentInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid content", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const metadata = serializeMetadata(input.metadata);
  const item = await getDb().$transaction(async (tx) => {
    const created = await tx.cmsContent.create({ data: { ...input, excerpt: input.excerpt || null, metadata, createdById: admin.id, updatedById: admin.id } });
    await tx.cmsContentRevision.create({ data: { contentId: created.id, version: 1, title: created.title, excerpt: created.excerpt, body: created.body, metadata: created.metadata, status: created.status, createdById: admin.id } });
    return created;
  });
  await logAuditEvent({ action: AUDIT_ACTIONS.CONTENT_CREATED, actor: admin.email, actorUserId: admin.id, resourceType: "cms_content", resourceId: item.id, outcome: "SUCCESS", afterState: { type: item.type, slug: item.slug, title: item.title, status: item.status } });
  return NextResponse.json({ item }, { status: 201 });
}
