import Image from "next/image";
import Link from "next/link";
import { GraduationCap, TreePine, HandHeart, Sprout, Recycle, HeartHandshake, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

interface ProgramItem {
  image: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tags: string[];
  span: string;
  cta?: {
    text: string;
    href: string;
  };
}

const programs: ProgramItem[] = [
  {
    image: "/images/20241214_142822.jpg",
    icon: <HandHeart className="w-5 h-5" />,
    title: "Empower 360: Youth Leadership & Mentorship",
    desc: "Our flagship youth leadership and mentorship initiative. Through Empower 360, we build leadership capacity through mentorship, systems thinking training, and rotating meeting leadership so every member develops facilitation and critical thinking skills. Our inaugural Ad Hoc Cohort I changemakers lead community projects, manage budgets, and drive real-world transformation.",
    tags: ["Flagship", "Empower 360", "Leadership", "Cohort I"],
    span: "md:col-span-2 lg:col-span-2",
    cta: {
      text: "Cohort I Graduation & Market (Oct 30)",
      href: "/events/graduation-cohort-1",
    },
  },
  {
    image: "/images/20241214_130327.jpg",
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Intergenerational Summit",
    desc: "A signature policy dialogue and mentorship convening connecting Kenya's youth changemakers with seasoned civic, environmental, and industry leaders to co-create sustainable community solutions.",
    tags: ["Signature Program", "Policy Dialogue", "Mentorship"],
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    image: "/images/g-59.jpg",
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Young Person's Guide to Systems Thinking",
    desc: "Ad hoc training in partnership with The 50 Percent. We equip youth aged 18-35 to map complex root causes, understand interconnected systemic challenges, and design actionable community-owned solutions.",
    tags: ["In Partnership with The 50 Percent", "Systems Thinking", "Ad Hoc Training"],
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    image: "/images/20250404_134843.jpg",
    icon: <TreePine className="w-5 h-5" />,
    title: "Conservation & Restoration",
    desc: "From tree-planting with Tatu City to community clean-ups with Jessie K and the Nairobi County Environment and habitat restoration, our conservation work directly protects local ecosystems while giving young people real-world project leadership experience, skills, and accountability that no classroom can replicate.",
    tags: ["Tree Planting", "Clean-ups", "Habitat Restoration"],
    span: "md:col-span-2 lg:col-span-2",
  },
  {
    image: "/images/g-12.jpg",
    icon: <HeartHandshake className="w-5 h-5" />,
    title: "Youth Pulse Program",
    desc: "A youth-volunteer initiative centred on intergenerational connection, mental health, and community accountability. The Youth Pulse Program organises community barazas, peer support sessions, and cross-pod collaboration that bring young Kenyans together to build shared responsibility and drive grassroots change.",
    tags: ["Volunteers", "Mental Health", "Intergenerational"],
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    image: "/images/20250215_174908.jpg",
    icon: <Sprout className="w-5 h-5" />,
    title: "Sustainability & Urban Resilience",
    desc: "As a social enterprise, we design sustainable models that reduce donor dependency: from lean programme delivery and shared community infrastructure to tiered revenue strategies that keep our work going long after grants run out.",
    tags: ["Urban Planning", "Ecosystem Design", "Community Resilience"],
    span: "md:col-span-2 lg:col-span-2",
  },
];

const programSlotKeys = [
  "programEmpower",
  "programIntergenerational",
  "programSystemsThinking",
  "programConservation",
  "programYouthPulse",
  "programResilience",
];

export interface ProgramsContentProps {
  sectionTitle?: string;
  sectionBody?: string;
  items?: Record<
    string,
    {
      title: string;
      desc: string;
      tags: string[];
      cta?: { text: string; href: string };
    }
  >;
}

export function Programs({
  placements,
  content,
}: {
  placements?: Record<string, { src: string; alt: string }>;
  content?: ProgramsContentProps;
}) {
  const sectionTitle = content?.sectionTitle || "Our Programs & Initiatives";
  const sectionBody =
    content?.sectionBody ||
    "Six interconnected programmes, from social enterprise training to environmental action, all working together to equip Kenya's youth with the skills, leadership, and community connection to create lasting change.";

  return (
    <section id="programs" className="py-24 sm:py-32 bg-secondary/20 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <FadeIn className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
            <Recycle className="w-3.5 h-3.5 mr-1.5" />
            What We Do
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
            {sectionTitle.includes("Initiatives") ? (
              <>
                Our Programs & <span className="text-primary italic font-normal">Initiatives</span>
              </>
            ) : (
              sectionTitle
            )}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            {sectionBody}
          </p>
        </FadeIn>

        {/* Bento Grid layout */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {programs.map((p, i) => {
            const slotKey = programSlotKeys[i];
            const legacyKeyMap: Record<string, string> = {
              programEmpower: "programEmpower",
              programIntergenerational: "programClimate",
              programSystemsThinking: "programEnterprise",
              programConservation: "programConservation",
              programYouthPulse: "programYouthPulse",
              programResilience: "programResilience",
            };
            const legacyKey = legacyKeyMap[slotKey];
            const itemOverride = content?.items?.[slotKey] || (legacyKey ? content?.items?.[legacyKey] : undefined);
            const placement = placements?.[slotKey] || (legacyKey ? placements?.[legacyKey] : undefined);
            const cardTitle = itemOverride?.title || p.title;
            const cardDesc = itemOverride?.desc || p.desc;
            const cardTags = itemOverride?.tags || p.tags;
            const cardCta = itemOverride?.cta || p.cta;

            return (
              <FadeIn key={p.title} delay={i * 0.1} className={p.span}>
                <div className="group h-full flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-background hover:shadow-[0_20px_50px_oklch(var(--primary)/6%)] hover:border-primary/20 transition-all duration-500">
                  
                  {/* Asymmetric layout depending on span */}
                  <div className={`grid h-full ${p.span.includes("col-span-2") ? "lg:grid-cols-12" : "grid-cols-1"}`}>
                    
                    {/* Image wrapper */}
                    <div className={`relative overflow-hidden min-h-[220px] ${p.span.includes("col-span-2") ? "lg:col-span-5 h-full" : "h-64"}`}>
                      <Image quality={95}
                        src={placement?.src || p.image}
                        alt={placement?.alt || cardTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                    </div>

                    {/* Content wrapper */}
                    <div className={`p-6 sm:p-8 flex flex-col justify-between ${p.span.includes("col-span-2") ? "lg:col-span-7" : ""}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
                            {p.icon}
                          </div>
                          <h3 className="text-lg font-bold tracking-tight text-foreground">{cardTitle}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                          {cardDesc}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                        <div className="flex flex-wrap gap-2">
                          {cardTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 bg-secondary text-primary rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {cardCta && (
                          <Link
                            href={cardCta.href}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-xl border border-primary/20"
                          >
                            <span>{cardCta.text}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </FadeIn>
            );
          })}
        </div>

      </div>
    </section>
  );
}
