"use client";

import { useState, useEffect } from "react";

// ── Countdown hook ──────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000)  / 60000),
      secs:  Math.floor((diff % 60000)    / 1000),
    };
  };
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ── Data ────────────────────────────────────────────────────────────────────
const DEADLINE = new Date("2025-06-15T23:59:59");

const DAYS = [
  { day: 1,  emoji: "🤔", title: "What is AI?",           desc: "Discover how AI already runs your phone, your music, and your city." },
  { day: 2,  emoji: "🐍", title: "Python Basics",          desc: "Write your first lines of code — variables, print, and input." },
  { day: 3,  emoji: "🧠", title: "How Machines Learn",     desc: "Train your first classifier with real labelled data." },
  { day: 4,  emoji: "📊", title: "Data & Patterns",        desc: "Find trends in datasets and visualise them as charts." },
  { day: 5,  emoji: "🎨", title: "Creative AI",            desc: "Generate images and text using AI tools — then remix them." },
  { day: 6,  emoji: "🤖", title: "Build a Chatbot",        desc: "Connect to an AI API and make your first conversational bot." },
  { day: 7,  emoji: "⚠️", title: "AI Ethics",              desc: "Explore bias, privacy, and why responsible AI matters for everyone." },
  { day: 8,  emoji: "🛠️", title: "Project Day 1",          desc: "Plan and start building your final project with AI Coach support." },
  { day: 9,  emoji: "🔥", title: "Project Day 2",          desc: "Build, test, and polish your project end-to-end." },
  { day: 10, emoji: "🏆", title: "Demo & Judging",         desc: "Present your project live. The top 3 winners are announced today." },
];

const FAQ = [
  { q: "من يمكنه المشاركة؟ / Who can join?",           a: "Any child aged 6 to 18 based in Tunisia. No prior coding experience needed at all." },
  { q: "هل أحتاج خبرة مسبقة؟ / Do I need experience?", a: "Zero experience required. Day 1 starts from absolute scratch and builds step by step." },
  { q: "كيف تتم المنافسة؟ / How does it work?",        a: "10 daily online lessons on Plulai. Each day unlocks at 9 AM. Complete activities, earn XP, and submit your Day 10 project." },
  { q: "ما هو الجائزة؟ / What is the prize?",          a: "The winner receives an official trophy and certificate, plus a 1-year free Plulai Pro subscription." },
  { q: "كيف أدفع؟ / How do I pay?",                    a: "Payment of 10 DT is made online at registration via secure payment link. You receive a confirmation email immediately." },
  { q: "هل يمكن للوالدين المتابعة؟ / Can parents follow?", a: "Yes. Parents receive a weekly progress report by email and can view the live leaderboard on this page." },
];

// ── Sub-components ──────────────────────────────────────────────────────────
function CountBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 72 }}>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "-0.04em",
        background: "linear-gradient(180deg,#fff 0%,#a5b4fc 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280", marginTop: 6, fontFamily: "monospace" }}>
        {label}
      </div>
    </div>
  );
}

function DayCard({ d, i }: { d: typeof DAYS[0]; i: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        transition: "all 0.22s ease",
        cursor: "default",
        transform: hov ? "translateY(-2px)" : "none",
        animationDelay: `${i * 0.06}s`,
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.3rem", flexShrink: 0,
      }}>{d.emoji}</div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#6366f1", letterSpacing: "0.1em" }}>DAY {d.day}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9", marginBottom: 4 }}>{d.title}</div>
        <div style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.55 }}>{d.desc}</div>
      </div>
    </div>
  );
}

