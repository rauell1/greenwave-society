import Image from "next/image";
import Link from "next/link";
import { Leaf, Users, Heart, Globe, Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export function About() {
  const values = [
    {
      icon: <Leaf className="w-5 h-5" />,
      title: "Environment as the Classroom",
      desc: "Conservation, restoration, and sustainability work aren't just environmental goals — they're the real-world context where young people build skills, accountability, and belonging. Aligned with SDG 13, 14, and 15.",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Youth Leadership & Inclusion",
      desc: "We equip youth aged 15–35 to tackle the intersecting crises of skills mismatch, mental health, and unemployment — through enterprise training, mentorship, and equitable opportunities aligned with SDG 4, 5, 8, and 10.",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Community-Led Wellbeing",
      desc: "We invest in the mental resilience and holistic wellbeing of every young person we work with — because sustainable communities start with people who are supported, connected, and heard. Aligned with SDG 3, 6, and 11.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Partnerships & Accountability",
      desc: "Through SDG 17 partnerships, transparent governance, and active connections with organisations like the UN and Google, we scale our impact responsibly and ensure every programme delivers measurable results.",
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Decorative foliage accent */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Editorial Image Panel */}
          <div className="lg:col-span-5 relative">
            <FadeIn direction="right">
              <div className="relative overflow-visible">
                {/* Custom geometric shape border */}
                <div className="absolute -inset-4 rounded-[2.5rem] border border-primary/20 -z-10 rotate-2" />
                <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_oklch(var(--primary)/12%)]">
                  <Image
                    src="/images/about.png"
                    alt="Youth in community environmental discussion in Kenya"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-7">
            <FadeIn>
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
                <Target className="w-3.5 h-3.5 mr-1.5" />
                Our Mission
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
                Mission, Vision & <span className="text-primary italic font-normal">Global Alignment</span>
              </h2>
            </FadeIn>
            
            {/* Custom Blockquote Style Statement */}
            <FadeIn delay={0.2}>
              <div className="mt-6 border-l-4 border-primary pl-6 py-2">
                <p className="font-serif italic text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  "We exist to close the gaps that hold young Kenyans back — in skills, in opportunity, and in wellbeing — by building leaders who serve their communities and drive lasting change."
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-6 text-muted-foreground text-sm sm:text-base leading-relaxed">
                Our vision is a generation of equipped, confident young Kenyans — leading enterprises, restoring ecosystems, and strengthening communities from the ground up.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <Button asChild className="mt-8 rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-6 shadow-md" size="lg">
                <Link href="/programs">
                  Explore Our Programs <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </FadeIn>
          </div>

        </div>

        {/* Minimalist Typographical Core Values (Anti-AI card style) */}
        <div className="mt-24 pt-16 border-t border-border/80">
          <FadeIn className="text-center max-w-xl mx-auto mb-16">
            <h3 className="text-2xl font-serif font-black tracking-tight text-foreground">
              Our Core Strategic Pillars
            </h3>
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-2">
              Aligned directly with the United Nations Sustainable Development Goals
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <div className="flex flex-col h-full group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_4px_12px_oklch(var(--primary)/8%)]">
                    {v.icon}
                  </div>
                  <h4 className="mt-5 text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {v.title}
                  </h4>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
