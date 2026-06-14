"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');

  :root {
    --background: oklch(0.18 0.04 265);
    --foreground: oklch(0.97 0.01 250);
    --surface: oklch(0.23 0.045 265);
    --surface-2: oklch(0.27 0.05 265);
    --border: oklch(1 0 0 / 10%);
    --brand-blue: #1CB0F6;
    --brand-cyan: #14D4F4;
    --brand-deep: #2B70C9;
    --brand-gold: #FAA918;
    --brand-red: #D33131;
    --shadow-blue: 0 4px 0 #2B70C9;
    --shadow-gold: 0 4px 0 #C47D00;
    --shadow-dark: 0 4px 0 rgba(0,0,0,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Nunito', system-ui, sans-serif;
  }

  .font-display, h1, h2, h3, h4 {
    font-family: 'Fredoka', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }

  .shelf-blue {
    background: var(--brand-blue);
    color: white;
    box-shadow: var(--shadow-blue);
    transition: transform .1s ease, box-shadow .1s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .shelf-blue:active { box-shadow: 0 0 0 var(--brand-deep); transform: translateY(4px); }

  .shelf-gold {
    background: var(--brand-gold);
    color: #1A1A2E;
    box-shadow: var(--shadow-gold);
    transition: transform .1s ease, box-shadow .1s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .shelf-gold:active { box-shadow: 0 0 0 #C47D00; transform: translateY(4px); }

  .shelf-dark {
    background: var(--surface);
    color: var(--foreground);
    box-shadow: var(--shadow-dark);
    transition: transform .1s ease, box-shadow .1s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid oklch(1 0 0 / 12%);
  }
  .shelf-dark:active { box-shadow: 0 0 0 rgba(0,0,0,0.4); transform: translateY(4px); }

  .card {
    background: var(--surface);
    border: 1px solid oklch(1 0 0 / 10%);
    border-radius: 1.5rem;
  }

  .card-accent-blue  { border-top: 3px solid var(--brand-blue); }
  .card-accent-gold  { border-top: 3px solid var(--brand-gold); }
  .card-accent-cyan  { border-top: 3px solid var(--brand-cyan); }
  .card-accent-red   { border-top: 3px solid var(--brand-red); }
  .card-accent-purple{ border-top: 3px solid #8B5CF6; }

  .card:hover { transform: translateY(-3px); transition: transform .2s ease; box-shadow: 0 12px 40px rgba(0,0,0,0.3); }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 13px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .divider { height: 1px; background: oklch(1 0 0 / 8%); margin: 0 24px; }

  @keyframes glow-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
  .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }

  @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .animate-marquee { animation: marquee 30s linear infinite; }
`;

const PACKAGES = [
  {
    icon: "📚",
    name: "Starter Workshop",
    badge: null,
    duration: "1–2 days",
    price: "$800–$1,200",
    accentClass: "card-accent-blue",
    accent: "var(--brand-blue)",
    accentBg: "rgba(28,176,246,0.12)",
    includes: [
      "Intro to AI + vibe coding",
      "1 session per age group",
      "Certificate for every student",
      "Hands-on project demo",
    ],
    ideal: "Perfect first step — low commitment, high impact.",
  },
  {
    icon: "⚡",
    name: "Intensive Week",
    badge: "Most popular",
    duration: "1 week (5 days)",
    price: "$2,500–$3,500",
    accentClass: "card-accent-gold",
    accent: "var(--brand-gold)",
    accentBg: "rgba(250,169,24,0.12)",
    includes: [
      "Full Coding + AI + Entrepreneurship track",
      "Students build a working project",
      "Mini Demo Day on the last day",
      "Teacher training included",
      "Certificate for every student",
    ],
    ideal: "The format that gets schools to sign multi-year deals.",
  },
  {
    icon: "🚀",
    name: "SharkKid Bootcamp",
    badge: "Maximum impact",
    duration: "2–4 weeks",
    price: "$4,500–$8,000",
    accentClass: "card-accent-red",
    accent: "var(--brand-red)",
    accentBg: "rgba(211,49,49,0.12)",
    includes: [
      "Full SharkKid curriculum",
      "Real startup built end-to-end",
      "Demo Day with local investors",
      "Media coverage opportunity",
      "Certificates + portfolio for every student",
    ],
    ideal: "The flagship. Schools that run this become known for it.",
  },
  {
    icon: "🖥️",
    name: "Annual Platform Licence",
    badge: "Online · No travel",
    duration: "12 months online",
    price: "$2,000–$5,000",
    accentClass: "card-accent-purple",
    accent: "#8B5CF6",
    accentBg: "rgba(139,92,246,0.12)",
    includes: [
      "Plulai platform access for all students",
      "Monthly progress reports",
      "Arabic & English — no travel required",
      "Parent communication built-in",
    ],
    ideal: "Best for always-on, curriculum-aligned learning.",
  },
];

const FAQS = [
  { q: "Do you travel to our school?", a: "Yes — for the Starter Workshop, Intensive Week, and SharkKid Bootcamp we come to you. The Annual Platform Licence is fully online and requires no travel." },
  { q: "What ages do you work with?", a: "Ages 6–18. We adapt the curriculum per age group: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14), and Tech Experts (15–18)." },
  { q: "Is the content in Arabic?", a: "Yes — real Arabic, not machine-translated. Full RTL support and an AI coach that teaches natively in Arabic alongside English." },
  { q: "What does the school need to prepare?", a: "Just a room and students. We bring the curriculum, materials, and facilitation. For the online licence, students need a device and internet access." },
  { q: "How many students per session?", a: "We recommend 15–25 students per session for in-person formats. The online platform scales to any school size." },
  { q: "Can we customise the curriculum?", a: "Yes. For the Intensive Week and Bootcamp, we tailor the content to your school's context, vision, and student level." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }} className="last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left"
        style={{ padding: "18px 24px" }}
      >
        <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)" }}>{q}</span>
        <svg
          width="18" height="18" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink: 0, color: "oklch(1 0 0 / 40%)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: "14px", color: "oklch(0.97 0.01 250 / 60%)", lineHeight: 1.7, padding: "0 24px 18px" }}>
          {a}
        </p>
      )}
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
      <path d="M3 8l3.5 3.5L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SchoolsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)" }}>

        {/* ── NAV ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(12px)",
          background: "oklch(0.18 0.04 265 / 85%)",
          borderBottom: "1px solid oklch(1 0 0 / 10%)",
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "80px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <Image src="/icons/plulai1.png" alt="Plulai" width={120} height={40} style={{ height: "40px", width: "auto", objectFit: "contain" }} />
              </Link>
              <div className="hidden lg:flex" style={{ gap: "24px" }}>
                {[["/#tracks", "Tracks"], ["/#how", "How it works"], ["/schools", "For Schools"], ["/#pricing", "Pricing"]].map(([href, label]) => (
                  <a key={label} href={href} style={{
                    fontSize: "14px", fontWeight: 700, textDecoration: "none",
                    color: label === "For Schools" ? "var(--brand-cyan)" : "oklch(0.97 0.01 250 / 70%)",
                    transition: "color .15s",
                  }}>{label}</a>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href="/auth/login" className="hidden sm:block" style={{ fontSize: "14px", fontWeight: 700, color: "oklch(0.97 0.01 250 / 70%)", textDecoration: "none", padding: "8px 16px" }}>
                Log in
              </Link>
              <a href="mailto:hello@plulai.com" className="shelf-blue" style={{ fontSize: "14px", fontWeight: 700, padding: "10px 20px", borderRadius: "14px" }}>
                Book a demo →
              </a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ padding: "80px 24px 72px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(28,176,246,0.18), transparent 70%)",
          }} />
          <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
            <div className="badge" style={{ background: "rgba(28,176,246,0.1)", border: "1px solid rgba(28,176,246,0.3)", color: "var(--brand-cyan)", marginBottom: "28px" }}>
              <span className="animate-glow" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-cyan)", display: "block" }} />
              For Schools &nbsp;·&nbsp; GCC &amp; International
            </div>

            <h1 className="font-display" style={{ fontSize: "clamp(38px,5.5vw,64px)", fontWeight: 700, lineHeight: 1.05, color: "var(--foreground)", marginBottom: "20px" }}>
              Bring coding, AI &amp;<br />
              <span style={{ color: "var(--brand-blue)" }}>entrepreneurship</span><br />
              to your students.
            </h1>

            <p style={{ fontSize: "17px", color: "oklch(0.97 0.01 250 / 60%)", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 36px" }}>
              Workshop formats for every budget and timeline. We come to you — in Arabic and English, for ages 6–18, anywhere in the GCC and internationally.
            </p>

            {/* Credential banner */}
            <div style={{ background: "var(--surface)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "20px", padding: "20px 28px", marginBottom: "36px", textAlign: "left" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "oklch(0.97 0.01 250 / 35%)", marginBottom: "8px" }}>
                Why schools trust us
              </p>
              <p style={{ fontSize: "14px", color: "oklch(0.97 0.01 250 / 65%)", lineHeight: 1.7 }}>
                <strong style={{ color: "var(--foreground)" }}>Selected Top 15 from 1,500 startups globally in Delta Residency</strong>, the program backed by Sam Altman &nbsp;·&nbsp;
                <strong style={{ color: "var(--foreground)" }}>Personally mentored by Khailee Ng at 500 Global HQ in Malaysia</strong> — the most credentialed AI education provider in the Arab world.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:hello@plulai.com" className="shelf-blue" style={{ fontSize: "16px", fontWeight: 700, padding: "16px 36px", borderRadius: "20px" }}>
                Book a 20-min demo →
              </a>
              <a href="mailto:hello@plulai.com" className="shelf-dark" style={{ fontSize: "15px", fontWeight: 700, padding: "15px 28px", borderRadius: "20px" }}>
                Get the curriculum guide
              </a>
            </div>
          </div>
        </section>

        {/* ── STATS BAND ── */}
        <section style={{ padding: "0 24px 64px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: "oklch(1 0 0 / 8%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "24px", overflow: "hidden" }}>
            {[
              { n: "9+",   l: "Partner schools",   c: "var(--brand-blue)" },
              { n: "6",    l: "GCC countries",      c: "var(--brand-cyan)" },
              { n: "200+", l: "Students trained",   c: "var(--brand-gold)" },
              { n: "9.2",  l: "Satisfaction /10",   c: "var(--brand-red)" },
            ].map((s) => (
              <div key={s.l} style={{ background: "var(--surface)", padding: "28px 16px", textAlign: "center" }}>
                <div className="font-display" style={{ fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, color: s.c, textShadow: `0 0 30px ${s.c}50`, marginBottom: "6px" }}>{s.n}</div>
                <div style={{ fontSize: "11px", color: "oklch(0.97 0.01 250 / 50%)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ADVANTAGE ── */}
        <section style={{ padding: "0 24px 64px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", background: "oklch(0.17 0.06 150 / 40%)", border: "1px solid rgba(88,204,2,0.2)", borderRadius: "24px", padding: "28px 32px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(88,204,2,0.15)", border: "1px solid rgba(88,204,2,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "22px" }}>
              📈
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#58CC02", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".05em" }}>Your pricing advantage</p>
              <p style={{ fontSize: "14px", color: "oklch(0.97 0.01 250 / 60%)", lineHeight: 1.7 }}>
                International workshops from Western providers cost <strong style={{ color: "var(--foreground)" }}>$5,000–$15,000 per week</strong>. Plulai delivers the same quality at <strong style={{ color: "var(--foreground)" }}>$800–$3,500</strong> — the most affordable credentialed option in the region.
              </p>
            </div>
          </div>
        </section>

        {/* ── PACKAGES ── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ marginBottom: "40px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--brand-cyan)", marginBottom: "10px" }}>School packages</p>
              <h2 className="font-display" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "var(--foreground)", marginBottom: "12px" }}>
                Pick the format that <span style={{ color: "var(--brand-blue)" }}>fits your school.</span>
              </h2>
              <p style={{ fontSize: "16px", color: "oklch(0.97 0.01 250 / 60%)", lineHeight: 1.7, maxWidth: "560px" }}>
                From a one-day taster to a full-year licence. Every package includes certification for students and full facilitation by our team.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {PACKAGES.map((pkg) => (
                <div key={pkg.name} className={`card ${pkg.accentClass}`} style={{ overflow: "hidden", padding: "28px 28px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                    {/* Icon */}
                    <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: pkg.accentBg, border: `1px solid ${pkg.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>
                      {pkg.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <h3 className="font-display" style={{ fontSize: "22px", fontWeight: 700, color: "var(--foreground)" }}>{pkg.name}</h3>
                            {pkg.badge && (
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: pkg.accentBg, color: pkg.accent, border: `1px solid ${pkg.accent}40` }}>
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <span className="font-display" style={{ fontSize: "28px", fontWeight: 700, color: "var(--foreground)" }}>{pkg.price}</span>
                            <span style={{ fontSize: "13px", color: "oklch(0.97 0.01 250 / 45%)", fontWeight: 600 }}>· {pkg.duration}</span>
                          </div>
                        </div>
                        <a href="mailto:hello@plulai.com" style={{
                          padding: "10px 22px", borderRadius: "12px", background: pkg.accent, color: pkg.accent === "var(--brand-gold)" ? "#1A1A2E" : "#fff",
                          fontSize: "13px", fontWeight: 700, textDecoration: "none", flexShrink: 0,
                          boxShadow: `0 4px 0 ${pkg.accent === "var(--brand-gold)" ? "#C47D00" : "rgba(0,0,0,0.3)"}`,
                          transition: "transform .1s, box-shadow .1s",
                        }}>
                          Enquire →
                        </a>
                      </div>

                      {/* Includes */}
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                        {pkg.includes.map((f) => (
                          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "oklch(0.97 0.01 250 / 65%)", lineHeight: 1.5 }}>
                            <CheckIcon color={pkg.accent} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Ideal for */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: pkg.accentBg, border: `1px solid ${pkg.accent}35`, color: pkg.accent, fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "999px" }}>
                        ✦ {pkg.ideal}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="divider" />

        {/* ── PAYMENT & LOGISTICS ── */}
        <section style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--brand-gold)", marginBottom: "10px" }}>Payment & logistics</p>
            <h2 className="font-display" style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "var(--foreground)", marginBottom: "36px" }}>
              Simple structure. <span style={{ color: "var(--brand-blue)" }}>No surprises.</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px" }}>
              {/* Payment */}
              <div className="card card-accent-gold" style={{ padding: "28px" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>💳</div>
                <h3 className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "var(--brand-gold)", marginBottom: "10px" }}>Payment structure</h3>
                <p style={{ fontSize: "14px", color: "oklch(0.97 0.01 250 / 60%)", lineHeight: 1.7 }}>
                  Always <strong style={{ color: "var(--foreground)" }}>50% upfront, 50% on arrival</strong>. A $2,500 Intensive Week = $1,250 upfront. That covers your flight and first week of accommodation.
                </p>
              </div>

              {/* What we handle */}
              <div className="card card-accent-blue" style={{ padding: "28px" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>✅</div>
                <h3 className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "var(--brand-blue)", marginBottom: "10px" }}>What we handle</h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["Curriculum & materials", "Facilitation & teaching", "Arabic localisation", "Student certificates", "Parent communication"].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "oklch(0.97 0.01 250 / 65%)" }}>
                      <CheckIcon color="var(--brand-blue)" />{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* School provides */}
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>🏫</div>
                <h3 className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "oklch(0.97 0.01 250 / 80%)", marginBottom: "10px" }}>What the school provides</h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["A room", "Students (15–25 per session)", "Devices or computer lab", "Internet access"].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "oklch(0.97 0.01 250 / 60%)" }}>
                      <CheckIcon color="oklch(0.97 0.01 250 / 40%)" />{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Credential */}
              <div className="card card-accent-cyan" style={{ padding: "28px", background: "oklch(0.21 0.05 265)" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>🏆</div>
                <h3 className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "var(--brand-cyan)", marginBottom: "10px" }}>The credential that closes</h3>
                <p style={{ fontSize: "14px", color: "oklch(0.97 0.01 250 / 55%)", lineHeight: 1.7 }}>
                  Top 15 from 1,500 startups — <strong style={{ color: "var(--foreground)" }}>Delta Residency (Sam Altman)</strong>. Mentored by <strong style={{ color: "var(--foreground)" }}>Khailee Ng, 500 Global HQ</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── PROCESS ── */}
        <section style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--brand-cyan)", marginBottom: "10px" }}>How it works</p>
            <h2 className="font-display" style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "var(--foreground)", marginBottom: "40px" }}>
              From first email to <span style={{ color: "var(--brand-blue)" }}>Demo Day.</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { n: "1", title: "Book a 20-min call",       badge: "Day 1",     desc: "We scope the format, age groups, timing, and budget. No obligation." },
                { n: "2", title: "Receive a custom proposal", badge: "Day 2–3",   desc: "Tailored to your school — curriculum outline, logistics, and pricing in one document." },
                { n: "3", title: "Sign & 50% upfront",        badge: "Week 1",    desc: "50% secures the date. We handle everything from here — curriculum, materials, Arabic localisation." },
                { n: "4", title: "We arrive & deliver",       badge: "Workshop",  desc: "Our team arrives, runs every session, manages the students, and keeps you updated throughout." },
                { n: "5", title: "Demo Day & certificates",   badge: "Final day", desc: "Students present their projects. Every student gets a certificate. School gets a full impact report." },
              ].map((s, i, arr) => (
                <div key={i} style={{ display: "flex", gap: "20px", padding: "24px 0", borderBottom: i < arr.length - 1 ? "1px solid oklch(1 0 0 / 8%)" : "none" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--brand-blue)", boxShadow: "0 4px 0 var(--brand-deep), 0 0 20px rgba(28,176,246,0.4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, flexShrink: 0, marginTop: "2px" }}>
                    {s.n}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                      <h4 className="font-display" style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>{s.title}</h4>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: "rgba(28,176,246,0.12)", color: "var(--brand-cyan)", border: "1px solid rgba(28,176,246,0.2)" }}>{s.badge}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "oklch(0.97 0.01 250 / 55%)", lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── FAQ ── */}
        <section style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--brand-gold)", marginBottom: "10px" }}>FAQ</p>
            <h2 className="font-display" style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "var(--foreground)", marginBottom: "36px" }}>
              Questions schools <span style={{ color: "var(--brand-blue)" }}>always ask.</span>
            </h2>
            <div className="card" style={{ overflow: "hidden" }}>
              {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ position: "relative", overflow: "hidden", background: "var(--surface)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "32px", padding: "72px 32px", textAlign: "center" }}>
              {/* Glow */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(28,176,246,0.15), transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="badge" style={{ background: "rgba(88,204,2,0.12)", border: "1px solid rgba(88,204,2,0.2)", color: "#58CC02", marginBottom: "24px" }}>
                  ✓ 9+ schools already partnered
                </div>
                <h2 className="font-display" style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px", lineHeight: 1.05 }}>
                  Ready to bring Plulai<br />to your students?
                </h2>
                <p style={{ fontSize: "16px", color: "oklch(0.97 0.01 250 / 55%)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "440px", margin: "0 auto 36px" }}>
                  Book a free 20-minute call. No commitment.<br />We&apos;ll recommend the right package for your school.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="mailto:hello@plulai.com" className="shelf-blue" style={{ fontSize: "16px", fontWeight: 700, padding: "16px 36px", borderRadius: "20px" }}>
                    Book a free demo →
                  </a>
                  <a href="mailto:hello@plulai.com" className="shelf-dark" style={{ fontSize: "15px", fontWeight: 700, padding: "15px 28px", borderRadius: "20px" }}>
                    Email us directly
                  </a>
                </div>
                <p style={{ fontSize: "13px", color: "oklch(0.97 0.01 250 / 25%)", marginTop: "20px" }}>
                  hello@plulai.com
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", padding: "40px 24px", background: "var(--surface)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "40px", alignItems: "start", marginBottom: "40px" }}>
            <div>
              <Image src="/icons/plulai1.png" alt="Plulai" width={100} height={32} style={{ height: "32px", width: "auto", objectFit: "contain", marginBottom: "10px" }} />
              <p style={{ fontSize: "13px", color: "oklch(0.97 0.01 250 / 45%)" }}>Building tomorrow&apos;s leaders, today. Made for the GCC.</p>
            </div>
            {[
              ["Product", [["/#tracks", "Tracks"], ["/#how", "How it works"], ["/#pricing", "Pricing"]]],
              ["Schools", [["/schools", "Overview"], ["mailto:hello@plulai.com", "Request demo"]]],
              ["Company", [["mailto:hello@plulai.com", "Contact"]]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "oklch(0.97 0.01 250 / 40%)", marginBottom: "14px" }}>{title as string}</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(links as [string, string][]).map(([href, label]) => (
                    <li key={label}><a href={href} style={{ fontSize: "13px", color: "oklch(0.97 0.01 250 / 55%)", textDecoration: "none" }}>{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: "1280px", margin: "0 auto", paddingTop: "24px", borderTop: "1px solid oklch(1 0 0 / 8%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "oklch(0.97 0.01 250 / 30%)" }}>© 2026 Plulai Education. All rights reserved.</span>
            <div style={{ display: "flex", gap: "24px" }}>
              {[["#", "Privacy"], ["#", "Terms"], ["#", "العربية"]].map(([href, label]) => (
                <a key={label} href={href} style={{ fontSize: "12px", color: "oklch(0.97 0.01 250 / 30%)", textDecoration: "none", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}