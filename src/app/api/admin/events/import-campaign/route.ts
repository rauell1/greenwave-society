import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/policy";
import { importCampaignEvents } from "@/lib/events/import-campaign";

export async function POST() {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_CREATE);
  if (!auth.ok) return auth.response;
  if (!hasPermission(auth.admin, PERMISSIONS.EVENTS_PUBLISH)) return NextResponse.json({ error: "Adding the campaign events publishes them, which needs publish rights." }, { status: 403 });
  const created = await importCampaignEvents(auth.admin);
  return NextResponse.json({ created }, { status: created.length ? 201 : 200 });
}
