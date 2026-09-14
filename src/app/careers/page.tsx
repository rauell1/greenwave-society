import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Users } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { APP_CONFIG } from "@/config/app.config";
import { CAREER_ROLES, CAREER_SLUGS, getCareerRoleStatuses } from "@/lib/careers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Volunteer Careers | Leadership Roles at Greenwave Society Kenya",
  description: "Explore volunteer leadership roles at Greenwave Society, a youth-led social enterprise and think tank in Nairobi, Kenya. Lead communications, partnerships, and strategy for young Kenyans aged 18-35.",
  keywords: [
    "Greenwave Society careers",
    "volunteer leadership Kenya",
    "youth social enterprise jobs Nairobi",
    "communications lead volunteer Kenya",
    "partnerships lead Kenya NGO",
    "volunteer roles Nairobi",
  ],
  alternates: { canonical: `${APP_CONFIG.url}/careers` },
  openGraph: {
    title: "Volunteer Careers | Leadership Roles at Greenwave Society",
    description: "Join a team equipping young Kenyans to lead, build, and connect. Volunteer leadership roles in communications, partnerships, and strategy.",
    url: `${APP_CONFIG.url}/careers`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Volunteer careers at Greenwave Society Kenya" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer Careers | Greenwave Society Kenya",
    description: "Volunteer leadership opportunities with Greenwave Society. Bring your judgment, energy, and ideas.",
    images: ["/images/IMG_9415.jpg"],
  },
};

export default async function CareersPage() {
  const statuses = Object.fromEntries((await getCareerRoleStatuses()).map(role => [role.slug, role.isOpen]));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${APP_CONFIG.url}/careers/#webpage`,
        "url": `${APP_CONFIG.url}/careers`,
        "name": "Volunteer Careers | Greenwave Society Kenya",
        "description": "Volunteer leadership opportunities with Greenwave Society, a youth-led social enterprise and think tank in Kenya.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/careers/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Careers", "item": `${APP_CONFIG.url}/careers` },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${APP_CONFIG.url}/careers/#roles`,
        "itemListElement": CAREER_SLUGS.map((slug, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": CAREER_ROLES[slug].title,
          "url": `${APP_CONFIG.url}/careers/${slug}`,
        })),
      },
    ],
  };
  return <div className="min-h-screen bg-[#f7f3ea]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <Navbar /><main className="pt-16 sm:pt-20">
    <section className="bg-[#121817] px-5 py-24 text-center text-white sm:py-32"><div className="mx-auto max-w-4xl"><p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-lime-400"><BriefcaseBusiness size={16}/> Volunteer leadership roles</p><h1 className="font-serif text-5xl leading-none tracking-tight sm:text-7xl">Help us build a more sustainable future.</h1><p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-300">Join a team equipping young Kenyans to lead, build, and connect. Bring your judgment, energy, and ideas to the Greenwave.</p><div className="mt-8 flex flex-wrap justify-center gap-3 text-sm"><span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"><Users size={17}/> Volunteer leadership</span><span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"><CalendarDays size={17}/> Start date: 7 September</span></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28"><div className="mb-12 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">Current openings</p><h2 className="mt-3 font-serif text-4xl tracking-tight text-zinc-900 sm:text-5xl">Choose where you can make the greatest difference.</h2></div><div className="grid gap-5 lg:grid-cols-3">{CAREER_SLUGS.map((slug, index) => { const role=CAREER_ROLES[slug]; const open=statuses[slug] !== false; return <Link key={slug} href={`/careers/${slug}`} className={`flex min-h-96 flex-col justify-between rounded-2xl border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${open ? "bg-white border-zinc-200" : "bg-zinc-100 border-zinc-300"}`}><span className="font-serif text-zinc-400">0{index+1}</span><div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${open ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{open ? "Applications open" : "Applications closed"}</span><p className="mt-5 text-xs font-bold uppercase tracking-[.12em] text-emerald-800">{role.focus}</p><h3 className="mt-3 font-serif text-4xl leading-none text-zinc-900">{role.title}</h3><p className="mt-5 leading-7 text-zinc-600">{role.summary}</p></div><span className="flex items-center gap-2 font-semibold text-emerald-800">View role <ArrowRight size={18}/></span></Link> })}</div></section>
  </main><Footer /></div>;
}
