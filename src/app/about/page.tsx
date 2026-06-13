import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { About } from "@/components/sections/About";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
  title: "About Us | Mission, Vision & Global Alignment",
  description: "Learn about the mission, vision, and core values of Greenwave Society. We are aligned with UN SDGs 13, 14, 15, and 17 to protect local ecosystems and empower youth in Kenya.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <About />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
