-- Remove stray DB-level default on career_applications.updated_at.
-- This column is managed by Prisma's @updatedAt at the application level;
-- the schema never declared a DB default, so drop the leftover one to match.
ALTER TABLE "career_applications" ALTER COLUMN "updated_at" DROP DEFAULT;
