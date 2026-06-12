'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Nunito, Fredoka } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

// ─── Types ────────────────────────────────────────────────────────────────────
type QuizOption  = { label: string; sub: string; value: string; icon: string }
type QuizStep    = { id: string; question: string; options: QuizOption[] }
type TrackResult = { icon: string; color: string; bg: string; title: string; desc: string }

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
  coding: { icon: '💻', color: '#0C7FC4', bg: '#EBF7FE', title: 'Coding Track',           desc: 'Start with Python. By end of module 1, your child will have a working program they built themselves.' },
  ai:     { icon: '🧠', color: '#27500A', bg: '#EAF7D4', title: 'AI Track',               desc: 'Start with how AI works, then build a machine learning project. Best for curious problem-solvers.' },
  bizz:   { icon: '💡', color: '#633806', bg: '#FAEEDA', title: 'Entrepreneurship Track', desc: 'From idea to pitch. Best for kids who are creative and love building things.' },
  all:    { icon: '🗺️', color: '#0C7FC4', bg: '#EBF7FE', title: 'Full Curriculum',        desc: 'Start with Coding — the foundation for everything. Switch tracks any time with AI coach guidance.' },
}

const FAQS = [
  { q: 'What exactly is Plulai?',                     a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic.' },
  { q: 'Is the free plan really free — forever?',     a: 'Yes — genuinely free. No credit card, no 7-day trial, no expiry. The free plan covers the first module of each track. Pro unlocks all 500+ lessons and advanced AI coaching.' },
  { q: 'Is the Arabic real — or machine translated?', a: 'Real Arabic — not machine-translated. Full RTL interface and an AI coach that teaches natively in Arabic, with GCC-specific examples throughout.' },
  { q: 'How long are the lessons?',                   a: '15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.' },
  { q: 'Is it safe for my child?',                    a: "No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold." },
  { q: 'How is it different from Scratch or YouTube?', a: "Plulai has a personalised AI coach that adapts to your child. It covers AI and entrepreneurship alongside coding, works in Arabic, is designed for the GCC, and builds a real portfolio — not just a history of completed videos." },
]

const PARTNERS = [
  { name: 'Business Success',         logo: '/partners/bs.png'        },
  { name: 'LingoVille',               logo: '/partners/lingo.png'     },
  { name: 'The Intelligent Inventor', logo: '/partners/tie.png'       },
  { name: 'Les Élites Juniors',       logo: '/partners/elites.png'    },
  { name: 'La Coupole',               logo: '/partners/lacoupole.png' },
  { name: 'First Skills Club',        logo: '/partners/fsc.jpg'       },
  { name: 'Pinacle',                  logo: '/partners/pinacle.png'   },
  { name: 'Sfax International Fair',  logo: '/partners/foirsfax.png'  },
  { name: 'Growth Zone',              logo: '/partners/gz.png'        },
  { name: 'Scouts',                   logo: '/partners/scouts.jpeg'   },
]

// ─── Reusable helpers ─────────────────────────────────────────────────────────
function SectionEyebrow({ text }: { text: string }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94A3B8', marginBottom: '8px' }}>
      {text}
    </p>
  )
}

function SectionTitle({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 900, letterSpacing: '-.8px', lineHeight: 1.1, color: '#0A0A0F', marginBottom: '10px', textAlign: center ? 'center' : 'left' }}>
      {children}
    </h2>
  )
}

function SectionSub({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, marginBottom: '36px', textAlign: center ? 'center' : 'left' }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: '#E8EDF2', margin: '0 24px' }} />
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="#58CC02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Robot: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/>
      <path d="M8 15h.01M16 15h.01"/><path d="M7 11V9a5 5 0 0110 0v2"/>
    </svg>
  ),
  Code: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Brain: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/>
    </svg>
  ),
  Rocket: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  School: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Map: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Device: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
}

