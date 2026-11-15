import "server-only";

import { formatForMime, ImageSanitizeError, sanitizeImage } from "./image-sanitize";
import { UPLOAD_PRESETS, type UploadPreset } from "./upload-presets";

export interface StoredMedia {
  bytes: Buffer;
  contentType: string;
  width?: number;
  height?: number;
}

/** An upload that cannot be stored, with a message the uploader can act on. */
export class UploadRejectedError extends Error {}

/** Width and height from a GIF's logical screen descriptor. */
function gifSize(bytes: Uint8Array): { width: number; height: number } {
  const signature = String.fromCharCode(...bytes.subarray(0, 6));
  if (bytes.length < 10 || (signature !== "GIF87a" && signature !== "GIF89a")) throw new UploadRejectedError("The GIF file is corrupt.");
  return { width: bytes[6]! | (bytes[7]! << 8), height: bytes[8]! | (bytes[9]! << 8) };
}

/**
 * Prepares an uploaded file for storage.
 *
 * JPEG, PNG and WebP images arrive already scaled to the preset's box and,
 * in most browsers, converted to WebP (src/lib/media/prepare-upload.ts).
 * The server then rebuilds each file from its image data alone, dropping
 * EXIF (including GPS location), XMP, comments and any appended bytes, and
 * keeping only the camera orientation (src/lib/media/image-sanitize.ts).
 * Pixels are not decoded: on Cloudflare Workers a decode and re-encode of a
 * photo needs more memory than a Worker has. Images larger than the preset
 * allows are refused. GIFs (possibly animated) and PDFs are stored unchanged.
 */
export async function optimiseUpload(bytes: Uint8Array, contentType: string, preset: UploadPreset): Promise<StoredMedia> {
  if (contentType === "image/gif") {
    return { bytes: Buffer.from(bytes), contentType, ...gifSize(bytes) };
  }
  const format = formatForMime(contentType);
  if (!format) return { bytes: Buffer.from(bytes), contentType };
  let image;
  try {
    image = sanitizeImage(bytes, format);
  } catch (error) {
    if (error instanceof ImageSanitizeError) throw new UploadRejectedError(`The image could not be used: ${error.message}`);
    throw error;
  }
  const { maxWidth, maxHeight } = UPLOAD_PRESETS[preset];
  // One pixel of slack for rounding in the browser's resize.
  if (image.width > maxWidth + 1 || image.height > maxHeight + 1) {
    throw new UploadRejectedError(`The image is larger than ${maxWidth}×${maxHeight}px. Upload it through the media library, which resizes it, or scale it down first.`);
  }
  return { bytes: Buffer.from(image.bytes), contentType, width: image.width, height: image.height };
}
