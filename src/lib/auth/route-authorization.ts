import "server-only";

import { NextResponse } from "next/server";
import type { PermissionKey } from "./permissions";
import { getCurrentAdmin } from "./guards";
import { hasPermission } from "./policy";

export async function authorizeRoute(permission: PermissionKey) {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!hasPermission(admin, permission)) return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { ok: true as const, admin };
}
