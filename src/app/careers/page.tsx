import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Users } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { APP_CONFIG } from "@/config/app.config";
import { CAREER_ROLES, CAREER_SLUGS, getCareerRoleStatuses } from "@/lib/careers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Volunteer Careers | Greenwave Society", description: "Volunteer leadership opportunities with Greenwave Society.", alternates: { canonical: `${APP_CONFIG.url}/careers` } };

export default async function CareersPage() {
  const statuses = Object.fromEntries((await getCareerRoleStatuses()).map(role => [role.slug, role.isOpen]));
  return <div className="min-h-screen bg-[#f7f3ea]"><Navbar /><main className="pt-16 sm:pt-20">
    <section className="bg-[#121817] px-5 py-24 text-center text-white sm:py-32"><div className="mx-auto max-w-4xl"><p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-lime-400"><BriefcaseBusiness size={16}/> Volunteer leadership roles</p><h1 className="font-serif text-5xl leading-none tracking-tight sm:text-7xl">Help us build a more sustainable future.</h1><p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-300">Join a team equipping young Kenyans to lead, build, and connect. Bring your judgment, energy, and ideas to the Greenwave.</p><div className="mt-8 flex flex-wrap justify-center gap-3 text-sm"><span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"><Users size={17}/> Volunteer leadership</span><span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"><CalendarDays size={17}/> Start date: 7 September</span></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28"><div className="mb-12 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">Current openings</p><h2 className="mt-3 font-serif text-4xl tracking-tight text-zinc-900 sm:text-5xl">Choose where you can make the greatest difference.</h2></div><div className="grid gap-5 lg:grid-cols-3">{CAREER_SLUGS.map((slug, index) => { const role=CAREER_ROLES[slug]; const open=statuses[slug] !== false; return <Link key={slug} href={`/careers/${slug}`} className={`flex min-h-96 flex-col justify-between rounded-2xl border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${open ? "bg-white border-zinc-200" : "bg-zinc-100 border-zinc-300"}`}><span className="font-serif text-zinc-400">0{index+1}</span><div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${open ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{open ? "Applications open" : "Applications closed"}</span><p className="mt-5 text-xs font-bold uppercase tracking-[.12em] text-emerald-800">{role.focus}</p><h3 className="mt-3 font-serif text-4xl leading-none text-zinc-900">{role.title}</h3><p className="mt-5 leading-7 text-zinc-600">{role.summary}</p></div><span className="flex items-center gap-2 font-semibold text-emerald-800">View role <ArrowRight size={18}/></span></Link> })}</div></section>
  </main><Footer /></div>;
}
