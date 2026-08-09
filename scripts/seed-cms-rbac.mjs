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
  await db.adminPermission.createMany({ data: permissions.map((key) => ({ key })), skipDuplicates: true });
  await db.adminRole.createMany({ data: Object.keys(rolePermissions).map((name) => ({ name, isSystem: true })), skipDuplicates: true });

  const [permissionList, roleList] = await Promise.all([db.adminPermission.findMany(), db.adminRole.findMany()]);
  const permissionRows = new Map(permissionList.map((row) => [row.key, row.id]));
  const roleRows = new Map(roleList.map((row) => [row.name, row.id]));
  const grants = Object.entries(rolePermissions).flatMap(([name, keys]) => keys.map((key) => ({
    roleId: roleRows.get(name), permissionId: permissionRows.get(key),
  })));
  await db.adminRolePermission.createMany({ data: grants, skipDuplicates: true });

  const ownerEmail = (process.env.CMS_OWNER_EMAIL ?? "royokola3@gmail.com").toLowerCase();
  const owner = await db.adminUser.upsert({ where: { email: ownerEmail }, update: { isActive: true }, create: { email: ownerEmail } });
  await db.adminUserRole.upsert({
    where: { userId_roleId: { userId: owner.id, roleId: roleRows.get("Owner") } },
    update: {}, create: { userId: owner.id, roleId: roleRows.get("Owner") },
  });

  const admins = await db.adminUser.findMany({ include: { roles: true } });
  await db.adminUserRole.createMany({
    data: admins.filter((admin) => admin.id !== owner.id && admin.roles.length === 0).map((admin) => ({ userId: admin.id, roleId: roleRows.get("Administrator") })),
    skipDuplicates: true,
  });

  const features = ["content", "pages", "programs", "events", "members", "media", "communications", "users", "audit"];
  await db.cmsFeatureFlag.createMany({
    data: features.map((key) => ({ key: `cms.${key}`, enabled: key === "audit", description: `CMS ${key} module` })),
    skipDuplicates: true,
  });
}

main().finally(() => db.$disconnect());
