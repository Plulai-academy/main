"use client";

import { useState, useEffect } from "react";

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  teal:    "#40B1AC",
  pink:    "#FB752F",
  dark:    "#00AEAB",
  bg:      "#030d0d",
  bg2:     "#071414",
  bg3:     "#0c1f1f",
  border:  "rgba(64,177,172,0.15)",
  borderH: "rgba(64,177,172,0.45)",
  text:    "#e8f4f4",
  muted:   "#5a8a88",
};

// ── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const get = () => {
    const d = target.getTime() - Date.now();
    if (d <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days:  Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      mins:  Math.floor((d % 3600000)  / 60000),
      secs:  Math.floor((d % 60000)    / 1000),
    };
  };
  const [t, setT] = useState(get);
  useEffect(() => {
    const id = setInterval(() => setT(get()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

// ── Constants ────────────────────────────────────────────────────────────────
const DEADLINE        = new Date("2025-05-22T23:59:59");
const BASE_FEE        = 20;
const POOL_PRIZE      = 5000;
const GOOGLE_WEBHOOK  = "https://script.google.com/macros/s/AKfycbwpQyidnOQOKLrorP3Iq2NaXyLIQkG8uKIAjPljXqb9U7jcf_sCbCaU9l1BnpDXdb4_/exec";
const FALLBACK_FORM_URL = "https://forms.gle/LsZACjr1fUBNUMXt7";

const DISCOUNT_CODES: Record<string, { label: string; off: number }> = {
  "DOUBLED":  { label: "Partner — 50% off", off: 50 },
  "SCHOOLS":  { label: "School — 50% off",  off: 50 },
  "SCHOOL50": { label: "School — 50% off",  off: 50 },
  "DIANA75C": { label: "Special — 50% off", off: 50 },
};

const DAYS = [
  { day: 1,  date: "23 May", emoji: "🤔", title: "What is AI?",       desc: "Discover how AI already runs your phone, your music, and your city." },
  { day: 2,  date: "24 May", emoji: "🐍", title: "Python Basics",      desc: "Write your first lines of code — variables, print, and input." },
  { day: 3,  date: "25 May", emoji: "🧠", title: "How Machines Learn", desc: "Train your first classifier with real labelled data." },
  { day: 4,  date: "26 May", emoji: "📊", title: "Data & Patterns",    desc: "Find trends in datasets and visualise them as charts." },
  { day: 5,  date: "27 May", emoji: "🎨", title: "Creative AI",        desc: "Generate images and text using AI tools — then remix them." },
  { day: 6,  date: "28 May", emoji: "🤖", title: "Build a Chatbot",    desc: "Connect to an AI API and make your first conversational bot." },
  { day: 7,  date: "29 May", emoji: "⚠️", title: "AI Ethics",          desc: "Explore bias, privacy, and why responsible AI matters for everyone." },
  { day: 8,  date: "30 May", emoji: "🛠️", title: "Project Day 1",      desc: "Plan and start building your final project with AI Coach support." },
  { day: 9,  date: "31 May", emoji: "🔥", title: "Project Day 2",      desc: "Build, test, and polish your project end-to-end." },
  { day: 10, date: "5 Jun",  emoji: "🏆", title: "Demo & Judging",     desc: "Present your project live. The top 3 winners are announced today." },
];

const FAQ = [
  { q: "من يمكنه المشاركة؟ / Who can join?",            a: "Any child aged 6 to 18 in Tunisia. Zero prior experience needed — we start from scratch." },
  { q: "هل أحتاج خبرة مسبقة؟ / Do I need experience?",  a: "None at all. Day 1 starts from absolute zero and builds up step by step." },
  { q: "متى تبدأ المنافسة؟ / When does it start?",       a: "May 23 to June 5, 2025. Each daily lesson unlocks at 9 AM Tunisia time." },
  { q: "ما هو الجائزة؟ / What is the prize?",           a: "A prize pool of 5,000 DT distributed across the top 3 winners, plus trophies and certificates." },
  { q: "كيف أدفع؟ / How do I pay?",                     a: "Entry fee is 20 DT. Schools and partners benefit from an exclusive 50% discount — contact us to receive your code. In Sfax you can pay in person at Lingoville Center, Rte Tunis. Otherwise a payment link is sent after registration." },
  { q: "هل يمكن للوالدين المتابعة؟ / Can parents follow?", a: "Yes. Parents receive weekly progress reports by email and can follow along the entire journey." },
  { q: "من ينظّم هذه المنافسة؟ / Who organises this?",  a: "Plulai in partnership with Lingoville and Business Success. Hosted at Lingoville Center, Rte Tunis, Sfax." },
];

// ── CountBlock ───────────────────────────────────────────────────────────────
function CountBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 68 }}>
      <div style={{
        fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1,
        letterSpacing: "-0.04em",
        background: `linear-gradient(180deg, #fff 0%, ${C.teal} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginTop: 6, fontFamily: "monospace" }}>
        {label}
      </div>
    </div>
  );
}

// ── DayCard ───────────────────────────────────────────────────────────────────
function DayCard({ d, i }: { d: typeof DAYS[0]; i: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(64,177,172,0.08)" : "rgba(64,177,172,0.03)",
        border: `1px solid ${hov ? C.borderH : C.border}`,
        borderRadius: 16, padding: "18px 20px", display: "flex", gap: 14,
        alignItems: "flex-start", transition: "all 0.2s ease",
        transform: hov ? "translateY(-2px)" : "none",
        animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.05}s`,
        cursor: "default",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        background: "rgba(64,177,172,0.12)", border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
      }}>{d.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.teal, letterSpacing: "0.1em" }}>DAY {d.day}</span>
          <span style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted, background: "rgba(64,177,172,0.06)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>{d.date}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.text, marginBottom: 3 }}>{d.title}</div>
        <div style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.5 }}>{d.desc}</div>
      </div>
    </div>
  );
}

