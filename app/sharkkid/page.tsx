"use client";

import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPOTS_TOTAL = 20;
const SPOTS_LEFT  = 17;

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYitrrHcoTEITl2xJadJZ1OPGd8qymD0_WGt8NqJp-O2spWmu7XkWIW6vm7ydCdc0K/exec";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Session      { session: string; title: string; desc: string }
interface Week         { num: string; title: string; twColor: string; twLight: string; twBorder: string; sessions: Session[]; deliverable: string }
interface FAQ          { q: string; a: string }
interface FormData     { parentName: string; childName: string; childAge: string; email: string; whatsapp: string; idea: string }
interface FormField    { label: string; placeholder: string; type: string; key: keyof FormData }
interface CountdownTime{ days: number; hours: number; mins: number; secs: number }
type SubmitStatus      = "idle" | "loading" | "success" | "error";

// ─── Data ─────────────────────────────────────────────────────────────────────

const WEEKS: Week[] = [
  {
    num: "01", title: "Build the Skills",
    twColor: "text-accent4", twLight: "bg-accent4/10", twBorder: "border-accent4/30",
    sessions: [
      { session: "Session 1", title: "What is Vibe Coding?",        desc: "Build your first AI-assisted app in Replit. No prior experience needed — you direct, AI codes." },
      { session: "Session 2", title: "Prompt Engineering",          desc: "The Prompt Olympics: compete to get the best AI output. Learn context, specificity and iteration." },
      { session: "Session 3", title: "Build Your First Real App",   desc: "App Sprint — 90 minutes to build a complete mini-app with v0, Lovable and Claude. Deploy and share the link." },
    ],
    deliverable: "A working app deployed and shared with your parents — built entirely by directing AI.",
  },
  {
    num: "02", title: "Build the Product",
    twColor: "text-accent3", twLight: "bg-accent3/10", twBorder: "border-accent3/30",
    sessions: [
      { session: "Session 4", title: "Python Foundations",          desc: "Detective Python — fix broken apps, understand what AI generates, write your first 10 lines independently." },
      { session: "Session 5", title: "Idea to Architecture",        desc: "The 3-Question Sprint: What problem? Who has it? What ONE feature proves it works? Sketch before you build." },
      { session: "Session 6", title: "Build Sprint 1 — Prototype",  desc: "Full 90-min build session on your real startup idea. Blocker checks every 30 min. 2-min demo at the end." },
    ],
    deliverable: "A working prototype of your actual startup MVP — functional enough to show someone what it does.",
  },
  {
    num: "03", title: "Build the Startup",
    twColor: "text-accent2", twLight: "bg-accent2/10", twBorder: "border-accent2/30",
    sessions: [
      { session: "Session 7", title: "Entrepreneurship Fundamentals", desc: "The Business Model Game — choose your revenue model and complete a one-page Business Model Canvas." },
      { session: "Session 8", title: "Validate Your Idea",            desc: "Live Validation Sprint — conduct 3 real interviews during the session using a 5-question framework." },
      { session: "Session 9", title: "Build Sprint 2 — Complete MVP", desc: "Implement validation feedback + start your Canva pitch deck (slides 1–3). Mini-rehearsal at the end." },
    ],
    deliverable: "Complete MVP + Business Model Canvas + first 3 pitch slides + validation report with real user quotes.",
  },
  {
    num: "04", title: "Pitch the Startup",
    twColor: "text-accent5", twLight: "bg-accent5/10", twBorder: "border-accent5/30",
    sessions: [
      { session: "Session 10", title: "The Art of the Investor Pitch", desc: "Pitch School — learn the 5-slide structure, complete your Canva deck, and deliver your first full pitch to the group." },
      { session: "Session 11", title: "Dress Rehearsal",               desc: "Full simulation of Demo Day. Investor Q&A practice. Filmed run-through. Final polish of product and deck." },
      { session: "Session 12", title: "DEMO DAY 🎤",                   desc: "Live 5-minute pitch to real investors in front of parents, guests and press. Awards ceremony. You earned this." },
    ],
    deliverable: "A 5-minute live investor pitch. A Sharkid certificate. A Plulai Pro subscription. A story for life.",
  },
];

