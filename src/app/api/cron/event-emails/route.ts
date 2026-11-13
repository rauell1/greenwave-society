import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendScheduledEventEmails } from "@/lib/events/reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

// Run once a day by the Vercel cron job in vercel.json. Vercel sends
// "Authorization: Bearer <CRON_SECRET>" automatically when CRON_SECRET is set on the project.
function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return Boolean(secret) && header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await sendScheduledEventEmails());
}
