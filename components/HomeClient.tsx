// File: HomeClient.tsx
// Placement: components/HomeClient.tsx
//
// Redesign notes
//  - FONTS: untouched. No font is imported or set here; every element inherits
//    the font your site already uses (buttons are forced to `inherit` too).
//  - One scoped stylesheet (`pl-` prefix) – no dependency on page.module.css
//    or global .btn/.container classes.
//  - Visual language: dark teal "night" hero with glow, a light sheet that
//    slides over it, soft-shadow cards, timeline connectors, one dark
//    showcase for projects, one dark closing card. White/cream alternate
//    automatically between those moments.

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { css } from './plulai-styles'

/* ------------------------------ DATA ------------------------------ */

const partners = Array.from({ length: 11 }, (_, i) => ({ name: `Partner ${i + 1}`, file: `p${i + 1}.png` }))

const projects = [
  { file: '1.png', title: 'Watch With Friends', track: 'Coding', student: 'Sarah, 15' },
  { file: '2.png', title: 'Escape Game', track: 'Game', student: 'Kmar, 15' },
  { file: '3.png', title: 'Country Quiz', track: 'Game', student: 'Farah, 15' },
  { file: '4.png', title: 'Guess The Flag', track: 'Game', student: 'Mariam, 12' },
  { file: '5.png', title: 'Prescription Reader', track: 'AI', student: 'Youssef, 15' },
  { file: '6.png', title: 'Event Management', track: 'Coding', student: 'Kmar, 14' },
  { file: '7.png', title: 'Sudoku', track: 'Game', student: 'Kamar, 15' },
  { file: '8.png', title: 'AI Doctor', track: 'AI', student: 'Yassine, 11' },
  { file: '10.png', title: 'Coloring Game', track: 'Game', student: 'Kamar, 15' },
  { file: '11.png', title: 'Geological Assistant', track: 'AI', student: 'Ahmed, 13' },
  { file: '12.png', title: 'Game', track: 'Game', student: 'Abd Arrahman, 12' },
  { file: '13.png', title: 'Maze Game', track: 'Game', student: 'Serah, 14' },
  { file: '14.png', title: 'AI For Meditation', track: 'AI', student: 'Yahya, 12' },
  { file: '15.png', title: 'Football Game', track: 'Coding', student: 'Othman, 10' },
  { file: '17.png', title: 'AI DIY', track: 'AI', student: '' },
  { file: '18.png', title: 'Sequences Game', track: 'Game', student: 'Mariam, 14' },
  { file: '19.png', title: 'Flag Quest', track: 'Coding', student: 'Farah, 15' },
]

const journey = [
  { title: 'Spark', color: '#FF6B57', fg: '#FFFFFF', text: 'Find your voice: pitch an idea, speak up in a room, and stop being afraid to get it wrong.', tags: ['Self-confidence', 'Communication', 'Creative thinking'] },
  { title: 'Build', color: '#1FB8A6', fg: '#0D2B32', text: "Turn what's in your head into something real: an app, a game, a design people want to use.", tags: ['Coding', 'Game dev', 'UI/UX design'] },
  { title: 'Think', color: '#D4A24C', fg: '#0D2B32', text: 'Get fluent with AI and with money, so you use them instead of being used by them.', tags: ['AI & future tech', 'Financial literacy'] },
  { title: 'Launch', color: '#0D2B32', fg: '#F6F3EA', text: 'Take an idea all the way to a pitch: priced, marketed, and presented like you mean it.', tags: ['Entrepreneurship', 'Marketing', 'Pitching'] },
]

const steps = [
  { chip: '30 minutes', title: 'Book a demo', text: 'A 30-minute walkthrough of the student view, teacher view, and admin dashboard, tailored to your grades.' },
  { chip: 'Free pilot', title: 'Pilot one classroom', text: 'Run a free pilot with a single class before committing school-wide. Full access, no pressure.' },
  { chip: 'Taught by Plulai', title: 'Plulai teachers lead the class', text: 'Our teachers run the sessions in Arabic, French or English, with an AI coach supporting every student.' },
  { chip: 'Within a month', title: 'Roll out school-wide', text: "Scale to the full grade or school, with an admin dashboard that flags who's stuck before report cards do." },
]

