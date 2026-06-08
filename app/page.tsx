'use client'
// app/page.tsx — Plulai Landing Page (redesigned v2)

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// ─── Quiz funnel ──────────────────────────────────────────────────────────────

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
      { label: 'AI & smart tech',        sub: 'AI track',         value: 'ai',     emoji: '🧠' },
      { label: 'Starting a business',    sub: 'Entrepreneurship', value: 'bizz',   emoji: '💡' },
      { label: 'Not sure yet',           sub: "We'll guide you",  value: 'all',    emoji: '🗺️' },
    ],
  },
  {
    id: 'goal',
    question: 'What matters most to you as a parent?',
    options: [
      { label: 'Screen time with purpose', sub: '', value: 'screen', emoji: '📱' },
      { label: 'Future career advantage',  sub: '', value: 'career', emoji: '🏆' },
      { label: 'Building confidence',      sub: '', value: 'conf',   emoji: '💪' },
      { label: 'Real skills, not theory',  sub: '', value: 'skills', emoji: '🛠️' },
    ],
  },
]

const TRACK_RESULT: Record<string, { title: string; desc: string; emoji: string }> = {
  coding: {
    emoji: '💻',
    title: 'Coding Track',
    desc:  'Start with Python basics. By end of module 1, your child will have a working program they built themselves.',
  },
  ai: {
    emoji: '🧠',
    title: 'AI Track',
    desc:  'Start with how AI actually works, then build a machine learning project. Best for kids who love figuring out how things work.',
  },
  bizz: {
    emoji: '💡',
    title: 'Entrepreneurship Track',
    desc:  'From idea to pitch. Best for kids who are creative, love problem-solving, or have already started trying to build something.',
  },
  all: {
    emoji: '🗺️',
    title: 'Full Curriculum',
    desc:  'Start with Coding — the foundation for everything else. You can switch tracks any time, and the AI coach will guide the transition.',
  },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const WHAT_IS_IT = [
  { emoji: '💻', title: 'Coding',            desc: 'Python, web development, and game design — from zero to a working app.',                                                          gradient: 'from-violet-500/10 to-blue-500/10',   border: 'border-violet-500/20'  },
  { emoji: '🧠', title: 'AI',                desc: 'Understanding and building with AI — not just using it, but knowing how it works.',                                                gradient: 'from-cyan-500/10 to-teal-500/10',     border: 'border-cyan-500/20'    },
  { emoji: '💡', title: 'Entrepreneurship',  desc: 'From idea to investor pitch — startup thinking adapted for young minds in the GCC.',                                               gradient: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20'   },
  { emoji: '🤖', title: 'Personal AI coach', desc: "Adapts to your child's level. Explains things differently until it clicks. Always patient — in Arabic and English.",              gradient: 'from-emerald-500/10 to-green-500/10',border: 'border-emerald-500/20' },
]

const TRACKS = [
  {
    num: '1', emoji: '💻', title: 'Coding track', sub: 'For future developers',
    desc: 'Build real apps and games using Python and web development. By week 2 your child writes their first working program.',
    tags: ['Python', 'Web dev', 'Game design', 'Ages 8+'],
    gradient: 'from-violet-500/10 to-blue-500/5',
    border: 'border-violet-500/25',
    dot: 'bg-violet-400',
  },
  {
    num: '2', emoji: '🧠', title: 'AI track', sub: 'For future innovators',
    desc: 'Understand machine learning by actually building AI projects — not just reading about them.',
    tags: ['Machine learning', 'AI ethics', 'Build an AI project', 'Ages 10+'],
    gradient: 'from-cyan-500/10 to-teal-500/5',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-400',
  },
  {
    num: '3', emoji: '💡', title: 'Entrepreneurship track', sub: 'For future founders',
    desc: 'From first idea to a full investor pitch and MVP — startup thinking for young founders in the GCC.',
    tags: ['Ideation', 'Build an MVP', 'Pitch', 'Ages 11+'],
    gradient: 'from-amber-500/10 to-orange-500/5',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
  },
]

const HOW_STEPS = [
  {
    num: '1', title: 'Take the 60-second quiz',
    desc: "Tell us your child's age and what excites them. We'll recommend the right track and starting point.",
    badge: '60 seconds',
    emoji: '🎯',
  },
  {
    num: '2', title: 'Meet their AI coach',
    desc: 'A personal AI tutor introduces itself in Arabic or English, then starts lesson one immediately.',
    badge: 'Day 1',
    emoji: '🤖',
  },
  {
    num: '3', title: 'Build something real',
    desc: '15–25 minutes per day. By the end of the first module, your child has a project they can actually show people.',
    badge: 'End of module 1',
    emoji: '🏗️',
  },
]

const FREE_FEATURES = [
  'First module of each track',
  'Personal AI coach',
  'XP & streak system',
  'Parent dashboard',
  'Arabic & English',
  'Any device',
]

const PRO_FEATURES = [
  'All 500+ lessons unlocked',
  'Advanced AI coaching',
  'Full portfolio system',
  'Live project feedback',
  'Certificate of completion',
  'Priority support',
]

const PARTNERS = [
  { abbr: 'Business Success',      logo: '/partners/bs.png'        },
  { abbr: 'LingoVille',            logo: '/partners/lingo.png'     },
  { abbr: 'The Intelligent Inventor', logo: '/partners/tie.png'   },
  { abbr: 'Pinacle',               logo: '/partners/gems.png'      },
  { abbr: 'Les Élites Juniors',    logo: '/partners/elites.png'    },
  { abbr: 'La Coupole',            logo: '/partners/lacoupole.png' },
  { abbr: 'First Skills Club',     logo: '/partners/gems.png'      },
]

const FAQ = [
  {
    q: 'What exactly is Plulai?',
    a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic.',
  },
  {
    q: 'Is the free plan really free?',
    a: 'Yes — genuinely free. No credit card, no 7-day trial, no expiry. The free plan covers the first module of each track. Pro unlocks all 500+ lessons, advanced AI coaching, and the full portfolio system.',
  },
  {
    q: 'What age is Plulai for?',
    a: 'Ages 6–18. The platform adapts automatically: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) each get age-appropriate content, pacing, and difficulty.',
  },
  {
    q: 'Does it actually support Arabic properly?',
    a: "Real Arabic — not machine-translated content. Full RTL interface and an AI coach that teaches natively in Arabic.",
  },
  {
    q: 'How long are the lessons?',
    a: '15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.',
  },
  {
    q: 'How is it different from Scratch or Code.org?',
    a: "Those are great starters. Plulai goes further: a personalised AI coach, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track — none of which those platforms offer.",
  },
  {
    q: 'Is it safe for my child?',
    a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold.",
  },
]

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString()}{suffix}</>
}

