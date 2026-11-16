import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";

vi.mock("server-only", () => ({}));
const { optimiseUpload, UploadRejectedError } = await import("./optimize");

const photo = (width: number, height: number, format: "jpeg" | "png" | "webp" = "jpeg") =>
  sharp({ create: { width, height, channels: 3, background: { r: 40, g: 120, b: 60 } } })[format]().toBuffer();

const gps = { IFD0: { Make: "SecretCam" }, IFD3: { GPSLatitudeRef: "S", GPSLatitude: "1/1 17/1 0/1" } };

describe("optimiseUpload", () => {
  it("stores browser-resized images in their own format with their size", async () => {
    for (const format of ["webp", "jpeg", "png"] as const) {
      const stored = await optimiseUpload(await photo(2000, 1500, format), `image/${format}`, "general");
      expect(stored).toMatchObject({ contentType: `image/${format}`, width: 2000, height: 1500 });
      expect((await sharp(stored.bytes).metadata()).format).toBe(format);
    }
  });

  it("refuses images larger than the preset's box", async () => {
    await expect(optimiseUpload(await photo(4000, 3000), "image/jpeg", "general")).rejects.toThrow(UploadRejectedError);
    await expect(optimiseUpload(await photo(1000, 1300), "image/jpeg", "portrait")).rejects.toThrow(/800×1000px/);
    expect(await optimiseUpload(await photo(720, 1600, "webp"), "image/webp", "poster")).toMatchObject({ width: 720, height: 1600 });
  });

  it("removes EXIF data such as GPS location and keeps the orientation", async () => {
    // Orientation 6 = the camera was rotated 90 degrees; stored pixels are landscape.
    const rotated = await sharp(await photo(1600, 1200)).withExif(gps).withMetadata({ orientation: 6 }).jpeg().toBuffer();
    expect(rotated.includes("SecretCam")).toBe(true);
    const stored = await optimiseUpload(rotated, "image/jpeg", "general");
    expect(stored).toMatchObject({ width: 1200, height: 1600 });
    expect(stored.bytes.includes("SecretCam")).toBe(false);
    const metadata = await sharp(stored.bytes).metadata();
    expect(metadata.orientation).toBe(6);
    const upright = await sharp(stored.bytes).rotate().metadata();
    expect([upright.autoOrient?.width, upright.autoOrient?.height]).toEqual([1200, 1600]);
  });

  it("keeps GIFs and PDFs as uploaded", async () => {
    const gif = await sharp({ create: { width: 300, height: 200, channels: 3, background: "#fff" } }).gif().toBuffer();
    expect(await optimiseUpload(gif, "image/gif", "general")).toMatchObject({ contentType: "image/gif", width: 300, height: 200, bytes: gif });
    const pdf = new TextEncoder().encode("%PDF-1.4 test");
    expect((await optimiseUpload(pdf, "application/pdf", "general")).contentType).toBe("application/pdf");
  });

  it("rejects files that are not valid images", async () => {
    await expect(optimiseUpload(new Uint8Array([0xff, 0xd8, 0xff, 0, 1, 2]), "image/jpeg", "general")).rejects.toThrow(UploadRejectedError);
    await expect(optimiseUpload(new TextEncoder().encode("GIF"), "image/gif", "general")).rejects.toThrow(UploadRejectedError);
  });
});
