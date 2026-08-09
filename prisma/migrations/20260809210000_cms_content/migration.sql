CREATE TABLE "cms_content" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'page',
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "body" TEXT NOT NULL,
  "metadata" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TIMESTAMP(3),
  "scheduledAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cms_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_content_revisions" (
  "id" TEXT NOT NULL,
  "contentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "body" TEXT NOT NULL,
  "metadata" TEXT,
  "status" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cms_content_revisions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cms_content_type_slug_key" ON "cms_content"("type", "slug");
CREATE INDEX "cms_content_status_updatedAt_idx" ON "cms_content"("status", "updatedAt");
CREATE INDEX "cms_content_scheduledAt_idx" ON "cms_content"("scheduledAt");
CREATE UNIQUE INDEX "cms_content_revisions_contentId_version_key" ON "cms_content_revisions"("contentId", "version");
CREATE INDEX "cms_content_revisions_contentId_createdAt_idx" ON "cms_content_revisions"("contentId", "createdAt");
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_content_revisions" ADD CONSTRAINT "cms_content_revisions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "cms_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_content_revisions" ADD CONSTRAINT "cms_content_revisions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
