import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    // body.leaders = [{ name, role, email }]
    if (!body?.leaders || !Array.isArray(body.leaders)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = getDb();
    const results: { name: string; status: string }[] = [];

    for (const l of body.leaders) {
      if (!l.name || !l.role || !l.email) {
        results.push({ name: l.name ?? "unknown", status: "skipped (missing fields)" });
        continue;
      }

      const existing = await db.executiveLeader.findUnique({ where: { email: l.email } });
      if (existing) {
        results.push({ name: l.name, status: "already exists" });
        continue;
      }

      const leader = await db.executiveLeader.create({
        data: { name: l.name, role: l.role, email: l.email },
      });

      const token = randomBytes(32).toString("hex");
      await db.constitutionSignature.create({
        data: { leaderId: leader.id, token },
      });

      results.push({ name: l.name, status: "created" });
      logger.info("Executive leader seeded", { name: l.name, role: l.role });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    logger.error("Seed leaders failed", error as Error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
