'use client'
// app/page.tsx — Plulai Landing Page v3 — brand palette + varied layout

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Sky:    #1CB0F6  Cyan:   #14D4F4  Blue:   #2B70C9
// Gold:   #FAA918  Red:    #D33131  Light:  #F5F5F5  Mid:    #6F6F6F

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'age',
    question: 'How old is your child?',
    options: [
      { label: '6–8 years',   sub: 'Mini Explorer',   value: 'mini',   emoji: '🌱' },
      { label: '9–11 years',  sub: 'Junior Creator',  value: 'junior', emoji: '⚡' },
      { label: '12–14 years', sub: 'Pro Explorer',    value: 'pro',    emoji: '🚀' },
      { label: '15–18 years', sub: 'Tech Expert',     value: 'expert', emoji: '🔥' },
    ],
  },
  {
    id: 'interest',
    question: 'What excites them most?',
    options: [
      { label: 'Building apps & games', sub: 'Coding track',     value: 'coding', emoji: '💻' },
      { label: 'AI & smart tech',       sub: 'AI track',         value: 'ai',     emoji: '🧠' },
      { label: 'Starting a business',   sub: 'Entrepreneurship', value: 'bizz',   emoji: '💡' },
      { label: 'Not sure yet',          sub: "We'll guide you",  value: 'all',    emoji: '🗺️' },
    ],
  },
  {
    id: 'goal',
    question: 'What matters most to you?',
    options: [
      { label: 'Screen time with purpose', sub: '', value: 'screen', emoji: '📱' },
      { label: 'Future career advantage',  sub: '', value: 'career', emoji: '🏆' },
      { label: 'Building confidence',      sub: '', value: 'conf',   emoji: '💪' },
      { label: 'Real skills, not theory',  sub: '', value: 'skills', emoji: '🛠️' },
    ],
  },
]

const TRACK_RESULT: Record<string, { title: string; desc: string; emoji: string; color: string }> = {
  coding: { emoji: '💻', color: '#1CB0F6', title: 'Coding Track',           desc: 'Start with Python basics. By end of module 1, your child will have a working program they built themselves.' },
  ai:     { emoji: '🧠', color: '#14D4F4', title: 'AI Track',               desc: 'Start with how AI actually works, then build a machine learning project. Best for kids who love figuring out how things work.' },
  bizz:   { emoji: '💡', color: '#FAA918', title: 'Entrepreneurship Track', desc: 'From idea to pitch. Best for kids who are creative, love problem-solving, or have already started trying to build something.' },
  all:    { emoji: '🗺️', color: '#2B70C9', title: 'Full Curriculum',        desc: 'Start with Coding — the foundation for everything else. You can switch tracks any time, and the AI coach will guide the transition.' },
}

