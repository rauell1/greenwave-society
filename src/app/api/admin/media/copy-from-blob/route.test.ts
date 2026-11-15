import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const OLD = "https://abc.public.blob.vercel-storage.com/media/x-poster.webp";
const BYTES = new TextEncoder().encode("poster image");
const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

const state = vi.hoisted(() => ({
  assets: [] as { id: string; pathname: string; url: string; contentType: string; size: number; checksum: string }[],
  content: [] as { metadata: string }[],
  objects: new Map<string, Uint8Array>(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit/audit-service", () => ({ AUDIT_ACTIONS: { MEDIA_UPDATED: "media.updated" } }));
vi.mock("@/lib/auth/route-authorization", () => ({ authorizeRoute: async () => ({ ok: true, admin: { id: "a1", email: "admin@example.org" } }) }));
vi.mock("@/lib/object-storage", () => ({
  objectStorageConfigured: () => true,
  mediaFileUrl: (p: string) => `/media-files/${p}`,
  putObject: async (key: string, body: Uint8Array) => { state.objects.set(key, body); },
  getObject: async (key: string) => {
    const body = state.objects.get(key);
    return body ? new Response(body as BodyInit, { headers: { "content-length": String(body.length) } }) : null;
  },
}));
vi.mock("@/lib/db", () => {
  const tx = {
    cmsMediaAsset: { update: async ({ where, data }: { where: { id: string }; data: { url: string } }) => { state.assets.find((a) => a.id === where.id)!.url = data.url; } },
    $executeRaw: async (_strings: TemplateStringsArray, oldUrl: string, newUrl: string) => {
      let n = 0;
      for (const row of state.content) if (row.metadata.includes(oldUrl)) { row.metadata = row.metadata.split(oldUrl).join(newUrl); n++; }
      return n;
    },
    auditLog: { create: async () => ({}) },
  };
  return {
    getDb: () => ({
      cmsMediaAsset: { findMany: async () => state.assets.filter((a) => a.url.includes(".public.blob.vercel-storage.com")) },
      $transaction: async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
    }),
  };
});

const { GET, POST } = await import("./route");

describe("copy media library files from Vercel Blob", () => {
  beforeEach(() => {
    state.objects.clear();
    state.assets = [
      { id: "m1", pathname: "media/x-poster.webp", url: OLD, contentType: "image/webp", size: BYTES.length, checksum: sha(BYTES) },
      { id: "m2", pathname: "media/bad.webp", url: "https://abc.public.blob.vercel-storage.com/media/bad.webp", contentType: "image/webp", size: 3, checksum: "0".repeat(64) },
    ];
    state.content = [{ metadata: JSON.stringify({ posterUrl: OLD }) }];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(BYTES as BodyInit)));
  });

  it("lists what is left without changing anything", async () => {
    const body = await (await GET()).json();
    expect(body.remaining).toBe(2);
    expect(state.objects.size).toBe(0);
  });

  it("copies verified files and updates the asset and the content that used its link", async () => {
    const body = await (await POST()).json();
    expect(body.copied).toEqual([{ id: "m1", pathname: "media/x-poster.webp", contentUpdated: 1 }]);
    expect(body.failed).toEqual([{ id: "m2", pathname: "media/bad.webp", reason: "downloaded file does not match its recorded checksum" }]);
    expect(body.remaining).toBe(1);
    expect(state.assets[0]!.url).toBe("/media-files/media/x-poster.webp");
    expect(JSON.parse(state.content[0]!.metadata)).toEqual({ posterUrl: "/media-files/media/x-poster.webp" });
    expect(state.objects.has("media/bad.webp")).toBe(false);
  });
});
