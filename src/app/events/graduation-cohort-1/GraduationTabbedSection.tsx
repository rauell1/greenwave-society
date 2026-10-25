"use client";

import { useState } from "react";
import { AttendeeRsvpForm } from "./AttendeeRsvpForm";
import { VendorForm } from "./VendorForm";
import { Award, Store } from "lucide-react";

export function GraduationTabbedSection() {
  const [activeTab, setActiveTab] = useState<"guest" | "vendor">("guest");

  return (
    <div className="space-y-6" id="registration-forms">
      {/* Segmented Tab Switcher */}
      <div className="p-1.5 rounded-2xl bg-secondary/30 border border-border/80 flex items-center gap-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("guest")}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "guest"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-gold" />
            <span>Graduand & Guest RSVP</span>
          </div>
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
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "vendor"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Market Vendor Application</span>
          </div>
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
            activeTab === "vendor"
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary"
          }`}>
            Stalls
          </span>
        </button>
      </div>

      {/* Render Segmented Form Content */}
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