function FaqItem({ item, i }: { item: typeof FAQ[0]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 8,
      animation: "fadeUp 0.5s ease both",
      animationDelay: `${i * 0.07}s`,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: open ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
          border: "none", cursor: "pointer",
          padding: "18px 22px", textAlign: "left",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: "#e2e8f0", fontFamily: "inherit", fontWeight: 600, fontSize: "0.9rem",
          transition: "background 0.2s",
        }}
      >
        <span>{item.q}</span>
        <span style={{ fontSize: "1.2rem", color: "#6366f1", transition: "transform 0.25s", transform: open ? "rotate(45deg)" : "none", flexShrink: 0, marginLeft: 12 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 18px", fontSize: "0.87rem", color: "#94a3b8", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ paddingTop: 14 }}>{item.a}</div>
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function PlulaiTunisiaPage() {
  const { days, hours, mins, secs } = useCountdown(DEADLINE);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Noto+Serif+Arabic:wght@700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #05050d; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);    opacity: 0.6; }
      100% { transform: scale(1.55); opacity: 0; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes spin-slow {
      to { transform: rotate(360deg); }
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0d0d1a; }
    ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }
  `;

  return (
    <>
      <style>{css}</style>

      {/* ── Sticky nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "14px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(5,5,13,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
          🚀 Plulai
        </div>
        <a
          href="#register"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", border: "none", borderRadius: 999,
            padding: "9px 22px", fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          }}
        >
          سجّل الآن · Register
        </a>
      </nav>

      {/* ── Background glows ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 600,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 500, height: 500,
          background: "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)", borderRadius: "50%" }} />
        {/* Tunisian red accent */}
        <div style={{ position: "absolute", top: "40%", left: "-8%", width: 400, height: 400,
          background: "radial-gradient(ellipse, rgba(220,38,38,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <main style={{ position: "relative", zIndex: 1, fontFamily: "'Space Grotesk', sans-serif", color: "#e2e8f0", overflowX: "hidden" }}>

        {/* ══════════ HERO ══════════ */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 20px 80px" }}>

          {/* Flag + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, animation: "fadeUp 0.6s ease both" }}>
            <span style={{ fontSize: "1.8rem", animation: "float 3s ease-in-out infinite" }}>🇹🇳</span>
            <div style={{
              background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 999, padding: "6px 16px",
              fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#f87171",
            }}>
              تونس · Tunisia · 2025
            </div>
          </div>

          {/* Arabic headline */}
          <h1 style={{
            fontFamily: "'Noto Serif Arabic', serif",
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
            color: "#fff",
            lineHeight: 1.4,
            marginBottom: 12,
            animation: "fadeUp 0.6s 0.08s ease both",
            direction: "rtl",
          }}>
            بطولة تونس للذكاء الاصطناعي للأطفال
          </h1>

          {/* English headline */}
          <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(1.2rem, 3.5vw, 1.9rem)",
            letterSpacing: "-0.02em",
            color: "#a5b4fc",
            marginBottom: 24,
            animation: "fadeUp 0.6s 0.14s ease both",
          }}>
            Tunisia AI Championship for Kids
          </h2>

          {/* Subline */}
          <p style={{
            maxWidth: 560, color: "#94a3b8", fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
            lineHeight: 1.75, marginBottom: 40,
            animation: "fadeUp 0.6s 0.2s ease both",
          }}>
            10 days · 100% online · Ages 6–18 · Only <strong style={{ color: "#fff" }}>10 DT</strong> to participate.<br />
            Learn AI from zero, build a real project, and win the prize. 🏆
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64, animation: "fadeUp 0.6s 0.26s ease both" }}>
            <a href="#register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", textDecoration: "none", borderRadius: 999,
              padding: "15px 32px", fontWeight: 800, fontSize: "1rem",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <span>🎯</span> سجّل الآن · Register Now
            </a>
            <a href="#schedule" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0", textDecoration: "none", borderRadius: 999,
              padding: "15px 28px", fontWeight: 600, fontSize: "0.95rem",
              transition: "background 0.2s",
            }}>
              <span>📅</span> See the 10 Days
            </a>
          </div>

          {/* Stats strip */}
          <div style={{
            display: "flex", gap: 0, flexWrap: "wrap", justifyContent: "center",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, overflow: "hidden",
            animation: "fadeUp 0.6s 0.32s ease both",
          }}>
            {[
              { val: "6–18", lab: "Age / السن" },
              { val: "10", lab: "Days / أيام" },
              { val: "10 DT", lab: "Entry fee / رسوم" },
              { val: "100%", lab: "Online / أونلاين" },
              { val: "🏆", lab: "Prize / جائزة" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "20px 28px", textAlign: "center",
                borderRight: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{ fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.5rem)", color: "#fff", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginTop: 4 }}>{s.lab}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ COUNTDOWN ══════════ */}
        <section style={{ padding: "0 20px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 24, padding: "40px 48px", textAlign: "center", width: "100%", maxWidth: 560,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: 16 }}>
              ⏰ Registration closes in · يغلق التسجيل خلال
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start" }}>
              <CountBlock value={days}  label="Days / أيام" />
              <div style={{ color: "#6366f1", fontWeight: 800, fontSize: "2rem", paddingTop: 4 }}>:</div>
              <CountBlock value={hours} label="Hrs / ساعات" />
              <div style={{ color: "#6366f1", fontWeight: 800, fontSize: "2rem", paddingTop: 4 }}>:</div>
              <CountBlock value={mins}  label="Min / دقائق" />
              <div style={{ color: "#6366f1", fontWeight: 800, fontSize: "2rem", paddingTop: 4 }}>:</div>
              <CountBlock value={secs}  label="Sec / ثواني" />
            </div>
            <div style={{ marginTop: 20, fontSize: "0.82rem", color: "#6b7280" }}>
              Deadline: June 15, 2025 · آخر موعد: 15 يونيو 2025
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section style={{ padding: "0 20px 100px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#6366f1", marginBottom: 12, textTransform: "uppercase" }}>كيف يعمل · How it works</div>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", letterSpacing: "-0.03em", color: "#fff" }}>3 Simple Steps</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { step: "01", emoji: "📝", title: "Register & Pay 10 DT", ar: "سجّل وادفع 10 دينار", desc: "Fill out the form below, pay 10 DT online, and receive your confirmation email instantly." },
              { step: "02", emoji: "💻", title: "Complete 10 Daily Lessons", ar: "أكمل 10 دروس يومية", desc: "Log in to Plulai each day. Each lesson takes 30–45 minutes. Build skills, earn XP, climb the leaderboard." },
              { step: "03", emoji: "🏆", title: "Submit & Win", ar: "قدّم مشروعك واربح", desc: "On Day 10, submit your AI project. A jury selects the top 3. The winner gets the prize!" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "32px 28px", position: "relative", overflow: "hidden",
                animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{ fontFamily: "monospace", fontSize: "3.5rem", fontWeight: 800, color: "rgba(99,102,241,0.1)", position: "absolute", top: 12, right: 20, lineHeight: 1 }}>{s.step}</div>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{s.emoji}</div>
                <div style={{ fontFamily: "'Noto Serif Arabic', serif", fontSize: "0.9rem", color: "#a5b4fc", marginBottom: 6, direction: "rtl" }}>{s.ar}</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ 10-DAY SCHEDULE ══════════ */}
        <section id="schedule" style={{ padding: "0 20px 100px", maxWidth: 900, margin: "0 auto", scrollMarginTop: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#6366f1", marginBottom: 12, textTransform: "uppercase" }}>البرنامج · Schedule</div>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", letterSpacing: "-0.03em", color: "#fff" }}>The 10 Days of AI</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: 12 }}>30–45 minutes per day · كل يوم 30 إلى 45 دقيقة</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {DAYS.map((d, i) => <DayCard key={d.day} d={d} i={i} />)}
          </div>
        </section>

        {/* ══════════ PRIZE ══════════ */}
        <section style={{ padding: "0 20px 100px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#6366f1", marginBottom: 16, textTransform: "uppercase" }}>الجائزة · Prize</div>

          <div style={{
            position: "relative", background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
            border: "1px solid rgba(99,102,241,0.3)", borderRadius: 28, padding: "52px 40px", overflow: "hidden",
          }}>
            {/* Pulse rings */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 140, height: 140,
              borderRadius: "50%", border: "2px solid rgba(99,102,241,0.15)", animation: "pulse-ring 2.5s ease-out infinite" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 100, height: 100,
              borderRadius: "50%", border: "2px solid rgba(99,102,241,0.2)", animation: "pulse-ring 2.5s 0.8s ease-out infinite" }} />

            <div style={{ fontSize: "4rem", marginBottom: 20, animation: "float 2.5s ease-in-out infinite", position: "relative" }}>🏆</div>

            <h3 style={{ fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Winner Takes It All
            </h3>
            <div style={{ fontFamily: "'Noto Serif Arabic', serif", fontSize: "1.1rem", color: "#a5b4fc", marginBottom: 24, direction: "rtl" }}>الفائز يحصل على كل شيء</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400, margin: "0 auto" }}>
              {[
                { icon: "🥇", text: "Official Trophy + Certificate / كأس رسمي وشهادة" },
                { icon: "🎓", text: "1-Year Free Plulai Pro / سنة مجانية على Plulai Pro" },
                { icon: "📢", text: "Featured on Plulai's social channels / ظهور على قنواتنا" },
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "14px 18px", textAlign: "left",
                }}>
                  <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{p.icon}</span>
                  <span style={{ fontSize: "0.87rem", color: "#e2e8f0" }}>{p.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, fontSize: "0.8rem", color: "#6b7280" }}>
              Top 3 finalists receive certificates · أفضل 3 مشاركين يحصلون على شهادات تقدير
            </div>
          </div>
        </section>

        {/* ══════════ FOR PARENTS ══════════ */}
        <section style={{ padding: "0 20px 100px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#6366f1", marginBottom: 12, textTransform: "uppercase" }}>للآباء · For Parents</div>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.5rem,4vw,2.2rem)", letterSpacing: "-0.02em", color: "#fff" }}>Why Let Your Child Join?</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {[
              { icon: "🔒", title: "100% Safe", ar: "آمن بالكامل", desc: "No social features, no chats with strangers. Kids learn in a closed, monitored environment." },
              { icon: "⏱️", title: "30–45 min/day", ar: "30–45 دقيقة يومياً", desc: "Short daily sessions that fit any school schedule. Designed to never overwhelm." },
              { icon: "📊", title: "Weekly Reports", ar: "تقارير أسبوعية", desc: "You receive a detailed progress email every week showing exactly what your child learned." },
              { icon: "🎯", title: "Real Skills", ar: "مهارات حقيقية", desc: "Python, AI concepts, logical thinking. Skills that schools don't yet teach — but employers demand." },
              { icon: "🏅", title: "Certificate", ar: "شهادة إتمام", desc: "Every participant who completes all 10 days receives an official completion certificate." },
              { icon: "💳", title: "Only 10 DT", ar: "10 دينار فقط", desc: "That is the cost of one coffee. No hidden fees, no monthly subscription required to participate." },
            ].map((c, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "24px 20px",
                animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s`,
              }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff", marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontFamily: "'Noto Serif Arabic', serif", fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 8, direction: "rtl" }}>{c.ar}</div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section style={{ padding: "0 20px 100px", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#6366f1", marginBottom: 12, textTransform: "uppercase" }}>أسئلة شائعة · FAQ</div>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.5rem,4vw,2.2rem)", letterSpacing: "-0.02em", color: "#fff" }}>Common Questions</h2>
          </div>
          {FAQ.map((f, i) => <FaqItem key={i} item={f} i={i} />)}
        </section>

        {/* ══════════ REGISTER FORM ══════════ */}
        <section id="register" style={{ padding: "0 20px 120px", maxWidth: 560, margin: "0 auto", scrollMarginTop: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#6366f1", marginBottom: 12, textTransform: "uppercase" }}>التسجيل · Registration</div>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.5rem,4vw,2.2rem)", letterSpacing: "-0.02em", color: "#fff" }}>Join the Competition</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginTop: 10 }}>انضم إلى البطولة — سجّل طفلك في 2 دقيقة</p>
          </div>

          <RegisterForm />
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "36px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          textAlign: "center",
        }}>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>🚀 Plulai</div>
          <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>AI Learning for Kids · تعلّم الذكاء الاصطناعي للأطفال</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="mailto:hello@plulai.com" style={{ fontSize: "0.8rem", color: "#6366f1", textDecoration: "none" }}>hello@plulai.com</a>
            <a href="https://plulai.com" style={{ fontSize: "0.8rem", color: "#6366f1", textDecoration: "none" }}>plulai.com</a>
          </div>
          <div style={{ fontSize: "0.72rem", color: "#374151" }}>© 2025 Plulai · All rights reserved</div>
        </footer>

      </main>
    </>
  );
}