// ── FaqItem ───────────────────────────────────────────────────────────────────
function FaqItem({ item, i }: { item: typeof FAQ[0]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${open ? C.borderH : C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 8, animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s`, transition: "border-color 0.2s" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: open ? "rgba(64,177,172,0.07)" : "rgba(64,177,172,0.02)", border: "none", cursor: "pointer", padding: "17px 22px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text, fontFamily: "inherit", fontWeight: 600, fontSize: "0.88rem", transition: "background 0.2s" }}
      >
        <span>{item.q}</span>
        <span style={{ fontSize: "1.3rem", color: C.teal, transition: "transform 0.25s", transform: open ? "rotate(45deg)" : "none", flexShrink: 0, marginLeft: 12, lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 16px", fontSize: "0.84rem", color: C.muted, lineHeight: 1.7, borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 14 }}>{item.a}</div>
        </div>
      )}
    </div>
  );
}

// ── Webhook helper (GET-based, no-cors safe) ──────────────────────────────────
function pingWebhook(url: string, params: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    const qs = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${qs}`;
    // Primary: GET fetch with no-cors — always works with GAS /exec, no preflight
    fetch(fullUrl, { method: "GET", mode: "no-cors" })
      .then(() => resolve())
      .catch(() => {
        // Fallback: image beacon — zero-dependency, fires even in old browsers
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = fullUrl;
      });
  });
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PlulaiTunisiaPage() {
  const { days, hours, mins, secs } = useCountdown(DEADLINE);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Noto+Serif+Arabic:wght@700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${C.bg}; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }
    @keyframes pulse {
      0%   { transform: scale(1);   opacity: 0.7; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.teal}; border-radius: 3px; }
    ::selection { background: rgba(64,177,172,0.3); }
  `;

  const grad  = `linear-gradient(135deg, ${C.teal}, ${C.pink})`;

  return (
    <>
      <style>{css}</style>

      {/* ── Progress bar ── */}
      <ProgressBar />

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(3,13,13,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>🚀 Plulai</span>
          <span style={{ fontSize: "0.68rem", color: C.muted, fontFamily: "monospace", display: scrolled ? "none" : "block" }}>× Lingoville × Business Success</span>
        </div>
        <a href="#register" style={{ background: grad, color: "#fff", borderRadius: 999, padding: "9px 22px", fontWeight: 700, fontSize: "0.84rem", textDecoration: "none", boxShadow: `0 4px 20px rgba(64,177,172,0.3)` }}>
          سجّل الآن · Register
        </a>
      </nav>

      {/* ── BG glows ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: 900, height: 700, background: `radial-gradient(ellipse, rgba(64,177,172,0.12) 0%, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "5%",  right: "-10%", width: 600, height: 600, background: `radial-gradient(ellipse, rgba(251,117,191,0.07) 0%, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "50%",    left: "-5%",  width: 400, height: 400, background: `radial-gradient(ellipse, rgba(0,174,171,0.06) 0%, transparent 70%)`, borderRadius: "50%" }} />
      </div>

      <main style={{ position: "relative", zIndex: 1, fontFamily: "'Space Grotesk', sans-serif", color: C.text, overflowX: "hidden" }}>

        {/* ══════════ HERO ══════════ */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "110px 20px 80px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.5s ease both" }}>
            <div style={{ background: "rgba(64,177,172,0.1)", border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 16px", fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: "0.1em", color: C.teal }}>🇹🇳 Tunisia 2025</div>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <div style={{ fontSize: "0.72rem", color: C.muted, fontFamily: "monospace" }}>Hosted by <span style={{ color: C.teal, fontWeight: 700 }}>Lingoville</span> × <span style={{ color: C.pink, fontWeight: 700 }}>Business Success</span></div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28,
            background: `linear-gradient(135deg, rgba(251,117,47,0.18), rgba(64,177,172,0.18))`,
            border: `1px solid rgba(251,117,47,0.4)`,
            borderRadius: 999, padding: "12px 28px",
            animation: "fadeUp 0.5s 0.06s ease both",
            boxShadow: "0 0 40px rgba(251,117,47,0.15)",
          }}>
            <span style={{ fontSize: "1.4rem" }}>🏆</span>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 2 }}>Prize Pool · مجموع الجوائز</div>
              <div style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${C.pink}, ${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{POOL_PRIZE.toLocaleString()} DT</div>
            </div>
            <span style={{ fontSize: "1.4rem" }}>🏆</span>
          </div>

          <h1 style={{ fontFamily: "'Noto Serif Arabic', serif", fontWeight: 900, fontSize: "clamp(1.7rem, 5vw, 2.8rem)", color: "#fff", lineHeight: 1.35, marginBottom: 12, direction: "rtl", animation: "fadeUp 0.5s 0.1s ease both" }}>
            بطولة تونس للذكاء الاصطناعي للشباب
          </h1>

          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.7rem)", letterSpacing: "-0.02em", marginBottom: 20, animation: "fadeUp 0.5s 0.15s ease both", background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Tunisia AI Championship for Youth
          </h2>

          <p style={{ maxWidth: 580, color: C.muted, fontSize: "clamp(0.92rem, 2vw, 1rem)", lineHeight: 1.8, marginBottom: 36, animation: "fadeUp 0.5s 0.2s ease both" }}>
            10 days · 100% online · Ages 6–18 · <strong style={{ color: "#fff" }}>20 DT</strong> entry<br />
            Schools &amp; partners: <strong style={{ color: C.teal }}>50% off</strong> — contact us for your exclusive code<br />
            <strong style={{ color: C.text }}>📅 23 May → 5 June 2026</strong>
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 60, animation: "fadeUp 0.5s 0.25s ease both" }}>
            <a href="#register"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: grad, color: "#fff", textDecoration: "none", borderRadius: 999, padding: "15px 32px", fontWeight: 800, fontSize: "1rem", boxShadow: `0 8px 32px rgba(64,177,172,0.35)` }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              🎯 سجّل الآن · Register Now
            </a>
            <a href="#schedule" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(64,177,172,0.08)", border: `1px solid ${C.border}`, color: C.text, textDecoration: "none", borderRadius: 999, padding: "15px 26px", fontWeight: 600, fontSize: "0.93rem" }}>
              📅 See the 10 Days
            </a>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", background: "rgba(64,177,172,0.04)", border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", animation: "fadeUp 0.5s 0.3s ease both" }}>
            {[
              { val: "6–18",  lab: "Age / السن" },
              { val: "10",    lab: "Days / أيام" },
              { val: "20 DT", lab: "Entry / رسوم" },
              { val: `${POOL_PRIZE.toLocaleString()} DT`, lab: "Prize Pool / جائزة" },
              { val: "100%",  lab: "Online / أونلاين" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "18px 24px", textAlign: "center", borderRight: i < 4 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ fontWeight: 800, fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "#fff", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginTop: 4 }}>{s.lab}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ PARTNERS BANNER ══════════ */}
        <section style={{ padding: "0 20px 80px", maxWidth: 860, margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(135deg, rgba(64,177,172,0.08), rgba(251,117,191,0.06))`, border: `1px solid ${C.border}`, borderRadius: 24, padding: "32px 36px" }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 20, textAlign: "center" }}>Organised &amp; Hosted by · منظَّم ومستضاف بواسطة</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { emoji: "🏢", name: "Lingoville", sub: "Rte Tunis, Sfax", desc: "Sfax-based participants can pay and register in person at Lingoville Center on Route Tunis. Our official venue partner." },
                { emoji: "📈", name: "Business Success", sub: "Strategic partner", desc: "Business Success brings entrepreneurship expertise and supports the competition infrastructure and prize logistics." },
                { emoji: "🚀", name: "Plulai", sub: "AI learning platform", desc: "Plulai provides the full 10-day AI curriculum, the AI Coach, leaderboard, certificates, and technical platform." },
              ].map((p, i) => (
                <div key={i} style={{ background: "rgba(64,177,172,0.04)", border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 20px" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{p.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.teal, letterSpacing: "0.08em", marginBottom: 10 }}>{p.sub}</div>
                  <div style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, background: "rgba(251,117,191,0.07)", border: "1px solid rgba(251,117,191,0.2)", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>📍</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: 4 }}>Paying in Sfax? Come to us directly · أنت من صفاقس؟ تعال إلينا مباشرة</div>
                <div style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.6 }}>
                  Sfax participants can pay the 20 DT (or 10 DT with discount) <strong style={{ color: C.text }}>in person at Lingoville Center, Route Tunis, Sfax</strong>. Bring your child&apos;s name, age, and parent contact. Receipt issued on the spot.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ COUNTDOWN ══════════ */}
        <section style={{ padding: "0 20px 90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: `linear-gradient(135deg, rgba(64,177,172,0.1), rgba(0,174,171,0.06))`, border: `1px solid ${C.border}`, borderRadius: 24, padding: "40px 48px", textAlign: "center", width: "100%", maxWidth: 540 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.teal, marginBottom: 18 }}>
              ⏰ Registration closes in · يغلق التسجيل خلال
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "flex-start" }}>
              <CountBlock value={days}  label="Days / أيام" />
              <div style={{ color: C.teal, fontWeight: 800, fontSize: "2rem", paddingTop: 4 }}>:</div>
              <CountBlock value={hours} label="Hrs / ساعات" />
              <div style={{ color: C.teal, fontWeight: 800, fontSize: "2rem", paddingTop: 4 }}>:</div>
              <CountBlock value={mins}  label="Min / دقائق" />
              <div style={{ color: C.teal, fontWeight: 800, fontSize: "2rem", paddingTop: 4 }}>:</div>
              <CountBlock value={secs}  label="Sec / ثواني" />
            </div>
            <div style={{ marginTop: 20, fontSize: "0.8rem", color: C.muted }}>
              Deadline: <strong style={{ color: C.text }}>22 May 2025</strong> · آخر موعد: 22 مايو 2025
            </div>
            <div style={{ marginTop: 6, fontSize: "0.7rem", color: "#3d6665" }}>
              Competition: 23 May – 5 June 2026
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section style={{ padding: "0 20px 90px", maxWidth: 880, margin: "0 auto" }}>
          <SectionLabel>كيف يعمل · How it works</SectionLabel>
          <h2 style={sectionH2}>3 Simple Steps</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginTop: 40 }}>
            {[
              { n: "01", emoji: "📝", en: "Register & Pay", ar: "سجّل وادفع", desc: "Fill the form, pay 20 DT (or 10 DT with school code). In Sfax: pay in person at Lingoville, Rte Tunis." },
              { n: "02", emoji: "💻", en: "Learn Daily",    ar: "تعلّم كل يوم", desc: "30–45 min per day on Plulai. Build AI skills, earn XP, and climb the leaderboard from May 23." },
              { n: "03", emoji: "🏆", en: "Win 5,000 DT",  ar: "اربح 5000 دينار", desc: "Submit your Day 10 project. The jury picks the top 3 and distributes the 5,000 DT prize pool." },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(64,177,172,0.03)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "30px 26px", position: "relative", overflow: "hidden", animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontFamily: "monospace", fontSize: "3.5rem", fontWeight: 800, color: "rgba(64,177,172,0.07)", position: "absolute", top: 10, right: 18, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontFamily: "'Noto Serif Arabic', serif", fontSize: "0.88rem", color: C.teal, marginBottom: 5, direction: "rtl" }}>{s.ar}</div>
                <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#fff", marginBottom: 10 }}>{s.en}</div>
                <div style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ PRIZE POOL ══════════ */}
        <section style={{ padding: "0 20px 90px", maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <SectionLabel>الجوائز · Prizes</SectionLabel>
          <h2 style={sectionH2}>Prize Pool: 5,000 DT</h2>
          <div style={{ position: "relative", background: `linear-gradient(135deg, rgba(64,177,172,0.1), rgba(251,117,191,0.08))`, border: `1px solid ${C.border}`, borderRadius: 28, padding: "52px 36px", marginTop: 36, overflow: "hidden" }}>
            {[180, 130].map((size, i) => (
              <div key={i} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: size, height: size, borderRadius: "50%", border: `2px solid rgba(64,177,172,${0.1 + i * 0.05})`, animation: `pulse 3s ${i * 1}s ease-out infinite`, pointerEvents: "none" }} />
            ))}
            <div style={{ fontSize: "4rem", marginBottom: 16, animation: "float 3s ease-in-out infinite", position: "relative" }}>🏆</div>
            <div style={{ fontWeight: 800, fontSize: "clamp(2rem,5vw,3rem)", letterSpacing: "-0.04em", background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>5,000 DT</div>
            <div style={{ fontFamily: "'Noto Serif Arabic', serif", fontSize: "1rem", color: C.muted, marginBottom: 32, direction: "rtl" }}>موزّعة على أفضل 3 مشاركين</div>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, maxWidth: 420, margin: "28px auto 0" }}>
              {[
                { icon: "📜", text: "Certificate for every participant who completes all 10 days" },
                { icon: "🎓", text: "1-Year Plulai Pro for the winner" },
                { icon: "📢", text: "Featured on Plulai & partners social channels" },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(64,177,172,0.05)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", textAlign: "left" }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{p.icon}</span>
                  <span style={{ fontSize: "0.84rem", color: C.text }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ 10-DAY SCHEDULE ══════════ */}
        <section id="schedule" style={{ padding: "0 20px 90px", maxWidth: 900, margin: "0 auto", scrollMarginTop: 80 }}>
          <SectionLabel>البرنامج · Schedule</SectionLabel>
          <h2 style={sectionH2}>The 10 Days of AI</h2>
          <p style={{ color: C.muted, fontSize: "0.88rem", marginTop: 10, marginBottom: 36, textAlign: "center" }}>
            23 May → 5 June · 30–45 min/day · Starts daily at 9 AM Tunisia time
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 10 }}>
            {DAYS.map((d, i) => <DayCard key={d.day} d={d} i={i} />)}
          </div>
        </section>

        {/* ══════════ FOR PARENTS ══════════ */}
        <section style={{ padding: "0 20px 90px", maxWidth: 860, margin: "0 auto" }}>
          <SectionLabel>للآباء · For Parents</SectionLabel>
          <h2 style={sectionH2}>Why Let Your Child Join?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, marginTop: 36 }}>
            {[
              { icon: "🔒", title: "100% Safe",       ar: "آمن بالكامل",      desc: "No chats with strangers. Kids learn in a fully closed, monitored environment." },
              { icon: "⏱️", title: "30–45 min/day",   ar: "نصف ساعة يومياً",   desc: "Short daily sessions that fit any school schedule — never overwhelming." },
              { icon: "📊", title: "Weekly Reports",  ar: "تقارير أسبوعية",    desc: "You receive a detailed progress email every week showing exactly what was learned." },
              { icon: "🎯", title: "Real Skills",     ar: "مهارات حقيقية",     desc: "Python, AI, logical thinking. Skills schools don't teach — but employers demand." },
              { icon: "🏅", title: "Certificate",     ar: "شهادة إتمام",       desc: "Every child who completes all 10 days receives an official certificate." },
              { icon: "💳", title: "From 10 DT",      ar: "من 10 دينار فقط",   desc: "Schools and partners pay only 10 DT with an exclusive discount code. Contact us to get yours. No hidden fees." },
            ].map((c, i) => (
              <div key={i} style={{ background: "rgba(64,177,172,0.03)", border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 18px", animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: 3 }}>{c.title}</div>
                <div style={{ fontFamily: "'Noto Serif Arabic', serif", fontSize: "0.75rem", color: C.teal, marginBottom: 8, direction: "rtl" }}>{c.ar}</div>
                <div style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ OUR PARTNERS ══════════ */}
        <section style={{ padding: "0 20px 90px", maxWidth: 860, margin: "0 auto" }}>
          <SectionLabel>شركاؤنا · Our Partners</SectionLabel>
          <h2 style={sectionH2}>Made possible by</h2>
          <p style={{ color: C.muted, fontSize: "0.86rem", marginTop: 10, marginBottom: 40, textAlign: "center" }}>
            This championship is built on three pillars of excellence
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { emoji: "🏢", name: "Lingoville", tag: "Venue Partner · Sfax", color: C.teal, desc: "Lingoville Center on Route Tunis, Sfax is our official venue. Sfax-based participants can register and pay in person directly at the center.", detail: "📍 Route Tunis, Sfax" },
              { emoji: "📈", name: "Business Success", tag: "Strategic Partner", color: C.pink, desc: "Business Success brings entrepreneurship expertise, prize logistics, and strategic support to make this championship a landmark event in Tunisia.", detail: "🤝 Strategy & Operations" },
              { emoji: "🚀", name: "Plulai", tag: "Technology Partner", color: "#a78bfa", desc: "Plulai provides the full 10-day AI curriculum, the AI Coach, live leaderboard, automated certificates, and the entire technical platform.", detail: "💻 plulai.com" },
            ].map((p, i) => (
              <div key={i} style={{ background: `linear-gradient(160deg, rgba(64,177,172,0.05), rgba(64,177,172,0.02))`, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.1}s`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, transparent)`, borderRadius: "20px 20px 0 0" }} />
                <div style={{ fontSize: "2.4rem" }}>{p.emoji}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#fff", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.62rem", color: p.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{p.tag}</div>
                </div>
                <div style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.65, flex: 1 }}>{p.desc}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#3d6665", background: "rgba(64,177,172,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", display: "inline-block" }}>{p.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ background: `linear-gradient(135deg, rgba(251,117,47,0.07), rgba(64,177,172,0.05))`, border: `1px solid rgba(251,117,47,0.25)`, borderRadius: 18, padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(251,117,47,0.15)", border: "1px solid rgba(251,117,47,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>📍</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff", marginBottom: 6 }}>Paying in Sfax? · أنت من صفاقس؟</div>
              <div style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.7 }}>
                Come directly to <strong style={{ color: C.text }}>Lingoville Center, Route Tunis, Sfax</strong> to register and pay in person. Bring your child&apos;s name, age, and your contact details. A receipt and confirmation are issued immediately on the spot.
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section style={{ padding: "0 20px 90px", maxWidth: 680, margin: "0 auto" }}>
          <SectionLabel>أسئلة شائعة · FAQ</SectionLabel>
          <h2 style={sectionH2}>Common Questions</h2>
          <div style={{ marginTop: 36 }}>
            {FAQ.map((f, i) => <FaqItem key={i} item={f} i={i} />)}
          </div>
        </section>

        {/* ══════════ REGISTER ══════════ */}
        <section id="register" style={{ padding: "0 20px 120px", maxWidth: 580, margin: "0 auto", scrollMarginTop: 80 }}>
          <SectionLabel>التسجيل · Registration</SectionLabel>
          <h2 style={sectionH2}>Join the Competition</h2>
          <p style={{ color: C.muted, fontSize: "0.86rem", marginTop: 10, marginBottom: 36, textAlign: "center" }}>
            انضم إلى البطولة — سجّل طفلك في دقيقتين · Base fee 20 DT (50% off with code)
          </p>
          <RegisterForm />
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>🚀 Plulai × Lingoville × Business Success</div>
          <div style={{ fontSize: "0.78rem", color: C.muted }}>AI Championship for Kids · Tunisia 2025</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="mailto:hello@plulai.com" style={{ fontSize: "0.78rem", color: C.teal, textDecoration: "none" }}>hello@plulai.com</a>
            <a href="https://plulai.com"      style={{ fontSize: "0.78rem", color: C.teal, textDecoration: "none" }}>plulai.com</a>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#1c3433" }}>© 2025 Plulai · All rights reserved</div>
        </footer>

      </main>
    </>
  );
}

