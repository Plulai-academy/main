'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizStep = {
  id: string
  question: string
  options: { label: string; sub: string; value: string; icon: string }[]
}

type TrackResult = {
  icon: string
  color: string
  title: string
  desc: string
}

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
    icon: '💻',
    color: '#1CB0F6',
    title: 'Coding Track',
    desc: 'Start with Python basics. By end of module 1, your child will have a working program they built themselves.',
  },
  ai: {
    icon: '🧠',
    color: '#1D9E75',
    title: 'AI Track',
    desc: 'Start with how AI actually works, then build a machine learning project. Best for kids who love figuring out how things work.',
  },
  bizz: {
    icon: '💡',
    color: '#BA7517',
    title: 'Entrepreneurship Track',
    desc: 'From idea to pitch. Best for kids who are creative, love problem-solving, or have already started trying to build something.',
  },
  all: {
    icon: '🗺️',
    color: '#1CB0F6',
    title: 'Full Curriculum',
    desc: 'Start with Coding — the foundation for everything else. You can switch tracks any time, and the AI coach will guide the transition.',
  },
}

const FAQS = [
  {
    q: 'What exactly is Plulai?',
    a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic.',
  },
  {
    q: 'Is the free plan really free — forever?',
    a: 'Yes — genuinely free. No credit card, no 7-day trial, no expiry. The free plan covers the first module of each track. Pro unlocks all 500+ lessons and advanced AI coaching.',
  },
  {
    q: 'How is Arabic handled — is it translated?',
    a: 'Real Arabic — not machine-translated. Full RTL interface and an AI coach that teaches natively in Arabic, with GCC-specific examples throughout.',
  },
  {
    q: 'How long are the lessons?',
    a: '15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.',
  },
  {
    q: 'Is it safe for my child?',
    a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold.",
  },
  {
    q: 'How is it different from Scratch or YouTube?',
    a: "Plulai has a personalised AI coach that adapts to your child. It covers AI and entrepreneurship alongside coding, is in Arabic, is designed for the GCC, and produces a real portfolio — not just a history of completed videos.",
  },
]

const PARTNERS = [
  { name: 'Business Success',         logo: '/partners/bs.png'        },
  { name: 'LingoVille',               logo: '/partners/lingo.png'     },
  { name: 'The Intelligent Inventor', logo: '/partners/tie.png'       },
  { name: 'Pinacle',                  logo: '/partners/gems.png'      },
  { name: 'Les Élites Juniors',       logo: '/partners/elites.png'    },
  { name: 'La Coupole',               logo: '/partners/lacoupole.png' },
  { name: 'First Skills Club',        logo: '/partners/fsc.png'       },
]

