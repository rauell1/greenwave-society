import { Users, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

const team = [
  {
    name: "Elyjoy Maina",
    role: "Co-Founder & Executive Director",
    bio: "Passionate about youth empowerment and environmental conservation. Leading Greenwave Society's vision of creating sustainable change through community-driven initiatives.",
    image:
      "https://ui-avatars.com/api/?name=Elyjoy+Maina&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/elyjoy-maina-044370244",
  },
  {
    name: "Martin Kyalo",
    role: "Co-Founder & Programs Director",
    bio: "Dedicated to designing and implementing impactful environmental programs. Bringing together communities, volunteers, and partners to achieve shared conservation goals.",
    image:
      "https://ui-avatars.com/api/?name=Martin+Kyalo&background=1f4731&color=fff&size=400&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/martin-kyalo-9373982b7/",
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
                Meet the <span className="italic font-normal text-primary">People</span> Behind the Mission
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-6">
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed lg:border-l lg:border-primary/25 lg:pl-6">
                Our dedicated co-founders work tirelessly to design, implement, and govern
                impactful programs that empower youth and secure environmental resilience across Kenya.
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-12 sm:gap-16 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.15}>
              <div className="flex flex-col items-center sm:items-start group">
                <div className="relative w-full aspect-[4/5] sm:max-w-sm rounded-[2rem] overflow-hidden border border-primary/25 bg-secondary/15 p-3 transition-transform duration-500 group-hover:-translate-y-2">
                  {/* Floating role badge */}
                  <div className="absolute top-6 right-6 z-10 bg-gold text-white font-mono text-[10px] tracking-widest uppercase py-1.5 px-3.5 rounded-full shadow-md">
                    Co-Founder
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

                <div className="mt-8 text-center sm:text-left w-full">
                  <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-2">
                    {member.name.split(" ")[0]}
                  </span>
                  <h3 className="text-2xl font-serif font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-sans">
                    {member.bio}
                  </p>
                  
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary border-b border-foreground/35 hover:border-primary pb-1 transition-all duration-300"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin className="w-3.5 h-3.5 text-gold" />
                    Connect on LinkedIn
                  </a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
