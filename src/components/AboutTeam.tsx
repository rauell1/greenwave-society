import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";

const TEAM_MEMBERS = [
  {
    name: "Martin Kyalo",
    role: "Founder & Executive Director",
    bio: "Passionate environmentalist and youth leader with over 10 years of experience in community-led conservation.",
    image: "/images/team/martin-kyalo.jpg",
  },
  {
    name: "Jane Doe",
    role: "Head of Operations",
    bio: "Expert in logistics and program management, ensuring our initiatives run smoothly and effectively across Kenya.",
    image: "/images/team/placeholder.jpg",
  },
  {
    name: "John Smith",
    role: "Community Outreach Lead",
    bio: "Dedicated to connecting with local communities and empowering youth through our social enterprise programs.",
    image: "/images/team/placeholder.jpg",
  },
];

export function AboutTeam() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600">
            A passionate group of environmentalists, educators, and community leaders dedicated to empowering the next generation of Kenyan youth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <FadeIn key={member.name} delay={0.1 * (index + 1)}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-emerald-50">
                  <Image quality={95}
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