// ─── Brand palette ─────────────────────────────────────────────────────────────
// Primary blue: #1CB0F6   Teal: #1D9E75   Amber: #BA7517
// Text: #0F1117   Muted: #6B7280   Border: #E5E7EB   Surface: #F9FAFB

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #E5E7EB' }} className="last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span style={{ color: '#0F1117', fontSize: '15px', fontWeight: 500 }}>{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink: 0, color: '#9CA3AF', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.7', paddingBottom: '20px' }}>{a}</p>
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

  // Start screen
  if (step === 0) return (
    <div className="text-center py-2">
      <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1CB0F6', marginBottom: '8px' }}>
        3 questions · 60 seconds
      </p>
      <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#0F1117', marginBottom: '8px', lineHeight: 1.2 }}>
        Find your child&apos;s track
      </h3>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', maxWidth: '280px', margin: '0 auto 24px' }}>
        Tell us their age and interests. We&apos;ll recommend exactly where to start.
      </p>
      <button
        onClick={() => setStep(1)}
        style={{ padding: '12px 28px', borderRadius: '10px', background: '#1CB0F6', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
      >
        Start →
      </button>
    </div>
  )

  // Result screen
  if (step === QUIZ_STEPS.length + 1) return (
    <div className="text-center py-2">
      <div style={{ fontSize: '44px', marginBottom: '12px' }}>{result.icon}</div>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: result.color, marginBottom: '6px' }}>
        Recommended track
      </p>
      <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#0F1117', marginBottom: '8px' }}>{result.title}</h3>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.65', maxWidth: '280px', margin: '0 auto 24px' }}>
        {result.desc}
      </p>
      <Link
        href="/auth/signup"
        style={{ display: 'block', maxWidth: '280px', margin: '0 auto 10px', padding: '13px 0', borderRadius: '10px', background: '#1CB0F6', color: '#fff', fontWeight: 600, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}
      >
        Start {result.title} — Free →
      </Link>
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>No credit card · Takes 60 seconds</p>
      <button
        onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
        style={{ fontSize: '12px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Start over
      </button>
    </div>
  )

  // Question screen
  const progress = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#F3F4F6', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#1CB0F6', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, flexShrink: 0 }}>{step} / {QUIZ_STEPS.length}</span>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1117', marginBottom: '16px', lineHeight: 1.3 }}>
        {currentQ.question}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            style={{
              textAlign: 'left',
              padding: '14px',
              borderRadius: '10px',
              border: selected === opt.value ? '2px solid #1CB0F6' : '1px solid #E5E7EB',
              background: selected === opt.value ? '#EBF7FE' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{opt.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1117', lineHeight: 1.3 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{opt.sub}</div>}
          </button>
        ))}
      </div>

      <button
        onClick={next}
        disabled={!selected}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '14px',
          border: 'none',
          cursor: selected ? 'pointer' : 'not-allowed',
          background: selected ? '#1CB0F6' : '#F3F4F6',
          color: selected ? '#fff' : '#9CA3AF',
          transition: 'all 0.15s',
        }}
      >
        {step === QUIZ_STEPS.length ? 'See my recommendation →' : 'Next →'}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: '#fff', color: '#0F1117', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '60px',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E5E7EB',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#1CB0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Image src="/icons/plulai.png" alt="Plulai" width={32} height={32} style={{ borderRadius: '9px' }} />
          </div>
          <span style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-0.4px', color: '#0F1117' }}>Plulai</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex" style={{ gap: '28px', fontSize: '14px', color: '#6B7280' }}>
          {[['#tracks', 'Tracks'], ['#how-it-works', 'How it works'], ['#schools', 'For schools'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <a key={label} href={href} style={{ color: '#6B7280', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0F1117')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/sharkkid" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 13px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #FAA918, #D33131)',
            color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          }}>
            🦈 Sharkkid
          </Link>
          <Link href="/auth/login" className="hidden md:block" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', padding: '7px 12px' }}>
            Log in
          </Link>
          <Link href="/auth/signup" style={{
            padding: '8px 18px', borderRadius: '8px', background: '#1CB0F6',
            color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          }}>
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Trust bar ── */}
      <div style={{
        marginTop: '60px',
        background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
        padding: '10px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '32px', flexWrap: 'wrap',
      }}>
        {[
          { dot: true, text: '500+ lessons' },
          { dot: true, text: 'Ages 6–18' },
          { dot: true, text: 'Arabic & English' },
          { dot: true, text: '6 GCC countries' },
          { dot: true, text: 'No ads, ever' },
        ].map(({ text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#6B7280' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1CB0F6', flexShrink: 0, display: 'block' }} />
            {text}
          </div>
        ))}
      </div>

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        {/* Eyebrow pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: '#1CB0F6', border: '1px solid #B5D4F4', padding: '5px 13px', borderRadius: '20px',
          marginBottom: '24px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1CB0F6', display: 'block' }} />
          Free forever · No credit card
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 700,
          lineHeight: 1.08, letterSpacing: '-1.2px',
          color: '#0F1117', marginBottom: '0',
        }}>
          Your child learns to{' '}
          <span style={{ color: '#1CB0F6' }}>code,<br />build AI,</span>{' '}
          and start a business.
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: '18px', color: '#6B7280', lineHeight: 1.6,
          maxWidth: '500px', margin: '16px auto 32px',
        }}>
          A personal AI coach. 500+ lessons. 15 minutes a day.
          <br />In Arabic and English — built for the GCC.
        </p>

        {/* Value chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {[
            { icon: '🤖', text: 'Personal AI coach' },
            { icon: '🌐', text: 'Arabic & English' },
            { icon: '🔒', text: 'No ads, ever' },
            { icon: '📱', text: 'Any device' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#6B7280',
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              padding: '6px 12px', borderRadius: '20px',
            }}>
              <span>{icon}</span>{text}
            </div>
          ))}
        </div>

        {/* B2C CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/signup" style={{
              padding: '14px 32px', borderRadius: '10px', background: '#1CB0F6',
              color: '#fff', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
              letterSpacing: '-0.2px',
            }}>
              Start for free — takes 60 sec
            </Link>
            <a href="#quiz" style={{
              padding: '13px 22px', borderRadius: '10px',
              background: 'transparent', color: '#0F1117', fontSize: '15px', fontWeight: 500,
              border: '1px solid #D1D5DB', textDecoration: 'none',
            }}>
              Find my child&apos;s track
            </a>
          </div>

          {/* B2B divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '360px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>Running a school or academy?</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          </div>

          <a href="#schools" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 22px', borderRadius: '10px',
            background: 'transparent', color: '#6B7280', fontSize: '14px', fontWeight: 500,
            border: '1px solid #E5E7EB', textDecoration: 'none',
          }}>
            🏫 Request a school demo
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
              background: '#FEF3C7', color: '#92400E',
            }}>For institutions</span>
          </a>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
      }}>
        {[
          { n: '500+', label: 'Lessons' },
          { n: '9.2/10', label: 'Parent rating' },
          { n: '6', label: 'GCC countries' },
          { n: 'Free', label: 'No card needed' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '20px 16px', textAlign: 'center',
            background: '#F9FAFB',
            borderRight: i < 3 ? '1px solid #E5E7EB' : 'none',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F1117', letterSpacing: '-0.5px' }}>{s.n}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── What your child gets ── */}
      <section style={{ padding: '72px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          What your child actually gets
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.8px', lineHeight: 1.15, color: '#0F1117', marginBottom: '10px' }}>
          Not videos. Not worksheets.<br />Real projects, real skills.
        </h2>
        <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.65, marginBottom: '40px' }}>
          Every lesson ends with something your child built — not just watched. By end of month one, they have a project they can show off.
        </p>

        {/* Feature rows */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden' }}>
          {[
            {
              icon: '🤖', iconBg: '#EBF7FE', tag: 'Always on', tagBg: '#EBF7FE', tagColor: '#1557A0',
              title: 'A personal AI coach',
              desc: "Adapts to your child's level. Explains things a different way until it clicks. Available in Arabic and English. Never impatient — never judges.",
            },
            {
              icon: '💻', iconBg: '#EBF7FE', tag: 'Ages 8+', tagBg: '#EBF7FE', tagColor: '#1557A0',
              title: 'Coding track',
              desc: 'Python, web development, and game design. By week 2, your child writes their first working program from scratch.',
            },
            {
              icon: '🧠', iconBg: '#E6F9F3', tag: 'Ages 10+', tagBg: '#E6F9F3', tagColor: '#0F6E56',
              title: 'AI track',
              desc: 'Build with AI — not just use it. Your child creates actual machine learning projects, not just prompts chatbots.',
            },
            {
              icon: '💡', iconBg: '#FEF3C7', tag: 'Ages 11+', tagBg: '#FEF3C7', tagColor: '#92400E',
              title: 'Entrepreneurship track',
              desc: 'From first idea to a full investor pitch. Startup thinking designed for the GCC — not Silicon Valley.',
            },
            {
              icon: '👨‍👩‍👧', iconBg: '#F3F0FF', tag: 'Weekly reports', tagBg: '#F3F0FF', tagColor: '#4C1D95',
              title: 'Parent dashboard',
              desc: "See exactly what your child learned, how long they practiced, and what they built — without having to ask them.",
            },
          ].map((item, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '16px',
              padding: '22px 22px',
              borderBottom: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none',
              background: '#fff',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: item.iconBg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0F1117', margin: 0 }}>{item.title}</h4>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                    background: item.tagBg, color: item.tagColor,
                  }}>{item.tag}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" style={{ padding: '0 24px 72px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          The three tracks
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.7px', color: '#0F1117', marginBottom: '8px' }}>
          Pick one. Switch anytime.
        </h2>
        <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, marginBottom: '32px' }}>
          Most kids end up doing all three. Start wherever your child is most excited.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            {
              accentColor: '#1CB0F6',
              icon: '💻',
              title: 'Coding',
              sub: 'Foundation track',
              desc: 'Python, web dev, and game design — from zero to a working app in the browser.',
              tags: ['Python', 'Web dev', 'Games', 'Ages 8+'],
            },
            {
              accentColor: '#1D9E75',
              icon: '🧠',
              title: 'AI',
              sub: 'Innovation track',
              desc: 'Build real AI projects — understand how machine learning works by actually doing it.',
              tags: ['ML', 'AI ethics', 'Projects', 'Ages 10+'],
            },
            {
              accentColor: '#BA7517',
              icon: '💡',
              title: 'Entrepreneurship',
              sub: 'Founder track',
              desc: 'Idea to pitch to MVP. Built for the GCC, not Silicon Valley.',
              tags: ['Ideation', 'MVP', 'Pitch', 'Ages 11+'],
            },
          ].map((t) => (
            <div key={t.title} style={{
              border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden',
              background: '#fff',
            }}>
              {/* Accent bar */}
              <div style={{ height: '3px', background: t.accentColor }} />
              <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '22px', marginBottom: '10px' }}>{t.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F1117', marginBottom: '3px' }}>{t.title}</h3>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.accentColor, marginBottom: '8px' }}>
                  {t.sub}
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.55 }}>{t.desc}</p>
              </div>
              <div style={{ padding: '12px 16px', background: '#F9FAFB', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                    background: '#fff', color: '#9CA3AF', border: '1px solid #E5E7EB',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: '#E5E7EB', margin: '0 24px' }} />

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '72px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          How it works
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.7px', color: '#0F1117', marginBottom: '8px' }}>
          From signup to first project.
        </h2>
        <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '36px' }}>
          No downloads. Works on any device. Start today.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            {
              n: '1', badge: '60 seconds',
              title: 'Take the quick quiz',
              desc: "Tell us your child's age and what excites them. We recommend the right track and starting point.",
            },
            {
              n: '2', badge: 'Day 1',
              title: 'Meet their AI coach',
              desc: 'A personal AI tutor starts in Arabic or English — adapts to their level, always patient.',
            },
            {
              n: '3', badge: 'End of month 1',
              title: 'Build something real',
              desc: '15–25 minutes per day. By end of the first module, your child has a project they can actually show people.',
            },
          ].map((s, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '18px',
              padding: '22px 0',
              borderBottom: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#F3F4F6', border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 600, color: '#6B7280', flexShrink: 0, marginTop: '2px',
              }}>
                {s.n}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0F1117', margin: 0 }}>{s.title}</h4>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '20px',
                    background: '#EBF7FE', color: '#1557A0',
                  }}>{s.badge}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/auth/signup" style={{
            display: 'inline-block', padding: '13px 32px', borderRadius: '10px',
            background: '#1CB0F6', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none',
          }}>
            Start step 1 — free
          </Link>
        </div>
      </section>

      {/* ── Quiz ── */}
      <section id="quiz" style={{ padding: '0 24px 72px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
            Personalised for your child
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.6px', color: '#0F1117', marginBottom: '8px' }}>
            Not sure where to start?
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280' }}>
            3 questions and we&apos;ll tell you exactly which track to begin with.
          </p>
        </div>
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px',
          padding: '28px 28px',
        }}>
          <TrackQuiz />
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: '#E5E7EB', margin: '0 24px' }} />

      {/* ── For Schools (B2B) ── */}
      <section id="schools" style={{ padding: '72px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          For schools & institutions
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.7px', color: '#0F1117', marginBottom: '8px' }}>
          Bring Plulai into your classrooms.
        </h2>
        <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, marginBottom: '32px' }}>
          Curriculum-aligned. Teacher dashboards. Arabic-native. Aligned with GCC Vision 2031.
        </p>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden' }}>
          {/* B2B card header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '20px 24px', background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: '#fff', border: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>
              🏫
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: '2px' }}>
                Institutional plan
              </p>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F1117', margin: 0 }}>
                Schools, academies & training centres
              </h3>
            </div>
          </div>

          {/* B2B card body */}
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
              Drop Plulai into your existing schedule as a weekly enrichment class or full-year elective. We handle
              localisation, teacher training, parent communication, and progress reporting — you focus on the outcomes.
            </p>

            {/* B2B metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { n: '7', label: 'Partner schools' },
                { n: '6', label: 'GCC countries' },
                { n: '9.2', label: 'Satisfaction score' },
              ].map((m) => (
                <div key={m.label} style={{
                  background: '#F9FAFB', border: '1px solid #E5E7EB',
                  borderRadius: '10px', padding: '14px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F1117', letterSpacing: '-0.4px' }}>{m.n}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* B2B buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="mailto:schools@plulai.com" style={{
                flex: 1, padding: '12px 0', borderRadius: '9px',
                background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 600,
                textDecoration: 'none', textAlign: 'center', display: 'block',
              }}>
                Book a 20-min demo
              </a>
              <a href="mailto:schools@plulai.com" style={{
                padding: '12px 16px', borderRadius: '9px',
                background: 'transparent', color: '#6B7280', fontSize: '14px', fontWeight: 500,
                border: '1px solid #D1D5DB', textDecoration: 'none', display: 'block',
              }}>
                Download curriculum guide
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GCC section ── */}
      <section style={{ padding: '0 24px 72px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          Made for the region
        </p>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.6px', color: '#0F1117', marginBottom: '10px' }}>
          Real Arabic. Real GCC context.
        </h2>
        <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 28px' }}>
          Not translated from English. Every example, every city, every business idea is set in the GCC — so it actually makes sense to your child.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {[
            { flag: '🇦🇪', name: 'UAE' },
            { flag: '🇸🇦', name: 'Saudi Arabia' },
            { flag: '🇶🇦', name: 'Qatar' },
            { flag: '🇰🇼', name: 'Kuwait' },
            { flag: '🇧🇭', name: 'Bahrain' },
            { flag: '🇴🇲', name: 'Oman' },
          ].map(c => (
            <div key={c.name} style={{
              border: '1px solid #E5E7EB', borderRadius: '10px',
              padding: '14px 8px', background: '#fff', textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>{c.flag}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: '#E5E7EB', margin: '0 24px' }} />

      {/* ── Rating callout ── */}
      <section style={{ padding: '72px 24px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: '16px', padding: '40px 32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="24" height="24" viewBox="0 0 20 20" fill="#F59E0B">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: '56px', fontWeight: 700, color: '#0F1117', letterSpacing: '-1.5px', lineHeight: 1 }}>
            9.2<span style={{ fontSize: '24px', color: '#9CA3AF', fontWeight: 400 }}>/10</span>
          </div>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>
            Average rating from parents across the GCC
          </p>
        </div>
      </section>

      {/* ── Partners ── */}
      <section style={{ padding: '0 24px 72px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
            Partners
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.6px', color: '#0F1117', marginBottom: '8px' }}>
            Schools & organisations
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280' }}>
            Trusted by institutions across the GCC.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {PARTNERS.map(p => (
            <div key={p.name} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '18px 12px', border: '1px solid #E5E7EB',
              borderRadius: '10px', background: '#fff', textAlign: 'center',
            }}>
              <div style={{ width: '48px', height: '48px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image src={p.logo} alt={p.name} width={48} height={48} style={{ objectFit: 'contain', opacity: 0.7 }} />
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, lineHeight: 1.3 }}>{p.name}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>Are you a school or organisation in the GCC?</p>
          <a href="mailto:ceo@plulai.com" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '9px',
            background: '#fff', color: '#0F1117', fontSize: '14px', fontWeight: 500,
            border: '1px solid #D1D5DB', textDecoration: 'none',
          }}>
            🤝 Become a partner
          </a>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: '#E5E7EB', margin: '0 24px' }} />

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '72px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          Pricing
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.7px', color: '#0F1117', marginBottom: '8px' }}>
          Start free. No tricks.
        </h2>
        <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '36px' }}>
          The free plan doesn&apos;t expire, doesn&apos;t need a credit card, and doesn&apos;t suddenly stop working.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Free plan */}
          <div style={{ border: '2px solid #1CB0F6', borderRadius: '14px', padding: '24px 22px', background: '#fff' }}>
            <span style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 10px',
              borderRadius: '20px', background: '#EBF7FE', color: '#1557A0', marginBottom: '14px',
            }}>
              Most parents start here
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F1117', marginBottom: '4px' }}>Free</h3>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F1117', letterSpacing: '-0.6px', marginBottom: '2px' }}>
              AED 0 <span style={{ fontSize: '14px', fontWeight: 400, color: '#9CA3AF' }}>/month</span>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '18px' }}>Forever free. No card needed.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
              {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px', color: '#1CB0F6' }}>
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" style={{
              display: 'block', width: '100%', padding: '12px 0', borderRadius: '9px',
              background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', textAlign: 'center',
            }}>
              Create free account
            </Link>
          </div>

          {/* Pro plan */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px', padding: '24px 22px', background: '#fff' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F1117', marginBottom: '4px' }}>Pro</h3>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F1117', letterSpacing: '-0.6px', marginBottom: '2px' }}>
              $79 <span style={{ fontSize: '14px', fontWeight: 400, color: '#9CA3AF' }}>/month</span>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '18px' }}>Everything in Free, plus:</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
              {['All 500+ lessons unlocked', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Certificate of completion', 'Priority support'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px', color: '#1CB0F6' }}>
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?plan=pro" style={{
              display: 'block', width: '100%', padding: '12px 0', borderRadius: '9px',
              background: 'transparent', color: '#374151', fontSize: '14px', fontWeight: 600,
              border: '1px solid #D1D5DB', textDecoration: 'none', textAlign: 'center',
            }}>
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: '#E5E7EB', margin: '0 24px' }} />

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '72px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: '8px' }}>
          FAQ
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.7px', color: '#0F1117', marginBottom: '36px' }}>
          Everything parents ask<br />before signing up.
        </h2>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden', padding: '0 24px' }}>
          {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          background: '#F0F9FF', border: '1px solid #BAE6FD',
          borderRadius: '16px', padding: '52px 36px', textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#0F1117', marginBottom: '10px' }}>
            Your child can start today.
          </h2>
          <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.65, marginBottom: '28px' }}>
            Free forever. No credit card. Arabic and English.<br />Ages 6–18 across the GCC.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{
              padding: '14px 32px', borderRadius: '10px', background: '#1CB0F6',
              color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none',
            }}>
              Create a free account →
            </Link>
            <a href="mailto:schools@plulai.com" style={{
              padding: '13px 22px', borderRadius: '10px',
              background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 500,
              border: '1px solid #D1D5DB', textDecoration: 'none',
            }}>
              Book a school demo
            </a>
          </div>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '18px' }}>
            Trusted by families across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain & Oman
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#1CB0F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/icons/plulai.png" alt="Plulai" width={28} height={28} style={{ borderRadius: '8px' }} />
                </div>
                <span style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.3px', color: '#0F1117' }}>Plulai</span>
              </div>
              <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '200px', lineHeight: 1.6 }}>
                AI learning for kids in the GCC — coding, AI & entrepreneurship in Arabic and English.
              </p>
            </div>

            {/* Footer columns */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '12px' }}>
                  Platform
                </h4>
                {[['#tracks', 'Tracks'], ['#how-it-works', 'How it works'], ['#quiz', 'Find a track'], ['/pricing', 'Pricing'], ['/auth/signup', 'Sign up free'], ['/sharkkid', '🦈 Sharkkid']].map(([href, label]) => (
                  <a key={label} href={href} style={{ display: 'block', fontSize: '13px', color: '#6B7280', textDecoration: 'none', marginBottom: '7px' }}>
                    {label}
                  </a>
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '12px' }}>
                  Countries
                </h4>
                {['🇦🇪 UAE', '🇸🇦 Saudi Arabia', '🇶🇦 Qatar', '🇰🇼 Kuwait', '🇧🇭 Bahrain', '🇴🇲 Oman'].map(c => (
                  <p key={c} style={{ fontSize: '13px', color: '#6B7280', marginBottom: '7px' }}>{c}</p>
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '12px' }}>
                  Company
                </h4>
                {[['mailto:hello@plulai.com', 'Contact'], ['mailto:partners@plulai.com', 'Partners'], ['mailto:schools@plulai.com', 'Schools']].map(([href, label]) => (
                  <a key={label} href={href} style={{ display: 'block', fontSize: '13px', color: '#6B7280', textDecoration: 'none', marginBottom: '7px' }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>© {new Date().getFullYear()} Plulai. The AI learning platform for kids in the GCC.</p>
            <a href="mailto:hello@plulai.com" style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'none' }}>hello@plulai.com</a>
          </div>
        </div>
      </footer>

    </div>
  )
}