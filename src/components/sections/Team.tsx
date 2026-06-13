import { Users, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";

const team = [
  {
    name: "Elyjoy Maina",
    role: "Co-Founder & Executive Director",
    bio: "Passionate about youth empowerment and environmental conservation. Leading Greenwave Society's vision of creating sustainable change through community-driven initiatives.",
    image:
      "https://ui-avatars.com/api/?name=Elyjoy+Maina&background=166534&color=fff&size=200&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/elyjoy-maina-044370244",
  },
  {
    name: "Martin Kyalo",
    role: "Co-Founder & Programs Director",
    bio: "Dedicated to designing and implementing impactful environmental programs. Bringing together communities, volunteers, and partners to achieve shared conservation goals.",
    image:
      "https://ui-avatars.com/api/?name=Martin+Kyalo&background=166534&color=fff&size=200&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/martin-kyalo-9373982b7/",
  },
];

export function Team() {
  return (
    <section id="team" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Our Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Meet the <span className="text-primary">People</span> Behind the Mission
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            Our dedicated team works tirelessly to drive environmental conservation
            and youth empowerment across Kenya.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.15}>
              <Card className="h-full text-center border-border/50 hover:shadow-lg transition-shadow group">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover text-emerald-900"
                    />
                  </div>
                  <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
                    {member.bio}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
