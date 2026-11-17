import "server-only";

// The photo inventories are bundled at build time. Reading them from disk with
// node:fs at runtime fails on Cloudflare Workers (there is no project folder),
// which left the admin image pickers showing "Repo (0)".
import imageManifest from "../../../docs/image-manifest.json";
import graduationManifest from "../../../docs/graduation-photos-manifest.json";

/** Site photos in object storage, as "/images/<file>" paths with their filenames. */
export const REPO_IMAGES: { src: string; filename: string }[] = (imageManifest as string[]).map(file => ({
  src: `/images/${file}`,
  filename: file,
}));

/** Web-size copies of the graduation photos. */
export const GRADUATION_WEB_IMAGES: { src: string; filename: string }[] = (
  graduationManifest as { webUrl: string; filename: string }[]
).map(item => ({ src: item.webUrl, filename: item.filename }));
