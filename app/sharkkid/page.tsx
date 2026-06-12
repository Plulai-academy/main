'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Nunito, Fredoka } from 'next/font/google'

const nunito = Nunito({ subsets: ['latin'], weight: ['400','500','600','700','800','900'], display: 'swap' })
const fredoka = Fredoka({ subsets: ['latin'], weight: ['300','400','500','600','700'], display: 'swap' })

// ─── Global CSS ───────────────────────────────────────────────────────────────
const fredokaFamily = fredoka.style.fontFamily
const globalStyles = `
  h1, h2, h3, h4 { font-family: ${fredokaFamily}, cursive !important; letter-spacing: -0.5px; }
`

// ─── Data ─────────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    name: 'Starter Workshop',
    badge: null,
    duration: '1–2 days',
    price: '$800–$1,200',
    color: '#1CB0F6',
    bg: '#EBF7FE',
    borderColor: 'rgba(28,176,246,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    includes: [
      'Intro to AI + vibe coding',
      '1 session per age group',
      'Certificate for every student',
      'Hands-on project demo',
    ],
    ideal: 'Perfect first step — low commitment, high impact.',
  },
  {
    name: 'Intensive Week',
    badge: 'Most popular',
    duration: '1 week (5 days)',
    price: '$2,500–$3,500',
    color: '#FAA918',
    bg: '#FFF8DC',
    borderColor: 'rgba(250,169,24,0.25)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    includes: [
      'Full Coding + AI + Entrepreneurship track',
      'Students build a working project',
      'Mini Demo Day on the last day',
      'Teacher training included',
      'Certificate for every student',
    ],
    ideal: 'The format that gets schools to sign multi-year deals.',
  },
  {
    name: 'SharkKid Bootcamp',
    badge: 'Maximum impact',
    duration: '2–4 weeks',
    price: '$4,500–$8,000',
    color: '#D33131',
    bg: '#FEF2F2',
    borderColor: 'rgba(211,49,49,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    ),
    includes: [
      'Full SharkKid curriculum',
      'Real startup built end-to-end',
      'Demo Day with local investors',
      'Media coverage opportunity',
      'Certificates + portfolio for every student',
    ],
    ideal: 'The flagship. Schools that run this become known for it.',
  },
  {
    name: 'Annual Platform Licence',
    badge: 'Online · No travel',
    duration: '12 months online',
    price: '$2,000–$5,000',
    color: '#8B5CF6',
    bg: '#F3F0FF',
    borderColor: 'rgba(139,92,246,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    includes: [
      'Plulai platform access for all students',
      'Teacher dashboard + analytics',
      'Monthly progress reports',
      'Arabic & English — no travel required',
      'Parent communication built-in',
    ],
    ideal: 'Best for schools that want always-on, curriculum-aligned learning.',
  },
]

