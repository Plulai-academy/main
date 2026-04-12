"use client";

import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPOTS_TOTAL = 20;
const SPOTS_LEFT  = 17;

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYitrrHcoTEITl2xJadJZ1OPGd8qymD0_WGt8NqJp-O2spWmu7XkWIW6vm7ydCdc0K/exec";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Week          { week: string; title: string; desc: string }
interface Month         { num: string; title: string; twColor: string; twLight: string; twBorder: string; weeks: Week[]; deliverable: string }
interface FAQ           { q: string; a: string }
interface FormData      { parentName: string; childName: string; childAge: string; email: string; whatsapp: string; idea: string }
interface FormField     { label: string; placeholder: string; type: string; key: keyof FormData }
interface CountdownTime { days: number; hours: number; mins: number; secs: number }
type SubmitStatus       = "idle" | "loading" | "success" | "error";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MONTHS: Month[] = [
  {
    num: "01", title: "Build the Skills",
    twColor: "text-accent4", twLight: "bg-accent4/10", twBorder: "border-accent4/30",
    weeks: [
      { week: "Week 1", title: "Vibe Coding",         desc: "Build your first app with AI in 60 minutes. No prior experience needed." },
      { week: "Week 2", title: "Prompt Engineering",  desc: "Learn to talk to AI like a pro. Create tools that do things for you." },
      { week: "Week 3", title: "Python Fundamentals", desc: "Add real logic to your apps. Connect Python to AI APIs." },
      { week: "Week 4", title: "Build Week",          desc: "Build your first complete prototype and choose your startup idea." },
    ],
    deliverable: "A working AI-powered app — presented live to the group.",
  },
  {
    num: "02", title: "Build the Startup",
    twColor: "text-accent3", twLight: "bg-accent3/10", twBorder: "border-accent3/30",
    weeks: [
      { week: "Week 5", title: "Problem Validation",  desc: "Find a real problem. Interview 5 real people. Validate with evidence." },
      { week: "Week 6", title: "Business Model",      desc: "How do startups make money? Build your one-page business canvas." },
      { week: "Week 7", title: "Build the MVP",       desc: "Vibe-code your actual startup product with AI as your co-founder." },
      { week: "Week 8", title: "Mid-Showcase",        desc: "Present your MVP to parents and guests. Collect real feedback." },
    ],
    deliverable: "Validated startup idea + working MVP + 5 real user interviews.",
  },
  {
    num: "03", title: "Pitch the Startup",
    twColor: "text-accent2", twLight: "bg-accent2/10", twBorder: "border-accent2/30",
    weeks: [
      { week: "Week 9",  title: "Pitch Craft",        desc: "What investors actually want. The 5-slide pitch that wins." },
      { week: "Week 10", title: "Pitch Refinement",   desc: "Handle tough questions. Confident delivery in Arabic and English." },
      { week: "Week 11", title: "Final Prep",         desc: "Full dress rehearsal. Investors confirmed. Media invited." },
      { week: "Week 12", title: "DEMO DAY 🎤",        desc: "Each founder pitches live to real investors in front of their parents." },
    ],
    deliverable: "A 5-minute live pitch to real investors. A certificate. A story for life.",
  },
];

