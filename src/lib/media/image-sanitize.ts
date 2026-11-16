/**
 * Lossless image sanitising, with no pixel decoding.
 *
 * Each upload is rebuilt from an allow list of the structures a browser needs
 * to draw it: the compressed image data, its colour profile and, for JPEG, the
 * tables that decode it. Everything else is dropped, including EXIF and XMP
 * (GPS position, camera serial numbers, capture times), IPTC, comments, PNG
 * text chunks and any bytes after the end of the image. The camera orientation
 * is kept as a minimal EXIF block holding only that value, so photos still
 * display upright.
 *
 * Nothing is decoded, so this runs in a few milliseconds and needs only a
 * copy of the file: it fits comfortably in a Cloudflare Worker, where a
 * decode and re-encode of a phone photo does not (it needs several hundred
 * MB). Photos are scaled down and converted to WebP in the browser before
 * upload instead (src/lib/media/prepare-upload.ts).
 *
 * Pure TypeScript with no Node APIs: the header reader also runs in the
 * browser.
 */

export type ImageFormat = "jpeg" | "png" | "webp";

/** Images above this many pixels are refused (about 8000 by 5000). */
export const MAX_IMAGE_PIXELS = 40_000_000;

export class ImageSanitizeError extends Error {}

export interface ImageHeader {
  format: ImageFormat;
  /** Stored pixel size, before orientation is applied. */
  width: number;
  height: number;
  /** EXIF orientation, 1 to 8 (1 is upright). */
  orientation: number;
}

export interface SanitizedImage {
  bytes: Uint8Array;
  /** Displayed size, with orientation applied. */
  width: number;
  height: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function at(bytes: ArrayLike<number>, index: number): number {
  return bytes[index] ?? 0;
}

function fail(message: string): never {
  throw new ImageSanitizeError(message);
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u32be(value: number): Uint8Array {
  return new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);
}

function u32le(value: number): Uint8Array {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = at(CRC_TABLE, (c ^ at(bytes, i)) & 0xff) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Orientation from a TIFF block (the body of an EXIF segment or chunk). */
function tiffOrientation(tiff: Uint8Array): number {
  if (tiff.length < 8) return 1;
  const little = at(tiff, 0) === 0x49 && at(tiff, 1) === 0x49;
  if (!little && !(at(tiff, 0) === 0x4d && at(tiff, 1) === 0x4d)) return 1;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const ifd = view.getUint32(4, little);
  if (ifd + 2 > tiff.length) return 1;
  const entries = view.getUint16(ifd, little);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > tiff.length) break;
    if (view.getUint16(entry, little) === 0x0112) {
      const value = view.getUint16(entry + 8, little);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

/** A TIFF block holding only the orientation tag. */
function orientationTiff(orientation: number): Uint8Array {
  return new Uint8Array([
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // big endian, first IFD at 8
    0x00, 0x01, // one entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, // Orientation, SHORT, count 1
    0x00, orientation, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ]);
}

function displaySize(header: ImageHeader): { width: number; height: number } {
  return header.orientation >= 5
    ? { width: header.height, height: header.width }
    : { width: header.width, height: header.height };
}

function checkPixels(width: number, height: number) {
  if (!width || !height) fail("The image has no size.");
  if (width * height > MAX_IMAGE_PIXELS) fail("The image has too many pixels.");
}

/* ------------------------------------------------------------------ */
/* JPEG                                                               */
/* ------------------------------------------------------------------ */

interface JpegSegment { marker: number; start: number; end: number }

/** Baseline, extended and progressive Huffman JPEG: what browsers draw. */
const JPEG_FRAMES = new Set([0xc0, 0xc1, 0xc2]);
/** Tables and markers needed to decode the image. */
const JPEG_KEEP = new Set([0xc4, 0xdb, 0xdd, 0xdc]);

function parseJpeg(bytes: Uint8Array) {
  if (bytes.length < 4 || at(bytes, 0) !== 0xff || at(bytes, 1) !== 0xd8) fail("Not a JPEG.");
  const segments: JpegSegment[] = [];
  let width = 0;
  let height = 0;
  let orientation = 1;
  let offset = 2;
  let ended = false;
  while (offset < bytes.length) {
    if (at(bytes, offset) !== 0xff) fail("Corrupt JPEG.");
    const marker = at(bytes, offset + 1);
    if (marker === 0xff) { offset += 1; continue; } // fill byte
    if (marker === 0xd9) { ended = true; break; }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) fail("Corrupt JPEG.");
    if (offset + 4 > bytes.length) fail("Truncated JPEG.");
    const length = (at(bytes, offset + 2) << 8) | at(bytes, offset + 3);
    let end = offset + 2 + length;
    if (length < 2 || end > bytes.length) fail("Truncated JPEG.");

    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      if (!JPEG_FRAMES.has(marker)) fail("This JPEG encoding is not supported by browsers.");
      if (width) fail("Corrupt JPEG.");
      if (length < 8) fail("Corrupt JPEG.");
      height = (at(bytes, offset + 5) << 8) | at(bytes, offset + 6);
      width = (at(bytes, offset + 7) << 8) | at(bytes, offset + 8);
    }
    if (marker === 0xe1 && ascii(bytes, offset + 4, 6) === "Exif\0\0") {
      orientation = tiffOrientation(bytes.subarray(offset + 10, end));
    }
    if (marker === 0xda) {
      if (!width) fail("Corrupt JPEG.");
      // Entropy-coded data runs to the next marker that is not a stuffed
      // zero byte, a restart marker or a fill byte.
      let i = end;
      for (;;) {
        if (i + 1 >= bytes.length) fail("Truncated JPEG.");
        if (at(bytes, i) !== 0xff) { i++; continue; }
        const next = at(bytes, i + 1);
        if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) { i += 2; continue; }
        if (next === 0xff) { i++; continue; }
        break;
      }
      end = i;
    }
    segments.push({ marker, start: offset, end });
    offset = end;
  }
  if (!ended) fail("Truncated JPEG.");
  return { segments, header: { format: "jpeg" as const, width, height, orientation } };
}