const FAQS = [
  { q: 'Do you travel to our school?', a: 'Yes — for the Starter Workshop, Intensive Week, and SharkKid Bootcamp we come to you. The Annual Platform Licence is fully online and requires no travel.' },
  { q: 'What ages do you work with?', a: 'Ages 6–18. We adapt the curriculum per age group: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14), and Tech Experts (15–18).' },
  { q: 'Is the content in Arabic?', a: 'Yes — real Arabic, not machine-translated. Full RTL support and an AI coach that teaches natively in Arabic alongside English.' },
  { q: 'What does the school need to prepare?', a: 'Just a room and students. We bring the curriculum, materials, and facilitation. For the online licence, students need a device and internet access.' },
  { q: 'How many students per session?', a: 'We recommend 15–25 students per session for in-person formats. The online platform scales to any school size.' },
  { q: 'Can we customise the curriculum?', a: 'Yes. For the Intensive Week and Bootcamp, we tailor the content to your school\'s context, vision, and student level.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: '1px', background: '#E8EDF2', margin: '0 24px' }} />
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #E8EDF2' }} className="last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 text-left" style={{ padding: '17px 22px' }}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SchoolsPage() {
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '11px', overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/icons/plulaiw.png" alt="Plulai" width={44} height={44} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </Link>

        <div className="hidden md:flex" style={{ gap: '2px' }}>
          {[['/', 'Home'], ['/#tracks', 'Tracks'], ['/#pricing', 'Pricing'], ['/schools', 'For schools']].map(([href, label]) => (
            <a key={label} href={href}
              style={{ fontSize: '13px', fontWeight: 500, color: label === 'For schools' ? '#1CB0F6' : '#64748B', padding: '6px 12px', borderRadius: '9px', textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0A0A0F' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = label === 'For schools' ? '#1CB0F6' : '#64748B' }}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          <Link href="/auth/login" className="hidden md:block"
            style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textDecoration: 'none', padding: '7px 12px', borderRadius: '9px', border: '1.5px solid #E8EDF2' }}>
            Log in
          </Link>
          <a href="mailto:ceo@plulai.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '9px', background: '#1CB0F6', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
            Book a demo →
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#1A1A2E', marginTop: '60px', padding: '72px 24px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(28,176,246,0.12)', border: '1px solid rgba(28,176,246,0.25)', color: '#5DD3FA', fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '999px', marginBottom: '28px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1CB0F6', display: 'block' }} />
            For schools &nbsp;·&nbsp; GCC & International
          </div>

          <h1 style={{ fontSize: 'clamp(34px,5vw,52px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-1.5px', color: '#fff', marginBottom: '18px' }}>
            Bring coding, AI &amp;<br />
            <span style={{ color: '#1CB0F6' }}>entrepreneurship</span><br />
            to your students.
          </h1>

          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto 36px' }}>
            Workshop formats for every budget and timeline. We come to you — in Arabic and English, for ages 6–18, anywhere in the GCC and internationally.
          </p>

          {/* Credential banner */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px 22px', marginBottom: '32px', textAlign: 'left' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>Why schools trust us</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>
              <strong style={{ color: '#fff' }}>Selected Top 15 from 1,500 startups globally in Delta Residency</strong>, the program backed by Sam Altman &nbsp;·&nbsp;
              <strong style={{ color: '#fff' }}>Personally mentored by Khailee Ng at 500 Global HQ in Malaysia</strong> — the most credentialed AI education provider in the Arab world.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '9px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:ceo@plulai.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '14px 30px', borderRadius: '14px', background: '#1CB0F6', color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
              Book a 20-min demo →
            </a>
            <a href="mailto:hello@plulai.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '13px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>
              Get the curriculum guide
            </a>
          </div>
        </div>
      </section>

      {/* ── Pricing advantage callout ── */}
      <section style={{ padding: '48px 24px 0', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ background: '#0F2F0A', border: '1px solid rgba(88,204,2,0.2)', borderRadius: '16px', padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(88,204,2,0.15)', border: '1px solid rgba(88,204,2,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58CC02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#58CC02', marginBottom: '6px' }}>Your pricing advantage — dramatically cheaper than alternatives</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>
                International school workshops from Western providers cost <strong style={{ color: '#fff' }}>$5,000–$15,000 per week</strong>. Plulai delivers the same quality at <strong style={{ color: '#fff' }}>$800–$3,500</strong> — the most affordable credentialed option in the region. Our Arabic-first positioning and global credentials justify every dollar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '32px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#E8EDF2', border: '1px solid #E8EDF2', borderRadius: '16px', overflow: 'hidden' }}>
          {[
            { n: '10+', l: 'Partner schools' },
            { n: '6',   l: 'GCC countries' },
            { n: '200+',l: 'Students trained' },
            { n: '9.2', l: 'Satisfaction score' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#1CB0F6', letterSpacing: '-.5px' }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Packages ── */}
      <section style={{ padding: '24px 24px 72px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94A3B8', marginBottom: '8px' }}>School packages</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 900, letterSpacing: '-.8px', lineHeight: 1.1, color: '#0A0A0F', marginBottom: '10px' }}>
            Pick the format that <span style={{ color: '#1CB0F6' }}>fits your school.</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7 }}>
            From a one-day taster to a full-year licence. Every package includes certification for students and full facilitation by our team.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {PACKAGES.map((pkg, i) => (
            <div key={i}
              style={{ border: `1.5px solid ${pkg.borderColor}`, borderRadius: '20px', overflow: 'hidden', background: '#fff', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>

              {/* Top accent */}
              <div style={{ height: '3px', background: pkg.color }} />

              <div style={{ display: 'flex' }}>
                {/* Left icon column */}
                <div style={{ width: '100px', flexShrink: 0, background: pkg.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 12px', gap: '10px', borderRight: `1px solid ${pkg.borderColor}` }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: pkg.color }}>
                    {pkg.icon}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: pkg.color, textTransform: 'uppercase', letterSpacing: '.04em' }}>{pkg.duration}</div>
                  </div>
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: '22px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0A0A0F', margin: 0, letterSpacing: '-.3px' }}>{pkg.name}</h3>
                        {pkg.badge && (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: pkg.bg, color: pkg.color, border: `1px solid ${pkg.borderColor}` }}>
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#0A0A0F', letterSpacing: '-.5px' }}>{pkg.price}</div>
                    </div>
                    <a href="mailto:ceo@plulai.com"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 18px', borderRadius: '9px', background: pkg.color, color: '#fff', fontSize: '12px', fontWeight: 700, textDecoration: 'none', flexShrink: 0, transition: 'opacity .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                      Enquire →
                    </a>
                  </div>

                  {/* Includes */}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
                    {pkg.includes.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                          <path d="M2.5 7L5.5 10L11.5 4" stroke={pkg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Ideal for */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: pkg.bg, border: `1px solid ${pkg.borderColor}`, color: pkg.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4"/></svg>
                    {pkg.ideal}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Payment structure ── */}
      <section style={{ padding: '64px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94A3B8', marginBottom: '8px' }}>Payment & logistics</p>
        <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, letterSpacing: '-.7px', color: '#0A0A0F', marginBottom: '24px' }}>
          Simple structure. <span style={{ color: '#1CB0F6' }}>No surprises.</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Payment */}
          <div style={{ background: '#FFFBEB', border: '1px solid rgba(250,169,24,0.25)', borderRadius: '16px', padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(250,169,24,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#854F0B', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#854F0B', margin: 0 }}>Payment structure</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.7, margin: 0 }}>
              Always <strong>50% upfront, 50% on arrival</strong>. A $2,500 Intensive Week = $1,250 upfront. That covers your flight and first week of accommodation. The school pays the rest when we land.
            </p>
          </div>

          {/* What we handle */}
          <div style={{ background: '#EBF7FE', border: '1px solid rgba(28,176,246,0.2)', borderRadius: '16px', padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(28,176,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0C7FC4', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0C7FC4', margin: 0 }}>What we handle</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
              {['Curriculum & materials', 'Facilitation & teaching', 'Arabic localisation', 'Student certificates', 'Parent communication'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#0C7FC4' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* School provides */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E8EDF2', borderRadius: '16px', padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(100,116,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: 0 }}>What the school provides</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
              {['A room', 'Students (15–25 per session)', 'Devices or computer lab', 'Internet access'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#64748B' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Credential */}
          <div style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(28,176,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1CB0F6', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#5DD3FA', margin: 0 }}>The credential that closes deals</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
              Top 15 from 1,500 startups — <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Delta Residency (Sam Altman)</strong>. Mentored by <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Khailee Ng, 500 Global HQ</strong>. Lead with these every time.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Process ── */}
      <section style={{ padding: '64px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94A3B8', marginBottom: '8px' }}>How it works</p>
        <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, letterSpacing: '-.7px', color: '#0A0A0F', marginBottom: '32px' }}>
          From first email to <span style={{ color: '#1CB0F6' }}>Demo Day.</span>
        </h2>
        <div>
          {[
            { n: '1', title: 'Book a 20-min call',        badge: 'Day 1',     desc: 'We scope the format, age groups, timing, and budget. No obligation.' },
            { n: '2', title: 'Receive a custom proposal',  badge: 'Day 2–3',   desc: 'Tailored to your school — curriculum outline, logistics, and pricing in one document.' },
            { n: '3', title: 'Sign & 50% upfront',         badge: 'Week 1',    desc: "50% secures the date. We handle everything from here — curriculum, materials, Arabic localisation." },
            { n: '4', title: 'We arrive & deliver',        badge: 'Workshop',  desc: "Our team arrives, runs every session, manages the students, and keeps you updated throughout." },
            { n: '5', title: 'Demo Day & certificates',    badge: 'Final day', desc: "Students present their projects. Every student gets a certificate. School gets a full impact report." },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: i < arr.length - 1 ? '1px solid #E8EDF2' : 'none' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1CB0F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>
                {s.n}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0A0A0F', margin: 0 }}>{s.title}</h4>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: '#EBF7FE', color: '#0C7FC4' }}>{s.badge}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── FAQ ── */}
      <section style={{ padding: '64px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94A3B8', marginBottom: '8px' }}>FAQ</p>
        <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, letterSpacing: '-.7px', color: '#0A0A0F', marginBottom: '28px' }}>
          Questions schools <span style={{ color: '#1CB0F6' }}>always ask.</span>
        </h2>
        <div style={{ border: '1.5px solid #E8EDF2', borderRadius: '20px', overflow: 'hidden', background: '#fff' }}>
          {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ background: '#1A1A2E', borderRadius: '28px', padding: '56px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(28,176,246,0.07)', borderRadius: '50%', top: '-200px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(88,204,2,0.12)', border: '1px solid rgba(88,204,2,0.2)', color: '#58CC02', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '999px', marginBottom: '20px' }}>
              ✓ 10+ schools already partnered
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: '10px', lineHeight: 1.08 }}>
              Ready to bring Plulai<br />to your students?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '28px' }}>
              Book a free 20-minute call. No commitment.<br />We'll recommend the right package for your school.
            </p>
            <div style={{ display: 'flex', gap: '9px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:ceo@plulai.com"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '14px 30px', borderRadius: '12px', background: '#1CB0F6', color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
                Book a free demo →
              </a>
              <a href="mailto:hello@plulai.com"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '13px 22px', borderRadius: '12px', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>
                Email us directly
              </a>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '18px' }}>
              ceo@plulai.com &nbsp;·&nbsp; hello@plulai.com
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #E8EDF2', padding: '36px 24px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
              <Image src="/icons/plulaiw.png" alt="Plulai" width={36} height={36} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0A0A0F', fontFamily: `${fredoka.style.fontFamily}, cursive` }}>Plulai</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>← Back to home</Link>
            <a href="mailto:ceo@plulai.com" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>ceo@plulai.com</a>
            <a href="mailto:hello@plulai.com" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>hello@plulai.com</a>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', width: '100%', borderTop: '1px solid #E8EDF2', paddingTop: '16px', marginTop: '8px' }}>
            © {new Date().getFullYear()} Plulai. The AI learning platform for kids in the GCC.
          </p>
        </div>
      </footer>
    </div>
  )
}