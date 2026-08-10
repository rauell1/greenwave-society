import "server-only";

import { NextResponse } from "next/server";
import type { PermissionKey } from "./permissions";
import { getCurrentAdmin } from "./guards";
import { hasPermission } from "./policy";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";

export async function authorizeRoute(permission: PermissionKey) {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!hasPermission(admin, permission)) return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (permission.startsWith("events.") && !(await isCmsFeatureEnabled("events"))) return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (permission.startsWith("communications.") && !(await isCmsFeatureEnabled("communications"))) return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (permission.startsWith("media.") && !(await isCmsFeatureEnabled("media"))) return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { ok: true as const, admin };
}
