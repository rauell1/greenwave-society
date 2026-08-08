import { Users, TreePine, Globe, Calendar, GraduationCap, Recycle, Award, Radio, Route, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { CountUp } from "@/components/ui/count-up";
import { IMPACT_STATS } from "@/config/app.config";

export function Impact() {
  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      value: IMPACT_STATS.youthReached,
      suffix: "+",
      label: "Youth Empowered",
      desc: "Engaged in hands-on climate education, mentorship, and leadership initiatives."
    },
    {
      icon: <TreePine className="w-5 h-5" />,
      value: IMPACT_STATS.treesPlanted,
      suffix: "+",
      label: "Trees Planted",
      desc: "Reforested across schools, community parks, and local ecological zones."
    },
    {
      icon: <Globe className="w-5 h-5" />,
      value: IMPACT_STATS.communitiesServed,
      suffix: "+",
      label: "Communities Served",
      desc: "Local areas empowered with sanitation, education, and restoration programs."
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      value: IMPACT_STATS.eventsOrganized,
      suffix: "+",
      label: "Events Organized",
      desc: "From community clean-ups to youth leadership summits and conservation hikes."
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      value: IMPACT_STATS.workshopsDelivered,
      suffix: "+",
      label: "Workshops Delivered",
      desc: "Practical curriculum sessions focusing on environmental literacy and the UN SDGs."
    },
    {
      icon: <Recycle className="w-5 h-5" />,
      value: IMPACT_STATS.wasteRecycled,
      suffix: " tons",
      label: "Waste Recycled",
      desc: "Diverted from local landfills through youth-led collection and sorting programs."
    },
  ];

  return (
    <section id="impact" className="py-24 sm:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Subtle top light overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-16 sm:mb-24">
          <div className="lg:col-span-8">
            <FadeIn>
              <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/15 px-3 py-1 text-xs tracking-wider uppercase rounded-full">
                <Award className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Our Impact
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                Our Work in <span className="italic font-normal text-gold">Numbers</span>
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-4">
            <FadeIn delay={0.1}>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed border-l border-white/25 pl-6">
                Every action we take creates a ripple effect of change. Here is the
                measurable progress we have achieved together with our communities.
              </p>
            </FadeIn>
          </div>
        </div>

        {/* Asymmetric border-connected grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
          {stats.map((s, i) => (
            <FadeIn 
              key={s.label} 
              delay={i * 0.05} 
              className="p-8 sm:p-10 border-r border-b border-white/10 flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300 min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-mono">
                    [ 0{i + 1} ]
                  </span>
                  <div className="text-gold/70 group-hover:text-gold transition-colors duration-300">
                    {s.icon}
                  </div>
                </div>
                <div className="text-5xl sm:text-6xl font-serif font-black text-white tracking-tight leading-none mb-4 group-hover:translate-x-1 origin-left transition-transform duration-300">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white/95 mb-3">
                  {s.label}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
                {s.desc}
              </p>
            </FadeIn>
          ))}
        </div>

        {/* Continuity → Impact */}
        <div className="mt-24 pt-16 border-t border-white/10">
          <FadeIn className="mb-12">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 px-3 py-1 text-xs tracking-wider uppercase rounded-full">
              Continuity → Impact
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white leading-tight max-w-2xl">
              Showcasing the Journey, <span className="italic font-normal text-gold">Not Just the Destination</span>
            </h3>
            <p className="mt-4 text-white/60 text-sm sm:text-base max-w-xl leading-relaxed">
              Sustained impact requires visibility. We document and share our work — making the story of change accessible, relatable, and ongoing.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Radio className="w-5 h-5" />,
                title: "Online Dialogues",
                desc: "We host open conversations that showcase what we do — from community sessions to digital discussions — so our impact is visible and verifiable.",
              },
              {
                icon: <Route className="w-5 h-5" />,
                title: "Activities Along the Journey",
                desc: "We document every step: training sessions, planting days, summits, and volunteer drives — building a living record of continuous progress.",
              },
              {
                icon: <Lightbulb className="w-5 h-5" />,
                title: "Making It Relatable",
                desc: "We translate complex challenges — skills gaps, mental health crises, unemployment — into stories that resonate with youth, partners, and communities.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="flex flex-col group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold group-hover:bg-white/20 transition-all duration-300">
                    {item.icon}
                  </div>
                  <h4 className="mt-5 text-base font-bold tracking-tight text-white">{item.title}</h4>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
