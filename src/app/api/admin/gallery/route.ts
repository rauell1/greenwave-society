import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAdminGalleryConfig, saveAdminGalleryConfig, type CuratedGalleryItem } from "@/lib/cms/gallery";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

export async function GET() {
  const auth = await authorizeRoute(PERMISSIONS.CONTENT_READ);
  if (!auth.ok) return auth.response;

  const data = await getAdminGalleryConfig();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.CONTENT_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { images } = body as { images: CuratedGalleryItem[] };

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid images array" }, { status: 400 });
    }

    const saved = await saveAdminGalleryConfig(images, auth.admin.id);
    const activeCount = images.filter(i => i.active !== false).length;

    await logAuditEvent({
      action: AUDIT_ACTIONS.CONTENT_UPDATED,
      actor: auth.admin.email || "Admin",
      actorUserId: auth.admin.id,
      resourceType: "cms_content",
      resourceId: saved.id,
      outcome: "SUCCESS",
      detail: `Curated public gallery updated with ${activeCount} active photos`,
    });

    return NextResponse.json({ ok: true, saved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update gallery selection", details: String(error) }, { status: 500 });
  }
}
