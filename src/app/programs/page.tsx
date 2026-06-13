import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Programs } from "@/components/sections/Programs";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
  title: "Our Programs & Initiatives | Climate Action & Conservation",
  description: "Explore Greenwave Society's programs in Kenya, including Climate Advocacy training, Ecosystem Restoration, Youth Empowerment, and Sustainable Agriculture.",
  alternates: {
    canonical: "/programs",
  },
};

export default function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <Programs />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
