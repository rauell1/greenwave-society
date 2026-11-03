import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  Clock3,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { APP_CONFIG } from "@/config/app.config";
import { CAREER_ROLES, isCareerRoleOpen, isCareerSlug } from "@/lib/careers";
import { CareerShareBar } from "@/components/careers/CareerShareBar";
import { CareerMobileStickyBar } from "@/components/careers/CareerMobileStickyBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role: slug } = await params;
  if (!isCareerSlug(slug)) return {};
  const role = CAREER_ROLES[slug];
  const title = `${role.title} | Volunteer Careers at Greenwave Society`;
  const description = `${role.summary} ${role.engagement} role with Greenwave Society, a youth-led social enterprise and think tank in Kenya. ${role.purpose}`.slice(0, 300);
  const url = `${APP_CONFIG.url}/careers/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: role.summary,
      url,
      siteName: "Greenwave Society",
      images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: `${role.title} at Greenwave Society` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: role.summary,
      images: ["/images/IMG_9415.jpg"],
    },
  };
}

export default async function CareerRolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role: slug } = await params;
  if (!isCareerSlug(slug)) notFound();
  const role = CAREER_ROLES[slug];
  const open = await isCareerRoleOpen(slug);
  const shareUrl = `${APP_CONFIG.url}/careers/${slug}`;
  const isCfo = slug === "chief-financial-officer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/careers/${slug}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Careers", "item": `${APP_CONFIG.url}/careers` },
          { "@type": "ListItem", "position": 3, "name": role.title, "item": `${APP_CONFIG.url}/careers/${slug}` },
        ],
      },
      ...(open ? [{
        "@type": "JobPosting",
        "@id": `${APP_CONFIG.url}/careers/${slug}/#jobposting`,
        "title": role.title,
        "description": role.purpose,
        "identifier": {
          "@type": "PropertyValue",
          "name": "Greenwave Society",
          "value": slug,
        },
        "datePosted": role.datePosted,
        "employmentType": "VOLUNTEER",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "Greenwave Society",
          "sameAs": APP_CONFIG.url,
          "logo": `${APP_CONFIG.url}/logo.png`,
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Nairobi",
            "addressCountry": "KE",
          },
        },
        "jobLocationType": "TELECOMMUTE",
        "applicantLocationRequirements": {
          "@type": "Country",
          "name": "Kenya",
        },
      }] : []),
    ],
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-28 lg:pb-16">
        <article className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back link */}
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft size={16} /> All career roles
          </Link>

          {/* Hero Column + Facts Card */}
          <div className="mt-6 sm:mt-10 grid gap-8 lg:grid-cols-[1.45fr_.65fr] items-start">
            <div>
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    open ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${open ? "bg-emerald-600 animate-pulse" : "bg-red-500"}`}
                  />
                  {open ? "Applications open" : "Applications closed"}
                </span>

                {isCfo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-700" /> Executive Board Role
                  </span>
                )}
              </div>

              {/* Department focus */}
              <p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-emerald-800">
                {role.focus}
              </p>

              {/* Responsive Title */}
              <h1 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl text-zinc-900 leading-[1.12] tracking-tight">
                {role.title}
              </h1>

              {/* Summary */}
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-zinc-600">
                {role.summary}
              </p>

              {/* Upfront Action Row (Instant Apply on Mobile & Desktop) */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {open && (
                  <Link
                    href={`/careers/apply/${slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all"
                  >
                    <span>Apply for this role</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
                <a
                  href="#responsibilities"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-98 transition-all"
                >
                  View criteria &amp; scope
                </a>
              </div>

              {/* Mobile & Desktop Share Bar */}
              <div className="mt-6 sm:mt-8">
                <CareerShareBar roleTitle={role.title} roleSummary={role.summary} shareUrl={shareUrl} />
              </div>
            </div>

            {/* Quick Facts Card */}
            <aside className="rounded-2xl border border-zinc-200/90 border-t-4 border-t-emerald-700 bg-white p-5 sm:p-6 shadow-md">
              <h3 className="font-serif text-lg font-bold text-zinc-900 pb-3 border-b border-zinc-100 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-700" />
                Key Role Details
              </h3>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-sm">
                <Fact
                  icon={<Users size={18} />}
                  label="Engagement"
                  value={role.engagement}
                />
                <Fact
                  icon={<CalendarDays size={18} />}
                  label="Start date"
                  value={role.startDate}
                />
                <Fact
                  icon={<Clock3 size={18} />}
                  label="Core meeting"
                  value={role.meeting}
                />
                <Fact
                  icon={<MapPin size={18} />}
                  label="Format"
                  value="Nairobi / Hybrid (mostly online)"
                />
              </dl>

              {isCfo && (
                <div className="mt-5 rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Fiduciary Scope
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    Direct oversight of capital allocation, donor grant accounting, statutory tax compliance, and risk controls.
                  </p>
                </div>
              )}
            </aside>
          </div>

          {/* Section: Purpose & Responsibilities */}
          <div
            id="responsibilities"
            className="mt-12 sm:mt-16 grid gap-10 lg:gap-14 rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-10 lg:p-12 shadow-sm lg:grid-cols-[1.4fr_.6fr]"
          >
            <div>
              {/* Purpose */}
              <section>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Purpose &amp; Strategic Context
                </p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl text-zinc-900">
                  Why this role matters
                </h2>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600">
                  {role.purpose}
                </p>
              </section>

              {/* Responsibilities */}
              <section className="mt-10 sm:mt-12">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Accountability
                </p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl text-zinc-900">
                  What you will own
                </h2>

                <div className="mt-6 space-y-3">
                  {role.responsibilities.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 sm:p-4 flex items-start gap-3 transition-colors hover:bg-emerald-50/30"
                    >
                      <div className="rounded-full bg-emerald-100 p-1 text-emerald-800 shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* CFO Specific Criteria Box */}
              {isCfo && (
                <section className="mt-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50/60 p-5 sm:p-6 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-lg">
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    Ideal Executive Profile
                  </div>
                  <ul className="text-xs sm:text-sm text-zinc-700 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">•</span>
                      <span>Professional qualification in accounting, finance, or economics (CPA-K, ACCA, CFA, or relevant degree/diploma).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">•</span>
                      <span>Familiarity with non-profit, social enterprise, or donor-funded reporting standards in Kenya (KRA, NGO Board, statutory filings).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">•</span>
                      <span>High fiduciary ethics, zero-compromise transparency, and a passion for mentoring young leaders.</span>
                    </li>
                  </ul>
                </section>
              )}
            </div>

            {/* Sidebar Context */}
            <aside className="space-y-4 sm:space-y-5">
              <Info title="Reporting & Governance">{role.reporting}</Info>
              <Info title="Working Rhythm">{role.rhythm}</Info>
              <Info title="Team Structure">
                {isCfo
                  ? "Collaborates with the Executive Board, CEO, and COO. Leads the Finance & Audit Secretariat as Greenwave Society expands."
                  : "Collaborates with executive leadership and contributes to cross-functional pods as Greenwave Society scales."}
              </Info>
            </aside>
          </div>

          {/* Secondary Bottom Share Bar */}
          <div className="mt-10 sm:mt-12">
            <CareerShareBar roleTitle={role.title} roleSummary={role.summary} shareUrl={shareUrl} />
          </div>

          {/* Bottom Application Callout */}
          <section className="mt-10 sm:mt-12 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-zinc-900 p-6 sm:p-12 text-white shadow-xl">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold">
              {open ? "Start the conversation." : "Applications are currently closed."}
            </h2>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-emerald-100">
              {open
                ? "No lengthy CV required upfront. Share your professional profile link (LinkedIn or online portfolio) and tell us about your judgment, lived perspective, and how you would steward Greenwave Society's mission."
                : "You can still review this role description and explore other volunteer leadership openings."}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {open && (
                <Link
                  href={`/careers/apply/${slug}`}
                  className="rounded-xl bg-white px-6 py-4 font-bold text-center text-emerald-900 shadow-md hover:bg-emerald-50 active:scale-98 transition-all text-sm sm:text-base"
                >
                  Apply for {role.title}
                </Link>
              )}
              <Link
                href="/careers"
                className="py-3 font-semibold text-center text-emerald-200 hover:text-white underline text-sm sm:text-base"
              >
                Explore other openings
              </Link>
            </div>
          </section>
        </article>
      </main>

      {/* Floating Sticky Action Bar for Mobile Viewports */}
      <CareerMobileStickyBar
        roleSlug={slug}
        roleTitle={role.title}
        isOpen={open}
        shareUrl={shareUrl}
      />

      <Footer />
    </div>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-emerald-950">
      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</dt>
        <dd className="mt-0.5 text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">{value}</dd>
      </div>
    </div>
  );
}

function Info({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-[#f7f3ea] p-4 sm:p-5">
      <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-900">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600">{children}</p>
    </section>
  );
}
