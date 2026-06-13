import Link from "next/link";
import { HandHeart, ArrowRight, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export function VolunteerCTA() {
  return (
    <section id="volunteer" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="grid lg:grid-cols-2">
              {/* Left: Image */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src="/images/program-conservation.png"
                  alt="Volunteers cleaning riverbank"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:hidden" />
              </div>

              {/* Right: Content */}
              <CardContent className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <Badge className="mb-3 sm:mb-4 w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <HandHeart className="w-3.5 h-3.5 mr-1.5" />
                  Get Involved
                </Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Become a Volunteer Today
                </h2>
                <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Join our growing network of passionate volunteers and help make a
                  real difference in your community. Whether you want to plant trees,
                  lead workshops, or support our operations, there is a place for you
                  at Greenwave Society.
                </p>

                <div className="mt-5 sm:mt-6 space-y-3">
                  {[
                    "Flexible volunteering opportunities",
                    "Training and mentorship provided",
                    "Connect with like-minded changemakers",
                    "Make a measurable environmental impact",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Leaf className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8">
                  <Button asChild size="lg" className="rounded-full w-full sm:w-auto">
                    <Link href="/contact?interest=volunteer">
                      Sign Up to Volunteer <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}
