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

// Founder block (details from Mohamed's CV). To show a photo, put the file in /public and set photo: '/founder.jpg'.
const FOUNDER = {
  name: 'Mohamed Zouari',
  initials: 'MZ',
  badge: 'Founder & CEO',
  role: 'Founder & CEO, Plulai Consulting FZCO',
  photo: '',
  linkedin: 'https://linkedin.com/in/mohamed-zouari-ab7196207',
  site: 'https://mohamedzouari.netlify.app',
  bio: 'Mohamed is a Python developer and tech entrepreneur from Tunisia. He has been building apps and games and leading hackathons and bootcamps since 2023, and started a tech club for high school students in Sfax. He founded Plulai to give kids across the MENA region a real path into coding, AI and life skills, in Arabic, French and English.',
  highlights: [
    { title: 'Founder & CEO, Plulai', sub: 'Since January 2025' },
    { title: 'Educator', sub: 'Harvard Business Impact Education' },
    { title: 'Delta Residency 2025', sub: 'Top 15 out of 1,500' },
    { title: 'Tech club founder', sub: 'For Sfax high school students' },
  ],
  learning: ['Stanford × Y Combinator', 'MIT', 'Google', 'IBM', 'University of Helsinki', 'Unity'],
}

const faqs: { q: string; a: string; for: 'family' | 'schools' | 'common' }[] = [
  { q: 'Can my child use Plulai on their own at home?', a: 'Yes. Missions are self-paced and the AI tutor adapts to your child, so no classroom or teacher is required.', for: 'family' },
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
  const [audience, setAudience] = useState<'family' | 'schools'>('schools')

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
                  : 'Short daily missions in real Arabic, French or English, guided by an AI coach that adapts to your child. They build real apps and games. You get a weekly summary. No classroom needed.'}
              </p>
              <div className="pl-row">
                <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-lg">{primaryCta} <Arrow /></a>
                <a href={secondary.href} className="pl-btn pl-btn-glass pl-btn-lg">{secondary.label}</a>
              </div>
              <ul className="pl-trust">
                {(schools
                  ? ['30–45 min sessions', 'Teacher dashboard', 'Free classroom pilot']
                  : ['15 minutes a day', 'Weekly parent summary', '14-day free trial']
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
        <section id="audience" className={`pl-sec pl-${tone()}`}>
          <div className="pl-wrap pl-split">
            <div>
              <h2 className="pl-h2">
                {schools ? 'Bring Plulai into your classroom.' : "Learning that fits your family's schedule."}
              </h2>
              <p className="pl-sub">
                {schools
                  ? "A curriculum your teachers can run, with a dashboard that flags who's stuck before report cards do."
                  : 'No timetable. Just 15 minutes a day, whenever it works: alone, with a sibling, or together with you.'}
              </p>
              <ul className="pl-list">
                {(schools
                  ? [
                      ['Bulk seats, 50–5,000', 'Regional pricing and flexible billing.'],
                      ['Arabic, French & English', 'Built for MENA classrooms, not translated from somewhere else.'],
                      ['Dedicated support', 'Onboarding, training, and a named success contact.'],
                    ]
                  : [
                      ['Learn anytime, anywhere', 'Self-paced missions your child can start and stop on their own.'],
                      ['Arabic, French & English', 'A native trilingual curriculum, not translated from somewhere else.'],
                      ['Weekly parent summary', 'See what they learned and where they got stuck.'],
                    ]
                ).map(([b, s]) => (
                  <li key={b}><Check /><div><b>{b}</b><span>{s}</span></div></li>
                ))}
              </ul>
              <div className="pl-row">
                <a href={schools ? '/schools' : '/auth/signup'} className="pl-btn pl-btn-dark">
                  {schools ? 'Explore for schools' : 'Start free trial'} <Arrow />
                </a>
                <a href={schools ? 'mailto:hello@plulai.com' : '#plans'} className="pl-btn pl-btn-ghost">
                  {schools ? 'Book a demo' : 'See family plan'}
                </a>
              </div>
            </div>

            <div className="pl-dashwrap">
              <div className="pl-dash" aria-label="Product preview">
                <div className="pl-dots"><i /><i /><i /></div>
                <p className="pl-dashtitle">{schools ? 'Grade 5B · Coding track' : "Faris' week"}</p>
                {(schools
                  ? [['Sara K.', 80], ['Ali M.', 45], ['Fatima R.', 92], ['Yousef A.', 15]]
                  : [['Missions completed', 100], ['Current streak', 80], ['Coding track', 62], ['Next: Level 5', 40]]
                ).map(([a, v]) => {
                  const stuck = schools && a === 'Yousef A.'
                  return (
                    <div key={a as string} className="pl-bar">
                      <div className="pl-barhead">
                        <span>{a}{stuck && <em>stuck</em>}</span>
                        <span>{v}%</span>
                      </div>
                      <div className="pl-barbg"><div style={{ width: `${v}%`, background: stuck ? 'var(--pl-gold)' : 'var(--pl-teal)' }} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

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
                {['The full path: Spark, Build, Think & Launch', 'Unlimited AI tutor', 'Weekly parent summary', 'Arabic, French & English'].map((f) => (
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

        {/* ============ FOUNDER ============ */}
        <section id="founder" className={`pl-sec pl-${tone()}`}>
          <div className="pl-wrap">
            <div className="pl-who">
              <div className="pl-whophoto">
                {FOUNDER.photo ? (
                  <Image src={FOUNDER.photo} alt={`${FOUNDER.name}, founder of Plulai`} fill sizes="(max-width: 800px) 100vw, 40vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="pl-initials" aria-hidden>{FOUNDER.initials}</span>
                )}
                <span className="pl-whobadge">{FOUNDER.badge}</span>
              </div>
              <div className="pl-whocopy">
                <span className="pl-tag">Meet the founder</span>
                <h2 className="pl-h2">{FOUNDER.name}</h2>
                <p className="pl-frole">{FOUNDER.role}</p>
                <p className="pl-sub">{FOUNDER.bio}</p>
                <ul className="pl-hl">
                  {FOUNDER.highlights.map((h) => (
                    <li key={h.title}><b>{h.title}</b><span>{h.sub}</span></li>
                  ))}
                </ul>
                <p className="pl-learnlabel">Learning from</p>
                <div className="pl-whochips">
                  {FOUNDER.learning.map((f) => <span key={f} className="pl-chip"><i />{f}</span>)}
                </div>
                <div className="pl-row">
                  <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn-dark">LinkedIn <Arrow /></a>
                  <a href={FOUNDER.site} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn-ghost">Portfolio</a>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              <a href="#founder">About the founder</a>
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

/* ------------------------------ STYLES ------------------------------ */
/* No font-family is declared anywhere: text inherits your site font. */

const css = `
.pl-root {
  --pl-ink: #0D2B32; --pl-ink-2: #153B44; --pl-teal: #1FB8A6; --pl-teal-d: #12907F;
  --pl-gold: #D4A24C; --pl-cream: #F6F3EA; --pl-white: #FFFFFF; --pl-line: #E4E9E7;
  --pl-muted: #4F6B66; --pl-muted-d: #9DB5B0;
  --pl-shadow: 0 1px 2px rgba(13,43,50,.04), 0 12px 32px rgba(13,43,50,.07);
  --pl-shadow-lg: 0 2px 4px rgba(13,43,50,.05), 0 24px 56px rgba(13,43,50,.14);
  color: var(--pl-ink); background: var(--pl-cream);
}
.pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; }
.pl-root button, .pl-root a { font-family: inherit; }
.pl-root :is(h1, h2, h3, h4) { color: inherit; }
.pl-root a:focus-visible, .pl-root button:focus-visible { outline: 3px solid var(--pl-teal); outline-offset: 3px; }
.pl-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.pl-center { text-align: center; }

/* sections */
.pl-sec { padding: 104px 0; scroll-margin-top: 90px; position: relative; }
.pl-cream { background: var(--pl-cream); --fade: #F6F3EA; }
.pl-white { background: var(--pl-white); --fade: #FFFFFF; }
.pl-dark { background: var(--pl-ink); color: var(--pl-cream); overflow: hidden; }
.pl-flush { padding-bottom: 96px; }
.pl-head { max-width: 700px; margin: 0 auto 60px; text-align: center; }
.pl-head h2, .pl-h2 { font-size: clamp(30px, 4.2vw, 46px); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin: 0; }
.pl-head p, .pl-sub { font-size: 17.5px; line-height: 1.65; color: var(--pl-muted); margin: 18px 0 0; max-width: 520px; }
.pl-head p { margin-inline: auto; max-width: 580px; }
.pl-dark .pl-head p { color: var(--pl-muted-d); }
.pl-foot { text-align: center; font-size: 14.5px; color: var(--pl-muted); margin: 40px 0 0; line-height: 1.6; }
.pl-link { color: var(--pl-teal-d); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.pl-kicker { text-align: center; font-size: 15px; font-weight: 600; color: var(--pl-muted); margin: 0 0 28px; }
.pl-tag { display: inline-block; font-size: 12.5px; font-weight: 700; padding: 6px 14px; border-radius: 999px; background: rgba(13,43,50,.07); color: var(--pl-muted); margin-bottom: 22px; }
.pl-tag-teal { background: rgba(31,184,166,.16); color: var(--pl-teal); }
.pl-glow { position: absolute; width: 720px; height: 720px; border-radius: 50%; top: -360px; left: 50%; transform: translateX(-50%); background: radial-gradient(circle, rgba(31,184,166,.22), transparent 65%); pointer-events: none; }
.pl-glow-sm { width: 420px; height: 420px; top: -200px; left: auto; right: -80px; transform: none; }

/* buttons */
.pl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; border-radius: 999px; font-size: 15px; font-weight: 700; border: 1.5px solid transparent; cursor: pointer; text-decoration: none; transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease; }
.pl-btn:hover { transform: translateY(-2px); }
.pl-btn svg { transition: transform .15s ease; }
.pl-btn:hover svg { transform: translateX(3px); }
.pl-btn-primary { background: var(--pl-teal); color: var(--pl-ink); box-shadow: 0 8px 20px rgba(31,184,166,.32); }
.pl-btn-primary:hover { background: #2BD2BE; }
.pl-btn-dark { background: var(--pl-ink); color: var(--pl-cream); box-shadow: 0 8px 20px rgba(13,43,50,.22); }
.pl-btn-ghost { background: transparent; color: var(--pl-ink); border-color: rgba(13,43,50,.22); }
.pl-btn-ghost:hover { border-color: var(--pl-ink); }
.pl-btn-glass { background: rgba(255,255,255,.08); color: var(--pl-cream); border-color: rgba(255,255,255,.22); }
.pl-btn-glass:hover { background: rgba(255,255,255,.14); }
.pl-btn-sm { padding: 9px 18px; font-size: 14px; box-shadow: none; }
.pl-btn-lg { padding: 16px 30px; font-size: 16px; }
.pl-btn-block { width: 100%; }
.pl-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }

/* cards & grids */
.pl-card { background: var(--pl-white); border: 1px solid var(--pl-line); border-radius: 24px; padding: 30px 26px; box-shadow: var(--pl-shadow); }
.pl-white .pl-card { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-card h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 10px; }
.pl-card p { font-size: 14.5px; line-height: 1.65; color: var(--pl-muted); margin: 0; }
.pl-grid { display: grid; gap: 22px; }
.pl-grid-3 { grid-template-columns: repeat(3, 1fr); }
.pl-grid-4 { grid-template-columns: repeat(4, 1fr); }
.pl-split { display: grid; grid-template-columns: 1.05fr 1fr; gap: 72px; align-items: center; }
.pl-check { display: inline-flex; flex-shrink: 0; width: 20px; height: 20px; margin-top: 2px; border-radius: 50%; align-items: center; justify-content: center; background: rgba(31,184,166,.16); color: var(--pl-teal-d); }
.pl-check.light { background: rgba(31,184,166,.2); color: var(--pl-teal); }

/* nav */
.pl-skip { position: absolute; left: -9999px; top: 0; z-index: 100; background: var(--pl-ink); color: var(--pl-cream); padding: 10px 18px; border-radius: 8px; font-weight: 700; }
.pl-skip:focus { left: 16px; top: 16px; }
.pl-navwrap { position: sticky; top: 0; z-index: 50; height: 0; }
.pl-nav { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 1072px; margin: 14px auto 0; padding: 9px 12px 9px 24px; border-radius: 999px; background: rgba(13,43,50,.78); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 10px 30px rgba(13,43,50,.25); }
.pl-logo { display: flex; align-items: center; background: #F6F3EA; border-radius: 999px; padding: 6px 14px; }
.pl-navlinks { display: flex; gap: 6px; }
.pl-navlinks a { color: #C9D8D5; font-size: 14.5px; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 999px; transition: background .15s ease, color .15s ease; }
.pl-navlinks a:hover { color: #fff; background: rgba(255,255,255,.08); }
.pl-navlinks a.on { color: var(--pl-ink); background: var(--pl-cream); }
.pl-navright { display: flex; align-items: center; gap: 14px; }
.pl-login { color: #C9D8D5; font-size: 14.5px; font-weight: 600; text-decoration: none; }
.pl-login:hover { color: #fff; }
.pl-lang { font-size: 14px; font-weight: 700; color: var(--pl-cream); text-decoration: none; padding: 7px 13px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,.2); }
.pl-burger { display: none; width: 44px; height: 44px; background: none; border: 0; cursor: pointer; flex-direction: column; justify-content: center; gap: 5px; padding: 11px; }
.pl-burger span { display: block; height: 2px; background: var(--pl-cream); border-radius: 2px; transition: transform .2s ease, opacity .2s ease; }
.pl-burger .x1 { transform: translateY(7px) rotate(45deg); }
.pl-burger .x2 { opacity: 0; }
.pl-burger .x3 { transform: translateY(-7px) rotate(-45deg); }
.pl-mobile { display: none; flex-direction: column; gap: 2px; margin: 8px 16px 0; padding: 14px 20px 20px; border-radius: 24px; background: rgba(13,43,50,.96); box-shadow: 0 16px 40px rgba(13,43,50,.35); }
.pl-mobile a { color: var(--pl-cream); font-weight: 600; text-decoration: none; padding: 12px 0; }
.pl-mobile a.pl-btn { margin-top: 10px; color: var(--pl-ink); }

/* hero */
.pl-hero { position: relative; background: linear-gradient(160deg, #0D2B32 0%, #153B44 60%, #0F3A40 100%); color: var(--pl-cream); padding: 168px 0 168px; overflow: hidden; }
.pl-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.09) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); }
.pl-hero::after { content: ''; position: absolute; width: 620px; height: 620px; border-radius: 50%; right: -120px; top: -120px; background: radial-gradient(circle, rgba(31,184,166,.28), transparent 65%); pointer-events: none; }
.pl-herogrid { position: relative; z-index: 1; display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px; align-items: center; }
.pl-hero h1 { color: var(--pl-cream); font-size: clamp(38px, 5.6vw, 66px); font-weight: 800; line-height: 1.04; letter-spacing: -0.035em; margin: 0; }
.pl-lead { font-size: 18.5px; line-height: 1.65; color: #B7CCC8; max-width: 540px; margin: 24px 0 0; }
.pl-toggle { display: inline-flex; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 999px; padding: 4px; margin-bottom: 30px; max-width: 100%; }
.pl-toggle button { border: 0; cursor: pointer; font-size: 13.5px; font-weight: 700; padding: 9px 18px; border-radius: 999px; background: transparent; color: #B7CCC8; transition: background .15s ease; }
.pl-toggle button[aria-selected='true'] { background: var(--pl-cream); color: var(--pl-ink); }
.pl-trust { list-style: none; display: flex; flex-wrap: wrap; gap: 10px 24px; padding: 0; margin: 34px 0 0; font-size: 14px; font-weight: 600; color: #C9D8D5; }
.pl-trust li { display: flex; align-items: center; gap: 8px; }
.pl-trust .pl-check { margin: 0; }
.pl-herovisual { position: relative; display: flex; justify-content: center; align-items: center; }
.pl-herovisual img { position: relative; max-width: 100%; height: auto; filter: drop-shadow(0 24px 40px rgba(0,0,0,.35)); }
.pl-orb { position: absolute; width: 82%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(31,184,166,.5), rgba(31,184,166,.08) 70%); border: 1px solid rgba(255,255,255,.12); }
.pl-float { position: absolute; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.96); color: var(--pl-ink); border-radius: 16px; padding: 11px 16px; box-shadow: 0 16px 36px rgba(0,0,0,.28); }
.pl-float b { display: block; font-size: 13.5px; }
.pl-float small { font-size: 12px; color: var(--pl-muted); }
.pl-float-a { top: 8px; left: -4px; }
.pl-float-b { bottom: 28px; right: -4px; }
.pl-pearl { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, var(--pl-gold)); animation: pl-pulse 1.8s ease-in-out infinite; }
.pl-badge-ico { width: 28px; height: 28px; border-radius: 9px; background: var(--pl-teal); display: flex; align-items: center; justify-content: center; }
@keyframes pl-pulse { 50% { transform: scale(1.25); opacity: .75; } }

/* sheet that slides over the hero */
.pl-sheet { margin-top: -72px; border-radius: 44px 44px 0 0; padding-top: 80px; z-index: 2; }

/* marquees */
.pl-marquee { position: relative; overflow: hidden; }
.pl-marquee::before, .pl-marquee::after { content: ''; position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none; }
.pl-marquee::before { left: 0; } .pl-marquee::after { right: 0; }
.pl-marquee::before { background: linear-gradient(90deg, var(--fade, #fff), transparent); }
.pl-marquee::after { background: linear-gradient(270deg, var(--fade, #fff), transparent); }
.pl-fade-dark::before { background: linear-gradient(90deg, var(--pl-ink), transparent); }
.pl-fade-dark::after { background: linear-gradient(270deg, var(--pl-ink), transparent); }
.pl-track { display: flex; gap: 16px; width: max-content; padding: 8px 0 14px; animation: pl-scroll var(--dur, 40s) linear infinite; }
.pl-marquee:hover .pl-track { animation-play-state: paused; }
@keyframes pl-scroll { to { transform: translateX(-50%); } }
.pl-logo-tile { flex: 0 0 auto; width: 160px; height: 84px; padding: 16px 24px; border-radius: 18px; border: 1px solid var(--pl-line); background: #fff; box-shadow: var(--pl-shadow); display: flex; align-items: center; justify-content: center; }
.pl-logo-tile img { filter: grayscale(1); opacity: .6; transition: filter .2s ease, opacity .2s ease; }
.pl-logo-tile:hover img { filter: none; opacity: 1; }

/* stats */
.pl-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 52px 0 0; }
.pl-stat { background: var(--pl-white); border-radius: 24px; padding: 30px 24px; text-align: center; box-shadow: var(--pl-shadow); }
.pl-stat dt { font-size: clamp(34px, 4vw, 48px); font-weight: 800; letter-spacing: -0.03em; color: var(--pl-ink); }
.pl-stat dd { margin: 4px 0 0; font-size: 14.5px; font-weight: 600; color: var(--pl-muted); }

/* pitch */
.pl-list { list-style: none; padding: 0; margin: 30px 0 0; display: flex; flex-direction: column; gap: 20px; }
.pl-list li { display: flex; gap: 14px; }
.pl-list b { display: block; font-size: 16px; margin-bottom: 2px; }
.pl-list span { font-size: 14.5px; color: var(--pl-muted); line-height: 1.55; }
.pl-dashwrap { position: relative; }
.pl-dashwrap::before { content: ''; position: absolute; inset: -24px; border-radius: 40px; background: radial-gradient(circle at 70% 30%, rgba(31,184,166,.25), transparent 65%); }
.pl-dash { position: relative; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-radius: 28px; padding: 28px; box-shadow: var(--pl-shadow-lg); color: var(--pl-cream); }
.pl-dots { display: flex; gap: 6px; margin-bottom: 20px; }
.pl-dots i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.2); }
.pl-dashtitle { font-weight: 800; font-size: 17px; margin: 0 0 22px; }
.pl-bar + .pl-bar { margin-top: 18px; }
.pl-barhead { display: flex; justify-content: space-between; font-size: 14px; color: #C9D8D5; margin-bottom: 8px; font-weight: 600; }
.pl-barhead em { font-style: normal; font-size: 11.5px; font-weight: 700; color: #402F12; background: var(--pl-gold); padding: 2px 8px; border-radius: 999px; margin-left: 8px; }
.pl-barbg { height: 8px; border-radius: 6px; background: rgba(255,255,255,.1); overflow: hidden; }
.pl-barbg div { height: 100%; border-radius: 6px; }

/* timeline (steps + path) */
.pl-timeline { list-style: none; padding: 0; margin: 0; position: relative; }
.pl-timeline::before { content: ''; position: absolute; top: 27px; left: 12%; right: 12%; height: 2px; background: repeating-linear-gradient(90deg, #BFD6D1 0 8px, transparent 8px 16px); }
.pl-step { position: relative; padding-top: 44px; }
.pl-node { position: absolute; top: -27px; left: 26px; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; background: var(--pl-ink); color: var(--pl-cream); box-shadow: 0 0 0 6px var(--pl-cream), 0 10px 20px rgba(13,43,50,.2); }
.pl-white .pl-node { box-shadow: 0 0 0 6px var(--pl-white), 0 10px 20px rgba(13,43,50,.2); }
.pl-node-c { background: var(--c); color: #fff; }
.pl-step:has(.pl-node-c) { border-top: 0; }
.pl-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
.pl-tags span { font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 999px; background: rgba(13,43,50,.07); color: var(--pl-ink); }

/* projects */
.pl-proj { position: relative; margin: 0; flex: 0 0 auto; width: 260px; aspect-ratio: 4 / 3.3; border-radius: 22px; overflow: hidden; background: var(--pl-ink-2); border: 1px solid rgba(255,255,255,.12); transition: transform .25s ease, border-color .25s ease; }
.pl-proj:hover { transform: translateY(-6px); border-color: rgba(212,162,76,.6); }
.pl-proj::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(8,28,33,.92)); }
.pl-pill { position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; background: var(--pl-teal); color: var(--pl-ink); }
.pl-pill.gold { background: var(--pl-gold); color: #402F12; }
.pl-proj figcaption { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 14px 16px; }
.pl-proj b { display: block; font-size: 15px; color: #fff; }
.pl-proj small { display: block; margin-top: 3px; font-size: 12.5px; color: #B7CCC8; }

/* before / after */
.pl-ba { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: stretch; max-width: 960px; margin: 0 auto; }
.pl-ba ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
.pl-ba li { display: flex; gap: 12px; align-items: flex-start; font-size: 16px; line-height: 1.5; }
.pl-before li { color: var(--pl-muted); }
.pl-before li i { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #C5D3D0; flex-shrink: 0; margin-top: 2px; }
.pl-ba-arrow { align-self: center; width: 46px; height: 46px; border-radius: 50%; background: var(--pl-ink); color: var(--pl-teal); display: flex; align-items: center; justify-content: center; box-shadow: var(--pl-shadow); }
.pl-card.pl-after { background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-color: transparent; color: var(--pl-cream); box-shadow: var(--pl-shadow-lg); }
.pl-after li { font-weight: 700; }

/* case study */
.pl-case { position: relative; overflow: hidden; display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: center; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-radius: 36px; padding: 60px 52px; box-shadow: var(--pl-shadow-lg); }
.pl-case .pl-h2 { font-size: clamp(26px, 3.4vw, 38px); }
.pl-casestats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.pl-casestats > div { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 20px; padding: 22px 18px; }
.pl-casestats b { display: block; font-size: 36px; font-weight: 800; letter-spacing: -0.03em; color: var(--pl-teal); margin-bottom: 6px; }
.pl-casestats span { font-size: 13px; line-height: 1.45; color: #B7CCC8; }

/* pricing */
.pl-plans { align-items: stretch; }
.pl-plan { position: relative; display: flex; flex-direction: column; padding: 34px 28px; }
.pl-plan small { font-size: 13.5px; font-weight: 700; color: var(--pl-teal-d); }
.pl-plan > p { margin: 12px 0 22px; }
.pl-plan ul { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.pl-plan li { display: flex; gap: 10px; font-size: 14.5px; }
.pl-card.pl-plan.hi { background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-color: rgba(212,162,76,.45); color: var(--pl-cream); box-shadow: var(--pl-shadow-lg); transform: translateY(-8px); }
.pl-plan.hi p, .pl-plan.hi li { color: #C9D8D5; }
.pl-plan.hi small { color: var(--pl-teal); }
.pl-flag { position: absolute; top: -13px; left: 28px; font-size: 12px; font-weight: 800; padding: 5px 14px; border-radius: 999px; background: var(--pl-gold); color: #402F12; }
.pl-single { max-width: 420px; margin: 0 auto; text-align: center; padding-top: 44px; }
.pl-single li { text-align: left; }
.pl-single .pl-flag { left: 50%; transform: translateX(-50%); }
.pl-price { font-size: 15px; color: #C9D8D5 !important; margin: 0 0 4px !important; }
.pl-price b { font-size: 52px; font-weight: 800; letter-spacing: -0.03em; color: var(--pl-cream); }
.pl-single small { margin-bottom: 26px; }

/* testimonials, security, faq */
.pl-quote { position: relative; margin: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 26px; padding-top: 48px; }
.pl-qmark { position: absolute; top: 12px; left: 24px; font-size: 72px; line-height: 1; font-weight: 800; color: var(--pl-teal); opacity: .5; }
.pl-quote blockquote { margin: 0; font-size: 17.5px; line-height: 1.6; font-weight: 600; }
.pl-quote figcaption { display: flex; align-items: center; gap: 12px; }
.pl-quote b { display: block; font-size: 14.5px; }
.pl-quote small { font-size: 13px; color: var(--pl-muted); }
.pl-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--pl-ink); color: var(--pl-cream); display: flex; align-items: center; justify-content: center; font-weight: 800; }
.pl-icon { display: flex; width: 42px; height: 42px; border-radius: 12px; background: rgba(31,184,166,.16); align-items: center; justify-content: center; margin-bottom: 16px; }
.pl-faq { max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.pl-faqitem { background: #fff; border: 1px solid var(--pl-line); border-radius: 18px; overflow: hidden; box-shadow: var(--pl-shadow); transition: border-color .2s ease; }
.pl-white .pl-faqitem { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-faqitem.open { border-color: rgba(31,184,166,.5); }
.pl-faqitem button { width: 100%; text-align: left; background: none; border: 0; cursor: pointer; padding: 20px 22px; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 16px; font-weight: 700; color: var(--pl-ink); }
.pl-faqitem button span { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; background: rgba(31,184,166,.16); color: var(--pl-teal-d); transition: transform .2s ease; }
.pl-faqitem.open button span { transform: rotate(45deg); }
.pl-faqitem p { margin: 0; padding: 0 22px 22px; font-size: 15px; line-height: 1.7; color: var(--pl-muted); }

/* final CTA + footer */
.pl-final { position: relative; overflow: hidden; text-align: center; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); color: var(--pl-cream); border-radius: 40px; padding: 84px 32px; box-shadow: var(--pl-shadow-lg); }
.pl-final h2 { font-size: clamp(30px, 4.4vw, 48px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 0; }
.pl-final p { font-size: 18px; color: #B7CCC8; max-width: 520px; margin: 18px auto 0; line-height: 1.6; }
.pl-footer { background: var(--pl-ink); color: var(--pl-cream); }
.pl-footgrid { display: grid; grid-template-columns: 1.6fr repeat(3, 1fr); gap: 40px; padding: 64px 0 44px; }
.pl-wordmark { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 10px; }
.pl-footnote { font-size: 14.5px; color: var(--pl-muted-d); line-height: 1.6; max-width: 280px; margin: 0; }
.pl-footer h4 { font-size: 14px; font-weight: 800; margin: 0 0 14px; color: var(--pl-cream); }
.pl-footer a { display: block; color: var(--pl-muted-d); font-size: 14.5px; text-decoration: none; padding: 5px 0; }
.pl-footer a:hover { color: var(--pl-cream); }
.pl-footbottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 24px 0 36px; border-top: 1px solid rgba(255,255,255,.1); font-size: 13px; color: var(--pl-muted-d); }

/* responsive */
@media (max-width: 1000px) {
  .pl-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .pl-timeline::before { display: none; }
  .pl-step { margin-top: 20px; }
  .pl-navlinks, .pl-navright { display: none; }
  .pl-burger { display: flex; }
  .pl-mobile { display: flex; }
  .pl-nav { margin: 12px 16px 0; padding: 7px 8px 7px 14px; }
}
@media (max-width: 800px) {
  .pl-sec { padding: 76px 0; }
  .pl-hero { padding: 128px 0 132px; }
  .pl-herogrid, .pl-split, .pl-case { grid-template-columns: 1fr; }
  .pl-split { gap: 48px; }
  .pl-grid-3, .pl-stats { grid-template-columns: 1fr; }
  .pl-herovisual { order: -1; max-width: 300px; margin: 0 auto; }
  .pl-ba { grid-template-columns: 1fr; }
  .pl-ba-arrow { transform: rotate(90deg); margin: 0 auto; }
  .pl-case { padding: 40px 26px; }
  .pl-card.pl-plan.hi { transform: none; }
  .pl-footgrid { grid-template-columns: 1fr 1fr; }
  .pl-sheet { border-radius: 32px 32px 0 0; }
}
@media (max-width: 520px) {
  .pl-grid-4, .pl-casestats { grid-template-columns: 1fr; }
  .pl-toggle { flex-direction: column; border-radius: 18px; width: 100%; }
  .pl-btn-lg { width: 100%; }
  .pl-float-a { left: -8px; } .pl-float-b { right: -8px; }
  .pl-final { padding: 56px 22px; border-radius: 30px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-track, .pl-pearl { animation: none; }
  .pl-btn, .pl-proj { transition: none; }
}
/* ---- v3 additions ---- */
.pl-grad { background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-float-b { bottom: 110px; right: -10px; }
.pl-mission { position: absolute; left: -14px; bottom: -12px; width: 240px; padding: 14px 16px; border-radius: 18px; background: rgba(255,255,255,.97); color: var(--pl-ink); box-shadow: 0 18px 40px rgba(0,0,0,.3); }
.pl-mission small { display: block; font-size: 11.5px; font-weight: 700; color: var(--pl-teal-d); margin-bottom: 2px; }
.pl-mission b { display: block; font-size: 15px; margin-bottom: 10px; }
.pl-mission .meta { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--pl-muted); margin-bottom: 7px; }
.pl-mbar { height: 7px; border-radius: 6px; background: #E4E9E7; overflow: hidden; }
.pl-mbar div { height: 100%; width: 60%; border-radius: 6px; background: var(--pl-teal); }

/* proof panel */
.pl-proof { margin-top: 56px; background: #fff; border-radius: 32px; padding: 46px 40px 32px; box-shadow: var(--pl-shadow-lg); }
.pl-proofhead { text-align: center; margin-bottom: 38px; }
.pl-proofhead h3 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.pl-proofhead p { margin: 6px 0 0; font-size: 15px; color: var(--pl-muted); }
.pl-proof .pl-stats { margin: 0; gap: 0; }
.pl-proof .pl-stat { background: none; box-shadow: none; border-radius: 0; padding: 4px 32px; text-align: left; display: flex; flex-direction: column; }
.pl-proof .pl-stat + .pl-stat { border-left: 1px solid var(--pl-line); }
.pl-statico { width: 48px; height: 48px; border-radius: 15px; background: rgba(31,184,166,.14); color: var(--pl-teal-d); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
.pl-statnum { font-size: clamp(42px, 5vw, 62px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: var(--pl-ink); font-variant-numeric: tabular-nums; }
.pl-statlabel { display: block; margin-top: 10px; font-size: 16.5px; font-weight: 800; }
.pl-stat p { margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--pl-muted); }
.pl-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 36px; padding-top: 26px; border-top: 1px solid var(--pl-line); }
.pl-chip { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; padding: 8px 15px; border-radius: 999px; background: var(--pl-cream); }
.pl-chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--pl-teal); }

/* path: interactive stages */
.pl-path { max-width: 980px; margin: 0 auto; }
.pl-pathtabs { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); margin-bottom: 40px; }
.pl-pathtabs::before { content: ''; position: absolute; top: 27px; left: 12.5%; right: 12.5%; height: 3px; border-radius: 2px; background: #D5E3E0; }
.pl-pathtab { position: relative; background: none; border: 0; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 0; color: var(--pl-muted); font-size: 15.5px; font-weight: 700; }
.pl-pathnode { position: relative; z-index: 1; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800; background: #fff; color: var(--pl-muted); border: 3px solid #D5E3E0; transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease; }
.pl-pathtab:hover .pl-pathnode { border-color: var(--c); }
.pl-pathtab.done .pl-pathnode, .pl-pathtab.on .pl-pathnode { background: var(--c); border-color: var(--c); color: var(--fg); }
.pl-pathtab.on .pl-pathnode { transform: scale(1.12); box-shadow: 0 0 0 7px color-mix(in srgb, var(--c) 22%, transparent); }
.pl-pathtab.on .pl-pathname { color: var(--pl-ink); }
.pl-panel { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; background: #fff; border-radius: 34px; padding: 14px; box-shadow: var(--pl-shadow-lg); animation: pl-in .35s ease; }
.pl-white .pl-panel { background: var(--pl-cream); box-shadow: none; }
.pl-panelcopy { padding: 34px 30px 30px 34px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.pl-panelcopy h3 { font-size: clamp(36px, 5vw, 54px); font-weight: 800; letter-spacing: -0.035em; line-height: 1; margin: 0 0 16px; }
.pl-panelsub { font-size: 17.5px; line-height: 1.65; color: var(--pl-muted); margin: 0 0 28px; }
.pl-panelvis { position: relative; overflow: hidden; border-radius: 24px; background: var(--c); color: var(--fg); padding: 34px 30px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 330px; }
.pl-panelvis::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.22) 1.4px, transparent 1.6px); background-size: 22px 22px; mask-image: linear-gradient(160deg, #000, transparent 70%); -webkit-mask-image: linear-gradient(160deg, #000, transparent 70%); }
.pl-bignum { position: absolute; top: 4px; right: 22px; font-size: 128px; font-weight: 800; line-height: 1; letter-spacing: -0.05em; opacity: .2; }
.pl-skillhead { position: relative; font-size: 13.5px; font-weight: 700; opacity: .8; margin: 0 0 12px; }
.pl-panelvis ul { position: relative; list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.pl-panelvis li { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,.22); font-weight: 700; font-size: 15.5px; }
.pl-panelvis .pl-check { margin: 0; background: rgba(255,255,255,.35); color: inherit; }
@keyframes pl-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* projects on light background */
.pl-proj { border: 0; box-shadow: var(--pl-shadow); }
.pl-proj:hover { box-shadow: var(--pl-shadow-lg); }

/* whatsapp button */
.pl-btn-wa { background: #25D366; color: #06361A; box-shadow: 0 8px 20px rgba(37,211,102,.35); }
.pl-btn-wa:hover { background: #2EE274; }

/* final CTA headline colour: change --pl-final-title to taste */
.pl-final { --pl-final-title: #E9B95F; }
.pl-final h2 { color: var(--pl-final-title); }

@media (max-width: 800px) {
  .pl-proof { padding: 34px 22px 24px; border-radius: 26px; }
  .pl-proof .pl-stats { grid-template-columns: 1fr; gap: 28px; }
  .pl-proof .pl-stat { padding: 0; }
  .pl-proof .pl-stat + .pl-stat { border-left: 0; border-top: 1px solid var(--pl-line); padding-top: 28px; }
  .pl-panel { grid-template-columns: 1fr; }
  .pl-panelcopy { padding: 24px 18px 8px; }
  .pl-bignum { font-size: 92px; }
}
@media (max-width: 520px) {
  .pl-pathname { font-size: 13px; }
  .pl-pathnode { width: 44px; height: 44px; font-size: 16px; }
  .pl-pathtabs::before { top: 22px; }
  .pl-mission { display: none; }
  .pl-float-b { bottom: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-panel { animation: none; }
}
/* ---- v4: proof bento + security ---- */
.pl-proofhead { margin: 44px auto 0; }
.pl-bento { margin-top: 36px; display: grid; grid-template-columns: 1.15fr 1fr; grid-template-rows: auto auto; gap: 20px; }
.pl-bcard { position: relative; overflow: hidden; background: #fff; border: 1px solid var(--pl-line); border-radius: 30px; padding: 32px 30px; box-shadow: var(--pl-shadow); }
.pl-bnum { display: block; font-size: clamp(48px, 6vw, 72px); font-weight: 800; letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums; color: var(--pl-ink); }
.pl-blabel { display: block; margin-top: 12px; font-size: 18px; font-weight: 800; }
.pl-bcard p { margin: 6px 0 0; font-size: 14.5px; line-height: 1.55; color: var(--pl-muted); }
.pl-bcard-main { grid-row: span 2; display: flex; flex-direction: column; justify-content: space-between; min-height: 400px; padding: 42px 38px; border: 0; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-bcard-main::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.1) 1.4px, transparent 1.6px); background-size: 24px 24px; mask-image: radial-gradient(ellipse at 80% 20%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 80% 20%, #000, transparent 70%); }
.pl-bcard-main::after { content: ''; position: absolute; width: 420px; height: 420px; right: -140px; top: -160px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.35), transparent 65%); }
.pl-bcard-main .pl-bnum { font-size: clamp(76px, 11vw, 132px); background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-bcard-main p { color: #B7CCC8; max-width: 300px; }
.pl-ages { position: relative; z-index: 1; margin-top: 36px; }
.pl-ages small { display: block; font-size: 13px; font-weight: 700; color: #B7CCC8; margin-bottom: 12px; }
.pl-agetrack { height: 10px; border-radius: 6px; background: linear-gradient(90deg, #FF6B57, #D4A24C, #1FB8A6); }
.pl-agelabels { display: flex; justify-content: space-between; margin-top: 10px; font-size: 13px; font-weight: 800; color: var(--pl-cream); }
.pl-stagechips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.pl-stagechips span { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px; background: var(--pl-cream); }
.pl-stagechips i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.pl-logostack { display: flex; margin-top: 22px; }
.pl-logostack span { width: 46px; height: 46px; padding: 8px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--pl-line); margin-left: -10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pl-logostack span:first-child { margin-left: 0; }
.pl-logostack .more { background: var(--pl-ink); color: var(--pl-cream); font-size: 12.5px; font-weight: 800; padding: 0; box-shadow: 0 0 0 2px #fff; }

.pl-secwrap { display: grid; grid-template-columns: 5fr 7fr; gap: 24px; align-items: stretch; }
.pl-seccard { position: relative; overflow: hidden; display: flex; flex-direction: column; border-radius: 32px; padding: 44px 38px; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-seccard::after { content: ''; position: absolute; width: 380px; height: 380px; right: -140px; top: -140px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.32), transparent 65%); }
.pl-seccard > * { position: relative; z-index: 1; }
.pl-shield { width: 68px; height: 68px; border-radius: 22px; display: flex; align-items: center; justify-content: center; color: var(--pl-teal); background: rgba(31,184,166,.16); border: 1px solid rgba(31,184,166,.4); margin-bottom: 28px; }
.pl-seccard h2 { font-size: clamp(28px, 3.4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 14px; }
.pl-seccard > p { font-size: 16.5px; line-height: 1.6; color: #B7CCC8; margin: 0 0 26px; }
.pl-seccard ul { list-style: none; padding: 0; margin: 0 0 34px; display: flex; flex-direction: column; gap: 14px; font-size: 15px; font-weight: 700; }
.pl-seccard li { display: flex; align-items: center; gap: 12px; }
.pl-seccard li .pl-check { margin: 0; }
.pl-seccard .pl-btn { margin-top: auto; align-self: flex-start; }
.pl-secgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.pl-seccell { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--pl-line); border-radius: 26px; padding: 28px 24px; box-shadow: var(--pl-shadow); transition: transform .2s ease, box-shadow .2s ease; }
.pl-seccell:hover { transform: translateY(-4px); box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-seccell { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-secico { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); margin-bottom: 20px; }
.pl-seccell small { font-size: 12.5px; font-weight: 700; color: var(--pl-muted); margin-bottom: 6px; }
.pl-seccell h3 { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 8px; }
.pl-seccell p { font-size: 14.5px; line-height: 1.6; color: var(--pl-muted); margin: 0; }

@media (max-width: 1000px) {
  .pl-secwrap { grid-template-columns: 1fr; }
}
@media (max-width: 800px) {
  .pl-bento { grid-template-columns: 1fr; }
  .pl-bcard-main { grid-row: auto; min-height: 340px; padding: 34px 26px; }
  .pl-seccard { padding: 36px 26px; }
}
@media (max-width: 520px) {
  .pl-secgrid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-seccell { transition: none; }
}
/* ---- v5: compact proof ---- */
.pl-sheet { padding-bottom: 72px; }
.pl-proofhead { margin-top: 32px; }
.pl-proofhead h3 { font-size: 22px; }
.pl-bento { margin-top: 24px; gap: 14px; }
.pl-bcard { padding: 22px 24px; border-radius: 24px; }
.pl-bnum { font-size: clamp(36px, 4.4vw, 50px); }
.pl-blabel { margin-top: 8px; font-size: 16px; }
.pl-bcard p { font-size: 13.5px; }
.pl-bcard-main { min-height: 0; padding: 28px 28px; }
.pl-bcard-main .pl-bnum { font-size: clamp(56px, 8vw, 88px); }
.pl-ages { margin-top: 22px; }
.pl-ages small { margin-bottom: 8px; font-size: 12.5px; }
.pl-agetrack { height: 8px; }
.pl-agelabels { margin-top: 8px; font-size: 12.5px; }
.pl-logostack { margin-top: 14px; }
.pl-logostack span { width: 40px; height: 40px; padding: 7px; }
.pl-chips { margin-top: 24px; padding-top: 0; border-top: 0; }
@media (max-width: 800px) {
  .pl-bcard-main { min-height: 0; padding: 26px 22px; }
}
/* ---- v6: slim proof strip ---- */
.pl-sheet { padding-bottom: 56px; }
.pl-strip { margin-top: 26px; display: grid; grid-template-columns: repeat(3, 1fr); border-radius: 22px; overflow: hidden; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-sitem { display: flex; align-items: center; gap: 14px; padding: 18px 24px; min-width: 0; }
.pl-sitem + .pl-sitem { border-left: 1px solid rgba(255,255,255,.1); }
.pl-snum { font-size: clamp(30px, 3.4vw, 40px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.pl-snum-grad { background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-slab b { display: block; font-size: 14.5px; font-weight: 800; }
.pl-slab small { display: block; margin-top: 2px; font-size: 12.5px; color: var(--pl-muted-d); }
.pl-strip .pl-logostack { margin: 0 0 0 auto; }
.pl-strip .pl-logostack span { width: 32px; height: 32px; padding: 5px; margin-left: -8px; }
.pl-strip .pl-logostack span:first-child { margin-left: 0; }
.pl-strip .pl-logostack .more { background: var(--pl-teal); color: var(--pl-ink); font-size: 11.5px; padding: 0; }
.pl-chips { margin-top: 18px; gap: 8px; }
.pl-chip { font-size: 12.5px; padding: 6px 12px; }
@media (max-width: 800px) {
  .pl-strip { grid-template-columns: 1fr; }
  .pl-sitem + .pl-sitem { border-left: 0; border-top: 1px solid rgba(255,255,255,.1); }
}
/* ---- v7: rollout steps + light security card ---- */
.pl-roll { list-style: none; padding: 0; margin: 0 auto; max-width: 980px; position: relative; display: flex; flex-direction: column; gap: 30px; }
.pl-roll::before { content: ''; position: absolute; top: 28px; bottom: 28px; left: 50%; width: 3px; transform: translateX(-50%); background: repeating-linear-gradient(180deg, #BFD6D1 0 8px, transparent 8px 16px); }
.pl-rstep { position: relative; display: grid; grid-template-columns: 1fr 64px 1fr; align-items: center; }
.pl-rtext { order: 1; padding: 8px 14px 8px 0; }
.pl-rnode { order: 2; justify-self: center; position: relative; z-index: 1; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800; background: var(--pl-ink); color: var(--pl-cream); box-shadow: 0 0 0 7px var(--pl-cream), 0 10px 20px rgba(13,43,50,.2); }
.pl-white .pl-rnode { box-shadow: 0 0 0 7px #fff, 0 10px 20px rgba(13,43,50,.2); }
.pl-rprev { order: 3; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); color: var(--pl-cream); border-radius: 24px; padding: 22px 24px; box-shadow: var(--pl-shadow-lg); }
.pl-rstep:nth-child(even) .pl-rtext { order: 3; padding: 8px 0 8px 14px; }
.pl-rstep:nth-child(even) .pl-rprev { order: 1; }
.pl-rchip { display: inline-block; font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; margin-bottom: 12px; background: rgba(31,184,166,.16); color: var(--pl-teal-d); }
.pl-rtext h3 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px; }
.pl-rtext p { font-size: 16px; line-height: 1.65; color: var(--pl-muted); margin: 0; max-width: 400px; }
.pl-rprev h4 { font-size: 15px; font-weight: 800; margin: 0 0 16px; }
.pl-rprev .pl-bar + .pl-bar { margin-top: 14px; }
.pl-cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 12px; }
.pl-cal span { aspect-ratio: 1; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: rgba(255,255,255,.08); color: #B7CCC8; }
.pl-cal span.on { background: var(--pl-teal); color: var(--pl-ink); }
.pl-mrow { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-top: 1px solid rgba(255,255,255,.1); font-size: 13.5px; font-weight: 600; color: #C9D8D5; }
.pl-mrow .ok { color: var(--pl-teal); font-weight: 800; }
@media (max-width: 800px) {
  .pl-roll::before { left: 27px; transform: none; }
  .pl-rstep { grid-template-columns: 54px 1fr; column-gap: 18px; align-items: start; }
  .pl-rnode { grid-column: 1; grid-row: 1; }
  .pl-rtext, .pl-rstep:nth-child(even) .pl-rtext { grid-column: 2; grid-row: 1; padding: 4px 0 0; }
  .pl-rprev, .pl-rstep:nth-child(even) .pl-rprev { grid-column: 2; grid-row: 2; margin-top: 16px; }
}

.pl-seccard { color: var(--pl-ink); background: linear-gradient(160deg, #E8F6F3, #F6F3EA); border: 1px solid rgba(31,184,166,.28); box-shadow: var(--pl-shadow); }
.pl-seccard::after { background: radial-gradient(circle, rgba(31,184,166,.2), transparent 65%); }
.pl-shield { color: var(--pl-teal-d); background: #fff; border: 1px solid rgba(31,184,166,.35); box-shadow: 0 8px 20px rgba(31,184,166,.18); }
.pl-seccard > p { color: var(--pl-muted); }
/* ---- v8: rollout as one clean four-column card ---- */
.pl-flow { max-width: 1040px; margin: 0 auto; overflow: hidden; border-radius: 30px; background: #fff; box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-flow { background: var(--pl-cream); box-shadow: none; }
.pl-flowgrid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); }
.pl-fstep { display: flex; flex-direction: column; }
.pl-fbar { height: 6px; background: var(--c); }
.pl-fbody { display: flex; flex-direction: column; flex: 1; padding: 28px 24px 26px; }
.pl-fstep + .pl-fstep .pl-fbody { border-left: 1px solid var(--pl-line); }
.pl-white .pl-fstep + .pl-fstep .pl-fbody { border-left-color: rgba(13,43,50,.1); }
.pl-fnum { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 17px; font-weight: 800; color: var(--pl-ink); background: color-mix(in srgb, var(--c) 18%, transparent); }
.pl-fbody h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 10px; }
.pl-fbody p { flex: 1; font-size: 14.5px; line-height: 1.65; color: var(--pl-muted); margin: 0; }
.pl-fchip { align-self: flex-start; margin-top: 22px; font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; color: var(--pl-ink); background: color-mix(in srgb, var(--c) 18%, transparent); }
.pl-flowfoot { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 18px 28px; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); }
.pl-flowfoot p { margin: 0; font-size: 15px; font-weight: 600; }
@media (max-width: 1000px) {
  .pl-flowgrid { grid-template-columns: 1fr 1fr; }
  .pl-fstep:nth-child(3) .pl-fbody { border-left: 0; }
}
@media (max-width: 560px) {
  .pl-flowgrid { grid-template-columns: 1fr; }
  .pl-fstep + .pl-fstep .pl-fbody { border-left: 0; }
}
/* ---- v9: founder + footer entity ---- */
.pl-who { display: grid; grid-template-columns: 5fr 7fr; gap: 44px; align-items: center; background: #fff; border-radius: 36px; padding: 16px; box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-who { background: var(--pl-cream); box-shadow: none; }
.pl-whophoto { position: relative; overflow: hidden; border-radius: 26px; aspect-ratio: 4 / 4.4; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); }
.pl-whophoto::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.12) 1.4px, transparent 1.6px); background-size: 24px 24px; mask-image: radial-gradient(ellipse at 70% 20%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 20%, #000, transparent 70%); }
.pl-whophoto::after { content: ''; position: absolute; width: 360px; height: 360px; right: -120px; top: -120px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.35), transparent 65%); }
.pl-initials { position: relative; z-index: 1; font-size: clamp(84px, 12vw, 150px); font-weight: 800; letter-spacing: -0.05em; background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-whobadge { position: absolute; z-index: 2; left: 18px; bottom: 18px; font-size: 13px; font-weight: 800; padding: 8px 15px; border-radius: 999px; background: rgba(255,255,255,.96); color: var(--pl-ink); }
.pl-whocopy { padding: 16px 30px 16px 0; }
.pl-whocopy .pl-h2 { font-size: clamp(32px, 4.4vw, 48px); }
.pl-frole { margin: 10px 0 0; font-size: 16px; font-weight: 700; color: var(--pl-teal-d); }
.pl-whocopy .pl-sub { max-width: 540px; }
.pl-whochips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.pl-whochips .pl-chip { background: rgba(31,184,166,.14); }
@media (max-width: 800px) {
  .pl-who { grid-template-columns: 1fr; gap: 8px; }
  .pl-whophoto { aspect-ratio: 16 / 10; }
  .pl-whocopy { padding: 20px 14px 18px; }
}
.pl-entity { display: flex; gap: 10px; align-items: flex-start; margin: 22px 0 0; max-width: 320px; font-size: 13px; line-height: 1.5; color: var(--pl-muted-d); }
.pl-entity svg { flex-shrink: 0; margin-top: 2px; color: var(--pl-teal); }
.pl-entity b { display: block; font-size: 14px; color: var(--pl-cream); }
/* ---- v10: richer founder block ---- */
.pl-who { align-items: stretch; }
.pl-whophoto { aspect-ratio: auto; min-height: 460px; }
.pl-whocopy { padding: 22px 30px 22px 0; }
.pl-hl { list-style: none; padding: 0; margin: 24px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pl-hl li { display: flex; flex-direction: column; gap: 2px; padding: 14px 16px; border: 1px solid rgba(13,43,50,.1); border-radius: 16px; }
.pl-hl b { font-size: 15px; font-weight: 800; }
.pl-hl span { font-size: 13px; color: var(--pl-muted); }
.pl-learnlabel { margin: 22px 0 10px; font-size: 13px; font-weight: 700; color: var(--pl-muted); }
.pl-learnlabel + .pl-whochips { margin-top: 0; }
@media (max-width: 800px) {
  .pl-whophoto { min-height: 240px; aspect-ratio: auto; }
  .pl-whocopy { padding: 20px 14px 18px; }
}
@media (max-width: 520px) {
  .pl-hl { grid-template-columns: 1fr; }
}
`