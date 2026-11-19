import "server-only";

// The photo inventories are bundled at build time. Reading them from disk with
// node:fs at runtime fails on Cloudflare Workers (there is no project folder),
// which left the admin image pickers showing "Repo (0)".
import imageManifest from "../../../docs/image-manifest.json";
import graduationManifest from "../../../docs/graduation-photos-manifest.json";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { listObjectKeys, mediaFileUrl, objectStorageConfigured } from "@/lib/object-storage";
import { isAllowedImageSrc } from "@/lib/media/image-src";
import { SITE_IMAGE_PREFIX } from "@/lib/site-images";

/** Site photos in object storage, as "/images/<file>" paths with their filenames. */
export const REPO_IMAGES: { src: string; filename: string }[] = (imageManifest as string[]).map(file => ({
  src: `/images/${file}`,
  filename: file,
}));

/** Web-size copies of the graduation photos. */
export const GRADUATION_WEB_IMAGES: { src: string; filename: string }[] = (
  graduationManifest as { webUrl: string; filename: string }[]
).map(item => ({ src: item.webUrl, filename: item.filename }));

export interface LibraryPhoto {
  src: string;
  filename: string;
  /** "repo": a site photo under images/; "blob": an upload under media/. */
  source: "repo" | "blob";
}

const PHOTO_EXTENSION = /\.(jpe?g|png|webp|gif|avif)$/i;
// Graduation photos are stored three times (original, web, thumb); list the web copy only.
const DUPLICATE_SIZE_FOLDER = /(^|\/)(original|thumb)\//;

function fileName(key: string): string {
  return key.slice(key.lastIndexOf("/") + 1);
}

const OBJECT_LIST_TTL_MS = 5 * 60 * 1000;
let cachedBucketPhotos: { expiresAt: number; items: LibraryPhoto[] } | undefined;

async function listBucketPhotos(): Promise<LibraryPhoto[]> {
  if (!objectStorageConfigured()) return [];
  const now = Date.now();
  if (cachedBucketPhotos && cachedBucketPhotos.expiresAt > now) {
    return cachedBucketPhotos.items;
  }
  const items: LibraryPhoto[] = [];
  const [images, media] = await Promise.allSettled([listObjectKeys(SITE_IMAGE_PREFIX), listObjectKeys("media/")]);
  if (images.status === "fulfilled") {
    for (const key of images.value) {
      if (!PHOTO_EXTENSION.test(key) || DUPLICATE_SIZE_FOLDER.test(key)) continue;
      items.push({ src: `/${key}`, filename: fileName(key), source: "repo" });
    }
  } else {
    logger.warn("Could not list site photos in object storage", { err: String(images.reason) });
  }
  if (media.status === "fulfilled") {
    for (const key of media.value) {
      if (!PHOTO_EXTENSION.test(key)) continue;
      items.push({ src: mediaFileUrl(key), filename: fileName(key), source: "blob" });
    }
  } else {
    logger.warn("Could not list uploads in object storage", { err: String(media.reason) });
  }
  if (images.status === "fulfilled" || media.status === "fulfilled") {
    cachedBucketPhotos = { expiresAt: now + OBJECT_LIST_TTL_MS, items };
  }
  return items;
}

/**
 * Every photo the admin pickers can offer: everything in the storage bucket
 * under images/ and media/ (cached for 5 minutes), every upload recorded in
 * the media library, and the bundled manifest (used when the bucket cannot be listed).
 */
export async function listAllPhotos(): Promise<LibraryPhoto[]> {
  const map = new Map<string, LibraryPhoto>();

  for (const { src, filename } of REPO_IMAGES) map.set(src, { src, filename, source: "repo" });

  for (const item of await listBucketPhotos()) {
    if (!map.has(item.src)) map.set(item.src, item);
  }

  // Uploads recorded in the media library keep their original filenames.
  try {
    const assets = await getDb().cmsMediaAsset.findMany({
      where: { status: "active", contentType: { startsWith: "image/" } },
      select: { url: true, filename: true },
      take: 5000,
      orderBy: { createdAt: "desc" },
    });
    for (const asset of assets) {
      if (isAllowedImageSrc(asset.url)) {
        map.set(asset.url, { src: asset.url, filename: asset.filename, source: "blob" });
      }
    }
  } catch (err) {
    logger.warn("Could not query cmsMediaAsset for the photo library", { err: String(err) });
  }

  return Array.from(map.values());
}
