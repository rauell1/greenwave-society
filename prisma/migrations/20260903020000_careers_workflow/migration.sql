ALTER TABLE "career_applications"
  ADD COLUMN IF NOT EXISTS "internal_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "rating" INTEGER,
  ADD COLUMN IF NOT EXISTS "assigned_reviewer" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewed_by" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "career_applications_status_created_at_idx"
  ON "career_applications"("status", "created_at");

INSERT INTO "admin_permissions" ("id", "key", "description") VALUES
  ('cm_careers_read_perm_0001', 'careers.read', 'View career roles and applications'),
  ('cm_careers_review_perm_0001', 'careers.review', 'Review and update career applications'),
  ('cm_careers_export_perm_0001', 'careers.export', 'Export career application data'),
  ('cm_careers_manage_perm_0001', 'careers.manage', 'Open and close career roles')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "admin_role_permissions" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "admin_roles" role
CROSS JOIN "admin_permissions" permission
WHERE role."name" IN ('Owner', 'Administrator')
  AND permission."key" IN ('careers.read', 'careers.review', 'careers.export', 'careers.manage')
ON CONFLICT DO NOTHING;
