import Image from "next/image";
import { Star } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const REVIEWS = [
  {
    id: 1,
    name: "Sarah Kamau",
    role: "Volunteer",
    photo: "/images/team/placeholder.jpg",
    rating: 5,
    text: "Greenwave Society's social enterprise program completely changed my outlook on community leadership. I learned skills that I now use every day in my own business.",
  },
  {
    id: 2,
    name: "David Ochieng",
    role: "Community Partner",
    photo: "/images/team/placeholder.jpg",
    rating: 5,
    text: "Partnering with Greenwave for the local tree planting drive was incredible. Their organization and dedication to empowering the youth is truly inspiring.",
  },
  {
    id: 3,
    name: "Grace Wanjiku",
    role: "Program Graduate",
    photo: "/images/team/placeholder.jpg",
    rating: 4,
    text: "The mental health awareness sessions in the YPP initiative provided a safe space for us. It is rare to find an organization that cares about our holistic wellbeing.",
  }
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-emerald-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white mb-4">
            Hear From Our Community
          </h2>
          <p className="text-lg text-emerald-100">
            Real stories from the youth and partners who have experienced the Greenwave Society impact firsthand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <FadeIn key={review.id} delay={0.1 * (index + 1)}>
              <div className="bg-white rounded-2xl p-8 shadow-xl relative">
                {/* Star Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-gray-700 italic mb-8 relative z-10 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-100">
                    <Image quality={95}
                      src={review.photo}
                      alt={review.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-emerald-600 font-medium">{review.role}</p>
                  </div>
                </div>

                {/* Decorative Quote Mark */}
                <div className="absolute top-8 right-8 text-emerald-50 opacity-50 font-serif text-8xl leading-none pointer-events-none">
                  "
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