const packages = [
  { name: 'Classroom Pilot', seats: '1 classroom · up to 35 seats', blurb: 'Try it with one class before deciding school-wide.', features: ['The full path, all 4 stages', 'One term', 'Teacher onboarding session'], cta: 'Start a pilot', hi: false },
  { name: 'School-wide', seats: '50–1,000 seats', blurb: 'The most common setup for a full school rollout.', features: ['The full path, all 4 stages', 'Admin dashboard', 'Teacher training and support', 'Full academic year'], cta: 'Book a demo', hi: true },
  { name: 'District', seats: '1,000+ seats', blurb: 'Multiple schools under one contract and dashboard.', features: ['Everything in School-wide', 'Multi-school reporting', 'Dedicated success contact'], cta: 'Contact sales', hi: false },
]

const sec = (d: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

const pitchFamily = [
  { color: '#1FB8A6', icon: sec('M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3zM16 11l5-3v8l-5-3'), title: 'A live session every week', text: '1h30 online with a Plulai teacher, in Arabic, French or English.' },
  { color: '#FF6B57', icon: sec('M7 6h10a4 4 0 0 1 4 4v4a3 3 0 0 1-5.2 2L14 14h-4l-1.8 2A3 3 0 0 1 3 14v-4a4 4 0 0 1 4-4zM8 10v4M6 12h4M15.5 11h.01M18 13h.01'), title: 'Open play, any time', text: 'Whenever they have a free moment, kids jump onto the platform to play missions and practice.' },
  { color: '#D4A24C', icon: sec('M4 20V10M10 20V4M16 20v-7M22 20H2'), title: 'A weekly parent summary', text: 'See what they learned and where they got stuck.' },
]

const pitchSchools = [
  { color: '#1FB8A6', icon: sec('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8'), title: 'Bulk seats, 50–5,000', text: 'Regional pricing and flexible billing.' },
  { color: '#FF6B57', icon: sec('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'), title: 'Arabic, French & English', text: 'Built for MENA classrooms, not translated from somewhere else.' },
  { color: '#D4A24C', icon: sec('M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1zM17 19c0 1.5-2 2-5 2'), title: 'Dedicated support', text: 'Onboarding and a named success contact.' },
]

const security = [
  { label: 'Privacy', color: '#1FB8A6', icon: sec('M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3'), title: 'Student data stays protected', text: "We collect only what's needed to run missions and track progress. Never sold, never used for advertising." },
  { label: 'Access', color: '#FF6B57', icon: sec('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8'), title: 'Role-based access', text: 'Teachers see their classes, admins see the school, students see only their own work.' },
  { label: 'Hosting', color: '#D4A24C', icon: sec('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'), title: 'Regional hosting options', text: 'Data residency options for institutions with regional requirements.' },
  { label: 'Support', color: '#0D2B32', icon: sec('M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1zM17 19c0 1.5-2 2-5 2'), title: 'A named point of contact', text: 'Institution plans get a dedicated contact for data and security questions, not a support queue.' },
]

const testimonials = [
  { q: "My 9-year-old asks to do his mission after school. I never thought I'd see that with coding.", n: 'Layla M.', r: 'Parent', i: 'L' },
  { q: 'The Arabic and French aren\u2019t translated, they\u2019re native. That alone sets it apart.', n: 'Dr. Khalid R.', r: 'Principal', i: 'K' },
  { q: 'He built his first working game in two weeks. The AI tutor is more patient than I ever am.', n: 'Sara A.', r: 'Parent', i: 'S' },
]

const faqs: { q: string; a: string; for: 'family' | 'schools' | 'common' }[] = [
  { q: 'Can my child use Plulai on their own at home?', a: 'Yes. Besides the weekly 1h30 live online session, your child can open the platform whenever they are free to play missions and practice on their own.', for: 'family' },
  { q: 'Is there a plan for more than one child?', a: 'Yes. The Family plan covers up to 3 children on one subscription, with separate progress for each child and one shared parent dashboard.', for: 'family' },
  { q: 'What devices or browsers do we need?', a: 'Plulai runs in any modern browser (Chrome, Safari, or Edge) on Chromebooks, laptops, or tablets. Nothing to install.', for: 'common' },
  { q: 'How is student data handled?', a: "We collect only what's needed to run missions and track progress. Data is never sold or used for advertising.", for: 'common' },
  { q: 'Can missions fit inside a normal class period?', a: 'Yes. Missions run in 30–45 minute sessions, built to fit a standard class period.', for: 'schools' },
  { q: 'How long does onboarding take?', a: 'Most schools go from demo to a live pilot classroom within a week, and to full rollout within a month. Teacher training is included.', for: 'schools' },
  { q: 'How does billing work for institutions?', a: "Billing is per seat count and term length, with flexible invoicing. Book a demo and we'll put together a quote.", for: 'schools' },
  { q: 'Do teachers need a coding background?', a: 'No. Teachers get a short onboarding session, and the AI tutor handles most one-on-one guidance.', for: 'schools' },
]

/* --------------------------- SHARED PIECES --------------------------- */

function Section({
  id, tone, title, sub, children,
}: {
  id?: string
  tone: 'cream' | 'white'
  title?: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`pl-sec pl-${tone}`}>
      <div className="pl-wrap">
        {title && (
          <header className="pl-head">
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

const Check = ({ light }: { light?: boolean }) => (
  <span className={`pl-check ${light ? 'light' : ''}`} aria-hidden>
    <svg width={12} height={12} viewBox="0 0 16 16">
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)

const Arrow = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)


const WHATSAPP_URL = `https://wa.me/97455548407?text=${encodeURIComponent("Hi Plulai, I'd like to start the family plan ($20/month).")}`

const WhatsApp = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5.04-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-2.99.95.97-2.9-.2-.31A8.1 8.1 0 1 1 12.04 20Zm4.45-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.1 3.64.57.25 1.02.4 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
  </svg>
)

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400)
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{v.toLocaleString('en-US')}{suffix}</span>
}


