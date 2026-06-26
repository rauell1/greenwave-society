import { NextRequest, NextResponse } from "next/server";
import { isAllowedEmail, hashPassword } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body     = await request.json().catch(() => null);
    const email    = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const confirm  = body?.confirm;

    if (!email || !password || !confirm) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!isAllowedEmail(email)) {
      return NextResponse.json({ error: "This email is not authorised." }, { status: 403 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const db   = getDb();
    const user = await db.adminUser.findUnique({ where: { email } });

    if (user?.passwordHash) {
      return NextResponse.json({ error: "Password already set. Use Forgot Password to reset it." }, { status: 409 });
    }

    await db.adminUser.upsert({
      where:  { email },
      update: { passwordHash: hashPassword(password), updatedAt: new Date() },
      create: { email, passwordHash: hashPassword(password) },
    });

    logger.info("Admin password set", { email });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Setup password failed", error as Error);
    return NextResponse.json({ error: "Failed to set password." }, { status: 500 });
  }
}
