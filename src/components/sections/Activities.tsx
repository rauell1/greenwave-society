import { Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

const activities = [
  {
    title: "Maangani Primary and Secondary Schools",
    desc: "Greenwave's first project — a school-focused conservation and education programme delivering hands-on environmental learning and community support to students in Maangani.",
    date: "6 Jul 2024",
    type: "Education",
    mediaUrl: "https://photos.app.goo.gl/bwhvJHBHeFEgnAin9",
  },
  {
    title: "Ngong Hike",
    desc: "A community hike through the Ngong Hills bringing youth together around environmental appreciation, physical wellbeing, and connection to Kenya's natural landscape.",
    date: "6 Jul 2024",
    type: "Community",
    mediaUrl: "https://photos.app.goo.gl/aPp6qoR1sftX1ckc7",
  },
  {
    title: "Wellness Picnic",
    desc: "An outdoor gathering focused on team wellbeing, member bonding, and grounding the Greenwave community in shared purpose ahead of the year ahead.",
    date: "Dec 2024",
    type: "Wellness",
    mediaUrl: "https://photos.app.goo.gl/goGFiHwXDiDobrmK6",
  },
  {
    title: "Valentine's Day Picnic",
    desc: "A mental health awareness event and community picnic designed to foster peer connection, open conversation, and emotional support among Greenwave youth members.",
    date: "14 Feb 2025",
    type: "Mental Health",
    mediaUrl: "https://photos.app.goo.gl/ep2HVgur2hmVzTNAA",
  },
  {
    title: "Departmental Hang Out",
    desc: "A cross-department team session to strengthen internal collaboration, align on shared goals, and build the relationships that keep Greenwave running effectively.",
    date: "14 Feb 2025",
    type: "Team Building",
    mediaUrl: "https://photos.app.goo.gl/zZqqv3SGCCxqBBAo8",
  },
  {
    title: "Kangemi Restoration Programme",
    desc: "A hands-on ecosystem restoration initiative in Kangemi — bringing youth volunteers together to rehabilitate green spaces, plant trees, and connect environmental action with community pride.",
    date: "Jul 2025",
    type: "Conservation",
    mediaUrl: "https://photos.app.goo.gl/CxjV1qY33ZYosmyK7",
  },
  {
    title: "Mentorship at Kangemi Vocational Centre",
    desc: "A mentorship engagement at Kangemi Vocational Centre equipping young people with career guidance, practical skills, and the confidence to navigate employment and enterprise.",
    date: "May 2025",
    type: "Mentorship",
    mediaUrl: "https://photos.app.goo.gl/8jsuqcjCEGeWoHb16",
  },
  {
    title: "Featured Video Story",
    desc: "A short documentary capturing Greenwave's community work in action — the faces, places, and moments behind the mission.",
    date: "2025",
    type: "Media",
    mediaUrl: "https://youtu.be/Bhy13UQbjQw?si=YsJ8C9V0cGA5Z4_X",
  },
];

export function Activities() {
  return (
    <section id="activities" className="py-24 sm:py-32 bg-secondary/20 relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20 sm:mb-28">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gold" />
            Recent Activities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
            What We Have Been <span className="italic font-normal text-primary">Up To</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            From school conservation programmes to vocational mentorship, wellness sessions, and ecosystem restoration — this is what closing the gap looks like in practice.
          </p>
        </FadeIn>

        {/* Timeline container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical dashed line */}
          <div className="absolute left-4 md:left-[144px] top-2 bottom-2 w-[1px] border-l border-dashed border-primary/30" />

          <div className="space-y-16">
            {activities.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.08}>
                <div className="relative md:grid md:grid-cols-[120px_1fr] md:gap-12 pl-10 md:pl-0 group">
                  {/* Left Column: Date & Type (Desktop) */}
                  <div className="hidden md:block text-right">
                    <span className="font-mono text-xs text-gold uppercase tracking-widest block pt-1.5">
                      {a.date}
                    </span>
                    <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wider border-primary/20 text-primary bg-primary/5 rounded-md px-2.5 py-0.5">
                      {a.type}
                    </Badge>
                  </div>

                  {/* Center Column: Node Bullet */}
                  <div className="absolute left-3.5 md:left-[140.5px] top-1.5 -translate-x-1/2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-primary/10 group-hover:scale-125 transition-transform duration-300" />
                  </div>

                  {/* Right Column: Content Card */}
                  <div className="flex-1 bg-background rounded-[1.5rem] border border-primary/10 p-6 sm:p-8 hover:shadow-[0_20px_50px_oklch(var(--primary)/5%)] transition-all duration-300 group-hover:border-primary/20">
                    {/* Date and Tag for Mobile */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 md:hidden">
                      <span className="font-mono text-xs text-gold uppercase tracking-widest">
                        {a.date}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {a.type}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors duration-300">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-sans">
                      {a.desc}
                    </p>
                    
                    <div className="mt-5 flex items-center">
                      <a
                        href={a.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline hover:gap-2 transition-all duration-300"
                      >
                        Explore Event Media
                        <ExternalLink className="w-3.5 h-3.5 text-gold" />
                      </a>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
