"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  Mail, 
  Settings, 
  ShieldAlert, 
  LogOut,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";
import { AdminUserDto } from "@/lib/auth/types";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface AdminSidebarProps {
  admin: AdminUserDto;
  enabledFeatures: string[];
}

export default function AdminSidebar({ admin, enabledFeatures }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Simple feature flag check
  const isEnabled = (key: string) => enabledFeatures.includes(key);

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      show: true, // Always show dashboard if logged in
    },
    {
      title: "Content",
      href: "/admin/content",
      icon: FileText,
      show: isEnabled("content") && hasPermission(admin, PERMISSIONS.CONTENT_READ),
    },
    {
      title: "Programs",
      href: "/admin/programs",
      icon: FolderOpen,
      show: isEnabled("programs") && hasPermission(admin, PERMISSIONS.CONTENT_READ),
    },
    {
      title: "Events",
      href: "/admin/events",
      icon: Calendar,
      show: isEnabled("events") && hasPermission(admin, PERMISSIONS.EVENTS_READ),
    },
    {
      title: "Members",
      href: "/admin/members",
      icon: Users,
      show: isEnabled("members") && hasPermission(admin, PERMISSIONS.MEMBERS_READ),
    },
    {
      title: "Communications",
      href: "/admin/communications",
      icon: Mail,
      show: isEnabled("communications") && hasPermission(admin, PERMISSIONS.COMMUNICATIONS_READ),
    },
    {
      title: "Administrators",
      href: "/admin/users",
      icon: Users,
      show: isEnabled("users") && hasPermission(admin, PERMISSIONS.ROLES_MANAGE),
    },
    {
      title: "Audit Logs",
      href: "/admin/audit",
      icon: ShieldAlert,
      show: isEnabled("audit") && hasPermission(admin, PERMISSIONS.AUDIT_READ),
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      show: hasPermission(admin, PERMISSIONS.SETTINGS_READ),
    },
  ];

  const navigation = (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-green-700">Greenwave Admin</h2>
      </div>
      
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">{admin.email}</p>
        <p className="text-xs text-gray-500 mt-1 capitalize">{admin.roles.join(", ")}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          if (!item.show) return null;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? "bg-green-50 text-green-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-green-700" : "text-gray-400"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <form action="/api/admin/logout" method="POST">
          <button 
            type="submit"
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">{navigation}</aside>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
        <span className="font-bold text-green-800">Greenwave Admin</span>
        <button type="button" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="rounded-md p-2 hover:bg-gray-100"><Menu className="h-5 w-5" /></button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-72 flex-col bg-white shadow-xl"><button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-md p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>{navigation}</aside></div>}
    </>
  );
}
