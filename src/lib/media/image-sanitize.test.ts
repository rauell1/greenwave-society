import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  ImageSanitizeError,
  readImageHeader,
  sanitizeImage,
  type ImageFormat,
} from "./image-sanitize";

const W = 64;
const H = 48;

/** Left half red, right half blue, top rows green, so orientation is visible. */
function pixels(alpha = false): Buffer {
  const channels = alpha ? 4 : 3;
  const raw = Buffer.alloc(W * H * channels);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * channels;
      if (y < 8) raw[i + 1] = 255;
      else if (x < W / 2) raw[i] = 255;
      else raw[i + 2] = 255;
      if (alpha) raw[i + 3] = x < 4 ? 0 : 255;
    }
  }
  return raw;
}

const SECRET_EXIF = {
  IFD0: { Make: "SecretCam", Model: "Model X", Copyright: "Private Person" },
  IFD3: { GPSLatitudeRef: "S", GPSLatitude: "1/1 17/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "36/1 49/1 0/1" },
};

async function image(format: ImageFormat, options: { orientation?: number; alpha?: boolean } = {}) {
  const alpha = options.alpha ?? false;
  let pipeline = sharp(pixels(alpha), { raw: { width: W, height: H, channels: alpha ? 4 : 3 } })
    .withExif(SECRET_EXIF);
  if (options.orientation) pipeline = pipeline.withMetadata({ orientation: options.orientation });
  pipeline = format === "jpeg" ? pipeline.jpeg({ quality: 90 })
    : format === "png" ? pipeline.png()
    : pipeline.webp({ quality: 90 });
  return new Uint8Array(await pipeline.toBuffer());
}

async function decoded(bytes: Uint8Array) {
  return sharp(bytes).raw().toBuffer({ resolveWithObject: true });
}

function containsText(bytes: Uint8Array, text: string): boolean {
  return Buffer.from(bytes).includes(Buffer.from(text, "latin1"));
}

describe("sanitizeImage", () => {
  for (const format of ["jpeg", "png", "webp"] as const) {
    it(`removes metadata from ${format} without changing pixels`, async () => {
      const input = await image(format);
      expect(containsText(input, "SecretCam")).toBe(true);

      const output = sanitizeImage(input, format);
      expect(containsText(output.bytes, "SecretCam")).toBe(false);
      expect(containsText(output.bytes, "Private Person")).toBe(false);
      expect((await sharp(output.bytes).metadata()).exif).toBeUndefined();
      expect([output.width, output.height]).toEqual([W, H]);

      const before = await decoded(input);
      const after = await decoded(output.bytes);
      expect(after.info.width).toBe(before.info.width);
      expect(Buffer.compare(after.data, before.data)).toBe(0); // lossless
    });

    for (const orientation of [3, 6, 8]) {
      it(`keeps ${format} orientation ${orientation} so it displays like the original`, async () => {
        const input = await image(format, { orientation });
        const output = sanitizeImage(input, format);
        expect(containsText(output.bytes, "SecretCam")).toBe(false);
        const meta = await sharp(output.bytes).metadata();
        expect(meta.orientation).toBe(orientation);

        const expected = await sharp(input).rotate().raw().toBuffer({ resolveWithObject: true });
        const actual = await sharp(output.bytes).rotate().raw().toBuffer({ resolveWithObject: true });
        expect([output.width, output.height]).toEqual([expected.info.width, expected.info.height]);
        expect(Buffer.compare(actual.data, expected.data)).toBe(0);
      });
    }
  }

  it("keeps PNG and WebP transparency", async () => {
    for (const format of ["png", "webp"] as const) {
      const input = await image(format, { alpha: true });
      const output = sanitizeImage(input, format);
      const meta = await sharp(output.bytes).metadata();
      expect(meta.hasAlpha).toBe(true);
      expect(Buffer.compare((await decoded(output.bytes)).data, (await decoded(input)).data)).toBe(0);
    }
  });

  it("drops PNG text chunks", async () => {
    const png = await image("png");
    const text = pngChunk("tEXt", Buffer.from("Comment\0Hidden Note", "latin1"));
    const input = new Uint8Array(Buffer.concat([png.subarray(0, 33), text, png.subarray(33)]));
    expect(containsText(input, "Hidden Note")).toBe(true);
    const output = sanitizeImage(input, "png");
    expect(containsText(output.bytes, "Hidden Note")).toBe(false);
    expect(Buffer.compare((await decoded(output.bytes)).data, (await decoded(png)).data)).toBe(0);
  });

  it("drops JPEG comments and bytes appended after the image", async () => {
    const jpeg = await image("jpeg");
    const comment = Buffer.from("FFFE000E" + Buffer.from("Secret note!").toString("hex"), "hex");
    const input = new Uint8Array(Buffer.concat([jpeg.subarray(0, 2), comment, jpeg.subarray(2), Buffer.from("<script>alert(1)</script>")]));
    const output = sanitizeImage(input, "jpeg");
    expect(containsText(output.bytes, "Secret note!")).toBe(false);
    expect(containsText(output.bytes, "<script>")).toBe(false);
    expect(output.bytes.at(-2)).toBe(0xff);
    expect(output.bytes.at(-1)).toBe(0xd9);
  });

  it("handles progressive JPEG", async () => {
    const input = new Uint8Array(await sharp(pixels(), { raw: { width: W, height: H, channels: 3 } })
      .withExif(SECRET_EXIF).jpeg({ progressive: true, quality: 85 }).toBuffer());
    const output = sanitizeImage(input, "jpeg");
    expect(containsText(output.bytes, "SecretCam")).toBe(false);
    expect(Buffer.compare((await decoded(output.bytes)).data, (await decoded(input)).data)).toBe(0);
  });

  it("refuses truncated, corrupt and animated files", async () => {
    const jpeg = await image("jpeg");
    expect(() => sanitizeImage(jpeg.subarray(0, jpeg.length - 100), "jpeg")).toThrow(ImageSanitizeError);

    const png = await image("png");
    const corrupt = png.slice();
    corrupt[40] = corrupt[40]! ^ 0xff;
    expect(() => sanitizeImage(corrupt, "png")).toThrow(ImageSanitizeError);

    // An extended WebP whose header announces an animation.
    const animated = (await image("webp", { alpha: true })).slice();
    expect(Buffer.from(animated.subarray(12, 16)).toString()).toBe("VP8X");
    animated[20] = animated[20]! | 0x02;
    expect(() => sanitizeImage(animated, "webp")).toThrow(/Animated/);

    expect(() => sanitizeImage(new Uint8Array([1, 2, 3]), "webp")).toThrow(ImageSanitizeError);
  });

  it("refuses images with too many pixels from the header alone", async () => {
    const png = Buffer.from(await image("png"));
    const ihdr = Buffer.from(png.subarray(16, 29));
    ihdr.writeUInt32BE(10_000, 0);
    ihdr.writeUInt32BE(10_000, 4);
    const forged = new Uint8Array(Buffer.concat([png.subarray(0, 8), pngChunk("IHDR", ihdr), png.subarray(33)]));
    expect(readImageHeader(forged, "png").width).toBe(10_000);
    expect(() => sanitizeImage(forged, "png")).toThrow(/too many pixels/);
  });
});

function pngChunk(type: string, data: Buffer): Buffer {
  const typed = Buffer.concat([Buffer.from(type, "latin1"), data]);
  let c = 0xffffffff;
  for (const byte of typed) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE((c ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, typed, crc]);
}