const TOOLS = [
  { icon: "💻", name: "Replit",       desc: "Primary coding environment — browser-based, no install needed"    },
  { icon: "🎨", name: "v0 by Vercel", desc: "AI-powered UI builder — describe it and v0 generates the front end" },
  { icon: "🚀", name: "Lovable",      desc: "Full-stack app builder using natural language — most powerful for beginners" },
  { icon: "🤖", name: "Claude / ChatGPT", desc: "AI pair programmer and tutor — debug, brainstorm and build"   },
  { icon: "🔍", name: "Gemini",       desc: "Research, data analysis and startup validation exercises"          },
  { icon: "🎤", name: "Canva",        desc: "Pitch deck creation — visual storytelling for investor presentations" },
];

const AWARDS = [
  { icon: "🥇", title: "Best Overall Pitch",     desc: "Highest total score from the investor panel"               },
  { icon: "💡", title: "Most Creative Solution", desc: "Most original and surprising approach to the problem"       },
  { icon: "⚙️", title: "Best Technical Product", desc: "Most impressive product build — functionality and polish"   },
  { icon: "🔎", title: "Best Problem Solver",    desc: "Best problem identification and validation evidence"         },
  { icon: "📈", title: "Most Improved",          desc: "Biggest growth from session 1 to Demo Day (chosen by instructor)" },
  { icon: "❤️", title: "People's Choice",        desc: "Voted by parents in the room on Demo Day"                  },
];

const FAQS: FAQ[] = [
  { q: "What age is Sharkid for?",                    a: "Kids aged 11–17. The program runs two parallel tracks — Junior (11–13) and Senior (14–17) — so every student works at the right level of complexity." },
  { q: "Does my child need prior coding experience?", a: "Zero experience needed. Session 1 starts from absolute scratch using vibe coding tools. By session 3 they will have built and deployed a real working app." },
  { q: "Is it online or in-person?",                  a: "Fully in-person at a partnered training center in Dubai. 3 sessions per week, 4 hours each, over 1 month. A real classroom environment with real peers." },
  { q: "What language is the program in?",            a: "Bilingual — Arabic and English. Sessions are delivered in Arabic with full English support. Built specifically for GCC families." },
  { q: "How long are the sessions?",                  a: "4 hours per session, 3 sessions per week — 12 sessions total including Demo Day. That's 48 hours of intensive learning in one month." },
  { q: "When are the cohorts?",                       a: "Cohort 1 starts July 2026. Cohort 2 starts August 2026. Both cohorts are capped at 20 students. Applications close when spots fill." },
  { q: "What happens on Demo Day?",                   a: "Each student delivers a 5-minute live pitch to a panel of real investors, with parents and press in the audience. There's an awards ceremony, group photos, and every graduate receives a Plulai Pro subscription." },
  { q: "How much does it cost?",                      a: "AED 3,500 per student. This includes all 12 sessions, Plulai platform access throughout the bootcamp, Demo Day entry, and a completion certificate. No hidden fees." },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useCountdown(targetDate: string): CountdownTime {
  const [time, setTime] = useState<CountdownTime>({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[64px]">
      <div className="font-fredoka text-3xl md:text-4xl text-white bg-card border border-white/10 rounded-2xl px-4 py-3 mb-2 tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-muted text-xs font-bold uppercase tracking-widest">{label}</div>
    </div>
  );
}

function SpotBar({ left, total }: { left: number; total: number }) {
  const pct = ((total - left) / total) * 100;
  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-between mb-2 text-xs font-bold">
        <span className="text-accent2">{total - left} spots taken</span>
        <span className="text-accent4">{left} remaining</span>
      </div>
      <div className="bg-white/5 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent4 to-accent2 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function WeekCard({ week, open, onToggle }: { week: Week; open: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-card border rounded-3xl overflow-hidden transition-all ${open ? week.twBorder : "border-white/5"}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors ${open ? week.twLight : "hover:bg-white/5"}`}
      >
        <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${week.twLight} ${week.twColor} border ${week.twBorder} shrink-0`}>
          Week {week.num}
        </span>
        <span className="font-fredoka text-xl text-white flex-1">{week.title}</span>
        <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-transform ${week.twBorder} ${week.twColor} ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-3 mb-4 mt-1">
            {week.sessions.map((s, i) => (
              <div key={i} className={`${week.twLight} border-l-2 ${week.twBorder} rounded-2xl p-4`}>
                <div className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${week.twColor}`}>{s.session}</div>
                <div className="font-bold text-white text-sm mb-1">{s.title}</div>
                <div className="text-muted text-xs leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className={`${week.twLight} border ${week.twBorder} rounded-2xl p-4 flex items-center gap-3`}>
            <span className="text-lg">🏆</span>
            <div>
              <div className={`text-xs font-extrabold uppercase tracking-widest mb-0.5 ${week.twColor}`}>Week deliverable</div>
              <div className="text-white text-sm font-semibold">{week.deliverable}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ item }: { item: FAQ }) {
  return (
    <details className="bg-card border border-white/5 rounded-2xl group">
      <summary className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 cursor-pointer font-bold text-white list-none text-sm md:text-base">
        <span>{item.q}</span>
        <span className="text-muted group-open:rotate-180 transition-transform text-lg ml-3 shrink-0">▾</span>
      </summary>
      <p className="px-5 pb-4 md:px-6 md:pb-5 text-muted font-semibold text-sm leading-relaxed">{item.a}</p>
    </details>
  );
}

