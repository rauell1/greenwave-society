"use client";

import { useState } from "react";
import { AttendeeRsvpForm } from "./AttendeeRsvpForm";
import { VendorForm } from "./VendorForm";
import { Users, Store } from "lucide-react";

export function GraduationTabbedSection() {
  const [activeTab, setActiveTab] = useState<"guest" | "vendor">("guest");

  return (
    <div className="space-y-6" id="registration-forms">
      {/* Tab Switcher Pills */}
      <div className="p-1.5 rounded-2xl bg-secondary/30 border border-border/80 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("guest")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "guest"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guest & Attendee RSVP</span>
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
            activeTab === "guest"
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary"
          }`}>
            Free Entry
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vendor")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "vendor"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vendor Stall Application</span>
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
            activeTab === "vendor"
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary"
          }`}>
            Market
          </span>
        </button>
      </div>

      {/* Render Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "guest" ? (
          <AttendeeRsvpForm />
        ) : (
          <VendorForm />
        )}
      </div>
    </div>
  );
}
