import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, CalendarDays, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { CAREER_ROLES, isCareerRoleOpen, isCareerSlug, requiresProfileLink } from "@/lib/careers";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ role: string }> }) {
  const { role: slug } = await params;
  if (!isCareerSlug(slug)) notFound();
  const role = CAREER_ROLES[slug];
  const open = await isCareerRoleOpen(slug);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20 pt-24 sm:pt-28">
        {/* Navigation Breadcrumb / Back Link */}
        <Link
          href={`/careers/${slug}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft size={16} /> Back to {role.title} details
        </Link>

        {/* Page Header */}
        <div className="mt-4 sm:mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            Volunteer Leadership Application
          </span>
          <h1 className="mt-3 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight">
            Apply for {role.title}
          </h1>
          <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-600">
            No lengthy CV required upfront. Your answers help us understand your judgment, motivation, and practical contribution to Greenwave Society.
          </p>

          {/* Quick Snapshot Card on Mobile */}
          <div className="mt-5 rounded-2xl bg-white border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Briefcase className="h-3.5 w-3.5 text-emerald-700" /> {role.engagement}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-700" /> Start: {role.startDate}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> {role.meeting}
            </span>
          </div>
        </div>

        {/* Form Container */}
        {open ? (
          <div className="mt-6 sm:mt-8 rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-sm">
            <ApplicationForm
              roleSlug={slug}
              roleTitle={role.title}
              roleQuestion={role.question}
              profileRequired={requiresProfileLink(slug)}
            />
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
              Applications are currently closed
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 max-w-md mx-auto">
              This role remains available to review for informational purposes, but it is not accepting applications right now.
            </p>
            <Link
              href={`/careers/${slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Return to role overview
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
