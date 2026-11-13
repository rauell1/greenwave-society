// Hosts that next.config.ts lets next/image load. An image URL from any other host makes the
// public page that renders it fail, so CMS image fields are checked against this list on save.
const ALLOWED_IMAGE_HOSTS = ["cdn.greenwavesociety.org", "images.unsplash.com", "lh3.googleusercontent.com", "ui-avatars.com"];
const ALLOWED_IMAGE_HOST_SUFFIXES = [".public.blob.vercel-storage.com"];

export const IMAGE_SRC_HINT = "Use an image from the Media library (copy its link), a site path such as /images/photo.jpg, or a cdn.greenwavesociety.org link.";

export function isAllowedImageSrc(value: string): boolean {
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return true;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  return ALLOWED_IMAGE_HOSTS.includes(url.hostname) || ALLOWED_IMAGE_HOST_SUFFIXES.some(suffix => url.hostname.endsWith(suffix));
}
