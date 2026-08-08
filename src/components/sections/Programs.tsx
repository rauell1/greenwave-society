import Image from "next/image";
import { GraduationCap, TreePine, HandHeart, Sprout, Recycle, HeartHandshake, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

const programs = [
  {
    image: "/images/program-education.png",
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Climate Action and Advocacy SDGs Training",
    desc: "We deliver hands-on workshops and training sessions that teach young people about ecology, sustainability, waste management, and climate science. Our education programs equip the next generation with knowledge to make informed environmental decisions.",
    tags: ["Workshops", "School Programs", "Climate Literacy"],
    span: "md:col-span-2 lg:col-span-2",
  },
  {
    image: "/images/program-conservation.png",
    icon: <TreePine className="w-5 h-5" />,
    title: "Conservation & Restoration",
    desc: "From tree-planting campaigns to river clean-ups and habitat restoration, our conservation programs directly protect and restore local ecosystems. We mobilize volunteers and partner with communities to conserve natural resources.",
    tags: ["Tree Planting", "Clean-ups", "Habitat Restoration"],
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    image: "/images/program-empowerment.png",
    icon: <HandHeart className="w-5 h-5" />,
    title: "Youth Empowerment",
    desc: "We build leadership capacity through mentorship, skills training, and community engagement opportunities. Our programs help youth develop confidence, critical thinking, and project management skills.",
    tags: ["Leadership", "Mentorship", "Skills Building"],
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    image: "/images/program-agriculture.png",
    icon: <Sprout className="w-5 h-5" />,
    title: "Sustainability Programs",
    desc: "We lead sustainability programs through urban planning initiatives and ecosystem design projects that help communities build greener, more resilient neighborhoods.",
    tags: ["Urban Planning", "Ecosystem Design", "Resilient Communities"],
    span: "md:col-span-2 lg:col-span-2",
  },
  {
    image: "/images/program-empowerment.png",
    icon: <HeartHandshake className="w-5 h-5" />,
    title: "Young People Pulse (YPP)",
    desc: "A youth-volunteer initiative centred on intergenerational connection, mental health awareness, and community accountability. YPP brings together young people to support one another, build shared responsibility, and drive grassroots change across Kenya.",
    tags: ["Volunteers", "Mental Health", "Intergenerational"],
    span: "md:col-span-1 lg:col-span-1",
  },
  {
    image: "/images/program-education.png",
    icon: <TrendingUp className="w-5 h-5" />,
    title: "The 50 Percent — Social Enterprise",
    desc: "Our flagship social enterprise training programme equips young people with the tools to create economic value. Built around five pillars — who we train, how we train, where we train, what skills we build, and why — the programme expands thinking, addresses unemployment and skills gaps, and adds lasting value to organisations and communities.",
    tags: ["Social Enterprise", "Skills Training", "Economic Empowerment"],
    span: "md:col-span-2 lg:col-span-2",
  },
];

export function Programs() {
  return (
    <section id="programs" className="py-24 sm:py-32 bg-secondary/20 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <FadeIn className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
            <Recycle className="w-3.5 h-3.5 mr-1.5" />
            What We Do
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
            Our Programs & <span className="text-primary italic font-normal">Initiatives</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            We run a range of programs designed to empower youth and protect the
            environment, creating a sustainable future for communities across Kenya.
          </p>
        </FadeIn>

        {/* Bento Grid layout */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {programs.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1} className={p.span}>
              <div className="group h-full flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-background hover:shadow-[0_20px_50px_oklch(var(--primary)/6%)] hover:border-primary/20 transition-all duration-500">
                
                {/* Asymmetric layout depending on span */}
                <div className={`grid h-full ${p.span.includes("col-span-2") ? "lg:grid-cols-12" : "grid-cols-1"}`}>
                  
                  {/* Image wrapper */}
                  <div className={`relative overflow-hidden min-h-[220px] ${p.span.includes("col-span-2") ? "lg:col-span-5 h-full" : "h-64"}`}>
                    <Image
                      src={p.image}
                      alt={p.title}
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
                        <h3 className="text-lg font-bold tracking-tight text-foreground">{p.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {p.desc}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 bg-secondary text-primary rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
