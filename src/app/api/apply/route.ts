import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { CAREER_ROLES, isCareerRoleOpen, isCareerSlug } from "@/lib/careers";
import { getDb } from "@/lib/db";
import { brandedEmail, CONTACT_EMAIL, escapeHtml, FROM_EMAIL } from "@/lib/email-template";
import { logger } from "@/lib/logger";

const required = ["fullName","email","phone","location","availability","motivation","relevantExperience","collaborationStyle","roleResponse"] as const;
function clean(value: unknown, max=3000) { return typeof value === "string" ? value.trim().slice(0,max) : ""; }

export async function POST(request: NextRequest) {
  try {
    const body=await request.json() as Record<string,unknown>; const roleSlug=clean(body.roleSlug,80);
    if(!isCareerSlug(roleSlug)) return NextResponse.json({error:"Choose a valid role."},{status:400});
    if(!(await isCareerRoleOpen(roleSlug))) return NextResponse.json({error:"Applications for this role are currently closed."},{status:409});
    const values=Object.fromEntries(required.map(key=>[key,clean(body[key])])) as Record<typeof required[number],string>;
    if(required.some(key=>!values[key])) return NextResponse.json({error:"Please answer every required question."},{status:400});
    if(!/^\S+@\S+\.\S+$/.test(values.email)) return NextResponse.json({error:"Enter a valid email address."},{status:400});
    if(body.consent!==true) return NextResponse.json({error:"Please confirm that we may process your application."},{status:400});
    const role=CAREER_ROLES[roleSlug]; const now=new Date(); const reference=`GWS-${now.toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
    const candidateSubject=`We received your Greenwave Society application | ${reference}`;
    const candidateBody=`Hello ${values.fullName},\n\nThank you for applying for the ${role.title} volunteer role at Greenwave Society. Your application has been received.\n\nApplication reference: ${reference}\nRole: ${role.title}\n\nOur team will review your responses carefully and contact you using the details provided.\n\nWarm regards,\nGreenwave Society Careers Team`;
    const teamSubject=`New career application: ${role.title} | ${reference}`;
    const teamBody=`Candidate: ${values.fullName}\nRole: ${role.title}\nReference: ${reference}\nEmail: ${values.email}\nPhone: ${values.phone}\nSubmitted: ${now.toISOString()}`;
    await getDb().careerApplication.create({data:{reference,roleSlug,roleTitle:role.title,...values,portfolioUrl:clean(body.portfolioUrl,500)||null,candidateEmailSubject:candidateSubject,candidateEmailBody:candidateBody,teamEmailSubject:teamSubject,teamEmailBody:teamBody}});
    const key=process.env.RESEND_API_KEY;
    if(key){ const resend=new Resend(key); await Promise.all([
      resend.emails.send({from:FROM_EMAIL,to:values.email,subject:candidateSubject,html:brandedEmail({eyebrow:"Careers",title:"Application received",body:`<p>${escapeHtml(candidateBody).replaceAll("\n","<br>")}</p>`})}),
      resend.emails.send({from:FROM_EMAIL,to:CONTACT_EMAIL,replyTo:values.email,subject:teamSubject,html:brandedEmail({eyebrow:"Careers",title:`New application: ${escapeHtml(role.title)}`,body:`<p>${escapeHtml(teamBody).replaceAll("\n","<br>")}</p><h3>Candidate responses</h3><p><strong>Location:</strong> ${escapeHtml(values.location)}</p><p><strong>Availability:</strong><br>${escapeHtml(values.availability)}</p><p><strong>Motivation:</strong><br>${escapeHtml(values.motivation)}</p><p><strong>Experience:</strong><br>${escapeHtml(values.relevantExperience)}</p><p><strong>Collaboration:</strong><br>${escapeHtml(values.collaborationStyle)}</p><p><strong>Role response:</strong><br>${escapeHtml(values.roleResponse)}</p>`})}),
    ]); }
    return NextResponse.json({reference});
  } catch(error) { logger.error("Failed to save career application",error as Error); return NextResponse.json({error:"We could not save your application. Please try again."},{status:500}); }
}
