'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizOption = { label: string; sub: string; value: string; icon: string }
type QuizStep = { id: string; question: string; options: QuizOption[] }
type TrackResult = { icon: string; color: string; title: string; desc: string }

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'age',
    question: 'How old is your child?',
    options: [
      { label: '6–8 years',   sub: 'Mini Explorer',   value: 'mini',   icon: '🌱' },
      { label: '9–11 years',  sub: 'Junior Creator',  value: 'junior', icon: '⚡' },
      { label: '12–14 years', sub: 'Pro Explorer',    value: 'pro',    icon: '🚀' },
      { label: '15–18 years', sub: 'Tech Expert',     value: 'expert', icon: '🔥' },
    ],
  },
  {
    id: 'interest',
    question: 'What excites them most?',
    options: [
      { label: 'Building apps & games', sub: 'Coding track',     value: 'coding', icon: '💻' },
      { label: 'AI & smart tech',       sub: 'AI track',         value: 'ai',     icon: '🧠' },
      { label: 'Starting a business',   sub: 'Entrepreneurship', value: 'bizz',   icon: '💡' },
      { label: 'Not sure yet',          sub: "We'll guide you",  value: 'all',    icon: '🗺️' },
    ],
  },
  {
    id: 'goal',
    question: 'What matters most to you?',
    options: [
      { label: 'Screen time with purpose', sub: '', value: 'screen', icon: '📱' },
      { label: 'Future career advantage',  sub: '', value: 'career', icon: '🏆' },
      { label: 'Building confidence',      sub: '', value: 'conf',   icon: '💪' },
      { label: 'Real skills, not theory',  sub: '', value: 'skills', icon: '🛠️' },
    ],
  },
]

const TRACK_RESULT: Record<string, TrackResult> = {
  coding: {
    icon: '💻', color: '#1CB0F6', title: 'Coding Track',
    desc: 'Start with Python basics. By end of module 1, your child will have a working program they built themselves.',
  },
  ai: {
    icon: '🧠', color: '#1D9E75', title: 'AI Track',
    desc: 'Start with how AI actually works, then build a machine learning project. Best for kids who love figuring out how things work.',
  },
  bizz: {
    icon: '💡', color: '#FAA918', title: 'Entrepreneurship Track',
    desc: 'From idea to pitch. Best for kids who are creative, love problem-solving, or have already started trying to build something.',
  },
  all: {
    icon: '🗺️', color: '#1CB0F6', title: 'Full Curriculum',
    desc: 'Start with Coding — the foundation for everything else. You can switch tracks any time, and the AI coach will guide the transition.',
  },
}

