import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
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
      tx.adminUser.count({ where: { isActive: true, roles: { some: { role: { name: SYSTEM_ROLES.OWNER } } } } }),
    ]);
    if (!target) return { error: "Administrator not found.", status: 404 as const };
    if (roles.length !== new Set(parsed.data.roleIds).size) return { error: "One or more roles are invalid.", status: 400 as const };
    const targetIsOwner = target.roles.some(value => value.role.name === SYSTEM_ROLES.OWNER);
    const nextIsOwner = roles.some(role => role.name === SYSTEM_ROLES.OWNER);
    if (wouldRemoveFinalOwner({ targetIsOwner, nextIsOwner, activeOwnerCount, nextIsActive: parsed.data.isActive })) return { error: "The final active owner cannot be disabled or demoted.", status: 409 as const };
    await tx.adminUser.update({ where: { id }, data: { isActive: parsed.data.isActive } });
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
