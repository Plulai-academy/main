'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'age',
    question: 'How old is your child?',
    options: [
      { label: '6–8 years',   value: 'mini',   sub: 'Mini Explorer' },
      { label: '9–11 years',  value: 'junior', sub: 'Junior Creator' },
      { label: '12–14 years', value: 'pro',    sub: 'Pro Explorer' },
      { label: '15–18 years', value: 'expert', sub: 'Tech Expert' },
    ],
  },
  {
    id: 'interest',
    question: 'What excites your child most?',
    options: [
      { label: 'Apps & Games',        value: 'coding', sub: 'Coding track' },
      { label: 'AI & Smart Tech',     value: 'ai',     sub: 'AI track' },
      { label: 'Starting a Business', value: 'bizz',   sub: 'Entrepreneurship' },
      { label: 'All of the above',    value: 'all',    sub: 'Full curriculum' },
    ],
  },
  {
    id: 'goal',
    question: 'What matters most to you?',
    options: [
      { label: 'Screen time with purpose', value: 'screen', sub: '' },
      { label: 'Future career advantage',  value: 'career', sub: '' },
      { label: 'Building confidence',      value: 'conf',   sub: '' },
      { label: 'Real skills, not theory',  value: 'skills', sub: '' },
    ],
  },
]

const TRACK_RESULT = {
  coding: { label: 'Coding Track',           desc: 'Python, web dev & game design. Real apps from week 2.' },
  ai:     { label: 'AI Track',               desc: 'Machine learning, AI ethics & their own AI project by month 2.' },
  bizz:   { label: 'Entrepreneurship Track', desc: 'Startup thinking, MVP building & investor-ready pitches.' },
  all:    { label: 'Full Curriculum',        desc: 'All 3 tracks — the complete future-skills package.' },
}

const PROJECTS = [
  { age: 9,  country: 'UAE',    project: 'A working calculator app in Python',      track: 'Coding', weeks: 3 },
  { age: 11, country: 'KSA',    project: 'An AI chatbot answering school questions', track: 'AI',     weeks: 6 },
  { age: 13, country: 'Qatar',  project: 'A startup pitch that won school finals',   track: 'Bizz',   weeks: 8 },
  { age: 10, country: 'Kuwait', project: "A website for their mum's business",       track: 'Coding', weeks: 4 },
  { age: 14, country: 'UAE',    project: 'An ML model that sorts recycling photos',  track: 'AI',     weeks: 7 },
  { age: 12, country: 'Bahrain',project: 'A pitched mobile app idea to investors',   track: 'Bizz',   weeks: 9 },
]

const TRACKS = [
  {
    id: 'coding', num: '01',
    title: 'Coding',
    sub: 'Apps & Games',
    outcome: 'Real web app + game portfolio in 3 months',
    desc: 'From zero to building real apps. Python, HTML, logic — explained simply, practised daily. First working program in week 2.',
    skills: ['Python Basics', 'Web Development', 'Game Design', 'App Building'],
    color: '#1CB0F6',
  },
  {
    id: 'ai', num: '02',
    title: 'Artificial',
    sub: 'Intelligence',
    outcome: 'Working AI project built from scratch',
    desc: 'Not watching AI — building it. Your child has their own machine learning project by month 2.',
    skills: ['What is AI?', 'Machine Learning', 'AI Ethics', 'Build an AI Project'],
    color: '#FAA918',
  },
  {
    id: 'entrepreneurship', num: '03',
    title: 'Entrepreneur',
    sub: 'Ship',
    outcome: 'Full startup pitch + MVP in 3 months',
    desc: 'First idea to polished investor pitch. Startup thinking from the DIFC playbook, adapted for young minds.',
    skills: ['Idea Generation', 'Market Research', 'Build a MVP', 'Pitch Your Startup'],
    color: '#14D4F4',
  },
]

const TESTIMONIALS = [
  { name: 'Ahmed K.',  age: 13, city: 'Dubai',       quote: 'I built my first AI chatbot in 2 weeks. My teacher shared it with the whole class.', win: 'AI chatbot — 2 weeks' },
  { name: 'Sara M.',   age: 10, city: 'Riyadh',      quote: '21-day streak. I learn every night instead of watching YouTube. My parents are shocked.', win: '21-day streak' },
  { name: 'Nour R.',   age: 11, city: 'Kuwait City', quote: 'I won my school startup competition. The judges said they could not believe an 11-year-old made that pitch.', win: 'Won school competition' },
  { name: 'Zaid T.',   age: 14, city: 'Abu Dhabi',   quote: 'Finished Python in 3 months. Now on AI. My dad says I am more consistent than he is at the gym.', win: 'Python complete → AI track' },
]

const PARENTS = [
  { name: 'Fatima Al-Mansoori', role: 'Mother of two · Dubai',  quote: 'I tried 4 other apps. My kids open Plulai by themselves, without me asking. That has never happened before.' },
  { name: 'Khalid Al-Rashidi',  role: 'Father · Riyadh',        quote: 'The Arabic is real — not Google Translate. My son finally understood recursion. Night and day difference.' },
  { name: 'Noura Al-Kuwari',    role: 'Mother · Doha',          quote: 'My daughter used to be glued to TikTok. Now she says she is building her portfolio. I do not care what it is called — it is a miracle.' },
]

