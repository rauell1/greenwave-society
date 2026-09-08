import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ find: vi.fn(), update: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "test-session" }) }) }));
vi.mock("../db", () => ({ getDb: () => ({ adminSession: { findUnique: mocks.find, update: mocks.update } }) }));
import { getAdminSession } from "./session";

const session = { id: "session", userId: "admin", token: null, revokedAt: null, expiresAt: new Date(Date.now() + 60000), idleExpiresAt: null, user: { email: "admin@example.com", isActive: true, deletedAt: null } };
beforeEach(() => { vi.clearAllMocks(); mocks.find.mockResolvedValue(session); });
describe("session account checks", () => {
  it("accepts an active database account", async () => {
    expect(await getAdminSession()).toMatchObject({ userId: "admin", email: "admin@example.com" });
  });
  it.each([
    { ...session, user: { ...session.user, isActive: false } },
    { ...session, user: { ...session.user, deletedAt: new Date() } },
    { ...session, user: null, userId: null, token: "legacy|admin@example.com" },
    { ...session, revokedAt: new Date() },
  ])("rejects disabled, deleted, orphaned and revoked sessions", async value => {
    mocks.find.mockResolvedValue(value);
    expect(await getAdminSession()).toBeNull();
  });
});
