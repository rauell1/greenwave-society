import { Users, TreePine, Globe, Calendar, GraduationCap, Recycle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { CountUp } from "@/components/ui/count-up";
import { IMPACT_STATS } from "@/config/app.config";

export function Impact() {
  const stats = [
    { icon: <Users className="w-7 h-7" />, value: IMPACT_STATS.youthReached, suffix: "+", label: "Youth Empowered" },
    { icon: <TreePine className="w-7 h-7" />, value: IMPACT_STATS.treesPlanted, suffix: "+", label: "Trees Planted" },
    { icon: <Globe className="w-7 h-7" />, value: IMPACT_STATS.communitiesServed, suffix: "+", label: "Communities Served" },
    { icon: <Calendar className="w-7 h-7" />, value: IMPACT_STATS.eventsOrganized, suffix: "+", label: "Events Organized" },
    { icon: <GraduationCap className="w-7 h-7" />, value: IMPACT_STATS.workshopsDelivered, suffix: "+", label: "Workshops Delivered" },
    { icon: <Recycle className="w-7 h-7" />, value: IMPACT_STATS.wasteRecycled, suffix: " tons", label: "Waste Recycled" },
  ];

  return (
    <section id="impact" className="py-16 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-white/15 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge className="mb-3 sm:mb-4 bg-white/15 text-white border-white/20 hover:bg-white/20">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Our Impact
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Making a Real Difference
          </h2>
          <p className="mt-4 sm:mt-6 text-white/75 text-base sm:text-lg">
            Every action we take creates a ripple effect of change. Here is the
            impact we have made together with our partners and volunteers.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white">
                  {s.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs sm:text-sm text-white/90 font-semibold">
                  {s.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
