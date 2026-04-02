/**
 * Database Client Configuration
 *
 * Configured Prisma client with connection pooling and logging.
 * Implements singleton pattern to prevent connection exhaustion.
 */

import { PrismaClient } from "@prisma/client";
import { APP_CONFIG } from "@/config/app.config";
import { logger } from "./logger";
import { validateEnv } from "./env";

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

let prisma: PrismaClient | undefined;

function attachLogging(client: PrismaClient): void {
  if (process.env.NODE_ENV === "production") {
    client.$on("error" as never, (e: any) => {
      logger.error("Database error", new Error(e.message), { target: e.target });
    });

    client.$on("warn" as never, (e: any) => {
      logger.warn("Database warning", { message: e.message, target: e.target });
    });
  } else {
    client.$on("query" as never, (e: any) => {
      logger.debug("Database query", {
        query: e.query,
        duration: `${e.duration}ms`,
      });
    });
  }
}

function initPrisma(): PrismaClient {
  const existingClient = globalForPrisma.prisma;
  if (existingClient) {
    return existingClient;
  }

  const client = createPrismaClient();
  attachLogging(client);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Lazily create and return a Prisma client.
 * Validation runs only when the database is actually needed, avoiding build-time failures
 * when DATABASE_URL is not provided.
 */
export function getDb(): PrismaClient {
  if (!prisma) {
    validateEnv();
    prisma = initPrisma();
  }

  return prisma;
}

/**
 * Graceful shutdown - close database connections
 */
export async function closeDatabase(): Promise<void> {
  const client = prisma ?? globalForPrisma.prisma;
  if (!client) {
    return;
  }

  await client.$disconnect();
  prisma = undefined;
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = undefined;
  }
  logger.info("Database connections closed");
}

/**
 * Health check for database connectivity
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getDb();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error("Database health check failed", error as Error);
    return false;
  }
}
