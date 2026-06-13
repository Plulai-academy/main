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
type TrackResult = { icon: string; color: string; bg: string; border: string; title: string; desc: string }

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  blue:   '#1CB0F6',
  cyan:   '#14D4F4',
  deep:   '#2B70C9',
  gold:   '#FAA918',
  red:    '#D33131',
  bg:     '#F5F5F5',
  text:   '#3C3C3C',
  muted:  '#6F6F6F',
  white:  '#FFFFFF',
  dark:   '#1A1A2E',
  // border shadows (Duolingo "shelf" effect)
  blueShadow: '#1899D6',
  goldShadow: '#D98E00',
  redShadow:  '#A82020',
  greenShadow:'#58A700',
  green:  '#58CC02',
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
  coding: { icon: '💻', color: C.blue,  bg: '#E5F6FD', border: C.blueShadow, title: 'Coding Track',           desc: 'Start with Python. By end of module 1, your child will have a working program they built themselves.' },
  ai:     { icon: '🧠', color: C.green, bg: '#EDFFD4', border: C.greenShadow,title: 'AI Track',               desc: 'Start with how AI works, then build a machine learning project. Best for curious problem-solvers.' },
  bizz:   { icon: '💡', color: C.gold,  bg: '#FFF4DC', border: C.goldShadow, title: 'Entrepreneurship Track', desc: 'From idea to pitch. Best for kids who are creative and love building things.' },
  all:    { icon: '🗺️', color: C.blue,  bg: '#E5F6FD', border: C.blueShadow, title: 'Full Curriculum',        desc: 'Start with Coding — the foundation for everything. Switch tracks any time with AI coach guidance.' },
}

