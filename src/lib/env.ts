/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at application startup.
 * Throws descriptive errors if any required variables are missing or invalid.
 */

import { z } from "zod";

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  PORT: z.string().regex(/^\d+$/).transform(Number).optional(),

  // Security
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).optional(),
  CORS_ORIGIN: z.string().optional(),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters").optional(),

  // Feature Flags
  ENABLE_RATE_LIMITING: z.string().transform(val => val === "true").optional(),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform(val => val === "true").optional(),

  // Database Pool
  DB_POOL_MIN: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_POOL_MAX: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_IDLE_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_CONNECTION_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).optional(),

  // Optional: Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // Optional: Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates environment variables and returns typed env object
 * @throws {Error} If validation fails
 */
export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    const env = envSchema.parse(process.env);
    cachedEnv = env;
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues ?? [];
      const missingVars = issues.map((issue) => {
        const path = issue.path.length ? issue.path.join(".") : "(root)";
        return `  - ${path}: ${issue.message}`;
      });

      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join("\n")}\n\n` +
          `Please check your .env file. See .env.example for required variables.`
      );
    }
    throw error;
  }
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if we're in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}