const FAQ = [
  { q: 'What exactly is Plulai?',                       a: 'Plulai is the leading edtech platform for kids aged 6–18 in the GCC. Coding, AI and entrepreneurship through a personal AI coach, 200+ lessons, and real projects — in English and Arabic.' },
  { q: 'Is it really free?',                            a: 'Genuinely free. No credit card, no expiry. The free plan covers the first module of each track. Pro unlocks all 200+ lessons, advanced AI coaching and the full portfolio system.' },
  { q: 'Does it actually support Arabic?',              a: 'Real Arabic — not Google Translate. Full RTL interface and an AI coach that teaches natively in Arabic. The only platform built region-first.' },
  { q: 'How long are the lessons?',                     a: '15–25 minutes each. Designed to fit after school without replacing homework. Most kids end up doing two lessons instead of one.' },
  { q: 'How is it different from Scratch or Code.org?', a: 'Those are great starters. Plulai goes further: personalised AI coaching, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track.' },
  { q: 'Is it safe for my child?',                      a: 'No ads. Ever. AI responses filtered for child safety. Parents control the account. Zero data sold. Built to KHDA standards.' },
]

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function TrackQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const currentQ = QUIZ_STEPS[step - 1]
  const pct = step === 0 ? 0 : Math.round((step / QUIZ_STEPS.length) * 100)
  const trackKey = (answers.interest ?? 'coding') as keyof typeof TRACK_RESULT
  const result = TRACK_RESULT[trackKey]

  function next() {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : 4)
  }

  if (step === 0) return (
    <div className="qz-start">
      <p className="qz-label">60 seconds · Personalised result</p>
      <h3 className="qz-heading">Find Your Child&apos;s Track</h3>
      <p className="qz-body">3 questions — we&apos;ll match them to the right curriculum, age group and learning style.</p>
      <button onClick={() => setStep(1)} className="qz-cta">Begin →</button>
    </div>
  )

  if (step === 4) return (
    <div className="qz-result">
      <p className="qz-label">Your personalised plan is ready</p>
      <div className="qz-result-badge">{result.label}</div>
      <p className="qz-body" style={{marginTop:'12px',maxWidth:'320px'}}>{result.desc}</p>
      <div className="qz-bar"><div className="qz-fill" style={{width:'75%'}} /></div>
      <p className="qz-pct-note">75% complete — create a free account to unlock the full plan</p>
      <Link href="/auth/signup" className="qz-cta" style={{display:'block',textAlign:'center',marginTop:'20px'}}>
        Unlock Free Plan →
      </Link>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }} className="qz-restart">
        Start over
      </button>
    </div>
  )

  return (
    <div className="qz-step">
      <div className="qz-progress">
        <div className="qz-bar"><div className="qz-fill" style={{width:`${pct}%`}} /></div>
        <span className="qz-pct">{pct}%</span>
      </div>
      <p className="qz-step-label">Step {step} of {QUIZ_STEPS.length}</p>
      <h3 className="qz-heading">{currentQ.question}</h3>
      <div className="qz-opts">
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`qz-opt${selected === opt.value ? ' qz-opt-active' : ''}`}
          >
            <span className="qz-opt-label">{opt.label}</span>
            {opt.sub && <span className="qz-opt-sub">{opt.sub}</span>}
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected} className={`qz-cta${!selected ? ' qz-cta-off' : ''}`}>
        {step === QUIZ_STEPS.length ? "See My Child\u2019s Plan \u2192" : 'Next \u2192'}
      </button>
    </div>
  )
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function Faq({ q, a, n }: { q: string; a: string; n: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-row">
      <button className="faq-trigger" onClick={() => setOpen(!open)}>
        <span className="faq-n">{String(n).padStart(2,'0')}</span>
        <span className="faq-q">{q}</span>
        <span className={`faq-icon${open ? ' faq-open' : ''}`}>+</span>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --blue:    #1CB0F6;
          --cyan:    #14D4F4;
          --navy:    #2B70C9;
          --gold:    #FAA918;
          --red:     #D33131;
          --ink:     #060A12;
          --ink2:    #0C1220;
          --ink3:    #111827;
          --glass:   rgba(255,255,255,0.04);
          --glass2:  rgba(255,255,255,0.07);
          --rim:     rgba(255,255,255,0.08);
          --muted:   #8A94A6;
          --light:   #F0F4FF;
          --radius:  12px;
        }

        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--ink);
          color: var(--light);
          font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }

        /* ── Ambient canvas ── */
        .canvas {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          overflow: hidden;
        }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(120px); opacity: 0.18;
        }
        .orb-1 { width: 900px; height: 900px; top: -300px; left: -200px; background: var(--navy); }
        .orb-2 { width: 600px; height: 600px; top: 200px; right: -150px; background: var(--blue); opacity: 0.10; }
        .orb-3 { width: 500px; height: 500px; bottom: 10%; left: 20%; background: var(--gold); opacity: 0.07; }
        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%);
        }

        /* ── Layout ── */
        .page { position: relative; z-index: 1; }
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .wrap-sm { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .wrap-md { max-width: 960px; margin: 0 auto; padding: 0 32px; }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          background: rgba(6,10,18,0.8);
          backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid var(--rim);
        }
        .nav-logo {
          display: flex; align-items: baseline; gap: 1px;
          font-size: 24px; font-weight: 800; letter-spacing: -0.5px;
        }
        .nav-logo-p { color: var(--light); }
        .nav-logo-dot { color: var(--gold); font-size: 28px; line-height: 0; margin: 0 1px; }
        .nav-logo-rest { color: var(--blue); }
        .nav-links {
          display: flex; align-items: center; gap: 36px;
          font-size: 13px; font-weight: 500; color: var(--muted);
        }
        .nav-links a:hover { color: var(--light); transition: color .15s; }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-login {
          font-size: 13px; font-weight: 600; color: var(--muted);
          padding: 8px 16px; border-radius: 8px;
          transition: color .15s;
        }
        .nav-login:hover { color: var(--light); }
        .nav-shark {
          font-size: 13px; font-weight: 700;
          padding: 9px 18px; border-radius: 8px;
          border: 1px solid rgba(250,169,24,0.3);
          color: var(--gold);
          background: rgba(250,169,24,0.06);
          transition: all .15s;
        }
        .nav-shark:hover { background: rgba(250,169,24,0.12); border-color: rgba(250,169,24,0.5); }
        .nav-cta {
          font-size: 13px; font-weight: 700;
          padding: 9px 22px; border-radius: 8px;
          background: var(--blue); color: #fff;
          transition: all .15s;
        }
        .nav-cta:hover { background: #0fa4e8; transform: translateY(-1px); }

        /* ── Ticker ── */
        .ticker {
          margin-top: 68px;
          padding: 11px 40px;
          background: rgba(28,176,246,0.06);
          border-bottom: 1px solid rgba(28,176,246,0.1);
          display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
          gap: 6px 20px;
          font-size: 12px; font-weight: 500; color: var(--muted);
        }
        .ticker-live { display: flex; align-items: center; gap: 7px; color: var(--light); font-weight: 600; }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22d3a0;
          box-shadow: 0 0 8px #22d3a0;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .ticker-sep { color: rgba(255,255,255,0.1); }

        /* ── Hero ── */
        .hero {
          padding: 96px 32px 80px;
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 420px; gap: 80px; align-items: center;
        }
        .hero-left {}
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 999px;
          border: 1px solid rgba(209,49,49,0.3);
          background: rgba(209,49,49,0.08);
          font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: #f87171; margin-bottom: 28px;
        }
        .hero-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: #f87171; animation: blink 2s infinite; }
        .hero-h1 {
          font-size: clamp(48px, 5.5vw, 80px);
          font-weight: 900; line-height: 1.0; letter-spacing: -3px;
          color: var(--light); margin-bottom: 22px;
        }
        .hero-h1-accent {
          display: block;
          background: linear-gradient(105deg, var(--blue) 0%, var(--cyan) 50%, var(--gold) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: 17px; line-height: 1.7; font-weight: 400;
          color: var(--muted); max-width: 540px; margin-bottom: 36px;
        }
        .hero-sub strong { color: var(--light); font-weight: 600; }
        .hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 44px; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 32px; border-radius: 10px;
          font-size: 15px; font-weight: 700;
          background: linear-gradient(135deg, var(--blue), #0fa4e8);
          color: #fff;
          box-shadow: 0 0 40px rgba(28,176,246,0.25);
          transition: all .2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(28,176,246,0.35); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 600;
          border: 1px solid var(--rim); color: var(--muted);
          transition: all .2s;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,0.2); color: var(--light); }
        .btn-gold {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 32px; border-radius: 10px;
          font-size: 15px; font-weight: 700;
          background: linear-gradient(135deg, var(--gold), #f59e0b);
          color: #0A0E1A;
          box-shadow: 0 0 40px rgba(250,169,24,0.2);
          transition: all .2s;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(250,169,24,0.3); }
        .hero-trust {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .trust-chip {
          padding: 5px 12px; border-radius: 6px;
          border: 1px solid var(--rim);
          font-size: 11px; font-weight: 500; color: var(--muted);
        }
        /* Hero right — quiz panel */
        .hero-quiz {
          background: var(--glass);
          border: 1px solid var(--rim);
          border-radius: 20px;
          padding: 32px 28px;
          backdrop-filter: blur(20px);
          position: relative; overflow: hidden;
        }
        .hero-quiz::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue), transparent);
        }
        .hero-quiz-head {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px; padding-bottom: 20px;
          border-bottom: 1px solid var(--rim);
        }
        .hero-quiz-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(28,176,246,0.12); border: 1px solid rgba(28,176,246,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .hero-quiz-label { font-size: 13px; font-weight: 600; color: var(--muted); }
        .hero-quiz-sublabel { font-size: 11px; color: rgba(138,148,166,0.6); margin-top: 1px; }

        /* ── Stats row ── */
        .stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          margin: 0 32px 0;
          max-width: 1200px; margin: 0 auto;
          padding: 0 32px;
          gap: 1px;
          border-radius: 16px; overflow: hidden;
          border: 1px solid var(--rim);
        }
        .stat {
          background: var(--ink2);
          padding: 28px 24px; text-align: center;
        }
        .stat-val {
          font-size: 36px; font-weight: 900; letter-spacing: -1.5px;
          color: var(--light);
        }
        .stat-val-blue { color: var(--blue); }
        .stat-val-gold { color: var(--gold); }
        .stat-lbl { font-size: 12px; font-weight: 500; color: var(--muted); margin-top: 4px; }
        .stat-live {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: #22d3a0; margin-bottom: 4px;
        }

        /* ── Section shell ── */
        .sec { padding: 120px 32px; }
        .sec-sm { padding: 80px 32px; }
        .eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          color: var(--blue); margin-bottom: 14px;
        }
        .eyebrow-gold { color: var(--gold); }
        .sec-h2 {
          font-size: clamp(32px, 4vw, 54px);
          font-weight: 900; letter-spacing: -2px; line-height: 1.05;
          color: var(--light); margin-bottom: 16px;
        }
        .sec-sub {
          font-size: 16px; font-weight: 400; line-height: 1.7;
          color: var(--muted); max-width: 520px;
        }
        .sec-header { margin-bottom: 56px; }
        .sec-header-row {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 24px; flex-wrap: wrap; margin-bottom: 56px;
        }

        /* ── Tracks ── */
        .tracks { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; border: 1px solid var(--rim); border-radius: 20px; overflow: hidden; }
        .track {
          background: var(--ink2);
          padding: 40px 32px 36px;
          display: flex; flex-direction: column;
          transition: background .2s;
          position: relative; overflow: hidden;
        }
        .track:hover { background: var(--ink3); }
        .track::after {
          content: attr(data-num);
          position: absolute; bottom: -20px; right: -10px;
          font-size: 120px; font-weight: 900; letter-spacing: -4px;
          color: rgba(255,255,255,0.025); line-height: 1;
          pointer-events: none; user-select: none;
        }
        .track-num {
          font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          margin-bottom: 20px;
        }
        .track-title { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.05; color: var(--light); }
        .track-sub { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.05; margin-bottom: 16px; }
        .track-outcome {
          display: inline-flex; padding: 6px 12px; border-radius: 6px;
          font-size: 11px; font-weight: 700;
          margin-bottom: 20px; align-self: flex-start;
        }
        .track-desc { font-size: 13px; line-height: 1.7; color: var(--muted); margin-bottom: 24px; flex: 1; }
        .track-skills { display: flex; flex-direction: column; gap: 9px; }
        .track-skill { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; }
        .skill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* ── Projects ── */
        .projects-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .proj-card {
          background: var(--ink2);
          border: 1px solid var(--rim);
          border-radius: 16px; padding: 24px 22px;
          transition: border-color .2s, transform .2s;
        }
        .proj-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
        .proj-badge {
          display: inline-block; padding: 3px 10px; border-radius: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          margin-bottom: 14px;
        }
        .proj-quote { font-size: 14px; font-weight: 500; line-height: 1.6; color: var(--light); margin-bottom: 16px; }
        .proj-meta { font-size: 11px; font-weight: 500; color: var(--muted); }

        /* ── Features bento ── */
        .bento { display: grid; grid-template-columns: repeat(3,1fr); grid-template-rows: auto auto; gap: 16px; }
        .bento-card {
          background: var(--ink2);
          border: 1px solid var(--rim);
          border-radius: 20px; padding: 32px 28px;
          transition: border-color .2s;
          position: relative; overflow: hidden;
        }
        .bento-card:hover { border-color: rgba(255,255,255,0.14); }
        .bento-card.wide { grid-column: span 2; }
        .bento-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
        }
        .bento-title { font-size: 18px; font-weight: 700; letter-spacing: -.3px; color: var(--light); margin-bottom: 10px; }
        .bento-desc { font-size: 13px; line-height: 1.7; color: var(--muted); }
        .bento-card-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 2px 2px 0 0;
        }

        /* ── Steps ── */
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; border: 1px solid var(--rim); border-radius: 20px; overflow: hidden; }
        .step { background: var(--ink2); padding: 40px 32px; border-right: 1px solid var(--rim); }
        .step:last-child { border-right: none; }
        .step-n {
          font-size: 52px; font-weight: 900; letter-spacing: -2px;
          line-height: 1; margin-bottom: 20px;
        }
        .step-title { font-size: 19px; font-weight: 700; letter-spacing: -.3px; color: var(--light); margin-bottom: 10px; }
        .step-desc { font-size: 13px; line-height: 1.7; color: var(--muted); margin-bottom: 16px; }
        .step-time {
          display: inline-block; padding: 4px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
          border: 1px solid rgba(28,176,246,0.25); color: var(--blue);
          background: rgba(28,176,246,0.06);
        }

        /* ── Testimonials ── */
        .testi-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        .testi-card {
          background: var(--ink2);
          border: 1px solid var(--rim);
          border-radius: 20px; padding: 28px 26px;
          display: flex; flex-direction: column;
          transition: border-color .2s;
        }
        .testi-card:hover { border-color: rgba(255,255,255,0.14); }
        .testi-win {
          display: inline-block; padding: 4px 12px; border-radius: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: var(--blue); background: rgba(28,176,246,0.08); border: 1px solid rgba(28,176,246,0.15);
          margin-bottom: 18px; align-self: flex-start;
        }
        .testi-quote { font-size: 14px; line-height: 1.7; color: var(--light); font-style: italic; flex: 1; margin-bottom: 22px; }
        .testi-name { font-size: 13px; font-weight: 700; color: var(--light); }
        .testi-role { font-size: 11px; font-weight: 500; color: var(--muted); margin-top: 3px; }

        .parent-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 16px; }
        .parent-card {
          background: rgba(43,112,201,0.06);
          border: 1px solid rgba(43,112,201,0.15);
          border-radius: 16px; padding: 24px 22px;
        }
        .parent-quote { font-size: 13px; line-height: 1.7; color: var(--light); font-style: italic; margin-bottom: 16px; }
        .parent-name { font-size: 12px; font-weight: 700; color: var(--light); }
        .parent-role { font-size: 11px; font-weight: 500; color: var(--muted); margin-top: 2px; }

        /* ── Pricing ── */
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 720px; margin: 0 auto; }
        .price-card {
          background: var(--ink2);
          border: 1px solid var(--rim);
          border-radius: 20px; padding: 36px 32px;
          position: relative; overflow: hidden;
        }
        .price-card-featured { border-color: rgba(28,176,246,0.35); }
        .price-card-featured::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--blue), var(--cyan));
        }
        .price-badge {
          display: inline-block; padding: 4px 12px; border-radius: 999px;
          font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          background: rgba(28,176,246,0.1); border: 1px solid rgba(28,176,246,0.2); color: var(--blue);
          margin-bottom: 20px;
        }
        .price-plan { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .price-amount {
          font-size: 52px; font-weight: 900; letter-spacing: -2px; color: var(--light); line-height: 1;
        }
        .price-amount span { font-size: 16px; font-weight: 500; color: var(--muted); }
        .price-note { font-size: 12px; color: var(--muted); margin-bottom: 24px; margin-top: 6px; }
        .price-line { height: 1px; background: var(--rim); margin: 20px 0; }
        .price-feats { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .price-feat { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: var(--light); }
        .price-check { color: var(--blue); font-size: 14px; flex-shrink: 0; }
        .price-check-muted { color: var(--muted); }

        /* ── GCC ── */
        .gcc-flags { display: grid; grid-template-columns: repeat(6,1fr); gap: 1px; border: 1px solid var(--rim); border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
        .gcc-flag { background: var(--ink2); padding: 20px 12px; text-align: center; }
        .gcc-flag-emoji { font-size: 30px; margin-bottom: 6px; }
        .gcc-flag-name { font-size: 11px; font-weight: 600; color: var(--light); }
        .gcc-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .gcc-card { background: var(--ink2); border: 1px solid var(--rim); border-radius: 16px; padding: 28px 24px; }
        .gcc-card-icon { font-size: 28px; margin-bottom: 12px; }
        .gcc-card-title { font-size: 17px; font-weight: 700; color: var(--light); margin-bottom: 8px; }
        .gcc-card-desc { font-size: 13px; line-height: 1.7; color: var(--muted); }

        /* ── Magnet ── */
        .magnet {
          background: var(--ink2);
          border: 1px solid rgba(250,169,24,0.2);
          border-radius: 20px; padding: 48px;
          display: flex; align-items: center; gap: 56px;
          position: relative; overflow: hidden;
        }
        .magnet::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,169,24,0.5), transparent);
        }
        .magnet-left { flex: 1; }
        .magnet-label {
          display: inline-block; padding: 4px 12px; border-radius: 999px;
          font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--gold); background: rgba(250,169,24,0.08); border: 1px solid rgba(250,169,24,0.2);
          margin-bottom: 14px;
        }
        .magnet-title { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: var(--light); margin-bottom: 10px; }
        .magnet-desc { font-size: 14px; line-height: 1.7; color: var(--muted); max-width: 420px; }
        .magnet-right { flex-shrink: 0; text-align: center; }
        .magnet-note { font-size: 11px; color: var(--muted); margin-top: 10px; }

        /* ── Urgency ── */
        .urgency {
          background: linear-gradient(135deg, rgba(28,176,246,0.07) 0%, rgba(43,112,201,0.04) 100%);
          border-top: 1px solid rgba(28,176,246,0.12); border-bottom: 1px solid rgba(28,176,246,0.12);
          padding: 72px 32px; text-align: center;
        }
        .urgency-h { font-size: clamp(24px, 3vw, 38px); font-weight: 900; letter-spacing: -1.5px; color: var(--light); margin-bottom: 12px; }
        .urgency-sub { font-size: 15px; color: var(--muted); max-width: 440px; margin: 0 auto 28px; line-height: 1.6; }

        /* ── FAQ ── */
        .faq-row { border-bottom: 1px solid var(--rim); }
        .faq-trigger {
          display: flex; align-items: center; gap: 18px;
          width: 100%; padding: 22px 0; text-align: left;
          color: var(--light);
        }
        .faq-n { font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--blue); width: 24px; flex-shrink: 0; }
        .faq-q { font-size: 15px; font-weight: 600; flex: 1; }
        .faq-icon { font-size: 20px; color: var(--muted); flex-shrink: 0; transition: transform .2s; display: inline-block; }
        .faq-open { transform: rotate(45deg); }
        .faq-a { padding: 0 0 22px 42px; font-size: 14px; line-height: 1.7; color: var(--muted); }

        /* ── Final CTA ── */
        .final { padding: 140px 32px; text-align: center; }
        .final-h {
          font-size: clamp(40px, 6vw, 80px);
          font-weight: 900; letter-spacing: -3px; line-height: 1.0;
          color: var(--light); margin-bottom: 20px;
        }
        .final-h-gold {
          display: block;
          background: linear-gradient(105deg, var(--gold), #f59e0b, var(--gold));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .final-sub { font-size: 16px; color: var(--muted); max-width: 480px; margin: 0 auto 32px; line-height: 1.7; }
        .final-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 40px; }
        .final-chip { padding: 5px 14px; border-radius: 6px; border: 1px solid var(--rim); font-size: 11px; font-weight: 500; color: var(--muted); }
        .final-trust { font-size: 12px; color: var(--muted); margin-top: 18px; opacity: .6; }

        /* ── Footer ── */
        .footer { border-top: 1px solid var(--rim); padding: 56px 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; gap: 48px; flex-wrap: wrap; }
        .footer-brand { max-width: 220px; }
        .footer-logo-text { font-size: 20px; font-weight: 900; letter-spacing: -.5px; color: var(--light); margin-bottom: 10px; }
        .footer-tagline { font-size: 12px; line-height: 1.6; color: var(--muted); }
        .footer-cols { display: flex; gap: 56px; }
        .footer-col-head { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--light); margin-bottom: 16px; }
        .footer-link { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 9px; transition: color .15s; }
        .footer-link:hover { color: var(--light); }
        .footer-bottom { max-width: 1200px; margin: 40px auto 0; padding-top: 24px; border-top: 1px solid var(--rim); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 11px; font-weight: 500; color: var(--muted); }

        /* ── Quiz styles ── */
        .qz-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .qz-heading { font-size: 20px; font-weight: 800; letter-spacing: -.4px; color: var(--light); margin-bottom: 10px; }
        .qz-body { font-size: 13px; line-height: 1.6; color: var(--muted); margin-bottom: 20px; }
        .qz-start { text-align: center; padding: 8px 0; }
        .qz-result { text-align: center; padding: 8px 0; display: flex; flex-direction: column; align-items: center; }
        .qz-result-badge {
          display: inline-block; padding: 8px 20px; border-radius: 8px;
          font-size: 14px; font-weight: 700;
          background: rgba(28,176,246,0.1); border: 1px solid rgba(28,176,246,0.25); color: var(--blue);
          margin-top: 10px;
        }
        .qz-bar { height: 3px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden; flex: 1; }
        .qz-fill { height: 100%; background: linear-gradient(90deg, var(--blue), var(--cyan)); border-radius: 99px; transition: width .4s ease; }
        .qz-progress { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .qz-pct { font-size: 11px; font-weight: 700; color: var(--muted); }
        .qz-pct-note { font-size: 11px; font-weight: 600; color: var(--gold); margin-top: 6px; }
        .qz-step-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .qz-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 18px; }
        .qz-opt {
          display: flex; flex-direction: column; align-items: flex-start; gap: 3px; text-align: left;
          padding: 14px 16px; border-radius: 10px;
          border: 1px solid var(--rim); background: rgba(255,255,255,0.02);
          transition: all .15s; color: var(--light);
        }
        .qz-opt:hover { border-color: rgba(28,176,246,0.3); background: rgba(28,176,246,0.04); }
        .qz-opt-active { border-color: var(--blue) !important; background: rgba(28,176,246,0.08) !important; }
        .qz-opt-label { font-size: 13px; font-weight: 600; }
        .qz-opt-sub { font-size: 10px; font-weight: 600; color: var(--blue); letter-spacing: .04em; }
        .qz-cta {
          display: inline-flex; align-items: center; justify-content: center;
          width: 100%; padding: 13px; border-radius: 9px;
          font-size: 14px; font-weight: 700;
          background: linear-gradient(135deg, var(--blue), #0fa4e8); color: #fff;
          transition: all .15s; border: none;
        }
        .qz-cta:hover { opacity: .9; transform: translateY(-1px); }
        .qz-cta-off { opacity: .3; cursor: not-allowed; transform: none !important; }
        .qz-restart { margin-top: 14px; font-size: 12px; color: var(--muted); text-decoration: underline; background: none; border: none; cursor: pointer; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; gap: 48px; }
          .tracks { grid-template-columns: 1fr; }
          .projects-grid { grid-template-columns: 1fr 1fr; }
          .bento { grid-template-columns: 1fr 1fr; }
          .bento-card.wide { grid-column: span 1; }
          .steps { grid-template-columns: 1fr; }
          .step { border-right: none; border-bottom: 1px solid var(--rim); }
          .step:last-child { border-bottom: none; }
          .testi-grid { grid-template-columns: 1fr; }
          .parent-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; max-width: 100%; }
          .gcc-flags { grid-template-columns: repeat(3,1fr); }
          .gcc-cards { grid-template-columns: 1fr; }
          .magnet { flex-direction: column; gap: 28px; padding: 32px 28px; }
          .stats { grid-template-columns: repeat(2,1fr); }
          .footer-cols { gap: 32px; flex-wrap: wrap; }
          .nav-links { display: none; }
          .hero-h1 { letter-spacing: -2px; }
          .final-h { letter-spacing: -2px; }
        }
        @media (max-width: 600px) {
          .projects-grid { grid-template-columns: 1fr; }
          .bento { grid-template-columns: 1fr; }
          .wrap, .wrap-sm, .wrap-md { padding: 0 20px; }
          .sec { padding: 80px 20px; }
          .hero { padding: 72px 20px 60px; }
        }
      `}</style>

      {/* ── Ambient background ── */}
      <div className="canvas">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-lines" />
      </div>

      <div className="page">

        {/* ── Nav ── */}
        <nav className="nav">
          <div className="nav-logo">
            <span className="nav-logo-p">Plu</span>
            <span className="nav-logo-dot">·</span>
            <span className="nav-logo-rest">lai</span>
          </div>
          <div className="nav-links">
            <a href="#tracks">Tracks</a>
            <a href="#projects">Projects</a>
            <a href="#quiz">Find a Track</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-right">
            <Link href="/sharkkid" className="nav-shark">🦈 Sharkkid</Link>
            <Link href="/auth/login" className="nav-login">Log in</Link>
            <Link href="/auth/signup" className="nav-cta">Start Free →</Link>
          </div>
        </nav>

        {/* ── Ticker ── */}
        <div className="ticker">
          <span className="ticker-live"><span className="live-dot" />1,247 kids learning right now</span>
          <span className="ticker-sep">·</span>
          <span>⭐ 4.9 — 800+ GCC parents</span>
          <span className="ticker-sep">·</span>
          <span>🇦🇪 🇸🇦 🇶🇦 🇰🇼 🇧🇭 🇴🇲 Six countries</span>
          <span className="ticker-sep">·</span>
          <span>🔒 No ads · Child-safe · Arabic & English</span>
        </div>

        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              Only 43 free spots remaining this week
            </div>
            <h1 className="hero-h1">
              The GCC&apos;s<br />
              <span className="hero-h1-accent">Future Builders</span><br />
              Start Here.
            </h1>
            <p className="hero-sub">
              Kids across the Gulf are building apps, AI tools and startup pitches.{' '}
              <strong>Plulai is the 15-min daily habit</strong> that puts your child in that group — in Arabic or English.
            </p>
            <div className="hero-actions">
              <Link href="/auth/signup" className="btn-primary">Claim Your Free Spot →</Link>
              <a href="#quiz" className="btn-outline">Find My Child&apos;s Track</a>
            </div>
            <div className="hero-trust">
              {['Free forever','No credit card','Ages 6–18','No ads ever','Arabic & English'].map(t => (
                <span key={t} className="trust-chip">✓ {t}</span>
              ))}
            </div>
          </div>

          <div className="hero-right" id="quiz">
            <div className="hero-quiz">
              <div className="hero-quiz-head">
                <div className="hero-quiz-icon">🎯</div>
                <div>
                  <div className="hero-quiz-label">Track Finder</div>
                  <div className="hero-quiz-sublabel">Personalised in 60 seconds</div>
                </div>
              </div>
              <TrackQuiz />
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="wrap" style={{marginBottom:'100px'}}>
          <div className="stats">
            <div className="stat">
              <div className="stat-live"><span className="live-dot" />Live</div>
              <div className="stat-val stat-val-blue">1,247</div>
              <div className="stat-lbl">Kids online right now</div>
            </div>
            <div className="stat">
              <div className="stat-val">6</div>
              <div className="stat-lbl">GCC countries</div>
            </div>
            <div className="stat">
              <div className="stat-val stat-val-gold">200+</div>
              <div className="stat-lbl">Lessons & projects</div>
            </div>
            <div className="stat">
              <div className="stat-val">4.9★</div>
              <div className="stat-lbl">Parent rating</div>
            </div>
          </div>
        </div>

        {/* ── Tracks ── */}
        <section id="tracks" className="sec">
          <div className="wrap">
            <div className="sec-header-row">
              <div>
                <p className="eyebrow">3 Tracks · 60+ lessons each</p>
                <h2 className="sec-h2">Which future<br />will they build?</h2>
                <p className="sec-sub">Every path leads to skills the GCC economy will pay a premium for in 2030. Most kids do all three.</p>
              </div>
              <Link href="/auth/signup" className="btn-primary">Start Building Free →</Link>
            </div>
            <div className="tracks">
              {TRACKS.map(t => (
                <div key={t.id} className="track" data-num={t.num}>
                  <div className="track-num" style={{color:t.color}}>{t.num} — {t.label.toUpperCase()}</div>
                  <div className="track-title">{t.title}</div>
                  <div className="track-sub" style={{color:t.color}}>{t.sub}</div>
                  <div className="track-outcome" style={{background:`${t.color}12`,border:`1px solid ${t.color}25`,color:t.color}}>
                    ✓ {t.outcome}
                  </div>
                  <p className="track-desc">{t.desc}</p>
                  <div className="track-skills">
                    {t.skills.map(s => (
                      <div key={s} className="track-skill">
                        <div className="skill-dot" style={{background:t.color}} />
                        <span style={{color:'var(--light)'}}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What kids build ── */}
        <section id="projects" className="sec" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="sec-header-row">
              <div>
                <p className="eyebrow">Real output. Not theory.</p>
                <h2 className="sec-h2">What kids build<br />on Plulai</h2>
              </div>
            </div>
            <div className="projects-grid">
              {PROJECTS.map((p, i) => {
                const colors: Record<string,{bg:string;text:string}> = {
                  Coding: {bg:'rgba(28,176,246,0.08)',  text:'#1CB0F6'},
                  AI:     {bg:'rgba(250,169,24,0.08)',  text:'#FAA918'},
                  Bizz:   {bg:'rgba(20,212,244,0.08)',  text:'#14D4F4'},
                }
                const c = colors[p.track] || colors.Coding
                return (
                  <div key={i} className="proj-card">
                    <div className="proj-badge" style={{background:c.bg,color:c.text}}>{p.track}</div>
                    <p className="proj-quote">&ldquo;{p.project}&rdquo;</p>
                    <p className="proj-meta">{p.country} · Age {p.age} · Week {p.weeks}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Features bento ── */}
        <section className="sec" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="sec-header">
              <p className="eyebrow">Why it works</p>
              <h2 className="sec-h2">Why kids love it.<br />Why parents trust it.</h2>
            </div>
            <div className="bento">
              {[
                { wide: true,  accent: '#1CB0F6', icon: '🤖', bg: 'rgba(28,176,246,0.08)',  title: 'Personal AI Coach, 24/7',           desc: 'Adapts to your child\'s exact level. Explains the same concept 10 different ways — no frustration, no judgment. Like a private tutor that never sleeps.' },
                { wide: false, accent: '#FAA918', icon: '🎮', bg: 'rgba(250,169,24,0.08)',  title: 'Addictive by Design',               desc: 'XP, streaks, skill trees, badges. Kids open Plulai themselves. Average session: 28 minutes.' },
                { wide: false, accent: '#14D4F4', icon: '🌍', bg: 'rgba(20,212,244,0.08)',  title: 'Built for the GCC',                 desc: 'Full RTL + bilingual AI. Every example in Dubai, Riyadh, Doha. Built here first — not translated.' },
                { wide: false, accent: '#2B70C9', icon: '📊', bg: 'rgba(43,112,201,0.08)',  title: 'Parent Dashboard',                  desc: 'Track streaks, XP, badges and completion in real time. Weekly email summary.' },
                { wide: false, accent: '#FAA918', icon: '🏆', bg: 'rgba(250,169,24,0.08)',  title: 'Real Portfolio',                    desc: 'By month 3: an app, an AI tool and a pitch deck. Portfolio — not a participation certificate.' },
                { wide: true,  accent: '#1CB0F6', icon: '🔒', bg: 'rgba(28,176,246,0.06)',  title: 'Child-Safe by Design',             desc: 'No ads. Ever. AI responses filtered for child safety. Parent controls the account. Zero data sold. Built to KHDA standards.' },
              ].map((f, i) => (
                <div key={i} className={`bento-card${f.wide ? ' wide' : ''}`}>
                  <div className="bento-card-accent" style={{background:`linear-gradient(90deg,${f.accent},transparent)`}} />
                  <div className="bento-icon" style={{background:f.bg}}>
                    <span>{f.icon}</span>
                  </div>
                  <div className="bento-title">{f.title}</div>
                  <p className="bento-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="sec" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="sec-header">
              <p className="eyebrow">Simple to start</p>
              <h2 className="sec-h2">From zero to builder<br />in 3 steps</h2>
              <p className="sec-sub">No setup. No downloads. Works on any device right now.</p>
            </div>
            <div className="steps">
              {[
                { n: '01', title: 'Find your track', desc: 'Take the 60-second quiz. Get a curriculum matched to your child\'s age and goals.', time: '60 seconds' },
                { n: '02', title: 'Meet the AI coach', desc: 'Your child\'s personal AI tutor starts in English or Arabic. Lesson 1 begins immediately.', time: 'Day 1' },
                { n: '03', title: 'Build something real', desc: 'First real project by week 2. A full portfolio by month 3. Real things that exist.', time: 'Week 2' },
              ].map((s, i) => (
                <div key={i} className="step">
                  <div className="step-n" style={{color:i===0?'var(--blue)':i===1?'var(--gold)':'var(--cyan)'}}>{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                  <span className="step-time">{s.time}</span>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:'36px'}}>
              <Link href="/auth/signup" className="btn-primary">Start Step 1 — Free →</Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="stories" className="sec" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="sec-header-row">
              <div>
                <p className="eyebrow">1,000+ kids · 1 pattern</p>
                <h2 className="sec-h2">Real results.<br />Real kids.</h2>
              </div>
            </div>
            <div className="testi-grid">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="testi-card">
                  <span className="testi-win">✓ {t.win}</span>
                  <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <div className="testi-name">{t.name}, age {t.age}</div>
                    <div className="testi-role">{t.city}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="parent-grid">
              {PARENTS.map((p, i) => (
                <div key={i} className="parent-card">
                  <p className="parent-quote">&ldquo;{p.quote}&rdquo;</p>
                  <div className="parent-name">{p.name}</div>
                  <div className="parent-role">{p.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Lead magnet ── */}
        <section className="sec-sm">
          <div className="wrap">
            <div className="magnet">
              <div className="magnet-left">
                <span className="magnet-label">Free Download</span>
                <div className="magnet-title">GCC Tech Skills Report 2025</div>
                <p className="magnet-desc">Which skills will UAE employers pay a premium for by 2030? What salary gap exists between kids who code and those who don&apos;t? 12 pages of data — free.</p>
              </div>
              <div className="magnet-right">
                <Link href="/auth/signup?ref=report" className="btn-gold">Download Free →</Link>
                <p className="magnet-note">No spam. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Urgency ── */}
        <div className="urgency">
          <div className="urgency-h">Every week without Plulai is a week behind.</div>
          <p className="urgency-sub">Kids who start today will have 52 extra learning-weeks by this time next year. The skill gap compounds.</p>
          <Link href="/auth/signup" className="btn-primary">Start Free — 60 Seconds →</Link>
        </div>

        {/* ── Pricing ── */}
        <section className="sec">
          <div className="wrap-sm">
            <div className="sec-header" style={{textAlign:'center'}}>
              <p className="eyebrow" style={{textAlign:'center'}}>Simple pricing</p>
              <h2 className="sec-h2">Start free.<br />Upgrade when ready.</h2>
            </div>
            <div className="pricing-grid">
              <div className="price-card price-card-featured">
                <div className="price-badge">Most parents start here</div>
                <div className="price-plan">Free Plan</div>
                <div className="price-amount">AED 0 <span>/ mo</span></div>
                <div className="price-note">Forever free. No card needed.</div>
                <div className="price-line" />
                <div className="price-feats">
                  {['First module of each track','Personal AI coach','XP & streak system','Parent dashboard','Arabic & English','Any device'].map(f => (
                    <div key={f} className="price-feat"><span className="price-check">✓</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="btn-primary" style={{display:'block',textAlign:'center'}}>Start Free Now →</Link>
              </div>
              <div className="price-card" style={{opacity:0.7}}>
                <div className="price-plan">Pro Plan</div>
                <div className="price-amount">AED 79 <span>/ mo</span></div>
                <div className="price-note">Everything in Free, plus:</div>
                <div className="price-line" />
                <div className="price-feats">
                  {['All 200+ lessons unlocked','Advanced AI coaching','Full portfolio system','Live project feedback','Certificate of completion','Priority support'].map(f => (
                    <div key={f} className="price-feat"><span className="price-check price-check-muted">✓</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup?plan=pro" className="btn-outline" style={{display:'block',textAlign:'center'}}>Start with Pro →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── GCC ── */}
        <section className="sec" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="sec-header">
              <p className="eyebrow">Region-first platform</p>
              <h2 className="sec-h2">Built for the Gulf,<br />not translated for it.</h2>
              <p className="sec-sub">The only kids&apos; platform designed here — culturally relevant, fully bilingual, aligned with UAE Vision 2031.</p>
            </div>
            <div className="gcc-flags">
              {[
                {flag:'🇦🇪',name:'UAE'},{flag:'🇸🇦',name:'Saudi Arabia'},
                {flag:'🇶🇦',name:'Qatar'},{flag:'🇰🇼',name:'Kuwait'},
                {flag:'🇧🇭',name:'Bahrain'},{flag:'🇴🇲',name:'Oman'},
              ].map(c => (
                <div key={c.name} className="gcc-flag">
                  <div className="gcc-flag-emoji">{c.flag}</div>
                  <div className="gcc-flag-name">{c.name}</div>
                </div>
              ))}
            </div>
            <div className="gcc-cards">
              <div className="gcc-card">
                <div className="gcc-card-icon">🌐</div>
                <div className="gcc-card-title">Real Arabic, not translated</div>
                <p className="gcc-card-desc">Full RTL interface and an AI coach that teaches natively in Arabic. Not retrofitted — built region-first from day one.</p>
              </div>
              <div className="gcc-card">
                <div className="gcc-card-icon">🎓</div>
                <div className="gcc-card-title">Aligned with UAE Vision 2031</div>
                <p className="gcc-card-desc">AI, coding and entrepreneurship — the three skills pillars demanded of the next generation of Gulf citizens.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="sec" style={{paddingTop:0}}>
          <div className="wrap-md">
            <div className="sec-header">
              <p className="eyebrow">Questions</p>
              <h2 className="sec-h2">Everything parents<br />ask before signing up.</h2>
            </div>
            {FAQ.map((item, i) => <Faq key={i} q={item.q} a={item.a} n={i+1} />)}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="final">
          <div className="wrap-sm">
            <h2 className="final-h">
              The best time to start
              <span className="final-h-gold">was yesterday.</span>
            </h2>
            <p className="final-sub">Join 1,247 kids across the GCC who are already building the skills that matter.</p>
            <div className="final-chips">
              {['Free forever','No credit card','Arabic & English','Ages 6–18','No ads ever','Cancel anytime','Any device'].map(t => (
                <span key={t} className="final-chip">✓ {t}</span>
              ))}
            </div>
            <Link href="/auth/signup" className="btn-primary" style={{fontSize:'17px',padding:'18px 48px'}}>
              Claim Your Free Account →
            </Link>
            <p className="final-trust">Trusted by parents & teachers across the GCC · Safe for kids · No ads</p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo-text">Plu·lai</div>
              <p className="footer-tagline">The leading edtech platform for kids in the GCC. Coding, AI & Entrepreneurship for ages 6–18.</p>
            </div>
            <div className="footer-cols">
              <div>
                <div className="footer-col-head">Platform</div>
                <a href="#tracks"           className="footer-link">Tracks</a>
                <a href="#projects"         className="footer-link">What Kids Build</a>
                <Link href="/pricing"       className="footer-link">Pricing</Link>
                <Link href="/auth/signup"   className="footer-link">Sign Up Free</Link>
                <Link href="/sharkkid"      className="footer-link">🦈 Sharkkid</Link>
              </div>
              <div>
                <div className="footer-col-head">Countries</div>
                {['🇦🇪 UAE','🇸🇦 Saudi Arabia','🇶🇦 Qatar','🇰🇼 Kuwait','🇧🇭 Bahrain','🇴🇲 Oman'].map(c => (
                  <span key={c} className="footer-link" style={{display:'block',cursor:'default'}}>{c}</span>
                ))}
              </div>
              <div>
                <div className="footer-col-head">Company</div>
                <a href="mailto:hello@plulai.com"    className="footer-link">Contact</a>
                <a href="mailto:partners@plulai.com" className="footer-link">Partners</a>
                <a href="mailto:schools@plulai.com"  className="footer-link">Schools</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Plulai. Built in the GCC, for the GCC.</span>
            <a href="mailto:hello@plulai.com" className="footer-link" style={{marginBottom:0}}>hello@plulai.com</a>
          </div>
        </footer>

      </div>
    </>
  )
}
