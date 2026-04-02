/**
 * Newsletter Subscription API Route
 *
 * Handles newsletter subscriptions with validation, sanitization,
 * rate limiting, and structured logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { newsletterSchema, validateInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestLogger = logger.child({ endpoint: "/api/newsletter" });

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    // Parse and validate request body
    const body = await request.json().catch(() => null);
    if (!body) {
      requestLogger.warn("Invalid JSON body");
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate and sanitize input
    const validation = validateInput(newsletterSchema, body);
    if (!validation.success) {
      requestLogger.warn("Validation failed", { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const db = getDb();

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      requestLogger.info("Already subscribed", { email });
      return NextResponse.json(
        {
          success: true,
          message: "You are already subscribed to our newsletter!",
        },
        {
          status: 200,
          headers: getRateLimitHeaders(request),
        }
      );
    }

    // Save to database
    await db.newsletterSubscriber.create({
      data: { email },
    });

    const duration = Date.now() - startTime;
    requestLogger.info("Newsletter subscription successful", {
      email,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Welcome! You have been subscribed to our newsletter.",
      },
      {
        status: 200,
        headers: getRateLimitHeaders(request),
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error("Newsletter subscription failed", error as Error, {
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
