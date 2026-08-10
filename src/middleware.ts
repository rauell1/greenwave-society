/**
 * Next.js Middleware
 *
 * Handles security headers, CORS, and request logging.
 * Runs on all requests before reaching route handlers.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { APP_CONFIG } from "@/config/app.config";

/**
 * Security headers to add to all responses
 */
function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // Enable XSS protection
    "X-XSS-Protection": "1; mode=block",
    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-inline/eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://greenwavesociety.org https://*.vercel.app",
      "frame-ancestors 'none'",
    ].join("; "),
    // Permissions policy
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    // HSTS — tells browsers and Cloudflare to always use HTTPS
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  };
}

/**
 * CORS headers for API routes
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = APP_CONFIG.security.corsOrigin;
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (!isAllowed && process.env.NODE_ENV === "production") {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin || allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

import { rateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Handle OPTIONS requests (CORS preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(request.headers.get("origin")),
    });
  }

  // Rate Limiting for API routes
  if (pathname.startsWith("/api")) {
    const isStrictRoute =
      request.method !== "GET" &&
      (pathname.startsWith("/api/contact") ||
        pathname.startsWith("/api/registrations") ||
        pathname.startsWith("/api/admin") ||
        pathname.startsWith("/api/newsletter"));

    const rateLimitResult = await rateLimit(request, isStrictRoute ? "strict" : "standard");
    if (rateLimitResult) {
      // Add CORS headers to 429 rate limit response
      const corsHeaders = getCorsHeaders(request.headers.get("origin"));
      Object.entries(corsHeaders).forEach(([key, value]) => {
        rateLimitResult.headers.set(key, value);
      });
      return rateLimitResult;
    }
  }

  // Get response
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add CORS headers for API routes
  if (pathname.startsWith("/api")) {
    const corsHeaders = getCorsHeaders(request.headers.get("origin"));
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Geolocation and Privacy Compliance
  // Detect country for GDPR vs CCPA defaults
  const country = request.headers.get("x-vercel-ip-country") || "US";
  
  // Pass the country to the frontend via a cookie if not already set, 
  // so the client-side useConsent hook can determine default states (Opt-in vs Opt-out)
  if (!request.cookies.has("user-country")) {
    response.cookies.set("user-country", country, {
      path: "/",
      httpOnly: false, // Must be accessible to the frontend hook
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  // Log request (only in production or when debugging)
  if (process.env.NODE_ENV === "production" || process.env.DEBUG_REQUESTS === "true") {
    const duration = Date.now() - startTime;
    logger.info("Request", {
      method: request.method,
      path: pathname,
      duration: `${duration}ms`,
      userAgent: request.headers.get("user-agent"),
    });
  }

  return response;
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|images|logo.png|logo.svg|robots.txt).*)",
  ],
};
