import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { createAdminSchema } from "@/lib/cms/admin-users";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

export async function GET() {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const [users, roles] = await Promise.all([
    getDb().adminUser.findMany({ orderBy: { email: "asc" }, select: { id: true, email: true, isActive: true, createdAt: true, roles: { select: { role: { select: { id: true, name: true } } } } } }),
    getDb().adminRole.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true, isSystem: true } }),
  ]);
  return NextResponse.json({ users: users.map(user => ({ ...user, roles: user.roles.map(value => value.role) })), roles });
}

export async function POST(request: NextRequest) {
  const admin = await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const parsed = createAdminSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "A valid email and at least one role are required." }, { status: 400 });
  const db = getDb();
  const validRoles = await db.adminRole.findMany({ where: { id: { in: parsed.data.roleIds } }, select: { id: true, name: true } });
  if (validRoles.length !== new Set(parsed.data.roleIds).size) return NextResponse.json({ error: "One or more roles are invalid." }, { status: 400 });
  const existing = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "An administrator with this email already exists." }, { status: 409 });
  const user = await db.adminUser.create({ data: { email: parsed.data.email, roles: { create: validRoles.map(role => ({ roleId: role.id })) } }, select: { id: true, email: true, isActive: true } });
  await logAuditEvent({ action: AUDIT_ACTIONS.ADMIN_CREATED, actor: admin.email, actorUserId: admin.id, resourceType: "admin_user", resourceId: user.id, outcome: "SUCCESS", afterState: { email: user.email, roles: validRoles.map(role => role.name) } });
  return NextResponse.json({ user, setup: "Ask the administrator to use Forgot password to create their password securely." }, { status: 201 });
}
