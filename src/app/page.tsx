"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Leaf,
  Users,
  TreePine,
  Recycle,
  Heart,
  Globe,
  ArrowRight,
  Linkedin,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronUp,
  Instagram,
  Facebook,
  ExternalLink,
  Sprout,
  GraduationCap,
  HandHeart,
  Target,
  Award,
  Calendar,
  MessageCircle,
} from "lucide-react";

/* ─────────────────────────────── helpers ─────────────────────────────── */

function TwitterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.93 4.93 0 0 0 2.16-2.72 9.86 9.86 0 0 1-3.12 1.19 4.92 4.92 0 0 0-8.39 4.48A13.95 13.95 0 0 1 1.64 3.16a4.93 4.93 0 0 0 1.52 6.57A4.9 4.9 0 0 1 .96 9.1v.06a4.93 4.93 0 0 0 3.94 4.83 5 5 0 0 1-2.21.08 4.94 4.94 0 0 0 4.6 3.42A9.88 9.88 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.06 0 14.02-7.5 14.02-14 0-.22-.01-.42-.02-.63a10 10 0 0 0 2.4-2.55Z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.6 5.82a4.78 4.78 0 0 1-1.23-3.2h-3.03v13.12a2.42 2.42 0 1 1-2.4-2.71c.2 0 .4.03.6.08V10a5.5 5.5 0 1 0 4.82 5.45v-6.2a7.82 7.82 0 0 0 4.59 1.48V7.72c-1.39 0-2.66-.7-3.35-1.9Z" />
    </svg>
  );
}

function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const dir = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dir[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────── NAVBAR ─────────────────────────────── */

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Impact", href: "#impact" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Green<span className="text-primary">wave</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href="#contact">Get Involved</a>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90">
            <a href="#volunteer">Volunteer</a>
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
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <Separator className="my-3" />
              <li className="flex gap-2 px-4 pt-1">
                <Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
                  <a href="#contact" onClick={() => setOpen(false)}>Get Involved</a>
                </Button>
                <Button asChild size="sm" className="flex-1 rounded-full">
                  <a href="#volunteer" onClick={() => setOpen(false)}>Volunteer</a>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────────── HERO ─────────────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.png"
          alt="Youth volunteers planting trees"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24 w-full">
        <div className="max-w-2xl">
          <FadeIn delay={0.1}>
            <Badge
              variant="secondary"
              className="mb-4 sm:mb-6 px-3 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-sm bg-white/15 text-white border-white/20 backdrop-blur-sm hover:bg-white/20"
            >
              <Sprout className="w-3.5 h-3.5 mr-1.5" />
              Non-Profit Organization &bull; Kenya
            </Badge>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Empowering Youth to Be{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">
                Changemakers
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.35}>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed max-w-xl">
              Greenwave Society holistically empowers young people to conserve the
              environment, build sustainable communities, and create lasting
              change across Kenya and beyond.
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 text-sm sm:text-base"
              >
                <a href="#volunteer">
                  Join Our Mission <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="rounded-full bg-white text-emerald-700 border-white shadow-md hover:bg-emerald-50 px-6 sm:px-8 text-sm sm:text-base"
              >
                <a href="#about">Learn More</a>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.65}>
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={500} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-white/60">Youth Reached</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={25} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-white/60">Communities</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={10000} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-white/60">Trees Planted</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────── ABOUT ─────────────────────────────── */

function About() {
  const values = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Climate & Ecosystem Protection",
      desc: "We advance SDG 13, 14, and 15 through restoration, biodiversity protection, and practical conservation action in local communities.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Youth Leadership & Inclusion",
      desc: "We empower youth aged 15-35 with education, mentorship, and equitable opportunities aligned with SDG 4, 5, 8, and 10.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Community-Led Development",
      desc: "We support SDG 6 and 11 through local action on water stewardship, sustainable communities, and grassroots project leadership.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Partnerships & Accountability",
      desc: "Through SDG 17 partnerships, IFRS-aligned transparency, and strong governance, we scale sustainable impact responsibly.",
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Image */}
          <FadeIn direction="left">
            <div className="relative overflow-hidden sm:overflow-visible">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/about.png"
                  alt="Youth in community discussion"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="hidden sm:block absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-2xl -z-10" />
              <div className="hidden sm:block absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 bg-gold/20 rounded-2xl -z-10" />
            </div>
          </FadeIn>

          {/* Content */}
          <div>
            <FadeIn>
              <Badge variant="secondary" className="mb-3 sm:mb-4">
                <Target className="w-3.5 h-3.5 mr-1.5" />
                Our Mission
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Mission, Vision &{" "}
                <span className="text-primary">Global Alignment</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Greenwave Society's mission is to accelerate climate action, empower
                youth as global changemakers, and foster sustainable community
                development through international cooperation, advocacy, and
                localized action.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-3 sm:mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Our vision is a resilient world where humanity and planetary
                boundaries exist in harmony, achieved through practical delivery of
                the 2030 Agenda for Sustainable Development.
            </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Button asChild className="mt-6 sm:mt-8 rounded-full" size="lg">
                <a href="#programs">
                  Explore Our Programs <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </FadeIn>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 sm:mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.1}>
              <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                <CardContent className="p-5 sm:p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {v.icon}
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── PROGRAMS ─────────────────────────────── */