const FAQS = [
  { q: 'What exactly is Plulai?',                     a: 'Plulai is an AI-powered learning platform for kids aged 6–18 in the GCC. Children learn coding, AI, and entrepreneurship through a personal AI coach, 500+ lessons, and real projects — in English and Arabic.' },
  { q: 'What happens after the 14-day trial?',        a: 'After your 14-day free trial you can choose to subscribe to Pro or continue with limited access. No credit card is required to start — just sign up and explore.' },
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

// ─── Duolingo-style "shelf" button ────────────────────────────────────────────
function ShelfButton({
  href, children, bg, shadow, color = '#fff', fontSize = '15px', fullWidth = false, style = {}, onClick,
}: {
  href?: string; children: React.ReactNode; bg: string; shadow: string; color?: string;
  fontSize?: string; fullWidth?: boolean; style?: React.CSSProperties; onClick?: () => void
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '14px 28px', borderRadius: '14px',
    background: bg, color, fontSize, fontWeight: 800,
    border: `2px solid ${shadow}`,
    boxShadow: `0 4px 0 ${shadow}`,
    textDecoration: 'none', cursor: 'pointer',
    transition: 'all .1s ease',
    width: fullWidth ? '100%' : undefined,
    ...style,
  }
  const handleDown = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.boxShadow = `0 2px 0 ${shadow}`
    e.currentTarget.style.transform = 'translateY(2px)'
  }
  const handleUp = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.boxShadow = `0 4px 0 ${shadow}`
    e.currentTarget.style.transform = 'none'
  }
  if (href) return (
    <Link href={href} style={base} onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp}>
      {children}
    </Link>
  )
  return (
    <button onClick={onClick} style={{ ...base, border: `2px solid ${shadow}` }} onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp}>
      {children}
    </button>
  )
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────
function XPBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: C.muted, marginBottom: '4px' }}>
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div style={{ height: '12px', borderRadius: '999px', background: '#E5E5E5', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

// ─── Duolingo-style card ──────────────────────────────────────────────────────
function ShelfCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white, borderRadius: '20px',
      border: `2px solid #E5E5E5`,
      boxShadow: `0 4px 0 #C9C9C9`,
      padding: '24px', ...style
    }}>
      {children}
    </div>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `2px solid #E5E5E5` }} className="last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left"
        style={{ padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: C.text, fontFamily: 'inherit' }}>{q}</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
          style={{ flexShrink: 0, color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.7, padding: '0 24px 18px' }}>{a}</p>}
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
      <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎯</div>
      <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '6px' }}>3 questions · 60 seconds</p>
      <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.text, marginBottom: '8px' }}>Find your child&apos;s track</h3>
      <p style={{ fontSize: '14px', color: C.muted, margin: '0 auto 24px', maxWidth: '260px', lineHeight: 1.6 }}>Tell us their age and interests — we&apos;ll recommend exactly where to start.</p>
      <ShelfButton bg={C.blue} shadow={C.blueShadow} onClick={() => setStep(1)}>
        Start the quiz →
      </ShelfButton>
    </div>
  )

  if (step === QUIZ_STEPS.length + 1) return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: '52px', marginBottom: '12px' }}>{result.icon}</div>
      <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: result.color, marginBottom: '6px' }}>Recommended track</p>
      <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.text, marginBottom: '8px' }}>{result.title}</h3>
      <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.65, margin: '0 auto 24px', maxWidth: '260px' }}>{result.desc}</p>
      <ShelfButton href="/auth/signup" bg={C.blue} shadow={C.blueShadow} fullWidth>
        Start {result.title} — Free →
      </ShelfButton>
      <p style={{ fontSize: '12px', color: C.muted, margin: '12px 0 10px' }}>No credit card · 60 seconds to sign up</p>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }} style={{ fontSize: '12px', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
        Start over
      </button>
    </div>
  )

  const progress = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '14px', borderRadius: '999px', background: '#E5E5E5', overflow: 'hidden', border: '2px solid #D0D0D0' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.blue, borderRadius: '999px', transition: 'width .4s ease' }} />
        </div>
        <span style={{ fontSize: '12px', color: C.muted, fontWeight: 800, flexShrink: 0 }}>{step}/{QUIZ_STEPS.length}</span>
      </div>
      <h3 style={{ fontSize: '19px', fontWeight: 800, color: C.text, marginBottom: '16px' }}>{currentQ.question}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {currentQ.options.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
            textAlign: 'left', padding: '14px', borderRadius: '14px', cursor: 'pointer',
            border: selected === opt.value ? `2px solid ${C.blue}` : '2px solid #E5E5E5',
            boxShadow: selected === opt.value ? `0 4px 0 ${C.blueShadow}` : '0 4px 0 #C9C9C9',
            background: selected === opt.value ? '#E5F6FD' : C.white,
            transition: 'all .1s', fontFamily: 'inherit',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px', fontWeight: 600 }}>{opt.sub}</div>}
          </button>
        ))}
      </div>
      <ShelfButton
        bg={selected ? C.blue : '#E5E5E5'}
        shadow={selected ? C.blueShadow : '#C9C9C9'}
        color={selected ? '#fff' : C.muted}
        fullWidth
        onClick={next}
        style={{ opacity: selected ? 1 : 0.7 }}
      >
        {step === QUIZ_STEPS.length ? 'See my recommendation →' : 'Next →'}
      </ShelfButton>
    </div>
  )
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const fredokaFamily = fredoka.style.fontFamily
const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  h1, h2, h3, h4, .fredoka { font-family: ${fredokaFamily}, cursive !important; letter-spacing: -0.3px; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.05)} 100%{transform:scale(1)} }
  .shelf-hover:hover { transform: translateY(-3px) !important; transition: all .2s !important; }
