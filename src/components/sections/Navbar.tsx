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
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || pathname !== "/"
          ? "py-3 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-[0_2px_20px_oklch(0_0_0/3%)]"
          : "py-5 bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 h-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_12px_oklch(var(--primary)/20%)] group-hover:rotate-6 transition-transform duration-300">
            <Leaf className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="text-xl font-serif font-black tracking-tight text-foreground">
            Green<span className="text-primary font-normal">wave</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-2">
          {navLinks.map((l) => {
            const isActive = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/contact"
            className="text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          >
            Get Involved
          </Link>
          <Button asChild size="sm" className="rounded-xl px-5 py-4 bg-primary text-primary-foreground font-semibold hover:opacity-95 transition-opacity">
            <Link href="/contact?interest=volunteer">Volunteer</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-secondary/50 transition-colors"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-lg overflow-hidden absolute top-full left-0 right-0"
          >
            <ul className="px-6 py-6 space-y-2">
              {navLinks.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-xl transition-colors ${
                        isActive
                          ? "bg-primary/5 text-primary"
                          : "hover:bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
              <Separator className="my-4 opacity-50" />
              <li className="flex gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl py-4 border-border">
                  <Link href="/contact">Get Involved</Link>
                </Button>
                <Button asChild size="sm" className="flex-1 rounded-xl py-4 bg-primary text-primary-foreground">
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
