'use client'
// Plulai Landing Page — Custom Brand Identity
// Design direction: Bold Geometric Editorial
// Color palette: Electric Blue (#1CB0F6), Cyan (#14D4F4), Navy (#2B70C9), Gold (#FAA918), Red (#D33131)
// NOT Duolingo. A confident GCC tech brand with sharp geometry, editorial rhythm, and deliberate restraint.

import { useState } from 'react'
import Link from 'next/link'

// ─── Quiz Data ────────────────────────────────────────────────────────────────
const QUIZ_STEPS = [
  {
    id: 'age',
    question: "How old is your child?",
    options: [
      { label: '6–8 yrs',   value: 'mini',   tag: 'Mini Explorer'   },
      { label: '9–11 yrs',  value: 'junior', tag: 'Junior Creator'  },
      { label: '12–14 yrs', value: 'pro',    tag: 'Pro Explorer'    },
      { label: '15–18 yrs', value: 'expert', tag: 'Tech Expert'     },
    ],
  },
  {
    id: 'interest',
    question: "What excites your child most?",
    options: [
      { label: 'Apps & Games',     value: 'coding', tag: 'Coding' },
      { label: 'AI & Smart Tech',  value: 'ai',     tag: 'AI'     },
      { label: 'Starting a Business', value: 'bizz', tag: 'Entrepreneurship' },
      { label: 'All of the Above', value: 'all',    tag: 'Full Curriculum' },
    ],
  },
  {
    id: 'goal',
    question: "What matters most to you?",
    options: [
      { label: 'Screen time with purpose', value: 'screen', tag: '' },
      { label: 'Future career advantage',  value: 'career', tag: '' },
      { label: 'Building confidence',      value: 'conf',   tag: '' },
      { label: 'Real skills, not theory',  value: 'skills', tag: '' },
    ],
  },
]

const TRACK_RESULT = {
  coding: { label: 'CODING TRACK',           desc: 'Python, web dev & game design. Real apps from week 2.' },
  ai:     { label: 'AI TRACK',               desc: 'Machine learning, AI ethics & their own AI project by month 2.' },
  bizz:   { label: 'ENTREPRENEURSHIP TRACK', desc: 'Startup thinking, MVP building & investor-ready pitches.' },
  all:    { label: 'FULL CURRICULUM',        desc: 'All 3 tracks — the complete future-skills package.' },
}

// ─── Page Data ────────────────────────────────────────────────────────────────
const PROJECTS = [
  { age: 9,  country: 'UAE',    project: 'A working calculator app in Python',      track: 'Coding', weeks: 3 },
  { age: 11, country: 'KSA',    project: 'An AI chatbot answering school questions', track: 'AI',     weeks: 6 },
  { age: 13, country: 'Qatar',  project: 'A startup pitch that won school finals',   track: 'Bizz',   weeks: 8 },
  { age: 10, country: 'Kuwait', project: "A website for their mum's business",       track: 'Coding', weeks: 4 },
  { age: 14, country: 'UAE',    project: 'An ML model that sorts recycling photos',  track: 'AI',     weeks: 7 },
  { age: 12, country: 'Bahrain','project': 'A fully-pitched mobile app idea to VCs', track: 'Bizz',   weeks: 9 },
]

const FEATURES = [
  { icon: '◈', title: 'Personal AI Coach, 24/7',           desc: 'Adapts to your child\'s exact level. Explains the same concept 10 different ways — no frustration, no judgment.', accent: '#1CB0F6' },
  { icon: '◉', title: 'Addictive Learning Engine',          desc: 'XP, daily streaks, skill trees, badges, level-ups. Kids open Plulai on their own. Average session: 28 minutes.', accent: '#FAA918' },
  { icon: '◎', title: 'Built for GCC, Not Copy-Pasted',    desc: 'Full Arabic RTL + bilingual AI coach. Every example is set in Dubai, Riyadh, Doha, Kuwait City — built here first.', accent: '#14D4F4' },
  { icon: '◆', title: 'Parent Dashboard & Weekly Report',   desc: 'Track streaks, XP, badges and lesson completion in real time. Stay involved without hovering.', accent: '#2B70C9' },
  { icon: '◇', title: 'Real Portfolio, Not Just a Cert',    desc: 'By month 3: an app, an AI tool and a pitch deck. A portfolio that exists in the world — not a participation certificate.', accent: '#FAA918' },
  { icon: '▣', title: 'Child-Safe by Design',               desc: 'No ads. Ever. AI responses filtered for child safety. Parent controls the account. Zero data sold.', accent: '#1CB0F6' },
]

const TRACKS = [
  {
    id: 'coding', label: 'CODING TRACK', title: 'Build Apps & Games',
    outcome: 'Real web app + game portfolio in 3 months',
    desc: 'From zero to building real apps and games. Python, HTML, logical thinking — explained simply, practised daily. Week 2: first working program.',
    skills: ['Python Basics', 'Web Development', 'Game Design', 'App Building'],
    color: '#1CB0F6',
  },
  {
    id: 'ai', label: 'AI TRACK', title: 'Build Intelligent Systems',
    outcome: 'A working AI project they built themselves',
    desc: 'Not watching AI videos — actually building AI. By month 2, your child has their own machine learning project.',
    skills: ['What is AI?', 'Machine Learning', 'AI Ethics', 'Build an AI Project'],
    color: '#FAA918',
  },
  {
    id: 'entrepreneurship', label: 'ENTREPRENEURSHIP TRACK', title: 'Launch Real Ventures',
    outcome: 'Full startup pitch + MVP in 3 months',
    desc: 'From first idea to polished investor pitch. Same startup thinking used in DIFC — adapted for young minds.',
    skills: ['Idea Generation', 'Market Research', 'Build a MVP', 'Pitch Your Startup'],
    color: '#14D4F4',
  },
]

