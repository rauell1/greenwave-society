import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { APP_CONFIG } from "@/config/app.config";
import { getDb } from "./db";
import { logger } from "./logger";

export interface RateLimitResult { allowed: boolean; remaining: number; resetAt: number }
interface Entry { count: number; resetAt: number }

// Local development only. Production counters live in PostgreSQL.
export class RateLimiter {
  private store = new Map<string, Entry>();
  constructor(private maxRequests = APP_CONFIG.rateLimit.maxRequests, private windowMs = APP_CONFIG.rateLimit.windowMs) {}
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    if (this.store.size >= 10000) {
      for (const [key, value] of this.store) if (value.resetAt <= now) this.store.delete(key);
    }
    let entry = this.store.get(identifier);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(identifier, entry);
    }
    entry.count = Math.min(entry.count + 1, this.maxRequests + 1);
    return { allowed: entry.count <= this.maxRequests, remaining: Math.max(0, this.maxRequests - entry.count), resetAt: entry.resetAt };
  }
  getRemaining(identifier: string) {
    const entry = this.store.get(identifier);
    return !entry || entry.resetAt <= Date.now() ? this.maxRequests : Math.max(0, this.maxRequests - entry.count);
  }
  getResetAt(identifier: string) {
    const entry = this.store.get(identifier);
    return entry && entry.resetAt > Date.now() ? entry.resetAt : null;
  }
  destroy() { this.store.clear(); }
}

export const standardLimiter = new RateLimiter();
export const strictLimiter = new RateLimiter(15, 15 * 60 * 1000);
const localLimiters = new Map<string, RateLimiter>();
const requestResults = new WeakMap<NextRequest, { result: RateLimitResult; limit: number }>();
let nextCleanupAt = 0;

export async function consumeRateLimit(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1) throw new Error("Invalid rate limit configuration");
  const key = createHash("sha256").update(`${limit}:${windowMs}:${identifier}`).digest("hex");
  if (process.env.NODE_ENV !== "production" && process.env.RATE_LIMIT_STORE !== "database") {
    const policy = `${limit}:${windowMs}`;
    let limiter = localLimiters.get(policy);
    if (!limiter) { limiter = new RateLimiter(limit, windowMs); localLimiters.set(policy, limiter); }
    return limiter.check(key);
  }
  const db = getDb();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  // One atomic UPSERT: concurrent instances share the same fixed window.
  const [entry] = await db.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "rate_limit_buckets" ("key", "count", "reset_at") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "rate_limit_buckets"."reset_at" <= ${now} THEN 1 ELSE LEAST("rate_limit_buckets"."count" + 1, ${limit + 1}) END,
      "reset_at" = CASE WHEN "rate_limit_buckets"."reset_at" <= ${now} THEN ${resetAt} ELSE "rate_limit_buckets"."reset_at" END
    RETURNING "count", "reset_at" AS "resetAt"
  `;
  if (!entry) throw new Error("Rate limit store returned no counter");
  if (Date.now() >= nextCleanupAt) {
    nextCleanupAt = Date.now() + 5 * 60 * 1000;
    await db.$executeRaw`DELETE FROM "rate_limit_buckets" WHERE "key" IN (SELECT "key" FROM "rate_limit_buckets" WHERE "reset_at" <= ${now} LIMIT 1000)`
      .catch(error => logger.error("Rate limit cleanup failed", error as Error));
  }
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt.getTime() };
}

export function getClientIdentifier(request: NextRequest): string {
  if (process.env.VERCEL) return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (process.env.TRUST_CLOUDFLARE_IP === "true") return request.headers.get("cf-connecting-ip") || "unknown";
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimitUnavailable(): NextResponse {
  return NextResponse.json({ error: "Service temporarily unavailable. Please try again shortly." }, { status: 503, headers: { "Retry-After": "30" } });
}

export async function rateLimit(request: NextRequest, tier: "standard" | "strict" = "standard"): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === "development" && process.env.ENABLE_RATE_LIMITING !== "true") return null;
  const limit = tier === "strict" ? 15 : APP_CONFIG.rateLimit.maxRequests;
  const windowMs = tier === "strict" ? 15 * 60 * 1000 : APP_CONFIG.rateLimit.windowMs;
  try {
    const result = await consumeRateLimit(`${tier}:${getClientIdentifier(request)}`, limit, windowMs);
    requestResults.set(request, { result, limit });
    if (result.allowed) return null;
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    return NextResponse.json({ error: "Too many requests. Please try again later.", retryAfter }, { status: 429, headers: { ...getRateLimitHeaders(request), "Retry-After": String(retryAfter) } });
  } catch (error) {
    logger.error("Shared rate limit store unavailable", error as Error);
    return rateLimitUnavailable();
  }
}

export function getRateLimitHeaders(request: NextRequest): Record<string, string> {
  const entry = requestResults.get(request);
  return entry ? { "X-RateLimit-Limit": String(entry.limit), "X-RateLimit-Remaining": String(entry.result.remaining), "X-RateLimit-Reset": String(Math.ceil(entry.result.resetAt / 1000)) } : {};
}
