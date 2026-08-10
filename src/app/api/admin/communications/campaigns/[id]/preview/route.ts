import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { renderCampaign } from "@/lib/communications/delivery";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.COMMUNICATIONS_READ); if (!auth.ok) return auth.response;
  const campaign = await getDb().cmsCampaign.findUnique({ where: { id: (await params).id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(renderCampaign(campaign), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; img-src https: data:; style-src 'unsafe-inline';" } });
}