// ─── Track icons ──────────────────────────────────────────────────────────────
function CodingIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  )
}
function AIIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
    </svg>
  )
}
function BizIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"/><path d="M5 3.6L7.5 6"/><path d="M19 3.6L16.5 6"/>
      <path d="M3 12h2m14 0h2M12 22v-4"/><circle cx="12" cy="12" r="6"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #E8EDF2' }} className="last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left"
        style={{ padding: '17px 22px' }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0F' }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink: 0, color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7, padding: '0 22px 16px' }}>{a}</p>}
    </div>
  )
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function TrackQuiz() {
  const [step, setStep]         = useState(0)
  const [answers, setAnswers]   = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const currentQ = QUIZ_STEPS[step - 1]
  const result   = TRACK_RESULT[answers.interest ?? 'coding']

  function next() {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : QUIZ_STEPS.length + 1)
  }

  if (step === 0) return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1CB0F6', marginBottom: '8px' }}>3 questions · 60 seconds</p>
      <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0A0A0F', marginBottom: '8px' }}>Find your child&apos;s track</h3>
      <p style={{ fontSize: '14px', color: '#64748B', margin: '0 auto 24px', maxWidth: '260px' }}>Tell us their age and interests — we&apos;ll recommend exactly where to start.</p>
      <button onClick={() => setStep(1)} style={{ padding: '12px 28px', borderRadius: '10px', background: '#1CB0F6', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
        Start →
      </button>
    </div>
  )

  if (step === QUIZ_STEPS.length + 1) return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: '44px', marginBottom: '12px' }}>{result.icon}</div>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: result.color, marginBottom: '6px' }}>Recommended track</p>
      <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0A0A0F', marginBottom: '8px' }}>{result.title}</h3>
      <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.65, margin: '0 auto 24px', maxWidth: '260px' }}>{result.desc}</p>
      <Link href="/auth/signup" style={{ display: 'block', maxWidth: '260px', margin: '0 auto 10px', padding: '13px 0', borderRadius: '10px', background: '#1CB0F6', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
        Start {result.title} — Free →
      </Link>
      <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>No credit card · 60 seconds</p>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }} style={{ fontSize: '12px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Start over
      </button>
    </div>
  )

  const progress = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: '#E8EDF2', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#1CB0F6', borderRadius: '3px', transition: 'width .4s ease' }} />
        </div>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, flexShrink: 0 }}>{step} / {QUIZ_STEPS.length}</span>
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A0A0F', marginBottom: '16px' }}>{currentQ.question}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '16px' }}>
        {currentQ.options.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
            textAlign: 'left', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all .15s',
            border: selected === opt.value ? '2px solid #1CB0F6' : '1.5px solid #E8EDF2',
            background: selected === opt.value ? '#EBF7FE' : '#FFFFFF',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{opt.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A0A0F', lineHeight: 1.3 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{opt.sub}</div>}
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected} style={{
        width: '100%', padding: '13px', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
        border: 'none', cursor: selected ? 'pointer' : 'not-allowed', transition: 'all .15s',
        background: selected ? '#1CB0F6' : '#F1F5F9',
        color: selected ? '#fff' : '#94A3B8',
      }}>
        {step === QUIZ_STEPS.length ? 'See my recommendation →' : 'Next →'}
      </button>
    </div>
  )
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const fredokaFamily = fredoka.style.fontFamily
const globalStyles = `
  h1, h2, h3, h4 { font-family: ${fredokaFamily}, cursive !important; letter-spacing: -0.5px; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
`

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className={nunito.className} style={{ background: '#FFFFFF', color: '#0A0A0F' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '60px',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E8EDF2',
      }}>
        {/* Logo — bigger */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '11px', overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/icons/plulaiw.png" alt="Plulai" width={44} height={44} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </Link>

        <div className="hidden md:flex" style={{ gap: '2px' }}>
          {[['#tracks', 'Tracks'], ['#how-it-works', 'How it works'], ['#schools', 'For schools'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <a key={label} href={href}
              style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', padding: '6px 12px', borderRadius: '9px', textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0A0A0F' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          <Link href="/auth/login" className="hidden md:block"
            style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textDecoration: 'none', padding: '7px 12px', borderRadius: '9px', border: '1.5px solid #E8EDF2' }}>
            Log in
          </Link>
          <Link href="/auth/signup"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '9px', background: '#1CB0F6', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
            Start free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#1A1A2E', marginTop: '60px', padding: '72px 24px 0', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(28,176,246,0.12)', border: '1px solid rgba(28,176,246,0.25)', color: '#5DD3FA', fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '999px', marginBottom: '28px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1CB0F6', display: 'block', flexShrink: 0 }} />
          200+ learners &nbsp;·&nbsp; GCC
        </div>

        <h1 style={{ fontSize: 'clamp(38px,6vw,58px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-1.8px', color: '#fff', maxWidth: '620px', margin: '0 auto 18px' }}>
          Your child learns to{' '}
          <span style={{ color: '#1CB0F6' }}>code,<br />build AI,</span>{' '}
          and start a business.
        </h1>

        <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 36px' }}>
          A <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>personal AI coach</strong> that adapts to them.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>500+ lessons</strong> in Arabic & English.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>15 min a day.</strong>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {[
            { Icon: Icons.Robot,  text: 'Personal AI coach' },
            { Icon: Icons.Globe,  text: 'Arabic & English' },
            { Icon: Icons.Shield, text: 'No ads, ever' },
            { Icon: Icons.Device, text: 'Any device' },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '999px' }}>
              <span style={{ display: 'flex', opacity: 0.7 }}><Icon /></span>{text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '11px', paddingBottom: '52px' }}>
          <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, padding: '14px 32px', borderRadius: '14px', background: '#1CB0F6', color: '#fff', textDecoration: 'none', letterSpacing: '-.2px' }}>
              <Icons.ArrowRight /> Start for free
            </Link>
            <a href="#quiz" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 600, padding: '13px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>
              <Icons.Map /> Find my child&apos;s track
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '320px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>Running a school or academy?</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <a href="#schools" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '14px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
            <Icons.School /> Request a school demo
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,200,0,0.15)', color: '#FFC800', border: '1px solid rgba(255,200,0,0.2)' }}>For institutions</span>
          </a>
        </div>

        {/* Hero mockup */}
        <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '10%', bottom: '60px', background: '#fff', borderRadius: '12px', border: '1px solid #E8EDF2', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'float 3.2s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EAF7D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B6D11', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0A0A0F' }}>Lesson complete</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>+50 XP earned</div>
            </div>
          </div>

          <div style={{ width: '280px', height: '165px', background: '#0F1420', borderRadius: '14px 14px 0 0', border: '1.5px solid rgba(255,255,255,0.08)', borderBottom: 'none', overflow: 'hidden', animation: 'float 3s ease-in-out infinite' }}>
            <div style={{ height: '30px', background: '#161D2E', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '5px' }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ display: 'inline-block', background: 'rgba(88,204,2,0.15)', border: '1px solid rgba(88,204,2,0.3)', color: '#58CC02', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '999px', float: 'right' }}>Live</div>
              {[{ w: '65%', c: 'rgba(28,176,246,0.3)' }, { w: '45%', c: 'rgba(88,204,2,0.25)' }, { w: '80%', c: 'rgba(255,255,255,0.07)' }].map((l, i) => (
                <div key={i} style={{ height: '7px', borderRadius: '3px', background: l.c, width: l.w, marginBottom: '7px' }} />
              ))}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '7px 9px' }}>
                {[{ w: '55%', c: 'rgba(28,176,246,0.35)', ml: '0' }, { w: '38%', c: 'rgba(88,204,2,0.28)', ml: '10px' }, { w: '50%', c: 'rgba(255,200,0,0.22)', ml: '10px' }, { w: '32%', c: 'rgba(255,255,255,0.09)', ml: '0' }].map((l, i) => (
                  <div key={i} style={{ height: '5px', borderRadius: '2px', background: l.c, width: l.w, marginLeft: l.ml, marginBottom: i < 3 ? '5px' : 0 }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', right: '10%', bottom: '50px', background: '#fff', borderRadius: '12px', border: '1px solid #E8EDF2', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'float 2.8s .5s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BA7517', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0A0A0F' }}>7-day streak</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>Keep it up!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #E8EDF2' }}>
        {[{ n: '500+', l: 'Lessons' }, { n: '200+', l: 'Active learners' }, { n: '9.2/10', l: 'Parent rating' }, { n: '6', l: 'GCC countries' }].map((s, i) => (
          <div key={i} style={{ padding: '20px 16px', textAlign: 'center', background: '#fff', borderRight: i < 3 ? '1px solid #E8EDF2' : 'none' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1CB0F6', letterSpacing: '-.6px' }}>{s.n}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── What your child gets ── */}
      <section style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="What your child actually gets" />
        <SectionTitle>Not videos. Not worksheets.<br /><span style={{ color: '#1CB0F6' }}>Real projects, real skills.</span></SectionTitle>
        <SectionSub>Every lesson ends with something your child built. By end of month one, they have a project they can actually show off.</SectionSub>
        <div style={{ border: '1.5px solid #E8EDF2', borderRadius: '20px', overflow: 'hidden' }}>
          {[
            { Icon: Icons.Robot,  iconColor: '#1CB0F6', bg: '#EBF7FE', tag: 'Always on',      tagColor: '#0C7FC4', tagBg: '#EBF7FE', title: 'A personal AI coach',    desc: "Adapts to your child's level. Explains things a different way until it clicks. Never impatient — in Arabic or English." },
            { Icon: Icons.Code,   iconColor: '#1CB0F6', bg: '#EBF7FE', tag: 'Ages 8+',        tagColor: '#0C7FC4', tagBg: '#EBF7FE', title: 'Coding track',           desc: 'Python, web development, and game design. By week 2, your child writes their first working program from scratch.' },
            { Icon: Icons.Brain,  iconColor: '#3B6D11', bg: '#EAF7D4', tag: 'Ages 10+',       tagColor: '#27500A', tagBg: '#EAF7D4', title: 'AI track',               desc: 'Build with AI — not just use it. Your child creates actual machine learning projects, not just prompts chatbots.' },
            { Icon: Icons.Rocket, iconColor: '#854F0B', bg: '#FAEEDA', tag: 'Ages 11+',       tagColor: '#633806', tagBg: '#FAEEDA', title: 'Entrepreneurship track', desc: 'From first idea to investor pitch. Startup thinking designed for the GCC — not Silicon Valley.' },
            { Icon: Icons.Users,  iconColor: '#534AB7', bg: '#EEEDFE', tag: 'Weekly reports', tagColor: '#3C3489', tagBg: '#EEEDFE', title: 'Parent dashboard',      desc: "See exactly what your child learned, how long they practiced, and what they built — without having to ask them." },
          ].map((item, i, arr) => (
            <div key={i}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px 22px', borderBottom: i < arr.length - 1 ? '1px solid #E8EDF2' : 'none', background: '#fff', transition: 'background .15s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.iconColor }}>
                <item.Icon />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0A0A0F', margin: 0 }}>{item.title}</h4>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Tracks ── */}
      <section id="tracks" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="The three tracks" />
        <SectionTitle>Pick one. <span style={{ color: '#1CB0F6' }}>Switch anytime.</span></SectionTitle>
        <SectionSub>Most kids end up doing all three. Start wherever your child is most excited.</SectionSub>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { color: '#1CB0F6', textColor: '#0C7FC4', bg: '#EBF7FE', borderColor: 'rgba(28,176,246,0.25)', TrackIcon: CodingIcon, name: 'Coding',           label: 'Foundation track', outcome: 'Build a working app in 4 weeks',  desc: 'Python, web development, and game design — from zero to a real project in the browser.',          tags: ['Python', 'Web dev', 'Game design', 'Ages 8+'],    stat: { n: '180+', l: 'lessons' } },
            { color: '#3B6D11', textColor: '#27500A', bg: '#EAF7D4', borderColor: 'rgba(59,109,17,0.25)',  TrackIcon: AIIcon,     name: 'AI',               label: 'Innovation track',  outcome: 'Train your first ML model',       desc: 'Build with AI — not just use it. Your child creates actual machine learning projects from scratch.', tags: ['Machine learning', 'AI ethics', 'Real projects', 'Ages 10+'], stat: { n: '140+', l: 'lessons' } },
            { color: '#BA7517', textColor: '#633806', bg: '#FAEEDA', borderColor: 'rgba(186,117,23,0.25)', TrackIcon: BizIcon,    name: 'Entrepreneurship', label: 'Founder track',     outcome: 'Pitch a real business idea',      desc: 'From first idea to a full investor pitch and MVP. Startup thinking designed for the GCC.',          tags: ['Ideation', 'MVP', 'Pitch deck', 'Ages 11+'],      stat: { n: '120+', l: 'lessons' } },
          ].map(t => (
            <div key={t.name}
              style={{ border: `1.5px solid ${t.borderColor}`, borderRadius: '20px', overflow: 'hidden', background: '#fff', transition: 'all .2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ height: '3px', background: t.color }} />
              <div style={{ display: 'flex' }}>
                <div style={{ width: '88px', flexShrink: 0, background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 12px', gap: '12px', borderRight: `1px solid ${t.borderColor}` }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <t.TrackIcon color={t.color} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A0A0F', letterSpacing: '-.3px' }}>{t.name}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: t.textColor, marginTop: '2px' }}>{t.label}</div>
                  </div>
                </div>
                <div style={{ flex: 1, padding: '20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: t.bg, border: `1px solid ${t.borderColor}`, color: t.textColor, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', marginBottom: '10px' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4"/></svg>
                    {t.outcome}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '12px' }}>{t.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {t.tags.map(tag => <span key={tag} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '999px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E8EDF2' }}>{tag}</span>)}
                  </div>
                </div>
                <div style={{ width: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 12px', borderLeft: '1px solid #E8EDF2', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.5px', lineHeight: 1 }}>{t.stat.n}</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px', fontWeight: 600 }}>{t.stat.l}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="How it works" />
        <SectionTitle>From signup to <span style={{ color: '#1CB0F6' }}>first project.</span></SectionTitle>
        <SectionSub>No downloads. Works on any device. Start today.</SectionSub>
        <div>
          {[
            { n: '1', badge: '60 seconds',    title: 'Take the quick quiz',  desc: "Tell us your child's age and what excites them. We recommend the right track — no guessing." },
            { n: '2', badge: 'Day 1',          title: 'Meet their AI coach',  desc: 'A personal AI tutor starts in Arabic or English. Adapts to their level from minute one. Always patient.' },
            { n: '3', badge: 'End of month 1', title: 'Build something real', desc: '15–25 minutes per day. By the end of the first module, your child has a real project to show.' },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '22px 0', borderBottom: i < arr.length - 1 ? '1px solid #E8EDF2' : 'none' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1CB0F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>
                {s.n}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0A0A0F', margin: 0 }}>{s.title}</h4>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: '#EBF7FE', color: '#0C7FC4' }}>{s.badge}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '13px 28px', borderRadius: '12px', background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            Start step 1 — it&apos;s free →
          </Link>
        </div>
      </section>

      <Divider />

      {/* ── Quiz ── */}
      <section id="quiz" style={{ padding: '72px 24px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SectionEyebrow text="Personalised for your child" />
          <SectionTitle center>Not sure where to start?</SectionTitle>
          <SectionSub center>3 questions and we&apos;ll tell you exactly which track to begin with.</SectionSub>
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #E8EDF2', borderRadius: '20px', padding: '28px' }}>
          <TrackQuiz />
        </div>
      </section>

      <Divider />

      {/* ── Schools ── */}
      <section id="schools" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="For schools & institutions" />
        <SectionTitle>Bring Plulai into <span style={{ color: '#1CB0F6' }}>your classrooms.</span></SectionTitle>
        <SectionSub>Curriculum-aligned. Teacher dashboards. Arabic-native. Aligned with GCC Vision 2031.</SectionSub>
        <div style={{ border: '1.5px solid #E8EDF2', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ background: '#1A1A2E', padding: '22px 26px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(28,176,246,0.15)', border: '1px solid rgba(28,176,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1CB0F6' }}>
              <Icons.School />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Institutional plan</p>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>Schools, academies & training centres</h3>
            </div>
          </div>
          <div style={{ padding: '24px 26px', background: '#fff' }}>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, marginBottom: '20px' }}>
              Drop Plulai into your existing schedule as a weekly enrichment class or a full-year elective. We handle localisation, teacher training, parent communication, and progress reporting — you focus on the outcomes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
              {[{ n: '10+', l: 'Partner schools' }, { n: '6', l: 'GCC countries' }, { n: '9.2', l: 'Satisfaction score' }].map(m => (
                <div key={m.l} style={{ background: '#F8FAFC', border: '1px solid #E8EDF2', borderRadius: '10px', padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.4px' }}>{m.n}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '9px' }}>
              <a href="mailto:ceo@plulai.com" style={{ flex: 1, padding: '12px 0', borderRadius: '10px', background: '#1CB0F6', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'block' }}>Book a 20-min demo</a>
              <a href="mailto:hello@plulai.com" style={{ padding: '12px 16px', borderRadius: '10px', background: 'transparent', color: '#64748B', fontSize: '13px', fontWeight: 600, border: '1.5px solid #E8EDF2', textDecoration: 'none', display: 'block' }}>Download curriculum guide</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GCC ── */}
      <section style={{ padding: '0 24px 72px', maxWidth: '660px', margin: '0 auto', textAlign: 'center' }}>
        <SectionEyebrow text="Available across the GCC" />
        <SectionTitle center>Real Arabic. <span style={{ color: '#1CB0F6' }}>Real GCC context.</span></SectionTitle>
        <SectionSub center>Not translated from English. Every lesson, every example, every business idea is set in the GCC.</SectionSub>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
          {[{ flag: '🇦🇪', name: 'UAE' }, { flag: '🇸🇦', name: 'Saudi Arabia' }, { flag: '🇶🇦', name: 'Qatar' }, { flag: '🇰🇼', name: 'Kuwait' }, { flag: '🇧🇭', name: 'Bahrain' }, { flag: '🇴🇲', name: 'Oman' }].map(c => (
            <div key={c.name}
              style={{ border: '1.5px solid #E8EDF2', borderRadius: '14px', padding: '14px 8px', background: '#fff', textAlign: 'center', transition: 'all .2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1CB0F6'; e.currentTarget.style.background = '#EBF7FE' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EDF2'; e.currentTarget.style.background = '#fff' }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>{c.flag}</div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="Pricing" />
        <SectionTitle>Start free. <span style={{ color: '#1CB0F6' }}>No tricks.</span></SectionTitle>
        <SectionSub>The free plan never expires, needs no credit card, and doesn&apos;t lock you out after 7 days.</SectionSub>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ border: '2px solid #1CB0F6', borderRadius: '20px', padding: '24px 22px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.5px', marginBottom: '2px' }}>Free</div>
                <div style={{ fontSize: '30px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.7px', lineHeight: 1 }}>
                  AED 0<span style={{ fontSize: '14px', fontWeight: 400, color: '#94A3B8', letterSpacing: 0 }}> /mo</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: '#EBF7FE', color: '#0C7FC4' }}>Most popular</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '18px' }}>Forever free. No card needed.</p>
            <div style={{ height: '1px', background: '#E8EDF2', marginBottom: '18px' }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
              {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  <CheckIcon />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" style={{ display: 'block', padding: '12px', borderRadius: '10px', background: '#1CB0F6', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
              Create free account
            </Link>
          </div>
          <div style={{ border: '1.5px solid #E8EDF2', borderRadius: '20px', padding: '24px 22px', background: '#fff' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.5px', marginBottom: '2px' }}>Pro</div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.7px', lineHeight: 1, marginBottom: '4px' }}>
              $79<span style={{ fontSize: '14px', fontWeight: 400, color: '#94A3B8', letterSpacing: 0 }}> /mo</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '18px' }}>Everything in Free, plus:</p>
            <div style={{ height: '1px', background: '#E8EDF2', marginBottom: '18px' }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
              {['All 500+ lessons', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Completion certificate', 'Priority support'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  <CheckIcon />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?plan=pro" style={{ display: 'block', padding: '11px', borderRadius: '10px', background: 'transparent', color: '#64748B', fontSize: '14px', fontWeight: 600, border: '1.5px solid #E8EDF2', textDecoration: 'none', textAlign: 'center' }}>
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Rating ── */}
      <section style={{ padding: '0 24px 72px', maxWidth: '540px', margin: '0 auto' }}>
        <div style={{ background: '#1A1A2E', borderRadius: '20px', padding: '40px 28px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="22" height="22" viewBox="0 0 20 20" fill="#FFC800">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
            9.2<span style={{ fontSize: '24px', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/10</span>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Average rating from parents across the GCC</p>
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', marginTop: '16px', maxWidth: '300px', margin: '16px auto 0', lineHeight: 1.6 }}>
            &ldquo;My daughter finished her first Python project in 3 weeks. She was so proud — I was speechless.&rdquo;
          </p>
        </div>
      </section>

      <Divider />

      {/* ── Partners ── */}
      <section style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="Partners" />
        <SectionTitle>Trusted by institutions <span style={{ color: '#1CB0F6' }}>across the GCC.</span></SectionTitle>
        <SectionSub>Schools and organisations already working with Plulai.</SectionSub>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {PARTNERS.map(p => (
            <div key={p.name}
              style={{ border: '1.5px solid #E8EDF2', borderRadius: '16px', padding: '20px 12px 16px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all .2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1CB0F6'; e.currentTarget.style.background = '#FAFEFF' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EDF2'; e.currentTarget.style.background = '#fff' }}>
              <div style={{ width: '56px', height: '56px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image src={p.logo} alt={p.name} width={56} height={56} style={{ objectFit: 'contain', maxWidth: '56px', maxHeight: '56px' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, lineHeight: 1.35 }}>{p.name}</div>
            </div>
          ))}
          <a href="mailto:ceo@plulai.com"
            style={{ border: '1.5px dashed #B5D4F4', borderRadius: '16px', padding: '20px 12px 16px', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', textDecoration: 'none', transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EBF7FE')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ width: '56px', height: '56px', marginBottom: '10px', background: '#EBF7FE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1CB0F6' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div style={{ fontSize: '11px', color: '#378ADD', fontWeight: 600, lineHeight: 1.35 }}>Become a partner</div>
          </a>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <SectionEyebrow text="FAQ" />
        <SectionTitle>Everything parents ask <span style={{ color: '#1CB0F6' }}>before signing up.</span></SectionTitle>
        <div style={{ marginTop: '8px', border: '1.5px solid #E8EDF2', borderRadius: '20px', overflow: 'hidden', background: '#fff' }}>
          {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: '660px', margin: '0 auto' }}>
        <div style={{ background: '#1A1A2E', borderRadius: '28px', padding: '56px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(28,176,246,0.07)', borderRadius: '50%', top: '-200px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(88,204,2,0.12)', border: '1px solid rgba(88,204,2,0.2)', color: '#58CC02', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '999px', marginBottom: '20px' }}>
              ✓ 200+ learners already started
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: '10px', lineHeight: 1.08 }}>
              Your child can<br />start today.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '28px' }}>
              Free forever. No credit card. Arabic and English.<br />Ages 6–18 across the GCC.
            </p>
            <div style={{ display: 'flex', gap: '9px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '14px 30px', borderRadius: '12px', background: '#1CB0F6', color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
                Create a free account →
              </Link>
              <a href="mailto:ceo@plulai.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '13px 22px', borderRadius: '12px', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>
                Book a school demo
              </a>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '18px' }}>
              Trusted by families across UAE · Saudi Arabia · Qatar · Kuwait · Bahrain · Oman
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #E8EDF2', padding: '48px 24px 28px', background: '#fff' }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src="/icons/plulaiw.png" alt="Plulai" width={40} height={40} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-.4px', color: '#0A0A0F', fontFamily: `${fredoka.style.fontFamily}, cursive` }}>Plulai</span> */}
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', maxWidth: '180px', lineHeight: 1.6 }}>
                AI learning for kids in the GCC — coding, AI & entrepreneurship in Arabic and English.
              </p>
            </div>

            {/* Footer columns */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                {
                  title: 'Platform',
                  links: [
                    ['#tracks',       'Tracks'],
                    ['#how-it-works', 'How it works'],
                    ['#pricing',      'Pricing'],
                    ['#quiz',         'Find a track'],
                    ['/auth/signup',  'Sign up free'],
                  ],
                },
                {
                  title: 'Institutions',
                  links: [
                    ['#schools',              'For schools'],
                    ['mailto:ceo@plulai.com', 'Request demo'],
                    ['mailto:ceo@plulai.com', 'Curriculum guide'],
                    ['mailto:ceo@plulai.com', 'Become a partner'],
                  ],
                },
                {
                  title: 'Contact',
                  links: [
                    ['mailto:hello@plulai.com', 'hello@plulai.com'],
                    ['mailto:ceo@plulai.com',   'ceo@plulai.com'],
                  ],
                },
              ].map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#94A3B8', marginBottom: '12px' }}>{col.title}</h4>
                  {col.links.map(([href, label]) => (
                    <a key={label} href={href}
                      style={{ display: 'block', fontSize: '12px', color: '#64748B', textDecoration: 'none', marginBottom: '7px', transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0F')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                      {label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #E8EDF2', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>© {new Date().getFullYear()} Plulai. The AI learning platform for kids in the GCC.</p>
            <a href="mailto:hello@plulai.com" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>hello@plulai.com</a>
          </div>
        </div>
      </footer>

    </div>
  )
}