'use client'
// app/page.tsx — Plulai Landing Page (redesigned)
// Clean, honest, clarity-first. No fake social proof.

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// ─── Quiz funnel ──────────────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'age',
    question: 'How old is your child?',
    options: [
      { label: '6–8 years',   sub: 'Mini Explorer',   value: 'mini'   },
      { label: '9–11 years',  sub: 'Junior Creator',  value: 'junior' },
      { label: '12–14 years', sub: 'Pro Explorer',    value: 'pro'    },
      { label: '15–18 years', sub: 'Tech Expert',     value: 'expert' },
    ],
  },
  {
    id: 'interest',
    question: 'What excites them most?',
    options: [
      { label: 'Building apps & games', sub: 'Coding track',     value: 'coding' },
      { label: 'AI & smart tech',        sub: 'AI track',         value: 'ai'     },
      { label: 'Starting a business',    sub: 'Entrepreneurship', value: 'bizz'   },
      { label: 'Not sure yet',           sub: 'We\'ll guide you', value: 'all'    },
    ],
  },
  {
    id: 'goal',
    question: 'What matters most to you as a parent?',
    options: [
      { label: 'Screen time with purpose', sub: '', value: 'screen' },
      { label: 'Future career advantage',  sub: '', value: 'career' },
      { label: 'Building confidence',      sub: '', value: 'conf'   },
      { label: 'Real skills, not theory',  sub: '', value: 'skills' },
    ],
  },
]

