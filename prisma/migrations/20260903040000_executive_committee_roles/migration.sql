-- Make organizational positions first-class access roles. These roles establish
-- executive committee membership and baseline dashboard/recruitment access;
-- operational roles remain separately assignable for privileged actions.
INSERT INTO "admin_roles" ("id", "name", "description", "isSystem", "updatedAt") VALUES
  ('exec_role_ceo_0001', 'Chief Executive Officer (CEO)', 'Executive position · Organizational leadership and final executive oversight.', true, CURRENT_TIMESTAMP),
  ('exec_role_coo_0001', 'Chief Operating Officer (COO)', 'Executive position · Operations, governance coordination, and institutional delivery.', true, CURRENT_TIMESTAMP),
  ('exec_role_cio_0001', 'Chief Innovation Officer (CIO)', 'Executive position · Innovation, technology, and digital transformation.', true, CURRENT_TIMESTAMP),
  ('exec_role_cswo_0001', 'Chief Strategy and Well-being Officer (CSWO)', 'Executive position · Strategy, organizational well-being, and accountability.', true, CURRENT_TIMESTAMP),
  ('exec_role_design_head_0001', 'Head of Design', 'Executive position · Brand identity, design systems, visual direction, and organization-wide read visibility.', true, CURRENT_TIMESTAMP),
  ('exec_role_design_asst_0001', 'Design Assistant', 'Executive position · Creative production and design operations support.', true, CURRENT_TIMESTAMP),
  ('exec_role_external_comms_0001', 'External Communications Lead', 'Executive position · External voice, media, campaigns, and public communications.', true, CURRENT_TIMESTAMP),
  ('exec_role_internal_comms_0001', 'Internal Communications Assistant', 'Executive position · Member updates, internal coordination, and meeting communications.', true, CURRENT_TIMESTAMP),
  ('exec_role_partnerships_0001', 'Partnerships Lead', 'Executive position · Partnerships, resource mobilization, and stakeholder relationships.', true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "isSystem" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

-- Clarify the purpose of the existing permission bundles in the role picker.
UPDATE "admin_roles" SET "description" = CASE "name"
  WHEN 'Owner' THEN 'Full platform control, including administrators, roles, settings, and sensitive exports.'
  WHEN 'Administrator' THEN 'Broad day-to-day administration across website, people, events, and communications.'
  WHEN 'Content Manager' THEN 'Create, edit, review, publish, and archive website content.'
  WHEN 'Events Manager' THEN 'Create and manage events, registrations, attendance, and event exports.'
  WHEN 'Membership Manager' THEN 'Review and manage member registrations and member records.'
  WHEN 'Communications Manager' THEN 'Create campaigns, manage communications, and send approved messages.'
  WHEN 'Reviewer' THEN 'Review submitted content and records without full management control.'
  WHEN 'Analyst' THEN 'Read operational information and reporting data without editing it.'
  WHEN 'Auditor' THEN 'Read audit records and accountability information.'
  WHEN 'Viewer' THEN 'Authenticated account with no admin-section access until another role is assigned.'
  ELSE "description"
END,
"updatedAt" = CURRENT_TIMESTAMP
WHERE "name" IN ('Owner', 'Administrator', 'Content Manager', 'Events Manager', 'Membership Manager', 'Communications Manager', 'Reviewer', 'Analyst', 'Auditor', 'Viewer');

INSERT INTO "admin_role_permissions" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "admin_roles" role
CROSS JOIN "admin_permissions" permission
WHERE role."name" IN (
  'Chief Executive Officer (CEO)',
  'Chief Operating Officer (COO)',
  'Chief Innovation Officer (CIO)',
  'Chief Strategy and Well-being Officer (CSWO)',
  'Head of Design',
  'Design Assistant',
  'External Communications Lead',
  'Internal Communications Assistant',
  'Partnerships Lead'
)
AND permission."key" IN ('dashboard.read', 'careers.read', 'careers.review')
ON CONFLICT DO NOTHING;

-- The Head of Design needs organization-wide visibility to keep brand, product,
-- and communication work aligned. This intentionally grants read access only;
-- mutations, exports, role changes, and settings management remain separate.
INSERT INTO "admin_role_permissions" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "admin_roles" role
CROSS JOIN "admin_permissions" permission
WHERE role."name" = 'Head of Design'
  AND permission."key" IN (
    'dashboard.read',
    'careers.read',
    'content.read',
    'members.read',
    'events.read',
    'communications.read',
    'contacts.read',
    'newsletter.read',
    'media.read',
    'users.read',
    'roles.read',
    'audit.read',
    'settings.read'
  )
ON CONFLICT DO NOTHING;

-- Match existing executive administrator accounts to their recorded public role.
INSERT INTO "admin_user_roles" ("userId", "roleId")
SELECT admin_user."id", admin_role."id"
FROM "admin_users" admin_user
JOIN "executive_leaders" leader ON LOWER(leader."email") = LOWER(admin_user."email")
JOIN "admin_roles" admin_role ON admin_role."name" = leader."role"
ON CONFLICT DO NOTHING;
