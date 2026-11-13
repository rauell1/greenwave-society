import "server-only";

import sharp from "sharp";
import { UPLOAD_PRESETS, WEBP_QUALITY, type UploadPreset } from "./upload-presets";

const OPTIMISABLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface StoredMedia {
  bytes: Buffer;
  contentType: string;
  width?: number;
  height?: number;
}

/**
 * Prepares an uploaded file for storage. JPEG, PNG and WebP images are turned upright from their
 * camera orientation, scaled down to fit the preset's box, stripped of EXIF metadata (including
 * GPS location) and saved as WebP. GIFs (possibly animated) and PDFs are stored unchanged.
 * Throws when an image cannot be decoded.
 */
export async function optimiseUpload(bytes: Uint8Array, contentType: string, preset: UploadPreset): Promise<StoredMedia> {
  const input = { limitInputPixels: 40_000_000 };
  if (contentType === "image/gif") {
    const metadata = await sharp(bytes, { ...input, animated: false }).metadata();
    return { bytes: Buffer.from(bytes), contentType, width: metadata.width, height: metadata.height };
  }
  if (!OPTIMISABLE_TYPES.includes(contentType)) return { bytes: Buffer.from(bytes), contentType };
  const { maxWidth, maxHeight } = UPLOAD_PRESETS[preset];
  const { data, info } = await sharp(bytes, input)
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return { bytes: data, contentType: "image/webp", width: info.width, height: info.height };
}
