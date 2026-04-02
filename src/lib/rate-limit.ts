/**
 * Rate Limiting Middleware
 *
 * Implements in-memory rate limiting to prevent abuse.
 * For production with multiple instances, consider using Redis.
 */

import { NextRequest, NextResponse } from "next/server";
import { APP_CONFIG } from "@/config/app.config";
import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private maxRequests: number = APP_CONFIG.rateLimit.maxRequests,
    private windowMs: number = APP_CONFIG.rateLimit.windowMs
  ) {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired entry - create new
    if (!entry || entry.resetAt < now) {
      const resetAt = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt };
    }

    // Increment existing entry
    entry.count++;

    if (entry.count > this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Get client identifier from request (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (considering proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare

  const ip = cfConnectingIp || forwarded?.split(",")[0] || realIp || "unknown";

  return ip;
}

/**
 * Rate limiting middleware for API routes
 *
 * Usage in API route:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request);
 *   if (rateLimitResult) return rateLimitResult;
 *   // ... rest of handler
 * }
 * ```
 */
export async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
  // Skip rate limiting in development if not explicitly enabled
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_RATE_LIMITING !== "true"
  ) {
    return null;
  }

  const identifier = getClientIdentifier(request);
  const { allowed, remaining, resetAt } = rateLimiter.check(identifier);

  // Add rate limit headers to response
  const headers = {
    "X-RateLimit-Limit": APP_CONFIG.rateLimit.maxRequests.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetAt.toString(),
  };

  if (!allowed) {
    logger.warn("Rate limit exceeded", {
      identifier,
      path: request.nextUrl.pathname,
    });

    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Create rate limit headers for successful responses
 */
export function getRateLimitHeaders(request: NextRequest): Record<string, string> {
  const identifier = getClientIdentifier(request);
  const entry = rateLimiter["store"].get(identifier);

  if (!entry) {
    return {
      "X-RateLimit-Limit": APP_CONFIG.rateLimit.maxRequests.toString(),
      "X-RateLimit-Remaining": APP_CONFIG.rateLimit.maxRequests.toString(),
    };
  }

  return {
    "X-RateLimit-Limit": APP_CONFIG.rateLimit.maxRequests.toString(),
    "X-RateLimit-Remaining": Math.max(
      0,
      APP_CONFIG.rateLimit.maxRequests - entry.count
    ).toString(),
    "X-RateLimit-Reset": entry.resetAt.toString(),
  };
}

// Export for testing
export { RateLimiter };
