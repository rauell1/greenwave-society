import Link from "next/link";
import { Sprout, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { CountUp } from "@/components/ui/count-up";
import { IMPACT_STATS } from "@/config/app.config";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.png"
          alt="Youth volunteers planting trees"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24 w-full">
        <div className="max-w-2xl">
          <FadeIn delay={0.1}>
            <Badge
              variant="secondary"
              className="mb-4 sm:mb-6 px-3 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-sm bg-white/15 text-white border-white/20 backdrop-blur-sm hover:bg-white/20"
            >
              <Sprout className="w-3.5 h-3.5 mr-1.5" />
              Non-Profit Organization &bull; Kenya
            </Badge>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight animate-fade-in">
              Empowering Youth to Be{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">
                Changemakers
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.35}>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed max-w-xl">
              Greenwave Society holistically empowers young people to conserve the
              environment, build sustainable communities, and create lasting
              change across Kenya and beyond.
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 text-sm sm:text-base"
              >
                <Link href="/contact?interest=volunteer">
                  Join Our Mission <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="rounded-full bg-white text-emerald-700 border-white shadow-md hover:bg-emerald-50 px-6 sm:px-8 text-sm sm:text-base"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.65}>
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={IMPACT_STATS.youthReached} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-white/60">Youth Reached</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={IMPACT_STATS.communitiesServed} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-white/60">Communities</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={IMPACT_STATS.treesPlanted} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-white/60">Trees Planted</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll indicator using pure CSS animation for better performance/Core Web Vitals */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
        <Link href="/about" aria-label="Scroll to About Section">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5 cursor-pointer hover:border-white/60 transition-colors">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" />
          </div>
        </Link>
      </div>
    </section>
  );
}
