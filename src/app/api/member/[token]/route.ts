import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

// GET  — called on page load (login ping)
// POST — called every 30s as heartbeat; body { leaving: true } on beforeunload
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db  = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { memberToken: token } });
  if (!reg || reg.status !== "approved") {
    return NextResponse.json({ error: "Invalid or inactive member link." }, { status: 404 });
  }

  await db.memberRegistration.update({
    where: { memberToken: token },
    data:  { lastSeenAt: new Date(), loginCount: { increment: 1 }, updatedAt: new Date() },
  });

  await db.memberActivity.create({
    data: { id: randomBytes(10).toString("hex"), registrationId: reg.id, event: "login" },
  });

  return NextResponse.json({
    fullName:   reg.fullName,
    email:      reg.email,
    county:     reg.county,
    occupation: reg.occupation,
    interests:  reg.interests,
    loginCount: reg.loginCount + 1,
    approvedAt: reg.reviewedAt,
    memberSince: reg.createdAt,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db  = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { memberToken: token } });
  if (!reg || reg.status !== "approved") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body    = await req.json().catch(() => ({}));
  const leaving = body?.leaving === true;
  const event   = leaving ? "logout" : "heartbeat";

  await db.memberRegistration.update({
    where: { memberToken: token },
    data:  { lastSeenAt: new Date(), updatedAt: new Date() },
  });

  if (leaving) {
    await db.memberActivity.create({
      data: { id: randomBytes(10).toString("hex"), registrationId: reg.id, event: "logout" },
    });
  }

  return NextResponse.json({ ok: true, event });
}
