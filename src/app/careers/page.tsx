import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Sparkles, Users } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { APP_CONFIG } from "@/config/app.config";
import { CAREER_ROLES, CAREER_SLUGS, getCareerRoleStatuses } from "@/lib/careers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volunteer Careers | Leadership Roles at Greenwave Society Kenya",
  description: "Explore executive and volunteer leadership roles at Greenwave Society, a youth-led social enterprise and think tank in Nairobi, Kenya. Lead finance, communications, partnerships, and strategy.",
  keywords: [
    "Greenwave Society careers",
    "volunteer leadership Kenya",
    "Chief Financial Officer Kenya",
    "CFO volunteer Nairobi",
    "youth social enterprise jobs Nairobi",
    "communications lead volunteer Kenya",
    "partnerships lead Kenya NGO",
    "talent manager Kenya",
    "volunteer roles Nairobi",
  ],
  alternates: { canonical: `${APP_CONFIG.url}/careers` },
  openGraph: {
    title: "Volunteer Careers | Leadership Roles at Greenwave Society",
    description: "Join a team equipping young Kenyans to lead, build, and connect. Executive and volunteer leadership roles in finance, communications, partnerships, and people strategy.",
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

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <main className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="bg-[#121817] px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-lime-400">
              <BriefcaseBusiness size={16} /> Volunteer leadership roles
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl leading-tight sm:leading-none tracking-tight">
              Help us build a more sustainable future.
            </h1>
            <p className="mx-auto mt-4 sm:mt-7 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-zinc-300">
              Join a team equipping young Kenyans to lead, build, and connect. Bring your judgment, energy, and ideas to Greenwave Society.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 bg-white/5">
                <Users size={15} /> Executive &amp; Volunteer Leadership
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 bg-white/5">
                <CalendarDays size={15} /> Rolling &amp; Immediate Intakes
              </span>
            </div>
          </div>
        </section>

        {/* Roles Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="mb-8 sm:mb-12 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">
              Current Openings
            </p>
            <h2 className="mt-2 sm:mt-3 font-serif text-2xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900">
              Choose where you can make the greatest difference.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {CAREER_SLUGS.map((slug, index) => {
              const role = CAREER_ROLES[slug];
              const open = statuses[slug] !== false;
              const isCfo = slug === "chief-financial-officer";

              return (
                <Link
                  key={slug}
                  href={`/careers/${slug}`}
                  className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-7 shadow-xs transition hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${
                    isCfo
                      ? "bg-white border-emerald-700/40 ring-1 ring-emerald-600/20"
                      : open
                      ? "bg-white border-zinc-200"
                      : "bg-zinc-100 border-zinc-300"
                  }`}
                >
                  {isCfo && (
                    <div className="absolute top-0 right-0 bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" /> Executive Board
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif text-sm font-bold text-zinc-400">0{index + 1}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        open ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-600 animate-pulse" : "bg-red-500"}`} />
                      {open ? "Applications open" : "Applications closed"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-emerald-800">
                      {role.focus}
                    </p>
                    <h3 className="mt-2 font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900 leading-snug">
                      {role.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-600 line-clamp-3">
                      {role.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800">
                    <span className="text-zinc-500 font-normal">{role.engagement}</span>
                    <span className="flex items-center gap-1 text-emerald-800 font-bold group-hover:gap-2 transition-all">
                      View role &amp; apply <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
