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
 * Absolute photo URLs (page metadata, the graduation album manifest) use
 * https://greenwavesociety.org/images/...; next/image requests for those are
 * mapped the same way, so the Worker never fetches itself.
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

/**
 * Hosts whose /images/* are the site photos: the site itself, and the former
 * image CDN for any link that still names it.
 */
export const SITE_IMAGE_HOSTS = new Set(["greenwavesociety.org", "www.greenwavesociety.org", "cdn.greenwavesociety.org"]);

/** "/images/x" or "https://cdn.greenwavesociety.org/images/x" -> "/images/x"; null otherwise. */
function imagePathOfSource(source: string): string | null {
  if (source.startsWith("/")) return source.split("?")[0];
  try {
    const url = new URL(source);
    return url.protocol === "https:" && SITE_IMAGE_HOSTS.has(url.hostname) ? decodeURIComponent(url.pathname) : null;
  } catch {
    return null;
  }
}

/**
 * "/media-files/media/a%20b.webp" (an upload from the media library) or
 * "/media-files/images/g-12.jpg" -> the same path, normalised; null otherwise.
 * next/image on Workers cannot fetch these from the static assets, so they are
 * served from object storage like the site photos.
 */
function routeForMediaFilesPath(rawPath: string): string | null {
  if (!rawPath.startsWith("/media-files/")) return null;
  const parts = rawPath.slice("/media-files/".length).split("/").map(safeDecode);
  if (parts.length < 2 || parts.some((part) => !part || part === "." || part === ".." || part.includes("/"))) return null;
  if (parts[0] !== "media" && parts[0] !== "images") return null;
  return `/media-files/${(parts as string[]).map(encodeURIComponent).join("/")}`;
}

/** The media-files path that serves this request's site photo, or null to leave the request alone. */
export function siteImageRoute(url: URL): string | null {
  if (url.pathname === "/_next/image") {
    const source = url.searchParams.get("url");
    if (!source) return null;
    if (source.startsWith("/media-files/")) return routeForMediaFilesPath(source.split("?")[0]);
    const imagePath = imagePathOfSource(source);
    if (imagePath?.startsWith("/media-files/")) return routeForMediaFilesPath(encodeURI(imagePath));
    return imagePath ? routeForImagePath(imagePath) : null;
  }
  if (url.pathname.startsWith("/images/")) {
    const decoded = url.pathname.split("/").map(safeDecode);
    if (decoded.some((part) => part === null)) return null;
    return routeForImagePath(decoded.join("/"));
  }
  return null;
}

/** A site photo to read from object storage, with the size next/image asked for. */
export interface StoredImageRequest {
  /** Object key, e.g. "images/events/a b.jpg". */
  key: string;
  /** Width in pixels for /_next/image requests; null for the original file. */
  width: number | null;
  quality: number;
}

/**
 * What cloudflare-worker.ts serves straight from object storage for this
 * request, or null to pass it on to Next.js. next/image's w and q are kept so
 * the Worker can return a resized copy instead of the full photo.
 */
export function storedImageRequest(url: URL): StoredImageRequest | null {
  const route = siteImageRoute(url);
  if (!route) return null;
  const key = route.slice("/media-files/".length).split("/").map(decodeURIComponent).join("/");
  if (url.pathname !== "/_next/image") return { key, width: null, quality: 75 };
  const width = Number(url.searchParams.get("w"));
  const quality = Number(url.searchParams.get("q"));
  return {
    key,
    width: Number.isInteger(width) && width > 0 && width <= 3840 ? width : null,
    quality: Number.isInteger(quality) && quality > 0 && quality <= 100 ? quality : 75,
  };
}
