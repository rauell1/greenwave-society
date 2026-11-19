# Contributing to Greenwave Society

Thank you for helping improve Greenwave Society. Issues and pull requests are welcome. The repository owner reviews every change and decides what is merged.

By taking part you agree to follow the [code of conduct](CODE_OF_CONDUCT.md). Report security problems privately as described in [SECURITY.md](SECURITY.md), never in an issue.

## Before you start

- Check the open issues, and open one for any change larger than a small fix so the approach can be agreed first.
- Keep each pull request focused on one change.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm ci
cp .env.example .env.local
npm run db:generate
npm run dev
```

Fill in `.env.local` from `.env.example` where the project has one. Ask the owner for development credentials; never use production secrets locally.

## Branches and commits

- Branch from `main` and name the branch after the change, for example `fix/contact-form-validation` or `feature/event-export`.
- Write commit messages in the imperative mood ("Add event export", not "Added event export"), with a short summary line and a body that explains why.
- Never push directly to `main`; every change goes through a pull request.

## Checks before opening a pull request

```bash
npm run lint
npm test
```

All of them must pass. If a check fails for a reason unrelated to your change, say so in the pull request.

## Database changes

Create Prisma migrations and apply them with `npm run db:deploy`. Never run `db:push` or `db:reset` against production.

## Pull requests

1. Fill in the pull request template: what changed, why, and how you tested it.
2. Add screenshots or a short recording for visual changes, at phone and desktop widths.
3. Update the README, `.env.example` and any affected docs in the same pull request.
4. Wait for review. The owner may ask for changes; push them to the same branch.
5. The owner merges. Merging to `main` deploys to production, so only merge work that is ready for users.

## Style and content rules

- Follow the existing structure, naming and formatting of the code around your change, and keep TypeScript strict where it is used.
- Do not use em or en dash characters in code, comments, copy or docs. Use a hyphen, a colon or a new sentence instead.
- Never commit secrets, real personal data or generated build output.
- Keep user-facing claims factual and verifiable.
- Operational runbooks live in `docs/` (production runbook, payments, rate limiting).

## Deployment

Production runs on Cloudflare Workers at https://greenwavesociety.org. `.github/workflows/deploy-cloudflare.yml` builds and deploys on every push to `main`, using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. Public build-time values are repository variables; runtime secrets are Worker secrets.

## Questions

Open an issue (for public repositories) or contact the repository owner (GitHub: rauell1).
