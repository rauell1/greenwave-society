import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { listObjectKeys } from "./object-storage";

const page = (keys: string[], next?: string) =>
  `<?xml version="1.0"?><ListBucketResult>${keys.map(k => `<Contents><Key>${k}</Key></Contents>`).join("")}` +
  `<IsTruncated>${next ? "true" : "false"}</IsTruncated>${next ? `<NextContinuationToken>${next}</NextContinuationToken>` : ""}</ListBucketResult>`;

beforeEach(() => {
  vi.stubEnv("AWS_ENDPOINT_URL_S3", "https://storage.example.com");
  vi.stubEnv("AWS_ACCESS_KEY_ID", "id");
  vi.stubEnv("AWS_SECRET_ACCESS_KEY", "secret");
  vi.stubEnv("OBJECT_STORAGE_BUCKET", "site");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("listObjectKeys", () => {
  it("follows continuation tokens and decodes XML entities in keys", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: Request | string) => {
      const url = typeof input === "string" ? input : input.url;
      urls.push(url);
      const token = new URL(url).searchParams.get("continuation-token");
      return new Response(token ? page(["images/b &amp; c.jpg"]) : page(["images/a.jpg"], "t&amp;1"));
    }));
    await expect(listObjectKeys("images/")).resolves.toEqual(["images/a.jpg", "images/b & c.jpg"]);
    expect(urls).toHaveLength(2);
    const second = new URL(urls[1]);
    expect(second.pathname).toBe("/site");
    expect(second.searchParams.get("list-type")).toBe("2");
    expect(second.searchParams.get("prefix")).toBe("images/");
    expect(second.searchParams.get("continuation-token")).toBe("t&1");
  });

  it("throws when the listing request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("denied", { status: 403 })));
    await expect(listObjectKeys("media/")).rejects.toThrow("Object storage listing failed (403)");
  });
});
