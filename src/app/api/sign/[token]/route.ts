import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json().catch(() => null);
    const action: "sign" | "reject" = body?.action;
    const rejectionReason: string | undefined = body?.rejectionReason;

    if (!action || !["sign", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (action === "reject" && !rejectionReason?.trim()) {
      return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
    }

    const db = getDb();
    const sig = await db.constitutionSignature.findUnique({ where: { token } });
    if (!sig) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
    if (sig.status !== "pending") {
      return NextResponse.json({ error: "Already responded" }, { status: 409 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    await db.constitutionSignature.update({
      where: { token },
      data: {
        status: action === "sign" ? "signed" : "rejected",
        signedAt: new Date(),
        ipAddress: ip,
        rejectionReason: action === "reject" ? rejectionReason : null,
      },
    });

    logger.info("Constitution signature recorded", { token: token.slice(0, 8), action });
    return NextResponse.json({ success: true, status: action === "sign" ? "signed" : "rejected" });
  } catch (error) {
    logger.error("Sign action failed", error as Error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
