import { NextRequest } from "next/server";
import { getObject, objectStorageConfigured } from "@/lib/object-storage";
import { SITE_IMAGE_PREFIX } from "@/lib/site-images";

/**
 * Serves CMS media and site photos from the private object-storage bucket on
 * the site's own domain. Media was public in Vercel Blob, so it stays public
 * here; only keys under media/ and images/ (see src/lib/site-images.ts) are
 * reachable. Responses are cached as immutable: every upload gets a new unique
 * pathname, and site photos get a new filename when replaced
 * (docs/image-delivery.md).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.map(decodeURIComponent).join("/");
  if (!(key.startsWith("media/") || key.startsWith(SITE_IMAGE_PREFIX)) || key.split("/").some(part => !part || part === "." || part === "..")) {
    return new Response("Not found", { status: 404 });
  }
  if (!objectStorageConfigured()) return new Response("Media storage is not configured", { status: 503 });
  const object = await getObject(key).catch(() => null);
  if (!object?.body) return new Response("Not found", { status: 404 });
  const length = object.headers.get("content-length");
  return new Response(object.body, {
    headers: {
      "Content-Type": object.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(length ? { "Content-Length": length } : {}),
    },
  });
}
