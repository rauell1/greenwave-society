import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPublicImagePlacements, getAvailableCmsImages, saveImagePlacements, DEFAULT_PLACEMENTS } from "@/lib/cms/placements";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";
import { IMAGE_SRC_HINT, isAllowedImageSrc } from "@/lib/media/image-src";

export async function GET() {
  const auth = await authorizeRoute(PERMISSIONS.CONTENT_READ);
  if (!auth.ok) return auth.response;

  const [currentPlacements, availableImages] = await Promise.all([
    getPublicImagePlacements(),
    getAvailableCmsImages(),
  ]);

  return NextResponse.json({
    placements: currentPlacements,
    defaultPlacements: DEFAULT_PLACEMENTS,
    availableImages,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.CONTENT_UPDATE);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { placements } = body as { placements: Record<string, { src: string; alt: string }> };

    if (!placements || typeof placements !== "object") {
      return NextResponse.json({ error: "Invalid placements object" }, { status: 400 });
    }

    // An image from a host next/image cannot load breaks every page that shows the slot.
    // Slots whose default is empty (team photos) may be cleared to fall back to initials.
    const invalid = Object.entries(placements).filter(([key, value]) => {
      if (typeof value?.src !== "string" || typeof value.alt !== "string") return true;
      const src = value.src.trim();
      return src ? !isAllowedImageSrc(src) : DEFAULT_PLACEMENTS[key]?.src !== "";
    });
    if (invalid.length) {
      return NextResponse.json({ error: `These images cannot be used: ${invalid.map(([key]) => key).join(", ")}. ${IMAGE_SRC_HINT}` }, { status: 400 });
    }

    const saved = await saveImagePlacements(placements, auth.admin.id);

    await logAuditEvent({
      action: AUDIT_ACTIONS.CONTENT_UPDATED,
      actor: auth.admin.email || "Admin",
      actorUserId: auth.admin.id,
      resourceType: "cms_content",
      resourceId: saved.id,
      outcome: "SUCCESS",
      detail: `Updated frontend image placements: ${Object.keys(placements).join(", ")}`,
    });

    return NextResponse.json({ ok: true, saved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update image placements", details: String(error) }, { status: 500 });
  }
}
