import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { csvCell, MEMBER_STATUSES } from "@/lib/members/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function GET(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.MEMBERS_EXPORT);
  if (!auth.ok) return auth.response;
  const requestedStatus = request.nextUrl.searchParams.get("status");
  const status = MEMBER_STATUSES.includes(requestedStatus as typeof MEMBER_STATUSES[number]) ? requestedStatus : undefined;
  const members = await getDb().memberRegistration.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, take: 10_000 });
  const headers = ["Name", "Email", "Phone", "County", "Occupation", "Organization", "Status", "Active", "Interests", "Applied at", "Reviewed at", "Reviewed by"];
  const rows = members.map(member => [member.fullName, member.email, member.phone, member.county, member.occupation, member.organization, member.status, member.active, member.interests.join("; "), member.createdAt.toISOString(), member.reviewedAt?.toISOString(), member.reviewedBy].map(csvCell).join(","));
  await getDb().auditLog.create({ data: { action: AUDIT_ACTIONS.MEMBER_EXPORTED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "member_registration", outcome: "SUCCESS", detail: `Exported ${members.length} member records${status ? ` with status ${status}` : ""}` } });
  return new NextResponse([headers.map(csvCell).join(","), ...rows].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="greenwave-members-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