`

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className={nunito.className} style={{ background: C.bg, color: C.text }}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '64px',
        background: C.white,
        borderBottom: `3px solid ${C.bg}`,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/icons/plulaiw.png" alt="Plulai" width={40} height={40} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: C.text, fontFamily: `${fredokaFamily}, cursive` }}>Plulai</span>
        </Link>

        <div className="hidden md:flex" style={{ gap: '4px' }}>
          {[['#tracks', 'Tracks'], ['#how-it-works', 'How it works'], ['#schools', 'For Schools'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <a key={label} href={href}
              style={{ fontSize: '14px', fontWeight: 700, color: C.muted, padding: '7px 14px', borderRadius: '10px', textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted }}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/auth/login" className="hidden md:block"
            style={{ fontSize: '14px', fontWeight: 800, color: C.blue, textDecoration: 'none', padding: '8px 16px', borderRadius: '10px', border: `2px solid ${C.blue}` }}>
            Log in
          </Link>
          <ShelfButton href="/auth/signup" bg={C.blue} shadow={C.blueShadow} fontSize="14px" style={{ padding: '10px 20px' }}>
            Start free →
          </ShelfButton>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: C.dark, marginTop: '64px', padding: '72px 24px 0', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>

        {/* Floating pill badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(28,176,246,0.15)', border: `2px solid rgba(28,176,246,0.3)`, color: '#5DD3FA', fontSize: '12px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '999px', marginBottom: '28px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.blue, display: 'block', flexShrink: 0 }} />
          200+ learners &nbsp;·&nbsp; GCC
        </div>

        <h1 style={{ fontSize: 'clamp(38px,6vw,62px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-1px', color: '#fff', maxWidth: '640px', margin: '0 auto 16px', fontFamily: `${fredokaFamily}, cursive` }}>
          Your child learns to{' '}
          <span style={{ color: C.blue }}>code, build AI,</span>{' '}
          and start a business.
        </h1>

        <p style={{ fontSize: '17px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 36px' }}>
          A <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>personal AI coach</strong> that adapts to them.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>500+ lessons</strong> in Arabic & English.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>15 min a day.</strong>
        </p>

        {/* Duo-style feature pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {[
            { icon: '🤖', text: 'AI coach' },
            { icon: '🌍', text: 'Arabic & English' },
            { icon: '🚫', text: 'No ads, ever' },
            { icon: '📱', text: 'Any device' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.12)', padding: '7px 14px', borderRadius: '999px' }}>
              <span>{icon}</span>{text}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingBottom: '52px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <ShelfButton href="/auth/signup" bg={C.blue} shadow={C.blueShadow} fontSize="16px" style={{ padding: '16px 36px' }}>
              🚀 Start for free
            </ShelfButton>
            <a href="#quiz" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '15px', fontWeight: 800, padding: '15px 24px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
              textDecoration: 'none',
            }}>
              🗺️ Find my child&apos;s track
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '340px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', fontWeight: 700 }}>Running a school or academy?</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <a href="#schools" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', fontWeight: 800, padding: '11px 22px', borderRadius: '14px',
            background: 'transparent', color: 'rgba(255,255,255,0.55)',
            border: '2px solid rgba(255,255,255,0.12)',
            textDecoration: 'none',
          }}>
            🏫 Request a school demo
            <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', background: 'rgba(250,169,24,0.2)', color: C.gold, border: `1px solid rgba(250,169,24,0.3)` }}>For institutions</span>
          </a>
        </div>

        {/* Gamified UI mockup */}
        <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' }}>
          {/* Left float: lesson complete */}
          <div style={{
            position: 'absolute', left: '8%', bottom: '70px',
            background: C.white, borderRadius: '14px',
            border: `2px solid #E5E5E5`, boxShadow: `0 4px 0 #C9C9C9`,
            padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'float 3.2s ease-in-out infinite',
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EDFFD4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>✅</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: C.text }}>Lesson complete!</div>
              <div style={{ fontSize: '10px', color: C.muted, fontWeight: 700 }}>+50 XP earned 🎉</div>
            </div>
          </div>

          {/* Center mockup */}
          <div style={{
            width: '290px', height: '172px',
            background: '#0F1420', borderRadius: '16px 16px 0 0',
            border: '2px solid rgba(255,255,255,0.1)', borderBottom: 'none',
            overflow: 'hidden', animation: 'float 3s ease-in-out infinite',
          }}>
            <div style={{ height: '32px', background: '#161D2E', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '5px' }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(88,204,2,0.2)', color: '#58CC02', padding: '2px 8px', borderRadius: '999px' }}>🔴 Live</div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <XPBar label="Python basics" pct={72} color={C.blue} />
              <XPBar label="Day streak" pct={45} color={C.gold} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                {['🔥', '⭐', '💎'].map((e, i) => (
                  <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', textAlign: 'center', fontSize: '14px' }}>{e}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right float: streak */}
          <div style={{
            position: 'absolute', right: '8%', bottom: '55px',
            background: C.white, borderRadius: '14px',
            border: `2px solid #E5E5E5`, boxShadow: `0 4px 0 #C9C9C9`,
            padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'float 2.8s .5s ease-in-out infinite',
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FFF4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🔥</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: C.text }}>7-day streak</div>
              <div style={{ fontSize: '10px', color: C.muted, fontWeight: 700 }}>Keep it up!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: C.white, borderBottom: `3px solid ${C.bg}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', maxWidth: '660px', margin: '0 auto' }}>
          {[{ n: '500+', l: 'Lessons', icon: '📚' }, { n: '200+', l: 'Active learners', icon: '👦' }, { n: '9.2/10', l: 'Parent rating', icon: '⭐' }, { n: '6', l: 'GCC countries', icon: '🌍' }].map((s, i) => (
            <div key={i} style={{ padding: '20px 12px', textAlign: 'center', borderRight: i < 3 ? `2px solid ${C.bg}` : 'none' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: C.blue, letterSpacing: '-.5px', fontFamily: `${fredokaFamily}, cursive` }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: C.muted, fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What your child gets ── */}
      <section style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>What your child actually gets</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', lineHeight: 1.15, fontFamily: `${fredokaFamily}, cursive` }}>
          Not videos. Not worksheets.<br /><span style={{ color: C.blue }}>Real projects, real skills.</span>
        </h2>
        <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '36px' }}>Every lesson ends with something your child built. By end of month one, they have a project they can actually show off.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🤖', iconBg: '#E5F6FD', tag: 'Always on',      tagColor: C.blue,  tagBg: '#E5F6FD',  title: 'A personal AI coach',    desc: "Adapts to your child's level. Explains things a different way until it clicks. Never impatient — in Arabic or English." },
            { icon: '💻', iconBg: '#E5F6FD', tag: 'Ages 8+',        tagColor: C.deep,  tagBg: '#DCF0FF',  title: 'Coding track',           desc: 'Python, web development, and game design. By week 2, your child writes their first working program from scratch.' },
            { icon: '🧠', iconBg: '#EDFFD4', tag: 'Ages 10+',       tagColor: '#3A7D00', tagBg: '#EDFFD4', title: 'AI track',               desc: 'Build with AI — not just use it. Your child creates actual machine learning projects, not just prompts chatbots.' },
            { icon: '💡', iconBg: '#FFF4DC', tag: 'Ages 11+',       tagColor: '#A06A00', tagBg: '#FFF4DC', title: 'Entrepreneurship track', desc: 'From first idea to investor pitch. Startup thinking designed for the GCC — not Silicon Valley.' },
            { icon: '📊', iconBg: '#F0EDFF', tag: 'Weekly reports', tagColor: '#5C4DB5', tagBg: '#F0EDFF', title: 'Parent dashboard',      desc: "See exactly what your child learned, how long they practiced, and what they built — without having to ask them." },
          ].map((item, i) => (
            <div key={i} className="shelf-hover" style={{
              display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 22px',
              background: C.white, borderRadius: '18px',
              border: '2px solid #E5E5E5', boxShadow: '0 4px 0 #D0D0D0',
              cursor: 'default',
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: C.text, margin: 0 }}>{item.title}</h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
                </div>
                <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" style={{ padding: '72px 24px', background: C.white }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>The three tracks</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', fontFamily: `${fredokaFamily}, cursive` }}>
            Pick one. <span style={{ color: C.blue }}>Switch anytime.</span>
          </h2>
          <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '36px' }}>Most kids end up doing all three. Start wherever your child is most excited.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { color: C.blue,  shadow: C.blueShadow,  bg: '#E5F6FD',  icon: '💻', name: 'Coding',           label: 'Foundation track', outcome: 'Build a working app in 4 weeks',  desc: 'Python, web development, and game design — from zero to a real project in the browser.',          tags: ['Python', 'Web dev', 'Game design', 'Ages 8+'],    stat: { n: '180+', l: 'lessons' } },
              { color: C.green, shadow: C.greenShadow, bg: '#EDFFD4',  icon: '🧠', name: 'AI',               label: 'Innovation track',  outcome: 'Train your first ML model',       desc: 'Build with AI — not just use it. Your child creates actual machine learning projects from scratch.', tags: ['Machine learning', 'AI ethics', 'Real projects', 'Ages 10+'], stat: { n: '140+', l: 'lessons' } },
              { color: C.gold,  shadow: C.goldShadow,  bg: '#FFF4DC',  icon: '💡', name: 'Entrepreneurship', label: 'Founder track',     outcome: 'Pitch a real business idea',      desc: 'From first idea to a full investor pitch and MVP. Startup thinking designed for the GCC.',          tags: ['Ideation', 'MVP', 'Pitch deck', 'Ages 11+'],      stat: { n: '120+', l: 'lessons' } },
            ].map(t => (
              <div key={t.name} className="shelf-hover" style={{
                borderRadius: '20px', overflow: 'hidden', background: C.white,
                border: `2px solid ${t.color}33`,
                boxShadow: `0 6px 0 ${t.shadow}44`,
                cursor: 'default',
              }}>
                <div style={{ height: '5px', background: t.color }} />
                <div style={{ display: 'flex' }}>
                  {/* Left icon */}
                  <div style={{ width: '96px', flexShrink: 0, background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 12px', gap: '10px', borderRight: `2px solid ${t.color}22` }}>
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${t.shadow}44`, border: `2px solid ${t.color}33`, fontSize: '26px' }}>
                      {t.icon}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: C.text }}>{t.name}</div>
                      <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: t.color, marginTop: '2px' }}>{t.label}</div>
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ flex: 1, padding: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: t.bg, border: `2px solid ${t.color}33`, color: t.color, fontSize: '11px', fontWeight: 800, padding: '4px 11px', borderRadius: '999px', marginBottom: '10px' }}>
                      🎯 {t.outcome}
                    </div>
                    <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6, marginBottom: '12px' }}>{t.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {t.tags.map(tag => <span key={tag} style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: C.bg, color: C.muted, border: `2px solid #E5E5E5` }}>{tag}</span>)}
                    </div>
                  </div>
                  {/* Stat */}
                  <div style={{ width: '76px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 10px', borderLeft: `2px solid #E5E5E5`, textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: t.color, letterSpacing: '-.5px', lineHeight: 1, fontFamily: `${fredokaFamily}, cursive` }}>{t.stat.n}</div>
                    <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px', fontWeight: 700 }}>{t.stat.l}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>How it works</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', fontFamily: `${fredokaFamily}, cursive` }}>
          From signup to <span style={{ color: C.blue }}>first project.</span>
        </h2>
        <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '36px' }}>No downloads. Works on any device. Start today.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { n: '1', emoji: '🎯', badge: '60 seconds',    badgeColor: C.blue,  badgeBg: '#E5F6FD', title: 'Take the quick quiz',  desc: "Tell us your child's age and what excites them. We recommend the right track — no guessing." },
            { n: '2', emoji: '🤖', badge: 'Day 1',          badgeColor: C.green, badgeBg: '#EDFFD4', title: 'Meet their AI coach',  desc: 'A personal AI tutor starts in Arabic or English. Adapts to their level from minute one. Always patient.' },
            { n: '3', emoji: '🚀', badge: 'End of month 1', badgeColor: C.gold,  badgeBg: '#FFF4DC', title: 'Build something real', desc: '15–25 minutes per day. By the end of the first module, your child has a real project to show.' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: '18px', padding: '22px',
              background: C.white, borderRadius: '18px',
              border: '2px solid #E5E5E5', boxShadow: '0 4px 0 #D0D0D0',
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, flexShrink: 0, fontFamily: `${fredokaFamily}, cursive`, boxShadow: `0 4px 0 ${C.blueShadow}` }}>
                {s.n}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: C.text, margin: 0 }}>{s.emoji} {s.title}</h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
                </div>
                <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <ShelfButton href="/auth/signup" bg={C.blue} shadow={C.blueShadow} fontSize="15px">
            🚀 Start step 1 — it&apos;s free →
          </ShelfButton>
        </div>
      </section>

      {/* ── Quiz ── */}
      <section id="quiz" style={{ padding: '72px 24px', background: C.white }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>Personalised for your child</p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', textAlign: 'center', fontFamily: `${fredokaFamily}, cursive` }}>Not sure where to start?</h2>
            <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, textAlign: 'center' }}>3 questions and we&apos;ll tell you exactly which track to begin with.</p>
          </div>
          <ShelfCard style={{ padding: '32px' }}>
            <TrackQuiz />
          </ShelfCard>
        </div>
      </section>

      {/* ── Schools / B2B ── */}
      <section id="schools" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.gold, marginBottom: '8px' }}>For schools &amp; institutions</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', fontFamily: `${fredokaFamily}, cursive` }}>
          Bring Plulai into <span style={{ color: C.blue }}>your classrooms.</span>
        </h2>
        <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '36px' }}>Curriculum-aligned. Teacher dashboards. Arabic-native. Aligned with GCC Vision 2031.</p>

        {/* B2B feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { icon: '📋', title: 'Curriculum-aligned', desc: 'Fits into existing school schedules as weekly enrichment or a full-year elective.' },
            { icon: '👩‍🏫', title: 'Teacher dashboard', desc: 'See every student\'s progress, lesson completion, and projects in real time.' },
            { icon: '🌐', title: 'Arabic-native', desc: 'Not translated. Full RTL with GCC-specific examples and an Arabic AI coach.' },
            { icon: '📈', title: 'Vision 2031 aligned', desc: 'Designed around digital skills priorities for the GCC national curricula.' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: '20px', background: C.white, borderRadius: '18px',
              border: '2px solid #E5E5E5', boxShadow: '0 4px 0 #D0D0D0',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: C.text, marginBottom: '5px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: C.muted, lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Dark B2B CTA block */}
        <div style={{ background: C.dark, borderRadius: '24px', padding: '32px 28px', border: `3px solid ${C.blue}33`, boxShadow: `0 6px 0 rgba(20,40,80,0.5)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `rgba(28,176,246,0.15)`, border: `2px solid rgba(28,176,246,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
              🏫
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Institutional plan</p>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>Schools, academies &amp; training centres</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '22px' }}>
            {[{ n: '10+', l: 'Partner schools', icon: '🏫' }, { n: '6', l: 'GCC countries', icon: '🌍' }, { n: '9.2', l: 'Satisfaction', icon: '⭐' }].map(m => (
              <div key={m.l} style={{ background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>{m.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', fontFamily: `${fredokaFamily}, cursive` }}>{m.n}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px', fontWeight: 700 }}>{m.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href="mailto:ceo@plulai.com" style={{
              flex: 1, padding: '13px 0', borderRadius: '12px',
              background: C.blue, color: '#fff', fontSize: '14px', fontWeight: 800,
              textDecoration: 'none', textAlign: 'center', display: 'block',
              border: `2px solid ${C.blueShadow}`, boxShadow: `0 4px 0 ${C.blueShadow}`,
            }}>📅 Book a 20-min demo</a>
            <a href="mailto:hello@plulai.com" style={{
              padding: '13px 18px', borderRadius: '12px',
              background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 700,
              border: '2px solid rgba(255,255,255,0.15)', textDecoration: 'none', display: 'block',
            }}>📄 Curriculum guide</a>
          </div>
        </div>
      </section>

      {/* ── GCC ── */}
      <section style={{ padding: '0 24px 72px', maxWidth: '660px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px', textAlign: 'center' }}>Available across the GCC</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', fontFamily: `${fredokaFamily}, cursive`, textAlign: 'center' }}>
          Real Arabic. <span style={{ color: C.blue }}>Real GCC context.</span>
        </h2>
        <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '32px', textAlign: 'center' }}>Not translated from English. Every lesson, every example, every business idea is set in the GCC.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px' }}>
          {[{ flag: '🇦🇪', name: 'UAE' }, { flag: '🇸🇦', name: 'Saudi' }, { flag: '🇶🇦', name: 'Qatar' }, { flag: '🇰🇼', name: 'Kuwait' }, { flag: '🇧🇭', name: 'Bahrain' }, { flag: '🇴🇲', name: 'Oman' }].map(c => (
            <div key={c.name} className="shelf-hover" style={{
              border: '2px solid #E5E5E5', borderRadius: '16px', padding: '16px 8px',
              background: C.white, textAlign: 'center', cursor: 'default',
              boxShadow: '0 4px 0 #D0D0D0',
            }}>
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{c.flag}</div>
              <div style={{ fontSize: '11px', color: C.muted, fontWeight: 700 }}>{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '72px 24px', background: C.white }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', fontFamily: `${fredokaFamily}, cursive` }}>
            Try free for 14 days. <span style={{ color: C.blue }}>No card needed.</span>
          </h2>
          <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '36px' }}>Start your 14-day trial today — no credit card required. After the trial, choose Pro to keep going or explore the free tier.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Free */}
            <div style={{
              border: `3px solid ${C.blue}`,
              borderRadius: '22px', padding: '26px 22px', background: C.white,
              boxShadow: `0 6px 0 ${C.blueShadow}`,
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: C.blue, color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 14px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                ⭐ Most popular
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: C.text, fontFamily: `${fredokaFamily}, cursive`, marginBottom: '4px' }}>Free</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: C.text, fontFamily: `${fredokaFamily}, cursive`, letterSpacing: '-.7px', lineHeight: 1 }}>
                AED 0<span style={{ fontSize: '14px', fontWeight: 400, color: C.muted }}> /mo</span>
              </div>
              <p style={{ fontSize: '12px', color: C.muted, margin: '8px 0 16px', fontWeight: 600 }}>Forever free. No card needed.</p>
              <div style={{ height: '2px', background: C.bg, marginBottom: '16px' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
                {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13px', color: C.text, lineHeight: 1.5, fontWeight: 600 }}>
                    <span style={{ color: C.green, fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <ShelfButton href="/auth/signup" bg={C.blue} shadow={C.blueShadow} fullWidth>
                Create free account
              </ShelfButton>
            </div>

            {/* Pro */}
            <div style={{
              border: `2px solid #E5E5E5`,
              borderRadius: '22px', padding: '26px 22px', background: C.white,
              boxShadow: `0 6px 0 #C9C9C9`,
            }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: C.text, fontFamily: `${fredokaFamily}, cursive`, marginBottom: '4px' }}>Pro</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: C.text, fontFamily: `${fredokaFamily}, cursive`, letterSpacing: '-.7px', lineHeight: 1, marginBottom: '4px' }}>
                $79<span style={{ fontSize: '14px', fontWeight: 400, color: C.muted }}> /mo</span>
              </div>
              <p style={{ fontSize: '12px', color: C.muted, margin: '8px 0 16px', fontWeight: 600 }}>Everything in Free, plus:</p>
              <div style={{ height: '2px', background: C.bg, marginBottom: '16px' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
                {['All 500+ lessons', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Completion certificate', 'Priority support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13px', color: C.text, lineHeight: 1.5, fontWeight: 600 }}>
                    <span style={{ color: C.gold, fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <ShelfButton href="/auth/signup?plan=pro" bg={C.bg} shadow="#C9C9C9" color={C.text} fullWidth>
                Start with Pro →
              </ShelfButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rating ── */}
      <section style={{ padding: '72px 24px', maxWidth: '540px', margin: '0 auto' }}>
        <div style={{ background: C.dark, borderRadius: '24px', padding: '44px 28px', textAlign: 'center', border: `3px solid rgba(28,176,246,0.2)`, boxShadow: `0 6px 0 rgba(20,40,80,0.4)` }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '14px' }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: '26px' }}>⭐</span>)}
          </div>
          <div style={{ fontSize: '64px', fontWeight: 700, color: '#fff', letterSpacing: '-2px', lineHeight: 1, fontFamily: `${fredokaFamily}, cursive` }}>
            9.2<span style={{ fontSize: '26px', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/10</span>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', marginTop: '8px', fontWeight: 600 }}>Average rating from parents across the GCC</p>
          <div style={{ marginTop: '24px', padding: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '2px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
              &ldquo;My daughter finished her first Python project in 3 weeks. She was so proud — I was speechless.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section style={{ padding: '0 24px 72px', background: C.white }}>
        <div style={{ maxWidth: '660px', margin: '0 auto', paddingTop: '72px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>Partners</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '10px', fontFamily: `${fredokaFamily}, cursive` }}>
            Trusted by institutions <span style={{ color: C.blue }}>across the GCC.</span>
          </h2>
          <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.7, marginBottom: '32px' }}>Schools and organisations already working with Plulai.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {PARTNERS.map(p => (
              <div key={p.name} className="shelf-hover" style={{
                border: '2px solid #E5E5E5', borderRadius: '16px', padding: '20px 12px 16px',
                background: C.white, display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', boxShadow: '0 4px 0 #D0D0D0', cursor: 'default',
              }}>
                <div style={{ width: '52px', height: '52px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src={p.logo} alt={p.name} width={52} height={52} style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '11px', color: C.muted, fontWeight: 700, lineHeight: 1.35 }}>{p.name}</div>
              </div>
            ))}
            <a href="mailto:ceo@plulai.com" className="shelf-hover" style={{
              border: `2px dashed ${C.blue}66`, borderRadius: '16px', padding: '20px 12px 16px',
              background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', cursor: 'pointer', textDecoration: 'none', boxShadow: `0 4px 0 ${C.blue}22`,
            }}>
              <div style={{ width: '52px', height: '52px', marginBottom: '10px', background: '#E5F6FD', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                ➕
              </div>
              <div style={{ fontSize: '11px', color: C.blue, fontWeight: 800, lineHeight: 1.35 }}>Become a partner</div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '72px 24px', maxWidth: '660px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: C.blue, marginBottom: '8px' }}>FAQ</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: C.text, marginBottom: '28px', fontFamily: `${fredokaFamily}, cursive` }}>
          Everything parents ask <span style={{ color: C.blue }}>before signing up.</span>
        </h2>
        <div style={{ border: '2px solid #E5E5E5', borderRadius: '20px', overflow: 'hidden', background: C.white, boxShadow: '0 4px 0 #D0D0D0' }}>
          {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: '660px', margin: '0 auto' }}>
        <div style={{ background: C.dark, borderRadius: '28px', padding: '56px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: `3px solid ${C.blue}33`, boxShadow: `0 8px 0 rgba(20,40,80,0.4)` }}>
          <div style={{ position: 'absolute', width: '500px', height: '500px', background: `rgba(28,176,246,0.06)`, borderRadius: '50%', top: '-250px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(88,204,2,0.15)', border: '2px solid rgba(88,204,2,0.25)', color: C.green, fontSize: '12px', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '999px', marginBottom: '22px' }}>
              ✓ 200+ learners already started
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700, letterSpacing: '-1px', color: '#fff', marginBottom: '12px', lineHeight: 1.08, fontFamily: `${fredokaFamily}, cursive` }}>
              Your child can<br />start today.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '30px', fontWeight: 600 }}>
              Free forever. No credit card. Arabic and English.<br />Ages 6–18 across the GCC.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <ShelfButton href="/auth/signup" bg={C.blue} shadow={C.blueShadow} fontSize="15px" style={{ padding: '15px 32px' }}>
                🚀 Create a free account →
              </ShelfButton>
              <a href="mailto:ceo@plulai.com" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 24px', borderRadius: '14px',
                background: 'transparent', color: 'rgba(255,255,255,0.55)',
                fontSize: '14px', fontWeight: 800,
                border: '2px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                textDecoration: 'none',
              }}>
                🏫 Book a school demo
              </a>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px', fontWeight: 600 }}>
              Trusted by families across UAE · Saudi Arabia · Qatar · Kuwait · Bahrain · Oman
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `3px solid ${C.bg}`, padding: '48px 24px 28px', background: C.white }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src="/icons/plulaiw.png" alt="Plulai" width={38} height={38} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 700, color: C.text, fontFamily: `${fredokaFamily}, cursive` }}>Plulai</span>
              </div>
              <p style={{ fontSize: '12px', color: C.muted, maxWidth: '180px', lineHeight: 1.6, fontWeight: 600 }}>
                AI learning for kids in the GCC — coding, AI &amp; entrepreneurship in Arabic and English.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { title: 'Platform', links: [['#tracks','Tracks'],['#how-it-works','How it works'],['#pricing','Pricing'],['#quiz','Find a track'],['/auth/signup','Sign up free']] },
                { title: 'Institutions', links: [['#schools','For schools'],['mailto:ceo@plulai.com','Request demo'],['mailto:ceo@plulai.com','Curriculum guide'],['mailto:ceo@plulai.com','Become a partner']] },
                { title: 'Contact', links: [['mailto:hello@plulai.com','hello@plulai.com'],['mailto:ceo@plulai.com','ceo@plulai.com']] },
              ].map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: C.muted, marginBottom: '12px' }}>{col.title}</h4>
                  {col.links.map(([href, label]) => (
                    <a key={label} href={href}
                      style={{ display: 'block', fontSize: '12px', color: C.muted, textDecoration: 'none', marginBottom: '7px', fontWeight: 600, transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                      {label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: `2px solid ${C.bg}`, flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>© {new Date().getFullYear()} Plulai. The AI learning platform for kids in the GCC.</p>
            <a href="mailto:hello@plulai.com" style={{ fontSize: '12px', color: C.muted, textDecoration: 'none', fontWeight: 600 }}>hello@plulai.com</a>
          </div>
        </div>
      </footer>
    </div>
  )
}