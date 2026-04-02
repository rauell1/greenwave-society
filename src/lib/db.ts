/**
 * Database Client Configuration
 *
 * Configured Prisma client with connection pooling and logging.
 * Implements singleton pattern to prevent connection exhaustion.
 */

import { PrismaClient } from "@prisma/client";
import { APP_CONFIG } from "@/config/app.config";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with optimized configuration
 */
function createPrismaClient(): PrismaClient {
  const logLevel = process.env.NODE_ENV === "production" ? ["error", "warn"] : ["query", "error", "warn"];

  return new PrismaClient({
    log: logLevel.map((level) => ({
      level: level as any,
      emit: "event",
    })),
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Setup logging
if (process.env.NODE_ENV === "production") {
  db.$on("error" as never, (e: any) => {
    logger.error("Database error", new Error(e.message), { target: e.target });
  });

  db.$on("warn" as never, (e: any) => {
    logger.warn("Database warning", { message: e.message, target: e.target });
  });
} else {
  // Log queries in development
  db.$on("query" as never, (e: any) => {
    logger.debug("Database query", {
      query: e.query,
      duration: `${e.duration}ms`,
    });
  });
}

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Graceful shutdown - close database connections
 */
export async function closeDatabase(): Promise<void> {
  await db.$disconnect();
  logger.info("Database connections closed");
}

/**
 * Health check for database connectivity
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error("Database health check failed", error as Error);
    return false;
  }
}