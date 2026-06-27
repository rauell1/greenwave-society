import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Simple in-memory rate limiter: 5 lookups per email per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now   = Date.now();
  const entry = rateLimitMap.get(email);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  if (!checkRateLimit(email)) {
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
