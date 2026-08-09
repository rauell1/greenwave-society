# CMS Content Module

Phase 2A adds versioned editorial content without changing any existing public page.

## Safety model

- The module is disabled unless `cms.content` is enabled in `cms_feature_flags` or `FEATURE_CMS_CONTENT=true` is set.
- Existing React page content remains the public source of truth.
- A CMS entry becoming `published` does not automatically replace a public section. Each public integration must be implemented and verified separately with its current content as the fallback.
- Every saved edit creates an immutable numbered revision.
- Create, update, review, publish, and archive operations use separate permissions.
- Mutations write structured audit records.

## Workflow

1. A content creator creates or edits a draft.
2. A reviewer moves it to `review`.
3. A publisher moves the reviewed entry to `published`.
4. An authorized publisher may archive an obsolete entry.

Content types currently supported are `page`, `program`, `story`, and `announcement`. Slugs are unique within a content type.

## Deployment

Apply `prisma/migrations/20260809210000_cms_content/migration.sql` on an isolated Neon branch first. After verification, deploy the migration to production and enable `cms.content` only for the intended environment. Do not connect published CMS entries to public components until their fallback and rollback behavior is covered by tests.