function keepJpegSegment(bytes: Uint8Array, segment: JpegSegment): boolean {
  const { marker, start } = segment;
  if (marker === 0xda || JPEG_KEEP.has(marker)) return true;
  if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc8) return true; // frame, DHT, DAC
  const id = (length: number) => ascii(bytes, start + 4, length);
  if (marker === 0xe0) return id(5) === "JFIF\0" || id(5) === "JFXX\0";
  if (marker === 0xe2) return id(12) === "ICC_PROFILE\0"; // colour profile
  if (marker === 0xee) return id(5) === "Adobe"; // colour transform flag
  return false; // EXIF, XMP, IPTC, comments and every other application segment
}

function sanitizeJpeg(bytes: Uint8Array): SanitizedImage {
  const { segments, header } = parseJpeg(bytes);
  checkPixels(header.width, header.height);
  const parts: Uint8Array[] = [new Uint8Array([0xff, 0xd8])];
  let orientationWritten = header.orientation === 1;
  const writeOrientation = () => {
    if (orientationWritten) return;
    const body = concat([new TextEncoder().encode("Exif\0\0"), orientationTiff(header.orientation)]);
    parts.push(new Uint8Array([0xff, 0xe1, ((body.length + 2) >> 8) & 255, (body.length + 2) & 255]), body);
    orientationWritten = true;
  };
  for (const segment of segments) {
    if (!keepJpegSegment(bytes, segment)) continue;
    // EXIF goes after the JFIF header when there is one, else first.
    if (segment.marker !== 0xe0) writeOrientation();
    parts.push(bytes.subarray(segment.start, segment.end));
    if (segment.marker === 0xe0) writeOrientation();
  }
  parts.push(new Uint8Array([0xff, 0xd9]));
  return { bytes: concat(parts), ...displaySize(header) };
}

