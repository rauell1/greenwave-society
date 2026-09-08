# Managing administrator access

An active database administrator account controls login and password recovery. `ADMIN_EMAILS` no longer grants access. Existing database accounts and assigned roles are preserved.

1. Sign in as an Owner or a user with `roles.manage` and open `/admin/users`.
2. Choose **Add administrator**, enter their email and assign the roles they need.
3. Ask them to open `/admin/forgot-password`. They receive an email link to establish their password. Adding an account does not automatically send an email.
4. To suspend access, clear **Active account** and choose **Save access**. This revokes sessions and reset links.
5. To remove access, choose **Delete administrator**, type their email and confirm. Deletion removes the account from the list and clears its credentials, roles, reset links and sessions. The underlying record remains for content authorship and audit history.

Your own account and the final active Owner cannot be deleted. A manager can explicitly add a deleted email again, assigning fresh roles; the user must establish a new password by email. Old passwords and sessions are not restored.

Password setup without an emailed token is retired. Environment-only legacy sessions must sign in again with an active database account. An address that existed only in `ADMIN_EMAILS` must be added through the administrator page.

Deployment applies the additive `20260908110000_admin_account_access` migration. It adds `deletedAt` and enables the stored Users feature flag. An explicit `DISABLE_CMS_USERS=true` override still disables the page. Production must retain a working Resend configuration for email delivery.