const programs = [
  {
    image: "/images/program-education.png",
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Climate Action and Advocacy SDGs Training",
    desc: "We deliver hands-on workshops and training sessions that teach young people about ecology, sustainability, waste management, and climate science. Our education programs equip the next generation with knowledge to make informed environmental decisions.",
    tags: ["Workshops", "School Programs", "Climate Literacy"],
  },
  {
    image: "/images/program-conservation.png",
    icon: <TreePine className="w-6 h-6" />,
    title: "Conservation & Restoration",
    desc: "From tree-planting campaigns to river clean-ups and habitat restoration, our conservation programs directly protect and restore local ecosystems. We mobilize volunteers and partner with communities to conserve natural resources.",
    tags: ["Tree Planting", "Clean-ups", "Habitat Restoration"],
  },
  {
    image: "/images/program-empowerment.png",
    icon: <HandHeart className="w-6 h-6" />,
    title: "Youth Empowerment",
    desc: "We build leadership capacity through mentorship, skills training, and community engagement opportunities. Our programs help youth develop confidence, critical thinking, and project management skills.",
    tags: ["Leadership", "Mentorship", "Skills Building"],
  },
  {
    image: "/images/program-agriculture.png",
    icon: <Sprout className="w-6 h-6" />,
    title: "Sustainability Programs",
    desc: "We lead sustainability programs through urban planning initiatives and ecosystem design projects that help communities build greener, more resilient neighborhoods.",
    tags: ["Urban Planning", "Ecosystem Design", "Resilient Communities"],
  },
];

