import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  const db = {
    adminUser: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    adminRole: { findMany: vi.fn() },
    adminUserRole: { deleteMany: vi.fn(), createMany: vi.fn() },
    adminSession: { deleteMany: vi.fn(), updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
    executiveLeader: { findMany: vi.fn() },
    $transaction: vi.fn(),
  };
  return { db, send: vi.fn(), currentAdmin: vi.fn(), requirePermission: vi.fn(), createSession: vi.fn(), setCookie: vi.fn() };
});
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/admin-auth", () => ({
  hashPassword: (password: string) => `hashed:${password}`,
  verifyPassword: (password: string, hash: string) => hash === `hashed:${password}`,
  generateResetToken: () => ({ token: "new-reset-token", expiry: new Date(Date.now() + 3600000) }),
  createAdminSession: mocks.createSession, setAdminSessionCookie: mocks.setCookie,
}));
vi.mock("@/lib/email", () => ({ sendPasswordResetEmail: mocks.send }));
vi.mock("@/lib/auth/guards", () => ({ getCurrentAdmin: mocks.currentAdmin, requirePermission: mocks.requirePermission, requireAnyPermission: mocks.requirePermission }));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/audit/audit-service", () => ({ AUDIT_ACTIONS: { ADMIN_DELETED: "ADMIN_DELETED" }, logAuditEvent: vi.fn() }));

import { POST as login } from "@/app/api/admin/login/route";
import { POST as forgot } from "@/app/api/admin/forgot-password/route";
import { POST as reset } from "@/app/api/admin/reset-password/route";
import { POST as setup } from "@/app/api/admin/setup-password/route";
import { POST as create, GET as list } from "@/app/api/admin/users/route";
import { DELETE as remove, PATCH as update } from "@/app/api/admin/users/[id]/route";

const user = { id: "target", email: "new-admin@example.com", isActive: true, deletedAt: null, passwordHash: "hashed:valid-password", resetToken: "reset-token", resetTokenExpiry: new Date(Date.now() + 3600000), roles: [{ role: { id: "role", name: "Reviewer" } }] };
const actor = { id: "owner", email: "owner@example.com", roles: ["Owner"], permissions: [], isActive: true };
const context = { params: Promise.resolve({ id: "target" }) };
function request(body: unknown = {}, method = "POST") {
  return new NextRequest("https://example.com/api/admin/test", { method, ...(method !== "DELETE" ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {}) });
}
const resetBody = { token: "reset-token", password: "new-password", confirm: "new-password" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.db.$transaction.mockImplementation(async (fn: (db: typeof mocks.db) => unknown) => fn(mocks.db));
  mocks.db.adminUser.findUnique.mockResolvedValue({ ...user });
  mocks.db.adminUser.findMany.mockResolvedValue([]);
  mocks.db.adminUser.count.mockResolvedValue(2);
  mocks.db.adminUser.updateMany.mockResolvedValue({ count: 1 });
  mocks.db.adminUser.update.mockResolvedValue(user);
  mocks.db.adminUser.create.mockResolvedValue(user);
  mocks.db.adminRole.findMany.mockResolvedValue([{ id: "role", name: "Reviewer" }]);
  mocks.db.executiveLeader.findMany.mockResolvedValue([]);
  mocks.currentAdmin.mockResolvedValue(actor);
  mocks.requirePermission.mockResolvedValue(actor);
  mocks.createSession.mockResolvedValue("session");
  mocks.send.mockResolvedValue(true);
});