// ─── Quiz Component ───────────────────────────────────────────────────────────

function TrackQuiz() {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const currentQ = QUIZ_STEPS[step - 1]
  const trackKey = answers.interest ?? 'coding'
  const result   = TRACK_RESULT[trackKey]

  function pick(value: string) { setSelected(value) }

  function next() {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : QUIZ_STEPS.length + 1)
  }

  if (step === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-2">
          3 questions · 60 seconds
        </p>
        <h3 className="font-fredoka text-2xl md:text-3xl mb-3 text-white">
          Find your child&apos;s track
        </h3>
        <p className="text-slate-400 font-semibold text-sm mb-6 max-w-xs mx-auto">
          Tell us your child&apos;s age and interests. We&apos;ll recommend exactly where to start.
        </p>
        <button
          onClick={() => setStep(1)}
          className="px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 to-violet-500 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/25"
        >
          Start →
        </button>
      </div>
    )
  }

  if (step === QUIZ_STEPS.length + 1) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-3">{result.emoji}</div>
        <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-3">
          Your child&apos;s recommended track
        </p>
        <h3 className="font-fredoka text-2xl md:text-3xl mb-2 text-white">{result.title}</h3>
        <p className="text-slate-400 font-semibold text-sm mb-6 max-w-xs mx-auto leading-relaxed">
          {result.desc}
        </p>
        <Link
          href="/auth/signup"
          className="block w-full max-w-xs mx-auto px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 to-violet-500 shadow-[0_0_30px_rgba(107,203,119,0.25)] hover:-translate-y-1 transition-all mb-3"
        >
          Start {result.title} — Free →
        </Link>
        <p className="text-slate-500 text-xs font-bold mb-4">No credit card · Takes 60 seconds</p>
        <button
          onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
          className="text-slate-500 text-xs underline hover:text-white transition-colors"
        >
          Start over
        </button>
      </div>
    )
  }

  const progress = Math.round((step / QUIZ_STEPS.length) * 100)

  return (
    <div className="py-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-slate-500 text-xs font-extrabold shrink-0">
          {step} / {QUIZ_STEPS.length}
        </span>
      </div>

      <h3 className="font-fredoka text-xl md:text-2xl mb-5 text-white">{currentQ.question}</h3>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => pick(opt.value)}
            className={`text-left rounded-2xl p-4 border transition-all ${
              selected === opt.value
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5'
            }`}
          >
            <div className="text-xl mb-1">{opt.emoji}</div>
            <div className="font-extrabold text-sm text-white leading-tight">{opt.label}</div>
            {opt.sub && (
              <div className="text-slate-500 text-xs font-bold mt-1">{opt.sub}</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={next}
        disabled={!selected}
        className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all ${
          selected
            ? 'text-white bg-gradient-to-r from-emerald-500 to-violet-500 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20'
            : 'text-slate-600 bg-white/5 cursor-not-allowed'
        }`}
      >
        {step === QUIZ_STEPS.length ? 'See my recommendation →' : 'Next →'}
      </button>
    </div>
  )
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-0 py-5 text-left"
      >
        <span className="font-bold text-sm md:text-base text-white pr-4">{q}</span>
        <span className={`text-slate-500 text-lg shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <p className="text-slate-400 font-semibold text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.floor(rating/2) ? 'text-amber-400' : 'text-amber-400/30'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen bg-[#060912]">

      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 lg:px-12 py-3 md:py-4 bg-[#060912]/80 backdrop-blur-xl border-b border-white/5">
        <div className="font-fredoka text-2xl bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
          Plulai
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#tracks"       className="hover:text-white transition-colors">Tracks</a>
          <a href="#quiz"         className="hover:text-white transition-colors">Find a track</a>
          <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/sharkkid" className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 rounded-xl font-extrabold text-xs md:text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap">
            🦈 Sharkkid
          </Link>
          <Link href="/auth/login" className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition-colors">Log in</Link>
          <Link href="/auth/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 to-violet-500 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/20">
            Start free →
          </Link>
        </div>
      </nav>

      {/* ── Stats ticker ── */}
      <div className="pt-[57px] md:pt-[65px]">
        <div className="bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-cyan-500/10 border-b border-white/5 py-2.5 overflow-hidden">
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap px-4">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 text-lg">📚</span>
              <span className="text-white font-extrabold text-sm">500+ lessons</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5">
              <StarRating rating={9.2} />
              <span className="text-white font-extrabold text-sm">9.2 <span className="text-slate-400 font-bold">/10 rating</span></span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5">
              <span className="text-amber-400 text-lg">🌍</span>
              <span className="text-white font-extrabold text-sm">6 GCC countries</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5">
              <span className="text-violet-400 text-lg">🔒</span>
              <span className="text-white font-extrabold text-sm">No ads. Ever.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="pt-16 md:pt-24 pb-16 md:pb-24 px-4 md:px-6 text-center max-w-5xl mx-auto">
        {/* eyebrow */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest">Free forever · No credit card</span>
        </div>

        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-[64px] leading-[1.1] mb-6">
          <span className="text-white">The AI learning platform that teaches</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            your child to build, not just browse.
          </span>
        </h1>
        <p className="text-slate-400 text-base md:text-xl font-semibold max-w-2xl mx-auto mb-10 leading-relaxed">
          Coding, AI, and entrepreneurship — 15 minutes a day, in Arabic and English, designed for the GCC.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-emerald-500 to-violet-500 shadow-[0_0_50px_rgba(52,211,153,0.3)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(52,211,153,0.4)] transition-all duration-300"
          >
            Start for free
          </Link>
          <a
            href="#quiz"
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-slate-300 bg-white/5 border border-white/10 hover:text-white hover:border-white/20 hover:bg-white/8 transition-all"
          >
            Find my child&apos;s track →
          </a>
        </div>

        {/* Social proof bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: '✅', text: 'Free forever' },
            { icon: '✅', text: 'No credit card' },
            { icon: '✅', text: 'Arabic & English' },
            { icon: '✅', text: 'No ads ever' },
            { icon: '✅', text: 'Any device' },
          ].map(t => (
            <span key={t.text} className="flex items-center gap-1.5 bg-white/4 border border-white/8 rounded-full px-3 py-1.5 text-xs font-bold text-slate-400">
              <span className="text-emerald-400">{t.icon}</span>{t.text}
            </span>
          ))}
        </div>
      </section>

      {/* ── Trust stats strip ── */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: 500, suffix: '+', label: 'Lessons available', icon: '📚', color: 'from-emerald-500/15 to-teal-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400' },
            { num: 9.2, suffix: '/10', label: 'Average parent rating', icon: '⭐', color: 'from-amber-500/15 to-orange-500/15', border: 'border-amber-500/20', text: 'text-amber-400' },
            { num: 6,   suffix: '',   label: 'GCC countries covered', icon: '🌍', color: 'from-cyan-500/15 to-blue-500/15',  border: 'border-cyan-500/20',  text: 'text-cyan-400'  },
            { num: 3,   suffix: '',   label: 'Learning tracks', icon: '🛤️',       color: 'from-violet-500/15 to-purple-500/15', border: 'border-violet-500/20', text: 'text-violet-400' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5 text-center`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`font-fredoka text-3xl md:text-4xl ${s.text} mb-1`}>
                {s.num}{s.suffix}
              </div>
              <div className="text-slate-400 text-xs font-bold leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is it ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">
          What Plulai is
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center text-white mb-3">
          One platform. Three skills that matter.
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          By the end of the first month, your child will have built something real — not just watched a video about it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {WHAT_IS_IT.map((item, i) => (
            <div key={i} className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-3xl p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 group cursor-default`}>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{item.emoji}</div>
              <h3 className="font-fredoka text-xl mb-2 text-white">{item.title}</h3>
              <p className="text-slate-400 text-sm font-semibold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">Tracks</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center text-white mb-3">
          Pick the path that fits.
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          Each track builds toward a real outcome. Kids can start with one and continue to the others — most do all three.
        </p>
        <div className="flex flex-col gap-4">
          {TRACKS.map((t, i) => (
            <div key={i} className={`bg-gradient-to-r ${t.gradient} border ${t.border} rounded-3xl p-6 md:p-8 flex items-start gap-5 hover:-translate-y-0.5 transition-all duration-300 group`}>
              <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center font-fredoka text-2xl text-white shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                {t.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-fredoka text-xl text-white">{t.title}</h3>
                  <span className="text-slate-500 text-xs font-extrabold uppercase tracking-wider">{t.sub}</span>
                </div>
                <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-3">{t.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-xs font-bold text-slate-400 border border-white/10 rounded-full px-3 py-1 bg-white/3">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">How it works</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center text-white mb-3">
          From signup to first project in 3 steps.
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-10 md:mb-14 text-sm md:text-base">
          No downloads. Works on any device. Your child can start today.
        </p>
        <div className="relative flex flex-col">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/30 via-violet-500/30 to-transparent hidden md:block" />

          {HOW_STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-5 py-6 border-b border-white/5 last:border-0 relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0 mt-0.5">
                {s.emoji}
              </div>
              <div>
                <h3 className="font-fredoka text-xl text-white mb-1">{s.title}</h3>
                <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-2">{s.desc}</p>
                <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-emerald-400 text-xs font-extrabold">
                  {s.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-emerald-500 to-violet-500 shadow-[0_0_30px_rgba(52,211,153,0.2)] hover:-translate-y-1 transition-all"
          >
            Start step 1 — free
          </Link>
        </div>
      </section>

      {/* ── Quiz ── */}
      <section id="quiz" className="py-16 md:py-24 px-4 md:px-6 max-w-2xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">
          Personalised for your child
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center text-white mb-3">
          Not sure where to start?
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-8 text-sm md:text-base">
          3 questions and we&apos;ll tell you exactly which track to begin with.
        </p>
        <div className="bg-white/3 border border-white/8 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(52,211,153,0.05)]">
          <TrackQuiz />
        </div>
      </section>

      {/* ── Built for GCC ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">
          Built for the GCC
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center text-white mb-3">
          Made for Arabic-speaking families. Not translated for them.
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-2xl mx-auto">
          Full RTL interface. An AI coach that teaches natively in Arabic and English. Every example is set in Dubai, Riyadh, Doha, Kuwait City, Manama, and Muscat — not Silicon Valley.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-10">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-6 md:p-8 hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-fredoka text-xl mb-2 text-white">Real Arabic</h3>
            <p className="text-slate-400 font-semibold text-sm leading-relaxed">
              Full RTL interface and an AI coach that teaches natively in Arabic — not machine-translated content.
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-6 md:p-8 hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-fredoka text-xl mb-2 text-white">UAE Vision 2031</h3>
            <p className="text-slate-400 font-semibold text-sm leading-relaxed">
              Curriculum aligned with UAE Vision 2031 — AI, coding, and entrepreneurship are the three pillars demanded of the next generation.
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-3xl p-6 md:p-8 hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-fredoka text-xl mb-2 text-white">Safe for kids</h3>
            <p className="text-slate-400 font-semibold text-sm leading-relaxed">
              No ads — ever. AI responses filtered for child safety. Parent dashboard with weekly summaries. Your child&apos;s data is never sold.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {[
            { flag: '🇦🇪', name: 'UAE'          },
            { flag: '🇸🇦', name: 'Saudi Arabia' },
            { flag: '🇶🇦', name: 'Qatar'        },
            { flag: '🇰🇼', name: 'Kuwait'       },
            { flag: '🇧🇭', name: 'Bahrain'      },
            { flag: '🇴🇲', name: 'Oman'         },
          ].map(c => (
            <div key={c.name} className="bg-white/3 border border-white/8 rounded-2xl p-3 md:p-4 text-center hover:border-white/20 hover:bg-white/5 transition-all cursor-default">
              <div className="text-3xl mb-1">{c.flag}</div>
              <div className="font-extrabold text-xs text-slate-300">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center text-white mb-3">
          Start free. Upgrade when you&apos;re ready.
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-10 text-sm md:text-base">
          The free plan is genuinely free — no 7-day trial, no credit card, no expiry.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="bg-gradient-to-br from-emerald-500/8 to-teal-500/5 border-2 border-emerald-500/40 rounded-3xl p-6 md:p-8 relative shadow-[0_0_40px_rgba(52,211,153,0.07)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-extrabold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
              Most parents start here
            </div>
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-fredoka text-2xl text-white mb-1">Free</h3>
            <p className="font-fredoka text-4xl text-white mb-1">
              AED 0 <span className="text-slate-400 text-base font-bold">/ month</span>
            </p>
            <p className="text-slate-500 text-xs font-bold mb-5">Forever free. No card needed.</p>
            <ul className="space-y-2.5 mb-6 text-sm font-semibold">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 text-center hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              Start free now
            </Link>
          </div>
          {/* Pro */}
          <div className="bg-white/3 border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-fredoka text-2xl text-white mb-1">Pro</h3>
            <p className="font-fredoka text-4xl text-white mb-1">
              $79 <span className="text-slate-500 text-base font-bold">/ month</span>
            </p>
            <p className="text-slate-500 text-xs font-bold mb-5">Everything in Free, plus:</p>
            <ul className="space-y-2.5 mb-6 text-sm font-semibold">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup?plan=pro"
              className="block w-full py-3.5 rounded-2xl font-extrabold text-sm text-slate-300 bg-white/5 border border-white/10 text-center hover:text-white hover:border-white/20 hover:bg-white/8 transition-all"
            >
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section id="partners" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">Partners</p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center text-white mb-3">Our partners</h2>
        <p className="text-center text-slate-400 font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          Schools and organisations across the GCC that have partnered with Plulai.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {PARTNERS.map(partner => (
            <div
              key={partner.abbr}
              className="flex flex-col items-center justify-center text-center bg-white/3 border border-white/8 rounded-2xl p-4 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.abbr}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="font-extrabold text-xs text-slate-400">{partner.abbr}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm font-semibold mb-3">Are you a school or organisation in the GCC?</p>
          <a
            href="mailto:ceo@plulai.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-white/5 border border-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
          >
            🤝 Become a partner
          </a>
        </div>
      </section>

      {/* ── Rating callout ── */}
      <section className="py-8 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-500/20 rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="font-fredoka text-5xl md:text-6xl text-white mb-2">9.2<span className="text-slate-400 text-3xl">/10</span></div>
          <p className="text-slate-400 font-semibold text-sm">Average rating from parents across the GCC</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <p className="text-center text-slate-500 text-xs font-extrabold uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center text-white mb-3">
          Common questions
        </h2>
        <p className="text-center text-slate-400 font-semibold mb-10 md:mb-14 text-sm md:text-base">
          Everything parents ask before signing up.
        </p>
        <div className="bg-white/3 border border-white/8 rounded-3xl px-6 md:px-8">
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-500/8 via-violet-500/5 to-cyan-500/8 border border-white/8 rounded-3xl p-10 md:p-14">
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Your child can start today.
          </h2>
          <p className="text-slate-400 font-semibold text-base md:text-lg mb-6">
            Free forever. No credit card. Works on any device. Arabic and English. Ages 6–18.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold mb-8">
            {['✅ Free forever', '✅ No credit card', '✅ Arabic & English', '✅ Ages 6–18', '✅ No ads ever', '✅ Any device'].map(t => (
              <span key={t} className="bg-white/4 border border-white/8 rounded-full px-3 py-1 text-slate-400">{t}</span>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="inline-block w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-emerald-500 to-violet-500 shadow-[0_0_50px_rgba(52,211,153,0.3)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(52,211,153,0.4)] transition-all duration-300"
          >
            Create a free account →
          </Link>
          <p className="text-slate-600 text-xs font-bold mt-4">
            Trusted by families across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain &amp; Oman
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="font-fredoka text-2xl bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent mb-2">
                Plulai
              </div>
              <p className="text-slate-500 text-xs font-semibold max-w-xs leading-relaxed">
                The AI learning platform for kids in the GCC. Coding, AI, and entrepreneurship — in Arabic and English.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-xs font-bold text-slate-500 w-full md:w-auto">
              <div>
                <p className="text-white mb-3 font-extrabold">Platform</p>
                <div className="space-y-2">
                  <a href="#tracks"     className="block hover:text-white transition-colors">Tracks</a>
                  <a href="#quiz"       className="block hover:text-white transition-colors">Find a track</a>
                  <a href="#partners"   className="block hover:text-white transition-colors">Partners</a>
                  <Link href="/pricing"       className="block hover:text-white transition-colors">Pricing</Link>
                  <Link href="/auth/signup"   className="block hover:text-white transition-colors">Sign up free</Link>
                  <Link href="/sharkkid"      className="block hover:text-white transition-colors">🦈 Sharkkid</Link>
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Countries</p>
                <div className="space-y-2">
                  {['🇦🇪 UAE', '🇸🇦 Saudi Arabia', '🇶🇦 Qatar', '🇰🇼 Kuwait', '🇧🇭 Bahrain', '🇴🇲 Oman'].map(c => (
                    <p key={c}>{c}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Company</p>
                <div className="space-y-2">
                  <a href="mailto:hello@plulai.com"    className="block hover:text-white transition-colors">Contact</a>
                  <a href="mailto:partners@plulai.com" className="block hover:text-white transition-colors">Partners</a>
                  <a href="mailto:schools@plulai.com"  className="block hover:text-white transition-colors">Schools</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs font-bold text-center md:text-left">
              © {new Date().getFullYear()} Plulai. The #1 edtech platform for kids in the GCC.
            </p>
            <a href="mailto:hello@plulai.com" className="text-slate-500 text-xs font-bold hover:text-white transition-colors">
              hello@plulai.com
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}