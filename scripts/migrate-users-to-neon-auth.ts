import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not defined in .env or .env.local.");
  console.error("Please add your PostgreSQL connection string to .env.local as DATABASE_URL=\"postgresql://...\"");
  process.exit(1);
}

const prisma = new PrismaClient();

async function migrateUsersToNeonAuth() {
  console.log("Starting migration of registered users to Neon Auth...");

  try {
    // 1. Ensure neon_auth schema exists
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS neon_auth;`);

    // 2. Ensure user table exists in neon_auth schema (with UUID id)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS neon_auth."user" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        "image" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Fetch all registered members
    const members = await prisma.memberRegistration.findMany();
    console.log(`Found ${members.length} registered member(s) to process.`);

    let migratedCount = 0;

    for (const member of members) {
      if (!member.email) continue;
      const email = member.email.trim().toLowerCase();
      const name = member.fullName || member.email.split("@")[0];

      // Check if user already exists in neon_auth."user"
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM neon_auth."user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        email
      );

      if (existing && existing.length > 0) {
        console.log(`- User ${email} already exists in Neon Auth. Skipping.`);
        continue;
      }

      // Insert into neon_auth."user" with UUID
      const userId = randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1::uuid, $2, $3, $4, NOW(), NOW())`,
        userId,
        name,
        email,
        member.status === "approved"
      );

      migratedCount++;
      console.log(`+ Migrated user: ${name} (${email}) to Neon Auth (UUID: ${userId})`);
    }

    // 4. Fetch all admin users if any
    const admins = await prisma.adminUser.findMany();
    for (const admin of admins) {
      if (!admin.email) continue;
      const email = admin.email.trim().toLowerCase();
      const name = email.split("@")[0];

      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM neon_auth."user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        email
      );

      if (existing && existing.length > 0) continue;

      const userId = randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1::uuid, $2, $3, TRUE, NOW(), NOW())`,
        userId,
        name,
        email
      );
      migratedCount++;
      console.log(`+ Migrated admin user: ${email} to Neon Auth (UUID: ${userId})`);
    }

    console.log(`Migration complete! Successfully transferred ${migratedCount} user(s) to Neon Auth.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersToNeonAuth();