const FAQS = [
  { q: 'What exactly is Plulai?', a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic.' },
  { q: 'Is the free plan really free — forever?', a: 'Yes — genuinely free. No credit card, no 7-day trial, no expiry. The free plan covers the first module of each track. Pro unlocks all 500+ lessons and advanced AI coaching.' },
  { q: 'Is the Arabic real — or machine translated?', a: 'Real Arabic — not machine-translated. Full RTL interface and an AI coach that teaches natively in Arabic, with GCC-specific examples throughout. Not an English product with Arabic subtitles.' },
  { q: 'How long are the lessons?', a: '15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.' },
  { q: 'Is it safe for my child?', a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold." },
  { q: 'How is it different from Scratch or YouTube?', a: "Plulai has a personalised AI coach that adapts to your child — Scratch doesn't. It covers AI and entrepreneurship alongside coding, works in Arabic, is designed for the GCC, and builds a real portfolio — not just a history of completed videos." },
]

const PARTNERS = [
  'Business Success',
  'LingoVille',
  'The Intelligent Inventor',
  'Les Élites Juniors',
  'La Coupole',
  'First Skills Club',
  'Pinacle',
]

// ─── Shared styles (inline, no Tailwind dependency for these) ─────────────────
// Primary:  #1CB0F6   Green: #1D9E75   Amber: #FAA918
// BG:       #0B0F1A   Surface: #0F1420  Border: rgba(255,255,255,0.07)
// Text:     #F1F5F9   Muted: rgba(255,255,255,0.45)

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left"
        style={{ padding: '18px 0' }}
      >
        <span style={{ fontSize: '15px', fontWeight: 500, color: '#F1F5F9' }}>{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink: 0, color: 'rgba(255,255,255,0.3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, paddingBottom: '18px' }}>{a}</p>
      )}
    </div>
  )
}

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
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1CB0F6', marginBottom: '8px' }}>
        3 questions · 60 seconds
      </p>
      <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#F1F5F9', marginBottom: '8px', lineHeight: 1.2 }}>
        Find your child&apos;s track
      </h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px', maxWidth: '280px', margin: '0 auto 24px' }}>
        Tell us their age and interests. We&apos;ll recommend exactly where to start.
      </p>
      <button
        onClick={() => setStep(1)}
        style={{ padding: '12px 28px', borderRadius: '9px', background: '#1CB0F6', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
      >
        Start →
      </button>
    </div>
  )

  if (step === QUIZ_STEPS.length + 1) return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: '44px', marginBottom: '12px' }}>{result.icon}</div>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: result.color, marginBottom: '6px' }}>
        Recommended track
      </p>
      <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#F1F5F9', marginBottom: '8px' }}>{result.title}</h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '280px', margin: '0 auto 24px' }}>
        {result.desc}
      </p>
      <Link
        href="/auth/signup"
        style={{
          display: 'block', maxWidth: '280px', margin: '0 auto 10px',
          padding: '13px 0', borderRadius: '9px', background: '#1CB0F6',
          color: '#fff', fontWeight: 600, fontSize: '14px', textDecoration: 'none', textAlign: 'center',
        }}
      >
        Start {result.title} — Free →
      </Link>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>No credit card · Takes 60 seconds</p>
      <button
        onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
        style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Start over
      </button>
    </div>
  )

  const progress = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#1CB0F6', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, flexShrink: 0 }}>{step} / {QUIZ_STEPS.length}</span>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F1F5F9', marginBottom: '16px', lineHeight: 1.3 }}>
        {currentQ.question}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            style={{
              textAlign: 'left', padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
              border: selected === opt.value ? '2px solid #1CB0F6' : '1px solid rgba(255,255,255,0.08)',
              background: selected === opt.value ? 'rgba(28,176,246,0.1)' : 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{opt.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{opt.sub}</div>}
          </button>
        ))}
      </div>

      <button
        onClick={next}
        disabled={!selected}
        style={{
          width: '100%', padding: '13px', borderRadius: '9px', fontWeight: 600, fontSize: '14px',
          border: 'none', cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
          background: selected ? '#1CB0F6' : 'rgba(255,255,255,0.05)',
          color: selected ? '#fff' : 'rgba(255,255,255,0.2)',
        }}
      >
        {step === QUIZ_STEPS.length ? 'See my recommendation →' : 'Next →'}
      </button>
    </div>
  )
}

// ─── Reusable section heading ─────────────────────────────────────────────────

