import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { sendSigningEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const { valid } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    if (!body?.leaderId) {
      return NextResponse.json({ error: "leaderId required" }, { status: 400 });
    }

    const db = getDb();
    const leader = await db.executiveLeader.findUnique({
      where: { id: body.leaderId },
      include: { signature: true },
    });

    if (!leader) return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    if (!leader.signature) return NextResponse.json({ error: "No signature record" }, { status: 404 });

    const sent = await sendSigningEmail({
      to: leader.email,
      name: leader.name,
      role: leader.role,
      token: leader.signature.token,
    });

    if (sent) {
      await db.constitutionSignature.update({
        where: { id: leader.signature.id },
        data: { emailSentAt: new Date() },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwave.rauell.systems";
    const signingUrl = `${appUrl}/sign/${leader.signature.token}`;

    return NextResponse.json({ success: true, emailSent: sent, signingUrl });
  } catch (error) {
    logger.error("Send invite failed", error as Error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}

