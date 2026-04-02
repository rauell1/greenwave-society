/**
 * Contact Form API Route
 *
 * Handles contact form submissions with validation, sanitization,
 * rate limiting, and structured logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { contactFormSchema, validateInput, containsSuspiciousPatterns } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestLogger = logger.child({ endpoint: "/api/contact" });

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
    const validation = validateInput(contactFormSchema, body);
    if (!validation.success) {
      requestLogger.warn("Validation failed", { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, email, interest, message } = validation.data;
    const db = getDb();

    // Check for suspicious patterns
    if (
      containsSuspiciousPatterns(name) ||
      containsSuspiciousPatterns(message)
    ) {
      requestLogger.warn("Suspicious input detected", { email });
      return NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400 }
      );
    }

    // Save to database
    await db.contactSubmission.create({
      data: {
        name,
        email,
        interest,
        message,
      },
    });

    const duration = Date.now() - startTime;
    requestLogger.info("Contact form submitted successfully", {
      email,
      interest,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out! We will get back to you soon.",
      },
      {
        status: 200,
        headers: getRateLimitHeaders(request),
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error("Contact form submission failed", error as Error, {
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
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