/* ------------------------------ PAGE ------------------------------ */

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [stage, setStage] = useState(0)
  const [audience, setAudience] = useState<'family' | 'schools'>('family')

  const schools = audience === 'schools'
  const primaryCta = schools ? 'Book a demo' : 'Start free trial'
  const primaryHref = schools ? 'mailto:hello@plulai.com' : '/auth/signup'
  const secondary = schools
    ? { label: 'Talk to our team', href: 'mailto:hello@plulai.com' }
    : { label: 'See family plan', href: '#plans' }

  // White/cream alternate in render order, skipping conditional sections.
  let n = 0
  const tone = () => (n++ % 2 ? 'white' : 'cream') as 'white' | 'cream'

  const pick = (a: 'family' | 'schools') => { setAudience(a); setOpenFaq(0) }
  const visibleFaqs = faqs.filter((f) => f.for === 'common' || f.for === audience)

  return (
    <div className="pl-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <a href="#main-content" className="pl-skip">Skip to content</a>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'Plulai',
            url: 'https://plulai.com',
            logo: 'https://plulai.com/logo.png',
            description: 'A coding, AI, and life-skills curriculum for kids and schools, taught natively in Arabic, French, and English.',
            legalName: 'Plulai Consulting FZCO',
            founder: { '@type': 'Person', name: 'Mohamed Zouari', jobTitle: 'Founder & CEO', sameAs: ['https://linkedin.com/in/mohamed-zouari-ab7196207', 'https://mohamedzouari.netlify.app'] },
            address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
            areaServed: 'MENA',
            availableLanguage: ['ar', 'fr', 'en'],
            sameAs: [],
          }),
        }}
      />

      {/* ============ NAV (floating pill) ============ */}
      <header className="pl-navwrap">
        <nav className="pl-nav" aria-label="Main">
          <a href="/" aria-label="Plulai home" className="pl-logo">
            <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 30 }} />
          </a>

          <div className="pl-navlinks">
            <a href="#path">The path</a>
            <a href="#audience" onClick={() => pick('schools')} className={schools ? 'on' : ''}>For schools</a>
            <a href="#audience" onClick={() => pick('family')} className={!schools ? 'on' : ''}>For families</a>
            <a href="#plans">Pricing</a>
          </div>

          <div className="pl-navright">
            <a href="/ar" className="pl-lang" lang="ar" hrefLang="ar">العربية</a>
            <a href="/auth/login" className="pl-login">Log in</a>
            <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-sm">{primaryCta}</a>
          </div>

          <button
            type="button" className="pl-burger" aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}
          >
            <span className={navOpen ? 'x1' : ''} /><span className={navOpen ? 'x2' : ''} /><span className={navOpen ? 'x3' : ''} />
          </button>
        </nav>

        {navOpen && (
          <div className="pl-mobile">
            <a href="#path" onClick={() => setNavOpen(false)}>The path</a>
            <a href="#audience" onClick={() => { pick('schools'); setNavOpen(false) }}>For schools</a>
            <a href="#audience" onClick={() => { pick('family'); setNavOpen(false) }}>For families</a>
            <a href="#plans" onClick={() => setNavOpen(false)}>Pricing</a>
            <a href="/auth/login">Log in</a>
            <a href="/ar" lang="ar" hrefLang="ar">العربية</a>
            <a href={primaryHref} className="pl-btn pl-btn-primary" onClick={() => setNavOpen(false)}>{primaryCta}</a>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* ============ HERO ============ */}
        <section className="pl-hero">
          <div className="pl-wrap pl-herogrid">
            <div>
              <div className="pl-toggle" role="tablist" aria-label="Choose your audience">
                <button type="button" role="tab" aria-selected={!schools} onClick={() => pick('family')}>For families</button>
                <button type="button" role="tab" aria-selected={schools} onClick={() => pick('schools')}>For schools &amp; training centers</button>
              </div>

              <h1>
                {schools ? (
                  <><span className="pl-grad">Coding, AI and life-skills curriculum</span> your school can actually run.</>
                ) : (
                  <>Raise a kid who <span className="pl-grad">builds, not just scrolls.</span></>
                )}
              </h1>
              <p className="pl-lead">
                {schools
                  ? "A complete curriculum for 30–45 minute class periods, taught natively in Arabic, French and English. Every student gets an AI coach, and teachers see who's stuck before report cards do."
                  : 'One live online session a week with a Plulai teacher, plus a platform they can jump into any time to play and practice. In real Arabic, French or English.'}
              </p>
              <div className="pl-row">
                <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-lg">{primaryCta} <Arrow /></a>
                <a href={secondary.href} className="pl-btn pl-btn-glass pl-btn-lg">{secondary.label}</a>
              </div>
              <ul className="pl-trust">
                {(schools
                  ? ['30–45 min sessions', 'Teacher dashboard', 'Free classroom pilot']
                  : ['1h30 live session weekly', 'Play on the platform anytime', '14-day free trial']
                ).map((t) => (
                  <li key={t}><Check light /> {t}</li>
                ))}
              </ul>
            </div>

            <div className="pl-herovisual">
              <div className="pl-orb" aria-hidden />
              <Image src="/avatars/heroplulai.png" alt="Marjan the camel, Plulai's mascot" width={380} height={380} priority />
              <div className="pl-float pl-float-a">
                <span className="pl-pearl" />
                <div><b>4-pearl streak</b><small>One more today</small></div>
              </div>
              <div className="pl-float pl-float-b">
                <span className="pl-badge-ico"><svg width={16} height={16} viewBox="0 0 20 20" aria-hidden><path d="M10 2l7 5v11H3V7z" fill="#0D2B32" /></svg></span>
                <div><b>Level 5 reached</b><small>Faris · Coding</small></div>
              </div>
              <div className="pl-mission">
                <small>Today&apos;s mission</small>
                <b>Build a quiz game</b>
                <div className="meta"><span>Coding · 12 min</span><span>3 / 5 steps</span></div>
                <div className="pl-mbar"><div /></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROOF (light sheet over hero) ============ */}
        <section className={`pl-sec pl-sheet pl-${tone()}`}>
          <div className="pl-wrap">
            <p className="pl-kicker">Used in real classrooms and programs</p>
            <div className="pl-marquee">
              <div className="pl-track" style={{ ['--dur' as string]: '36s' }}>
                {[...partners, ...partners].map((p, i) => (
                  <div key={`${p.file}-${i}`} className="pl-logo-tile">
                    <Image src={`/partners/${p.file}`} alt={p.name} width={120} height={48} style={{ width: 'auto', height: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pl-strip">
              <div className="pl-sitem">
                <span className="pl-snum pl-snum-grad"><CountUp to={20000} suffix="+" /></span>
                <span className="pl-slab"><b>Kids reached</b><small>Learned with Plulai</small></span>
              </div>
              <div className="pl-sitem">
                <span className="pl-snum"><CountUp to={500} suffix="+" /></span>
                <span className="pl-slab"><b>Bite-sized missions</b><small>First code to full pitch</small></span>
              </div>
              <div className="pl-sitem">
                <span className="pl-snum"><CountUp to={partners.length} suffix="+" /></span>
                <span className="pl-slab"><b>Partners in MENA</b><small>Schools &amp; centers</small></span>
                <div className="pl-logostack" aria-hidden>
                  {partners.slice(0, 3).map((p) => (
                    <span key={p.file}>
                      <Image src={`/partners/${p.file}`} alt="" width={28} height={28} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </span>
                  ))}
                  <span className="more">+{partners.length - 3}</span>
                </div>
              </div>
            </div>

            <div className="pl-chips">
              {['National coding & AI competition', '2-day in-person scouts pilot', 'Native Arabic, French & English'].map((c) => (
                <span key={c} className="pl-chip"><i />{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ AUDIENCE PITCH ============ */}
        {/* ============ AUDIENCE PITCH ============ */}
        <Section
          id="audience"
          tone={tone()}
          title={schools ? 'Bring Plulai into your classroom.' : "Learning that fits your family's schedule."}
          sub={schools
            ? "A curriculum with a dashboard that flags who's stuck before report cards do."
            : 'One live session a week, and an open platform in between. No timetable to juggle.'}
        >
          <div className="pl-pitch">
            {schools ? (
              <div className="pl-dashwrap">
                <div className="pl-dash" aria-label="Product preview">
                  <div className="pl-dots"><i /><i /><i /></div>
                  <p className="pl-dashtitle">Grade 5B · Coding track</p>
                  {([['Sara K.', 80], ['Ali M.', 45], ['Fatima R.', 92], ['Yousef A.', 15]] as [string, number][]).map(([a, v]) => {
                    const stuck = a === 'Yousef A.'
                    return (
                      <div key={a} className="pl-bar">
                        <div className="pl-barhead"><span>{a}{stuck && <em>stuck</em>}</span><span>{v}%</span></div>
                        <div className="pl-barbg"><div style={{ width: `${v}%`, background: stuck ? 'var(--pl-gold)' : 'var(--pl-teal)' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="pl-weekcard" aria-label="Your child's week on Plulai">
                <div className="pl-live">
                  <span className="pl-liveico">
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3zM16 11l5-3v8l-5-3" /></svg>
                  </span>
                  <div><b>Live online session</b><small>With a Plulai teacher</small></div>
                  <div className="pl-livetime">1h30<small>every week</small></div>
                </div>
                <p className="pl-weeklabel">In between: open play, any time</p>
                <div className="pl-days" aria-hidden>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={d + i} className="pl-day"><i style={{ height: [34, 58, 26, 70, 46, 80, 52][i] }} /><small>{d}</small></div>
                  ))}
                </div>
                <p className="pl-weeknote">Kids join whenever they have a free moment: play missions, practice, and keep their pearl streak going.</p>
              </div>
            )}

            <div>
              <div className="pl-feats">
                {(schools ? pitchSchools : pitchFamily).map((f) => (
                  <div key={f.title} className="pl-feat" style={{ ['--c' as string]: f.color }}>
                    <span className="ico">{f.icon}</span>
                    <div><b>{f.title}</b><span className="t">{f.text}</span></div>
                  </div>
                ))}
              </div>
              <div className="pl-row">
                <a href={schools ? '/schools' : '/auth/signup'} className="pl-btn pl-btn-dark">
                  {schools ? 'Explore for schools' : 'Start free trial'} <Arrow />
                </a>
                <a href={schools ? 'mailto:hello@plulai.com' : '#plans'} className="pl-btn pl-btn-ghost">
                  {schools ? 'Book a demo' : 'See family plan'}
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ HOW IT WORKS (schools) ============ */}
        {schools && (
          <Section tone={tone()} title="From demo to full rollout" sub="Most schools go from first call to a full classroom in under a month.">
            <div className="pl-flow">
              <ol className="pl-flowgrid">
                {steps.map((st, i) => (
                  <li key={st.title} className="pl-fstep" style={{ ['--c' as string]: journey[i].color }}>
                    <span className="pl-fbar" />
                    <div className="pl-fbody">
                      <span className="pl-fnum">{i + 1}</span>
                      <h3>{st.title}</h3>
                      <p>{st.text}</p>
                      <span className="pl-fchip">{st.chip}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="pl-flowfoot">
                <p>Free pilot first. No pressure to continue.</p>
                <a href="mailto:hello@plulai.com" className="pl-btn pl-btn-primary pl-btn-sm">Book a demo <Arrow /></a>
              </div>
            </div>
          </Section>
        )}

        {/* ============ THE PATH ============ */}
        <Section id="path" tone={tone()} title="What they become, not just what they learn" sub="Ages 6–18, one continuous path. Coding and AI sit next to confidence, design, money, and marketing, so an idea can turn into something real.">
          <div className="pl-path">
            <div className="pl-pathtabs" role="tablist" aria-label="Stages of the path">
              {journey.map((s, i) => (
                <button
                  key={s.title} type="button" role="tab" id={`stage-tab-${i}`}
                  aria-selected={stage === i} aria-controls="stage-panel"
                  className={`pl-pathtab ${stage === i ? 'on' : ''} ${i < stage ? 'done' : ''}`}
                  style={{ ['--c' as string]: s.color, ['--fg' as string]: s.fg }}
                  onClick={() => setStage(i)}
                >
                  <span className="pl-pathnode">{i + 1}</span>
                  <span className="pl-pathname">{s.title}</span>
                </button>
              ))}
            </div>

            {(() => {
              const s = journey[stage]
              return (
                <div key={s.title} id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${stage}`} className="pl-panel">
                  <div className="pl-panelcopy">
                    <span className="pl-tag">Stage {stage + 1} of {journey.length}</span>
                    <h3>{s.title}</h3>
                    <p className="pl-panelsub">{s.text}</p>
                    <button type="button" className="pl-btn pl-btn-dark pl-btn-sm" onClick={() => setStage((stage + 1) % journey.length)}>
                      {stage < journey.length - 1 ? 'Next stage' : 'Start over'} <Arrow />
                    </button>
                  </div>
                  <div className="pl-panelvis" style={{ ['--c' as string]: s.color, ['--fg' as string]: s.fg }}>
                    <span className="pl-bignum" aria-hidden>0{stage + 1}</span>
                    <p className="pl-skillhead">What they practice</p>
                    <ul>{s.tags.map((t) => <li key={t}><Check />{t}</li>)}</ul>
                  </div>
                </div>
              )
            })()}
          </div>
          <p className="pl-foot">Plus new missions every year, in whatever skill turns out to matter next.</p>
        </Section>

        {/* ============ PROJECTS ============ */}
        <section className={`pl-sec pl-${tone()} pl-flush`}>
          <div className="pl-wrap">
            <header className="pl-head">
              <h2>What they bring back from the path</h2>
              <p>Every project below was shipped by a real Plulai kid, with track and age.</p>
            </header>
          </div>
          <div className="pl-marquee">
            <div className="pl-track" style={{ ['--dur' as string]: '60s', gap: 20 }}>
              {[...projects, ...projects].map((p, i) => (
                <figure key={`${p.file}-${i}`} className="pl-proj">
                  <Image src={`/projects/${p.file}`} alt={p.title} fill sizes="260px" style={{ objectFit: 'cover' }} />
                  <span className={`pl-pill ${p.track === 'AI' ? 'gold' : ''}`}>{p.track}</span>
                  <figcaption>
                    <b>{p.title}</b>
                    {p.student && <small>{p.student}</small>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="pl-wrap pl-center" style={{ marginTop: 44 }}>
            <a href={primaryHref} className="pl-btn pl-btn-dark pl-btn-lg">{primaryCta} <Arrow /></a>
          </div>
        </section>

        {/* ============ BEFORE / AFTER ============ */}
        <Section
          tone={tone()}
          title={schools ? 'Watch your students go from hesitant to confident builders' : 'Watch them go from curious to confident'}
          sub={schools ? 'The shift schools notice is not a leaderboard. It is a real change in how students work.' : "Not a points system. It's what actually changes over a few months of missions."}
        >
          <div className="pl-ba">
            <div className="pl-card pl-before">
              <span className="pl-tag">Before</span>
              <ul>
                {(schools
                  ? ['Hesitant, unsure where to start', 'Needs constant hand-holding', 'Engagement drops after week one']
                  : ['Never touched a line of code', 'Quiet in a room, quick to give up', 'Screen time with nothing to show for it']
                ).map((t) => <li key={t}><i />{t}</li>)}
              </ul>
            </div>
            <div className="pl-ba-arrow" aria-hidden><Arrow /></div>
            <div className="pl-card pl-after">
              <span className="pl-tag pl-tag-teal">After 3 months</span>
              <ul>
                {(schools
                  ? ['Speaks up and presents with confidence', 'Builds and ships real projects', 'Works through problems independently']
                  : ['Pitches an idea without flinching', 'Ships their own app or game', 'Debugs mistakes without asking for help']
                ).map((t) => <li key={t}><Check light />{t}</li>)}
              </ul>
            </div>
          </div>
        </Section>

        {/* ============ CASE STUDY (schools) ============ */}
        {schools && (
          <Section tone={tone()}>
            <div className="pl-case">
              <div className="pl-glow pl-glow-sm" aria-hidden />
              <div style={{ position: 'relative' }}>
                <span className="pl-tag pl-tag-teal">Case study</span>
                <h2 className="pl-h2" style={{ color: 'var(--pl-cream)', marginTop: 16 }}>What happens when a partner leans in</h2>
                <p className="pl-sub" style={{ color: 'var(--pl-muted-d)' }}>
                  We ran a national coding and AI competition with 8 school and training-center partners.
                  Where a partner actively promoted it to students, turnout followed. One training-center
                  partnership alone brought real, sustained participation.
                </p>
                <a href="mailto:hello@plulai.com" className="pl-btn pl-btn-primary" style={{ marginTop: 26 }}>Book a demo <Arrow /></a>
              </div>
              <div className="pl-casestats" style={{ position: 'relative' }}>
                {[
                  ['8', 'School and training-center partners in our first competition'],
                  ['70', 'Participants from a single engaged training-center partner'],
                  ['40', 'Kids in a 2-day in-person scouts pilot'],
                  ['3', 'Languages taught natively: Arabic, French, English'],
                ].map(([num, label]) => (
                  <div key={label}><b>{num}</b><span>{label}</span></div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ============ PRICING ============ */}
        {schools ? (
          <Section
            id="plans" tone={tone()}
            title="A package sized for your institution"
            sub="Every plan includes the full path and the admin dashboard. Pricing is scoped to seat count and term length, so book a demo for a quote."
          >
            <div className="pl-grid pl-grid-3 pl-plans">
              {packages.map((p) => (
                <div key={p.name} className={`pl-card pl-plan ${p.hi ? 'hi' : ''}`}>
                  {p.hi && <span className="pl-flag">Most popular</span>}
                  <h3>{p.name}</h3>
                  <small>{p.seats}</small>
                  <p>{p.blurb}</p>
                  <ul>{p.features.map((f) => <li key={f}><Check light={p.hi} />{f}</li>)}</ul>
                  <a href="mailto:hello@plulai.com" className={`pl-btn pl-btn-block ${p.hi ? 'pl-btn-primary' : 'pl-btn-ghost'}`}>{p.cta}</a>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <Section
            id="plans" tone={tone()}
            title="One plan, everything included"
            sub="Try it free for 14 days. Cancel anytime before the trial ends and you won't be charged."
          >
            <div className="pl-card pl-plan hi pl-single">
              <span className="pl-flag">14-day free trial</span>
              <p className="pl-price"><b>$20</b> USD / month</p>
              <small>after your trial, billed monthly, cancel anytime</small>
              <ul>
                {['A live online session every week (1h30)', 'Open platform access to play and practice anytime', 'The full path: Spark, Build, Think & Launch', 'Unlimited AI tutor', 'Weekly parent summary', 'Arabic, French & English'].map((f) => (
                  <li key={f}><Check light />{f}</li>
                ))}
              </ul>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn-wa pl-btn-block"><WhatsApp /> Start on WhatsApp</a>
            </div>
            <p className="pl-foot" style={{ maxWidth: 560, marginInline: 'auto' }}>
              We collect only what&apos;s needed to run missions and track progress, never sold or used for advertising.{' '}
              <a href="mailto:hello@plulai.com" className="pl-link">Questions about your child&apos;s data?</a>
            </p>
          </Section>
        )}

        {/* ============ TESTIMONIALS ============ */}
        <Section tone={tone()} title="What parents and principals say">
          <div className="pl-grid pl-grid-3">
            {testimonials.map((t) => (
              <figure key={t.n} className="pl-card pl-quote">
                <span className="pl-qmark" aria-hidden>&ldquo;</span>
                <blockquote>{t.q}</blockquote>
                <figcaption>
                  <span className="pl-avatar">{t.i}</span>
                  <span><b>{t.n}</b><small>{t.r}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* ============ SECURITY (schools) ============ */}
        {schools && (
          <section id="security" className={`pl-sec pl-${tone()}`}>
            <div className="pl-wrap pl-secwrap">
              <div className="pl-seccard">
                <span className="pl-shield" aria-hidden>
                  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5L15.5 10" /></svg>
                </span>
                <h2>Data your IT team can sign off on</h2>
                <p>Student privacy is the default, not an add-on.</p>
                <ul>
                  {['Never sold, never used for advertising', 'Every role sees only what it needs', 'Regional hosting when you require it'].map((t) => (
                    <li key={t}><Check />{t}</li>
                  ))}
                </ul>
                <a href="mailto:hello@plulai.com?subject=Data%20handling%20documentation" className="pl-btn pl-btn-primary">
                  Request our documentation <Arrow />
                </a>
              </div>

              <div className="pl-secgrid">
                {security.map((x) => (
                  <div key={x.title} className="pl-seccell" style={{ ['--c' as string]: x.color }}>
                    <span className="pl-secico">{x.icon}</span>
                    <small>{x.label}</small>
                    <h3>{x.title}</h3>
                    <p>{x.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ FAQ ============ */}
        <Section tone={tone()} title="Common questions from families and schools">
          <div className="pl-faq">
            {visibleFaqs.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className={`pl-faqitem ${open ? 'open' : ''}`}>
                  <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)}>
                    {f.q}
                    <span aria-hidden>+</span>
                  </button>
                  {open && <p>{f.a}</p>}
                </div>
              )
            })}
          </div>
        </Section>

        {/* ============ FINAL CTA (dark card) ============ */}
        <section className={`pl-sec pl-${tone()}`} style={{ paddingTop: 24 }}>
          <div className="pl-wrap">
            <div className="pl-final">
              <div className="pl-glow pl-glow-sm" aria-hidden />
              <div style={{ position: 'relative' }}>
                <h2>{schools ? 'Ready to bring Plulai to your school?' : 'Ready to give them a head start?'}</h2>
                <p>
                  {schools
                    ? 'Join the schools and training centers building the next generation of MENA creators.'
                    : "Join the families across MENA building their kids' first pearl streak."}
                </p>
                <div className="pl-row" style={{ justifyContent: 'center' }}>
                  <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-lg">{primaryCta} <Arrow /></a>
                  <a href={secondary.href} className="pl-btn pl-btn-glass pl-btn-lg">{secondary.label}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="pl-footer">
        <div className="pl-wrap">
          <div className="pl-footgrid">
            <div>
              <p className="pl-wordmark">Plulai</p>
              <p className="pl-footnote">Building tomorrow&apos;s builders, today. Made for the MENA region.</p>
              <p className="pl-entity">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                <span><b>Plulai Consulting FZCO</b>A UAE company · DTEC, Dubai Silicon Oasis (DSO), Dubai</span>
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <a href="#path">The path</a>
              <a href="#plans">Pricing</a>
            </div>
            <div>
              <h4>For you</h4>
              <a href="#audience" onClick={() => pick('schools')}>For schools</a>
              <a href="#audience" onClick={() => pick('family')}>For families</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/ar" lang="ar" hrefLang="ar">العربية</a>
            </div>
          </div>
          <div className="pl-footbottom">
            <span>© 2026 Plulai Consulting FZCO. All rights reserved.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}