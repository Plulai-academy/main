'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// ── Brand tokens ──────────────────────────────────────────────────────────────
// --blue-sky   #1CB0F6  primary
// --blue-cyan  #14D4F4  accent / glow
// --blue-deep  #2B70C9  dark blue
// --amber      #FAA918  warm CTA / XP
// --red        #D33131  urgency
// --grey-bg    #F5F5F5  section bg
// --grey-text  #6F6F6F  body muted

// ── Data ─────────────────────────────────────────────────────────────────────
const QUIZ_STEPS = [
  {
    id: 'age',
    question: "How old are you?",
    options: [
      { label: '6–8 years',   value: 'mini',   emoji: '🌱' },
      { label: '9–11 years',  value: 'junior', emoji: '🚀' },
      { label: '12–14 years', value: 'pro',    emoji: '⚡' },
      { label: '15–18 years', value: 'expert', emoji: '🔥' },
    ],
  },
  {
    id: 'interest',
    question: "What sounds most exciting?",
    options: [
      { label: 'Build apps & games', value: 'coding', emoji: '💻' },
      { label: 'AI & smart tech',    value: 'ai',     emoji: '🤖' },
      { label: 'Start a business',   value: 'bizz',   emoji: '💡' },
      { label: 'All of it!',         value: 'all',    emoji: '🏆' },
    ],
  },
  {
    id: 'goal',
    question: "What matters most to your parent?",
    options: [
      { label: 'Useful screen time', value: 'screen', emoji: '📱' },
      { label: 'Future career',      value: 'career', emoji: '💼' },
      { label: 'Real confidence',    value: 'conf',   emoji: '💪' },
      { label: 'Actual skills',      value: 'skills', emoji: '🛠️' },
    ],
  },
]
const TRACK_RESULT: Record<string, { title: string; desc: string; emoji: string }> = {
  coding: { emoji:'💻', title:'Coding Track',    desc:'Python, web dev & game design. First working program by week 2.' },
  ai:     { emoji:'🤖', title:'AI Track',        desc:'Build real AI — not just read about it. Your own ML project by month 2.' },
  bizz:   { emoji:'💡', title:'Startup Track',   desc:'Idea to investor pitch. GCC style. Win school competitions.' },
  all:    { emoji:'🏆', title:'Full Curriculum', desc:'All 3 tracks — the complete future-skills package for the GCC.' },
}
const PROJECTS = [
  { age:9,  flag:'🇦🇪', text:'A working calculator app in Python',    track:'Coding', weeks:3 },
  { age:11, flag:'🇸🇦', text:'An AI chatbot that answers school Qs',  track:'AI',     weeks:6 },
  { age:13, flag:'🇶🇦', text:'A startup pitch that won school finals', track:'Startup',weeks:8 },
  { age:10, flag:'🇰🇼', text:"A website for their mum's business",     track:'Coding', weeks:4 },
  { age:14, flag:'🇦🇪', text:'An ML model that sorts recycling photos',track:'AI',     weeks:7 },
  { age:12, flag:'🇧🇭', text:'A fully-pitched mobile app to VCs',      track:'Startup',weeks:9 },
]
const TESTIMONIALS = [
  { name:'Ahmed K.',  age:13, flag:'🇦🇪 Dubai',    text:'I built my first AI chatbot in 2 weeks. My teacher shared it with the whole class.', streak:47, avatar:'🧑‍💻' },
  { name:'Sara M.',   age:10, flag:'🇸🇦 Riyadh',   text:'21-day streak! I learn every night instead of watching YouTube. My parents love it.', streak:21, avatar:'👩‍🎨' },
  { name:'Yousef A.', age:15, flag:'🇶🇦 Doha',     text:'The AI explains things like a friend. I ask the same question 5 times and it never gets frustrated.', streak:38, avatar:'🧑‍🚀' },
  { name:'Nour R.',   age:11, flag:'🇰🇼 Kuwait',   text:'I won my school startup competition. The judges said they could not believe an 11-year-old made that pitch.', streak:33, avatar:'🦸' },
  { name:'Lina K.',   age:9,  flag:'🇧🇭 Bahrain',  text:"I made a real website for my mum's shop. She showed all her friends. I almost cried.", streak:19, avatar:'👩‍💻' },
]
const FAQ = [
  { q:'Is Plulai really free?',            a:'Yes — genuinely free, forever. No credit card, no expiry. The free plan covers the first module of every track. Upgrade to Pro anytime.' },
  { q:'What ages is it designed for?',     a:'Ages 6–18. The platform auto-adapts: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) each get age-appropriate content and pacing.' },
  { q:'Does it really support Arabic?',    a:'Real Arabic — not Google Translate. Full RTL interface and an AI coach that teaches natively in Arabic. The only edtech platform built region-first for the GCC.' },
  { q:'How long are the lessons?',         a:'15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson a day — most kids end up doing two.' },
  { q:'How is it different from Scratch?', a:'Scratch is a great starter — Plulai goes further. Personal AI coach that adapts to your child, Arabic support, GCC cultural context, and a real project portfolio.' },
  { q:'Is it safe for my child?',          a:'100% safe. No ads, ever. AI responses filtered for child safety. Parents get weekly progress emails. Your child\'s data is never sold.' },
]

