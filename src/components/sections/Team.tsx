import Image from "next/image";
import { Users, Linkedin, ShieldCheck, Sparkles, Compass, Palette, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

const founder = {
  name: "Martin Kyalo",
  role: "Founder & Chief Executive Officer (CEO)",
  tag: "Founder",
  bio: "Dedicated to designing and implementing impactful environmental programs, steering organizational growth, and uniting volunteers, youth changemakers, and strategic partners to achieve shared climate resilience goals across Kenya.",
  image:
    "https://ui-avatars.com/api/?name=Martin+Kyalo&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
  linkedin: "https://www.linkedin.com/in/martin-kyalo-9373982b7/",
};

const executives = [
  {
    name: "Njeri Njoroge",
    role: "Chief Operating Officer (COO)",
    initials: "NN",
    tag: "Executive",
    bio: "Oversees daily operations, organizational workflows, and institutional governance to ensure seamless execution of environmental initiatives.",
    icon: Compass,
  },
  {
    name: "Eugene Shadrack",
    role: "Chief Innovation Officer (CIO)",
    initials: "ES",
    tag: "Executive",
    bio: "Spearheads technological integration and digital transformation, fostering creative solutions to scale climate action and youth engagement.",
    icon: Sparkles,
  },
  {
    name: "Mark Katana",
    role: "Chief Strategy & Well-being Officer (CSWO)",
    initials: "MK",
    tag: "Executive",
    bio: "Guides long-term strategic direction and promotes community well-being, mental resilience, and holistic youth empowerment across all programs.",
    icon: ShieldCheck,
  },
];

const designTeam = [
  {
    name: "Roy Okola Otieno",
    role: "Head of Design",
    initials: "RO",
    tag: "Design Lead",
    bio: "Directs brand identity, UI/UX design systems, and digital media architecture to amplify Greenwave Society's visual impact and mission awareness.",
    icon: Palette,
  },
  {
    name: "Roy John",
    role: "Design Assistant",
    initials: "RJ",
    tag: "Creative",
    bio: "Supports media production, creative asset design, and brand collateral development for grassroots campaigns and executive communications.",
    icon: PenTool,
  },
];

export function Team() {
  return (
    <section id="team" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-16 sm:mb-20">
          <div className="lg:col-span-6">
            <FadeIn>
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
                <Users className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Our Team
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
                Meet the <span className="italic font-normal text-primary">People</span> Behind the Mission
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-6">
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed lg:border-l lg:border-primary/25 lg:pl-6">
                Our dedicated founder and executive team work tirelessly to design, implement, and govern
                impactful programs that empower youth and secure environmental resilience across Kenya.
              </p>
            </FadeIn>
          </div>
        </div>

        {/* 1. Featured Founder Hero Card */}
        <FadeIn delay={0.15}>
          <div className="mb-20 bg-secondary/10 rounded-[2.5rem] border border-primary/20 p-6 sm:p-10 lg:p-12 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-[2rem] overflow-hidden border border-primary/25 bg-secondary/20 p-3 shadow-md group-hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-6 right-6 z-10 bg-gold text-white font-mono text-[10px] tracking-widest uppercase py-1.5 px-3.5 rounded-full shadow-md">
                    {founder.tag}
                  </div>
                  <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-primary/5">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-center">
                <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-2">
                  Founder Showcase
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif font-black text-foreground mb-3">
                  {founder.name}
                </h3>
                <p className="text-base font-semibold text-primary mb-6">
                  {founder.role}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl font-sans">
                  {founder.bio}
                </p>
                
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary border-b border-foreground/35 hover:border-primary pb-1 transition-all duration-300 self-start"
                  aria-label={`${founder.name} LinkedIn`}
                >
                  <Linkedin className="w-4 h-4 text-gold" />
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 2. Executive Officers Grid */}
        <div className="mb-16">
          <FadeIn delay={0.2}>
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px bg-primary/25 flex-1" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 bg-primary/5 rounded-full border border-primary/15">
                Executive Leadership
              </h3>
              <span className="h-px bg-primary/25 flex-1" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {executives.map((exec, i) => {
              const IconComp = exec.icon;
              return (
                <FadeIn key={exec.name} delay={0.2 + i * 0.1}>
                  <div className="bg-background rounded-2xl border border-primary/20 p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-300 group h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-serif font-black text-primary text-base group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          {exec.initials}
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider bg-secondary/30 text-muted-foreground px-2.5 py-1 rounded-md border border-primary/10">
                          {exec.tag}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-serif font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {exec.name}
                      </h4>
                      <p className="text-xs font-semibold text-primary mb-3">
                        {exec.role}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        {exec.bio}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <IconComp className="w-3.5 h-3.5 text-gold" />
                        Executive Officer
                      </span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        {/* 3. Design & Creative Team */}
        <div>
          <FadeIn delay={0.3}>
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px bg-primary/25 flex-1" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 bg-primary/5 rounded-full border border-primary/15">
                Design & Creative Operations
              </h3>
              <span className="h-px bg-primary/25 flex-1" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {designTeam.map((member, i) => {
              const IconComp = member.icon;
              return (
                <FadeIn key={member.name} delay={0.35 + i * 0.1}>
                  <div className="bg-background rounded-2xl border border-primary/20 p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-300 group h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center font-serif font-black text-gold text-base group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                          {member.initials}
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider bg-secondary/30 text-muted-foreground px-2.5 py-1 rounded-md border border-primary/10">
                          {member.tag}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-serif font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-xs font-semibold text-primary mb-3">
                        {member.role}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        {member.bio}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <IconComp className="w-3.5 h-3.5 text-gold" />
                        Creative Operations
                      </span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
