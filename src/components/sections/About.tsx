import Link from "next/link";
import { Leaf, Users, Heart, Globe, Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export function About() {
  const values = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Climate & Ecosystem Protection",
      desc: "We advance SDG 13, 14, and 15 through restoration, biodiversity protection, and practical conservation action in local communities.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Youth Leadership & Inclusion",
      desc: "We empower youth aged 15-35 with education, mentorship, and equitable opportunities aligned with SDG 4, 5, 8, and 10.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Community-Led Development",
      desc: "We support SDG 6 and 11 through local action on water stewardship, sustainable communities, and grassroots project leadership.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Partnerships & Accountability",
      desc: "Through SDG 17 partnerships, IFRS-aligned transparency, and strong governance, we scale sustainable impact responsibly.",
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Image */}
          <FadeIn direction="left">
            <div className="relative overflow-hidden sm:overflow-visible">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/about.png"
                  alt="Youth in community discussion"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="hidden sm:block absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-2xl -z-10" />
              <div className="hidden sm:block absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary/20 rounded-2xl -z-10" />
            </div>
          </FadeIn>

          {/* Content */}
          <div>
            <FadeIn>
              <Badge variant="secondary" className="mb-3 sm:mb-4">
                <Target className="w-3.5 h-3.5 mr-1.5" />
                Our Mission
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Mission, Vision &{" "}
                <span className="text-primary">Global Alignment</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Greenwave Society's mission is to accelerate climate action, empower
                youth as global changemakers, and foster sustainable community
                development through international cooperation, advocacy, and
                localized action.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-3 sm:mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Our vision is a resilient world where humanity and planetary
                boundaries exist in harmony, achieved through practical delivery of
                the 2030 Agenda for Sustainable Development.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Button asChild className="mt-6 sm:mt-8 rounded-full" size="lg">
                <Link href="/programs">
                  Explore Our Programs <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 sm:mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.1}>
              <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                <CardContent className="p-5 sm:p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {v.icon}
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
