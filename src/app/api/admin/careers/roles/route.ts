import { NextRequest, NextResponse } from "next/server";
import { requireCareersManager } from "@/lib/careers-admin";
import { getCareerRoleStatuses, isCareerSlug } from "@/lib/careers";
import { getDb } from "@/lib/db";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requireExecutiveCareersAccess } from "@/lib/careers-admin";

export async function GET() { if(!(await requireCareersManager())) return NextResponse.json({error:"Unauthorized"},{status:403}); return NextResponse.json({roles:await getCareerRoleStatuses()}); }
export async function PATCH(request:NextRequest) { const admin=await requireExecutiveCareersAccess(PERMISSIONS.CAREERS_MANAGE); if(!admin)return NextResponse.json({error:"You do not have permission to manage roles."},{status:403});const body=await request.json();if(typeof body.slug!=="string"||!isCareerSlug(body.slug)||typeof body.isOpen!=="boolean")return NextResponse.json({error:"Invalid role status."},{status:400});const db=getDb();const before=await db.careerRole.findUnique({where:{slug:body.slug}});const role=await db.$transaction(async tx=>{const updated=await tx.careerRole.update({where:{slug:body.slug},data:{isOpen:body.isOpen}});await tx.auditLog.create({data:{action:"CAREER_ROLE_UPDATED",actor:admin.email,actorUserId:admin.id,detail:`${updated.title} ${updated.isOpen?"opened":"closed"}`,resourceType:"career_role",resourceId:updated.slug,outcome:"SUCCESS",beforeState:JSON.stringify({isOpen:before?.isOpen}),afterState:JSON.stringify({isOpen:updated.isOpen})}});return updated});return NextResponse.json({role}); }
