import "server-only";

export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",

  CONTENT_READ: "content.read",
  CONTENT_CREATE: "content.create",
  CONTENT_UPDATE: "content.update",
  CONTENT_REVIEW: "content.review",
  CONTENT_PUBLISH: "content.publish",
  CONTENT_ARCHIVE: "content.archive",

  MEMBERS_READ: "members.read",
  MEMBERS_CREATE: "members.create",
  MEMBERS_UPDATE: "members.update",
  MEMBERS_REVIEW: "members.review",
  MEMBERS_EXPORT: "members.export",
  MEMBERS_DELETE: "members.delete",

  EVENTS_READ: "events.read",
  EVENTS_CREATE: "events.create",
  EVENTS_UPDATE: "events.update",
  EVENTS_PUBLISH: "events.publish",
  EVENTS_MANAGE_ATTENDANCE: "events.manage_attendance",

  COMMUNICATIONS_READ: "communications.read",
  COMMUNICATIONS_CREATE: "communications.create",
  COMMUNICATIONS_SEND: "communications.send",

  CONTACTS_READ: "contacts.read",
  CONTACTS_RESPOND: "contacts.respond",
  CONTACTS_DELETE: "contacts.delete",

  NEWSLETTER_READ: "newsletter.read",
  NEWSLETTER_EXPORT: "newsletter.export",
  NEWSLETTER_MANAGE: "newsletter.manage",

  MEDIA_READ: "media.read",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_UPDATE: "media.update",
  MEDIA_DELETE: "media.delete",

  USERS_READ: "users.read",
  USERS_INVITE: "users.invite",
  USERS_UPDATE: "users.update",
  USERS_DISABLE: "users.disable",

  ROLES_READ: "roles.read",
  ROLES_MANAGE: "roles.manage",

  AUDIT_READ: "audit.read",
  SETTINGS_READ: "settings.read",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const SYSTEM_ROLES = {
  OWNER: "Owner",
  ADMINISTRATOR: "Administrator",
  CONTENT_MANAGER: "Content Manager",
  MEMBERSHIP_MANAGER: "Membership Manager",
  EVENTS_MANAGER: "Events Manager",
  COMMUNICATIONS_MANAGER: "Communications Manager",
  REVIEWER: "Reviewer",
  ANALYST: "Analyst",
  AUDITOR: "Auditor",
} as const;
