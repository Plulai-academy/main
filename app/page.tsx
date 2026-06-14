"use client";

import Image from "next/image";
import { useState } from "react";
import mascot from "@/public/images/mascot.png";
import dashboard from "@/public/images/dashboard.png";

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');

  :root {
    --radius: 1rem;
    --background: oklch(0.18 0.04 265);
    --foreground: oklch(0.97 0.01 250);
    --surface: oklch(0.23 0.045 265);
    --surface-2: oklch(0.27 0.05 265);
    --card: oklch(0.23 0.045 265);
    --card-foreground: oklch(0.97 0.01 250);
    --popover: oklch(0.23 0.045 265);
    --popover-foreground: oklch(0.97 0.01 250);
    --primary: oklch(0.72 0.17 230);
    --primary-foreground: oklch(0.15 0.04 265);
    --secondary: oklch(0.3 0.05 265);
    --secondary-foreground: oklch(0.97 0.01 250);
    --muted: oklch(0.27 0.04 265);
    --muted-foreground: oklch(0.7 0.02 260);
    --accent: oklch(0.83 0.17 220);
    --accent-foreground: oklch(0.15 0.04 265);
    --destructive: oklch(0.6 0.22 25);
    --destructive-foreground: oklch(0.97 0.01 250);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 12%);
    --ring: oklch(0.72 0.17 230);
    --brand-blue: #1CB0F6;
    --brand-cyan: #14D4F4;
    --brand-deep: #2B70C9;
    --brand-gold: #FAA918;
    --brand-red: #D33131;
    --brand-light: #F5F5F5;
    --brand-muted: #6F6F6F;
    --shadow-blue: 0 4px 0 #2B70C9;
    --shadow-gold: 0 4px 0 #C47D00;
    --shadow-white: 0 4px 0 #D1D5DB;
    --shadow-dark: 0 4px 0 rgba(0,0,0,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; border-color: oklch(1 0 0 / 10%); }

  html, body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Nunito', system-ui, sans-serif;
  }

  .font-display, h1, h2, h3, h4 {
    font-family: 'Fredoka', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }

  /* Shelf button utilities */
  .shelf-blue {
    background: var(--brand-blue);
    color: white;
    box-shadow: var(--shadow-blue);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-blue:active { box-shadow: 0 0 0 var(--brand-deep); transform: translateY(4px); }

  .shelf-gold {
    background: var(--brand-gold);
    color: #1A1A2E;
    box-shadow: var(--shadow-gold);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-gold:active { box-shadow: 0 0 0 #C47D00; transform: translateY(4px); }

  .shelf-white {
    background: white;
    color: #1A1A2E;
    box-shadow: var(--shadow-white);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-white:active { box-shadow: 0 0 0 #D1D5DB; transform: translateY(4px); }

  .shelf-dark {
    background: var(--surface);
    color: var(--foreground);
    box-shadow: var(--shadow-dark);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-dark:active { box-shadow: 0 0 0 rgba(0,0,0,0.4); transform: translateY(4px); }

  /* Backgrounds & surfaces */
  .bg-background { background-color: var(--background); }
  .bg-surface { background-color: var(--surface); }
  .bg-surface\\/40 { background-color: oklch(0.23 0.045 265 / 40%); }
  .bg-surface\\/60 { background-color: oklch(0.23 0.045 265 / 60%); }
  .text-foreground { color: var(--foreground); }
  .border-border { border-color: oklch(1 0 0 / 10%); }
  .ring-border { --tw-ring-color: oklch(1 0 0 / 10%); }

  /* Animations */
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: .5; }
    50% { opacity: 1; }
  }

  .animate-bob { animation: bob 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
  .animate-marquee { animation: marquee 30s linear infinite; }
  .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
`;

const tracks = [
  { icon: "💻", title: "Coding", desc: "From block coding to Python. Build real apps and games while learning logic.", accent: "var(--brand-blue)", pct: 33 },
  { icon: "🧠", title: "AI & Future Tech", desc: "Understand how AI works. Prompt engineering and ML basics for curious minds.", accent: "var(--brand-cyan)", pct: 50 },
  { icon: "💡", title: "Entrepreneurship", desc: "Launch your first digital business. Marketing, budget, and soft skills.", accent: "var(--brand-gold)", pct: 25 },
];

const partners = ["TECHPARK", "GULF SCHOOLS", "MINISTRY OF EDU", "LEARNING HUB", "DUBAI AI", "GCC ED-COUNCIL", "RIYADH ACADEMY", "QATAR LEARNING"];

const faqs = [
  { q: "What exactly is Plulai?", a: "Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic." },
  { q: "What happens after the 14-day trial?", a: "After your 14-day free trial you can subscribe to Pro or continue with limited access. No credit card required to start." },
  { q: "Is the Arabic real — or machine translated?", a: "Real Arabic — not machine-translated. Full RTL interface and an AI coach that teaches natively in Arabic, with GCC-specific examples throughout." },
  { q: "How long are the lessons?", a: "15–25 minutes each. Designed to fit after school without replacing homework time. Most kids end up doing two." },
  { q: "Is it safe for my child?", a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold." },
  { q: "How do school licenses work?", a: "Bulk seats from 50–5,000 students. Teacher dashboard, curriculum alignment, regional discounts, and dedicated support included." },
];

type FooterColumn = { title: string; links: { label: string; href: string }[] };

const footerLinks: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Tracks",       href: "#tracks"  },
      { label: "How it works", href: "#how"     },
      { label: "Pricing",      href: "#pricing" },
    ],
  },
  {
    title: "Schools",
    links: [
      { label: "Overview",     href: "#schools"                },
      { label: "Request demo", href: "mailto:hello@plulai.com" },
      { label: "Curriculum",   href: "/schools"                },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",   href: "/about"                   },
      { label: "Contact", href: "mailto:hello@plulai.com"  },
    ],
  },
];

function Landing() {
  const [audience, setAudience] = useState<"families" | "schools">("families");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const isSchools = audience === "schools";

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2">
              <Image src="/icons/plulai1.png" alt="Plulai" width={120} height={40} className="h-10 w-auto object-contain" />
            </a>
            <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-foreground/70">
              <a href="#tracks" className="hover:text-foreground transition-colors">Tracks</a>
              <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
              <a href="#schools" className="hover:text-foreground transition-colors" style={{ color: "var(--brand-cyan)" }}>For Schools</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth/login" className="hidden sm:block text-sm font-bold px-4 py-2 hover:text-[var(--brand-blue)] transition-colors">Log in</a>
            <a href="https://www.plulai.com/auth/signup" className="shelf-blue text-sm font-bold py-2.5 px-5 rounded-xl">Start free →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-12 pb-24 px-6 overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(28,176,246,0.18), transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-surface ring-1 ring-border rounded-2xl">
              <button
                onClick={() => setAudience("families")}
                className={`px-7 py-3 rounded-xl font-bold text-sm transition-all ${
                  !isSchools ? "shelf-blue" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                👨‍👩‍👧 For Families
              </button>
              <button
                onClick={() => setAudience("schools")}
                className={`px-7 py-3 rounded-xl font-bold text-sm transition-all ${
                  isSchools ? "shelf-gold" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                🏫 For Schools
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-cyan)]/10 ring-1 ring-[var(--brand-cyan)]/30 text-[var(--brand-cyan)] text-xs font-bold uppercase tracking-widest mb-6">
                <span className="size-2 rounded-full bg-[var(--brand-cyan)] animate-glow" />
                {isSchools ? "Trusted by GCC Schools" : "200+ Learners · GCC"}
              </div>

              {isSchools ? (
                <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
                  Bring the future to your classroom with{" "}
                  <span style={{ color: "var(--brand-cyan)" }}>Plulai for Schools.</span>
                </h1>
              ) : (
                <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
                  Your child learns to{" "}
                  <span style={{ color: "var(--brand-blue)" }}>code, build AI,</span> and start a business.
                </h1>
              )}

              <p className="text-lg text-foreground/70 mb-8 max-w-xl leading-relaxed">
                {isSchools
                  ? "Deploy a complete coding, AI & entrepreneurship curriculum to 50–5,000 students. Teacher dashboard, Arabic + English, aligned with national standards."
                  : "A personal AI coach that adapts to them. 500+ lessons in Arabic & English. Just 15 minutes a day."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isSchools ? (
                  <>
                    <a href="https://www.plulai.com/auth/signup" className="shelf-gold font-bold py-4 px-9 rounded-2xl text-lg">
                      Request school demo →
                    </a>
                  </>
                ) : (
                  <>
                    <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-4 px-9 rounded-2xl text-lg">
                      Start free trial →
                    </a>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-foreground/50">
                <div className="flex -space-x-2">
                  <div className="size-8 rounded-full bg-[var(--brand-blue)] ring-2 ring-background" />
                  <div className="size-8 rounded-full bg-[var(--brand-gold)] ring-2 ring-background" />
                  <div className="size-8 rounded-full bg-[var(--brand-cyan)] ring-2 ring-background" />
                </div>
                <span>
                  {isSchools ? "Already powering 9+ GCC schools" : "Trusted by 200+ families across the GCC"}
                </span>
              </div>
            </div>

            {/* Mascot side */}
            <div className="relative">
              <div className="absolute -inset-10 rounded-full blur-3xl"
                style={{ background: isSchools ? "var(--brand-gold)" : "var(--brand-blue)", opacity: 0.15 }} />
              <div className="relative animate-bob">
                <Image src={mascot} alt="Plulai AI Coach mascot" width={480} height={480} className="w-full max-w-[480px] mx-auto block" />
              </div>

              {/* Floating cards */}
              <div className="absolute top-8 -left-2 lg:-left-8 shelf-white py-3 px-4 rounded-2xl flex items-center gap-3 max-w-[200px]">
                <div className="size-10 rounded-full bg-[var(--brand-gold)]/20 grid place-items-center text-xl">🔥</div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Streak</div>
                  <div className="text-zinc-900 font-bold text-sm">14 day streak!</div>
                </div>
              </div>

              <div className="absolute bottom-2 -right-2 lg:-right-6 shelf-white py-3 px-4 rounded-2xl flex items-center gap-3 max-w-[220px]">
                <div className="size-10 rounded-full bg-[var(--brand-blue)]/20 grid place-items-center text-[var(--brand-blue)] font-extrabold">L5</div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Level up!</div>
                  <div className="text-zinc-900 font-bold text-sm">Faris reached Level 5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <section className="py-10 bg-surface/40 border-y border-border overflow-hidden">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-foreground/40 font-bold mb-6">
          Trusted by leading institutions across the region
        </p>
        <div className="flex whitespace-nowrap animate-marquee items-center">
          {[...Array(2)].map((_, round) =>
            ["p1","p2","p3","p4","p5","p6","p7","p8","p9"].map((p, i) => (
              <div key={`${round}-${i}`} className="mx-10 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <img src={`/partners/${p}.png`} alt={`Partner ${i + 1}`} className="h-10 w-auto object-contain" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-cyan)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">3 Tracks · Pick yours</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">Choose your superpower</h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Three specialized paths designed to turn kids into creators — not just consumers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tracks.map((t) => (
              <div
                key={t.title}
                className="group p-8 rounded-3xl bg-surface ring-1 ring-border hover:-translate-y-1 transition-transform"
                style={{ boxShadow: `0 10px 30px -15px ${t.accent}30` }}
              >
                <div
                  className="size-16 rounded-2xl grid place-items-center mb-6 text-3xl group-hover:scale-110 transition-transform"
                  style={{ background: `${t.accent}25`, boxShadow: `inset 0 0 0 1px ${t.accent}40` }}
                >
                  {t.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{t.title}</h3>
                <p className="text-foreground/60 mb-6 leading-relaxed">{t.desc}</p>
                <div className="h-2 rounded-full bg-background overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.accent, boxShadow: `0 0 12px ${t.accent}` }} />
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>
                  <span>Module 1 · {t.pct}%</span>
                  <span>→ Explore</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 40% at 20% 30%, rgba(28,176,246,0.12), transparent 60%), radial-gradient(ellipse 40% 30% at 85% 75%, rgba(250,169,24,0.10), transparent 60%)",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-gold)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">The Adventure Map</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold">A learning path that feels like a game</h2>
            <p className="text-foreground/60 mt-4 max-w-2xl mx-auto">
              Each level unlocks the next. Earn XP, keep streaks, beat boss-battles — and build a real project at the end of every module.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            {/* Game map */}
            <div className="relative mx-auto w-full max-w-[460px]">
              <svg viewBox="0 0 400 720" className="w-full h-auto block" aria-hidden>
                <defs>
                  <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1CB0F6" />
                    <stop offset="55%" stopColor="#14D4F4" />
                    <stop offset="100%" stopColor="#FAA918" />
                  </linearGradient>
                </defs>
                <path
                  d="M200 40 C 80 100, 80 200, 200 240 S 320 360, 200 420 S 80 540, 200 600 S 320 680, 280 700"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="22"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M200 40 C 80 100, 80 200, 200 240 S 320 360, 200 420"
                  stroke="url(#road)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="2 12"
                  fill="none"
                />
              </svg>

              {[
                { top: "4%",  left: "50%", icon: "✨", color: "var(--brand-blue)", state: "done", label: "Welcome" },
                { top: "32%", left: "50%", icon: "💻", color: "var(--brand-blue)", state: "current", label: "Build your first app" },
                { top: "57%", left: "50%", icon: "🏆", color: "var(--brand-gold)", state: "locked", label: "Boss battle", big: true },
                { top: "82%", left: "50%", icon: "🤖", color: "var(--brand-cyan)", state: "locked", label: "Train your AI" },
                { top: "97%", left: "70%", icon: "🌍", color: "var(--brand-gold)", state: "locked", label: "Launch project" },
              ].map((n, i) => {
                const size = n.big ? 92 : 72;
                const isDone = n.state === "done";
                const isCurrent = n.state === "current";
                const isLocked = n.state === "locked";
                return (
                  <div
                    key={i}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                    style={{ top: n.top, left: n.left }}
                  >
                    <button
                      className="rounded-full grid place-items-center text-3xl transition-transform hover:scale-110"
                      style={{
                        width: size,
                        height: size,
                        background: isLocked ? "var(--surface-2)" : n.color,
                        boxShadow: isLocked
                          ? "0 5px 0 rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.04)"
                          : `0 6px 0 rgba(0,0,0,0.45), 0 0 40px ${n.color}90`,
                        filter: isLocked ? "grayscale(1)" : undefined,
                        opacity: isLocked ? 0.5 : 1,
                        outline: `8px solid var(--background)`,
                      }}
                      aria-label={n.label}
                    >
                      <span className={isLocked ? "opacity-40" : ""}>{isLocked ? "🔒" : n.icon}</span>
                      {isDone && (
                        <span className="absolute -bottom-1 -right-1 size-7 rounded-full bg-[var(--brand-gold)] grid place-items-center text-sm ring-4 ring-background">
                          ✓
                        </span>
                      )}
                    </button>

                    {isCurrent && (
                      <div className="absolute left-[calc(100%+18px)] top-1/2 -translate-y-1/2 whitespace-nowrap">
                        <div className="relative shelf-blue px-4 py-2 rounded-xl font-bold text-sm">
                          START
                          <span
                            className="absolute right-full top-1/2 -translate-y-1/2 size-0"
                            style={{
                              borderTop: "8px solid transparent",
                              borderBottom: "8px solid transparent",
                              borderRight: "10px solid var(--brand-blue)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="absolute top-2 -left-2 sm:-left-6 shelf-white py-2 px-3 rounded-2xl flex items-center gap-2 z-20">
                <span className="text-lg">⚡</span>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">XP today</div>
                  <div className="text-zinc-900 font-bold text-sm leading-none">+120</div>
                </div>
              </div>

              <div className="absolute bottom-6 -right-2 sm:-right-6 shelf-white py-2 px-3 rounded-2xl flex items-center gap-2 z-20">
                <span className="text-lg">🔥</span>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">Streak</div>
                  <div className="text-zinc-900 font-bold text-sm leading-none">14 days</div>
                </div>
              </div>
            </div>

            {/* Right: legend & explainer */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-surface ring-1 ring-border">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-[var(--brand-blue)]/20 grid place-items-center text-2xl flex-shrink-0">💻</div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-blue)]">Currently unlocked</div>
                    <div className="font-display text-xl font-bold">Build your first app</div>
                    <div className="text-sm text-foreground/60">Module 1 · 6 lessons · ~15 min each</div>
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "33%", background: "var(--brand-blue)", boxShadow: "0 0 12px var(--brand-blue)" }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                  <span>2 / 6 lessons</span>
                  <span style={{ color: "var(--brand-blue)" }}>33%</span>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  { icon: "🎯", title: "Bite-sized lessons", desc: "15-min units kids actually finish." },
                  { icon: "🤖", title: "Personal AI coach", desc: "Adapts to your child's pace and language." },
                  { icon: "🏆", title: "Boss-battles & rewards", desc: "XP, streaks, and badges that motivate." },
                  { icon: "🛠️", title: "Real projects", desc: "End every module with something to show." },
                ].map((f) => (
                  <li key={f.title} className="flex items-start gap-4 p-4 rounded-2xl bg-surface/60 ring-1 ring-border">
                    <div className="size-10 rounded-xl bg-background grid place-items-center text-xl flex-shrink-0">{f.icon}</div>
                    <div>
                      <div className="font-bold text-sm">{f.title}</div>
                      <div className="text-sm text-foreground/60">{f.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-3.5 px-6 rounded-2xl flex-1 text-center">Start the path →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B SECTION */}
      <section id="schools" className="py-24 px-6 relative" style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--background) 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-30" style={{ background: "var(--brand-cyan)" }} />
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-border shadow-2xl">
                <Image src={dashboard} alt="Teacher dashboard preview" width={1280} height={960} className="w-full block" />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-cyan)]/15 ring-1 ring-[var(--brand-cyan)]/30 text-[var(--brand-cyan)] text-xs font-extrabold uppercase tracking-widest mb-6">
                🏫 For Schools & Institutions
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-[1.1]">
                Empower your whole classroom with AI.
              </h2>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">
                Plulai for Schools is a turnkey curriculum your teachers will actually love teaching — with built-in analytics, gamification, and a dedicated success manager.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  ["Bulk seats 50–5,000", "Regional discounts and flexible billing for any school size."],
                  ["AR + EN curriculum", "Aligned with Ministry of Education standards across the GCC."],
                  ["Dedicated support", "Onboarding, training, and a customer success manager included."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-4">
                    <div className="size-7 rounded-lg bg-[var(--brand-cyan)]/20 grid place-items-center flex-shrink-0 mt-0.5">
                      <svg className="size-4 text-[var(--brand-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{title}</div>
                      <div className="text-foreground/60 text-sm">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:hello@plulai.com" className="shelf-gold font-bold py-4 px-8 rounded-2xl text-lg text-center">Request school demo →</a>
                <a href="mailto:hello@plulai.com" className="shelf-dark font-bold py-4 px-8 rounded-2xl text-lg text-center">Download brochure</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-20 px-6 border-y border-border" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { n: "200+", l: "Active learners", c: "var(--brand-blue)" },
            { n: "500+", l: "Bite-sized lessons", c: "var(--brand-cyan)" },
            { n: "9+", l: "Partner schools", c: "var(--brand-gold)" },
            { n: "9.2/10", l: "User satisfaction", c: "var(--brand-red)" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-5xl lg:text-6xl font-bold mb-2" style={{ color: s.c, textShadow: `0 0 40px ${s.c}40` }}>
                {s.n}
              </div>
              <div className="text-foreground/60 font-bold uppercase tracking-wider text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-gold)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">Loved by parents & principals</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold">What people are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "My 9-year-old begs to do his lesson after school. I never thought I'd see that with coding.", name: "Layla M.", role: "Parent of 2, Riyadh", color: "var(--brand-blue)" },
              { quote: "The Arabic isn't translated — it's native. That alone makes Plulai the best in the region.", name: "Dr. Khalid R.", role: "Principal, Doha", color: "var(--brand-cyan)" },
              { quote: "He built his first working game in 2 weeks. The AI coach is patient in a way I never could be.", name: "Sara A.", role: "Parent, Dubai", color: "var(--brand-gold)" },
            ].map((t) => (
              <div key={t.name} className="p-7 rounded-3xl bg-surface ring-1 ring-border">
                <div className="flex gap-1 mb-4" style={{ color: t.color }}>
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-foreground/85 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="size-10 rounded-full grid place-items-center font-bold text-sm"
                    style={{ background: `${t.color}30`, color: t.color }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-foreground/50">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-cyan)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">Simple & fair</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">Pick your plan</h2>
            <p className="text-foreground/60">Start free. Upgrade when you&apos;re ready. School pricing is custom.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-surface ring-1 ring-border flex flex-col">
              <div className="text-foreground/50 font-extrabold uppercase tracking-widest text-xs mb-2">Explorer</div>
              <div className="font-display text-4xl font-bold mb-1">Free</div>
              <p className="text-sm text-foreground/60 mb-6">14-day trial, no credit card</p>
              <ul className="space-y-3 text-sm text-foreground/70 mb-8 flex-1">
                <li>✓ First 5 lessons</li>
                <li>✓ Coding track basics</li>
                <li>✓ English only</li>
              </ul>
              <a href="https://www.plulai.com/auth/signup" className="shelf-dark py-3 rounded-xl font-bold text-center">Get started</a>
            </div>

            {/* Pro — featured */}
            <div className="p-8 rounded-3xl relative flex flex-col" style={{ background: "var(--brand-blue)", boxShadow: "0 6px 0 var(--brand-deep), 0 20px 60px -20px var(--brand-blue)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-gold)] text-[#1A1A2E] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most popular</div>
              <div className="text-white/80 font-extrabold uppercase tracking-widest text-xs mb-2">Prodigy</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-4xl font-bold text-white">$70</span>
                <span className="text-white/70 font-medium">/mo</span>
              </div>
              <p className="text-sm text-white/80 mb-6">For families</p>
              <ul className="space-y-3 text-sm text-white mb-8 flex-1">
                <li>✓ All 3 tracks (Code · AI · Biz)</li>
                <li>✓ Personal AI coach</li>
                <li>✓ Arabic + English</li>
                <li>✓ Weekly parent summary</li>
                <li>✓ 14-day free trial</li>
              </ul>
              <a href="https://www.plulai.com/auth/signup" className="shelf-white py-3 rounded-xl font-bold text-center">Start free trial</a>
            </div>

            {/* Schools */}
            <div className="p-8 rounded-3xl bg-surface ring-1 ring-[var(--brand-cyan)]/30 flex flex-col">
              <div className="text-[var(--brand-cyan)] font-extrabold uppercase tracking-widest text-xs mb-2">Institution</div>
              <div className="font-display text-4xl font-bold mb-1">Custom</div>
              <p className="text-sm text-foreground/60 mb-6">For schools (50+ seats)</p>
              <ul className="space-y-3 text-sm text-foreground/70 mb-8 flex-1">
                <li>✓ Teacher dashboard</li>
                <li>✓ Bulk seats with discounts</li>
                <li>✓ LMS / SSO integration</li>
                <li>✓ Curriculum alignment</li>
                <li>✓ Dedicated success manager</li>
              </ul>
              <button className="shelf-gold py-3 rounded-xl font-bold">Contact sales →</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl bg-background ring-1 ring-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold pr-4">{f.q}</span>
                  <svg className={`size-5 text-foreground/50 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-foreground/70 leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(28,176,246,0.18), transparent 60%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="text-7xl mb-6">🚀</div>
          <h2 className="font-display text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to give them a head start?
          </h2>
          <p className="text-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of families and schools building the GCC&apos;s next generation of creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-4 px-10 rounded-2xl text-lg text-center">Start free trial →</a>
            <a href="#schools" className="shelf-gold font-bold py-4 px-10 rounded-2xl text-lg text-center">For schools</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/icons/plulai1.png" alt="Plulai" width={100} height={32} className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-foreground/50">Building tomorrow&apos;s leaders, today. Made for the GCC.</p>
          </div>
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="hover:text-foreground transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-foreground/40">
          <span>© 2026 Plulai Education. All rights reserved.</span>
          <div className="flex gap-6 uppercase tracking-wider font-bold">
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/ar" className="hover:text-foreground">العربية</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

export default function Page() {
  return <Landing />;
}