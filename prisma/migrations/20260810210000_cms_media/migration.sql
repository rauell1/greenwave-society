CREATE TABLE "cms_media_assets" (
  "id" TEXT PRIMARY KEY, "filename" TEXT NOT NULL, "pathname" TEXT NOT NULL,
  "url" TEXT NOT NULL, "contentType" TEXT NOT NULL, "size" INTEGER NOT NULL,
  "checksum" TEXT NOT NULL, "width" INTEGER, "height" INTEGER,
  "altText" TEXT, "caption" TEXT, "status" TEXT NOT NULL DEFAULT 'active',
  "uploadedById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "cms_media_usages" (
  "id" TEXT PRIMARY KEY, "mediaId" TEXT NOT NULL, "resourceType" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL, "field" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "cms_media_assets_pathname_key" ON "cms_media_assets"("pathname");
CREATE UNIQUE INDEX "cms_media_assets_url_key" ON "cms_media_assets"("url");
CREATE INDEX "cms_media_assets_contentType_createdAt_idx" ON "cms_media_assets"("contentType", "createdAt");
CREATE INDEX "cms_media_assets_status_createdAt_idx" ON "cms_media_assets"("status", "createdAt");
CREATE UNIQUE INDEX "cms_media_usages_mediaId_resourceType_resourceId_field_key" ON "cms_media_usages"("mediaId", "resourceType", "resourceId", "field");
CREATE INDEX "cms_media_usages_resourceType_resourceId_idx" ON "cms_media_usages"("resourceType", "resourceId");
ALTER TABLE "cms_media_assets" ADD CONSTRAINT "cms_media_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_media_assets" ADD CONSTRAINT "cms_media_assets_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_media_usages" ADD CONSTRAINT "cms_media_usages_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "cms_media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
