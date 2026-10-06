import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

import { consumeRateLimit, rateLimitUnavailable } from "@/lib/rate-limit";
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  let allowed: boolean;
  try {
    allowed = (await consumeRateLimit(`registration-status:${email}`, 5, 60 * 60 * 1000)).allowed;
  } catch { return rateLimitUnavailable(); }
  if (!allowed) {
    return NextResponse.json({ error: "Too many lookups. Try again later." }, { status: 429 });
  }

  const db     = getDb();
  const record = await db.memberRegistration.findFirst({
    where:   { email },
    orderBy: { createdAt: "desc" },
    select:  { status: true },
  });

  if (!record) {
    return NextResponse.json({ status: "not_found" });
  }

  return NextResponse.json({ status: record.status as "pending" | "approved" | "rejected" });
}
