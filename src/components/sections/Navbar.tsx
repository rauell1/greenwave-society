"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Impact", href: "/impact" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || pathname !== "/"
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Green<span className="text-primary">wave</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const isActive = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/contact">Get Involved</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90">
            <Link href="/contact?interest=volunteer">Volunteer</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-zinc-950 border-t border-border overflow-hidden"
          >
            <ul className="px-4 py-4 space-y-1">
              {navLinks.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary/5 text-primary"
                          : "hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
              <Separator className="my-3" />
              <li className="flex gap-2 px-4 pt-1 font-medium">
                <Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
                  <Link href="/contact">Get Involved</Link>
                </Button>
                <Button asChild size="sm" className="flex-1 rounded-full">
                  <Link href="/contact?interest=volunteer">Volunteer</Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
