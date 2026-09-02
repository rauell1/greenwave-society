import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { CAREER_ROLES, isCareerRoleOpen, isCareerSlug } from "@/lib/careers";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ role: string }> }) {
  const { role: slug } = await params;
  if (!isCareerSlug(slug)) notFound();
  const role = CAREER_ROLES[slug];
  const open = await isCareerRoleOpen(slug);
  return <div className="min-h-screen bg-zinc-50"><Navbar/><main className="mx-auto max-w-4xl px-5 pb-20 pt-28"><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-800">Volunteer application</p><h1 className="mt-4 font-serif text-5xl text-zinc-900">Apply for {role.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">No CV is needed. Your answers help us understand your motivation, judgment, and potential contribution.</p>{open ? <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm sm:p-10"><ApplicationForm roleSlug={slug} roleTitle={role.title} roleQuestion={role.question}/></div> : <div className="mt-10 rounded-2xl border bg-white p-10"><h2 className="font-serif text-3xl">Applications are currently closed</h2><p className="mt-4 text-zinc-600">This role remains available to review, but it is not accepting applications right now.</p><Link href={`/careers/${slug}`} className="mt-6 inline-block font-semibold text-emerald-800">Return to the role</Link></div>}</main><Footer/></div>;
}
