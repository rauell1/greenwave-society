"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/client";

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
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || pathname !== "/"
          ? "py-3 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-[0_2px_20px_oklch(0_0_0/3%)]"
          : "py-5 bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 h-12">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Greenwave Society Logo"
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
          />
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

        {/* Desktop auth & CTA */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-full border border-border/50">
                <User className="w-3.5 h-3.5 text-primary" />
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="rounded-xl px-4 py-2 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground px-3 py-2 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Button asChild size="sm" className="rounded-xl px-5 py-4 bg-primary text-primary-foreground font-semibold hover:opacity-95 transition-opacity">
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
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
              <li className="flex flex-col gap-2 pt-2">
                {session?.user ? (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground px-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Signed in as: <span className="font-semibold text-foreground">{session.user.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full rounded-xl py-4 border-border justify-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl py-4 border-border">
                      <Link href="/auth/sign-in">Sign In</Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 rounded-xl py-4 bg-primary text-primary-foreground">
                      <Link href="/auth/sign-up">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
