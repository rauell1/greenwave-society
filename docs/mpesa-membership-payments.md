# M-Pesa Membership Fee

Adds an M-Pesa STK Push membership fee to the join flow. **Off by default** — gated behind the
`payments.mpesa_membership` feature flag so it can be built and tested without affecting the live
site.

## How it works

1. An applicant submits the join form as today, creating a `MemberRegistration` in `pending` status.
2. If the feature flag is on, the join form immediately asks for an M-Pesa phone number and sends an
   STK Push for the membership fee (set from `/admin/settings`, default 500 KES) via
   `POST /api/registrations/[id]/pay`.
3. The applicant enters their M-Pesa PIN on their phone. Safaricom calls back to
   `POST /api/mpesa/callback`.
4. On a successful payment, the registration is **auto-approved**: status moves to `approved`, a
   member portal token is issued, and the existing membership-approval email is sent — the same
   outcome as an admin manually approving from the CMS, but immediate. If an admin already
   rejected/suspended the applicant before the callback arrives, the payment is recorded but the
   member status is left untouched (a human decision is never silently overridden).
5. On failure/cancellation/timeout, `membershipFeeStatus` is set to `failed` and the applicant can
   retry payment; their `MemberRegistration` stays `pending` for manual review as before.

## Data model

- `MemberRegistration.membershipFeeStatus`: `not_required` (flag off) | `pending` | `paid` | `failed`.
- `MembershipPayment`: one row per STK Push attempt (idempotent per registration), storing the
  Daraja checkout/merchant IDs, receipt number, and raw callback for audit.
- `AppSetting`: generic admin-editable key/value store; `payments.membership_fee_kes` holds the fee
  amount (falls back to the `MEMBERSHIP_FEE_KES` env var, then 500, if unset).

## Enabling it

1. Set `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`,
   `MPESA_CALLBACK_URL`, and `MPESA_ENVIRONMENT` (see `.env.example`).
2. In `/admin/settings` (requires `settings.manage`), set the membership fee amount and flip the
   "M-Pesa membership fee" switch on — no deploy or DB access required. (`FEATURE_MPESA_MEMBERSHIP=true`
   is also available for local/sandbox testing without touching the admin UI.)
3. Point Safaricom's callback URL at `/api/mpesa/callback`. This route is intentionally
   unauthenticated (Safaricom cannot log in) — before going live, allowlist Safaricom's callback IPs
   at the CDN/WAF (listed in the `mpesa-stk` package README).

## Implementation

Built on the [`mpesa-stk`](https://www.npmjs.com/package/mpesa-stk) package (idempotent initiation,
atomic callback dedup, poll fallback, reconciliation) with a custom `StorageAdapter`
(`src/lib/payments/adapter.ts`) so payment records live in this app's own Postgres via Prisma rather
than a second connection pool.

## Refunds

An admin can reverse a successful payment from `/admin/payments` — this calls Safaricom's
**Transaction Reversal** API, which credits the amount back to whoever paid. It requires
`payments.refund` (granted to Owner and Administrator by default — re-run `npm run cms:seed` after
pulling this change so the permission row exists for Administrator too) and a separate, more
privileged credential set from STK Push:

- `MPESA_INITIATOR_NAME` / `MPESA_INITIATOR_PASSWORD` — an API operator identity Safaricom issues
  once your Paybill/Till is registered (not available on the STK-only sandbox app alone).
- `MPESA_REVERSAL_CERTIFICATE` — Safaricom's public certificate (PEM) for the environment, used to
  encrypt the initiator password into Daraja's `SecurityCredential`. Sandbox and production use
  different certificates.

Until these are set, refund attempts fail with a clear "not configured" error rather than silently
doing nothing. A refund is purely a financial reversal — it does **not** automatically change the
member's status; suspend or reject them separately from `/admin/members` if that's also needed.

Refund attempts are tracked in `MembershipRefund` (one row per attempt, keyed by Daraja's
`ConversationID` for dedup), with the same atomic PENDING→terminal compare-and-swap guard the
payment callback uses, since Safaricom can redeliver the result. `POST /api/mpesa/reversal-result`
and `POST /api/mpesa/reversal-timeout` receive the outcome asynchronously — same unauthenticated,
always-ACK-200 rules as `/api/mpesa/callback`.