const KID_TESTIMONIALS = [
  { name: 'Ahmed K.',  age: 13, location: 'Dubai, UAE',    quote: 'I built my first AI chatbot in 2 weeks. My teacher shared it with the whole class.', result: 'AI chatbot in 2 weeks' },
  { name: 'Sara M.',   age: 10, location: 'Riyadh, KSA',   quote: '21-day streak! I learn for 20 mins every night instead of watching YouTube.', result: '21-day streak' },
  { name: 'Nour R.',   age: 11, location: 'Kuwait City',   quote: 'I won my school startup competition. The judges couldn\'t believe an 11-year-old made that pitch.', result: 'Won school competition' },
]

const PARENT_TESTIMONIALS = [
  { name: 'Fatima Al-Mansoori', role: 'Mother of two · Dubai',  quote: 'I tried 4 other apps. None worked. My kids open Plulai by themselves, without me asking.' },
  { name: 'Khalid Al-Rashidi',  role: 'Father · Riyadh',        quote: 'The Arabic support is real — not Google Translate. Night and day difference.' },
  { name: 'Noura Al-Kuwari',    role: 'Mother · Doha',          quote: 'My daughter used to be glued to TikTok. Now she says she\'s building her portfolio.' },
]

const FAQ = [
  { q: 'What exactly is Plulai?',                       a: 'Plulai is the #1 edtech platform for kids aged 6–18 in the GCC. Kids learn coding, AI and entrepreneurship through a personal AI coach, 200+ lessons, and real projects — in English and Arabic.' },
  { q: 'Is it really free?',                            a: 'Yes — genuinely free. No credit card, no expiry. The free plan covers the first module of each track. Pro unlocks all 200+ lessons, advanced AI coaching and the full portfolio system.' },
  { q: 'What age is Plulai for?',                       a: 'Ages 6–18. The platform auto-adapts: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) — each with age-appropriate content and pacing.' },
  { q: 'Does it actually support Arabic?',              a: 'Real Arabic — not Google Translate. Full RTL interface and an AI coach that teaches natively in Arabic. The only platform built region-first for the GCC.' },
  { q: 'How long are the lessons?',                     a: '15–25 minutes each. Designed to fit after school without replacing homework time. Most kids end up doing two lessons instead of one.' },
  { q: 'How is it different from Scratch or Code.org?', a: 'Those are great starters. Plulai goes further: personalised AI coaching, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track — none of which those platforms offer.' },
]

// ─── Quiz Component ───────────────────────────────────────────────────────────
function TrackQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)

  const currentQ = QUIZ_STEPS[step - 1]
  const progress = step === 0 ? 0 : Math.round((step / QUIZ_STEPS.length) * 100)
  const trackKey = answers.interest ?? 'coding'
  const result = TRACK_RESULT[trackKey]

  function next() {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : 4)
  }

  if (step === 0) return (
    <div className="text-center py-4">
      <p className="quiz-eyebrow">60 seconds · 3 questions · personalised result</p>
      <h3 className="quiz-title">Find Your Child&apos;s Perfect Track</h3>
      <p className="quiz-sub">Tell us a little about your child — we&apos;ll match them to the right curriculum.</p>
      <button onClick={() => setStep(1)} className="btn-primary-lg mt-6">Build My Child&apos;s Plan →</button>
    </div>
  )

  if (step === 4) return (
    <div className="text-center py-4">
      <p className="quiz-eyebrow">Your personalised plan is ready</p>
      <div className="result-tag">{result.label}</div>
      <p className="quiz-sub mt-3 max-w-xs mx-auto">{result.desc}</p>
      <div className="progress-track mt-6 mb-2">
        <div className="progress-fill" style={{ width: '75%' }} />
      </div>
      <p className="text-xs font-bold" style={{ color: '#FAA918' }}>
        75% complete — create your free account to unlock the full plan
      </p>
      <Link href="/auth/signup" className="btn-primary-lg block max-w-xs mx-auto mt-5">
        Unlock My Child&apos;s Plan — Free →
      </Link>
      <p className="quiz-eyebrow mt-3">No credit card · Takes 60 seconds</p>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }} className="mt-4 text-xs underline" style={{ color: '#6F6F6F' }}>
        Start over
      </button>
    </div>
  )

  return (
    <div className="py-2">
      <div className="progress-track mb-5">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="quiz-eyebrow mb-1">Step {step} of {QUIZ_STEPS.length}</p>
      <h3 className="quiz-title mb-5">{currentQ.question}</h3>
      <div className="quiz-grid">
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`quiz-option ${selected === opt.value ? 'quiz-option-active' : ''}`}
          >
            <span className="font-bold text-sm">{opt.label}</span>
            {opt.tag && <span className="option-tag">{opt.tag}</span>}
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected} className={`btn-primary-lg w-full mt-5 ${!selected ? 'btn-disabled' : ''}`}>
        {step === QUIZ_STEPS.length ? 'See My Child\'s Plan →' : 'Next →'}
      </button>
    </div>
  )
}

