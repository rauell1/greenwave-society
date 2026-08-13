import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { Briefcase, ArrowRight, Leaf, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers | Join Greenwave Society",
  description: "Join our team at Greenwave Society and help close the gaps in skills, opportunity, and wellbeing for young Kenyans.",
  alternates: {
    canonical: `${APP_CONFIG.url}/careers`,
  },
};

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="bg-zinc-950 text-white py-24 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(24,24,27,1))]"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold font-serif tracking-tight mb-6 text-balance">
              Help us build a more sustainable future.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-balance">
              We are a team of passionate individuals dedicated to equipping young Kenyans to lead, build, and connect. Join the Greenwave.
            </p>
          </div>
        </section>

        {/* Current Openings */}
        <section className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 font-serif">Open Positions</h2>
            <p className="text-zinc-500 text-lg">
              Explore our current openings and find where you fit in.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-24 space-y-4">
            <div className="group bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md hover:border-zinc-300 transition-all">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">Communications Lead</h3>
                  <span className="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-1 rounded-md">Full-time</span>
                  <span className="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-1 rounded-md">Nairobi / Remote</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
                  Lead our communication strategies and shape our public narrative to amplify our impact across Kenya.
                </p>
              </div>
              <a 
                href="/careers/apply/communications-lead"
                className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 text-sm"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-zinc-100 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-white shadow-sm border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-zinc-900 font-serif">Don't see a perfect fit?</h3>
            <p className="text-zinc-500 mb-8 leading-relaxed max-w-lg mx-auto">
              We are growing fast and new roles open up frequently. Send us your CV and a cover letter explaining how you can contribute to our mission.
            </p>
            <a 
              href={`mailto:${APP_CONFIG.contact.email}?subject=Spontaneous Application`}
              className="inline-flex items-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-900 px-6 py-3 rounded-lg font-medium transition-all text-sm shadow-sm"
            >
              Email Your Resume <ArrowRight className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-24 border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center text-zinc-900 font-serif">Why Work With Us?</h2>
            <div className="grid sm:grid-cols-3 gap-10 lg:gap-16">
              <div>
                <div className="w-12 h-12 bg-zinc-100 text-zinc-700 rounded-xl flex items-center justify-center mb-6">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-zinc-900">Meaningful Impact</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">Work on projects that directly contribute to environmental conservation and youth empowerment across Kenya.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-zinc-100 text-zinc-700 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-zinc-900">Incredible Team</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">Join a diverse group of passionate, driven individuals who support each other and celebrate success together.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-zinc-100 text-zinc-700 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-zinc-900">Growth Opportunities</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">We invest in our people with continuous learning, mentorship, and opportunities to lead new initiatives.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
