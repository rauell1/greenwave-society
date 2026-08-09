-- Additive CMS foundation migration. Existing admin sessions remain readable during
-- the compatibility window; all new sessions use token_hash and user_id.
ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "actor_user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "resourceType" TEXT,
  ADD COLUMN IF NOT EXISTS "resourceId" TEXT,
  ADD COLUMN IF NOT EXISTS "requestId" TEXT,
  ADD COLUMN IF NOT EXISTS "outcome" TEXT,
  ADD COLUMN IF NOT EXISTS "beforeState" TEXT,
  ADD COLUMN IF NOT EXISTS "afterState" TEXT;

ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "admin_sessions"
  ALTER COLUMN "token" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "token_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "userId" TEXT,
  ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "ipHash" TEXT,
  ADD COLUMN IF NOT EXISTS "idleExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "revocationReason" TEXT;

CREATE TABLE IF NOT EXISTS "admin_roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_permissions" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_role_permissions" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE IF NOT EXISTS "admin_user_roles" (
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  CONSTRAINT "admin_user_roles_pkey" PRIMARY KEY ("userId", "roleId")
);

CREATE TABLE IF NOT EXISTS "cms_feature_flags" (
  "key" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cms_feature_flags_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_roles_name_key" ON "admin_roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_permissions_key_key" ON "admin_permissions"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_sessions_token_hash_key" ON "admin_sessions"("token_hash");
CREATE INDEX IF NOT EXISTS "admin_sessions_userId_idx" ON "admin_sessions"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_actor_idx" ON "audit_logs"("actor");
CREATE INDEX IF NOT EXISTS "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");

DO $$ BEGIN
  ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_permissionId_fkey"
    FOREIGN KEY ("permissionId") REFERENCES "admin_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