// ── Quiz ──────────────────────────────────────────────────────────────────────
function Quiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string,string>>({})
  const [selected, setSelected] = useState<string|null>(null)
  const q = QUIZ_STEPS[step - 1]
  const result = TRACK_RESULT[answers.interest ?? 'coding']

  function next() {
    if (!selected) return
    setAnswers(a => ({ ...a, [q.id]: selected }))
    setSelected(null)
    setStep(s => s < QUIZ_STEPS.length ? s + 1 : 4)
  }

  if (step === 0) return (
    <div style={{ textAlign:'center', padding:'8px 0' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>🎯</div>
      <h3 style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'1.25rem', color:'#fff', marginBottom:10 }}>
        Find your perfect track
      </h3>
      <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', marginBottom:24, fontWeight:600 }}>
        3 questions · 30 seconds · personalised for you
      </p>
      <button onClick={() => setStep(1)} style={{
        background:'#FAA918', color:'#fff', border:'none',
        borderRadius:12, padding:'13px 32px',
        fontFamily:'var(--f)', fontWeight:800, fontSize:'0.95rem',
        cursor:'pointer', boxShadow:'0 4px 16px rgba(250,169,24,0.4)',
        transition:'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(250,169,24,0.5)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(250,169,24,0.4)' }}
      >
        Let&apos;s go →
      </button>
    </div>
  )

  if (step === 4) return (
    <div style={{ textAlign:'center', padding:'8px 0' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🎉</div>
      <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.68rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Your track</p>
      <div style={{ background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:16, padding:'18px 20px', marginBottom:20 }}>
        <div style={{ fontSize:'2rem', marginBottom:6 }}>{result.emoji}</div>
        <div style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'1.05rem', color:'#fff', marginBottom:6 }}>{result.title}</div>
        <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', fontWeight:600, lineHeight:1.5 }}>{result.desc}</div>
      </div>
      <Link href="/auth/signup" style={{
        display:'block', background:'#FAA918', color:'#fff',
        borderRadius:12, padding:'13px', fontFamily:'var(--f)', fontWeight:800,
        fontSize:'0.95rem', textDecoration:'none', marginBottom:12,
        boxShadow:'0 4px 16px rgba(250,169,24,0.35)',
      }}>
        Start free now →
      </Link>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
        style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', cursor:'pointer', fontWeight:700 }}>
        Retake quiz
      </button>
    </div>
  )

  const pct = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {QUIZ_STEPS.map((_,i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:999,
            background: i < step ? '#FAA918' : 'rgba(255,255,255,0.2)',
            transition:'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'1rem', color:'#fff', marginBottom:14 }}>{q.question}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {q.options.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
            textAlign:'left', borderRadius:12, padding:'14px 12px',
            border: `2px solid ${selected === opt.value ? '#FAA918' : 'rgba(255,255,255,0.15)'}`,
            background: selected === opt.value ? 'rgba(250,169,24,0.15)' : 'rgba(255,255,255,0.06)',
            cursor:'pointer', transition:'all 0.15s',
          }}>
            <div style={{ fontSize:'1.4rem', marginBottom:5 }}>{opt.emoji}</div>
            <div style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'0.82rem',
              color: selected === opt.value ? '#FAA918' : 'rgba(255,255,255,0.85)', lineHeight:1.2 }}>
              {opt.label}
            </div>
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected} style={{
        width:'100%', padding:'13px', borderRadius:12, border:'none',
        fontFamily:'var(--f)', fontWeight:800, fontSize:'0.95rem',
        cursor: selected ? 'pointer' : 'not-allowed',
        background: selected ? '#FAA918' : 'rgba(255,255,255,0.1)',
        color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
        boxShadow: selected ? '0 4px 16px rgba(250,169,24,0.35)' : 'none',
        transition:'all 0.15s',
      }}>
        {step === QUIZ_STEPS.length ? 'See my track →' : 'Continue →'}
      </button>
    </div>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        setVal(Math.floor(p * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{val.toLocaleString()}</span>
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number|null>(null)
  const [liveCount, setLiveCount] = useState(1247)

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', s, { passive: true })
    return () => window.removeEventListener('scroll', s)
  }, [])
  useEffect(() => {
    const id = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3)), 7000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        :root {
          --f:       'Plus Jakarta Sans', sans-serif;
          --sky:     #1CB0F6;
          --cyan:    #14D4F4;
          --deep:    #2B70C9;
          --amber:   #FAA918;
          --red:     #D33131;
          --bg:      #F5F5F5;
          --muted:   #6F6F6F;
          --ink:     #111111;
          --white:   #ffffff;
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html  { scroll-behavior:smooth; }
        body  { background:var(--white); color:var(--ink); font-family:var(--f); overflow-x:hidden; }

        /* ── Utility ── */
        .w { max-width:1160px; margin:0 auto; padding:0 24px; }
        .sr { font-size:0; position:absolute; }

        /* ── Buttons ── */
        .btn {
          display:inline-flex; align-items:center; gap:8px;
          font-family:var(--f); font-weight:800; font-size:1rem;
          border:none; border-radius:14px; cursor:pointer;
          text-decoration:none; transition:transform 0.18s, box-shadow 0.18s;
          letter-spacing:-0.01em;
        }
        .btn:hover  { transform:translateY(-2px); }
        .btn:active { transform:translateY(1px); }

        .btn-primary {
          background: linear-gradient(135deg, var(--sky), var(--deep));
          color:#fff; padding:15px 36px;
          box-shadow:0 6px 24px rgba(28,176,246,0.35);
        }
        .btn-primary:hover { box-shadow:0 10px 32px rgba(28,176,246,0.45); }

        .btn-amber {
          background: var(--amber);
          color:#fff; padding:15px 36px;
          box-shadow:0 6px 24px rgba(250,169,24,0.35);
        }
        .btn-amber:hover { box-shadow:0 10px 32px rgba(250,169,24,0.45); }

        .btn-ghost {
          background:transparent; color:var(--deep);
          border:2px solid var(--sky); padding:13px 34px;
        }
        .btn-ghost:hover { background:rgba(28,176,246,0.06); }

        .btn-sm { padding:10px 22px; font-size:0.85rem; border-radius:10px; }

        /* ── Nav ── */
        .nav {
          position:fixed; top:0; left:0; right:0; z-index:900;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 32px;
          transition:background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .nav.scrolled {
          background:rgba(255,255,255,0.97);
          border-bottom:1px solid rgba(28,176,246,0.15);
          box-shadow:0 2px 24px rgba(28,176,246,0.08);
          backdrop-filter:blur(12px);
        }
        .nav-logo {
          font-family:var(--f); font-weight:800; font-size:1.45rem;
          color:var(--deep); text-decoration:none; letter-spacing:-0.03em;
          display:flex; align-items:center; gap:8px;
        }
        .nav-logo span { color:var(--sky); }
        .nav-links { display:flex; align-items:center; gap:6px; }
        .nav-link {
          font-family:var(--f); font-weight:700; font-size:0.85rem;
          color:var(--muted); text-decoration:none; padding:8px 14px; border-radius:10px;
          transition:color 0.15s, background 0.15s;
        }
        .nav-link:hover { color:var(--ink); background:var(--bg); }

        /* ── Hero ── */
        .hero { padding:136px 24px 96px; }
        .hero-inner { max-width:1160px; margin:0 auto; display:grid; grid-template-columns:1fr 480px; gap:72px; align-items:center; }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(28,176,246,0.08); border:1.5px solid rgba(28,176,246,0.25);
          border-radius:999px; padding:6px 16px;
          font-size:0.8rem; font-weight:800; color:var(--deep);
          margin-bottom:24px; letter-spacing:0.01em;
        }
        .live-dot {
          width:7px; height:7px; border-radius:50%; background:var(--sky);
          animation:blink 1.8s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero h1 {
          font-family:var(--f); font-weight:800;
          font-size:clamp(2.6rem,4.5vw,3.8rem);
          line-height:1.1; letter-spacing:-0.035em;
          color:var(--ink); margin-bottom:22px;
        }
        .hero h1 .hl {
          background:linear-gradient(90deg, var(--sky), var(--cyan));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .hero-sub {
          font-size:1.05rem; color:var(--muted); font-weight:600;
          line-height:1.7; margin-bottom:36px; max-width:520px;
        }
        .hero-btns { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:36px; }
        .trust-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip {
          background:var(--bg); border:1.5px solid #e0e0e0; border-radius:999px;
          padding:5px 14px; font-size:0.76rem; font-weight:700; color:var(--muted);
        }

        /* ── Hero card (right side) ── */
        .hero-card {
          background:linear-gradient(145deg, var(--deep) 0%, #1a4fa8 100%);
          border-radius:28px; padding:28px;
          box-shadow:0 32px 80px rgba(43,112,201,0.3), 0 0 0 1px rgba(255,255,255,0.08) inset;
          position:relative; overflow:hidden;
        }
        .hero-card::before {
          content:''; position:absolute; top:-60px; right:-60px;
          width:200px; height:200px; border-radius:50%;
          background:radial-gradient(circle, rgba(20,212,244,0.25), transparent 70%);
        }
        .card-profile {
          display:flex; align-items:center; gap:12px; margin-bottom:20px;
          background:rgba(255,255,255,0.08); border-radius:14px; padding:14px;
        }
        .avatar {
          width:48px; height:48px; border-radius:12px;
          background:rgba(255,255,255,0.15); display:flex;
          align-items:center; justify-content:center; font-size:1.6rem; flex-shrink:0;
        }
        .profile-name { font-weight:800; font-size:0.95rem; color:#fff; }
        .streak-pill {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(250,169,24,0.2); border:1.5px solid rgba(250,169,24,0.4);
          border-radius:999px; padding:3px 10px;
          font-size:0.72rem; font-weight:800; color:#FAA918; margin-top:4px;
        }
        .skill-row { margin-bottom:10px; }
        .skill-label {
          display:flex; justify-content:space-between;
          font-size:0.78rem; font-weight:700; color:rgba(255,255,255,0.75); margin-bottom:5px;
        }
        .skill-track {
          height:8px; border-radius:999px; background:rgba(255,255,255,0.12); overflow:hidden;
        }
        .skill-fill { height:100%; border-radius:999px; transition:width 1.2s ease; }
        .badge-row {
          display:flex; align-items:center; gap:10px;
          background:rgba(250,169,24,0.12); border:1.5px solid rgba(250,169,24,0.25);
          border-radius:14px; padding:12px 14px; margin-top:16px;
        }
        .badge-icon { font-size:1.8rem; }
        .badge-title { font-weight:800; font-size:0.82rem; color:#fff; }
        .badge-sub   { font-size:0.72rem; color:rgba(255,255,255,0.6); font-weight:600; }

        /* ── Section titles ── */
        .sec { padding:88px 24px; }
        .sec-label {
          font-size:0.7rem; font-weight:800; letter-spacing:0.16em;
          text-transform:uppercase; color:var(--sky); margin-bottom:12px;
        }
        .sec-title {
          font-family:var(--f); font-weight:800;
          font-size:clamp(1.8rem,3.5vw,2.8rem);
          letter-spacing:-0.03em; line-height:1.15; color:var(--ink);
          margin-bottom:14px;
        }
        .sec-sub { font-size:1rem; color:var(--muted); font-weight:600; line-height:1.65; }

        /* ── Marquee ── */
        .marquee-wrap { background:var(--deep); padding:18px 0; overflow:hidden; }
        .marquee-track { display:flex; width:max-content; animation:marquee 28s linear infinite; }
        .marquee-item {
          display:flex; align-items:center; gap:10px; padding:0 28px;
          font-family:var(--f); font-size:0.82rem; font-weight:700;
          white-space:nowrap; color:rgba(255,255,255,0.6);
        }
        .marquee-item.hi { color:#14D4F4; }
        .marquee-dot { color:rgba(255,255,255,0.2); }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* ── Stats ── */
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:#e8e8e8; border:1px solid #e8e8e8; border-radius:20px; overflow:hidden; }
        .stat-cell { background:#fff; padding:36px 28px; text-align:center; }
        .stat-val { font-family:var(--f); font-weight:800; font-size:2.4rem; letter-spacing:-0.04em; line-height:1; margin-bottom:6px; background:linear-gradient(135deg,var(--sky),var(--deep)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .stat-lbl { font-size:0.8rem; font-weight:700; color:var(--muted); }

        /* ── Tracks ── */
        .tracks-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .track-card {
          border-radius:24px; padding:32px;
          border:2px solid transparent;
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .track-card:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(0,0,0,0.08); }
        .track-icon { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin-bottom:18px; }
        .track-title { font-family:var(--f); font-weight:800; font-size:1.2rem; margin-bottom:4px; }
        .track-sub   { font-size:0.72rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:14px; }
        .track-badge { display:inline-block; border-radius:8px; padding:5px 12px; font-size:0.76rem; font-weight:800; margin-bottom:14px; }
        .track-desc  { font-size:0.88rem; color:var(--muted); font-weight:600; line-height:1.65; margin-bottom:16px; }
        .skill-tags  { display:flex; flex-wrap:wrap; gap:6px; }
        .skill-tag   { border-radius:999px; padding:3px 12px; font-size:0.72rem; font-weight:700; }

        /* ── How it works ── */
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; position:relative; }
        .step-card { background:#fff; border:2px solid #eee; border-radius:22px; padding:30px; transition:border-color 0.2s, box-shadow 0.2s; }
        .step-card:hover { border-color:var(--sky); box-shadow:0 12px 32px rgba(28,176,246,0.1); }
        .step-num { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--sky),var(--deep)); display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; font-size:0.9rem; margin-bottom:16px; }
        .step-emoji { font-size:2.2rem; margin-bottom:12px; }
        .step-title { font-family:var(--f); font-weight:800; font-size:1rem; margin-bottom:8px; }
        .step-desc  { font-size:0.85rem; color:var(--muted); font-weight:600; line-height:1.65; margin-bottom:14px; }
        .step-time  { display:inline-block; background:rgba(28,176,246,0.08); border:1.5px solid rgba(28,176,246,0.2); border-radius:999px; padding:3px 12px; font-size:0.72rem; font-weight:800; color:var(--deep); }
        .step-arrow { position:absolute; top:50%; font-size:1.4rem; color:#d8e8f8; font-weight:900; transform:translateY(-50%); }

        /* ── Projects ── */
        .projects-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .project-card { background:#fff; border:2px solid #eee; border-radius:18px; padding:22px; transition:transform 0.18s, border-color 0.18s; }
        .project-card:hover { transform:translateY(-3px); border-color:rgba(28,176,246,0.4); }
        .project-tag { display:inline-block; border-radius:999px; padding:3px 12px; font-size:0.7rem; font-weight:800; margin-bottom:10px; }
        .project-text { font-size:0.9rem; font-weight:700; color:var(--ink); line-height:1.45; margin-bottom:10px; }
        .project-meta { font-size:0.75rem; color:var(--muted); font-weight:700; }

        /* ── Testimonials ── */
        .testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .testi-card { background:#fff; border:2px solid #eee; border-radius:22px; padding:26px; transition:border-color 0.2s; }
        .testi-card:hover { border-color:rgba(28,176,246,0.3); }
        .testi-stars { color:var(--amber); font-size:0.9rem; margin-bottom:10px; }
        .testi-text  { font-size:0.88rem; color:var(--ink); font-weight:600; line-height:1.7; margin-bottom:18px; font-style:italic; }
        .testi-author { display:flex; align-items:center; gap:10px; }
        .testi-avatar { width:40px; height:40px; border-radius:12px; background:rgba(28,176,246,0.1); border:2px solid rgba(28,176,246,0.2); display:flex; align-items:center; justify-content:center; font-size:1.3rem; }
        .testi-name  { font-weight:800; font-size:0.84rem; }
        .testi-info  { font-size:0.74rem; color:var(--muted); font-weight:700; }

        /* ── GCC ── */
        .gcc-section { background:linear-gradient(160deg, var(--deep) 0%, #0f2d6e 100%); }
        .gcc-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; margin-bottom:36px; }
        .gcc-card { background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.1); border-radius:16px; padding:18px 10px; text-align:center; transition:background 0.2s; }
        .gcc-card:hover { background:rgba(20,212,244,0.12); border-color:rgba(20,212,244,0.3); }
        .gcc-flag { font-size:2.2rem; margin-bottom:8px; }
        .gcc-name { font-size:0.78rem; font-weight:800; color:#fff; margin-bottom:3px; }
        .gcc-city { font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:600; }
        .gcc-features { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .gcc-feat { background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.1); border-radius:18px; padding:24px; }
        .gcc-feat-icon { font-size:1.8rem; margin-bottom:10px; }
        .gcc-feat-title { font-weight:800; font-size:1rem; color:#fff; margin-bottom:6px; }
        .gcc-feat-desc  { font-size:0.84rem; color:rgba(255,255,255,0.55); font-weight:600; line-height:1.6; }

        /* ── Quiz section ── */
        .quiz-section { background:linear-gradient(135deg,var(--sky) 0%,var(--deep) 100%); }
        .quiz-inner { max-width:1000px; margin:0 auto; display:grid; grid-template-columns:1fr 400px; gap:64px; align-items:center; }
        .quiz-card { background:rgba(255,255,255,0.08); border:2px solid rgba(255,255,255,0.15); border-radius:24px; padding:28px; backdrop-filter:blur(8px); }

        /* ── Pricing ── */
        .pricing-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:860px; margin:0 auto; }
        .price-card { border-radius:24px; padding:36px; }
        .price-card.featured { background:linear-gradient(145deg,var(--deep),#1a4fa8); box-shadow:0 24px 64px rgba(43,112,201,0.3); }
        .price-card.plain    { background:#fff; border:2px solid #eee; }
        .price-label { font-size:0.7rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:14px; }
        .price-name  { font-family:var(--f); font-weight:800; font-size:1.3rem; margin-bottom:6px; }
        .price-amount { font-family:var(--f); font-weight:800; font-size:3.2rem; letter-spacing:-0.04em; line-height:1; margin-bottom:4px; }
        .price-period { font-size:0.8rem; font-weight:700; margin-bottom:28px; }
        .price-feature { display:flex; align-items:center; gap:10px; margin-bottom:11px; font-size:0.87rem; font-weight:600; }
        .check-icon { width:20px; height:20px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; flex-shrink:0; font-weight:900; }

        /* ── FAQ ── */
        .faq-item { border:2px solid #eee; border-radius:18px; margin-bottom:10px; overflow:hidden; transition:border-color 0.2s; }
        .faq-item.open { border-color:rgba(28,176,246,0.4); }
        .faq-q { width:100%; background:#fff; border:none; padding:20px 24px; font-family:var(--f); font-weight:700; font-size:0.95rem; color:var(--ink); cursor:pointer; display:flex; justify-content:space-between; align-items:center; text-align:left; transition:background 0.15s; }
        .faq-q:hover { background:rgba(28,176,246,0.03); }
        .faq-icon { width:28px; height:28px; border-radius:8px; background:rgba(28,176,246,0.1); display:flex; align-items:center; justify-content:center; color:var(--sky); font-size:1.1rem; font-weight:900; transition:transform 0.2s, background 0.2s; flex-shrink:0; margin-left:16px; }
        .faq-icon.open { background:var(--sky); color:#fff; transform:rotate(45deg); }
        .faq-a { padding:0 24px 20px; font-size:0.88rem; color:var(--muted); line-height:1.7; font-weight:600; }

        /* ── Final CTA ── */
        .cta-section { background:var(--bg); padding:96px 24px; text-align:center; }
        .cta-box { max-width:680px; margin:0 auto; }

        /* ── Footer ── */
        .footer { background:var(--ink); padding:60px 24px 32px; }
        .footer-grid { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
        .footer-brand { font-family:var(--f); font-weight:800; font-size:1.3rem; color:#fff; margin-bottom:10px; }
        .footer-tagline { font-size:0.82rem; color:rgba(255,255,255,0.35); font-weight:600; line-height:1.6; max-width:220px; }
        .footer-col-title { font-size:0.72rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:14px; }
        .footer-link { display:block; font-size:0.84rem; color:rgba(255,255,255,0.35); font-weight:600; text-decoration:none; margin-bottom:9px; transition:color 0.15s; }
        .footer-link:hover { color:rgba(255,255,255,0.9); }
        .footer-bottom { border-top:1px solid rgba(255,255,255,0.07); padding-top:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .footer-copy { font-size:0.78rem; color:rgba(255,255,255,0.2); font-weight:600; }

        /* ── Responsive ── */
        @media (max-width:900px) {
          .hero-inner   { grid-template-columns:1fr !important; }
          .hero-card    { display:none; }
          .tracks-grid  { grid-template-columns:1fr !important; }
          .steps-grid   { grid-template-columns:1fr !important; }
          .projects-grid{ grid-template-columns:1fr 1fr !important; }
          .testi-grid   { grid-template-columns:1fr !important; }
          .quiz-inner   { grid-template-columns:1fr !important; }
          .gcc-grid     { grid-template-columns:repeat(3,1fr) !important; }
          .gcc-features { grid-template-columns:1fr !important; }
          .pricing-grid { grid-template-columns:1fr !important; }
          .footer-grid  { grid-template-columns:1fr 1fr !important; }
          .stats-grid   { grid-template-columns:1fr 1fr !important; }
          .hide-m       { display:none !important; }
          .step-arrow   { display:none !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/" className="nav-logo">🚀 <span>Plu</span>lai</a>
        <div className="nav-links">
          <a href="#tracks"  className="nav-link hide-m">Tracks</a>
          <a href="#stories" className="nav-link hide-m">Stories</a>
          <a href="#gcc"     className="nav-link hide-m">GCC</a>
          <a href="#faq"     className="nav-link hide-m">FAQ</a>
          <Link href="/auth/login"  className="nav-link" style={{ marginLeft:8 }}>Log in</Link>
          <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ marginLeft:4 }}>Start free →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">

          {/* Left */}
          <div>
            <div className="hero-eyebrow">
              <span className="live-dot" />
              {liveCount.toLocaleString()} kids learning right now across the GCC
            </div>

            <h1>
              The AI coach that<br />
              <span className="hl">teaches every kid</span><br />
              differently.
            </h1>

            <p className="hero-sub">
              Plulai is the GCC&apos;s first AI-powered learning platform built for kids aged 6–18.
              Coding, AI &amp; startup skills — in Arabic and English — 15 minutes a day.
            </p>

            <div className="hero-btns">
              <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize:'1.05rem', padding:'16px 40px' }}>
                Start for free →
              </Link>
              <a href="#quiz" className="btn btn-ghost">
                Find my child&apos;s track 🎯
              </a>
            </div>

            <div className="trust-chips">
              {['✅ Free forever','✅ No credit card','✅ Arabic & English','✅ Ages 6–18','✅ No ads ever'].map(t => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="hero-card" aria-hidden="true">
            <div className="card-profile">
              <div className="avatar">🧑‍💻</div>
              <div>
                <div className="profile-name">Ahmed, age 13 🇦🇪</div>
                <div className="streak-pill">🔥 47-day streak</div>
              </div>
            </div>

            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Skill progress</div>
              {[
                { label:'🐍 Python',           pct:78, color:'#14D4F4' },
                { label:'🤖 AI Basics',         pct:54, color:'#FAA918' },
                { label:'💡 Startup Thinking',  pct:32, color:'#1CB0F6' },
              ].map(s => (
                <div key={s.label} className="skill-row">
                  <div className="skill-label"><span>{s.label}</span><span>{s.pct}%</span></div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width:`${s.pct}%`, background:s.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="badge-row">
              <span className="badge-icon">🏆</span>
              <div>
                <div className="badge-title">Achievement Unlocked!</div>
                <div className="badge-sub">First Python app built · +300 XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, ri) =>
            ['🐍 Python','🤖 AI Projects','🌐 Web Dev','💡 Startup Skills','🎮 Game Design','📊 Data Science','⚡ Prompt Engineering','🌍 Arabic & English','🏗️ App Building','🔐 Cybersecurity'].map((item, i) => (
              <span key={ri + '-' + i} className={`marquee-item${i % 3 === 0 ? ' hi' : ''}`}>
                {item}<span className="marquee-dot"> ✦ </span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="sec" style={{ paddingTop:56, paddingBottom:56 }}>
        <div className="w">
          <div className="stats-grid">
            {[
              { val:1000, suffix:'+', label:'GCC Families' },
              { val:200,  suffix:'+', label:'Lessons' },
              { val:49,   suffix:'',  label:'/ 5 Parent Rating', prefix:'4.' },
              { val:6,    suffix:'',  label:'Countries' },
            ].map((s,i) => (
              <div key={i} className="stat-cell">
                <div className="stat-val">
                  {s.prefix ?? ''}<Counter to={s.val} />{s.suffix}
                </div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACKS ── */}
      <section id="tracks" className="sec" style={{ background:'var(--bg)' }}>
        <div className="w">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="sec-label">Three paths · one platform</p>
            <h2 className="sec-title">Choose your adventure</h2>
            <p className="sec-sub" style={{ maxWidth:540, margin:'0 auto' }}>Every track leads to real, marketable skills. Most kids in the GCC end up doing all three.</p>
          </div>

          <div className="tracks-grid">
            {[
              {
                emoji:'💻', title:'Coding Track', sub:'For future developers',
                color:'#1CB0F6', bg:'#EAF7FE', tagBg:'rgba(28,176,246,0.12)', tagColor:'#1CB0F6',
                outcome:'Real web app + game portfolio', badge:'badge-sky',
                desc:'From zero to building real apps and games. Python, HTML, logical thinking — explained simply, practised daily.',
                skills:['Python','Web Dev','Game Design','App Building'],
              },
              {
                emoji:'🤖', title:'AI Track', sub:'For future innovators',
                color:'#14D4F4', bg:'#E8FCFE', tagBg:'rgba(20,212,244,0.12)', tagColor:'#0BAABF',
                outcome:'Working AI project they built', badge:'badge-cyan',
                desc:'Not watching AI videos — actually building AI. Your own machine learning project by month 2.',
                skills:['What is AI?','ML Basics','AI Ethics','Build an AI'],
              },
              {
                emoji:'💡', title:'Startup Track', sub:'For future founders',
                color:'#FAA918', bg:'#FEF7E8', tagBg:'rgba(250,169,24,0.12)', tagColor:'#C07A00',
                outcome:'Full startup pitch + MVP',
                desc:'Idea to polished investor pitch. GCC startup thinking, adapted for young minds. Win school competitions.',
                skills:['Idea Gen','Market Research','Build MVP','Pitch'],
              },
            ].map(t => (
              <div key={t.title} className="track-card" style={{ background:t.bg, borderColor:t.color + '33' }}>
                <div className="track-icon" style={{ background:t.tagBg }}>
                  <span style={{ fontSize:'1.8rem' }}>{t.emoji}</span>
                </div>
                <div className="track-title" style={{ color:t.color }}>{t.title}</div>
                <div className="track-sub" style={{ color:t.color + 'aa' }}>{t.sub}</div>
                <div className="track-badge" style={{ background:t.tagBg, color:t.tagColor }}>✓ {t.outcome}</div>
                <p className="track-desc">{t.desc}</p>
                <div className="skill-tags">
                  {t.skills.map(s => (
                    <span key={s} className="skill-tag" style={{ background:t.tagBg, color:t.tagColor, border:`1.5px solid ${t.color}22` }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:44 }}>
            <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize:'1.05rem', padding:'16px 40px' }}>
              Start any track free →
            </Link>
            <p style={{ fontSize:'0.78rem', color:'var(--muted)', fontWeight:700, marginTop:12 }}>No commitment · switch tracks anytime</p>
          </div>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section id="quiz" className="quiz-section sec">
        <div className="quiz-inner w">
          <div>
            <p style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:16 }}>Not sure where to start?</p>
            <h2 style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'clamp(2rem,4vw,3rem)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:20 }}>
              Find your child&apos;s<br />perfect track.
            </h2>
            <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.7)', fontWeight:600, lineHeight:1.7, marginBottom:32 }}>
              3 questions. 30 seconds. A personalised curriculum built around your child&apos;s age, interests, and goals.
            </p>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {[['🎓','200+ lessons'],['🤖','Personal AI coach'],['🌍','Arabic & English']].map(([e,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:'1.2rem' }}>{e}</span>
                  <span style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.8)', fontWeight:700 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="quiz-card"><Quiz /></div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sec">
        <div className="w">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="sec-label">Simple to start</p>
            <h2 className="sec-title">From zero to builder in 3 steps</h2>
            <p className="sec-sub">No setup. No downloads. Works on any device right now.</p>
          </div>
          <div className="steps-grid">
            {[
              { n:1, emoji:'🎯', title:'Find your track',      desc:"60-second quiz → personalised curriculum matched to your child's age, interests, and goals.", time:'60 seconds' },
              { n:2, emoji:'🤖', title:'Meet your AI coach',   desc:'Your personal AI tutor starts lesson 1 in English or Arabic. Adapts to your exact level automatically.', time:'Day 1' },
              { n:3, emoji:'🏆', title:'Build something real', desc:'By week 2 your child completes their first real project. By month 3 they have a full portfolio.', time:'Week 2' },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ position:'relative' }}>
                <div className="step-num">{s.n}</div>
                <div className="step-emoji">{s.emoji}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
                <span className="step-time">{s.time}</span>
                {i < 2 && <div className="step-arrow hide-m" style={{ left: i === 0 ? 'calc(33.3% + 10px)' : 'calc(66.6% + 10px)' }}>→</div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:40 }}>
            <Link href="/auth/signup" className="btn btn-primary">Start step 1 — free 🎉</Link>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="sec" style={{ background:'var(--bg)' }}>
        <div className="w">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="sec-label">Not theory — real output</p>
            <h2 className="sec-title">What kids build on Plulai</h2>
            <p className="sec-sub">Every child builds a real portfolio. Things that exist in the world.</p>
          </div>
          <div className="projects-grid">
            {PROJECTS.map((p, i) => {
              const trackColor = p.track==='Coding' ? '#1CB0F6' : p.track==='AI' ? '#14D4F4' : '#FAA918'
              return (
                <div key={i} className="project-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span className="project-tag" style={{ background:trackColor+'18', color:trackColor, border:`1.5px solid ${trackColor}33` }}>{p.track}</span>
                    <span style={{ fontSize:'0.72rem', color:'var(--muted)', fontWeight:700 }}>Week {p.weeks}</span>
                  </div>
                  <p className="project-text">&ldquo;{p.text}&rdquo;</p>
                  <p className="project-meta">{p.flag} · Age {p.age}</p>
                </div>
              )
            })}
          </div>
          <div style={{ textAlign:'center', marginTop:44 }}>
            <Link href="/auth/signup" className="btn btn-primary">Start building — free →</Link>
            <p style={{ fontSize:'0.78rem', color:'var(--muted)', fontWeight:700, marginTop:12 }}>Your child&apos;s first project: ready by end of week 2.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="stories" className="sec">
        <div className="w">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="sec-label">1,000+ kids · 1 pattern</p>
            <h2 className="sec-title">Real kids. Real results.</h2>
            <p className="sec-sub">Every kid on Plulai has a story like these. This is the norm, not the exception.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.slice(0,3).map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">{'⭐'.repeat(5)}</div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(250,169,24,0.1)', border:'1.5px solid rgba(250,169,24,0.25)', borderRadius:999, padding:'3px 10px', marginBottom:12 }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#C07A00' }}>🔥 {t.streak}-day streak</span>
                </div>
                <p className="testi-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.avatar}</div>
                  <div>
                    <div className="testi-name">{t.name}, age {t.age}</div>
                    <div className="testi-info">{t.flag}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GCC ── */}
      <section id="gcc" className="gcc-section sec">
        <div className="w">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Built for the region</p>
            <h2 style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'clamp(1.8rem,3.5vw,2.8rem)', letterSpacing:'-0.03em', color:'#fff', marginBottom:14 }}>
              The GCC&apos;s #1 kids&apos; edtech platform
            </h2>
            <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.55)', fontWeight:600, maxWidth:520, margin:'0 auto' }}>
              The only platform built region-first — real Arabic, local culture, real relevance.
            </p>
          </div>

          <div className="gcc-grid">
            {[
              { flag:'🇦🇪', name:'UAE',           city:'Dubai & Abu Dhabi' },
              { flag:'🇸🇦', name:'Saudi Arabia',  city:'Riyadh & Jeddah'  },
              { flag:'🇶🇦', name:'Qatar',         city:'Doha'              },
              { flag:'🇰🇼', name:'Kuwait',        city:'Kuwait City'       },
              { flag:'🇧🇭', name:'Bahrain',       city:'Manama'            },
              { flag:'🇴🇲', name:'Oman',          city:'Muscat'            },
            ].map(c => (
              <div key={c.name} className="gcc-card">
                <div className="gcc-flag">{c.flag}</div>
                <div className="gcc-name">{c.name}</div>
                <div className="gcc-city">{c.city}</div>
              </div>
            ))}
          </div>

          <div className="gcc-features">
            <div className="gcc-feat">
              <div className="gcc-feat-icon">🌐</div>
              <div className="gcc-feat-title">Real Arabic, not translated</div>
              <p className="gcc-feat-desc">Full RTL interface and an AI coach that teaches natively in Arabic. Not a US product ported over — built here, for kids here, first.</p>
            </div>
            <div className="gcc-feat">
              <div className="gcc-feat-icon">🎓</div>
              <div className="gcc-feat-title">Aligned with UAE Vision 2031</div>
              <p className="gcc-feat-desc">AI, coding, and entrepreneurship are the three pillars the GCC economy demands from its next generation. Plulai delivers all three.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="sec" style={{ background:'var(--bg)' }}>
        <div className="w">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="sec-label">Simple pricing</p>
            <h2 className="sec-title">Start free. Upgrade when ready.</h2>
            <p className="sec-sub">No pressure. The free plan is genuinely useful.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card featured" style={{ position:'relative' }}>
              <div style={{ position:'absolute', top:20, right:20, background:'var(--amber)', color:'#fff', borderRadius:999, padding:'4px 14px', fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.06em' }}>MOST POPULAR ⭐</div>
              <div style={{ fontSize:'2rem', marginBottom:14 }}>🎁</div>
              <div className="price-label" style={{ color:'rgba(255,255,255,0.5)' }}>Free</div>
              <div className="price-name" style={{ color:'#fff' }}>Free Forever</div>
              <div className="price-amount" style={{ color:'#14D4F4' }}>$0</div>
              <div className="price-period" style={{ color:'rgba(255,255,255,0.4)' }}>no card needed · forever free</div>
              {['First module of each track','Personal AI coach','XP & streak system','Parent dashboard','Arabic & English','Any device'].map(f => (
                <div key={f} className="price-feature">
                  <div className="check-icon" style={{ background:'rgba(20,212,244,0.2)', color:'#14D4F4' }}>✓</div>
                  <span style={{ color:'rgba(255,255,255,0.75)' }}>{f}</span>
                </div>
              ))}
              <Link href="/auth/signup" className="btn btn-amber" style={{ width:'100%', justifyContent:'center', marginTop:24 }}>
                🚀 Start free now
              </Link>
            </div>

            <div className="price-card plain">
              <div style={{ fontSize:'2rem', marginBottom:14 }}>⚡</div>
              <div className="price-label" style={{ color:'var(--sky)' }}>Pro</div>
              <div className="price-name">Pro Plan</div>
              <div className="price-amount" style={{ color:'var(--deep)' }}>$79</div>
              <div className="price-period" style={{ color:'var(--muted)' }}>per month · cancel anytime</div>
              {['All 200+ lessons unlocked','Advanced AI coaching','Full portfolio system','Live project feedback','Certificate of completion','Priority support'].map(f => (
                <div key={f} className="price-feature">
                  <div className="check-icon" style={{ background:'rgba(28,176,246,0.1)', color:'var(--sky)' }}>✓</div>
                  <span style={{ color:'var(--muted)' }}>{f}</span>
                </div>
              ))}
              <Link href="/auth/signup?plan=pro" className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', marginTop:24 }}>
                Start with Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="sec">
        <div className="w" style={{ maxWidth:740 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p className="sec-label">Your questions, answered</p>
            <h2 className="sec-title">Everything parents ask us</h2>
          </div>
          {FAQ.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{item.q}</span>
                <span className={`faq-icon${openFaq === i ? ' open' : ''}`}>+</span>
              </button>
              {openFaq === i && <div className="faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-box">
          <p className="sec-label" style={{ textAlign:'center' }}>The best time was yesterday</p>
          <h2 style={{ fontFamily:'var(--f)', fontWeight:800, fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:'-0.03em', lineHeight:1.15, color:'var(--ink)', marginBottom:16, textAlign:'center' }}>
            Start right now.<br />
            <span style={{ background:'linear-gradient(90deg,var(--sky),var(--deep))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Your child&apos;s future is waiting.
            </span>
          </h2>
          <p style={{ fontSize:'1rem', color:'var(--muted)', fontWeight:600, lineHeight:1.7, marginBottom:36, textAlign:'center' }}>
            Join 1,247 kids across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman already building the skills that matter.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:24 }}>
            <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize:'1.1rem', padding:'18px 48px' }}>
              Claim your free spot →
            </Link>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10 }}>
            {['✅ Free forever','✅ No credit card','✅ Arabic & English','✅ Ages 6–18','✅ No ads ever','✅ Cancel anytime'].map(t => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="w">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">🚀 Plulai</div>
              <p className="footer-tagline">The GCC&apos;s #1 edtech platform for kids aged 6–18. Coding, AI &amp; Startup skills.</p>
            </div>
            {[
              { title:'Platform', links:[['Find a Track','#quiz'],['Student Projects','#projects'],['Pricing','/pricing'],['Sign Up Free','/auth/signup']] },
              { title:'Countries', links:[['🇦🇪 UAE','#'],['🇸🇦 Saudi Arabia','#'],['🇶🇦 Qatar','#'],['🇰🇼 Kuwait','#'],['🇧🇭 Bahrain','#'],['🇴🇲 Oman','#']] },
              { title:'Company', links:[['Contact','mailto:hello@plulai.com'],['Partners','mailto:partners@plulai.com'],['Schools','mailto:schools@plulai.com'],['Privacy Policy','/privacy-policy']] },
            ].map(col => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                {col.links.map(([l, h]) => (
                  <a key={l} href={h} className="footer-link">{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© {new Date().getFullYear()} Plulai · Built with ❤️ for the GCC · hello@plulai.com</span>
            <span className="footer-copy">The future of education starts here.</span>
          </div>
        </div>
      </footer>
    </>
  )
}