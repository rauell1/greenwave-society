# Shared rate limiting

Production uses PostgreSQL counters in `rate_limit_buckets`. The atomic UPSERT
enforces one fixed window across concurrent requests and application instances.
Keys are SHA-256 hashes; raw email addresses and IP addresses are not stored.
Expired counters are cleaned in batches, at most once every five minutes per
instance. Counters stop incrementing after the rejection threshold.

## Rollout

Apply `20261006180000_shared_rate_limits` with `npm run db:deploy` before deploying
the application. It adds a table and index without modifying existing data.
Use an already baselined environment, as described in `cms-migrations.md`.
Rollback application code if necessary; leave the additive table in place.

Development uses memory unless `RATE_LIMIT_STORE=database` is set. Enable
development proxy limits with `ENABLE_RATE_LIMITING=true`. Production always
uses the database and does not fall back to memory on failure: protected APIs
return HTTP 503 with a retry hint if the store is unavailable.

## Policies

- General API traffic: `RATE_LIMIT_MAX_REQUESTS` per `RATE_LIMIT_WINDOW_MS`.
- Sensitive contact, registration, newsletter and admin mutations: 15 requests
  per 15 minutes per client.
- Registration status: additionally 5 lookups per normalized email per hour.
- Health checks, Resend webhooks and the three M-Pesa callback routes are exempt
  from proxy limits, preserving provider acknowledgment behaviour. Their handlers
  retain their existing provider validation and idempotency handling.

The Next.js 16 `src/proxy.ts` entry point uses the Node runtime so Prisma can
access PostgreSQL. Contact requests are counted once in the proxy, rather than
again in the contact route. Responses include remaining-limit and reset headers.

## Trusted proxy headers

On Vercel the client identifier uses `x-vercel-forwarded-for`, with the platform
forwarded header as fallback. `cf-connecting-ip` is used only when
`TRUST_CLOUDFLARE_IP=true`; enable that only when direct access to the origin is
blocked. On other hosts, configure the reverse proxy to replace client-supplied
`x-forwarded-for` and `x-real-ip` headers. Unknown clients share an `unknown`
bucket, so correct proxy configuration matters.

At high traffic volumes, monitor database latency and consider a dedicated
shared cache. The database implementation is appropriate for the current site
and avoids a new service dependency.
