# Testing the CMS

Testing for the CMS relies on Vitest and standard Next.js build commands.

## Running Tests
Ensure there are no build errors or type checking issues by running:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Security & Authorization Tests (Phase 2 Focus)
When testing, ensure that:
1. **Unauthenticated access** receives a redirect or `401`.
2. **Unauthorized mutation** receives a `403`.
3. The **Owner** role correctly bypasses granular permission checks.
4. **Sessions** naturally expire or are actively revoked.

We rely on Server Actions and Route Handlers for mutations. These must all be tested via standard integration testing (using `next/server` abstractions and `vitest`).
