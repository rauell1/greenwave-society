/**
 * Liveness check for uptime monitors.
 *
 * Answers 200 without touching the database, so hourly monitor pings never
 * wake the database. Use /api/health when the database itself must be checked.
 */

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function HEAD() {
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