const TRACK_RESULT: Record<string, { title: string; desc: string }> = {
  coding: {
    title: 'Coding Track',
    desc:  'Start with Python basics. By end of module 1, your child will have a working program they built themselves.',
  },
  ai: {
    title: 'AI Track',
    desc:  'Start with how AI actually works, then build a machine learning project. Best for kids who love figuring out how things work.',
  },
  bizz: {
    title: 'Entrepreneurship Track',
    desc:  'From idea to pitch. Best for kids who are creative, love problem-solving, or have already started trying to build something.',
  },
  all: {
    title: 'Full Curriculum',
    desc:  'Start with Coding — the foundation for everything else. You can switch tracks any time, and the AI coach will guide the transition.',
  },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const WHAT_IS_IT = [
  { emoji: '💻', title: 'Coding',            desc: 'Python, web development, and game design — from zero to a working app.',                                                          accent: 'border-accent4/30 bg-accent4/5'  },
  { emoji: '🧠', title: 'AI',                desc: 'Understanding and building with AI — not just using it, but knowing how it works.',                                                accent: 'border-accent5/30 bg-accent5/5'  },
  { emoji: '💡', title: 'Entrepreneurship',  desc: 'From idea to investor pitch — startup thinking adapted for young minds in the GCC.',                                               accent: 'border-accent3/30 bg-accent3/5'  },
  { emoji: '🤖', title: 'Personal AI coach', desc: 'Adapts to your child\'s level. Explains things differently until it clicks. Always patient — in Arabic and English.',              accent: 'border-accent1/30 bg-accent1/5'  },
]

const TRACKS = [
  {
    num: '1', emoji: '💻', title: 'Coding track', sub: 'For future developers',
    desc: 'Build real apps and games using Python and web development. By week 2 your child writes their first working program.',
    tags: ['Python', 'Web dev', 'Game design', 'Ages 8+'],
    border: 'border-accent4/30',
  },
  {
    num: '2', emoji: '🧠', title: 'AI track', sub: 'For future innovators',
    desc: 'Understand machine learning by actually building AI projects — not just reading about them.',
    tags: ['Machine learning', 'AI ethics', 'Build an AI project', 'Ages 10+'],
    border: 'border-accent5/30',
  },
  {
    num: '3', emoji: '💡', title: 'Entrepreneurship track', sub: 'For future founders',
    desc: 'From first idea to a full investor pitch and MVP — startup thinking for young founders in the GCC.',
    tags: ['Ideation', 'Build an MVP', 'Pitch', 'Ages 11+'],
    border: 'border-accent3/30',
  },
]

const HOW_STEPS = [
  {
    num: '1', title: 'Take the 60-second quiz',
    desc: 'Tell us your child\'s age and what excites them. We\'ll recommend the right track and starting point.',
    badge: '60 seconds',
  },
  {
    num: '2', title: 'Meet their AI coach',
    desc: 'A personal AI tutor introduces itself in Arabic or English, then starts lesson one immediately.',
    badge: 'Day 1',
  },
  {
    num: '3', title: 'Build something real',
    desc: '15–25 minutes per day. By the end of the first module, your child has a project they can actually show people.',
    badge: 'End of module 1',
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
  'All 200+ lessons unlocked',
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
    a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 200+ lessons, and real projects — in English and Arabic.',
  },
  {
    q: 'Is the free plan really free?',
    a: 'Yes — genuinely free. No credit card, no 7-day trial, no expiry. The free plan covers the first module of each track. Pro unlocks all 200+ lessons, advanced AI coaching, and the full portfolio system.',
  },
  {
    q: 'What age is Plulai for?',
    a: 'Ages 6–18. The platform adapts automatically: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) each get age-appropriate content, pacing, and difficulty.',
  },
  {
    q: 'Does it actually support Arabic properly?',
    a: 'Real Arabic — not machine-translated content. Full RTL interface and an AI coach that teaches natively in Arabic.',
  },
  {
    q: 'How long are the lessons?',
    a: '15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.',
  },
  {
    q: 'How is it different from Scratch or Code.org?',
    a: 'Those are great starters. Plulai goes further: a personalised AI coach, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track — none of which those platforms offer.',
  },
  {
    q: 'Is it safe for my child?',
    a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold.",
  },
]

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

  // ── Start screen ──
  if (step === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted text-xs font-extrabold uppercase tracking-widest mb-2">
          3 questions · 60 seconds
        </p>
        <h3 className="font-fredoka text-2xl md:text-3xl mb-3 text-white">
          Find your child&apos;s track
        </h3>
        <p className="text-muted font-semibold text-sm mb-6 max-w-xs mx-auto">
          Tell us your child&apos;s age and interests. We&apos;ll recommend exactly where to start.
        </p>
        <button
          onClick={() => setStep(1)}
          className="px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent3/20"
        >
          Start →
        </button>
      </div>
    )
  }

  // ── Result screen ──
  if (step === QUIZ_STEPS.length + 1) {
    return (
      <div className="text-center py-4">
        <p className="text-accent3 text-xs font-extrabold uppercase tracking-widest mb-3">
          Your child&apos;s recommended track
        </p>
        <h3 className="font-fredoka text-2xl md:text-3xl mb-2 text-white">{result.title}</h3>
        <p className="text-muted font-semibold text-sm mb-6 max-w-xs mx-auto leading-relaxed">
          {result.desc}
        </p>
        <Link
          href="/auth/signup"
          className="block w-full max-w-xs mx-auto px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.25)] hover:-translate-y-1 transition-all mb-3"
        >
          Start {result.title} — Free →
        </Link>
        <p className="text-muted text-xs font-bold mb-4">No credit card · Takes 60 seconds</p>
        <button
          onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
          className="text-muted text-xs underline hover:text-white transition-colors"
        >
          Start over
        </button>
      </div>
    )
  }

  // ── Question screen ──
  const progress = Math.round((step / QUIZ_STEPS.length) * 100)

  return (
    <div className="py-2">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent3 to-accent4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-muted text-xs font-extrabold shrink-0">
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
                ? 'border-accent3 bg-accent3/10 shadow-lg shadow-accent3/10'
                : 'border-white/10 bg-card hover:border-white/25 hover:bg-card2'
            }`}
          >
            <div className="font-extrabold text-sm text-white leading-tight">{opt.label}</div>
            {opt.sub && (
              <div className="text-muted text-xs font-bold mt-1">{opt.sub}</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={next}
        disabled={!selected}
        className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all ${
          selected
            ? 'text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-0.5 shadow-lg shadow-accent3/20'
            : 'text-muted bg-white/5 cursor-not-allowed'
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
        <span className={`text-muted text-lg shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <p className="text-muted font-semibold text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 lg:px-12 py-3 md:py-4 glass border-b border-white/5">
        <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">
          Plulai
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#tracks"       className="hover:text-white transition-colors">Tracks</a>
          <a href="#quiz"         className="hover:text-white transition-colors">Find a track</a>
          <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/sharkkid" className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 rounded-xl font-extrabold text-xs md:text-sm text-white bg-gradient-to-r from-accent2 to-accent1 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent2/20 whitespace-nowrap">
            🦈 Sharkkid
          </Link>
          <Link href="/auth/login"  className="hidden md:block text-sm font-bold text-muted hover:text-white transition-colors">Log in</Link>
          <Link href="/auth/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent4/20">
            Start free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 text-center max-w-4xl mx-auto">
        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">
          <span className="text-white">The AI learning platform that teaches</span>
          <br />
          <span className="bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
            your child to build, not just browse.
          </span>
        </h1>
        <p className="text-muted text-base md:text-lg font-semibold max-w-2xl mx-auto mb-3 leading-relaxed">
          Coding, AI, and entrepreneurship — 15 minutes a day, in Arabic and English, designed for the GCC.
        </p>
        <p className="text-muted text-xs md:text-sm font-bold mb-10">
          Free forever · No credit card · Ages 6–18 · Arabic &amp; English
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.25)] hover:-translate-y-1 transition-all"
          >
            Start for free
          </Link>
          <a
            href="#quiz"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-muted bg-card border border-white/10 hover:text-white hover:border-white/20 transition-all"
          >
            Find my child&apos;s track →
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted">
          {['✅ Free forever', '✅ No credit card', '✅ Arabic & English', '✅ No ads ever', '✅ Any device'].map(t => (
            <span key={t} className="bg-card border border-white/5 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>
      </section>

      {/* ── What is it ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">
          What Plulai is
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          One platform. Three skills that matter.
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          By the end of the first month, your child will have built something real — not just watched a video about it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {WHAT_IS_IT.map((item, i) => (
            <div key={i} className={`border ${item.accent} rounded-3xl p-6 md:p-7 hover:-translate-y-1 transition-all`}>
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="font-fredoka text-xl mb-2 text-white">{item.title}</h3>
              <p className="text-muted text-sm font-semibold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Tracks</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Pick the path that fits.
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          Each track builds toward a real outcome. Kids can start with one and continue to the others — most do all three.
        </p>
        <div className="flex flex-col gap-4">
          {TRACKS.map((t, i) => (
            <div key={i} className={`bg-card border ${t.border} rounded-3xl p-6 md:p-8 flex items-start gap-5 hover:-translate-y-0.5 transition-all`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 mt-0.5">
                {t.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-fredoka text-xl text-white">{t.emoji} {t.title}</h3>
                  <span className="text-muted text-xs font-extrabold uppercase tracking-wider">{t.sub}</span>
                </div>
                <p className="text-muted text-sm font-semibold leading-relaxed mb-3">{t.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-xs font-bold text-muted border border-white/10 rounded-full px-3 py-1">
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
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">How it works</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          From signup to first project in 3 steps.
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base">
          No downloads. Works on any device. Your child can start today.
        </p>
        <div className="flex flex-col">
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-5 py-6 border-b border-white/5 last:border-0">
              <div className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center font-fredoka text-xl text-white shrink-0 mt-0.5">
                {s.num}
              </div>
              <div>
                <h3 className="font-fredoka text-xl text-white mb-1">{s.title}</h3>
                <p className="text-muted text-sm font-semibold leading-relaxed mb-2">{s.desc}</p>
                <span className="inline-block bg-accent3/10 border border-accent3/20 rounded-full px-3 py-1 text-accent3 text-xs font-extrabold">
                  {s.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.2)] hover:-translate-y-1 transition-all"
          >
            Start step 1 — free
          </Link>
        </div>
      </section>

      {/* ── Quiz ── */}
      <section id="quiz" className="py-16 md:py-24 px-4 md:px-6 max-w-2xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">
          Personalised for your child
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Not sure where to start?
        </h2>
        <p className="text-center text-muted font-semibold mb-8 text-sm md:text-base">
          3 questions and we&apos;ll tell you exactly which track to begin with.
        </p>
        <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8">
          <TrackQuiz />
        </div>
      </section>

      {/* ── Built for GCC ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">
          Built for the GCC
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Made for Arabic-speaking families. Not translated for them.
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-2xl mx-auto">
          Full RTL interface. An AI coach that teaches natively in Arabic and English. Every example is set in Dubai, Riyadh, Doha, Kuwait City, Manama, and Muscat — not Silicon Valley.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-10">
          <div className="bg-gradient-to-r from-accent4/10 to-accent5/10 border border-accent4/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-fredoka text-xl mb-2">Real Arabic</h3>
            <p className="text-muted font-semibold text-sm leading-relaxed">
              Full RTL interface and an AI coach that teaches natively in Arabic — not machine-translated content.
            </p>
          </div>
          <div className="bg-gradient-to-r from-accent3/10 to-accent4/10 border border-accent3/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-fredoka text-xl mb-2">UAE Vision 2031</h3>
            <p className="text-muted font-semibold text-sm leading-relaxed">
              Curriculum aligned with UAE Vision 2031 — AI, coding, and entrepreneurship are the three pillars demanded of the next generation.
            </p>
          </div>
          <div className="bg-gradient-to-r from-accent5/10 to-accent1/10 border border-accent5/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-fredoka text-xl mb-2">Safe for kids</h3>
            <p className="text-muted font-semibold text-sm leading-relaxed">
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
            <div key={c.name} className="bg-card border border-white/5 rounded-2xl p-3 md:p-4 text-center hover:border-white/15 transition-all">
              <div className="text-3xl mb-1">{c.flag}</div>
              <div className="font-extrabold text-xs">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center mb-3">
          Start free. Upgrade when you&apos;re ready.
        </h2>
        <p className="text-center text-muted font-semibold mb-10 text-sm md:text-base">
          The free plan is genuinely free — no 7-day trial, no credit card, no expiry.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="bg-card border-2 border-accent3 rounded-3xl p-6 md:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent3 text-black text-xs font-extrabold px-4 py-1 rounded-full whitespace-nowrap">
              Most parents start here
            </div>
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-fredoka text-2xl mb-1">Free</h3>
            <p className="font-fredoka text-4xl text-white mb-1">
              AED 0 <span className="text-muted text-base font-bold">/ month</span>
            </p>
            <p className="text-muted text-xs font-bold mb-5">Forever free. No card needed.</p>
            <ul className="space-y-2 mb-6 text-sm font-semibold">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-accent3">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-accent3 to-accent4 text-center hover:-translate-y-0.5 transition-all"
            >
              Start free now
            </Link>
          </div>
          {/* Pro */}
          <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8 opacity-80">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-fredoka text-2xl mb-1">Pro</h3>
            <p className="font-fredoka text-4xl text-white mb-1">
              $79 <span className="text-muted text-base font-bold">/ month</span>
            </p>
            <p className="text-muted text-xs font-bold mb-5">Everything in Free, plus:</p>
            <ul className="space-y-2 mb-6 text-sm font-semibold text-muted">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-accent4">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup?plan=pro"
              className="block w-full py-3.5 rounded-2xl font-extrabold text-sm text-muted bg-card2 border border-white/10 text-center hover:text-white transition-all"
            >
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section id="partners" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Partners</p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center mb-3">Our partners</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          Schools and organisations across the GCC that have partnered with Plulai.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {PARTNERS.map(partner => (
            <div
              key={partner.abbr}
              className="flex flex-col items-center justify-center text-center bg-card border border-white/5 rounded-2xl p-4 hover:-translate-y-0.5 hover:border-white/20 transition-all"
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
              <div className="font-extrabold text-xs text-muted">{partner.abbr}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-muted text-sm font-semibold mb-3">Are you a school or organisation in the GCC?</p>
          <a
            href="mailto:ceo@plulai.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-card border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all"
          >
            🤝 Become a partner
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Common questions
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base">
          Everything parents ask before signing up.
        </p>
        <div className="bg-card border border-white/5 rounded-3xl px-6 md:px-8">
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center max-w-2xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl mb-4">
          Your child can start today.
        </h2>
        <p className="text-muted font-semibold text-base md:text-lg mb-3">
          Free forever. No credit card. Works on any device. Arabic and English. Ages 6–18.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted mb-8 md:mb-10">
          {['✅ Free forever', '✅ No credit card', '✅ Arabic & English', '✅ Ages 6–18', '✅ No ads ever', '✅ Any device'].map(t => (
            <span key={t} className="bg-card border border-white/5 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>
        <Link
          href="/auth/signup"
          className="inline-block w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.25)] hover:-translate-y-1 transition-all"
        >
          Create a free account →
        </Link>
        <p className="text-muted text-xs font-bold mt-4 opacity-60">
          Trusted by families across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain &amp; Oman
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent mb-2">
                Plulai
              </div>
              <p className="text-muted text-xs font-semibold max-w-xs leading-relaxed">
                The AI learning platform for kids in the GCC. Coding, AI, and entrepreneurship — in Arabic and English.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-xs font-bold text-muted w-full md:w-auto">
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
            <p className="text-muted text-xs font-bold text-center md:text-left">
              © {new Date().getFullYear()} Plulai. The #1 edtech platform for kids in the GCC.
            </p>
            <a href="mailto:hello@plulai.com" className="text-muted text-xs font-bold hover:text-white transition-colors">
              hello@plulai.com
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}