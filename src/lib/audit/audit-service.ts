import "server-only";
import { getDb } from "../db";
import { sanitizeAuditState } from "./sanitize";

export type AuditOutcome = "SUCCESS" | "FAILURE";

export interface AuditEventParams {
  action: string;
  actor: string;
  actorUserId?: string;
  detail?: string;
  ip?: string;
  resourceType?: string;
  resourceId?: string;
  requestId?: string;
  outcome?: AuditOutcome;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

export const AUDIT_ACTIONS = {
  AUTH_LOGIN_SUCCEEDED: "AUTH_LOGIN_SUCCEEDED",
  AUTH_LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  AUTH_LOGOUT: "AUTH_LOGOUT",
  SESSION_REVOKED: "SESSION_REVOKED",
  ADMIN_ROLE_ASSIGNED: "ADMIN_ROLE_ASSIGNED",
  ADMIN_ROLE_REMOVED: "ADMIN_ROLE_REMOVED",
  ADMIN_CREATED: "ADMIN_CREATED",
  ADMIN_DISABLED: "ADMIN_DISABLED",
  ADMIN_ENABLED: "ADMIN_ENABLED",
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  CONTENT_CREATED: "CONTENT_CREATED",
  CONTENT_UPDATED: "CONTENT_UPDATED",
  CONTENT_PUBLISHED: "CONTENT_PUBLISHED",
  CONTENT_ARCHIVED: "CONTENT_ARCHIVED",
  MEMBER_EXPORTED: "MEMBER_EXPORTED",
  MEMBER_STATUS_CHANGED: "MEMBER_STATUS_CHANGED",
  MEMBER_NOTE_CREATED: "MEMBER_NOTE_CREATED",
  EVENT_CREATED: "EVENT_CREATED",
  EVENT_UPDATED: "EVENT_UPDATED",
  EVENT_STATUS_CHANGED: "EVENT_STATUS_CHANGED",
  EVENT_ATTENDEE_ADDED: "EVENT_ATTENDEE_ADDED",
  EVENT_ATTENDANCE_UPDATED: "EVENT_ATTENDANCE_UPDATED",
  CAMPAIGN_CREATED: "CAMPAIGN_CREATED",
  CAMPAIGN_UPDATED: "CAMPAIGN_UPDATED",
  CAMPAIGN_RECIPIENTS_SNAPSHOTTED: "CAMPAIGN_RECIPIENTS_SNAPSHOTTED",
  CAMPAIGN_SENT: "CAMPAIGN_SENT",
  CAMPAIGN_DELIVERY_RETRIED: "CAMPAIGN_DELIVERY_RETRIED",
  MEDIA_UPLOADED: "MEDIA_UPLOADED",
  MEDIA_UPDATED: "MEDIA_UPDATED",
  MEDIA_DELETED: "MEDIA_DELETED",
} as const;

export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const db = getDb();
    
    // Safely serialize states to JSON if provided
    const beforeStateStr = params.beforeState ? JSON.stringify(sanitizeAuditState(params.beforeState)) : null;
    const afterStateStr = params.afterState ? JSON.stringify(sanitizeAuditState(params.afterState)) : null;

    await db.auditLog.create({
      data: {
        action: params.action,
        actor: params.actor,
        actorUserId: params.actorUserId,
        detail: params.detail,
        ip: params.ip,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        requestId: params.requestId,
        outcome: params.outcome,
        beforeState: beforeStateStr,
        afterState: afterStateStr,
      },
    });
  } catch (error) {
    // Audit failures must not silently hide critical administrative failures,
    // but throwing here might break the main flow. 
    // We log it securely. In a production environment, this should trigger an alert.
    console.error("[CRITICAL] Failed to write audit log:", error);
  }
}
