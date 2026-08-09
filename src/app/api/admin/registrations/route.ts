import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_READ);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const registrations = await db.memberRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ registrations });
}
