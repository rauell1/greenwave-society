import { NextRequest } from "next/server";
import { getObject, objectStorageConfigured } from "@/lib/object-storage";

/**
 * Serves CMS media from the private object-storage bucket on the site's own
 * domain. Media was public in Vercel Blob, so it stays public here; only keys
 * under media/ are reachable, and responses are cached as immutable because
 * every upload gets a new unique pathname.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.map(decodeURIComponent).join("/");
  if (!key.startsWith("media/") || key.split("/").some(part => !part || part === "." || part === "..")) {
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
