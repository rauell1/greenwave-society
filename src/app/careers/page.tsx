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
        <section className="bg-emerald-950 text-white py-20 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-950 to-zinc-950"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight mb-6">
              Join the <span className="text-emerald-400">Greenwave</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              We are a team of passionate individuals dedicated to equipping young Kenyans to lead, build, and connect. Help us build a more sustainable future.
            </p>
          </div>
        </section>

        {/* Current Openings */}
        <section className="py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900">Open Positions</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Currently, we don't have any open positions. However, we are always on the lookout for talented individuals. Feel free to send us your resume.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-zinc-900">Don't see a perfect fit?</h3>
            <p className="text-zinc-600 mb-8 leading-relaxed max-w-xl mx-auto">
              We're growing fast and new roles open up frequently. Send us your CV and a cover letter explaining how you can contribute to our mission.
            </p>
            <a 
              href={`mailto:${APP_CONFIG.contact.email}?subject=Spontaneous Application`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-600/20"
            >
              Email Your Resume <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-24 border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center text-zinc-900">Why Work With Us?</h2>
            <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform -rotate-3 transition-transform hover:rotate-0">
                  <Leaf className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">Meaningful Impact</h3>
                <p className="text-zinc-600 leading-relaxed">Work on projects that directly contribute to environmental conservation and youth empowerment across Kenya.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-transform hover:-translate-y-1">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">Incredible Team</h3>
                <p className="text-zinc-600 leading-relaxed">Join a diverse group of passionate, driven individuals who support each other and celebrate success together.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform rotate-3 transition-transform hover:rotate-0">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">Growth Opportunities</h3>
                <p className="text-zinc-600 leading-relaxed">We invest in our people with continuous learning, mentorship, and opportunities to lead new initiatives.</p>
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