// ─── Google Sheets submission ──────────────────────────────────────────────────

async function submitToGoogleSheets(data: FormData): Promise<void> {
  const res = await fetch("/api/apply", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parentName: data.parentName,
      childName:  data.childName,
      childAge:   data.childAge,
      email:      data.email,
      whatsapp:   data.whatsapp,
      idea:       data.idea,
    }),
  });

  if (!res.ok) throw new Error("Server error: " + res.status);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Unknown error");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharkidPage() {
  const [openWeek,     setOpenWeek]     = useState<number>(0);
  const [scrolled,     setScrolled]     = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError,  setSubmitError]  = useState<string>("");
  const [formData,     setFormData]     = useState<FormData>({
    parentName: "", childName: "", childAge: "", email: "", whatsapp: "", idea: "",
  });

  const countdown = useCountdown("2026-07-01T09:00:00");
  const formRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });
  const setField = (key: keyof FormData, val: string) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!formData.parentName || !formData.childName || !formData.childAge || !formData.email || !formData.whatsapp) {
      setSubmitError("Please fill in all required fields."); return;
    }
    const age = parseInt(formData.childAge, 10);
    if (isNaN(age) || age < 11 || age > 17) {
      setSubmitError("Child's age must be between 11 and 17."); return;
    }
    setSubmitError("");
    setSubmitStatus("loading");
    try {
      await submitToGoogleSheets(formData);
      setSubmitStatus("success");
      setFormData({ parentName: "", childName: "", childAge: "", email: "", whatsapp: "", idea: "" });
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitStatus("error");
      setSubmitError("Something went wrong. Please email hello@plulai.com directly.");
    }
  };

  const formFields: FormField[] = [
    { label: "Parent full name", placeholder: "Your name",        type: "text",   key: "parentName" },
    { label: "Child's name",     placeholder: "Child's name",     type: "text",   key: "childName"  },
    { label: "Child's age",      placeholder: "Age (11–17)",      type: "number", key: "childAge"   },
    { label: "Your email",       placeholder: "your@email.com",   type: "email",  key: "email"      },
    { label: "WhatsApp number",  placeholder: "XX XXX XXXX", type: "tel",    key: "whatsapp"   },
  ];

  return (
    <div className="relative z-10 min-h-screen">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 lg:px-12 py-3 md:py-4 border-b transition-all ${scrolled ? "glass border-white/5" : "border-transparent bg-transparent"}`}>
        <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent4 bg-clip-text text-transparent flex items-center gap-2">
          Plulai
          <span className="text-xs font-extrabold bg-accent4/20 text-accent4 border border-accent4/30 rounded-full px-2 py-0.5">Sharkid</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          {(["Program","Curriculum","Demo Day","FAQ"] as const).map((l, i) => (
            <a key={l} href={["#program","#curriculum","#demo-day","#faq"][i]} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <button
          onClick={scrollToForm}
          className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent4/20"
        >
          Apply Now →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent2/10 border border-accent2/25 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold text-accent2 mb-6 md:mb-8">
          🦈 First in the Arab World · July 2026 · Dubai · In-Person
        </div>

        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-7xl leading-tight mb-5 md:mb-6">
          <span className="bg-gradient-to-r from-accent2 via-accent4 to-accent5 bg-clip-text text-transparent">
            Shark Tank.
          </span>
          <br />
          <span className="text-white">For Arab Kids. 🦈</span>
        </h1>

        <p className="text-muted text-base md:text-lg lg:text-xl font-semibold max-w-2xl mx-auto mb-3 leading-relaxed">
          A <strong className="text-white">1-month intensive bootcamp</strong> where kids aged 11–17 learn vibe coding,
          prompt engineering and entrepreneurship — then pitch their startup to{" "}
          <strong className="text-white">real investors</strong> on Demo Day.
        </p>
        <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
          In-person · Dubai · 3 sessions/week · 4 hours each · 48 hours total
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-16">
          <button
            onClick={scrollToForm}
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all animate-glow-pulse"
          >
            🚀 Apply for a Spot
          </button>
          <a
            href="#curriculum"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-muted bg-card border border-white/10 hover:text-white transition-all"
          >
            ▶ See the Curriculum
          </a>
        </div>

        <div className="flex flex-col items-center gap-3">
          <SpotBar left={SPOTS_LEFT} total={SPOTS_TOTAL} />
          <p className="text-muted text-xs font-bold">Only {SPOTS_LEFT} spots remaining · Cohort 1: July · Cohort 2: August</p>
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section className="py-10 px-4 border-y border-white/5 bg-card/50">
        <p className="text-center text-xs font-bold text-muted uppercase tracking-widest mb-6">Cohort 1 starts in</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <CountdownUnit value={countdown.days}  label="Days"    />
          <CountdownUnit value={countdown.hours} label="Hours"   />
          <CountdownUnit value={countdown.mins}  label="Minutes" />
          <CountdownUnit value={countdown.secs}  label="Seconds" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="program" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
          {([
            { num: "1",    label: "Month",          sub: "Intensive program"    },
            { num: "20",   label: "Spots only",     sub: "Max cohort size"      },
            { num: "12",   label: "Sessions",       sub: "3 per week × 4 hrs"  },
            { num: "48h",  label: "Learning",       sub: "Total contact hours"  },
            { num: "2",    label: "Cohorts",        sub: "July & August 2026"   },
            { num: "5+",   label: "Real investors", sub: "Judging on Demo Day"  },
          ] as const).map((s, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 text-center hover:border-white/15 transition-all">
              <div className="font-fredoka text-2xl md:text-3xl text-white mb-1">{s.num}</div>
              <div className="font-extrabold text-xs mb-0.5 text-white">{s.label}</div>
              <div className="text-muted text-xs font-bold">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section className="py-0 pb-16 md:pb-24 px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          3 Pillars. 1 Month. 🏆
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Every student leaves with three real skills — and a live pitch in front of investors to prove it.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {([
            { emoji: "💻", title: "Build",  subtitle: "Vibe Coding + AI Tools",    desc: "Students build real AI-powered apps using Replit, v0 and Lovable — without needing deep coding knowledge. They direct AI to write code.", color: "from-accent4/10 to-accent5/10", border: "border-accent4/30" },
            { emoji: "🚀", title: "Launch", subtitle: "Entrepreneurship Fundamentals", desc: "Problem identification, validation with real users, business model canvas, and MVP creation. Real startup methodology, simplified for 11–17.", color: "from-accent3/10 to-accent4/10", border: "border-accent3/30" },
            { emoji: "🎤", title: "Pitch",  subtitle: "Investor-Ready Presentation", desc: "A complete 5-slide pitch deck in Canva, delivered confidently to a live panel of real investors. In Arabic and/or English.", color: "from-accent2/10 to-accent3/10", border: "border-accent2/30" },
          ] as const).map((p, i) => (
            <div key={i} className={`bg-gradient-to-br ${p.color} border ${p.border} rounded-3xl p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-all`}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">{p.emoji}</div>
              <h3 className="font-fredoka text-xl md:text-2xl mb-1 text-white">{p.title}</h3>
              <p className="text-muted text-xs font-bold uppercase tracking-widest mb-3 md:mb-4">{p.subtitle}</p>
              <p className="text-muted text-sm font-semibold leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section id="curriculum" className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          4 Weeks. 12 Sessions. 🗓️
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Every session builds on the last. By session 12 your child has a working startup and has pitched it to real investors.
        </p>
        <div className="flex flex-col gap-4">
          {WEEKS.map((w, i) => (
            <WeekCard
              key={i} week={w}
              open={openWeek === i}
              onToggle={() => setOpenWeek(openWeek === i ? -1 : i)}
            />
          ))}
        </div>
      </section>

      {/* ── DEMO DAY ── */}
      <section id="demo-day" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Demo Day 🎤
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Session 12. The moment everything was built for. Every student delivers a live 5-minute pitch to real investors — in front of their parents, guests, and press.
        </p>

        {/* Schedule */}
        <div className="bg-card border border-white/5 rounded-3xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-fredoka text-xl text-white">Demo Day Schedule</h3>
          </div>
          <div className="divide-y divide-white/5">
            {([
              { time: "9:00 AM",  activity: "Doors open + student setup",      note: "Students set up laptops and products" },
              { time: "9:30 AM",  activity: "Welcome address",                 note: "Bootcamp story and what students achieved" },
              { time: "9:45 AM",  activity: "Student pitches begin",           note: "5-min pitch + 3-min investor Q&A per student" },
              { time: "11:45 AM", activity: "Investor deliberation",           note: "Students and parents networking during break" },
              { time: "12:00 PM", activity: "Awards ceremony",                 note: "6 awards presented by investors" },
              { time: "12:20 PM", activity: "Media and photos",                note: "Group photos, individual student moments filmed" },
              { time: "12:30 PM", activity: "Plulai subscription gifts",       note: "Every student receives 3-month Plulai Pro" },
              { time: "12:45 PM", activity: "Cohort 2 announcement",           note: "Open registration for August cohort" },
              { time: "1:00 PM",  activity: "Close",                           note: "Parent dashboard demo + networking" },
            ] as const).map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors">
                <span className="text-accent4 font-extrabold text-xs w-20 shrink-0 tabular-nums">{row.time}</span>
                <span className="text-white font-semibold text-sm flex-1">{row.activity}</span>
                <span className="text-muted text-xs font-semibold hidden sm:block text-right">{row.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <h3 className="font-fredoka text-2xl md:text-3xl text-center mb-6 text-white">The Awards 🏆</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {AWARDS.map((a, i) => (
            <div key={i} className="bg-gradient-to-br from-accent2/10 to-accent4/10 border border-accent2/20 rounded-3xl p-5 md:p-6 hover:-translate-y-1 transition-all">
              <div className="text-3xl mb-3">{a.icon}</div>
              <h4 className="font-fredoka text-lg text-white mb-1">{a.title}</h4>
              <p className="text-muted text-sm font-semibold leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTRUCTOR ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-accent4 mb-3">Your Instructor</p>
            <h2 className="font-fredoka text-3xl md:text-4xl mb-4">Built by someone who actually teaches kids</h2>
            <p className="text-muted font-semibold leading-relaxed mb-6 text-sm md:text-base">
              The founder of Plulai is a Python developer who has personally coached 250 young entrepreneurs —
              and then built an AI platform to scale that teaching to the entire GCC.
            </p>
            <ul className="space-y-3">
              {([
                { icon: "👨‍💻", text: "Python developer — builds real software"    },
                { icon: "👦",   text: "Coached 250 kids in entrepreneurship"       },
                { icon: "🤖",   text: "Built Plulai — 200+ AI-powered lessons"     },
                { icon: "🏢",   text: "Based at DTEC, Dubai Silicon Oasis"         },
                { icon: "🌍",   text: "Arab founder building for Arab kids"         },
              ] as const).map((c, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                  <span className="w-9 h-9 bg-card border border-white/10 rounded-xl flex items-center justify-center text-base shrink-0">{c.icon}</span>
                  <span className="text-white">{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-accent4/10 to-accent3/10 border border-accent4/20 rounded-3xl p-8 md:p-10 text-center">
            <div className="text-6xl mb-5">👨‍💻</div>
            <div className="font-fredoka text-2xl text-white mb-2">Plulai Founder</div>
            <div className="text-muted text-sm font-bold mb-6">Python Developer · EdTech Founder · DTEC Dubai</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {(["250 kids coached", "Python dev", "AI builder", "Arab founder"] as const).map((t) => (
                <span key={t} className="bg-accent4/20 text-accent4 border border-accent4/30 rounded-full px-3 py-1 text-xs font-extrabold">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">Simple, Honest Pricing 💛</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          One price. Everything included. No hidden fees.
        </p>
        <div className="bg-gradient-to-br from-accent4/10 to-accent5/10 border border-accent4/30 rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="text-sm font-extrabold uppercase tracking-widest text-accent4 mb-2">Full Program</div>
            <div className="font-fredoka text-5xl md:text-6xl text-white mb-2">AED 3,500</div>
            <div className="text-muted text-sm font-bold">per student · one-time payment</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {([
              "12 in-person sessions (48 hours)",
              "3 sessions per week × 4 hours",
              "Replit, v0, Lovable, Canva access",
              "Plulai platform for the full month",
              "Demo Day entry + investor judging",
              "Completion certificate",
              "3-month Plulai Pro subscription gift",
              "Parent progress dashboard",
            ] as const).map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-accent3 font-extrabold shrink-0">✓</span> {f}
              </div>
            ))}
          </div>
          <button
            onClick={scrollToForm}
            className="w-full py-4 rounded-xl font-extrabold text-lg text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent4/20"
          >
            Apply Now → 🦈
          </button>
          <p className="text-muted text-xs font-bold text-center mt-4 opacity-70">
            No payment needed to apply · We confirm your spot first
          </p>
        </div>

        {/* Cohorts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {([
            { label: "Cohort 1", date: "July 2026", spots: "17 spots left", color: "text-accent3", bg: "from-accent3/10 to-accent4/10", border: "border-accent3/30" },
            { label: "Cohort 2", date: "August 2026", spots: "20 spots available", color: "text-accent4", bg: "from-accent4/10 to-accent5/10", border: "border-accent4/30" },
          ] as const).map((c, i) => (
            <div key={i} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 text-center`}>
              <div className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${c.color}`}>{c.label}</div>
              <div className="font-fredoka text-xl text-white mb-1">{c.date}</div>
              <div className="text-muted text-xs font-bold">{c.spots}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">Questions Parents Ask</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg">Everything you need to know about Sharkid.</p>
        <div className="space-y-3 md:space-y-4">
          {FAQS.map((f, i) => <FAQItem key={i} item={f} />)}
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section ref={formRef} className="py-16 md:py-24 px-4 md:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl md:text-6xl mb-5 md:mb-6 animate-bounce-slow">🦈</div>
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-5">
            Claim Your Child&apos;s Spot
          </h2>
          <p className="text-muted font-semibold text-base md:text-lg mb-3">
            Only {SPOTS_LEFT} spots for Cohort 1 (July). We&apos;ll reply within 24 hours on WhatsApp.
          </p>
          <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
            No payment needed to apply · Arabic &amp; English · Ages 11–17 · In-person Dubai
          </p>

          {submitStatus === "success" ? (
            <div className="bg-gradient-to-br from-accent3/10 to-accent4/10 border border-accent3/30 rounded-3xl p-10 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="font-fredoka text-2xl text-white mb-3">Application received!</h3>
              <p className="text-muted font-semibold text-sm leading-relaxed">
                We&apos;ll be in touch within 24 hours on your WhatsApp and email. Your data is saved securely.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 text-left">
              {formFields.map((f) => (
                <div key={f.key} className="mb-4">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-muted mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={formData[f.key]}
                    onChange={(e) => setField(f.key, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold placeholder:text-white/20 outline-none focus:border-accent4/50 transition-colors"
                  />
                </div>
              ))}
              <div className="mb-4">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-muted mb-2">
                  Preferred cohort
                </label>
                <select
                  value={formData.idea.includes("August") ? "August" : "July"}
                  onChange={(e) => setField("idea", e.target.value === "August" ? "August 2026" : "July 2026")}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold outline-none focus:border-accent4/50 transition-colors"
                >
                  <option value="July" className="bg-gray-900">Cohort 1 — July 2026</option>
                  <option value="August" className="bg-gray-900">Cohort 2 — August 2026</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-muted mb-2">
                  What does your child want to build?{" "}
                  <span className="normal-case font-bold opacity-50">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your child's interests or startup idea..."
                  value={formData.idea.startsWith("July") || formData.idea.startsWith("August") ? "" : formData.idea}
                  onChange={(e) => setField("idea", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold placeholder:text-white/20 outline-none focus:border-accent4/50 transition-colors resize-y font-sans"
                />
              </div>

              {submitError && (
                <p className="text-red-400 text-xs font-bold mb-4">⚠️ {submitError}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitStatus === "loading"}
                className="w-full py-4 rounded-xl font-extrabold text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitStatus === "loading" ? "Submitting… ⏳" : "Apply for Sharkid → 🦈"}
              </button>

              <p className="text-muted text-xs font-bold text-center mt-4 opacity-70">
                We&apos;ll reply within 24 hours · No payment needed · {SPOTS_LEFT} spots left
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent4 bg-clip-text text-transparent mb-2">
                Plulai × Sharkid
              </div>
              <p className="text-muted text-xs font-bold max-w-xs leading-relaxed">
                The first Arabic startup bootcamp for kids in the GCC · July & August 2026 · Dubai
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-xs font-bold text-muted w-full md:w-auto">
              <div>
                <p className="text-white mb-3 font-extrabold">Program</p>
                <div className="space-y-2">
                  {(["Program","Curriculum","Demo Day","FAQ"] as const).map((l, i) => (
                    <a key={l} href={["#program","#curriculum","#demo-day","#faq"][i]} className="block hover:text-white transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Countries</p>
                <div className="space-y-2">
                  {["🇦🇪 UAE","🇸🇦 Saudi Arabia","🇶🇦 Qatar","🇰🇼 Kuwait","🇧🇭 Bahrain","🇴🇲 Oman"].map((c) => (
                    <p key={c}>{c}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-xs font-bold text-center md:text-left">
              © 2026 Plulai · Built with ❤️ in the UAE · The first Arabic startup bootcamp for kids.
            </p>
            <a href="mailto:hello@plulai.com" className="text-muted text-xs font-bold hover:text-white transition-colors">
              hello@plulai.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}