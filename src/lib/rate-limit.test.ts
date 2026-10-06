import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ query: vi.fn(), execute: vi.fn() }));
vi.mock("./db", () => ({ getDb: () => ({ $queryRaw: mocks.query, $executeRaw: mocks.execute }) }));
import { RateLimiter, consumeRateLimit, rateLimit, getRateLimitHeaders } from "./rate-limit";

beforeEach(() => { vi.clearAllMocks(); mocks.execute.mockResolvedValue(0); });
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("rate limits", () => {
  it("blocks the next request and resets exactly at the window boundary", () => {
    vi.useFakeTimers(); vi.setSystemTime(1000);
    const limiter = new RateLimiter(2, 100);
    expect(limiter.check("client").remaining).toBe(1);
    expect(limiter.check("client").allowed).toBe(true);
    expect(limiter.check("client").allowed).toBe(false);
    vi.setSystemTime(1100);
    expect(limiter.check("client")).toEqual({ allowed: true, remaining: 1, resetAt: 1200 });
  });
  it("uses the shared counter in production and hashes personal identifiers", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.query.mockResolvedValue([{ count: 6, resetAt: new Date(Date.now() + 60000) }]);
    expect((await consumeRateLimit("email:person@example.com", 5, 60000)).allowed).toBe(false);
    const values = mocks.query.mock.calls[0].slice(1);
    expect(values[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(values)).not.toContain("person@example.com");
  });
  it("returns retry headers from the shared result", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.query.mockResolvedValue([{ count: 16, resetAt: new Date(Date.now() + 60000) }]);
    const request = new NextRequest("https://example.com/api/contact");
    const response = await rateLimit(request, "strict");
    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBe("60");
    expect(getRateLimitHeaders(request)["X-RateLimit-Remaining"]).toBe("0");
  });
  it("does not silently fall back to process memory when the shared store fails", async () => {
    vi.stubEnv("NODE_ENV", "production"); mocks.query.mockRejectedValue(new Error("Unavailable"));
    expect((await rateLimit(new NextRequest("https://example.com/api/contact")))?.status).toBe(503);
  });
});