const FAQS: FAQ[] = [
  { q: "What age is Sharkid for?",                   a: "Kids aged 11–17. The program adapts to each child's level — whether they have zero coding experience or have already built their first app." },
  { q: "Does my child need prior coding experience?", a: "No. Week 1 starts from absolute zero. By week 4 they will have built a working app using AI tools. The vibe coding approach means any motivated kid can build real things fast." },
  { q: "What language is the program in?",            a: "Bilingual — Arabic and English. Sessions are delivered in Arabic with full English support. Perfect for GCC families." },
  { q: "How long are the weekly sessions?",           a: "2 hours per week, online via Zoom. Plus in-person sessions for the Month 2 Mid-Showcase and the Month 3 Demo Day in Dubai." },
  { q: "Who teaches the program?",                    a: "The founder of Plulai — a Python developer who has personally coached 250 young entrepreneurs. Two guest sessions feature real investors and engineers from the Dubai tech ecosystem." },
  { q: "What happens on Demo Day?",                   a: "Each child delivers a 5-minute live pitch to a panel of real investors, with parents and guests in the audience. Every graduate receives a Sharkid completion certificate." },
  { q: "How much does it cost?",                      a: "Early founder price: AED 2,500 for the first 10 families. Full price: AED 3,500. Both include full platform access to Plulai for the duration of the bootcamp." },
  { q: "When does it start?",                         a: "July 2026. Applications close once 20 spots are filled." },
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

function MonthCard({ month, open, onToggle }: { month: Month; open: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-card border rounded-3xl overflow-hidden transition-all ${open ? month.twBorder : "border-white/5"}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors ${open ? month.twLight : "hover:bg-white/5"}`}
      >
        <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${month.twLight} ${month.twColor} border ${month.twBorder} shrink-0`}>
          Month {month.num}
        </span>
        <span className="font-fredoka text-xl text-white flex-1">{month.title}</span>
        <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-transform ${month.twBorder} ${month.twColor} ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 mt-1">
            {month.weeks.map((w, i) => (
              <div key={i} className={`${month.twLight} border-l-2 ${month.twBorder} rounded-2xl p-4`}>
                <div className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${month.twColor}`}>{w.week}</div>
                <div className="font-bold text-white text-sm mb-1">{w.title}</div>
                <div className="text-muted text-xs leading-relaxed">{w.desc}</div>
              </div>
            ))}
          </div>
          <div className={`${month.twLight} border ${month.twBorder} rounded-2xl p-4 flex items-center gap-3`}>
            <span className="text-lg">🏆</span>
            <div>
              <div className={`text-xs font-extrabold uppercase tracking-widest mb-0.5 ${month.twColor}`}>Month deliverable</div>
              <div className="text-white text-sm font-semibold">{month.deliverable}</div>
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
// Uses no-cors fetch — the request reaches Google even though we can't read the response.
// This means it NEVER throws, so we always show success after the await resolves.

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

  if (!res.ok) {
    throw new Error("Server error: " + res.status);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Unknown error");
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharkidPage() {
  const [openMonth,    setOpenMonth]    = useState<number>(0);
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
      setSubmitError("Please fill in all required fields.");
      return;
    }
    const age = parseInt(formData.childAge, 10);
    if (isNaN(age) || age < 11 || age > 17) {
      setSubmitError("Child's age must be between 11 and 17.");
      return;
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
          🦈 First in the Arab World · July 2026 · Dubai
        </div>

        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-7xl leading-tight mb-5 md:mb-6">
          <span className="bg-gradient-to-r from-accent2 via-accent4 to-accent5 bg-clip-text text-transparent">
            Shark Tank.
          </span>
          <br />
          <span className="text-white">For Arab Kids. 🦈</span>
        </h1>

        <p className="text-muted text-base md:text-lg lg:text-xl font-semibold max-w-2xl mx-auto mb-3 leading-relaxed">
          A <strong className="text-white">3-month bootcamp</strong> where kids aged 11–17 learn vibe coding,
          prompt engineering and entrepreneurship — then pitch their startup to{" "}
          <strong className="text-white">real investors</strong> on Demo Day.
        </p>
        <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
          Only {SPOTS_LEFT} spots for July 2026 · Online + Dubai in-person finale
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
          <p className="text-muted text-xs font-bold">Only {SPOTS_LEFT} spots remaining for July 2026</p>
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section className="py-10 px-4 border-y border-white/5 bg-card/50">
        <p className="text-center text-xs font-bold text-muted uppercase tracking-widest mb-6">Registration closes in</p>
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
            { num: "3",   label: "Months",         sub: "July → Sep 2026"   },
            { num: "20",  label: "Spots only",     sub: "First come served" },
            { num: "250", label: "Kids coached",   sub: "By your instructor"},
            { num: "12",  label: "Live sessions",  sub: "2h each week"      },
            { num: "1",   label: "Demo Day",       sub: "Live in Dubai"     },
            { num: "5+",  label: "Real investors", sub: "Judging your pitch"},
          ] as const).map((s, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 text-center hover:border-white/15 transition-all">
              <div className="font-fredoka text-2xl md:text-3xl text-white mb-1">{s.num}</div>
              <div className="font-extrabold text-xs mb-0.5 text-white">{s.label}</div>
              <div className="text-muted text-xs font-bold">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section id="curriculum" className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          3 Months. 3 Superpowers. 🏆
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Every session builds on the last. By week 12 your child has a working startup and has pitched it to real investors.
        </p>
        <div className="flex flex-col gap-4">
          {MONTHS.map((m, i) => (
            <MonthCard
              key={i} month={m}
              open={openMonth === i}
              onToggle={() => setOpenMonth(openMonth === i ? -1 : i)}
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
          The grand finale. Every child delivers a live 5-minute pitch to real investors — in front of their parents, guests, and press. Like Shark Tank. For real.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {([
            { icon: "🎤", title: "Live Pitch",       desc: "5-minute startup pitch to real investors",     color: "from-accent4/10 to-accent5/10", border: "border-accent4/20" },
            { icon: "💼", title: "Real Investors",   desc: "UAE and GCC investors on the judging panel",    color: "from-accent5/10 to-accent1/10", border: "border-accent5/20" },
            { icon: "👨‍👩‍👧", title: "Parents Invited", desc: "Watch your child pitch their startup live",     color: "from-accent3/10 to-accent4/10", border: "border-accent3/20" },
            { icon: "📰", title: "Press Coverage",   desc: "Media invited to cover the next generation",    color: "from-accent2/10 to-accent3/10", border: "border-accent2/20" },
            { icon: "🏆", title: "Awards Ceremony",  desc: "Best startup, best pitch, best innovation",     color: "from-accent1/10 to-accent2/10", border: "border-accent1/20" },
            { icon: "🎓", title: "Graduation",       desc: "Certificate + Plulai annual subscription gift", color: "from-accent4/10 to-accent3/10", border: "border-accent4/20" },
          ] as const).map((d, i) => (
            <div key={i} className={`bg-gradient-to-br ${d.color} border ${d.border} rounded-3xl p-6 md:p-7 hover:-translate-y-1 transition-all`}>
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">{d.icon}</div>
              <h3 className="font-fredoka text-lg md:text-xl mb-2 text-white">{d.title}</h3>
              <p className="text-muted text-sm font-semibold leading-relaxed">{d.desc}</p>
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
                { icon: "👨‍💻", text: "Python developer — builds real software" },
                { icon: "👦",   text: "Coached 250 kids in entrepreneurship"    },
                { icon: "🤖",   text: "Built Plulai — 200+ AI-powered lessons"  },
                { icon: "🏢",   text: "Based at DTEC, Dubai Silicon Oasis"      },
                { icon: "🌍",   text: "Arab founder building for Arab kids"      },
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
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">Simple, Honest Pricing 💛</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          One price. Everything included. No hidden fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {([
            { name: "Early Founder", price: "AED 2,500", sub: "First 10 families only", badge: "Save AED 1,000", color: "text-accent2", bg: "from-accent2/10 to-accent3/10", border: "border-accent2/30", btn: "from-accent2 to-accent3" },
            { name: "Full Price",    price: "AED 3,500", sub: "Spots 11–20",            badge: null,             color: "text-accent4", bg: "from-accent4/10 to-accent5/10", border: "border-accent4/30", btn: "from-accent4 to-accent5" },
          ] as const).map((p, i) => (
            <div key={i} className={`bg-gradient-to-br ${p.bg} border ${p.border} rounded-3xl p-6 md:p-8 relative`}>
              {p.badge && (
                <div className="absolute -top-3 right-5 bg-accent2 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                  {p.badge}
                </div>
              )}
              <div className={`text-sm font-extrabold uppercase tracking-widest mb-1 ${p.color}`}>{p.name}</div>
              <div className="font-fredoka text-4xl text-white mb-1">{p.price}</div>
              <div className="text-muted text-xs font-bold mb-6">{p.sub}</div>
              <ul className="space-y-2.5 mb-6">
                {(["Full 12-week curriculum","Weekly live sessions (2h)","Plulai platform access","Mid-showcase (in person)","Demo Day invitation","Completion certificate"] as const).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="text-accent3 font-extrabold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={scrollToForm}
                className={`w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r ${p.btn} hover:-translate-y-0.5 transition-all`}
              >
                Apply Now →
              </button>
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
            Only {SPOTS_LEFT} spots remaining for July 2026. We&apos;ll reply within 24 hours on WhatsApp.
          </p>
          <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
            No payment needed to apply · Arabic &amp; English · Ages 11–17
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
              <div className="mb-6">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-muted mb-2">
                  What does your child want to build?{" "}
                  <span className="normal-case font-bold opacity-50">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your child's interests or ideas..."
                  value={formData.idea}
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
                The first Arabic startup bootcamp for kids in the GCC · July 2026 · Dubai
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