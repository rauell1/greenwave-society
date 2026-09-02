import { NextRequest, NextResponse } from "next/server";
import { requireCareersManager } from "@/lib/careers-admin";
import { getCareerRoleStatuses, isCareerSlug } from "@/lib/careers";
import { getDb } from "@/lib/db";

export async function GET() { if(!(await requireCareersManager())) return NextResponse.json({error:"Unauthorized"},{status:403}); return NextResponse.json({roles:await getCareerRoleStatuses()}); }
export async function PATCH(request:NextRequest) { if(!(await requireCareersManager())) return NextResponse.json({error:"Unauthorized"},{status:403}); const body=await request.json(); if(typeof body.slug!=="string"||!isCareerSlug(body.slug)||typeof body.isOpen!=="boolean") return NextResponse.json({error:"Invalid role status."},{status:400}); const role=await getDb().careerRole.update({where:{slug:body.slug},data:{isOpen:body.isOpen}}); return NextResponse.json({role}); }
