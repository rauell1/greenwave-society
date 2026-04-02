/**
 * Health Check API Route
 *
 * Provides system health status for monitoring and load balancing.
 */

import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();

    const health = {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbHealthy ? "pass" : "fail",
      },
      responseTime: Date.now() - startTime,
    };

    const statusCode = dbHealthy ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}