// ── Registration Form ──────────────────────────────────────────────────────
// 👉 Paste your Google Apps Script Web App URL here after deploying it
const GOOGLE_SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbxFzXl8YbMAoN_W8vTwZ6I5ClzLFSwP6lUkVuNRe2VXTFilqReqM2Rc8ILffQRNcD7p/exec";

function RegisterForm() {
  const [form, setForm] = useState({ childName: "", age: "", parentName: "", email: "", phone: "", school: "", discount: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [discountStatus, setDiscountStatus] = useState<"idle" | "valid" | "invalid">("idle");

  // ── Discount codes — add/edit yours here ──────────────────────
  const DISCOUNT_CODES: Record<string, { label: string; off: number }> = {
    "SCHOOL10": { label: "School partner discount",  off: 10 },
    "PLULAI20": { label: "Early bird special",        off: 20 },
    "FREE100":  { label: "Full scholarship",          off: 100 },
  };

  const BASE_FEE = 10;
  const discountData = DISCOUNT_CODES[form.discount.trim().toUpperCase()];
  const finalFee = discountData ? Math.max(0, BASE_FEE - (BASE_FEE * discountData.off / 100)) : BASE_FEE;

  const checkDiscount = () => {
    const code = form.discount.trim().toUpperCase();
    if (!code) { setDiscountStatus("idle"); return; }
    setDiscountStatus(DISCOUNT_CODES[code] ? "valid" : "invalid");
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === "discount") setDiscountStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName:      form.childName,
          age:            form.age,
          parentName:     form.parentName,
          email:          form.email,
          phone:          form.phone || "—",
          school:         form.school || "—",
          discountCode:   form.discount.trim().toUpperCase() || "—",
          discountLabel:  discountData?.label || "—",
          finalFee:       `${finalFee} DT`,
          timestamp:      new Date().toISOString(),
          source:         "plulai-tunisia-page",
        }),
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Connection failed. Please try again or email us at hello@plulai.com");
    }
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
    padding: "14px 16px", color: "#e2e8f0", fontSize: "0.9rem",
    fontFamily: "'Space Grotesk', sans-serif", outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: 7, letterSpacing: "0.04em" };

  if (status === "success") return (
    <div style={{
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: 24, padding: "52px 32px", textAlign: "center",
      animation: "fadeUp 0.5s ease both",
    }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 20 }}>🎉</div>
      <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "#fff", marginBottom: 10 }}>You're registered!</div>
      <div style={{ fontFamily: "'Noto Serif Arabic', serif", color: "#86efac", fontSize: "1rem", marginBottom: 16, direction: "rtl" }}>تم تسجيلك بنجاح!</div>
      <div style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
        Your registration has been saved. ✅<br />
        We will send you the payment link (10 DT) at <strong style={{ color: "#e2e8f0" }}>hello@plulai.com</strong> within 24 hours.<br /><br />
        <span style={{ fontFamily: "'Noto Serif Arabic', serif", direction: "rtl", display: "block" }}>
          تم حفظ تسجيلك. سنرسل لك رابط الدفع (10 دينار) خلال 24 ساعة.
        </span>
      </div>
      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
        Reference: <span style={{ fontFamily: "monospace", color: "#a5b4fc" }}>PLU-TN-{Date.now().toString(36).toUpperCase()}</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 18,
    }}>
      {/* Error banner */}
      {status === "error" && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12, padding: "14px 18px", fontSize: "0.85rem", color: "#fca5a5",
        }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {/* Fee banner */}
      <div style={{
        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: 12, padding: "14px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>Entry Fee / رسوم الاشتراك</div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Pay after registering via payment link</div>
        </div>
        <div style={{ fontWeight: 800, fontSize: "1.5rem", color: "#a5b4fc" }}>10 DT</div>
      </div>

      <div>
        <label style={labelStyle}>Child's Full Name · اسم الطفل</label>
        <input required style={inputStyle} placeholder="e.g. Ahmed Ben Ali" value={form.childName} onChange={set("childName")}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
      </div>

      <div>
        <label style={labelStyle}>Child's Age · عمر الطفل</label>
        <select required style={{ ...inputStyle, appearance: "none" }} value={form.age} onChange={set("age")}>
          <option value="">Select age / اختر السن</option>
          {Array.from({ length: 13 }, (_, i) => i + 6).map(a => (
            <option key={a} value={a}>{a} years / {a} سنوات</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Parent / Guardian Name · اسم الوالد</label>
        <input required style={inputStyle} placeholder="e.g. Mohamed Ben Ali" value={form.parentName} onChange={set("parentName")}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
      </div>

      <div>
        <label style={labelStyle}>Email Address · البريد الإلكتروني</label>
        <input required type="email" style={inputStyle} placeholder="parent@email.com" value={form.email} onChange={set("email")}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
      </div>

      <div>
        <label style={labelStyle}>Phone Number (optional) · رقم الهاتف</label>
        <input style={inputStyle} placeholder="+216 XX XXX XXX" value={form.phone} onChange={set("phone")}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

      {/* ── School name ── */}
      <div>
        <label style={labelStyle}>
          🏫 School Name (optional) · اسم المدرسة
        </label>
        <input
          style={inputStyle}
          placeholder="e.g. Lycée de Sfax / مدرسة..."
          value={form.school}
          onChange={set("school")}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <div style={{ fontSize: "0.73rem", color: "#6b7280", marginTop: 6 }}>
          Enter your child's school to appear on the certificate · اختياري — يظهر على الشهادة
        </div>
      </div>

      {/* ── Discount code ── */}
      <div>
        <label style={labelStyle}>
          🎟️ Discount Code (optional) · كود التخفيض
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{
              ...inputStyle,
              borderColor: discountStatus === "valid"
                ? "rgba(34,197,94,0.5)"
                : discountStatus === "invalid"
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(255,255,255,0.1)",
              flex: 1,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "monospace",
            }}
            placeholder="e.g. SCHOOL10"
            value={form.discount}
            onChange={set("discount")}
            onFocus={e => (e.target.style.borderColor = "#6366f1")}
            onBlur={e => {
              checkDiscount();
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
            }}
            maxLength={20}
          />
          <button
            type="button"
            onClick={checkDiscount}
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 12, padding: "0 18px",
              color: "#a5b4fc", fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              whiteSpace: "nowrap", transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            Apply
          </button>
        </div>

        {/* Discount feedback */}
        {discountStatus === "valid" && discountData && (
          <div style={{
            marginTop: 10, background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10,
            padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: "#86efac", fontWeight: 700 }}>
                ✅ Code applied — {discountData.label}
              </div>
              <div style={{ fontSize: "0.73rem", color: "#6b7280", marginTop: 2 }}>
                تم تطبيق الكود بنجاح
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "#6b7280", textDecoration: "line-through" }}>10 DT</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#86efac" }}>{finalFee} DT</div>
            </div>
          </div>
        )}

        {discountStatus === "invalid" && (
          <div style={{
            marginTop: 10, background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10,
            padding: "10px 14px", fontSize: "0.82rem", color: "#fca5a5",
          }}>
            ❌ Invalid code — الكود غير صحيح. Try again or leave it blank.
          </div>
        )}
      </div>

      {/* ── Dynamic fee summary ── */}
      <div style={{
        background: discountStatus === "valid"
          ? "rgba(34,197,94,0.06)"
          : "rgba(99,102,241,0.06)",
        border: `1px solid ${discountStatus === "valid" ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)"}`,
        borderRadius: 12, padding: "14px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "all 0.3s ease",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>
            Total to Pay · المبلغ الإجمالي
          </div>
          <div style={{ fontSize: "0.73rem", color: "#6b7280", marginTop: 2 }}>
            {discountStatus === "valid"
              ? `Discount applied: -${discountData?.off}% · تم تطبيق الخصم`
              : "Paid after registration via payment link · يُدفع بعد التسجيل"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {discountStatus === "valid" && (
            <div style={{ fontSize: "0.75rem", color: "#6b7280", textDecoration: "line-through" }}>10 DT</div>
          )}
          <div style={{ fontWeight: 800, fontSize: "1.6rem", color: discountStatus === "valid" ? "#86efac" : "#a5b4fc" }}>
            {finalFee} DT
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          background: status === "loading" ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#fff", border: "none", borderRadius: 12, padding: "16px",
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1rem",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          boxShadow: "0 8px 28px rgba(99,102,241,0.35)",
          transition: "opacity 0.2s, transform 0.2s",
          marginTop: 4,
        }}
      >
        {status === "loading"
          ? "⏳ Registering..."
          : `🎯 Register & Pay ${finalFee} DT · سجّل الآن`}
      </button>

      <div style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center", lineHeight: 1.6 }}>
        By registering you confirm your child is aged 6–18 and agrees to Plulai's Terms.
        بالتسجيل تؤكد أن عمر طفلك بين 6 و 18 سنة.
      </div>
    </form>
  );
}