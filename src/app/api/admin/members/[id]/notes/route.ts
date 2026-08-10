import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { memberNoteSchema } from "@/lib/members/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_UPDATE);
  if (!auth.ok) return auth.response;
  const parsed = memberNoteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "A note between 1 and 5,000 characters is required." }, { status: 400 });
  const { id } = await params;
  const exists = await getDb().memberRegistration.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  const note = await getDb().$transaction(async tx => {
    const created = await tx.memberNote.create({ data: { registrationId: id, body: parsed.data.body, authorUserId: auth.admin.id, authorEmail: auth.admin.email } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.MEMBER_NOTE_CREATED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "member_registration", resourceId: id, outcome: "SUCCESS", afterState: JSON.stringify({ noteId: created.id }) } });
    return created;
  });
  return NextResponse.json({ note }, { status: 201 });
}