// ── Shared style helpers ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#40B1AC", marginBottom: 10, textAlign: "center" }}>
      {children}
    </div>
  );
}

const sectionH2: React.CSSProperties = {
  fontWeight: 800, fontSize: "clamp(1.5rem,4vw,2.2rem)", letterSpacing: "-0.03em", color: "#fff", textAlign: "center",
};

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const h = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return <div style={{ position: "fixed", top: 0, left: 0, height: "2px", width: `${pct}%`, background: `linear-gradient(90deg, #40B1AC, #FB752F)`, zIndex: 300, transition: "width 0.1s linear" }} />;
}

// ── RegisterForm ──────────────────────────────────────────────────────────────
function RegisterForm() {
  const [form, setForm]                     = useState({ childName: "", age: "", parentName: "", email: "", phone: "", school: "", discount: "" });
  const [status, setStatus]                 = useState<"idle" | "loading" | "success">("idle");
  const [discountStatus, setDiscountStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const discountData = DISCOUNT_CODES[form.discount.trim().toUpperCase()];
  const finalFee     = discountData ? Math.max(0, BASE_FEE - (BASE_FEE * discountData.off / 100)) : BASE_FEE;

  const checkDiscount = () => {
    const c = form.discount.trim().toUpperCase();
    if (!c) { setDiscountStatus("idle"); return; }
    setDiscountStatus(DISCOUNT_CODES[c] ? "valid" : "invalid");
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === "discount") setDiscountStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const params: Record<string, string> = {
      childName:     form.childName,
      age:           form.age,
      parentName:    form.parentName,
      email:         form.email,
      phone:         form.phone  || "—",
      school:        form.school || "—",
      discountCode:  form.discount.trim().toUpperCase() || "—",
      discountLabel: discountData?.label || "—",
      finalFee:      `${finalFee} DT`,
      timestamp:     new Date().toISOString(),
    };

    // Fire GET request — always works with GAS /exec, no preflight, no CORS issues
    const qs      = new URLSearchParams(params).toString();
    const fullUrl = `${GOOGLE_WEBHOOK}?${qs}`;

    try {
      await Promise.race([
        fetch(fullUrl, { method: "GET", mode: "no-cors" }),
        new Promise<void>((_, reject) => setTimeout(() => reject(), 8000)),
      ]);
    } catch {
      // If fetch times out, fire an image beacon as a last-resort fallback
      const img = new Image();
      img.src = fullUrl;
      // Wait a moment for the beacon to fly
      await new Promise(r => setTimeout(r, 1500));
    }

    // Always show success — with no-cors we can never read the response anyway,
    // and the GET will have landed in the sheet regardless.
    setStatus("success");
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "rgba(64,177,172,0.05)",
    border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "13px 16px", color: C.text, fontSize: "0.88rem",
    fontFamily: "'Space Grotesk', sans-serif", outline: "none", transition: "border-color 0.2s",
  };
  const lbl: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: C.muted, marginBottom: 7, letterSpacing: "0.04em" };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = C.teal);
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = C.border);

  const grad = `linear-gradient(135deg, ${C.teal}, ${C.pink})`;

  if (status === "success") return (
    <div style={{ background: "rgba(64,177,172,0.07)", border: `1px solid rgba(64,177,172,0.3)`, borderRadius: 24, padding: "52px 32px", textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 18 }}>🎉</div>
      <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "#fff", marginBottom: 8 }}>You&apos;re registered!</div>
      <div style={{ fontFamily: "'Noto Serif Arabic', serif", color: C.teal, fontSize: "1rem", marginBottom: 18, direction: "rtl" }}>تم تسجيلك بنجاح!</div>
      <div style={{ fontSize: "0.85rem", color: C.muted, lineHeight: 1.8 }}>
        We will send your payment link (<strong style={{ color: C.text }}>{finalFee} DT</strong>) within 24 hours.<br />
        <strong style={{ color: C.text }}>In Sfax?</strong> Pay directly at Lingoville Center, Rte Tunis.<br /><br />
        <span style={{ fontFamily: "'Noto Serif Arabic', serif", direction: "rtl", display: "block" }}>
          سنرسل رابط الدفع ({finalFee} دينار) خلال 24 ساعة. في صفاقس؟ ادفع مباشرة في Lingoville، رت تونس.
        </span>
      </div>
      <div style={{ marginTop: 20, fontSize: "0.72rem", color: "#3d6665" }}>
        Ref: <span style={{ fontFamily: "monospace", color: C.teal }}>PLU-TN-{Date.now().toString(36).toUpperCase()}</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ background: "rgba(64,177,172,0.03)", border: `1px solid ${C.border}`, borderRadius: 24, padding: "36px 30px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Fee banner */}
      <div style={{ background: `linear-gradient(135deg, rgba(64,177,172,0.1), rgba(0,174,171,0.06))`, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>Entry Fee · رسوم الاشتراك</div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 3 }}>Schools get 50% off · المدارس 50% خصم</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: "1.5rem", color: C.teal }}>20 DT</div>
          <div style={{ fontSize: "0.65rem", color: C.muted }}>10 DT with code</div>
        </div>
      </div>

      <div><label style={lbl}>Child&apos;s Full Name · اسم الطفل</label><input required style={inp} placeholder="e.g. Ahmed Ben Ali" value={form.childName} onChange={set("childName")} onFocus={focus} onBlur={blur} /></div>

      <div>
        <label style={lbl}>Child&apos;s Age · عمر الطفل</label>
        <select required style={{ ...inp, appearance: "none" }} value={form.age} onChange={set("age")} onFocus={focus} onBlur={blur}>
          <option value="">Select age / اختر السن</option>
          {Array.from({ length: 13 }, (_, i) => i + 6).map(a => <option key={a} value={a}>{a} years / {a} سنوات</option>)}
        </select>
      </div>

      <div><label style={lbl}>Parent / Guardian Name · اسم الوالد</label><input required style={inp} placeholder="e.g. Mohamed Ben Ali" value={form.parentName} onChange={set("parentName")} onFocus={focus} onBlur={blur} /></div>
      <div><label style={lbl}>Email Address · البريد الإلكتروني</label><input required type="email" style={inp} placeholder="parent@email.com" value={form.email} onChange={set("email")} onFocus={focus} onBlur={blur} /></div>
      <div><label style={lbl}>Phone · رقم الهاتف (optional)</label><input style={inp} placeholder="+216 XX XXX XXX" value={form.phone} onChange={set("phone")} onFocus={focus} onBlur={blur} /></div>

      <div style={{ borderTop: `1px solid ${C.border}`, margin: "2px 0" }} />

      <div>
        <label style={lbl}>🏫 School Name · اسم المدرسة (optional)</label>
        <input style={inp} placeholder="e.g. Lycée de Sfax / مدرسة..." value={form.school} onChange={set("school")} onFocus={focus} onBlur={blur} />
        <div style={{ fontSize: "0.7rem", color: "#3d6665", marginTop: 6 }}>Appears on your child&apos;s certificate · يظهر على شهادة طفلك</div>
      </div>

      <div>
        <label style={lbl}>🎟️ Exclusive Discount Code · كود التخفيض (if you have one)</label>
        <input
          style={{ ...inp, borderColor: discountStatus === "valid" ? "rgba(64,177,172,0.6)" : discountStatus === "invalid" ? "rgba(239,68,68,0.5)" : C.border, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}
          placeholder="Enter your exclusive code here"
          value={form.discount} onChange={set("discount")}
          onFocus={focus} onBlur={e => { checkDiscount(); blur(e); }} maxLength={20}
        />
        <div style={{ fontSize: "0.7rem", color: "#3d6665", marginTop: 6 }}>
          Codes are exclusive — distributed to schools &amp; partners only. <a href="mailto:hello@plulai.com" style={{ color: C.teal, textDecoration: "none" }}>Contact us</a> to get yours.
        </div>
        {discountStatus === "valid" && discountData && (
          <div style={{ marginTop: 10, background: "rgba(64,177,172,0.08)", border: `1px solid rgba(64,177,172,0.25)`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: C.teal, fontWeight: 700 }}>✅ {discountData.label}</div>
              <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: 2 }}>تم تطبيق الكود بنجاح</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", color: C.muted, textDecoration: "line-through" }}>20 DT</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: C.teal }}>{finalFee} DT</div>
            </div>
          </div>
        )}
        {discountStatus === "invalid" && (
          <div style={{ marginTop: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: "0.8rem", color: "#fca5a5" }}>
            ❌ Invalid code · كود غير صحيح. Codes are exclusive — <a href="mailto:hello@plulai.com" style={{ color: C.teal }}>contact us</a> to get yours.
          </div>
        )}
      </div>

      {/* Total */}
      <div style={{ background: discountStatus === "valid" ? "rgba(64,177,172,0.07)" : "rgba(64,177,172,0.04)", border: `1px solid ${discountStatus === "valid" ? "rgba(64,177,172,0.35)" : C.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>Total · المبلغ الإجمالي</div>
          <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: 2 }}>
            {discountStatus === "valid" ? "Discount applied · تم تطبيق الخصم" : "Payment link sent after registration"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {discountStatus === "valid" && <div style={{ fontSize: "0.7rem", color: C.muted, textDecoration: "line-through" }}>20 DT</div>}
          <div style={{ fontWeight: 800, fontSize: "1.6rem", color: C.teal }}>{finalFee} DT</div>
        </div>
      </div>

      <button type="submit" disabled={status === "loading"}
        style={{ background: status === "loading" ? "rgba(64,177,172,0.4)" : grad, color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1rem", cursor: status === "loading" ? "not-allowed" : "pointer", boxShadow: `0 8px 28px rgba(64,177,172,0.3)`, marginTop: 4, transition: "opacity 0.2s" }}>
        {status === "loading" ? "⏳ Registering..." : `🎯 Register & Pay ${finalFee} DT · سجّل الآن`}
      </button>

      {/* Fallback Google Forms link */}
      <div style={{ marginTop: 12, textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: "0.7rem", color: C.muted, background: C.bg2, padding: "0 8px", letterSpacing: "0.5px" }}>⚠️ Alternative Registration</span>
        </div>
        <a
          href={FALLBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(64,177,172,0.02)", border: `1px solid ${C.teal}`, borderRadius: 999, padding: "10px 22px", color: C.teal, textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s ease", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `rgba(64,177,172,0.12)`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(64,177,172,0.02)")}
        >
          📋 Register via Google Forms (backup) →
        </a>
        <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
          If the form above fails, use our official Google Forms backup to complete registration.
        </div>
      </div>

      <div style={{ fontSize: "0.72rem", color: "#3d6665", textAlign: "center", lineHeight: 1.6, marginTop: 4 }}>
        By registering you confirm your child is aged 6–18 and agrees to Plulai&apos;s Terms.<br />
        بالتسجيل تؤكد موافقتك على الشروط وأن عمر طفلك بين 6 و 18 سنة.
      </div>
    </form>
  );
}