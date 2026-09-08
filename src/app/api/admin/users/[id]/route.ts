import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS, SYSTEM_ROLES } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { updateAdminSchema, wouldRemoveFinalOwner } from "@/lib/cms/admin-users";
import { AUDIT_ACTIONS, logAuditEvent } from "@/lib/audit/audit-service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const { id } = await params;
  if (id === admin.id) return NextResponse.json({ error: "You cannot change your own access from this screen." }, { status: 400 });
  const parsed = updateAdminSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid user configuration." }, { status: 400 });
  const db = getDb();
  const result = await db.$transaction(async tx => {
    const [target, roles, activeOwnerCount] = await Promise.all([
      tx.adminUser.findUnique({ where: { id }, include: { roles: { include: { role: true } } } }),
      tx.adminRole.findMany({ where: { id: { in: parsed.data.roleIds } } }),
      tx.adminUser.count({ where: { isActive: true, deletedAt: null, roles: { some: { role: { name: SYSTEM_ROLES.OWNER } } } } }),
    ]);
    if (!target || target.deletedAt) return { error: "Administrator not found.", status: 404 as const };
    if (roles.length !== new Set(parsed.data.roleIds).size) return { error: "One or more roles are invalid.", status: 400 as const };
    const targetIsOwner = target.isActive && target.roles.some(value => value.role.name === SYSTEM_ROLES.OWNER);
    const nextIsOwner = roles.some(role => role.name === SYSTEM_ROLES.OWNER);
    if (wouldRemoveFinalOwner({ targetIsOwner, nextIsOwner, activeOwnerCount, nextIsActive: parsed.data.isActive })) return { error: "The final active owner cannot be disabled or demoted.", status: 409 as const };
    await tx.adminUser.update({ where: { id }, data: { isActive: parsed.data.isActive, ...(!parsed.data.isActive ? { resetToken: null, resetTokenExpiry: null } : {}) } });
    await tx.adminUserRole.deleteMany({ where: { userId: id } });
    await tx.adminUserRole.createMany({ data: roles.map(role => ({ userId: id, roleId: role.id })) });
    if (!parsed.data.isActive) await tx.adminSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revocationReason: "administrator_disabled" } });
    return { target, roles };
  }, { isolationLevel: "Serializable" });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const { target, roles } = result;
  await logAuditEvent({ action: parsed.data.isActive ? AUDIT_ACTIONS.ADMIN_ENABLED : AUDIT_ACTIONS.ADMIN_DISABLED, actor: admin.email, actorUserId: admin.id, resourceType: "admin_user", resourceId: id, outcome: "SUCCESS", beforeState: { active: target.isActive, roles: target.roles.map(value => value.role.name) }, afterState: { active: parsed.data.isActive, roles: roles.map(role => role.name) } });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Sign in to manage administrators." }, { status: 401 });
  if (!hasPermission(admin, PERMISSIONS.ROLES_MANAGE)) return NextResponse.json({ error: "You do not have permission to delete administrators." }, { status: 403 });
  const { id } = await params;
  if (id === admin.id) return NextResponse.json({ error: "You cannot delete your own administrator account." }, { status: 400 });

  try {
    const result = await getDb().$transaction(async tx => {
      const target = await tx.adminUser.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
      if (!target || target.deletedAt) return { error: "Administrator not found.", status: 404 };
      const activeOwnerCount = await tx.adminUser.count({ where: { isActive: true, deletedAt: null, roles: { some: { role: { name: SYSTEM_ROLES.OWNER } } } } });
      if (wouldRemoveFinalOwner({ targetIsOwner: target.isActive && target.roles.some(value => value.role.name === SYSTEM_ROLES.OWNER), nextIsOwner: false, activeOwnerCount, nextIsActive: false })) {
        return { error: "The final active owner cannot be deleted.", status: 409 };
      }
      // Keep content authorship intact while permanently removing credentials and access.
      await tx.adminUser.update({ where: { id }, data: { deletedAt: new Date(), isActive: false, passwordHash: null, resetToken: null, resetTokenExpiry: null } });
      await tx.adminSession.deleteMany({ where: { userId: id } });
      await tx.adminUserRole.deleteMany({ where: { userId: id } });
      await tx.auditLog.create({ data: {
        action: AUDIT_ACTIONS.ADMIN_DELETED, actor: admin.email, actorUserId: admin.id,
        resourceType: "admin_user", resourceId: id, outcome: "SUCCESS",
        beforeState: JSON.stringify({ email: target.email, roles: target.roles.map(value => value.role.name) }),
        afterState: JSON.stringify({ active: false, deleted: true }),
      } });
      return { success: true };
    }, { isolationLevel: "Serializable" });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "The administrator could not be deleted. Refresh and try again." }, { status: 409 });
  }
}