function Programs() {
  return (
    <section id="programs" className="py-16 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <Recycle className="w-3.5 h-3.5 mr-1.5" />
            What We Do
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Our Programs & <span className="text-primary">Initiatives</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            We run a range of programs designed to empower youth and protect the
            environment, creating a sustainable future for communities across Kenya.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid md:grid-cols-2 gap-6 sm:gap-8">
          {programs.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <Card className="h-full overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="grid sm:grid-cols-[200px_1fr] gap-0">
                  {/* Image */}
                  <div className="relative h-48 sm:h-full overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <CardContent className="p-5 sm:p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {p.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                      {p.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-primary/20 text-primary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── IMPACT ─────────────────────────────── */

function Impact() {
  const stats = [
    { icon: <Users className="w-7 h-7" />, value: 1000, suffix: "+", label: "Youth Empowered" },
    { icon: <TreePine className="w-7 h-7" />, value: 10000, suffix: "+", label: "Trees Planted" },
    { icon: <Globe className="w-7 h-7" />, value: 5, suffix: "+", label: "Communities Served" },
    { icon: <Calendar className="w-7 h-7" />, value: 5, suffix: "+", label: "Events Organized" },
    { icon: <GraduationCap className="w-7 h-7" />, value: 4, suffix: "+", label: "Workshops Delivered" },
    { icon: <Recycle className="w-7 h-7" />, value: 5, suffix: " tons", label: "Waste Recycled" },
  ];

  return (
    <section id="impact" className="py-16 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-white/15 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge className="mb-3 sm:mb-4 bg-white/15 text-white border-white/20 hover:bg-white/20">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Our Impact
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Making a Real Difference
          </h2>
          <p className="mt-4 sm:mt-6 text-white/75 text-base sm:text-lg">
            Every action we take creates a ripple effect of change. Here is the
            impact we have made together with our partners and volunteers.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white">
                  {s.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs sm:text-sm text-white/90 font-semibold">
                  {s.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── TEAM ─────────────────────────────── */

const team = [
  {
    name: "Elyjoy Maina",
    role: "Co-Founder & Executive Director",
    bio: "Passionate about youth empowerment and environmental conservation. Leading Greenwave Society's vision of creating sustainable change through community-driven initiatives.",
    image:
      "https://ui-avatars.com/api/?name=Elyjoy+Maina&background=166534&color=fff&size=200&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/elyjoy-maina-044370244",
  },
  {
    name: "Martin Kyalo",
    role: "Co-Founder & Programs Director",
    bio: "Dedicated to designing and implementing impactful environmental programs. Bringing together communities, volunteers, and partners to achieve shared conservation goals.",
    image:
      "https://ui-avatars.com/api/?name=Martin+Kyalo&background=166534&color=fff&size=200&font-size=0.35&bold=true",
    linkedin: "https://www.linkedin.com/in/martin-kyalo-9373982b7/",
  },
];

function Team() {
  return (
    <section id="team" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Our Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Meet the <span className="text-primary">People</span> Behind the Mission
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            Our dedicated team works tirelessly to drive environmental conservation
            and youth empowerment across Kenya.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.15}>
              <Card className="h-full text-center border-border/50 hover:shadow-lg transition-shadow group">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover text-emerald-900"
                    />
                  </div>
                  <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
                    {member.bio}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── ACTIVITIES ─────────────────────────────── */

const activities = [
  {
    title: "Maangani Primary and Secondary Schools",
    desc: "1st project launched post maandamano with school-focused engagement and community support.",
    date: "6 Jul 2024",
    type: "Education",
    mediaUrl: "https://photos.app.goo.gl/bwhvJHBHeFEgnAin9",
  },
  {
    title: "Ngong Hike",
    desc: "Additional highlights from the 1st project activities conducted on 6/7/2024.",
    date: "6 Jul 2024",
    type: "Community",
    mediaUrl: "https://photos.app.goo.gl/aPp6qoR1sftX1ckc7",
  },
  {
    title: "Valentines Day Picnic",
    desc: "Outdoor team activity focused on wellness, environmental appreciation, and member bonding.",
    date: "Dec 2024",
    type: "Wellness",
    mediaUrl: "https://photos.app.goo.gl/goGFiHwXDiDobrmK6",
  },
  {
    title: "Valentine's Day Picnic",
    desc: "Mental health awareness session and community picnic for youth connection and support.",
    date: "14 Feb 2025",
    type: "Mental Health",
    mediaUrl: "https://photos.app.goo.gl/ep2HVgur2hmVzTNAA",
  },
  {
    title: "Departmental Hang Out",
    desc: "Additional Valentine's Day moments highlighting peer support and youth wellbeing activities.",
    date: "14 Feb 2025",
    type: "Community",
    mediaUrl: "https://photos.app.goo.gl/zZqqv3SGCCxqBBAo8",
  },
  {
    title: "Kangemi Restoration Program",
    desc: "Cross-department hangout to strengthen collaboration, planning, and team cohesion.",
    date: "Jul 2025",
    type: "Team Building",
    mediaUrl: "https://photos.app.goo.gl/CxjV1qY33ZYosmyK7",
  },
  {
    title: "Mentorship at Kangemi Vocational Centre",
    desc: "Mentorship engagement in Kangemi focused on youth growth, guidance, and career readiness.",
    date: "May 2025",
    type: "Mentorship",
    mediaUrl: "https://photos.app.goo.gl/8jsuqcjCEGeWoHb16",
  },
  {
    title: "Featured Video Story",
    desc: "Highlights from Greenwave community work and activities in video format.",
    date: "2025",
    type: "Media",
    mediaUrl: "https://youtu.be/Bhy13UQbjQw?si=YsJ8C9V0cGA5Z4_X",
  },
];

function Activities() {
  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Recent Activities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            What We Have Been <span className="text-primary">Up To</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            From community clean-ups to leadership summits, our recent activities
            showcase the breadth of our impact.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 gap-4 sm:gap-6">
          {activities.map((a, i) => (
            <FadeIn key={a.title} delay={i * 0.1}>
              <Card className="h-full border-border/50 hover:shadow-md hover:border-primary/30 transition-all group">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/20 text-primary"
                    >
                      {a.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                  <a
                    href={a.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View media <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── VOLUNTEER CTA ─────────────────────────────── */

function VolunteerCTA() {
  return (
    <section id="volunteer" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="grid lg:grid-cols-2">
              {/* Left: Image */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src="/images/program-conservation.png"
                  alt="Volunteers cleaning riverbank"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:hidden" />
              </div>

              {/* Right: Content */}
              <CardContent className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <Badge className="mb-3 sm:mb-4 w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <HandHeart className="w-3.5 h-3.5 mr-1.5" />
                  Get Involved
                </Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Become a Volunteer Today
                </h2>
                <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Join our growing network of passionate volunteers and help make a
                  real difference in your community. Whether you want to plant trees,
                  lead workshops, or support our operations, there is a place for you
                  at Greenwave Society.
                </p>

                <div className="mt-5 sm:mt-6 space-y-3">
                  {[
                    "Flexible volunteering opportunities",
                    "Training and mentorship provided",
                    "Connect with like-minded changemakers",
                    "Make a measurable environmental impact",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Leaf className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8">
                  <Button asChild size="lg" className="rounded-full w-full sm:w-auto">
                    <a href="#contact">
                      Sign Up to Volunteer <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────────── CONTACT ─────────────────────────────── */

function Contact() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setFormState("success");
      setFormData({ name: "", email: "", interest: "general", message: "" });
      setTimeout(() => setFormState("idle"), 4000);
    } catch {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Get in Touch
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            Have a question, want to volunteer, or interested in partnering with us?
            We would love to hear from you.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Contact Info */}
          <FadeIn direction="left" className="lg:col-span-2">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Reach Out To Us</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:info@greenwavesociety.org"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground break-all">
                        info@greenwavesociety.org
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/254700519130"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">+254 700 519 130</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">Kenya</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    {
                      href: "https://www.instagram.com/greenwavesociety",
                      icon: <Instagram className="w-5 h-5" />,
                      label: "Instagram",
                    },
                    {
                      href: "https://x.com/greenwaveke",
                      icon: <TwitterIcon className="w-5 h-5" />,
                      label: "Twitter",
                    },
                    {
                      href: "https://www.facebook.com/share/19byoMf2Re/",
                      icon: <Facebook className="w-5 h-5" />,
                      label: "Facebook",
                    },
                    {
                      href: "https://www.tiktok.com/@greenwavesociety",
                      icon: <TikTokIcon className="w-5 h-5" />,
                      label: "TikTok",
                    },
                    {
                      href: "https://linktr.ee/greenwavesociety",
                      icon: <Globe className="w-5 h-5" />,
                      label: "Linktree",
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Subscribe to Newsletter</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Stay updated on our latest events, programs, and impact stories.
                </p>
                <NewsletterForm />
              </div>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn direction="right" className="lg:col-span-3">
            <Card className="border-border/50">
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Full Name
                      </label>
                      <Input
                        id="name"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="interest"
                      className="block text-sm font-medium mb-1.5"
                    >
                      I am interested in
                    </label>
                    <select
                      id="interest"
                      value={formData.interest}
                      onChange={(e) =>
                        setFormData({ ...formData, interest: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="volunteer">Volunteering</option>
                      <option value="partner">Partnership</option>
                      <option value="donate">Donations</option>
                      <option value="media">Media / Press</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      required
                      placeholder="Tell us how you would like to get involved..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto rounded-full"
                    disabled={formState === "loading"}
                  >
                    {formState === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : formState === "success" ? (
                      <span className="flex items-center gap-2">
                        <Leaf className="w-4 h-4" /> Message Sent!
                      </span>
                    ) : formState === "error" ? (
                      <span className="flex items-center gap-2 text-red-200">
                        Something went wrong
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── NEWSLETTER ─────────────────────────────── */

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setState("success");
      setEmail("");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 h-10 text-sm"
      />
      <Button
        type="submit"
        size="sm"
        className="rounded-full shrink-0"
        disabled={state === "loading"}
      >
        {state === "success" ? "Subscribed!" : state === "loading" ? "..." : "Join"}
      </Button>
    </form>
  );
}

/* ─────────────────────────────── FOOTER ─────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Green<span className="text-emerald-400">wave</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Empowering youth holistically to be changemakers and conserve the
              environment. Building a sustainable future, one community at a time.
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { href: "https://www.instagram.com/greenwavesociety", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { href: "https://x.com/greenwaveke", icon: <TwitterIcon className="w-4 h-4" />, label: "Twitter" },
                { href: "https://www.facebook.com/share/19byoMf2Re/", icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { href: "https://www.tiktok.com/@greenwavesociety", icon: <TikTokIcon className="w-4 h-4" />, label: "TikTok" },
                { href: "https://linktr.ee/greenwavesociety", icon: <Globe className="w-4 h-4" />, label: "Linktree" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-emerald-600 hover:text-white transition-colors"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "#about" },
                { label: "Our Programs", href: "#programs" },
                { label: "Our Impact", href: "#impact" },
                { label: "Our Team", href: "#team" },
                { label: "Contact", href: "#contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
              Programs
            </h4>
            <ul className="space-y-2.5">
              {[
                "Environmental Education",
                "Conservation & Restoration",
                "Youth Empowerment",
                "Sustainable Agriculture",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#programs"
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:info@greenwavesociety.org"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2 break-all"
                >
                  <Mail className="w-3.5 h-3.5" /> info@greenwavesociety.org
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/254700519130"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" /> +254 700 519 130
                </a>
              </li>
              <li>
                <span className="text-sm text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Kenya
                </span>
              </li>
              <li>
                <a
                  href="https://linktr.ee/greenwavesociety"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2 break-all"
                >
                  <Globe className="w-3.5 h-3.5" /> linktr.ee/greenwavesociety
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} Greenwave Society. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with{" "}
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />{" "}
            for the planet
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────── SCROLL TO TOP ─────────────────────────────── */

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────── PAGE ─────────────────────────────── */

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
