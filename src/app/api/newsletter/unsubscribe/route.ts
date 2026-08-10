import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token.length > 200) return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  const subscriber = await getDb().newsletterSubscriber.findUnique({ where: { unsubscribeToken: token }, select: { active: true } });
  if (!subscriber) return new NextResponse("Invalid unsubscribe link.", { status: 404 });
  const escaped = token.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  return new NextResponse(`<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:560px;margin:60px auto;padding:20px"><h1>Greenwave Society</h1><p>${subscriber.active ? "Confirm that you want to stop receiving Greenwave Society updates." : "This subscription is already inactive."}</p>${subscriber.active ? `<form method="post"><input type="hidden" name="token" value="${escaped}"><button style="background:#1A5C38;color:white;border:0;border-radius:8px;padding:12px 18px">Unsubscribe</button></form>` : ""}</body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'" } });
}

export async function POST(request: NextRequest) {
  const form = await request.formData(); const token = form.get("token");
  if (typeof token !== "string" || !token || token.length > 200) return new NextResponse("Invalid unsubscribe request.", { status: 400 });
  const result = await getDb().newsletterSubscriber.updateMany({ where: { unsubscribeToken: token, active: true }, data: { active: false } });
  return new NextResponse(result.count ? "You have been unsubscribed from Greenwave Society updates." : "This subscription is already inactive or the link is invalid.", { status: result.count ? 200 : 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
