import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

import { DEFAULT_ACTIVITIES, type Activity } from "@/lib/cms/activity-defaults";

export function Activities({ activities = DEFAULT_ACTIVITIES }: { activities?: Activity[] }) {
  return (
    <section id="activities" className="py-24 sm:py-32 bg-secondary/20 relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20 sm:mb-28">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gold" />
            Recent Activities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
            What We Have Been <span className="italic font-normal text-primary">Up To</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            From school conservation programmes to vocational mentorship, wellness sessions, and ecosystem restoration. This is what closing the gap looks like in practice.
          </p>
        </FadeIn>

        {/* Timeline container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical dashed line */}
          <div className="absolute left-4 md:left-[144px] top-2 bottom-2 w-[1px] border-l border-dashed border-primary/30" />

          <div className="space-y-16">
            {activities.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.08}>
                <div className="relative md:grid md:grid-cols-[120px_1fr] md:gap-12 pl-10 md:pl-0 group">
                  {/* Date & Type: right-aligned column on desktop, inline row above the card on mobile */}
                  <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-0 md:block md:text-right">
                    <span className="font-mono text-xs text-gold uppercase tracking-widest md:block md:pt-1.5">
                      {/^\d{4}-\d{2}-\d{2}$/.test(a.date)
                        ? new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Nairobi" }).format(new Date(`${a.date}T12:00:00Z`))
                        : a.date}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/20 text-primary bg-primary/5 rounded-md px-2.5 py-0.5 md:mt-2 md:inline-block">
                      {a.type}
                    </Badge>
                  </div>

                  {/* Center Column: Node Bullet */}
                  <div className="absolute left-3.5 md:left-[140.5px] top-1.5 -translate-x-1/2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-primary/10 group-hover:scale-125 transition-transform duration-300" />
                  </div>

                  {/* Right Column: Content Card */}
                  <div className="flex-1 bg-background rounded-[1.5rem] border border-primary/10 p-6 sm:p-8 hover:shadow-[0_20px_50px_oklch(var(--primary)/5%)] transition-all duration-300 group-hover:border-primary/20">
                    <h3 className="text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors duration-300">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-sans">
                      {a.desc}
                    </p>
                    
                    <div className="mt-5 flex items-center">
                      {a.mediaUrl.startsWith('/') ? (
                        <Link
                          href={a.mediaUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline hover:gap-2 transition-all duration-300"
                        >
                          Explore Event Media
                          <ExternalLink className="w-3.5 h-3.5 text-gold" />
                        </Link>
                      ) : (
                        <a
                          href={a.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline hover:gap-2 transition-all duration-300"
                        >
                          Explore Event Media
                          <ExternalLink className="w-3.5 h-3.5 text-gold" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
