import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db     = getDb();

  const events = await db.memberActivity.findMany({
    where:   { registrationId: id },
    orderBy: { createdAt: "asc" },
    select:  { id: true, event: true, createdAt: true },
  });

  return NextResponse.json({ events });
}
