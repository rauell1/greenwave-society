"use client";

import Link from "next/link";
import { ChevronRight, Globe, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = { 
  admin: "Admin", 
  dashboard: "Dashboard", 
  governance: "Governance", 
  careers: "Careers", 
  members: "Members", 
  events: "Events", 
  content: "Content", 
  programs: "Programs", 
  media: "Media", 
  gallery: "Gallery",
  placements: "Placements",
  communications: "Communications", 
  users: "Administrators", 
  audit: "Audit logs", 
  settings: "Settings" 
};

export default function AdminBreadcrumbs() {
  const segments = usePathname().split("/").filter(Boolean);
  if (segments.length < 2) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const last = index === segments.length - 1;
          return (
            <span key={href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
              {last ? (
                <span aria-current="page" className="font-semibold text-slate-800">
                  {LABELS[segment] ?? segment}
                </span>
              ) : (
                <Link href={href} className="hover:text-emerald-700 transition-colors">
                  {LABELS[segment] ?? segment}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <Link
        href="/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors shadow-xs"
        title="Open public website in a new tab"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span>View Public Website</span>
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </Link>
    </div>
  );
}
