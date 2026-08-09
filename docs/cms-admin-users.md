# CMS Administrator Management

Phase 2B adds owner-only administrator and role management behind the disabled-by-default `cms.users` feature flag.

## Controls

- Only administrators with `roles.manage` can see or call the module.
- Administrators cannot change their own access from this screen.
- The final active Owner cannot be disabled or demoted.
- The final-owner check and role update run in a serializable transaction to prevent concurrent demotions.
- Disabling an administrator immediately revokes all of their active sessions.
- Role and account mutations are recorded in the audit log.
- New administrators are created without a password and use the existing Forgot password flow to establish one securely.

Enable `cms.users` only after the Phase 1 RBAC seed has assigned the owner account in the target environment.
