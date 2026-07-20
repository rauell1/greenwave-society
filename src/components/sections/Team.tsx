import { Users, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

const team = [
  {
    name: "Martin Kyalo",
    role: "Founder & Chief Executive Officer (CEO)",
    tag: "Founder",
    bio: "Dedicated to designing and implementing impactful environmental programs, steering organizational growth, and uniting volunteers and partners to achieve shared conservation goals.",
    image:
      "https://ui-avatars.com/api/?name=Martin+Kyalo&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/martin-kyalo-9373982b7/",
  },
  {
    name: "Njeri Njoroge",
    role: "Chief Operating Officer (COO)",
    tag: "Executive",
    bio: "Oversees daily operations, organizational workflows, and institutional governance to ensure effective and efficient execution of environmental initiatives.",
    image:
      "https://ui-avatars.com/api/?name=Njeri+Njoroge&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "#",
  },
  {
    name: "Eugene Shadrack",
    role: "Chief Innovation Officer (CIO)",
    tag: "Executive",
    bio: "Spearheads technological integration and digital transformation, fostering creative solutions to scale climate action and youth engagement.",
    image:
      "https://ui-avatars.com/api/?name=Eugene+Shadrack&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "#",
  },
  {
    name: "Mark Katana",
    role: "Chief Strategy & Well-being Officer (CSWO)",
    tag: "Executive",
    bio: "Guides long-term strategic direction and promotes community well-being, mental resilience, and holistic youth empowerment across all programs.",
    image:
      "https://ui-avatars.com/api/?name=Mark+Katana&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "#",
  },
  {
    name: "Roy Okola Otieno",
    role: "Head of Design",
    tag: "Leadership",
    bio: "Directs brand identity, UI/UX design systems, and digital media architecture to amplify Greenwave Society's visual impact and mission awareness.",
    image:
      "https://ui-avatars.com/api/?name=Roy+Okola+Otieno&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "#",
  },
  {
    name: "Roy John",
    role: "Design Assistant",
    tag: "Leadership",
    bio: "Supports media production, creative asset design, and brand collateral development for grassroots campaigns and executive communications.",
    image:
      "https://ui-avatars.com/api/?name=Roy+John&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "#",
  },
];

export function Team() {
  return (
    <section id="team" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Decorative leaf/shape background accent */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-16 sm:mb-24">
          <div className="lg:col-span-6">
            <FadeIn>
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
                <Users className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Our Team
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
                Meet the <span className="italic font-normal text-primary">Executive Leaders</span> Behind the Mission
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-6">
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed lg:border-l lg:border-primary/25 lg:pl-6">
                Our dedicated executive leadership team works tirelessly to design, implement, and govern
                impactful programs that empower youth and secure environmental resilience across Kenya.
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.1}>
              <div className="flex flex-col items-center sm:items-start group h-full">
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden border border-primary/25 bg-secondary/15 p-3 transition-transform duration-500 group-hover:-translate-y-2">
                  {/* Floating role badge */}
                  <div className="absolute top-6 right-6 z-10 bg-gold text-white font-mono text-[10px] tracking-widest uppercase py-1.5 px-3.5 rounded-full shadow-md">
                    {member.tag}
                  </div>
                  
                  {/* Portrait frame */}
                  <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-primary/5 flex items-center justify-center">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 hover:scale-102 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="mt-6 text-center sm:text-left w-full flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
                      {member.name.split(" ")[0]}
                    </span>
                    <h3 className="text-xl font-serif font-black text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary mb-3">
                      {member.role}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-sans">
                      {member.bio}
                    </p>
                  </div>
                  
                  {member.linkedin !== "#" && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary border-b border-foreground/35 hover:border-primary pb-1 transition-all duration-300 self-start"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin className="w-3.5 h-3.5 text-gold" />
                      Connect on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
