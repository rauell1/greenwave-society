# CMS production runbook

## Rollback point

The pre-CMS production database is preserved as Neon branch `backup/pre-cms-launch-20260810` (`br-fragrant-hall-atrzhlcq`). Do not delete it until the post-launch retention window has passed.

## Deployment order

1. Run tests, TypeScript, ESLint, production build, and production dependency audit.
2. Apply Prisma migrations and verify `prisma migrate status` reports no pending migrations.
3. Run `npm run cms:seed` and verify roles, permissions, owner, and feature flags.
4. Configure Resend webhook endpoint `https://greenwavesociety.org/api/webhooks/resend` for sent, delivered, delayed, bounced, failed, suppressed, and complained events. Store its signing secret as `RESEND_WEBHOOK_SECRET`.
5. Deploy the same verified commit to production.
6. Enable CMS flags in this order: content/pages/programs, members, events, media, communications, users. Verify each before continuing.
7. Scan Vercel runtime logs for errors and verify `/api/health` returns 200.

## Rollback

- Disable all CMS feature flags first. Existing public content remains independent of CMS flags.
- Roll back the Vercel deployment to the prior production deployment.
- Database changes are additive. Prefer leaving the new tables in place while disabled. For a full data rollback, restore or branch from `br-fragrant-hall-atrzhlcq` after confirming which post-launch writes must be retained.

## Operational checks

- Daily: failed campaign recipients, bounced/complained subscriptions, failed audit outcomes, runtime errors.
- Weekly: admin accounts and role grants, unused media, Blob usage, database storage and connection utilization.
- Monthly: restore drill from a Neon branch, dependency audit, access review, and webhook signing-secret rotation planning.