const FAQ = [
  { q: 'What exactly is Plulai?',         a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic.' },
  { q: 'Is the free plan really free?',   a: 'Yes — genuinely free. No credit card, no 7-day trial, no expiry. The free plan covers the first module of each track. Pro unlocks all 500+ lessons, advanced AI coaching, and the full portfolio system.' },
  { q: 'What age is Plulai for?',         a: 'Ages 6–18. The platform adapts automatically: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) each get age-appropriate content, pacing, and difficulty.' },
  { q: 'Does it support Arabic properly?',a: "Real Arabic — not machine-translated content. Full RTL interface and an AI coach that teaches natively in Arabic." },
  { q: 'How long are the lessons?',       a: '15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.' },
  { q: 'How is it different from Scratch?', a: "Plulai goes further: a personalised AI coach, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track." },
  { q: 'Is it safe for my child?',        a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold." },
]

const PARTNERS = [
  { abbr: 'Business Success',        logo: '/partners/bs.png'        },
  { abbr: 'LingoVille',              logo: '/partners/lingo.png'     },
  { abbr: 'The Intelligent Inventor',logo: '/partners/tie.png'       },
  { abbr: 'Pinacle',                 logo: '/partners/gems.png'      },
  { abbr: 'Les Élites Juniors',      logo: '/partners/elites.png'    },
  { abbr: 'La Coupole',              logo: '/partners/lacoupole.png' },
  { abbr: 'First Skills Club',       logo: '/partners/gems.png'      },
]

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function TrackQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const currentQ = QUIZ_STEPS[step - 1]
  const result = TRACK_RESULT[answers.interest ?? 'coding']

  function next() {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : QUIZ_STEPS.length + 1)
  }

  if (step === 0) return (
    <div className="text-center py-4">
      <p style={{ color: '#1CB0F6' }} className="text-xs font-black uppercase tracking-widest mb-2">3 questions · 60 seconds</p>
      <h3 className="font-fredoka text-2xl md:text-3xl mb-3" style={{ color: '#F5F5F5' }}>Find your child&apos;s track</h3>
      <p className="text-sm font-semibold mb-6 max-w-xs mx-auto" style={{ color: '#6F6F6F' }}>Tell us your child&apos;s age and interests. We&apos;ll recommend exactly where to start.</p>
      <button onClick={() => setStep(1)} className="px-8 py-3.5 rounded-xl font-black text-sm text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)' }}>
        Start →
      </button>
    </div>
  )

  if (step === QUIZ_STEPS.length + 1) return (
    <div className="text-center py-4">
      <div className="text-5xl mb-3">{result.emoji}</div>
      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: result.color }}>{result.title}</p>
      <h3 className="font-fredoka text-2xl md:text-3xl mb-2" style={{ color: '#F5F5F5' }}>{result.title}</h3>
      <p className="text-sm font-semibold mb-6 max-w-xs mx-auto leading-relaxed" style={{ color: '#6F6F6F' }}>{result.desc}</p>
      <Link href="/auth/signup" className="block w-full max-w-xs mx-auto px-8 py-4 rounded-xl font-black text-sm text-white mb-3 hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)' }}>
        Start {result.title} — Free →
      </Link>
      <p className="text-xs font-bold mb-4" style={{ color: '#6F6F6F' }}>No credit card · Takes 60 seconds</p>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }} className="text-xs underline transition-colors" style={{ color: '#6F6F6F' }}>Start over</button>
    </div>
  )

  const progress = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div className="py-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1CB0F6, #2B70C9)' }} />
        </div>
        <span className="text-xs font-black shrink-0" style={{ color: '#6F6F6F' }}>{step} / {QUIZ_STEPS.length}</span>
      </div>
      <h3 className="font-fredoka text-xl md:text-2xl mb-5" style={{ color: '#F5F5F5' }}>{currentQ.question}</h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {currentQ.options.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)}
            className="text-left rounded-xl p-4 border transition-all"
            style={{
              borderColor: selected === opt.value ? '#1CB0F6' : 'rgba(255,255,255,0.08)',
              background: selected === opt.value ? 'rgba(28,176,246,0.12)' : 'rgba(255,255,255,0.03)',
            }}>
            <div className="text-xl mb-1">{opt.emoji}</div>
            <div className="font-black text-sm leading-tight" style={{ color: '#F5F5F5' }}>{opt.label}</div>
            {opt.sub && <div className="text-xs font-bold mt-1" style={{ color: '#6F6F6F' }}>{opt.sub}</div>}
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected}
        className="w-full py-3.5 rounded-xl font-black text-sm transition-all"
        style={{
          background: selected ? 'linear-gradient(135deg, #1CB0F6, #2B70C9)' : 'rgba(255,255,255,0.05)',
          color: selected ? '#fff' : '#6F6F6F',
          cursor: selected ? 'pointer' : 'not-allowed',
        }}>
        {step === QUIZ_STEPS.length ? 'See my recommendation →' : 'Next →'}
      </button>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="font-bold text-sm md:text-base pr-4" style={{ color: '#F5F5F5' }}>{q}</span>
        <span className={`text-lg shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: '#6F6F6F' }}>▾</span>
      </button>
      {open && <p className="text-sm font-semibold leading-relaxed pb-5" style={{ color: '#6F6F6F' }}>{a}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: '#0A0E1A', minHeight: '100vh' }} className="relative">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full blur-3xl" style={{ top: '-10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(28,176,246,0.07) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full blur-3xl" style={{ top: '40%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(43,112,201,0.06) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full blur-3xl" style={{ bottom: '10%', left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(250,169,24,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Nav ── */}
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 lg:px-12 py-3.5"
          style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2.5">
            {/* Logo placeholder — replace src with /icons/plulai.png */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)' }}>P</div>
            <span className="font-fredoka text-xl" style={{ background: 'linear-gradient(90deg, #1CB0F6, #14D4F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plulai</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold" style={{ color: '#6F6F6F' }}>
            <a href="#tracks"       className="hover:text-white transition-colors" style={{} as React.CSSProperties}>Tracks</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#quiz"         className="hover:text-white transition-colors">Find a track</a>
            <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/sharkkid" className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-black text-xs text-white whitespace-nowrap hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #FAA918, #D33131)' }}>🦈 Sharkkid</Link>
            <Link href="/auth/login" className="hidden md:block text-sm font-bold hover:text-white transition-colors" style={{ color: '#6F6F6F' }}>Log in</Link>
            <Link href="/auth/signup" className="px-4 py-2 md:px-5 rounded-lg font-black text-sm text-white hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)' }}>Start free →</Link>
          </div>
        </nav>

        {/* ── Stats ribbon ── */}
        <div className="pt-[57px] md:pt-[60px]">
          <div className="py-2.5 px-4" style={{ background: 'linear-gradient(90deg, rgba(28,176,246,0.08), rgba(43,112,201,0.08), rgba(20,212,244,0.08))', borderBottom: '1px solid rgba(28,176,246,0.12)' }}>
            <div className="flex items-center justify-center gap-6 md:gap-14 flex-wrap">
              {[
                { icon: '📚', value: '500+', label: 'lessons', color: '#1CB0F6' },
                { icon: '⭐', value: '9.2/10', label: 'rating', color: '#FAA918' },
                { icon: '🌍', value: '6', label: 'GCC countries', color: '#14D4F4' },
                { icon: '🔒', value: 'No ads.', label: 'Ever.', color: '#F5F5F5' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="font-black text-sm" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs font-bold" style={{ color: '#6F6F6F' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="pt-20 md:pt-28 pb-20 md:pb-28 px-5 md:px-8 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{ background: 'rgba(28,176,246,0.08)', border: '1px solid rgba(28,176,246,0.18)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1CB0F6' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#1CB0F6' }}>Free forever · No credit card · Ages 6–18</span>
          </div>

          <h1 className="font-fredoka leading-[1.08] mb-6" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}>
            <span style={{ color: '#F5F5F5' }}>The AI platform that teaches</span>
            <br />
            <span style={{ background: 'linear-gradient(90deg, #1CB0F6 0%, #14D4F4 50%, #2B70C9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your child to build, not just browse.
            </span>
          </h1>

          <p className="text-base md:text-lg font-semibold max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#6F6F6F' }}>
            Coding, AI, and entrepreneurship — 15 minutes a day, in Arabic and English, built for the GCC.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/auth/signup"
              className="w-full sm:w-auto px-10 py-4 md:py-5 rounded-xl font-black text-base md:text-lg text-white hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)', boxShadow: '0 0 50px rgba(28,176,246,0.35)' }}>
              Start for free
            </Link>
            <a href="#quiz"
              className="w-full sm:w-auto px-10 py-4 md:py-5 rounded-xl font-black text-base md:text-lg hover:-translate-y-0.5 transition-all"
              style={{ color: '#F5F5F5', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Find my child&apos;s track →
            </a>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['✅ Free forever', '✅ No credit card', '✅ Arabic & English', '✅ No ads ever', '✅ Any device'].map(t => (
              <span key={t} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6F6F6F' }}>{t}</span>
            ))}
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="py-10 px-5 md:px-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { n: '500+', label: 'Lessons', sub: 'across all tracks', icon: '📚', c: '#1CB0F6', bg: 'rgba(28,176,246,0.06)', bd: 'rgba(28,176,246,0.15)' },
              { n: '9.2',  label: '/10 Rating', sub: 'from GCC parents',   icon: '⭐', c: '#FAA918', bg: 'rgba(250,169,24,0.06)', bd: 'rgba(250,169,24,0.15)' },
              { n: '6',    label: 'Countries', sub: 'across the GCC',     icon: '🌍', c: '#14D4F4', bg: 'rgba(20,212,244,0.06)', bd: 'rgba(20,212,244,0.15)' },
              { n: '3',    label: 'Tracks', sub: 'coding · AI · bizz',    icon: '🛤️', c: '#2B70C9', bg: 'rgba(43,112,201,0.06)', bd: 'rgba(43,112,201,0.15)' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-5 text-center" style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-fredoka text-3xl md:text-4xl mb-0.5" style={{ color: s.c }}>{s.n}</div>
                <div className="font-black text-sm" style={{ color: '#F5F5F5' }}>{s.label}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: '#6F6F6F' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What it is — SPLIT LAYOUT (no more card grid) ── */}
        <section className="py-20 md:py-28 px-5 md:px-8 max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>What Plulai is</p>
            <h2 className="font-fredoka mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5F5F5', lineHeight: 1.15 }}>
              One platform.<br />Three skills that matter.
            </h2>
            <p className="text-base font-semibold leading-relaxed" style={{ color: '#6F6F6F' }}>
              By the end of the first month, your child will have built something real — not just watched a video about it.
            </p>
          </div>

          {/* Horizontal feature rows — alternating layout */}
          <div className="flex flex-col gap-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { emoji: '💻', title: 'Coding',           desc: 'Python, web development, and game design — from zero to a working app that runs in a browser.',               label: 'Foundation track', color: '#1CB0F6', idx: 0 },
              { emoji: '🧠', title: 'AI',               desc: 'Build with AI, not just use it. Your child will understand how machine learning works by actually creating AI projects.', label: 'Innovation track', color: '#14D4F4', idx: 1 },
              { emoji: '💡', title: 'Entrepreneurship', desc: 'From first idea to a full investor pitch and MVP — startup thinking for young founders in the GCC.',                    label: 'Founder track',    color: '#FAA918', idx: 2 },
              { emoji: '🤖', title: 'AI coach',         desc: "Adapts to your child's level. Explains things differently until it clicks. Always patient — in Arabic and English.",    label: 'Always on',        color: '#2B70C9', idx: 3 },
            ].map((item) => (
              <div key={item.idx}
                className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 py-8 md:py-10"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Number + emoji left column */}
                <div className="flex items-center gap-4 md:w-16 shrink-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `rgba(${item.color === '#1CB0F6' ? '28,176,246' : item.color === '#14D4F4' ? '20,212,244' : item.color === '#FAA918' ? '250,169,24' : '43,112,201'},0.12)`, border: `1px solid ${item.color}22` }}>
                    {item.emoji}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <h3 className="font-fredoka text-xl md:text-2xl" style={{ color: '#F5F5F5' }}>{item.title}</h3>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: item.color }}>{item.label}</span>
                  </div>
                  <p className="text-sm md:text-base font-semibold leading-relaxed" style={{ color: '#6F6F6F' }}>{item.desc}</p>
                </div>
                {/* Right side decoration */}
                <div className="hidden md:flex items-center justify-end w-24 shrink-0">
                  <div className="w-1 h-10 rounded-full" style={{ background: `linear-gradient(to bottom, ${item.color}, transparent)` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tracks — TABBED / accent-bordered panels ── */}
        <section id="tracks" className="py-20 md:py-28 px-5 md:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>Learning tracks</p>
            <h2 className="font-fredoka mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5F5F5' }}>Pick the path that fits.</h2>
            <p className="text-sm md:text-base font-semibold max-w-xl mx-auto" style={{ color: '#6F6F6F' }}>
              Each track builds toward a real outcome. Most kids end up doing all three.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: '01', emoji: '💻', title: 'Coding',          sub: 'For future developers',
                desc: 'Python, web dev, and game design. By week 2 your child writes their first working program.',
                tags: ['Python', 'Web dev', 'Game design', 'Ages 8+'],
                color: '#1CB0F6', bg: 'rgba(28,176,246,0.05)', bd: 'rgba(28,176,246,0.2)',
              },
              {
                num: '02', emoji: '🧠', title: 'AI',              sub: 'For future innovators',
                desc: 'Understand machine learning by actually building AI projects — not just reading about them.',
                tags: ['Machine learning', 'AI ethics', 'Real projects', 'Ages 10+'],
                color: '#14D4F4', bg: 'rgba(20,212,244,0.05)', bd: 'rgba(20,212,244,0.2)',
              },
              {
                num: '03', emoji: '💡', title: 'Entrepreneurship', sub: 'For future founders',
                desc: 'From first idea to a full investor pitch and MVP — startup thinking for the GCC.',
                tags: ['Ideation', 'MVP', 'Pitch deck', 'Ages 11+'],
                color: '#FAA918', bg: 'rgba(250,169,24,0.05)', bd: 'rgba(250,169,24,0.2)',
              },
            ].map((t) => (
              <div key={t.num} className="rounded-2xl flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300"
                style={{ background: t.bg, border: `1px solid ${t.bd}` }}>
                {/* Color top bar */}
                <div className="h-1" style={{ background: t.color }} />
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="font-black text-xs opacity-30" style={{ color: t.color }}>{t.num}</span>
                  </div>
                  <h3 className="font-fredoka text-xl mb-1" style={{ color: '#F5F5F5' }}>{t.title}</h3>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: t.color }}>{t.sub}</p>
                  <p className="text-sm font-semibold leading-relaxed mb-4 flex-1" style={{ color: '#6F6F6F' }}>{t.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-xs font-bold rounded-full px-2.5 py-1"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#6F6F6F', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works — TIMELINE ── */}
        <section id="how-it-works" className="py-20 md:py-28 px-5 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>How it works</p>
            <h2 className="font-fredoka mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5F5F5' }}>From signup to first project.</h2>
            <p className="text-sm font-semibold" style={{ color: '#6F6F6F' }}>No downloads. Works on any device. Start today.</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Spine */}
            <div className="absolute left-7 top-8 bottom-8 w-px hidden md:block"
              style={{ background: 'linear-gradient(to bottom, #1CB0F6, #2B70C9, rgba(43,112,201,0.1))' }} />

            {[
              { n: 1, title: 'Take the 60-second quiz', badge: '60 seconds',    emoji: '🎯', desc: "Tell us your child's age and what excites them. We'll recommend the right track and starting point." },
              { n: 2, title: 'Meet their AI coach',     badge: 'Day 1',          emoji: '🤖', desc: 'A personal AI tutor introduces itself in Arabic or English, then starts lesson one immediately.' },
              { n: 3, title: 'Build something real',    badge: 'End of month 1', emoji: '🏗️', desc: '15–25 minutes per day. By the end of the first module, your child has a project they can actually show people.' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-6 md:gap-8 mb-10 last:mb-0 relative">
                {/* Node */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 relative z-10"
                  style={{ background: 'linear-gradient(135deg, rgba(28,176,246,0.2), rgba(43,112,201,0.2))', border: '2px solid #1CB0F6' }}>
                  {s.emoji}
                </div>
                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="font-fredoka text-xl" style={{ color: '#F5F5F5' }}>{s.title}</h3>
                    <span className="text-xs font-black rounded-full px-3 py-1"
                      style={{ background: 'rgba(28,176,246,0.1)', color: '#1CB0F6', border: '1px solid rgba(28,176,246,0.2)' }}>{s.badge}</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: '#6F6F6F' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/signup"
              className="inline-block px-10 py-4 rounded-xl font-black text-base text-white hover:-translate-y-1 transition-all"
              style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)', boxShadow: '0 0 30px rgba(28,176,246,0.25)' }}>
              Start step 1 — free
            </Link>
          </div>
        </section>

        {/* ── Quiz ── */}
        <section id="quiz" className="py-20 md:py-28 px-5 md:px-8 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>Personalised for your child</p>
            <h2 className="font-fredoka mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5F5F5' }}>Not sure where to start?</h2>
            <p className="text-sm font-semibold" style={{ color: '#6F6F6F' }}>3 questions and we&apos;ll tell you exactly which track to begin with.</p>
          </div>
          <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(28,176,246,0.12)', boxShadow: '0 0 60px rgba(28,176,246,0.04)' }}>
            <TrackQuiz />
          </div>
        </section>

        {/* ── GCC section — full-bleed split ── */}
        <section className="py-20 md:py-28 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(28,176,246,0.06) 0%, rgba(43,112,201,0.06) 100%)', border: '1px solid rgba(28,176,246,0.12)' }}>
              <div className="flex flex-col md:flex-row">
                {/* Left content */}
                <div className="flex-1 p-8 md:p-12 lg:p-16">
                  <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#1CB0F6' }}>Built for the GCC</p>
                  <h2 className="font-fredoka mb-4" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#F5F5F5', lineHeight: 1.2 }}>
                    Made for Arabic-speaking families.<br />Not translated for them.
                  </h2>
                  <p className="text-sm md:text-base font-semibold leading-relaxed mb-8" style={{ color: '#6F6F6F' }}>
                    Full RTL interface. An AI coach that teaches natively in Arabic. Every example set in Dubai, Riyadh, Doha, Kuwait City, Manama, and Muscat — not Silicon Valley.
                  </p>

                  <div className="flex flex-col gap-4">
                    {[
                      { icon: '🌐', title: 'Real Arabic, not translations', desc: 'Full RTL interface and AI that thinks in Arabic first.', color: '#1CB0F6' },
                      { icon: '🎓', title: 'UAE Vision 2031 aligned',       desc: 'AI, coding, and entrepreneurship — the three pillars demanded of the next generation.', color: '#14D4F4' },
                      { icon: '🔒', title: 'Safe for kids, no compromises', desc: 'No ads. AI filtered for child safety. Data never sold.', color: '#2B70C9' },
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${f.color}33` }}>
                          {f.icon}
                        </div>
                        <div>
                          <div className="font-bold text-sm mb-0.5" style={{ color: '#F5F5F5' }}>{f.title}</div>
                          <div className="text-xs font-semibold" style={{ color: '#6F6F6F' }}>{f.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right flag grid */}
                <div className="md:w-72 lg:w-80 p-8 md:p-10 flex flex-col justify-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-5 text-center" style={{ color: '#6F6F6F' }}>Available across</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { flag: '🇦🇪', name: 'UAE' },
                      { flag: '🇸🇦', name: 'Saudi Arabia' },
                      { flag: '🇶🇦', name: 'Qatar' },
                      { flag: '🇰🇼', name: 'Kuwait' },
                      { flag: '🇧🇭', name: 'Bahrain' },
                      { flag: '🇴🇲', name: 'Oman' },
                    ].map(c => (
                      <div key={c.name} className="rounded-xl p-3 text-center hover:-translate-y-0.5 transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-2xl mb-1">{c.flag}</div>
                        <div className="font-bold text-xs" style={{ color: '#6F6F6F' }}>{c.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing — side by side with strong visual contrast ── */}
        <section className="py-20 md:py-28 px-5 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>Pricing</p>
            <h2 className="font-fredoka mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5F5F5' }}>Start free. Upgrade when ready.</h2>
            <p className="text-sm font-semibold" style={{ color: '#6F6F6F' }}>The free plan is genuinely free — no 7-day trial, no credit card, no expiry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Free — hero plan */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: 'rgba(28,176,246,0.06)', border: '1px solid rgba(28,176,246,0.25)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1CB0F6, #14D4F4)' }} />
              <div className="p-7 md:p-8">
                <div className="inline-block rounded-full px-3 py-1 text-xs font-black mb-4"
                  style={{ background: 'rgba(28,176,246,0.15)', color: '#1CB0F6', border: '1px solid rgba(28,176,246,0.25)' }}>
                  Most parents start here
                </div>
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-fredoka text-2xl mb-1" style={{ color: '#F5F5F5' }}>Free</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-fredoka text-4xl" style={{ color: '#F5F5F5' }}>AED 0</span>
                  <span className="text-sm font-bold" style={{ color: '#6F6F6F' }}>/month</span>
                </div>
                <p className="text-xs font-bold mb-6" style={{ color: '#6F6F6F' }}>Forever free. No card needed.</p>
                <ul className="space-y-3 mb-6">
                  {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-semibold" style={{ color: '#F5F5F5' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-black"
                        style={{ background: 'rgba(28,176,246,0.15)', color: '#1CB0F6', border: '1px solid rgba(28,176,246,0.3)' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup"
                  className="block w-full py-3.5 rounded-xl font-black text-sm text-white text-center hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)', boxShadow: '0 0 20px rgba(28,176,246,0.2)' }}>
                  Start free now
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FAA918, #D33131)' }} />
              <div className="p-7 md:p-8">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-fredoka text-2xl mb-1" style={{ color: '#F5F5F5' }}>Pro</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-fredoka text-4xl" style={{ color: '#F5F5F5' }}>$79</span>
                  <span className="text-sm font-bold" style={{ color: '#6F6F6F' }}>/month</span>
                </div>
                <p className="text-xs font-bold mb-6" style={{ color: '#6F6F6F' }}>Everything in Free, plus:</p>
                <ul className="space-y-3 mb-6">
                  {['All 500+ lessons unlocked', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Certificate of completion', 'Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-semibold" style={{ color: '#6F6F6F' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-black"
                        style={{ background: 'rgba(250,169,24,0.1)', color: '#FAA918', border: '1px solid rgba(250,169,24,0.2)' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup?plan=pro"
                  className="block w-full py-3.5 rounded-xl font-black text-sm text-center hover:-translate-y-0.5 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#F5F5F5', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Start with Pro →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Rating callout — full width statement ── */}
        <section className="py-10 px-5 md:px-8 max-w-3xl mx-auto text-center">
          <div className="rounded-2xl py-10 px-8" style={{ background: 'linear-gradient(135deg, rgba(250,169,24,0.07), rgba(211,49,49,0.05))', border: '1px solid rgba(250,169,24,0.15)' }}>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-7 h-7" fill="#FAA918" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="font-fredoka mb-2" style={{ fontSize: '4rem', color: '#F5F5F5', lineHeight: 1 }}>
              9.2<span className="text-2xl" style={{ color: '#6F6F6F' }}>/10</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#6F6F6F' }}>Average rating from parents across the GCC</p>
          </div>
        </section>

        {/* ── Partners ── */}
        <section id="partners" className="py-20 md:py-28 px-5 md:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>Partners</p>
            <h2 className="font-fredoka mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#F5F5F5' }}>Our partners</h2>
            <p className="text-sm font-semibold max-w-md mx-auto" style={{ color: '#6F6F6F' }}>Schools and organisations across the GCC that have partnered with Plulai.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PARTNERS.map(partner => (
              <div key={partner.abbr} className="flex flex-col items-center justify-center text-center rounded-xl p-4 hover:-translate-y-0.5 transition-all"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-14 h-14 mb-2 flex items-center justify-center">
                  <Image src={partner.logo} alt={partner.abbr} width={56} height={56} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-bold text-xs" style={{ color: '#6F6F6F' }}>{partner.abbr}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm font-semibold mb-3" style={{ color: '#6F6F6F' }}>Are you a school or organisation in the GCC?</p>
            <a href="mailto:ceo@plulai.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all"
              style={{ color: '#F5F5F5', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🤝 Become a partner
            </a>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20 md:py-28 px-5 md:px-8 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#1CB0F6' }}>FAQ</p>
            <h2 className="font-fredoka mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5F5F5' }}>Common questions</h2>
            <p className="text-sm font-semibold" style={{ color: '#6F6F6F' }}>Everything parents ask before signing up.</p>
          </div>
          <div className="rounded-2xl px-6 md:px-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 md:py-28 px-5 md:px-8 max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-10 md:p-16 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(28,176,246,0.08), rgba(43,112,201,0.08))', border: '1px solid rgba(28,176,246,0.15)' }}>
            {/* Glow inside CTA */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(28,176,246,0.08) 0%, transparent 70%)' }} />
            <div className="relative">
              <h2 className="font-fredoka mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#F5F5F5' }}>
                Your child can start today.
              </h2>
              <p className="text-base md:text-lg font-semibold mb-8" style={{ color: '#6F6F6F' }}>
                Free forever. No credit card. Arabic and English. Ages 6–18.
              </p>
              <Link href="/auth/signup"
                className="inline-block w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 rounded-xl font-black text-base md:text-lg text-white hover:-translate-y-1 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)', boxShadow: '0 0 60px rgba(28,176,246,0.35)' }}>
                Create a free account →
              </Link>
              <p className="text-xs font-bold mt-5 opacity-40" style={{ color: '#F5F5F5' }}>
                Trusted by families across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain &amp; Oman
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-5 md:px-8 lg:px-12 py-10 md:py-14" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
              <div>
                {/* Logo in footer */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white"
                    style={{ background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)' }}>P</div>
                  <span className="font-fredoka text-xl" style={{ background: 'linear-gradient(90deg, #1CB0F6, #14D4F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plulai</span>
                </div>
                <p className="text-xs font-semibold max-w-xs leading-relaxed" style={{ color: '#6F6F6F' }}>
                  The AI learning platform for kids in the GCC. Coding, AI, and entrepreneurship — in Arabic and English.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-8 text-xs font-bold w-full md:w-auto" style={{ color: '#6F6F6F' }}>
                <div>
                  <p className="font-black mb-3" style={{ color: '#F5F5F5' }}>Platform</p>
                  <div className="space-y-2">
                    {[['#tracks','Tracks'],['#quiz','Find a track'],['#partners','Partners']].map(([h,l]) => <a key={l} href={h} className="block hover:text-white transition-colors">{l}</a>)}
                    <Link href="/pricing" className="block hover:text-white transition-colors">Pricing</Link>
                    <Link href="/auth/signup" className="block hover:text-white transition-colors">Sign up free</Link>
                    <Link href="/sharkkid" className="block hover:text-white transition-colors">🦈 Sharkkid</Link>
                  </div>
                </div>
                <div>
                  <p className="font-black mb-3" style={{ color: '#F5F5F5' }}>Countries</p>
                  <div className="space-y-2">
                    {['🇦🇪 UAE','🇸🇦 Saudi Arabia','🇶🇦 Qatar','🇰🇼 Kuwait','🇧🇭 Bahrain','🇴🇲 Oman'].map(c => <p key={c}>{c}</p>)}
                  </div>
                </div>
                <div>
                  <p className="font-black mb-3" style={{ color: '#F5F5F5' }}>Company</p>
                  <div className="space-y-2">
                    <a href="mailto:hello@plulai.com"    className="block hover:text-white transition-colors">Contact</a>
                    <a href="mailto:partners@plulai.com" className="block hover:text-white transition-colors">Partners</a>
                    <a href="mailto:schools@plulai.com"  className="block hover:text-white transition-colors">Schools</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs font-bold" style={{ color: '#6F6F6F' }}>© {new Date().getFullYear()} Plulai. The #1 edtech platform for kids in the GCC.</p>
              <a href="mailto:hello@plulai.com" className="text-xs font-bold hover:text-white transition-colors" style={{ color: '#6F6F6F' }}>hello@plulai.com</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}