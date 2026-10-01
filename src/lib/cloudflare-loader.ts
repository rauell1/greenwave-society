'use client';

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [`width=${width}`, `format=auto`];
  if (quality) {
    params.push(`quality=${quality}`);
  }

  // Handle both relative paths (e.g. /images/...) and absolute CDN paths
  const path = src.startsWith('https://cdn.greenwavesociety.org') 
    ? src.replace('https://cdn.greenwavesociety.org', '')
    : src;

  // Cloudflare Image Resizing format
  return `https://cdn.greenwavesociety.org/cdn-cgi/image/${params.join(',')}${path.startsWith('/') ? '' : '/'}${path}`;
}