// ─── Accordion Item ────────────────────────────────────────────────────────────
function AccordionItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="accordion-item">
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <span className="accordion-num">0{index + 1}</span>
        <span className="flex-1 text-left font-bold text-sm">{q}</span>
        <span className={`accordion-arrow ${open ? 'open' : ''}`}>↓</span>
      </button>
      {open && <p className="accordion-body">{a}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        /* ── Brand Tokens ── */
        :root {
          --blue:   #1CB0F6;
          --cyan:   #14D4F4;
          --navy:   #2B70C9;
          --gold:   #FAA918;
          --red:    #D33131;
          --light:  #F5F5F5;
          --muted:  #6F6F6F;
          --dark:   #0A0E1A;
          --card:   #0E1422;
          --card2:  #131929;
          --border: rgba(255,255,255,0.07);
          --font-display: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
        }

        /* ── Reset & Base ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--dark); color: var(--light); font-family: var(--font-display); }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; border: none; background: none; font-family: inherit; color: inherit; }

        /* ── Geometric Background ── */
        .geo-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 800px 600px at 10% 20%, rgba(28,176,246,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 600px 400px at 90% 80%, rgba(250,169,24,0.05) 0%, transparent 60%),
            var(--dark);
        }
        .geo-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(28,176,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(28,176,246,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .geo-accent {
          position: absolute; top: -200px; right: -200px; width: 600px; height: 600px;
          border: 1px solid rgba(28,176,246,0.08);
          transform: rotate(15deg);
        }
        .geo-accent-2 {
          position: absolute; bottom: 20%; left: -150px; width: 400px; height: 400px;
          border: 1px solid rgba(250,169,24,0.06);
          transform: rotate(-8deg);
        }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 64px;
          background: rgba(10,14,26,0.92);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px);
        }
        .nav-logo {
          font-size: 22px; font-weight: 900; letter-spacing: -0.5px;
          color: var(--light);
        }
        .nav-logo span { color: var(--blue); }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 13px; font-weight: 600; color: var(--muted); transition: color 0.2s; }
        .nav-link:hover { color: var(--light); }
        .nav-actions { display: flex; align-items: center; gap: 10px; }

        /* ── Buttons ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; font-size: 13px; font-weight: 700;
          background: var(--blue); color: #fff;
          border-radius: 6px; transition: all 0.2s;
        }
        .btn-primary:hover { background: #0a9de0; transform: translateY(-1px); }
        .btn-ghost {
          display: inline-flex; align-items: center;
          padding: 10px 16px; font-size: 13px; font-weight: 600;
          color: var(--muted); border-radius: 6px;
          border: 1px solid var(--border); transition: all 0.2s;
        }
        .btn-ghost:hover { color: var(--light); border-color: rgba(255,255,255,0.15); }
        .btn-gold {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; font-size: 13px; font-weight: 700;
          background: var(--gold); color: #0A0E1A;
          border-radius: 6px; transition: all 0.2s;
        }
        .btn-gold:hover { background: #e89c0f; transform: translateY(-1px); }
        .btn-primary-lg {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 16px 32px; font-size: 15px; font-weight: 700;
          background: var(--blue); color: #fff;
          border-radius: 6px; transition: all 0.2s; border: none;
        }
        .btn-primary-lg:hover { background: #0a9de0; transform: translateY(-2px); }
        .btn-outline-lg {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 15px 32px; font-size: 15px; font-weight: 700;
          color: var(--light); border: 1px solid var(--border);
          border-radius: 6px; transition: all 0.2s;
        }
        .btn-outline-lg:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.03); }
        .btn-disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-disabled:hover { transform: none; background: var(--blue); }

        /* ── Page Layout ── */
        .page { position: relative; z-index: 1; min-height: 100vh; }
        .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
        .container-sm { max-width: 720px; margin: 0 auto; padding: 0 24px; }

        /* ── Ticker ── */
        .ticker {
          margin-top: 64px;
          background: rgba(28,176,246,0.06);
          border-bottom: 1px solid rgba(28,176,246,0.12);
          padding: 10px 24px;
          display: flex; align-items: center; justify-content: center;
          gap: 24px; flex-wrap: wrap;
          font-size: 12px; font-weight: 600; color: var(--muted);
        }
        .ticker-live { display: flex; align-items: center; gap: 6px; }
        .pulse-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .ticker strong { color: var(--light); }
        .ticker-div { color: rgba(255,255,255,0.1); }

        /* ── Hero ── */
        .hero {
          padding: 80px 24px 100px;
          text-align: center;
          max-width: 1120px; margin: 0 auto;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 4px;
          background: rgba(209,49,49,0.12); border: 1px solid rgba(209,49,49,0.25);
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          color: #f87171; text-transform: uppercase; margin-bottom: 28px;
        }
        .hero-title {
          font-size: clamp(44px, 7vw, 88px);
          font-weight: 900; line-height: 1.0;
          letter-spacing: -2px; margin-bottom: 24px;
          color: var(--light);
        }
        .hero-title-accent {
          display: block;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 17px; font-weight: 500; line-height: 1.6;
          color: var(--muted); max-width: 580px; margin: 0 auto 32px;
        }
        .hero-sub strong { color: var(--light); font-weight: 700; }
        .hero-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; margin-bottom: 40px;
        }
        .hero-chip {
          padding: 5px 12px; border-radius: 4px;
          border: 1px solid var(--border);
          font-size: 11px; font-weight: 600; color: var(--muted);
        }
        .hero-actions {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; flex-wrap: wrap; margin-bottom: 64px;
        }
        .stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; border: 1px solid var(--border); border-radius: 8px;
          overflow: hidden;
        }
        .stat-cell {
          background: var(--card); padding: 24px 20px; text-align: center;
        }
        .stat-value {
          font-size: 28px; font-weight: 900; letter-spacing: -1px;
          color: var(--light); margin-bottom: 4px;
        }
        .stat-label { font-size: 12px; font-weight: 600; color: var(--muted); }
        .stat-live {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; margin-bottom: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          color: #22c55e; text-transform: uppercase;
        }

        /* ── Section Headers ── */
        .section { padding: 100px 24px; }
        .eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--blue);
          margin-bottom: 12px;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 900; letter-spacing: -1.5px;
          line-height: 1.05; margin-bottom: 16px; color: var(--light);
        }
        .section-sub {
          font-size: 15px; font-weight: 500; line-height: 1.6;
          color: var(--muted); max-width: 540px;
        }

        /* ── Quiz Section ── */
        .quiz-panel {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 40px;
        }
        .quiz-panel-header {
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px; margin-bottom: 28px;
          display: flex; align-items: center; gap: 16px;
        }
        .quiz-panel-dot {
          width: 10px; height: 10px; border-radius: 50%; background: var(--blue);
        }
        .quiz-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted);
        }
        .quiz-title {
          font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
          color: var(--light); margin: 6px 0;
        }
        .quiz-sub { font-size: 13px; font-weight: 500; color: var(--muted); }
        .quiz-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .quiz-option {
          display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
          padding: 16px; border-radius: 8px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          transition: all 0.15s; text-align: left;
          color: var(--light);
        }
        .quiz-option:hover { border-color: rgba(28,176,246,0.3); background: rgba(28,176,246,0.04); }
        .quiz-option-active {
          border-color: var(--blue) !important;
          background: rgba(28,176,246,0.08) !important;
        }
        .option-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--blue);
        }
        .progress-track {
          height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden;
        }
        .progress-fill {
          height: 100%; background: var(--blue); border-radius: 99px;
          transition: width 0.5s ease;
        }
        .result-tag {
          display: inline-block; margin-top: 12px;
          padding: 8px 20px; border-radius: 4px;
          background: rgba(28,176,246,0.12); border: 1px solid rgba(28,176,246,0.25);
          font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--blue);
        }

        /* ── Projects Grid ── */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
        }
        .project-card {
          background: var(--card); padding: 28px 24px;
          transition: background 0.2s;
        }
        .project-card:hover { background: var(--card2); }
        .project-track-badge {
          display: inline-block; padding: 3px 10px; border-radius: 3px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 12px;
        }
        .project-quote {
          font-size: 14px; font-weight: 600; line-height: 1.5;
          color: var(--light); margin-bottom: 16px;
        }
        .project-meta { font-size: 11px; font-weight: 600; color: var(--muted); }

        /* ── Features ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
          border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
        }
        .feature-card {
          background: var(--card); padding: 32px 28px;
          border-right: 1px solid var(--border);
          transition: background 0.2s;
        }
        .feature-card:hover { background: var(--card2); }
        .feature-icon {
          font-size: 24px; margin-bottom: 16px; display: block;
        }
        .feature-title {
          font-size: 15px; font-weight: 800; color: var(--light);
          margin-bottom: 10px; letter-spacing: -0.2px;
        }
        .feature-desc { font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--muted); }

        /* ── Tracks ── */
        .tracks-layout {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .track-card {
          border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .track-header {
          padding: 28px 24px 20px;
          border-bottom: 1px solid var(--border);
        }
        .track-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .track-title {
          font-size: 20px; font-weight: 900; letter-spacing: -0.5px;
          color: var(--light); margin-bottom: 10px;
        }
        .track-outcome {
          display: inline-flex; padding: 5px 12px; border-radius: 4px;
          font-size: 11px; font-weight: 700;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--light);
        }
        .track-body { padding: 20px 24px; flex: 1; background: var(--card); }
        .track-desc { font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--muted); margin-bottom: 16px; }
        .track-skills { display: flex; flex-direction: column; gap: 8px; }
        .track-skill {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; color: var(--light);
        }
        .track-skill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* ── Steps ── */
        .steps-layout {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
          border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
        }
        .step-card { background: var(--card); padding: 36px 28px; position: relative; }
        .step-num {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--blue); margin-bottom: 20px;
        }
        .step-title {
          font-size: 17px; font-weight: 800; letter-spacing: -0.3px;
          color: var(--light); margin-bottom: 10px;
        }
        .step-desc { font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--muted); }
        .step-time {
          display: inline-block; margin-top: 16px;
          padding: 4px 10px; border-radius: 3px;
          background: rgba(28,176,246,0.08); border: 1px solid rgba(28,176,246,0.15);
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--blue);
        }
        .step-arrow {
          position: absolute; top: 50%; right: -16px;
          transform: translateY(-50%);
          font-size: 18px; color: var(--muted); z-index: 2;
          background: var(--dark); padding: 0 2px;
        }

        /* ── Testimonials ── */
        .testimonials-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .testimonial-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 10px; padding: 28px 24px;
          display: flex; flex-direction: column;
        }
        .testimonial-result {
          display: inline-block; padding: 4px 10px; border-radius: 3px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--blue);
          background: rgba(28,176,246,0.08); border: 1px solid rgba(28,176,246,0.15);
          margin-bottom: 16px; align-self: flex-start;
        }
        .testimonial-quote {
          font-size: 13px; font-weight: 500; line-height: 1.65;
          color: var(--light); font-style: italic; flex: 1; margin-bottom: 20px;
        }
        .testimonial-name { font-size: 13px; font-weight: 700; color: var(--light); }
        .testimonial-role { font-size: 11px; font-weight: 600; color: var(--muted); margin-top: 2px; }

        .parent-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .parent-card {
          background: rgba(43,112,201,0.05);
          border: 1px solid rgba(43,112,201,0.12);
          border-radius: 10px; padding: 24px;
        }
        .parent-quote {
          font-size: 13px; font-weight: 500; line-height: 1.65;
          color: var(--light); font-style: italic; margin-bottom: 16px;
        }
        .parent-name { font-size: 12px; font-weight: 700; color: var(--light); }
        .parent-role { font-size: 11px; font-weight: 600; color: var(--muted); }

        /* ── Pricing ── */
        .pricing-layout {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 680px; margin: 0 auto;
        }
        .pricing-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 10px; padding: 32px 28px;
        }
        .pricing-card-featured { border-color: var(--blue); }
        .pricing-badge {
          display: inline-block; margin-bottom: 16px;
          padding: 4px 10px; border-radius: 3px;
          background: rgba(28,176,246,0.1); border: 1px solid rgba(28,176,246,0.2);
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--blue);
        }
        .pricing-plan { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
        .pricing-price {
          font-size: 44px; font-weight: 900; letter-spacing: -2px;
          color: var(--light); line-height: 1; margin-bottom: 4px;
        }
        .pricing-price span { font-size: 16px; font-weight: 600; color: var(--muted); }
        .pricing-note { font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 24px; }
        .pricing-divider { height: 1px; background: var(--border); margin: 20px 0; }
        .pricing-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .pricing-feature {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: var(--light);
        }
        .pricing-check { width: 16px; height: 16px; flex-shrink: 0; }

        /* ── GCC ── */
        .gcc-grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px;
          border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
          margin-bottom: 24px;
        }
        .gcc-cell {
          background: var(--card); padding: 20px 12px; text-align: center;
        }
        .gcc-flag { font-size: 28px; margin-bottom: 6px; }
        .gcc-name { font-size: 12px; font-weight: 700; color: var(--light); }
        .gcc-lang-cards {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .gcc-lang-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 10px; padding: 28px 24px;
        }
        .gcc-lang-icon { font-size: 24px; margin-bottom: 12px; display: block; }
        .gcc-lang-title { font-size: 16px; font-weight: 800; color: var(--light); margin-bottom: 8px; }
        .gcc-lang-desc { font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--muted); }

        /* ── Urgency Band ── */
        .urgency-band {
          background: rgba(28,176,246,0.05);
          border-top: 1px solid rgba(28,176,246,0.1);
          border-bottom: 1px solid rgba(28,176,246,0.1);
          padding: 60px 24px; text-align: center;
        }
        .urgency-title {
          font-size: clamp(22px, 3.5vw, 36px);
          font-weight: 900; letter-spacing: -1px;
          color: var(--light); margin-bottom: 12px;
        }
        .urgency-sub { font-size: 15px; font-weight: 500; color: var(--muted); max-width: 480px; margin: 0 auto 28px; }

        /* ── Lead Magnet ── */
        .magnet-panel {
          background: var(--card);
          border: 1px solid rgba(250,169,24,0.2);
          border-radius: 12px; padding: 40px;
          display: flex; align-items: center; gap: 40px;
        }
        .magnet-left { flex: 1; }
        .magnet-icon { font-size: 40px; margin-bottom: 12px; }
        .magnet-title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: var(--light); margin-bottom: 8px; }
        .magnet-desc { font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--muted); }
        .magnet-right { flex-shrink: 0; }

        /* ── FAQ ── */
        .accordion-item {
          border-bottom: 1px solid var(--border);
        }
        .accordion-trigger {
          display: flex; align-items: center; gap: 16px;
          width: 100%; padding: 20px 0; text-align: left;
          color: var(--light);
        }
        .accordion-num {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          color: var(--blue); width: 28px; flex-shrink: 0;
        }
        .accordion-arrow {
          font-size: 14px; color: var(--muted); flex-shrink: 0;
          transition: transform 0.2s; display: inline-block;
        }
        .accordion-arrow.open { transform: rotate(180deg); }
        .accordion-body {
          padding: 0 0 20px 44px;
          font-size: 13px; font-weight: 500; line-height: 1.7; color: var(--muted);
        }

        /* ── Final CTA ── */
        .final-cta {
          padding: 120px 24px; text-align: center;
        }
        .final-title {
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 900; letter-spacing: -2px; line-height: 1.0;
          color: var(--light); margin-bottom: 20px;
        }
        .final-title-accent {
          display: block;
          background: linear-gradient(135deg, var(--gold), #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .final-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; margin-bottom: 36px;
        }
        .final-chip {
          padding: 5px 12px; border-radius: 4px;
          border: 1px solid var(--border);
          font-size: 11px; font-weight: 600; color: var(--muted);
        }

        /* ── Footer ── */
        .footer {
          border-top: 1px solid var(--border);
          padding: 48px 24px;
        }
        .footer-inner {
          max-width: 1120px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 40px; flex-wrap: wrap;
        }
        .footer-logo { font-size: 18px; font-weight: 900; color: var(--light); }
        .footer-logo span { color: var(--blue); }
        .footer-cols { display: flex; gap: 64px; }
        .footer-col-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--light); margin-bottom: 14px; }
        .footer-col-link { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 8px; transition: color 0.2s; }
        .footer-col-link:hover { color: var(--light); }
        .footer-bottom {
          max-width: 1120px; margin: 32px auto 0;
          padding-top: 24px; border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
          font-size: 11px; font-weight: 600; color: var(--muted);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .projects-grid, .features-grid { grid-template-columns: 1fr; }
          .tracks-layout, .steps-layout { grid-template-columns: 1fr; }
          .testimonials-grid, .parent-grid { grid-template-columns: 1fr; }
          .gcc-grid { grid-template-columns: repeat(3, 1fr); }
          .gcc-lang-cards { grid-template-columns: 1fr; }
          .pricing-layout { grid-template-columns: 1fr; }
          .magnet-panel { flex-direction: column; gap: 20px; }
          .quiz-grid { grid-template-columns: 1fr; }
          .footer-cols { gap: 32px; flex-wrap: wrap; }
          .hero-title { letter-spacing: -1px; }
        }
      `}</style>

      <div className="geo-bg">
        <div className="geo-lines" />
        <div className="geo-accent" />
        <div className="geo-accent-2" />
      </div>

      <div className="page">

        {/* ── Nav ── */}
        <nav className="nav">
          <div className="nav-logo">Plu<span>lai</span></div>
          <div className="nav-links">
            <a href="#quiz"     className="nav-link">Find a Track</a>
            <a href="#projects" className="nav-link">What Kids Build</a>
            <a href="#tracks"   className="nav-link">Tracks</a>
            <a href="#faq"      className="nav-link">FAQ</a>
          </div>
          <div className="nav-actions">
            <Link href="/sharkkid" className="btn-gold">🦈 Sharkkid</Link>
            <Link href="/auth/login"  className="nav-link" style={{ padding: '10px' }}>Log In</Link>
            <Link href="/auth/signup" className="btn-primary">Start Free →</Link>
          </div>
        </nav>

        {/* ── Ticker ── */}
        <div className="ticker">
          <div className="ticker-live">
            <div className="pulse-dot" />
            <span><strong>1,247 kids</strong> learning right now</span>
          </div>
          <span className="ticker-div">|</span>
          <span>⭐ 4.9 rated by 800+ GCC parents</span>
          <span className="ticker-div">|</span>
          <span>🇦🇪 🇸🇦 🇶🇦 🇰🇼 🇧🇭 🇴🇲 &nbsp; 6 countries</span>
          <span className="ticker-div">|</span>
          <span>🔒 No ads · Child-safe · Arabic & English</span>
        </div>

        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-eyebrow">
            <span className="pulse-dot" style={{ background: '#f87171' }} />
            Only 43 spots remaining this week
          </div>
          <h1 className="hero-title">
            Your Child's Peers<br />
            <span className="hero-title-accent">Are Building the Future.</span>
          </h1>
          <p className="hero-sub">
            Kids across the GCC are building apps, AI tools, and startup pitches.{' '}
            <strong>Plulai is the 15-min daily habit</strong> that puts your child in that group.
          </p>
          <div className="hero-chips">
            {['Free forever plan', 'No credit card', 'Arabic & English', 'Ages 6–18', 'No ads ever'].map(t => (
              <span key={t} className="hero-chip">✓ {t}</span>
            ))}
          </div>
          <div className="hero-actions">
            <Link href="/auth/signup" className="btn-primary-lg">Claim Your Free Spot →</Link>
            <a href="#quiz" className="btn-outline-lg">Find My Child&apos;s Track</a>
          </div>

          <div className="stats-row">
            {[
              { value: '1,247', label: 'Kids learning right now', live: true },
              { value: '6',     label: 'GCC countries served',   live: false },
              { value: '200+',  label: 'Lessons & projects',     live: false },
              { value: '4.9★',  label: 'Average parent rating',  live: false },
            ].map(s => (
              <div key={s.label} className="stat-cell">
                {s.live && <div className="stat-live"><div className="pulse-dot" />Live</div>}
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quiz ── */}
        <section id="quiz" className="section" style={{ paddingTop: 60 }}>
          <div className="container-sm">
            <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 260px' }}>
                <p className="eyebrow">Track Finder</p>
                <h2 className="section-title" style={{ fontSize: 32 }}>Build Your Child&apos;s Learning Plan</h2>
                <p className="section-sub" style={{ fontSize: 13 }}>3 questions · 60 seconds · Personalised curriculum recommendation matched to your child&apos;s age and goals.</p>
              </div>
              <div style={{ flex: 1 }}>
                <div className="quiz-panel">
                  <div className="quiz-panel-header">
                    <div className="quiz-panel-dot" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Plulai Track Finder — Free personalisation</span>
                  </div>
                  <TrackQuiz />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What Kids Build ── */}
        <section id="projects" className="section" style={{ paddingTop: 60 }}>
          <div className="container">
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p className="eyebrow">Real Output. Not Theory.</p>
                <h2 className="section-title">What Kids Build on Plulai</h2>
                <p className="section-sub">Every child builds a real portfolio — things that exist in the world.</p>
              </div>
              <Link href="/auth/signup" className="btn-primary" style={{ flexShrink: 0 }}>Start Building Free →</Link>
            </div>
            <div className="projects-grid">
              {PROJECTS.map((p, i) => {
                const colors = { Coding: { bg: 'rgba(28,176,246,0.08)', text: '#1CB0F6' }, AI: { bg: 'rgba(250,169,24,0.08)', text: '#FAA918' }, Bizz: { bg: 'rgba(20,212,244,0.08)', text: '#14D4F4' } }
                const c = colors[p.track] || colors.Coding
                return (
                  <div key={i} className="project-card">
                    <span className="project-track-badge" style={{ background: c.bg, color: c.text }}>{p.track}</span>
                    <p className="project-quote">&ldquo;{p.project}&rdquo;</p>
                    <p className="project-meta">{p.country} · Age {p.age} · Week {p.weeks}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section" style={{ paddingTop: 40 }}>
          <div className="container">
            <div style={{ marginBottom: 40 }}>
              <p className="eyebrow">Why Plulai Works</p>
              <h2 className="section-title">Why Kids Love It &amp; Parents Trust It</h2>
              <p className="section-sub">Built for the GCC — in their language, at their level, with their culture.</p>
            </div>
            <div className="features-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-card">
                  <span className="feature-icon" style={{ color: f.accent }}>{f.icon}</span>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tracks ── */}
        <section id="tracks" className="section">
          <div className="container">
            <div style={{ marginBottom: 40 }}>
              <p className="eyebrow">3 Tracks · 60+ Lessons Each</p>
              <h2 className="section-title">Which Future Will They Build?</h2>
              <p className="section-sub">Every path leads to skills the GCC economy will pay a premium for in 2030. Most kids do all three.</p>
            </div>
            <div className="tracks-layout">
              {TRACKS.map(t => (
                <div key={t.id} className="track-card">
                  <div className="track-header" style={{ background: `${t.color}08`, borderBottom: `1px solid ${t.color}15` }}>
                    <div className="track-label" style={{ color: t.color }}>{t.label}</div>
                    <div className="track-title">{t.title}</div>
                    <span className="track-outcome" style={{ borderColor: `${t.color}20`, color: t.color, background: `${t.color}08` }}>
                      ✓ {t.outcome}
                    </span>
                  </div>
                  <div className="track-body">
                    <p className="track-desc">{t.desc}</p>
                    <div className="track-skills">
                      {t.skills.map(s => (
                        <div key={s} className="track-skill">
                          <div className="track-skill-dot" style={{ background: t.color }} />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="section">
          <div className="container">
            <div style={{ marginBottom: 40 }}>
              <p className="eyebrow">Simple to Start</p>
              <h2 className="section-title">From Zero to Builder in 3 Steps</h2>
              <p className="section-sub">No setup. No downloads. Works on any device right now.</p>
            </div>
            <div className="steps-layout">
              {[
                { step: 'Step 01', title: 'Find Your Track', desc: "Take the 60-second quiz. Get a curriculum matched to your child&apos;s age and interests.", time: '60 seconds' },
                { step: 'Step 02', title: 'Meet the AI Coach', desc: "Your child's personal AI tutor introduces itself in English or Arabic and starts lesson 1.", time: 'Day 1' },
                { step: 'Step 03', title: 'Build Something Real', desc: 'By week 2, your child completes their first real project. By month 3, a full portfolio.', time: 'Week 2' },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <p className="step-num">{s.step}</p>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                  <span className="step-time">{s.time}</span>
                  {i < 2 && <span className="step-arrow">→</span>}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/auth/signup" className="btn-primary-lg">Start Step 1 — Free →</Link>
            </div>
          </div>
        </section>

        {/* ── Kid Testimonials ── */}
        <section id="stories" className="section">
          <div className="container">
            <div style={{ marginBottom: 40 }}>
              <p className="eyebrow">1,000+ Kids · 1 Pattern</p>
              <h2 className="section-title">Real Results. Real Kids.</h2>
              <p className="section-sub">Every kid on our platform has a story like these. This is the norm, not the exception.</p>
            </div>
            <div className="testimonials-grid">
              {KID_TESTIMONIALS.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <span className="testimonial-result">✓ {t.result}</span>
                  <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <div className="testimonial-name">{t.name}, age {t.age}</div>
                    <div className="testimonial-role">{t.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Parent Testimonials ── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--light)', letterSpacing: '-0.5px', marginBottom: 24 }}>What Parents Say</h3>
            <div className="parent-grid">
              {PARENT_TESTIMONIALS.map((t, i) => (
                <div key={i} className="parent-card">
                  <p className="parent-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="parent-name">{t.name}</div>
                  <div className="parent-role">{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Lead Magnet ── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="magnet-panel">
              <div className="magnet-left">
                <div className="magnet-icon">📊</div>
                <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 3, background: 'rgba(250,169,24,0.1)', border: '1px solid rgba(250,169,24,0.2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Free Download</div>
                <div className="magnet-title">GCC Tech Skills Report 2025</div>
                <p className="magnet-desc">Which skills will UAE employers pay a premium for by 2030? What salary gap exists between kids who code and those who don&apos;t? 12 pages of data — free, no spam.</p>
              </div>
              <div className="magnet-right">
                <Link href="/auth/signup?ref=report" className="btn-gold" style={{ fontSize: 14, padding: '14px 28px' }}>
                  Download Free Report →
                </Link>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>No spam. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Urgency ── */}
        <div className="urgency-band">
          <div className="urgency-title">Every Week Without Plulai Is a Week Behind.</div>
          <p className="urgency-sub">Kids who start today will have 52 extra learning-weeks by this time next year. The skill gap compounds.</p>
          <Link href="/auth/signup" className="btn-primary-lg">Start Free — Takes 60 Seconds →</Link>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 12 }}>No credit card · Any device · Cancel anytime</p>
        </div>

        {/* ── Pricing ── */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="eyebrow">Simple Pricing</p>
              <h2 className="section-title">Start Free. Upgrade When Ready.</h2>
            </div>
            <div className="pricing-layout">
              <div className="pricing-card pricing-card-featured">
                <div className="pricing-badge">Most parents start here</div>
                <div className="pricing-plan">Free Plan</div>
                <div className="pricing-price">AED 0 <span>/ month</span></div>
                <div className="pricing-note">Forever free. No card needed.</div>
                <div className="pricing-divider" />
                <div className="pricing-features">
                  {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                    <div key={f} className="pricing-feature">
                      <svg className="pricing-check" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="#1CB0F6" strokeOpacity="0.3"/><path d="M5 8l2 2 4-4" stroke="#1CB0F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" className="btn-primary-lg" style={{ width: '100%' }}>Start Free Now →</Link>
              </div>
              <div className="pricing-card" style={{ opacity: 0.75 }}>
                <div className="pricing-plan">Pro Plan</div>
                <div className="pricing-price">AED 79 <span>/ month</span></div>
                <div className="pricing-note">Everything in Free, plus:</div>
                <div className="pricing-divider" />
                <div className="pricing-features">
                  {['All 200+ lessons unlocked', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Certificate of completion', 'Priority support'].map(f => (
                    <div key={f} className="pricing-feature" style={{ color: 'var(--muted)' }}>
                      <svg className="pricing-check" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="#6F6F6F" strokeOpacity="0.3"/><path d="M5 8l2 2 4-4" stroke="#6F6F6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup?plan=pro" className="btn-outline-lg" style={{ width: '100%' }}>Start with Pro →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── GCC ── */}
        <section id="gcc" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ marginBottom: 32 }}>
              <p className="eyebrow">Region-First Platform</p>
              <h2 className="section-title">The GCC&apos;s #1 Edtech Platform</h2>
              <p className="section-sub">The only kids&apos; platform built here — culturally relevant, fully bilingual, designed for the next generation.</p>
            </div>
            <div className="gcc-grid">
              {[
                { flag: '🇦🇪', name: 'UAE' }, { flag: '🇸🇦', name: 'Saudi Arabia' },
                { flag: '🇶🇦', name: 'Qatar' }, { flag: '🇰🇼', name: 'Kuwait' },
                { flag: '🇧🇭', name: 'Bahrain' }, { flag: '🇴🇲', name: 'Oman' },
              ].map(c => (
                <div key={c.name} className="gcc-cell">
                  <div className="gcc-flag">{c.flag}</div>
                  <div className="gcc-name">{c.name}</div>
                </div>
              ))}
            </div>
            <div className="gcc-lang-cards">
              <div className="gcc-lang-card">
                <span className="gcc-lang-icon">🌐</span>
                <div className="gcc-lang-title">Real Arabic, Not Translated</div>
                <p className="gcc-lang-desc">Complete RTL interface. AI coach that teaches natively in Arabic. The only platform built for Arabic-speaking kids first — not retrofitted.</p>
              </div>
              <div className="gcc-lang-card">
                <span className="gcc-lang-icon">🎓</span>
                <div className="gcc-lang-title">Aligned with UAE Vision 2031</div>
                <p className="gcc-lang-desc">Curriculum designed to prepare kids for the skills economy — AI, coding and entrepreneurship are the three pillars demanded of the next generation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="section">
          <div className="container-sm">
            <div style={{ marginBottom: 48 }}>
              <p className="eyebrow">FAQ</p>
              <h2 className="section-title">Your Questions, Answered.</h2>
              <p className="section-sub">Everything parents ask us before signing up.</p>
            </div>
            <div>
              {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} index={i} />)}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="final-cta">
          <div className="container-sm">
            <h2 className="final-title">
              The Best Time to Start<br />
              <span className="final-title-accent">Was Yesterday.</span>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--muted)', maxWidth: 480, margin: '0 auto 28px' }}>
              Join 1,247 kids across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman building the skills that matter.
            </p>
            <div className="final-chips">
              {['Free forever', 'No credit card', 'Arabic & English', 'Ages 6–18', 'No ads ever', 'Cancel anytime', 'Any device'].map(t => (
                <span key={t} className="final-chip">✓ {t}</span>
              ))}
            </div>
            <Link href="/auth/signup" className="btn-primary-lg" style={{ fontSize: 17, padding: '18px 48px' }}>
              Claim Your Free Account →
            </Link>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 16, opacity: 0.7 }}>
              Trusted by parents & teachers across the GCC · Safe for kids · No ads
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div>
              <div className="footer-logo">Plu<span>lai</span></div>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', maxWidth: 220, lineHeight: 1.6, marginTop: 8 }}>
                The #1 edtech platform for kids in the GCC. Coding, AI & Entrepreneurship for ages 6–18.
              </p>
            </div>
            <div className="footer-cols">
              <div>
                <div className="footer-col-title">Platform</div>
                <a href="#quiz"            className="footer-col-link">Find a Track</a>
                <a href="#projects"        className="footer-col-link">What Kids Build</a>
                <Link href="/pricing"      className="footer-col-link">Pricing</Link>
                <Link href="/auth/signup"  className="footer-col-link">Sign Up Free</Link>
                <Link href="/sharkkid"     className="footer-col-link">🦈 Sharkkid</Link>
              </div>
              <div>
                <div className="footer-col-title">Countries</div>
                {['🇦🇪 UAE', '🇸🇦 Saudi Arabia', '🇶🇦 Qatar', '🇰🇼 Kuwait', '🇧🇭 Bahrain', '🇴🇲 Oman'].map(c => (
                  <span key={c} className="footer-col-link" style={{ display: 'block' }}>{c}</span>
                ))}
              </div>
              <div>
                <div className="footer-col-title">Company</div>
                <a href="mailto:hello@plulai.com"    className="footer-col-link">Contact</a>
                <a href="mailto:partners@plulai.com" className="footer-col-link">Partners</a>
                <a href="mailto:schools@plulai.com"  className="footer-col-link">Schools</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Plulai. Built in the GCC, for the GCC.</span>
            <a href="mailto:hello@plulai.com" className="footer-col-link" style={{ marginBottom: 0 }}>hello@plulai.com</a>
          </div>
        </footer>

      </div>
    </>
  )
}