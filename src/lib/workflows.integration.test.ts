import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { MpesaStk } from "mpesa-stk";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { AdminUserDto } from "@/lib/auth/types";

const mocks = vi.hoisted(() => ({ currentAdmin: vi.fn(), email: vi.fn(), eventEmail: vi.fn(), eventReminder: vi.fn(), revalidate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/guards", () => ({ getCurrentAdmin: mocks.currentAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/members/email", () => ({ sendMembershipDecisionEmail: mocks.email }));
vi.mock("@/lib/events/email", async importOriginal => ({ ...(await importOriginal<typeof import("@/lib/events/email")>()), sendEventRegistrationConfirmation: mocks.eventEmail, sendBatchEmails: mocks.eventReminder }));
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
import { POST as registerForEvent } from "@/app/api/events/[slug]/register/route";
import { sendScheduledEventEmails } from "@/lib/events/reminders";
import { importCampaignEvents } from "@/lib/events/import-campaign";
import { getEventPoster } from "@/lib/events/posters";
import { POST as changePoster } from "@/app/api/admin/events/[id]/poster/route";
import { isTimeToBeConfirmed } from "@/lib/events/nairobi-time";

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
  await db.cmsEvent.deleteMany();
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
    expect((await getPublishedNews()).filter(article => article.id === item.id)).toHaveLength(1);
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
  it("keeps published content live when it is edited in place", async () => {
    const response = await createContent(request("/api/admin/content", { type: "story", slug: "live-story", title: "Our story", body: "First version" }));
    const { item } = await response.json();
    const params = { params: Promise.resolve({ id: item.id }) };
    await setStatus(request("/api/admin/content/status", { status: "published" }), params);
    const revision = await reviseContent(request("/api/admin/content", { type: "story", slug: "live-story", title: "Our story", body: "Corrected version" }), params);
    expect(revision.status).toBe(200);
    expect(await getPublishedArticle("live-story")).toMatchObject({ body: "Corrected version" });
    expect(await db.cmsContent.findUnique({ where: { id: item.id } })).toMatchObject({ status: "published", version: 2 });
    mocks.currentAdmin.mockResolvedValue({ ...admin, permissions: [PERMISSIONS.CONTENT_UPDATE] });
    expect((await reviseContent(request("/api/admin/content", { type: "story", slug: "live-story", title: "Our story", body: "Unreviewed" }), params)).status).toBe(403);
    expect(await getPublishedArticle("live-story")).toMatchObject({ body: "Corrected version" });
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
    expect(await getPublishedArticle("updated-story")).toMatchObject({ body: "Second version" });
    expect(await db.cmsContent.findUnique({ where: { id: item.id } })).toMatchObject({ version: 2 });
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

describe("public event registration against PostgreSQL", () => {
  async function createEvent(data: { slug: string; status: string; capacity?: number | null }) {
    const startsAt = new Date(Date.now() + 7 * 86_400_000);
    return db.cmsEvent.create({ data: { title: "Trivia & Games Hang Out", description: "Games night", startsAt, endsAt: new Date(startsAt.getTime() + 3 * 3_600_000), createdById: admin.id, updatedById: admin.id, ...data } });
  }
  const signUp = (slug: string, email: string) => registerForEvent(request(`/api/events/${slug}/register`, { fullName: "Guest Person", email, phone: "0712 345 678" }), { params: Promise.resolve({ slug }) });

  it("registers until capacity, then waitlists, and rejects duplicates", async () => {
    mocks.eventEmail.mockResolvedValue(true);
    await createEvent({ slug: "trivia-night", status: "published", capacity: 1 });
    const first = await signUp("trivia-night", "one@example.com");
    expect(first.status).toBe(201);
    expect(await first.json()).toEqual({ status: "registered" });
    expect(await (await signUp("trivia-night", "two@example.com")).json()).toEqual({ status: "waitlisted" });
    expect((await signUp("trivia-night", "ONE@example.com")).status).toBe(409);
    expect(mocks.eventEmail).toHaveBeenCalledTimes(1);
  });
  it("sends 3-day and day-before reminders and a thank-you once each, by Nairobi date", async () => {
    mocks.eventReminder.mockImplementation(async (emails: unknown[]) => emails.map(() => true));
    // 08:00 Nairobi on Wednesday 18 November 2026, when the daily cron job runs.
    const now = new Date("2026-11-18T05:00:00Z");
    const event = async (slug: string, startsAt: string, endsAt: string) => db.cmsEvent.create({ data: { slug, title: slug, description: "Games", status: "published", startsAt: new Date(startsAt), endsAt: new Date(endsAt), createdById: admin.id, updatedById: admin.id } });
    const sat = await event("saturday-walk", "2026-11-21T07:00:00Z", "2026-11-21T10:00:00Z");
    const thu = await event("thursday-games", "2026-11-19T15:00:00Z", "2026-11-19T18:00:00Z");
    const mon = await event("monday-brunch", "2026-11-16T06:00:00Z", "2026-11-16T09:00:00Z");
    const later = await event("next-month", "2026-12-12T07:00:00Z", "2026-12-12T10:00:00Z");
    const signedUp = new Date("2026-11-10T09:00:00Z");
    await db.cmsEventRegistration.createMany({ data: [
      { eventId: sat.id, fullName: "Walker", email: "walker@example.com", createdAt: signedUp },
      { eventId: thu.id, fullName: "Player", email: "player@example.com", createdAt: signedUp },
      { eventId: thu.id, fullName: "Waiting", email: "wait@example.com", status: "waitlisted", createdAt: signedUp },
      { eventId: mon.id, fullName: "Attendee", email: "came@example.com", attendanceStatus: "checked_in", createdAt: signedUp },
      { eventId: mon.id, fullName: "No Show", email: "noshow@example.com", attendanceStatus: "no_show", createdAt: signedUp },
      { eventId: later.id, fullName: "Early Bird", email: "later@example.com", createdAt: signedUp },
    ] });
    expect(await sendScheduledEventEmails(now)).toMatchObject({ sent: { reminder3d: 1, reminder1d: 1, thankYou: 1 }, failed: 0 });
    const sent = mocks.eventReminder.mock.calls.flatMap(([emails]) => emails as { to: string; subject: string }[]);
    expect(sent.map(email => `${email.to}: ${email.subject}`).sort()).toEqual([
      "came@example.com: Thank you for joining monday-brunch",
      "player@example.com: Tomorrow: thursday-games",
      "walker@example.com: 3 days to go: saturday-walk",
    ]);
    expect(await sendScheduledEventEmails(now)).toMatchObject({ sent: { reminder3d: 0, reminder1d: 0, thankYou: 0 } });
    // A failed send is released and retried on the next run.
    mocks.eventReminder.mockClear();
    mocks.eventReminder.mockImplementationOnce(async (emails: unknown[]) => emails.map(() => false));
    expect(await sendScheduledEventEmails(new Date("2026-11-20T05:00:00Z"))).toMatchObject({ sent: { reminder1d: 0 }, failed: 1 });
    expect(await sendScheduledEventEmails(new Date("2026-11-20T06:00:00Z"))).toMatchObject({ sent: { reminder1d: 1 }, failed: 0 });
  });
  it("adds the five campaign poster events once and publishes the Trivia night draft", async () => {
    await db.cmsEvent.create({ data: { slug: "trivia-and-games-hang-out", title: "Trivia & Games Hang Out", description: "Games", status: "draft", startsAt: new Date("2026-11-18T07:00:00Z"), endsAt: new Date("2026-11-18T10:00:00Z"), createdById: admin.id, updatedById: admin.id } });
    expect(await importCampaignEvents(admin)).toHaveLength(6);
    expect(await importCampaignEvents(admin)).toHaveLength(0);
    const events = await db.cmsEvent.findMany({ orderBy: { startsAt: "asc" } });
    expect(events.map(event => event.slug)).toEqual(["trivia-and-games-hang-out", "charity-walk", "young-entrepreneurs-networking-brunch", "skills-for-change-workshop", "sports-tournament", "community-picnic"]);
    expect(events.every(event => event.status === "published")).toBe(true);
    expect(events.slice(1).every(event => event.location === null)).toBe(true);
    expect(isTimeToBeConfirmed(events[1].startsAt, events[1].endsAt)).toBe(true);
    expect(events[2].startsAt.toISOString()).toBe("2026-11-29T06:00:00.000Z");
  });
  it("lets admins replace, remove and restore an event poster", async () => {
    admin.permissions.push(PERMISSIONS.EVENTS_UPDATE);
    vi.stubEnv("FEATURE_CMS_EVENTS", "true");
    await importCampaignEvents(admin);
    const walk = (await db.cmsEvent.findUnique({ where: { slug: "charity-walk" } }))!;
    const params = { params: Promise.resolve({ id: walk.id }) };
    expect((await getEventPoster(walk))?.src).toBe("/posters/campaign-2026/charity-walk.jpg");
    const blob = "https://abc123.public.blob.vercel-storage.com/media/new-walk-poster.webp";
    expect((await changePoster(request("/poster", { action: "set", src: blob, alt: "New walk poster", width: 1080, height: 1350 }), params)).status).toBe(200);
    expect(await getEventPoster(walk)).toMatchObject({ src: blob, alt: "New walk poster", height: 1350 });
    expect((await changePoster(request("/poster", { action: "set", src: "https://example.com/x.jpg" }), params)).status).toBe(400);
    expect((await changePoster(request("/poster", { action: "remove" }), params)).status).toBe(200);
    expect(await getEventPoster(walk)).toBeNull();
    expect((await changePoster(request("/poster", { action: "reset" }), params)).status).toBe(200);
    expect((await getEventPoster(walk))?.src).toBe("/posters/campaign-2026/charity-walk.jpg");
    vi.unstubAllEnvs();
  });
  it("records vendors with their business name", async () => {
    mocks.eventEmail.mockResolvedValue(true);
    await createEvent({ slug: "picnic-night", status: "published" });
    const vendor = await registerForEvent(request("/api/events/picnic-night/register", { fullName: "Stall Owner", email: "stall@example.com", phone: "0712345678", registerAs: "vendor" }), { params: Promise.resolve({ slug: "picnic-night" }) });
    expect(vendor.status).toBe(400);
    const ok = await registerForEvent(request("/api/events/picnic-night/register", { fullName: "Stall Owner", email: "stall@example.com", phone: "0712345678", registerAs: "vendor", businessName: "Mama Mboga Greens" }), { params: Promise.resolve({ slug: "picnic-night" }) });
    expect(ok.status).toBe(201);
    expect(await db.cmsEventRegistration.findFirst({ where: { email: "stall@example.com" } })).toMatchObject({ organization: "Mama Mboga Greens", metadata: { vendorName: "Mama Mboga Greens" } });
  });
  it("refuses registration for drafts and unknown events", async () => {
    await createEvent({ slug: "draft-night", status: "draft" });
    expect((await signUp("draft-night", "one@example.com")).status).toBe(409);
    expect((await signUp("missing-night", "one@example.com")).status).toBe(404);
    expect(await db.cmsEventRegistration.count()).toBe(0);
  });
});

it("enforces a shared limit across concurrent requests", async () => {
  const results = await Promise.all(Array.from({ length: 20 }, () => consumeRateLimit("concurrent-client", 5, 60000)));
  expect(results.filter(result => result.allowed)).toHaveLength(5);
  expect(await db.rateLimitBucket.count()).toBe(1);
});
