"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Download, ExternalLink } from "lucide-react";
import {
  CalendarEventData,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl,
  generateIcsContent,
} from "@/lib/events/calendar";

interface AddToCalendarButtonProps {
  event: CalendarEventData;
  className?: string;
  variant?: "outline" | "default" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function AddToCalendarButton({
  event,
  className,
  variant = "outline",
  size = "sm",
}: AddToCalendarButtonProps) {
  const [downloading, setDownloading] = useState(false);

  function handleDownloadIcs() {
    try {
      setDownloading(true);
      const ics = generateIcsContent(event);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5 font-medium ${className || ""}`}
        >
          <Calendar className="w-4 h-4 text-primary" />
          <span>Add to Calendar</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl border-border shadow-xl bg-card">
        <DropdownMenuItem asChild>
          <a
            href={getGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="font-medium">Google Calendar</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownloadIcs}
          disabled={downloading}
          className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <span className="font-medium">Apple Calendar (iCal)</span>
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={getOutlookCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="font-medium">Outlook / Office 365</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={getYahooCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="font-medium">Yahoo Calendar</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
