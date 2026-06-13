import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Team } from "@/components/sections/Team";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
  title: "Meet the Team | Founders & Directors",
  description: "Meet the leadership team behind Greenwave Society, including Co-Founders Elyjoy Maina (Executive Director) and Martin Kyalo (Programs Director), directing environmental conservation in Kenya.",
  alternates: {
    canonical: "/team",
  },
};

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <Team />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
