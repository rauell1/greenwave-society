-- Add Viewer role: authenticated but no dashboard or section access.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.
INSERT INTO "admin_roles" ("id", "name", "description", "isSystem", "updatedAt")
VALUES (
  'cm_viewer_role_system_0001',
  'Viewer',
  'No dashboard access. Can log in but cannot access any admin sections.',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO NOTHING;