describe("database-controlled admin authentication", () => {
  it("allows an active DB user to log in without an environment allowlist", async () => {
    const result = await login(request({ email: " NEW-ADMIN@EXAMPLE.COM ", password: "valid-password" }));
    expect(result.status).toBe(200);
    expect(mocks.db.adminUser.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
    expect(mocks.createSession).toHaveBeenCalledWith("target", expect.any(Object));
  });
  it.each([null, { ...user, isActive: false }, { ...user, deletedAt: new Date() }])("rejects unknown, disabled, and deleted users", async value => {
    mocks.db.adminUser.findUnique.mockResolvedValue(value);
    expect((await login(request({ email: user.email, password: "valid-password" }))).status).toBe(403);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("rejects incorrect passwords", async () => {
    expect((await login(request({ email: user.email, password: "wrong" }))).status).toBe(401);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("directs a new admin to email verification", async () => {
    mocks.db.adminUser.findUnique.mockResolvedValue({ ...user, passwordHash: null });
    expect(await (await login(request({ email: user.email, password: "anything" }))).json()).toMatchObject({ code: "NO_PASSWORD" });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("blocks password setup without a mailbox token", async () => {
    expect((await setup()).status).toBe(410);
    expect(mocks.db.adminUser.update).not.toHaveBeenCalled();
  });
});

describe("password recovery", () => {
  it("emails active DB users without creating accounts", async () => {
    expect((await forgot(request({ email: user.email }))).status).toBe(200);
    expect(mocks.send).toHaveBeenCalledWith(user.email, expect.stringContaining("new-reset-token"));
    expect(mocks.db.adminUser.create).not.toHaveBeenCalled();
  });
  it.each([null, { ...user, isActive: false }, { ...user, deletedAt: new Date() }])("does not send or mint tokens for inaccessible accounts", async value => {
    mocks.db.adminUser.findUnique.mockResolvedValue(value);
    expect(await (await forgot(request({ email: user.email }))).json()).toEqual({ success: true });
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.db.adminUser.updateMany).not.toHaveBeenCalled();
  });
  it("does not send if disabled while the request is running", async () => {
    mocks.db.adminUser.updateMany.mockResolvedValue({ count: 0 });
    await forgot(request({ email: user.email }));
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("clears failed delivery tokens without exposing the link", async () => {
    mocks.send.mockResolvedValue(false);
    const result = await forgot(request({ email: user.email }));
    expect(result.status).toBe(503);
    expect(await result.json()).not.toHaveProperty("resetUrl");
    expect(mocks.db.adminUser.updateMany).toHaveBeenLastCalledWith({ where: { email: user.email, resetToken: "new-reset-token" }, data: { resetToken: null, resetTokenExpiry: null } });
  });
  it("sets the password and revokes sessions atomically", async () => {
    expect((await reset(request(resetBody))).status).toBe(200);
    expect(mocks.db.adminUser.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isActive: true, deletedAt: null, resetToken: "reset-token" }), data: { passwordHash: "hashed:new-password", resetToken: null, resetTokenExpiry: null } }));
    expect(mocks.db.adminSession.updateMany).toHaveBeenCalled();
  });
  it.each([null, { ...user, isActive: false }, { ...user, deletedAt: new Date() }, { ...user, resetTokenExpiry: new Date(0) }])("rejects invalid, expired, disabled and deleted reset targets", async value => {
    mocks.db.adminUser.findUnique.mockResolvedValue(value);
    expect((await reset(request(resetBody))).status).toBe(400);
    expect(mocks.db.adminUser.updateMany).not.toHaveBeenCalled();
  });
  it("rejects a consumed token or account disabled during reset", async () => {
    mocks.db.adminUser.updateMany.mockResolvedValue({ count: 0 });
    expect((await reset(request(resetBody))).status).toBe(400);
    expect(mocks.db.adminSession.updateMany).not.toHaveBeenCalled();
  });
});

describe("admin lifecycle", () => {
  it("adds an admin with exactly their assigned roles", async () => {
    mocks.db.adminUser.findUnique.mockResolvedValue(null);
    expect((await create(request({ email: user.email, roleIds: ["role"] }))).status).toBe(201);
    expect(mocks.db.adminUser.create).toHaveBeenCalledWith(expect.objectContaining({ data: { email: user.email, roles: { create: [{ roleId: "role" }] } } }));
  });
  it("re-adding a deleted email clears all old credentials and sessions", async () => {
    mocks.db.adminUser.findUnique.mockResolvedValue({ ...user, deletedAt: new Date() });
    expect((await create(request({ email: user.email, roleIds: ["role"] }))).status).toBe(201);
    expect(mocks.db.adminUser.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ deletedAt: null, isActive: true, passwordHash: null, resetToken: null }) }));
    expect(mocks.db.adminSession.deleteMany).toHaveBeenCalled();
  });
  it("hides deleted administrators from the list", async () => {
    await list();
    expect(mocks.db.adminUser.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { deletedAt: null } }));
  });
  it("requires authentication and management permission for deletion", async () => {
    mocks.currentAdmin.mockResolvedValue(null);
    expect((await remove(request({}, "DELETE"), context)).status).toBe(401);
    mocks.currentAdmin.mockResolvedValue({ ...actor, roles: ["Reviewer"] });
    expect((await remove(request({}, "DELETE"), context)).status).toBe(403);
    expect(mocks.db.adminUser.update).not.toHaveBeenCalled();
  });
  it("protects your own account", async () => {
    expect((await remove(request({}, "DELETE"), { params: Promise.resolve({ id: actor.id }) })).status).toBe(400);
    expect(mocks.db.$transaction).not.toHaveBeenCalled();
  });
  it("protects the last active owner", async () => {
    mocks.db.adminUser.findUnique.mockResolvedValue({ ...user, roles: [{ role: { name: "Owner" } }] });
    mocks.db.adminUser.count.mockResolvedValue(1);
    expect((await remove(request({}, "DELETE"), context)).status).toBe(409);
    expect(mocks.db.adminUser.update).not.toHaveBeenCalled();
  });
  it("deletes access, credentials and sessions but preserves the record and audit history", async () => {
    expect((await remove(request({}, "DELETE"), context)).status).toBe(200);
    expect(mocks.db.adminUser.update).toHaveBeenCalledWith({ where: { id: "target" }, data: { deletedAt: expect.any(Date), isActive: false, passwordHash: null, resetToken: null, resetTokenExpiry: null } });
    expect(mocks.db.adminSession.deleteMany).toHaveBeenCalledWith({ where: { userId: "target" } });
    expect(mocks.db.adminUserRole.deleteMany).toHaveBeenCalledWith({ where: { userId: "target" } });
    expect(mocks.db.auditLog.create).toHaveBeenCalled();
    expect(mocks.db.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });
  it("does not enable a deleted user through PATCH", async () => {
    mocks.db.adminUser.findUnique.mockResolvedValue({ ...user, deletedAt: new Date() });
    expect((await update(request({ isActive: true, roleIds: ["role"] }), context)).status).toBe(404);
    expect(mocks.db.adminUser.update).not.toHaveBeenCalled();
  });
  it("disabling clears reset links and revokes sessions", async () => {
    expect((await update(request({ isActive: false, roleIds: ["role"] }), context)).status).toBe(200);
    expect(mocks.db.adminUser.update).toHaveBeenCalledWith({ where: { id: "target" }, data: { isActive: false, resetToken: null, resetTokenExpiry: null } });
    expect(mocks.db.adminSession.updateMany).toHaveBeenCalled();
  });
});