/* ------------------------------------------------------------------ */
/* PNG                                                                */
/* ------------------------------------------------------------------ */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PNG_CRITICAL = new Set(["IHDR", "PLTE", "IDAT", "IEND"]);
/** Ancillary chunks that affect how the pixels look. */
const PNG_KEEP = new Set(["tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "sBIT", "pHYs", "cICP", "mDCV", "cLLI"]);

interface PngChunk { type: string; start: number; end: number }

function parsePng(bytes: Uint8Array) {
  if (bytes.length < 33 || PNG_SIGNATURE.some((value, i) => at(bytes, i) !== value)) fail("Not a PNG.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: PngChunk[] = [];
  let width = 0;
  let height = 0;
  let orientation = 1;
  let offset = 8;
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    const end = offset + 12 + length;
    if (!/^[A-Za-z]{4}$/.test(type)) fail("Corrupt PNG.");
    if (end > bytes.length) fail("Truncated PNG.");
    if (view.getUint32(offset + 8 + length) !== crc32(bytes.subarray(offset + 4, offset + 8 + length))) {
      fail("Corrupt PNG.");
    }
    if (chunks.length === 0 && type !== "IHDR") fail("Corrupt PNG.");
    if (type === "IHDR") {
      if (chunks.length !== 0 || length !== 13) fail("Corrupt PNG.");
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
    }
    if (type === "acTL" || type === "fcTL" || type === "fdAT") fail("Animated images are not supported.");
    // An unknown chunk with an upper-case first letter is critical: a
    // decoder that does not understand it must refuse the file.
    if (/^[A-Z]/.test(type) && !PNG_CRITICAL.has(type)) fail("Unsupported PNG.");
    if (type === "eXIf") orientation = tiffOrientation(bytes.subarray(offset + 8, offset + 8 + length));
    chunks.push({ type, start: offset, end });
    offset = end;
    if (type === "IEND") { ended = true; break; }
  }
  if (!ended || !chunks.some((chunk) => chunk.type === "IDAT")) fail("Truncated PNG.");
  return { chunks, header: { format: "png" as const, width, height, orientation } };
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typed = concat([new TextEncoder().encode(type), data]);
  return concat([u32be(data.length), typed, u32be(crc32(typed))]);
}

function sanitizePng(bytes: Uint8Array): SanitizedImage {
  const { chunks, header } = parsePng(bytes);
  checkPixels(header.width, header.height);
  const parts: Uint8Array[] = [new Uint8Array(PNG_SIGNATURE)];
  let orientationWritten = header.orientation === 1;
  for (const chunk of chunks) {
    if (!PNG_CRITICAL.has(chunk.type) && !PNG_KEEP.has(chunk.type)) continue;
    if (chunk.type === "IDAT" && !orientationWritten) {
      parts.push(pngChunk("eXIf", orientationTiff(header.orientation)));
      orientationWritten = true;
    }
    parts.push(bytes.subarray(chunk.start, chunk.end));
  }
  return { bytes: concat(parts), ...displaySize(header) };
}

/* ------------------------------------------------------------------ */
/* WebP                                                               */
/* ------------------------------------------------------------------ */

interface WebpChunk { type: string; start: number; body: number; length: number }

function parseWebp(bytes: Uint8Array) {
  if (bytes.length < 20 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") fail("Not a WebP image.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const riffEnd = 8 + view.getUint32(4, true);
  if (riffEnd > bytes.length) fail("Truncated WebP.");
  const chunks: WebpChunk[] = [];
  let width = 0;
  let height = 0;
  let orientation = 1;
  let hasImage = false;
  let offset = 12;
  while (offset + 8 <= riffEnd) {
    const type = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (body + length > riffEnd) fail("Truncated WebP.");
    if (type === "ANIM" || type === "ANMF") fail("Animated images are not supported.");
    if (type === "VP8X") {
      if (chunks.length !== 0 || length < 10) fail("Corrupt WebP.");
      if (at(bytes, body) & 0x02) fail("Animated images are not supported.");
      width = 1 + (at(bytes, body + 4) | (at(bytes, body + 5) << 8) | (at(bytes, body + 6) << 16));
      height = 1 + (at(bytes, body + 7) | (at(bytes, body + 8) << 8) | (at(bytes, body + 9) << 16));
    } else if (type === "VP8 ") {
      if (hasImage || length < 10 || at(bytes, body + 3) !== 0x9d || at(bytes, body + 4) !== 0x01 || at(bytes, body + 5) !== 0x2a) {
        fail("Corrupt WebP.");
      }
      if (!width) {
        width = view.getUint16(body + 6, true) & 0x3fff;
        height = view.getUint16(body + 8, true) & 0x3fff;
      }
      hasImage = true;
    } else if (type === "VP8L") {
      if (hasImage || length < 5 || at(bytes, body) !== 0x2f) fail("Corrupt WebP.");
      if (!width) {
        const bits = view.getUint32(body + 1, true);
        width = (bits & 0x3fff) + 1;
        height = ((bits >> 14) & 0x3fff) + 1;
      }
      hasImage = true;
    } else if (type === "EXIF") {
      const exif = bytes.subarray(body, body + length);
      // Some writers keep the JPEG-style "Exif\0\0" prefix.
      orientation = tiffOrientation(ascii(exif, 0, 6) === "Exif\0\0" ? exif.subarray(6) : exif);
    }
    chunks.push({ type, start: offset, body, length });
    offset = body + length + (length & 1);
  }
  if (!hasImage) fail("Corrupt WebP.");
  return { chunks, header: { format: "webp" as const, width, height, orientation } };
}

function webpChunk(type: string, data: Uint8Array): Uint8Array {
  const parts = [new TextEncoder().encode(type), u32le(data.length), data];
  if (data.length & 1) parts.push(new Uint8Array([0]));
  return concat(parts);
}

function sanitizeWebp(bytes: Uint8Array): SanitizedImage {
  const { chunks, header } = parseWebp(bytes);
  checkPixels(header.width, header.height);
  const keep = new Set(["VP8X", "ICCP", "ALPH", "VP8 ", "VP8L"]);
  const kept = chunks.filter((chunk) => keep.has(chunk.type));
  const hasIcc = kept.some((chunk) => chunk.type === "ICCP");
  const writeExif = header.orientation !== 1;
  const body: Uint8Array[] = [];
  for (const chunk of kept) {
    const data = bytes.slice(chunk.body, chunk.body + chunk.length);
    if (chunk.type === "VP8X") {
      // Flags: 0x20 colour profile, 0x10 alpha, 0x08 EXIF, 0x04 XMP.
      data[0] = (at(data, 0) & 0x10) | (hasIcc ? 0x20 : 0) | (writeExif ? 0x08 : 0);
    }
    body.push(webpChunk(chunk.type, data));
  }
  // Orientation can only be stored in the extended format, which any WebP
  // with EXIF already uses.
  if (writeExif && kept[0]?.type === "VP8X") body.push(webpChunk("EXIF", orientationTiff(header.orientation)));
  const payload = concat([new TextEncoder().encode("WEBP"), ...body]);
  const out = concat([new TextEncoder().encode("RIFF"), u32le(payload.length), payload]);
  const size = displaySize(writeExif && kept[0]?.type === "VP8X" ? header : { ...header, orientation: 1 });
  return { bytes: out, ...size };
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

export function formatForMime(mimeType: string): ImageFormat | null {
  if (mimeType === "image/jpeg") return "jpeg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return null;
}

/** Reads format, stored size and orientation without decoding pixels. */
export function readImageHeader(bytes: Uint8Array, format: ImageFormat): ImageHeader {
  try {
    if (format === "jpeg") return parseJpeg(bytes).header;
    if (format === "png") return parsePng(bytes).header;
    return parseWebp(bytes).header;
  } catch (error) {
    if (error instanceof ImageSanitizeError) throw error;
    return fail("The image could not be read.");
  }
}

/**
 * Validates the file structure and rebuilds it without metadata.
 * Throws ImageSanitizeError for anything that is not a usable still image.
 */
export function sanitizeImage(bytes: Uint8Array, format: ImageFormat): SanitizedImage {
  try {
    if (format === "jpeg") return sanitizeJpeg(bytes);
    if (format === "png") return sanitizePng(bytes);
    return sanitizeWebp(bytes);
  } catch (error) {
    if (error instanceof ImageSanitizeError) throw error;
    return fail("The image could not be read.");
  }
}
