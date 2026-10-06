# Greenwave Society

Greenwave Society's website and administration system for youth leadership,
community programmes, conservation, membership, and communications in Kenya.

The application uses Next.js 16, React 19, TypeScript, Tailwind CSS 4,
PostgreSQL with Prisma, and Radix UI. It includes a permission-controlled CMS,
events, careers, membership review, M-Pesa membership payments and refunds,
media management, and email campaigns.

## Local setup

Use Node.js 20.9 or newer and npm. `package-lock.json` is the dependency lockfile
used by CI; use `npm ci` for reproducible installs.

```powershell
npm ci
Copy-Item .env.example .env.local
```

Configure a local PostgreSQL database in both `DATABASE_URL` and
`DIRECT_DATABASE_URL`, and replace the example session secret. Prisma CLI
commands do not automatically load `.env.local`; export the database variables
in your terminal or supply a local `.env` file before running database commands.

For a **new, disposable development database**, create the schema:

```powershell
npm run db:push
npm run dev
```

For an existing environment, follow [the migration guide](docs/cms-migrations.md)
instead. The historical migrations assume a database that predates Prisma's
migration history, so they cannot initialize an empty database by themselves.
Admin account setup is documented in [admin access](docs/admin-access.md).

The development site runs at `http://localhost:3000`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma client and build with TypeScript checks |
| `npm start` | Serve the production build with `next start` |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Generate Next.js route types and check TypeScript |
| `npm test` | Run unit and route tests |
| `npm run test:integration` | Run PostgreSQL workflow tests against a disposable local database |
| `npm run images:check` | Validate source references against the CDN image inventory |
| `npm run images:check -- --remote` | Check referenced images on the CDN |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:deploy` | Apply pending migrations to an existing baselined database |
| `npm run cms:seed` | Seed CMS roles, permissions, and feature flags |

## Publishing website content

Enable the content module and grant the appropriate CMS permissions before
using `/admin/content`. Published news, articles, stories, and announcements
appear in `/news`. Activities and impact figures update the homepage and Impact
page. Drafts and archived entries remain private.

See [public content](docs/cms-public-content.md) for fields, publishing,
fallback behaviour, and cache updates. Media assets use the external image CDN;
see [image delivery](docs/image-delivery.md). Large local image working copies
are deliberately excluded from Git.

## Verification

CI runs lint, type checking, unit tests, the image inventory check, and the build.
A separate PostgreSQL service runs the workflow integration tests, including
payment callback retries, CMS permissions, publishing, and concurrent limits.

For local integration tests, create an empty PostgreSQL database whose name ends
in `_test`. The runner only accepts localhost databases and deletes test fixtures.

```powershell
$env:TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/greenwave_test'
$env:DATABASE_URL = $env:TEST_DATABASE_URL
$env:DIRECT_DATABASE_URL = $env:TEST_DATABASE_URL
npm run db:push
npm run test:integration
```

Email delivery is replaced with a test double, and payment callbacks run through
the real M-Pesa library and Prisma adapter without contacting Safaricom. These
checks complement manual browser checks; they do not validate live payments.

## Deployment

Vercel uses its native build output. Self-hosted deployments use `npm run build`
and `npm start`; this project does not produce a standalone server bundle.
Apply the additive shared-rate-limit migration **before deploying this release**:

```powershell
npm run db:deploy
```

Production rate limiting uses PostgreSQL, shared across application instances.
See [rate limiting](docs/rate-limiting.md) for rollout, trusted proxy headers, and
failure behaviour. Do not use `db:push` or `db:reset` against production.

Operational references:

- [Production runbook](docs/cms-production-runbook.md)
- [CMS permissions](docs/cms-permissions.md)
- [CMS security](docs/cms-security.md)
- [M-Pesa payments and refunds](docs/mpesa-membership-payments.md)
- [Security policy](SECURITY.md)
- [Dependency audit and outstanding upstream advisory](docs/dependency-audit.md)

Keep secrets in local environment files or the deployment platform. Environment
files are ignored by Git; `.env.example` contains placeholders only.
