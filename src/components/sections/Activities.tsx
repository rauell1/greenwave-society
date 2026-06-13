import { Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";

const activities = [
  {
    title: "Maangani Primary and Secondary Schools",
    desc: "1st project launched post maandamano with school-focused engagement and community support.",
    date: "6 Jul 2024",
    type: "Education",
    mediaUrl: "https://photos.app.goo.gl/bwhvJHBHeFEgnAin9",
  },
  {
    title: "Ngong Hike",
    desc: "Additional highlights from the 1st project activities conducted on 6/7/2024.",
    date: "6 Jul 2024",
    type: "Community",
    mediaUrl: "https://photos.app.goo.gl/aPp6qoR1sftX1ckc7",
  },
  {
    title: "Valentines Day Picnic",
    desc: "Outdoor team activity focused on wellness, environmental appreciation, and member bonding.",
    date: "Dec 2024",
    type: "Wellness",
    mediaUrl: "https://photos.app.goo.gl/goGFiHwXDiDobrmK6",
  },
  {
    title: "Valentine's Day Picnic",
    desc: "Mental health awareness session and community picnic for youth connection and support.",
    date: "14 Feb 2025",
    type: "Mental Health",
    mediaUrl: "https://photos.app.goo.gl/ep2HVgur2hmVzTNAA",
  },
  {
    title: "Departmental Hang Out",
    desc: "Additional Valentine's Day moments highlighting peer support and youth wellbeing activities.",
    date: "14 Feb 2025",
    type: "Community",
    mediaUrl: "https://photos.app.goo.gl/zZqqv3SGCCxqBBAo8",
  },
  {
    title: "Kangemi Restoration Program",
    desc: "Cross-department hangout to strengthen collaboration, planning, and team cohesion.",
    date: "Jul 2025",
    type: "Team Building",
    mediaUrl: "https://photos.app.goo.gl/CxjV1qY33ZYosmyK7",
  },
  {
    title: "Mentorship at Kangemi Vocational Centre",
    desc: "Mentorship engagement in Kangemi focused on youth growth, guidance, and career readiness.",
    date: "May 2025",
    type: "Mentorship",
    mediaUrl: "https://photos.app.goo.gl/8jsuqcjCEGeWoHb16",
  },
  {
    title: "Featured Video Story",
    desc: "Highlights from Greenwave community work and activities in video format.",
    date: "2025",
    type: "Media",
    mediaUrl: "https://youtu.be/Bhy13UQbjQw?si=YsJ8C9V0cGA5Z4_X",
  },
];

export function Activities() {
  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Recent Activities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            What We Have Been <span className="text-primary">Up To</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            From community clean-ups to leadership summits, our recent activities
            showcase the breadth of our impact.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 gap-4 sm:gap-6">
          {activities.map((a, i) => (
            <FadeIn key={a.title} delay={i * 0.1}>
              <Card className="h-full border-border/50 hover:shadow-md hover:border-primary/30 transition-all group">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/20 text-primary"
                    >
                      {a.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                  <a
                    href={a.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View media <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
