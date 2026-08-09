import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { sendSigningEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { SITE_URL } from "@/lib/email-template";

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
      include: { signatures: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!leader) return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    const sig = leader.signatures[0];
    if (!sig) return NextResponse.json({ error: "No signature record for this leader" }, { status: 404 });

    const sent = await sendSigningEmail({
      to: leader.email,
      name: leader.name,
      role: leader.role,
      token: sig.token,
    });

    if (sent) {
      await db.constitutionSignature.update({
        where: { id: sig.id },
        data: { emailSentAt: new Date() },
      });
    }

    const signingUrl = `${SITE_URL}/sign/${sig.token}`;

    return NextResponse.json({ success: true, name: leader.name, emailSent: sent, signingUrl });
  } catch (error) {
    logger.error("Send invite failed", error as Error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
