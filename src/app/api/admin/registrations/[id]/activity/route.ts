import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_READ);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const db     = getDb();

  const events = await db.memberActivity.findMany({
    where:   { registrationId: id },
    orderBy: { createdAt: "asc" },
    select:  { id: true, event: true, createdAt: true },
  });

  return NextResponse.json({ events });
}
