# Testing the CMS foundation

Run:

```bash
npm test
npm run lint
npx tsc --noEmit
npx prisma validate
npm run build
```

Current focused tests cover owner permission inheritance, explicit grants, deny-by-default behavior, opaque session-token hashing, recursive audit redaction, and pagination limits.

Before production deployment, apply the migration and seed to an isolated Neon branch, then verify login, logout, idle expiration, password-reset revocation, `401`/`403` route behavior, audit filtering, mobile navigation, and existing constitution/member workflows.
