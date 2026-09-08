import { NextResponse } from "next/server";

// Passwords may only be established through a token delivered to the mailbox.
export async function POST() {
  return NextResponse.json({ error: "Use Forgot password to receive a secure password setup link." }, { status: 410 });
}
