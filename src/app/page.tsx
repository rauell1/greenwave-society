import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Programs } from "@/components/sections/Programs";
import { Impact } from "@/components/sections/Impact";
import { Team } from "@/components/sections/Team";
import { Activities } from "@/components/sections/Activities";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Programs />
        <Impact />
        <Team />
        <Activities />
        <VolunteerCTA />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