function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: React.ReactNode; sub?: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: sub ? '36px' : '28px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 600, letterSpacing: '-0.7px', lineHeight: 1.15, color: '#F1F5F9', marginBottom: sub ? '10px' : 0 }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: center ? '460px' : '100%', margin: center ? '0 auto' : undefined }}>{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const S = {
  page: { background: '#0B0F1A', color: '#F1F5F9', fontFamily: 'var(--font-sans, system-ui, sans-serif)' } as React.CSSProperties,
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: '58px',
    background: 'rgba(11,15,26,0.92)', backdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  } as React.CSSProperties,
  section: { padding: '72px 32px', maxWidth: '720px', margin: '0 auto' } as React.CSSProperties,
  sep: { height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 32px' } as React.CSSProperties,
  card: { border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' as const, background: '#0F1420' },
}

export default function LandingPage() {
  return (
    <div style={S.page}>

      {/* ── Nav ── */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#1CB0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            <Image src="/icons/plulai.png" alt="Plulai logo" width={30} height={30} style={{ display: 'block' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#F1F5F9', letterSpacing: '-0.3px' }}>Plulai</span>
        </div>

        <div className="hidden md:flex" style={{ gap: '26px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
          {[['#tracks', 'Tracks'], ['#how-it-works', 'How it works'], ['#schools', 'For schools'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F1F5F9')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/sharkkid" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 13px', borderRadius: '7px',
            background: 'linear-gradient(135deg,#FAA918,#D33131)',
            color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
          }}>
            🦈 Sharkkid
          </Link>
          <Link href="/auth/login" className="hidden md:block" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', padding: '7px 12px' }}>
            Log in
          </Link>
          <Link href="/auth/signup" style={{
            padding: '8px 18px', borderRadius: '7px', background: '#1CB0F6',
            color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          }}>
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Trust bar ── */}
      <div style={{ marginTop: '58px', background: 'rgba(28,176,246,0.05)', borderBottom: '1px solid rgba(28,176,246,0.1)', padding: '9px 32px', display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}>
        {['500+ lessons', '200+ active learners', 'Ages 6–18', 'Arabic & English', '6 GCC countries', 'No ads, ever'].map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1CB0F6', display: 'block', flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 32px 72px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1CB0F6', border: '1px solid rgba(28,176,246,0.3)', padding: '5px 13px', borderRadius: '20px', marginBottom: '28px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1CB0F6', display: 'block' }} />
          15 days Free trial · No credit card
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(34px,5.5vw,52px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-1.2px', color: '#F1F5F9', marginBottom: '18px' }}>
          Your child learns to{' '}
          <span style={{ color: '#1CB0F6' }}>code,<br />build AI,</span>
          {' '}and start a business.
        </h1>

        {/* Subheadline */}
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '460px', margin: '0 auto 36px' }}>
          A personal AI coach. 500+ lessons. 15 minutes a day.<br />
          Built for the GCC — in Arabic and English.
        </p>

        {/* Value chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {[
            { icon: '🤖', text: 'Personal AI coach' },
            { icon: '🌐', text: 'Arabic & English' },
            { icon: '🔒', text: 'No ads, ever' },
            { icon: '📱', text: 'Any device' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', padding: '6px 12px', borderRadius: '20px' }}>
              <span>{icon}</span>{text}
            </div>
          ))}
        </div>

        {/* B2C CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/signup" style={{ padding: '14px 32px', borderRadius: '9px', background: '#1CB0F6', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.2px' }}>
              Start for free — 60 seconds
            </Link>
            <a href="#quiz" style={{ padding: '13px 22px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
              Find my child&apos;s track
            </a>
          </div>

          {/* B2B divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '360px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Running a school or academy?</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <a href="#schools" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '9px', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
            🏫 Request a school demo
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: 'rgba(250,169,24,0.12)', color: '#FAA918', border: '1px solid rgba(250,169,24,0.2)' }}>
              For institutions
            </span>
          </a>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(255,255,255,0.07)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { n: '500+', label: 'Lessons' },
          { n: '200+', label: 'Active learners' },
          { n: '9.2/10', label: 'Parent rating' },
          { n: '6', label: 'GCC countries' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0B0F1A', padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1CB0F6', letterSpacing: '-0.5px' }}>{s.n}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── What your child gets ── */}
      <section style={S.section}>
        <SectionHead
          eyebrow="What your child actually gets"
          title={<>Not videos. Not worksheets.<br />Real projects, real skills.</>}
          sub="Every lesson ends with something your child built — not just watched. By end of month one, they have a project they can show off."
        />
        <div style={S.card}>
          {[
            { icon: '🤖', iconBg: 'rgba(28,176,246,0.1)',  tag: 'Always on',      tagColor: '#1CB0F6', tagBorder: 'rgba(28,176,246,0.2)',  title: 'A personal AI coach',       desc: "Adapts to your child's level. Explains things a different way until it clicks. Never impatient — in Arabic or English." },
            { icon: '💻', iconBg: 'rgba(28,176,246,0.1)',  tag: 'Ages 8+',        tagColor: '#1CB0F6', tagBorder: 'rgba(28,176,246,0.2)',  title: 'Coding track',              desc: 'Python, web development, and game design. By week 2, your child writes their first working program from scratch.' },
            { icon: '🧠', iconBg: 'rgba(29,158,117,0.1)',  tag: 'Ages 10+',       tagColor: '#1D9E75', tagBorder: 'rgba(29,158,117,0.2)', title: 'AI track',                  desc: 'Build with AI — not just use it. Your child creates actual machine learning projects, not just prompts chatbots.' },
            { icon: '💡', iconBg: 'rgba(250,169,24,0.1)',  tag: 'Ages 11+',       tagColor: '#FAA918', tagBorder: 'rgba(250,169,24,0.2)',  title: 'Entrepreneurship track',    desc: 'From first idea to investor pitch. Startup thinking designed for the GCC — not Silicon Valley.' },
            { icon: '👨‍👩‍👧', iconBg: 'rgba(168,85,247,0.1)', tag: 'Weekly reports', tagColor: '#A855F7', tagBorder: 'rgba(168,85,247,0.2)', title: 'Parent dashboard',          desc: "See exactly what your child learned, how long they practiced, and what they built — without having to ask them." },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '22px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#F1F5F9', margin: 0 }}>{item.title}</h4>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: item.iconBg, color: item.tagColor, border: `1px solid ${item.tagBorder}` }}>
                    {item.tag}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={S.sep} />

      {/* ── Tracks ── */}
      <section id="tracks" style={S.section}>
        <SectionHead
          eyebrow="The three tracks"
          title="Pick one. Switch anytime."
          sub="Most kids end up doing all three. Start wherever your child is most excited."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { color: '#1CB0F6', icon: '💻', title: 'Coding',           sub: 'Foundation track', desc: 'Python, web dev, and game design — from zero to a working app in the browser.', tags: ['Python', 'Web dev', 'Games' ] },
            { color: '#1D9E75', icon: '🧠', title: 'AI',               sub: 'Innovation track',  desc: 'Build real AI projects — understand machine learning by actually doing it.',         tags: ['ML', 'AI ethics', 'Projects' ] },
            { color: '#FAA918', icon: '💡', title: 'Entrepreneurship', sub: 'Founder track',     desc: 'Idea to pitch to MVP. Built for the GCC, not Silicon Valley.',                     tags: ['Ideation', 'MVP', 'Pitch'] },
          ].map(t => (
            <div key={t.title} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', background: '#0F1420' }}>
              <div style={{ height: '2px', background: t.color }} />
              <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
                  {t.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#F1F5F9', marginBottom: '3px' }}>{t.title}</h3>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.color, marginBottom: '8px' }}>{t.sub}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>{t.desc}</p>
              </div>
              <div style={{ padding: '12px 16px', background: '#0B0F1A', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={S.sep} />

      {/* ── How it works ── */}
      <section id="how-it-works" style={S.section}>
        <SectionHead
          eyebrow="How it works"
          title="From signup to first project."
          sub="No downloads. Works on any device. Your child starts today."
        />
        <div>
          {[
            { n: '1', badge: '60 seconds',    title: 'Take the quick quiz',     desc: "Tell us your child's age and what excites them. We recommend the right track and starting point — no guessing." },
            { n: '2', badge: 'Day 1',          title: 'Meet their AI coach',     desc: 'A personal AI tutor starts in Arabic or English — adapts to their level, always patient.' },
            { n: '3', badge: 'End of month 1', title: 'Build something real',    desc: '15–25 minutes per day. By end of the first module, your child has a project they can actually show people.' },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: '18px', padding: '22px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0F1420', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: '2px' }}>
                {s.n}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#F1F5F9', margin: 0 }}>{s.title}</h4>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '20px', background: 'rgba(28,176,246,0.1)', color: '#1CB0F6', border: '1px solid rgba(28,176,246,0.2)' }}>{s.badge}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/auth/signup" style={{ display: 'inline-block', padding: '13px 32px', borderRadius: '9px', background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Start step 1 — it&apos;s free
          </Link>
        </div>
      </section>

      <div style={S.sep} />

      {/* ── Quiz ── */}
      <section id="quiz" style={{ ...S.section, maxWidth: '580px' }}>
        <SectionHead
          eyebrow="Personalised for your child"
          title="Not sure where to start?"
          sub="3 questions and we'll tell you exactly which track to begin with."
          center
        />
        <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px' }}>
          <TrackQuiz />
        </div>
      </section>

      <div style={S.sep} />

      {/* ── For Schools (B2B) ── */}
      <section id="schools" style={S.section}>
        <SectionHead
          eyebrow="For schools & institutions"
          title="Bring Plulai into your classrooms."
          sub="Curriculum-aligned. Teacher dashboards. Arabic-native. Aligned with GCC Vision 2031."
        />
        <div style={S.card}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              🏫
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Institutional plan</p>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#F1F5F9', margin: 0 }}>Schools, academies & training centres</h3>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '20px' }}>
              Drop Plulai into your existing schedule as a weekly enrichment class or a full-year elective. We handle localisation, teacher training, parent communication, and progress reporting — you focus on the outcomes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
              {[{ n: '7', label: 'Partner schools' }, { n: '6', label: 'GCC countries' }, { n: '9.2', label: 'Satisfaction score' }].map(m => (
                <div key={m.label} style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.4px' }}>{m.n}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '9px' }}>
              <a href="mailto:schools@plulai.com" style={{ flex: 1, padding: '11px 0', borderRadius: '8px', background: '#1CB0F6', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                Book a 20-min demo
              </a>
              <a href="mailto:schools@plulai.com" style={{ padding: '11px 16px', borderRadius: '8px', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', display: 'block' }}>
                Download curriculum guide
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GCC ── */}
      <section style={{ ...S.section, paddingTop: 0, textAlign: 'center' }}>
        <SectionHead
          eyebrow="Available across the GCC"
          title="Real Arabic. Real GCC context."
          sub="Not translated from English. Every example, every city, every business idea is set in the GCC."
          center
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '9px' }}>
          {[{ flag: '🇦🇪', name: 'UAE' }, { flag: '🇸🇦', name: 'Saudi Arabia' }, { flag: '🇶🇦', name: 'Qatar' }, { flag: '🇰🇼', name: 'Kuwait' }, { flag: '🇧🇭', name: 'Bahrain' }, { flag: '🇴🇲', name: 'Oman' }].map(c => (
            <div key={c.name} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px 8px', background: '#0F1420', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '5px' }}>{c.flag}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={S.sep} />

      {/* ── Pricing ── */}
      <section id="pricing" style={S.section}>
        <SectionHead
          eyebrow="Pricing"
          title="Start free. No tricks."
          sub="The free plan never expires, needs no credit card, and doesn't lock you out after 7 days."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Free */}
          <div style={{ border: '2px solid #1CB0F6', borderRadius: '14px', padding: '24px 22px', background: '#0F1420' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'rgba(28,176,246,0.1)', color: '#1CB0F6', border: '1px solid rgba(28,176,246,0.25)', marginBottom: '14px' }}>
              Most parents start here
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', marginBottom: '4px' }}>Free</h3>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.6px', marginBottom: '2px' }}>
              AED 0 <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>/month</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '18px' }}>Forever free. No card needed.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
              {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="#1CB0F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" style={{ display: 'block', padding: '12px 0', borderRadius: '8px', background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
              Create free account
            </Link>
          </div>
          {/* Pro */}
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px 22px', background: '#0F1420' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', marginBottom: '4px' }}>Pro</h3>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.6px', marginBottom: '2px' }}>
              $79 <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>/month</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '18px' }}>Everything in Free, plus:</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
              {['All 500+ lessons unlocked', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Certificate of completion', 'Priority support'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="#1CB0F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?plan=pro" style={{ display: 'block', padding: '12px 0', borderRadius: '8px', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', textAlign: 'center' }}>
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Rating ── */}
      <section style={{ ...S.section, paddingTop: 0, maxWidth: '580px' }}>
        <div style={{ background: '#0F1420', border: '1px solid rgba(250,169,24,0.18)', borderRadius: '14px', padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="22" height="22" viewBox="0 0 20 20" fill="#FAA918">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: '52px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-1.5px', lineHeight: 1 }}>
            9.2<span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>/10</span>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>Average rating from parents across the GCC</p>
        </div>
      </section>

      <div style={S.sep} />

      {/* ── Partners ── */}
      <section style={S.section}>
        <SectionHead
          eyebrow="Partners"
          title="Trusted by institutions across the GCC."
          sub="Schools and organisations already working with Plulai."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {PARTNERS.map(name => (
            <div key={name} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '18px 12px', background: '#0F1420', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image src={`/partners/${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`} alt={name} width={44} height={44} style={{ objectFit: 'contain', opacity: 0.65 }} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, lineHeight: 1.3 }}>{name}</div>
            </div>
          ))}
          {/* Become a partner slot */}
          <a href="mailto:ceo@plulai.com" style={{ border: '1px dashed rgba(28,176,246,0.25)', borderRadius: '10px', padding: '18px 12px', background: 'rgba(28,176,246,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
            <div style={{ width: '44px', height: '44px', marginBottom: '8px', background: 'rgba(28,176,246,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>+</div>
            <div style={{ fontSize: '11px', color: 'rgba(28,176,246,0.7)', fontWeight: 500 }}>Become a partner</div>
          </a>
        </div>
      </section>

      <div style={S.sep} />

      {/* ── FAQ ── */}
      <section id="faq" style={S.section}>
        <SectionHead eyebrow="FAQ" title="Everything parents ask before signing up." />
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', padding: '0 24px', background: '#0F1420' }}>
          {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 32px 80px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ background: '#0F1420', border: '1px solid rgba(28,176,246,0.15)', borderRadius: '16px', padding: '52px 36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#F1F5F9', marginBottom: '10px' }}>
            Your child can start today.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '28px' }}>
            15 days Free trial. No credit card. Arabic and English.<br />Ages 6–18 across the GCC.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ padding: '13px 30px', borderRadius: '9px', background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              Create a free account →
            </Link>
            <a href="mailto:schools@plulai.com" style={{ padding: '12px 22px', borderRadius: '9px', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', display: 'inline-block' }}>
              Book a school demo
            </a>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '18px' }}>
            Trusted by 200+ learners across UAE · Saudi Arabia · Qatar · Kuwait · Bahrain · Oman
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '48px 32px 28px', background: '#0B0F1A' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src="/icons/plulai.png" alt="Plulai" width={28} height={28} style={{ display: 'block' }} />
                </div>
                <span style={{ fontSize: '17px', fontWeight: 600, color: '#F1F5F9', letterSpacing: '-0.3px' }}>Plulai</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', maxWidth: '190px', lineHeight: 1.6 }}>
                AI learning for kids in the GCC — coding, AI & entrepreneurship in Arabic and English.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { title: 'Platform', links: [['#tracks', 'Tracks'], ['#how-it-works', 'How it works'], ['#pricing', 'Pricing'], ['#quiz', 'Find a track'], ['/auth/signup', 'Sign up free'], ['/sharkkid', '🦈 Sharkkid']] },
                { title: 'Institutions', links: [['#schools', 'For schools'], ['mailto:schools@plulai.com', 'Request demo'], ['mailto:partners@plulai.com', 'Curriculum guide']] },
                { title: 'Contact', links: [['mailto:hello@plulai.com', 'hello@plulai.com'], ['mailto:schools@plulai.com', 'schools@plulai.com'], ['mailto:partners@plulai.com', 'partners@plulai.com']] },
              ].map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.25)', marginBottom: '12px' }}>{col.title}</h4>
                  {col.links.map(([href, label]) => (
                    <a key={label} href={href} style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: '7px' }}>{label}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Plulai. The AI learning platform for kids in the GCC.</p>
            <a href="mailto:hello@plulai.com" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>hello@plulai.com</a>
          </div>
        </div>
      </footer>

    </div>
  )
}