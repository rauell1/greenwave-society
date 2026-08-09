import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const permissions = [
  "dashboard.read", "content.read", "content.create", "content.update", "content.review", "content.publish", "content.archive",
  "members.read", "members.create", "members.update", "members.review", "members.export", "members.delete",
  "events.read", "events.create", "events.update", "events.publish", "events.manage_attendance",
  "communications.read", "communications.create", "communications.send",
  "contacts.read", "contacts.respond", "contacts.delete",
  "newsletter.read", "newsletter.export", "newsletter.manage",
  "media.read", "media.upload", "media.update", "media.delete",
  "users.read", "users.invite", "users.update", "users.disable",
  "roles.read", "roles.manage", "audit.read", "settings.read", "settings.manage",
];

const rolePermissions = {
  Owner: permissions,
  Administrator: permissions.filter((key) => key !== "roles.manage"),
  "Content Manager": permissions.filter((key) => key.startsWith("content.") || key.startsWith("media.") || key === "dashboard.read"),
  "Membership Manager": permissions.filter((key) => key.startsWith("members.") || key.startsWith("contacts.") || key === "dashboard.read"),
  "Events Manager": permissions.filter((key) => key.startsWith("events.") || key === "members.read" || key === "dashboard.read"),
  "Communications Manager": permissions.filter((key) => key.startsWith("communications.") || key.startsWith("newsletter.") || key === "members.read" || key === "dashboard.read"),
  Reviewer: ["dashboard.read", "content.read", "content.review", "content.publish"],
  Analyst: ["dashboard.read", "content.read", "members.read", "events.read", "communications.read", "newsletter.read"],
  Auditor: ["dashboard.read", "audit.read"],
};

async function main() {
  const permissionRows = new Map();
  for (const key of permissions) {
    const row = await db.adminPermission.upsert({ where: { key }, update: {}, create: { key } });
    permissionRows.set(key, row.id);
  }

  const roleRows = new Map();
  for (const [name, keys] of Object.entries(rolePermissions)) {
    const role = await db.adminRole.upsert({ where: { name }, update: { isSystem: true }, create: { name, isSystem: true } });
    roleRows.set(name, role.id);
    for (const key of keys) {
      await db.adminRolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permissionRows.get(key) } },
        update: {},
        create: { roleId: role.id, permissionId: permissionRows.get(key) },
      });
    }
  }

  const ownerEmail = (process.env.CMS_OWNER_EMAIL ?? "royokola3@gmail.com").toLowerCase();
  const owner = await db.adminUser.upsert({ where: { email: ownerEmail }, update: { isActive: true }, create: { email: ownerEmail } });
  await db.adminUserRole.upsert({
    where: { userId_roleId: { userId: owner.id, roleId: roleRows.get("Owner") } },
    update: {}, create: { userId: owner.id, roleId: roleRows.get("Owner") },
  });

  const admins = await db.adminUser.findMany({ include: { roles: true } });
  for (const admin of admins) {
    if (admin.id !== owner.id && admin.roles.length === 0) {
      await db.adminUserRole.create({ data: { userId: admin.id, roleId: roleRows.get("Administrator") } });
    }
  }

  for (const key of ["content", "pages", "programs", "events", "members", "media", "communications", "users", "audit"]) {
    await db.cmsFeatureFlag.upsert({
      where: { key: `cms.${key}` },
      update: {},
      create: { key: `cms.${key}`, enabled: key === "audit", description: `CMS ${key} module` },
    });
  }
}

main().finally(() => db.$disconnect());
