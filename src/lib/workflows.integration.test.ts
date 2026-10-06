import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { MpesaStk } from "mpesa-stk";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { AdminUserDto } from "@/lib/auth/types";

const mocks = vi.hoisted(() => ({ currentAdmin: vi.fn(), email: vi.fn(), revalidate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/guards", () => ({ getCurrentAdmin: mocks.currentAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/members/email", () => ({ sendMembershipDecisionEmail: mocks.email }));
vi.mock("@/lib/payments/feature-flag", () => ({ isMpesaMembershipEnabled: async () => true }));
vi.mock("@/lib/payments/client", () => ({ getMpesaClient: () => paymentClient }));

import { getDb, closeDatabase } from "@/lib/db";
import { POST as register } from "@/app/api/registrations/route";
import { POST as callback } from "@/app/api/mpesa/callback/route";
import { POST as createContent } from "@/app/api/admin/content/route";
import { POST as setStatus } from "@/app/api/admin/content/[id]/status/route";
import { PATCH as reviseContent } from "@/app/api/admin/content/[id]/route";
import { getPublishedArticle, getPublishedNews } from "@/lib/cms/news";
import { getPublicHomepageContent } from "@/lib/cms/public-content";
import { IMPACT_STATS } from "@/config/app.config";
import { PrismaMembershipPaymentAdapter } from "@/lib/payments/adapter";
import { applyMembershipPaymentSettlement } from "@/lib/payments/settlement";
import { consumeRateLimit } from "@/lib/rate-limit";

let paymentClient: MpesaStk;
let admin: AdminUserDto;
const db = getDb();
const request = (path: string, body: unknown) => new NextRequest(`http://localhost:3000${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const membership = { fullName: "Test Member", email: "member@example.com", phone: "0712345678", county: "Nairobi", occupation: "student", meetsEligibility: true, acknowledged: true, interests: ["Conservation"], motivation: "I want to help conserve our local environment." };

beforeAll(async () => {
  // The runner restricts this suite to disposable localhost databases.
  const url = new URL(process.env.DATABASE_URL!);
  if (!url.pathname.endsWith("_test") || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("Unsafe integration database");
  paymentClient = new MpesaStk({ consumerKey: "test", consumerSecret: "test", shortCode: "174379", passKey: "test", callbackUrl: "https://example.com/api/mpesa/callback", environment: "sandbox" }, new PrismaMembershipPaymentAdapter(db));
  paymentClient.onPaymentSettled(applyMembershipPaymentSettlement);
});
beforeEach(async () => {
  vi.clearAllMocks();
  await db.cmsContent.deleteMany();
  await db.auditLog.deleteMany();
  await db.memberRegistration.deleteMany();
  await db.adminUser.deleteMany();
  await db.rateLimitBucket.deleteMany();
  const user = await db.adminUser.create({ data: { email: "editor@example.com", passwordHash: "unused-test-hash" } });
  admin = { id: user.id, email: user.email, isActive: true, roles: [], permissions: [PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_UPDATE, PERMISSIONS.CONTENT_PUBLISH, PERMISSIONS.CONTENT_ARCHIVE] };
  mocks.currentAdmin.mockResolvedValue(admin);
  mocks.email.mockResolvedValue({ sent: true, error: null });
});
afterAll(async () => { await closeDatabase(); });

async function submitMember(email = membership.email) {
  const response = await register(request("/api/registrations", { ...membership, email }));
  expect(response.status).toBe(201);
  expect(await response.clone().json()).toMatchObject({ success: true, paymentRequired: true });
  return (await response.json()).id as string;
}
async function addPayment(registrationId: string) {
  return db.membershipPayment.create({ data: { registrationId, amount: 500, phoneNumber: "254712345678", checkoutRequestId: `checkout-${registrationId}`, merchantRequestId: `merchant-${registrationId}`, status: "PENDING" } });
}
function successCallback(payment: { checkoutRequestId: string; merchantRequestId: string }) {
  return { Body: { stkCallback: { CheckoutRequestID: payment.checkoutRequestId, MerchantRequestID: payment.merchantRequestId, ResultCode: 0, ResultDesc: "Success", CallbackMetadata: { Item: [{ Name: "Amount", Value: 500 }, { Name: "MpesaReceiptNumber", Value: "TESTRECEIPT" }, { Name: "TransactionDate", Value: 20261006120000 }, { Name: "PhoneNumber", Value: 254712345678 }] } } } };
}

describe("membership and payment workflows against PostgreSQL", () => {
  it("registers, persists a successful callback, approves once, and handles a retry", async () => {
    const id = await submitMember();
    expect((await register(request("/api/registrations", membership))).status).toBe(429);
    const payment = await addPayment(id);
    expect((await callback(request("/api/mpesa/callback", successCallback(payment)))).status).toBe(200);
    await vi.waitFor(async () => expect(await db.memberRegistration.findUnique({ where: { id } })).toMatchObject({ status: "approved", active: true, membershipFeeStatus: "paid", onboardingEmailStatus: "sent" }));
    expect(await db.membershipPayment.findUnique({ where: { id: payment.id } })).toMatchObject({ status: "SUCCESS", mpesaReceiptNumber: "TESTRECEIPT" });
    await callback(request("/api/mpesa/callback", successCallback(payment)));
    expect(await db.memberStatusHistory.count({ where: { registrationId: id } })).toBe(1);
    expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it("preserves a rejection when a delayed successful payment arrives", async () => {
    const id = await submitMember();
    await db.memberRegistration.update({ where: { id }, data: { status: "rejected", active: false } });
    const payment = await addPayment(id);
    await callback(request("/api/mpesa/callback", successCallback(payment)));
    await vi.waitFor(async () => expect(await db.memberRegistration.findUnique({ where: { id } })).toMatchObject({ status: "rejected", active: false, membershipFeeStatus: "paid" }));
    expect(mocks.email).not.toHaveBeenCalled();
  });
  it("records a failed callback without approving membership", async () => {
    const id = await submitMember();
    const payment = await addPayment(id);
    await callback(request("/api/mpesa/callback", { Body: { stkCallback: { CheckoutRequestID: payment.checkoutRequestId, MerchantRequestID: payment.merchantRequestId, ResultCode: 1032, ResultDesc: "Cancelled" } } }));
    await vi.waitFor(async () => expect(await db.memberRegistration.findUnique({ where: { id } })).toMatchObject({ status: "pending", membershipFeeStatus: "failed" }));
    expect(mocks.email).not.toHaveBeenCalled();
  });
});

describe("CMS publishing and permissions against PostgreSQL", () => {
  it("keeps drafts private, publishes news with an audit trail, and removes archived news", async () => {
    const response = await createContent(request("/api/admin/content", { type: "news", slug: "community-work", title: "Community work", body: "Our latest work" }));
    expect(response.status).toBe(201);
    const { item } = await response.json();
    expect(await getPublishedArticle(item.slug)).toBeNull();
    const params = { params: Promise.resolve({ id: item.id }) };
    expect((await setStatus(request("/api/admin/content/status", { status: "published" }), params)).status).toBe(200);
    expect(await getPublishedArticle(item.slug)).toMatchObject({ id: item.id });
    expect(await getPublishedNews()).toHaveLength(1);
    expect(mocks.revalidate).toHaveBeenCalledWith("/news");
    expect(await db.auditLog.count({ where: { resourceId: item.id } })).toBe(2);
    await setStatus(request("/api/admin/content/status", { status: "archived" }), params);
    expect(await getPublishedArticle(item.slug)).toBeNull();
  });
  it("denies unauthenticated creation and publishing without permission", async () => {
    mocks.currentAdmin.mockResolvedValue(null);
    expect((await createContent(request("/api/admin/content", {}))).status).toBe(401);
    mocks.currentAdmin.mockResolvedValue({ ...admin, permissions: [PERMISSIONS.CONTENT_CREATE] });
    expect((await setStatus(request("/api/admin/content/status", { status: "published" }), { params: Promise.resolve({ id: "missing" }) })).status).toBe(403);
    expect(await db.cmsContent.count()).toBe(0);
  });
  it("stores revisions and withdraws renamed drafts until they are republished", async () => {
    const response = await createContent(request("/api/admin/content", { type: "story", slug: "old-story", title: "Our story", body: "First version" }));
    const { item } = await response.json();
    const params = { params: Promise.resolve({ id: item.id }) };
    await setStatus(request("/api/admin/content/status", { status: "published" }), params);
    const revision = await reviseContent(request("/api/admin/content", { type: "story", slug: "updated-story", title: "Updated story", body: "Second version" }), params);
    expect(revision.status).toBe(200);
    expect(await getPublishedArticle("old-story")).toBeNull();
    expect(await getPublishedArticle("updated-story")).toBeNull();
    expect(await db.cmsContentRevision.count({ where: { contentId: item.id } })).toBe(2);
    expect(mocks.revalidate).toHaveBeenCalledWith("/news/old-story");
    await setStatus(request("/api/admin/content/status", { status: "published" }), params);
    expect(await getPublishedArticle("updated-story")).toMatchObject({ body: "Second version", version: 2 });
  });
  it("publishes admin-maintained impact figures and activities onto public sections", async () => {
    const entries = [
      { type: "impact", slug: "impact-stats", title: "Our impact", body: "Current figures", metadata: { ...IMPACT_STATS, youthReached: 950 } },
      { type: "activity", slug: "community-day", title: "Community day", body: "A local clean up", metadata: { date: "2026-10-06", category: "Conservation", mediaUrl: "/gallery" } },
    ];
    for (const entry of entries) {
      const response = await createContent(request("/api/admin/content", entry));
      expect(response.status).toBe(201);
      const { item } = await response.json();
      await setStatus(request("/api/admin/content/status", { status: "published" }), { params: Promise.resolve({ id: item.id }) });
    }
    const content = await getPublicHomepageContent();
    expect(content.impact.youthReached).toBe(950);
    expect(content.activities).toMatchObject([{ title: "Community day", date: "2026-10-06" }]);
  });
});

it("enforces a shared limit across concurrent requests", async () => {
  const results = await Promise.all(Array.from({ length: 20 }, () => consumeRateLimit("concurrent-client", 5, 60000)));
  expect(results.filter(result => result.allowed)).toHaveLength(5);
  expect(await db.rateLimitBucket.count()).toBe(1);
});
