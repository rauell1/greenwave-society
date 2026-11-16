/**
 * Site photos (the /images/* paths used across the pages) are stored in the
 * object-storage bucket under the same "images/" keys, and served by
 * src/app/media-files/[...path]/route.ts.
 *
 * The Worker entry point (cloudflare-worker.ts) maps both ways a page asks for
 * a photo onto that route before Next.js sees the request:
 *
 *   /images/<path>                    plain <img> and CSS references
 *   /_next/image?url=/images/<path>   next/image, which on Workers can only
 *                                     read local files from the static assets
 *                                     (and does not resize without an Images
 *                                     binding, so the stored file is returned)
 *
 * Setting IMAGE_DELIVERY=cdn on the Worker turns this off again, so the
 * next.config.ts rewrite to IMAGE_CDN_ORIGIN is used instead.
 */

export const SITE_IMAGE_PREFIX = "images/";

/** "/images/a b/c.jpg" -> "/media-files/images/a%20b/c.jpg"; null when not a site photo. */
function routeForImagePath(decodedPath: string): string | null {
  if (!decodedPath.startsWith("/images/")) return null;
  const parts = decodedPath.slice(1).split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) return null;
  return `/media-files/${parts.map(encodeURIComponent).join("/")}`;
}

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/** The media-files path that serves this request's site photo, or null to leave the request alone. */
export function siteImageRoute(url: URL): string | null {
  if (url.pathname === "/_next/image") {
    const source = url.searchParams.get("url");
    return source ? routeForImagePath(source.split("?")[0]) : null;
  }
  if (url.pathname.startsWith("/images/")) {
    const decoded = url.pathname.split("/").map(safeDecode);
    if (decoded.some((part) => part === null)) return null;
    return routeForImagePath(decoded.join("/"));
  }
  return null;
}
