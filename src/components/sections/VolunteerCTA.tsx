import Image from "next/image";
import Link from "next/link";
import { HandHeart, ArrowRight, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export function VolunteerCTA() {
  return (
    <section id="volunteer" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Decorative leaf blur accent */}
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[35rem] h-[35rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with offset frame */}
          <div className="lg:col-span-5 relative order-last lg:order-first">
            <FadeIn direction="right">
              <div className="relative">
                {/* Decorative background outline frame */}
                <div className="absolute -inset-4 rounded-[3rem] border border-primary/20 -z-10 -rotate-2" />
                <div className="aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5] relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_oklch(var(--primary)/8%)]">
                  <Image quality={95}
                    src="/images/20241214_180058.jpg"
                    alt="Greenwave Society volunteers and community members gathered in Kenya"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Editorial Callout */}
          <div className="lg:col-span-7">
            <FadeIn>
              <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 px-3 py-1.5 rounded-full">
                <HandHeart className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Get Involved
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
                Become a <span className="italic font-normal text-primary">Volunteer</span> Today
              </h2>
              <p className="mt-6 text-muted-foreground text-sm sm:text-base leading-relaxed">
                Join a growing network of young Kenyans who are doing real things: leading systems thinking sessions, organising community barazas, planting trees, running clean-ups, and building an organisation that sustains itself. There is a role here for you.
              </p>

              {/* High-end list structure */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  "Lead community barazas & workshops",
                  "Participate in systems thinking training",
                  "Join conservation & cleanup events",
                  "Grow your leadership with real responsibility",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Leaf className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground font-sans">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md px-8 py-6 group">
                  <Link href="/contact?interest=volunteer">
                    Sign Up to Volunteer 
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
