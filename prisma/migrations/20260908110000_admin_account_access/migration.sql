-- Preserve authorship and audit history when administrator access is deleted.
ALTER TABLE "admin_users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- User management is now the source of truth for admin access.
UPDATE "cms_feature_flags" SET "enabled" = true WHERE "key" = 'cms.users';
