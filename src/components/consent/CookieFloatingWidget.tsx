'use client';

import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookieFloatingWidgetProps {
  onClick: () => void;
}

export function CookieFloatingWidget({ onClick }: CookieFloatingWidgetProps) {
  return (
    <div className="fixed bottom-4 left-4 z-40 group">
      <Button
        onClick={onClick}
        size="icon"
        className="h-10 w-10 rounded-full bg-zinc-900/90 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105"
        title="Manage Cookie & Privacy Settings"
      >
        <Cookie className="h-5 w-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className="sr-only">Cookie Settings</span>
      </Button>
      <div className="absolute left-12 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-zinc-900 text-zinc-200 text-xs px-2.5 py-1 rounded-md border border-zinc-800 shadow-lg ml-2">
        Privacy & Cookie Preferences
      </div>
    </div>
  );
}
