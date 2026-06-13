import { GraduationCap, TreePine, HandHeart, Sprout, Recycle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";

const programs = [
  {
    image: "/images/program-education.png",
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Climate Action and Advocacy SDGs Training",
    desc: "We deliver hands-on workshops and training sessions that teach young people about ecology, sustainability, waste management, and climate science. Our education programs equip the next generation with knowledge to make informed environmental decisions.",
    tags: ["Workshops", "School Programs", "Climate Literacy"],
  },
  {
    image: "/images/program-conservation.png",
    icon: <TreePine className="w-6 h-6" />,
    title: "Conservation & Restoration",
    desc: "From tree-planting campaigns to river clean-ups and habitat restoration, our conservation programs directly protect and restore local ecosystems. We mobilize volunteers and partner with communities to conserve natural resources.",
    tags: ["Tree Planting", "Clean-ups", "Habitat Restoration"],
  },
  {
    image: "/images/program-empowerment.png",
    icon: <HandHeart className="w-6 h-6" />,
    title: "Youth Empowerment",
    desc: "We build leadership capacity through mentorship, skills training, and community engagement opportunities. Our programs help youth develop confidence, critical thinking, and project management skills.",
    tags: ["Leadership", "Mentorship", "Skills Building"],
  },
  {
    image: "/images/program-agriculture.png",
    icon: <Sprout className="w-6 h-6" />,
    title: "Sustainability Programs",
    desc: "We lead sustainability programs through urban planning initiatives and ecosystem design projects that help communities build greener, more resilient neighborhoods.",
    tags: ["Urban Planning", "Ecosystem Design", "Resilient Communities"],
  },
];

export function Programs() {
  return (
    <section id="programs" className="py-16 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <Recycle className="w-3.5 h-3.5 mr-1.5" />
            What We Do
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Our Programs & <span className="text-primary">Initiatives</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            We run a range of programs designed to empower youth and protect the
            environment, creating a sustainable future for communities across Kenya.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid md:grid-cols-2 gap-6 sm:gap-8">
          {programs.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <Card className="h-full overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="grid sm:grid-cols-[200px_1fr] gap-0">
                  {/* Image */}
                  <div className="relative h-48 sm:h-full overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <CardContent className="p-5 sm:p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {p.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                      {p.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-primary/20 text-primary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
