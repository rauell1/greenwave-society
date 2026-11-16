/**
 * One-time copy of media library files from Vercel Blob to object storage.
 *
 * GET  /api/admin/media/copy-from-blob - dry run: assets still on Vercel Blob
 * POST /api/admin/media/copy-from-blob - copies them and updates their links
 *
 * Each asset is downloaded from its public Blob URL and checked against the
 * SHA-256 checksum recorded at upload, stored under the same pathname, read
 * back to confirm its size, and only then is its URL switched to
 * /media-files/<pathname>, in the asset row and in any CMS content that
 * copied the old link. A file that fails stays on Blob and is reported.
 */

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { getDb } from "@/lib/db";
import { getObject, mediaFileUrl, objectStorageConfigured, putObject } from "@/lib/object-storage";

export const runtime = "nodejs";

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

async function pendingAssets() {
  const assets = await getDb().cmsMediaAsset.findMany({
    where: { url: { contains: BLOB_HOST_SUFFIX } },
    select: { id: true, pathname: true, url: true, contentType: true, size: true, checksum: true },
    orderBy: { createdAt: "asc" },
  });
  return assets.filter((asset) => isBlobUrl(asset.url));
}

export async function GET() {
  const auth = await authorizeRoute(PERMISSIONS.MEDIA_UPLOAD); if (!auth.ok) return auth.response;
  const assets = await pendingAssets();
  return NextResponse.json({
    remaining: assets.length,
    objectStorageConfigured: objectStorageConfigured(),
    assets: assets.map(({ id, pathname, size }) => ({ id, pathname, size })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const auth = await authorizeRoute(PERMISSIONS.MEDIA_UPLOAD); if (!auth.ok) return auth.response;
  if (!objectStorageConfigured()) return NextResponse.json({ error: "Object storage is not configured" }, { status: 503 });

  const db = getDb();
  const copied: { id: string; pathname: string; contentUpdated: number }[] = [];
  const failed: { id: string; pathname: string; reason: string }[] = [];

  for (const asset of await pendingAssets()) {
    const oldUrl = asset.url;
    try {
      const response = await fetch(oldUrl, { redirect: "error" });
      if (!response.ok) throw new Error(`download returned ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const checksum = createHash("sha256").update(bytes).digest("hex");
      if (checksum !== asset.checksum) throw new Error("downloaded file does not match its recorded checksum");

      await putObject(asset.pathname, bytes, asset.contentType);
      const stored = await getObject(asset.pathname);
      const storedSize = Number(stored?.headers.get("content-length") ?? -1);
      await stored?.body?.cancel();
      if (storedSize !== bytes.length) throw new Error(`stored copy has ${storedSize} of ${bytes.length} bytes`);

      const newUrl = mediaFileUrl(asset.pathname);
      const contentUpdated = await db.$transaction(async (tx) => {
        await tx.cmsMediaAsset.update({ where: { id: asset.id }, data: { url: newUrl, updatedById: auth.admin.id } });
        const changed = await tx.$executeRaw`UPDATE cms_content SET metadata = replace(metadata, ${oldUrl}, ${newUrl}) WHERE metadata LIKE ${"%" + oldUrl + "%"}`;
        await tx.auditLog.create({
          data: {
            action: AUDIT_ACTIONS.MEDIA_UPDATED,
            actor: auth.admin.email,
            actorUserId: auth.admin.id,
            resourceType: "cms_media_asset",
            resourceId: asset.id,
            outcome: "SUCCESS",
            beforeState: JSON.stringify({ url: oldUrl }),
            afterState: JSON.stringify({ url: newUrl, contentUpdated: changed }),
          },
        });
        return changed;
      });
      copied.push({ id: asset.id, pathname: asset.pathname, contentUpdated });
    } catch (error) {
      failed.push({ id: asset.id, pathname: asset.pathname, reason: String((error as Error).message).slice(0, 200) });
    }
  }

  if (copied.length) revalidatePath("/", "layout");
  return NextResponse.json({ copied, failed, remaining: (await pendingAssets()).length });
}
