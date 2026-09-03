"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = { admin: "Admin", dashboard: "Dashboard", governance: "Governance", careers: "Careers", members: "Members", events: "Events", content: "Content", programs: "Programs", media: "Media", communications: "Communications", users: "Administrators", audit: "Audit logs", settings: "Settings" };

export default function AdminBreadcrumbs() {
  const segments = usePathname().split("/").filter(Boolean);
  if (segments.length < 2) return null;
  return <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">{segments.map((segment, index) => { const href = `/${segments.slice(0, index + 1).join("/")}`; const last = index === segments.length - 1; return <span key={href} className="flex items-center gap-1">{index > 0 && <ChevronRight className="h-3 w-3" />}{last ? <span aria-current="page" className="font-medium text-slate-700">{LABELS[segment] ?? "Details"}</span> : <Link href={href} className="hover:text-emerald-700">{LABELS[segment] ?? "Admin"}</Link>}</span>; })}</nav>;
}
