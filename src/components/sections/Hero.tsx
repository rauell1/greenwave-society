import Image from "next/image";
import Link from "next/link";
import { Sprout, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { CountUp } from "@/components/ui/count-up";
import { IMPACT_STATS } from "@/config/app.config";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background pt-24 pb-16 lg:pt-32 overflow-hidden">
      {/* Editorial background shapes */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-secondary/30 hidden lg:block -z-10" />
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl -translate-y-1/2 -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <FadeIn delay={0.1}>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-2 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full"
              >
                <Sprout className="w-3.5 h-3.5 mr-1.5" />
                Non-Profit Organization &bull; Kenya
              </Badge>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-black text-foreground leading-[1.05] tracking-tight">
                Equipping youth <br />
                to lead, build, and <span className="text-primary italic font-normal">connect</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Young Kenyans face real challenges: skills gaps, unemployment, and mental health pressures. Greenwave Society bridges those gaps through enterprise training, environmental action, and community-led programmes.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 py-6 shadow-[0_10px_30px_oklch(var(--primary)/25%)]"
                >
                  <Link href="/contact?interest=volunteer">
                    Join Our Mission <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-border bg-transparent text-foreground hover:bg-secondary/40 font-semibold px-8 py-6"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </FadeIn>

            {/* Typography Stats Row */}
            <FadeIn delay={0.65}>
              <div className="mt-12 pt-8 border-t border-border/60 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="text-3xl sm:text-4xl font-serif font-black text-primary">
                    <CountUp target={IMPACT_STATS.youthReached} suffix="+" />
                  </p>
                  <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-1">Youth Reached</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-serif font-black text-primary">
                    <CountUp target={IMPACT_STATS.communitiesServed} suffix="+" />
                  </p>
                  <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-1">Communities</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-serif font-black text-primary">
                    <CountUp target={IMPACT_STATS.treesPlanted} suffix="+" />
                  </p>
                  <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-1">Trees Planted</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Image Collage Column */}
          <div className="lg:col-span-5 relative w-full h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
            <FadeIn direction="left" delay={0.3} className="w-full h-full relative">
              {/* Backing structural shape */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-[3rem] border-2 border-dashed border-primary/20 rotate-6" />
              
              {/* Main Image */}
              <div className="absolute top-0 right-4 w-[75%] h-[75%] rounded-[2.5rem] overflow-hidden border-8 border-background shadow-2xl z-10 hover:-translate-y-2 transition-transform duration-500">
                <Image
                  src="/images/hero.png"
                  alt="Youth volunteers planting trees in Kenya"
                  fill
                  priority
                  sizes="(max-width: 768px) 75vw, 40vw"
                  className="object-cover"
                />
              </div>

              {/* Staggered overlapping Image */}
              <div className="absolute bottom-4 left-4 w-[60%] h-[60%] rounded-[2rem] overflow-hidden border-8 border-background shadow-xl z-20 hover:-translate-y-2 transition-transform duration-500">
                <Image
                  src="/images/program-conservation.png"
                  alt="Eco conservation restoration work"
                  fill
                  sizes="(max-width: 768px) 60vw, 30vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
