// File: HomeClient.tsx
// Placement: components/HomeClient.tsx
//
// This is the full interactive homepage — everything that used to live
// directly in app/page.tsx. It's now a Client Component imported by a
// thin Server Component app/page.tsx, so that page.tsx can also render
// <CountryBanner /> (a Server Component using cookies()) as a sibling.
// A Client Component can't import a Server Component that uses
// server-only APIs directly — this split is what makes both work
// together correctly.
//
// 'use client' because the mobile nav menu and audience toggle need
// local state.
//
// CURRENT STATE (accurate as of this version):
// - B2B (schools/institutions) and B2C (families) are both first-class,
//   switched via the `audience` toggle. Pricing was NOT removed — both
//   audiences need it (Family plan card vs. School/Training packages),
//   so the nav/footer link stays, just relabeled per audience ("Pricing"
//   vs "Packages") since it's the same #plans anchor pointing at whichever
//   plan block is currently mounted.
// - Hero mascot is /avatars/heroplulai.png (not marjanthecamel.svg — an
//   earlier note in this file claimed that swap happened; it hadn't. If
//   you do want the camel mascot swapped in, drop the asset in /public
//   and swap the <Image src> in the hero — left as-is here since the
//   referenced asset isn't in the repo.)
//
// THIS PASS — UI/UX fixes:
// 1. Palette drift: all one-off hexes replaced with tokens from the actual
//    brand system (Depth/Reef/Pearl Gold/Coral/Pearl White/Ink for the
//    investor+school "Depth" mode; Lagoon/Reef Bright/Sun Gold for the
//    "Energetic" B2C mode). Supporting neutrals are now derived as
//    opacity variants of Ink/Pearl White instead of arbitrary grays.
// 2. Depth vs. Energetic mode is now actually applied: the emotional
//    "before/after" section (both audiences see it) switches from the
//    dark Depth investor-deck look to a light Lagoon/Reef-Bright/Sun-Gold
//    look for Families, so the two audiences don't feel visually identical.
// 3. "Stuck" student flag now uses Coral instead of Pearl Gold, so an
//    at-risk state no longer shares a color with a positive streak badge.
// 4. Fixed duplicate React key: two partners were both named "Partner 10".
// 5. Testimonials are now filtered by audience, like the FAQ already was.
// 6. Dashboard mocks are now explicitly labeled "Sample data" so nobody
//    mistakes the marketing mock for a live account.
// 7. Case study is more clearly flagged as an illustrative placeholder.
// 8. Added a French footer link (site already promises French content).
// 9. Fixed invalid <a><button></button></a> nesting site-wide — CTAs are
//    now single elements (an <a> styled with the button classes).
// 10. Audience toggle is now a real ARIA tabs pattern: aria-controls,
//     roving tabindex, and Left/Right arrow key switching.
// 11. Burger menu has aria-controls pointing at the mobile panel, plus a
//     backdrop and Escape-to-close.
// 12. Audience choice is now reflected in the URL (?audience=schools) so
//     it's linkable/shareable/back-button-able, and is read back on load.
// 13. "How it works" step walkthrough now has explicit Prev/Next controls
//     and a visible step indicator, not just tappable (and easy-to-miss)
//     tabs. It also has its own id and a faint Lagoon tint so it reads as
//     a distinct block from the Tracks section below it.
// 14. Alumni project marquee now has a Play/Pause control and manual
//     Prev/Next scroll buttons — no more content that only touch users
//     can't pause.
// 15. Reduced CTA repetition: "Book a demo" no longer appears with
//     identical copy four times before any new information is given.
// 16. Standardized CTA hierarchy: primary action is always `btn-cta`,
//     secondary is always `btn-outline` (dropped the inconsistent mix
//     with `btn-dark`).
// 17. Stats moved up next to Partners (both are "trusted at scale" proof)
//     instead of repeating that idea again lower on the page.
// 18. Packages section now gives schools a rough seat-count anchor instead
//     of only "book a demo for a quote".
// 19. FAQ now sorts audience-specific questions before shared ones within
//     each audience view, and resets to the first (most relevant) question
//     open whenever the audience is switched — instead of defaulting to
//     whatever happened to be first in the source array.
// (Local currency/regional pricing was flagged too but is out of scope
// for this pass.)

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from '@/app/page.module.css' // moved from './page.module.css' — this file now lives in components/, not app/
import Image from 'next/image'

// ---- Brand tokens (single source of truth — swap in the design system's
// actual export if one exists; kept local here since no CSS variables
// file was provided alongside this component) ----
const palette = {
  depth: '#0D2B32',
  reef: '#1FB8A6',
  reefBright: '#17D9C0',
  pearlGold: '#D4A24C',
  sunGold: '#FFB930',
  coral: '#FF6B57',
  pearlWhite: '#F6F3EA',
  ink: '#29394A',
  lagoon: '#EAF7F4',
  lagoonFill: '#D9F1EC',
}

// Neutrals derived from the brand tokens instead of arbitrary grays.
const neutral = {
  inkFaint: 'rgba(41,57,74,0.55)',
  inkMuted: 'rgba(41,57,74,0.7)',
  inkBorder: 'rgba(41,57,74,0.12)',
  pearlFaint: 'rgba(246,243,234,0.55)',
  pearlMuted: 'rgba(246,243,234,0.7)',
}

const partners = [
  { name: 'Partner 1', file: 'p1.png' },
  { name: 'Partner 2', file: 'p2.png' },
  { name: 'Partner 3', file: 'p3.png' },
  { name: 'Partner 4', file: 'p4.png' },
  { name: 'Partner 5', file: 'p5.png' },
  { name: 'Partner 6', file: 'p6.png' },
  { name: 'Partner 7', file: 'p7.png' },
  { name: 'Partner 8', file: 'p8.png' },
  { name: 'Partner 9', file: 'p9.png' },
  { name: 'Partner 10', file: 'p10.png' },
  { name: 'Partner 11', file: 'p11.png' }, // was duplicated as "Partner 10" — broke the React key
]

const projects = [
  { file: '1.png', title: 'Watch With Friends', track: 'Coding', tagColor: 'reef', student: 'Sarah, age 15' },
  { file: '2.png', title: 'Escape Game', track: 'Game', tagColor: 'reef', student: 'Kmar, age 15' },
  { file: '3.png', title: 'country quizz', track: 'Game', tagColor: 'reef', student: 'Farah, age 15' },
  { file: '4.png', title: 'Guess The Flag', track: 'Game', tagColor: 'reef', student: 'Mariam, age 12' },
  { file: '5.png', title: 'Prescription reader', track: 'AI', tagColor: 'gold', student: 'Youssef, age 15' },
  { file: '6.png', title: 'Event Management', track: 'Coding', tagColor: 'reef', student: 'Kmar , age 14' },
  { file: '7.png', title: 'Sudoku', track: 'Game', tagColor: 'reef', student: 'Kamar, age 15' },
  { file: '8.png', title: 'AI doctor', track: 'AI', tagColor: 'gold', student: 'Yassine, age 11' },
  { file: '10.png', title: 'Coloring Game', track: 'Game', tagColor: 'reef', student: 'Kamar, age 15' },
  { file: '11.png', title: 'Geological Assistant', track: 'AI', tagColor: 'gold', student: 'Ahmed, age 13' },
  { file: '12.png', title: 'Game', track: 'Game', tagColor: 'reef', student: 'Abd Arrahman, age 12' },
  { file: '13.png', title: 'Maze Game', track: 'Game', tagColor: 'reef', student: 'Serah , age 14' },
  { file: '14.png', title: 'AI For Meditation', track: 'AI', tagColor: 'gold', student: 'Yahya, age 12' },
  { file: '15.png', title: 'Football Game', track: 'Coding', tagColor: 'reef', student: 'Othman, age 10' },
  { file: '17.png', title: 'AI DIY', track: 'AI', tagColor: 'gold', student: '' },
  { file: '18.png', title: 'Sequences Game', track: 'Game', tagColor: 'reef', student: 'Mariam, age 14' },
  { file: '19.png', title: 'Flag Quest', track: 'Coding', tagColor: 'reef', student: 'Farah, age 15' },
]

const testimonials = [
  {
    quote: "My 9-year-old asks to do his lesson after school. I never thought I'd see that with coding.",
    name: 'Layla M.',
    role: 'Parent, Sousse',
    initial: 'L',
    for: 'family',
  },
  {
    quote: 'He built his first working game in two weeks. The AI tutor is more patient than I ever am.',
    name: 'Sara A.',
    role: 'Parent, Sfax',
    initial: 'S',
    for: 'family',
  },
  {
    quote: "The Arabic and French aren't translated — they're native. That alone sets it apart.",
    name: 'Dr. Khalid R.',
    role: 'Principal, Tunis',
    initial: 'D',
    for: 'schools',
  },
  {
    quote: 'The dashboard told us who was falling behind before the first progress report went home.',
    name: 'Nour B.',
    role: 'Head of Curriculum, Monastir',
    initial: 'N',
    for: 'schools',
  },
]

const faqData = [
  {
    q: 'Can my child use Plulai on their own at home?',
    a: "Yes — the Family plans are built for exactly that. Lessons are self-paced and the AI tutor adapts to your child, so no classroom or teacher is required.",
    for: 'family',
  },
  {
    q: 'Is there a plan for more than one child?',
    a: 'Yes — the Family plan covers up to 3 children on one subscription, with separate progress tracking for each child and one shared parent dashboard.',
    for: 'family',
  },
  {
    q: 'Can lessons fit inside a normal class period?',
    a: 'Yes — lessons are paced in 30–45 minute sessions, built to fit inside a standard class period without extra scheduling.',
    for: 'schools',
  },
  {
    q: 'How long does onboarding take for schools?',
    a: 'Most schools go from demo to a live pilot classroom within a week, and to full rollout within a month. A short teacher training session is included.',
    for: 'schools',
  },
  {
    q: 'How does billing work for institutions?',
    a: "Institution plans are billed per seat count and term length, with flexible invoicing. Book a demo and we'll put together a quote for your school.",
    for: 'schools',
  },
  {
    q: 'Do teachers need a coding background?',
    a: 'No. Teachers get a short onboarding session and the lessons are designed to run themselves — the AI tutor handles most of the one-on-one guidance.',
    for: 'schools',
  },
  {
    q: 'What devices or browsers do we need?',
    a: 'Plulai runs in any modern browser — Chrome, Safari, or Edge — on Chromebooks, laptops, or tablets. No installation required.',
    for: 'common',
  },
  {
    q: 'How is student data handled?',
    a: "We collect only what's needed to run lessons and track progress. Data is never sold or used for advertising.",
    for: 'common',
  },
]

const howItWorksSteps = [
  {
    n: '01', title: 'Book a demo', color: palette.reef,
    desc: 'A 30-minute walkthrough tailored to your grade levels and goals — see the student view, the teacher view, and the admin dashboard.',
  },
  {
    n: '02', title: 'Pilot one classroom', color: palette.pearlGold,
    desc: 'Run a free pilot with a single class before committing school-wide — full access, no cost, no pressure to continue.',
  },
  {
    n: '03', title: 'Train your teachers', color: palette.depth,
    desc: 'A short onboarding session — no coding background required. Teachers leave knowing the platform and the dashboard cold.',
  },
  {
    n: '04', title: 'Roll out school-wide', color: palette.reefBright,
    desc: "Scale to the full grade or school, with a dashboard for admins that flags who's stuck before report cards do.",
  },
]

// Small "SAMPLE DATA" tag for mock dashboard previews so nobody mistakes
// marketing mockups for a real account.
function SampleDataBadge() {
  return (
    <span
      style={{
        position: 'absolute', top: 14, right: 16, fontSize: 9.5, fontWeight: 700,
        letterSpacing: 0.6, textTransform: 'uppercase', color: neutral.pearlFaint,
      }}
    >
      Sample data
    </span>
  )
}

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeStep, setActiveStep] = useState(0)
  const [audience, setAudience] = useState<'family' | 'schools'>('family')
  const [marqueePlaying, setMarqueePlaying] = useState(true)

  const familyTabRef = useRef<HTMLButtonElement>(null)
  const schoolsTabRef = useRef<HTMLButtonElement>(null)
  const marqueeWrapRef = useRef<HTMLDivElement>(null)

  const energetic = audience === 'family' // drives Depth vs. Energetic mode
  const mode = energetic
    ? { accent: palette.reefBright, accent2: palette.sunGold }
    : { accent: palette.reef, accent2: palette.pearlGold }

  // --- Deep-linking: read ?audience= on load, write it back on change ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const a = params.get('audience')
    if (a === 'schools' || a === 'family') setAudience(a)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('audience', audience)
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }, [audience])

  // --- FAQ: audience-specific questions first, reset to the top question
  // whenever audience changes so the "default open" one is always relevant ---
  const visibleFaq = faqData
    .filter((item) => item.for === 'common' || item.for === audience)
    .sort((a, b) => (a.for === 'common' ? 1 : 0) - (b.for === 'common' ? 1 : 0))

  useEffect(() => {
    setOpenFaq(0)
  }, [audience])

  const visibleTestimonials = testimonials.filter((t) => t.for === audience)

  // --- Mobile nav: Escape to close ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // --- Audience tabs: Left/Right arrow key switching, roving focus ---
  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = audience === 'family' ? 'schools' : 'family'
    setAudience(next)
    requestAnimationFrame(() => {
      (next === 'family' ? familyTabRef : schoolsTabRef).current?.focus()
    })
  }, [audience])

  const scrollMarquee = (dir: 1 | -1) => {
    marqueeWrapRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <>
      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navRow}>
            <a href="/" aria-label="Plulai home" style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="/logo.png"
                alt="Plulai"
                width={132}
                height={36}
                priority
                style={{ height: 'auto', width: 'auto', maxHeight: 36 }}
              />
            </a>

            <div className={styles.navLinks} style={{ color: palette.depth }}>
              <a href="#tracks" style={{ color: palette.depth }}>Tracks</a>
              <a href="#audience" onClick={() => setAudience('family')} style={{ color: audience === 'family' ? palette.reef : palette.depth }}>For Families</a>
              <a href="#audience" onClick={() => setAudience('schools')} style={{ color: audience === 'schools' ? palette.reef : palette.depth }}>For Schools</a>
              <a href="#plans" style={{ color: palette.depth }}>{audience === 'family' ? 'Pricing' : 'Packages'}</a>
            </div>

            <div className={styles.navRight}>
              <a href="/auth/login" style={{ color: palette.depth }}>Log in</a>
              <a href="#audience" className="btn btn-cta">{audience === 'family' ? 'Start free trial' : 'Book a demo'} &rarr;</a>
            </div>

            <button
              type="button"
              className={styles.burger}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
              aria-controls="mobile-nav-panel"
              onClick={() => setNavOpen((v) => !v)}
            >
              <span className={navOpen ? styles.burgerTopOpen : ''} />
              <span className={navOpen ? styles.burgerMidOpen : ''} />
              <span className={navOpen ? styles.burgerBotOpen : ''} />
            </button>
          </div>

          {navOpen && (
            <div
              onClick={() => setNavOpen(false)}
              aria-hidden
              style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,50,0.35)', zIndex: 30 }}
            />
          )}

          <div
            id="mobile-nav-panel"
            className={`${styles.mobilePanel} ${navOpen ? styles.mobilePanelOpen : ''}`}
            style={{ position: 'relative', zIndex: 31 }}
          >
            <a href="#tracks" onClick={() => setNavOpen(false)} style={{ color: palette.depth }}>Tracks</a>
            <a href="#audience" onClick={() => { setAudience('family'); setNavOpen(false) }} style={{ color: audience === 'family' ? palette.reef : palette.depth }}>For Families</a>
            <a href="#audience" onClick={() => { setAudience('schools'); setNavOpen(false) }} style={{ color: audience === 'schools' ? palette.reef : palette.depth }}>For Schools</a>
            <a href="#plans" onClick={() => setNavOpen(false)} style={{ color: palette.depth }}>{audience === 'family' ? 'Pricing' : 'Packages'}</a>
            <div className={styles.mobilePanelDivider} />
            <a href="/auth/login" onClick={() => setNavOpen(false)} style={{ color: palette.depth }}>Log in</a>
            <a href="#audience" onClick={() => setNavOpen(false)} className="btn btn-cta btn-block">
              {audience === 'family' ? 'Start free trial' : 'Book a demo'} &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div className={styles.hero}>
        <span aria-hidden className={styles.heroWatermark}>/</span>
        <div className="container">
          <div className={styles.heroGrid}>
            <div>
              <style>{`
                @media (max-width: 480px) {
                  .audience-toggle { flex-direction: column !important; border-radius: 14px !important; width: 100%; }
                  .audience-toggle button { width: 100%; text-align: center; }
                }
              `}</style>
              {/* Audience toggle — the rest of the page follows this choice.
                  This is the single most consequential control on the page,
                  so it also gets a short line under it saying so. */}
              <div
                role="tablist"
                aria-label="Choose your audience — this changes the whole page below"
                className="audience-toggle"
                onKeyDown={handleTabKeyDown}
                style={{
                  display: 'inline-flex', flexWrap: 'wrap', background: neutral.inkBorder, borderRadius: 999,
                  padding: 4, marginBottom: 10, gap: 2, maxWidth: '100%',
                }}
              >
                <button
                  ref={familyTabRef}
                  type="button"
                  role="tab"
                  id="tab-family"
                  aria-selected={audience === 'family'}
                  aria-controls="audience-panel"
                  tabIndex={audience === 'family' ? 0 : -1}
                  onClick={() => setAudience('family')}
                  style={{
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    padding: '9px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700,
                    background: audience === 'family' ? palette.depth : 'transparent',
                    color: audience === 'family' ? palette.pearlWhite : neutral.inkFaint,
                    transition: 'background .15s ease',
                  }}
                >
                  For Families
                </button>
                <button
                  ref={schoolsTabRef}
                  type="button"
                  role="tab"
                  id="tab-schools"
                  aria-selected={audience === 'schools'}
                  aria-controls="audience-panel"
                  tabIndex={audience === 'schools' ? 0 : -1}
                  onClick={() => setAudience('schools')}
                  style={{
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    padding: '9px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700,
                    background: audience === 'schools' ? palette.depth : 'transparent',
                    color: audience === 'schools' ? palette.pearlWhite : neutral.inkFaint,
                    transition: 'background .15s ease',
                  }}
                >
                  For Schools &amp; Training Centers
                </button>
              </div>
              <p style={{ fontSize: 12, color: neutral.inkFaint, margin: '0 0 20px' }}>
                Everything below changes based on this — pick the one that&apos;s you.
              </p>

              <div className={styles.statBadge}>
                <span className={styles.statDot} />
                11+ partners across the MENA region
              </div>

              {audience === 'family' ? (
                <>
                  <h1 className={styles.heroTitle}>
                    Coding, AI &amp; entrepreneurship — learned at their own pace.
                  </h1>
                  <p className={styles.heroSub}>
                    15 minutes a day, taught in real Arabic, French, or English —
                    with an AI coach built around how kids actually learn. No
                    classroom required.
                  </p>
                  <div className={styles.ctaRow}>
                    <a href="/auth/signup" className="btn btn-cta">Start free trial &rarr;</a>
                    <a href="#plans" className="btn btn-outline">See family plans &rarr;</a>
                  </div>
                </>
              ) : (
                <>
                  <h1 className={styles.heroTitle}>
                    A coding, AI &amp; entrepreneurship curriculum your school can run.
                  </h1>
                  <p className={styles.heroSub}>
                    A curriculum built in 30–45 minute class periods, taught in
                    real Arabic, French, or English — with an AI coach built
                    around how kids actually learn, and a dashboard that flags
                    who&apos;s stuck before report cards do.
                  </p>
                  <div className={styles.ctaRow}>
                    <a href="#audience" className="btn btn-cta">Book a demo &rarr;</a>
                    <a href="mailto:hello@plulai.com" className="btn btn-outline">Talk to our team</a>
                  </div>
                </>
              )}
            </div>

            <div className={styles.heroVisual}>
              <Image
                src="/avatars/heroplulai.png"
                alt="Marjan the camel, Plulai's mascot"
                width={336}
                height={336}
                priority
              />

              <div className={styles.floatBadge} style={{ top: 0, left: -10 }}>
                <span className="pearl-dot pearl-dot--md" />
                <div>
                  <div className={styles.floatBadgeTitle}>4-pearl streak</div>
                  <div className={styles.floatBadgeSub}>One more today</div>
                </div>
              </div>

              <div className={styles.floatBadge} style={{ bottom: 20, right: -20 }}>
                <svg width={20} height={20} viewBox="0 0 20 20">
                  <path d="M10 2 L17 7 L17 18 L3 18 L3 7 Z" fill={palette.reef} />
                </svg>
                <div>
                  <div className={styles.floatBadgeTitle}>Level 5 reached</div>
                  <div className={styles.floatBadgeSub}>Faris · Coding</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,30 C240,80 480,0 720,25 C960,50 1200,10 1440,35 L1440,70 L0,70 Z" fill={palette.pearlWhite} />
        </svg>
      </div>

      {/* ================= PARTNERS + STATS (moved together — same "trusted at scale" idea) ================= */}
      <div className={styles.partnersSec}>
        <div className="container">
          <p className={styles.partnersLabel}>USED IN REAL CLASSROOMS AND PROGRAMS</p>
          <div className={styles.partnerRow}>
            {partners.map((partner) => (
              <div key={partner.name} className={styles.partnerTile}>
                <Image
                  src={`/partners/${partner.file}`}
                  alt={partner.name}
                  width={120}
                  height={48}
                  className={styles.partnerLogo}
                />
              </div>
            ))}
          </div>
          <p className={styles.partnersSub}>
            Schools · Scouts programs · Community and training centers
          </p>

          <div className={styles.statsRow} style={{ marginTop: 36 }}>
            <div><div className={styles.statNum}>150+</div><div className={styles.statLabel}>Active learners</div></div>
            <div><div className={styles.statNum}>500+</div><div className={styles.statLabel}>Bite-sized lessons</div></div>
            <div><div className={styles.statNum}>9+</div><div className={styles.statLabel}>Partner schools</div></div>
            <div><div className={styles.statNum}>9.2/10</div><div className={styles.statLabel}>User satisfaction</div></div>
          </div>
        </div>
      </div>

      {/* ================= AUDIENCE-SPECIFIC PITCH (Family / Schools) ================= */}
      <div
        id="audience"
        role="tabpanel"
        aria-labelledby={audience === 'family' ? 'tab-family' : 'tab-schools'}
        className={styles.schoolsSec}
        style={{ scrollMarginTop: 90 }}
      >
        <div className="container">
          {audience === 'family' ? (
            <div className={styles.schoolsGrid}>
              <div>
                <span className="pill">For Families</span>
                <h2 style={{ marginTop: 18 }}>Learning that fits your family&apos;s schedule.</h2>
                <p style={{ color: neutral.inkMuted, maxWidth: 460 }}>
                  No classroom, no fixed timetable — just 15 minutes a day, whenever
                  it works. Alone, with a sibling, or together with you.
                </p>
                <div className={styles.schoolsList}>
                  <div className={styles.schoolsItem}>
                    <b>Learn anytime, anywhere</b>
                    <span>Self-paced lessons your child can start and stop on their own.</span>
                  </div>
                  <div className={styles.schoolsItem}>
                    <b>Arabic, French &amp; English</b>
                    <span>A native trilingual curriculum, not translated from somewhere else.</span>
                  </div>
                  <div className={styles.schoolsItem}>
                    <b>Weekly parent summary</b>
                    <span>See what they learned and where they got stuck — no digging required.</span>
                  </div>
                </div>
                <div className={styles.ctaRow}>
                  <a href="/auth/signup" className="btn btn-cta">Start free trial &rarr;</a>
                  <a href="#plans" className="btn btn-outline">See family plans &rarr;</a>
                </div>
              </div>

              <div className={styles.dashMock} style={{ position: 'relative' }}>
                <SampleDataBadge />
                <div className={styles.dashBar}>
                  <div className={styles.dashDot} />
                  <div className={styles.dashDot} />
                  <div className={styles.dashDot} />
                </div>
                <p style={{ color: palette.pearlWhite, fontWeight: 700, marginBottom: 14 }}>
                  Faris&apos; week
                </p>
                <div className={styles.rosterRow}><span>Lessons completed</span><span>5 / 5</span></div>
                <div className={styles.rosterRow}><span>Current streak</span><span style={{ color: mode.accent2 }}>4 pearls 🔥</span></div>
                <div className={styles.rosterRow}><span>Track</span><span>Coding</span></div>
                <div className={styles.rosterRow}>
                  <span>Next up</span>
                  <span style={{ color: mode.accent }}>Level 5</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.schoolsGrid}>
              <div>
                <span className="pill">For Schools &amp; Institutions</span>
                <h2 style={{ marginTop: 18 }}>Bring Plulai into your classroom.</h2>
                <p style={{ color: neutral.inkMuted, maxWidth: 460 }}>
                  A curriculum your teachers can run — with a dashboard that flags who&apos;s
                  stuck before report cards do.
                </p>
                <div className={styles.schoolsList}>
                  <div className={styles.schoolsItem}>
                    <b>Bulk seats, 50–5,000</b>
                    <span>Regional pricing, flexible billing.</span>
                  </div>
                  <div className={styles.schoolsItem}>
                    <b>Arabic, French &amp; English curriculum</b>
                    <span>Built for MENA classrooms, not translated from somewhere else.</span>
                  </div>
                  <div className={styles.schoolsItem}>
                    <b>Dedicated support</b>
                    <span>Onboarding, training, a named success contact.</span>
                  </div>
                </div>
                <div className={styles.ctaRow}>
                  <a href="/schools" className="btn btn-cta">Explore for schools &rarr;</a>
                  <a href="mailto:hello@plulai.com" className="btn btn-outline">Book a demo &rarr;</a>
                </div>
              </div>

              <div className={styles.dashMock} style={{ position: 'relative' }}>
                <SampleDataBadge />
                <div className={styles.dashBar}>
                  <div className={styles.dashDot} />
                  <div className={styles.dashDot} />
                  <div className={styles.dashDot} />
                </div>
                <p style={{ color: palette.pearlWhite, fontWeight: 700, marginBottom: 14 }}>
                  Grade 5B — Coding Track
                </p>
                <div className={styles.rosterRow}><span>Sara K.</span><span>80%</span></div>
                <div className={styles.rosterRow}><span>Ali M.</span><span>45%</span></div>
                <div className={styles.rosterRow}><span>Fatima R.</span><span>92%</span></div>
                <div className={styles.rosterRow}>
                  <span>Yousef A. <span style={{ color: palette.coral, fontWeight: 700 }}>· stuck</span></span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= HOW IT WORKS (schools only) ================= */}
      {audience === 'schools' && (
      <div id="how-it-works" className={styles.tracksSec} style={{ background: palette.lagoon }}>
        <style>{`
          @media (max-width: 760px) {
            .how-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">How it works</p>
            <h2>From demo to full rollout</h2>
            <p style={{ color: neutral.inkMuted, maxWidth: 520, margin: '10px auto 0' }}>
              Most schools go from first call to a full classroom in under a month.
            </p>
          </div>

          {(() => {
            const step = howItWorksSteps[activeStep]
            const previews = [
              (
                <>
                  <p style={{ color: palette.pearlWhite, fontWeight: 700, marginBottom: 14 }}>This week</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 16 }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                      <div
                        key={d + idx}
                        style={{
                          aspectRatio: '1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600,
                          background: idx === 3 ? palette.reef : 'rgba(255,255,255,0.08)',
                          color: idx === 3 ? palette.depth : neutral.pearlFaint,
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className={styles.rosterRow}><span>Demo · Wed, 10:00 AM</span><span style={{ color: palette.reef }}>Booked</span></div>
                </>
              ),
              (
                <>
                  <p style={{ color: palette.pearlWhite, fontWeight: 700, marginBottom: 14 }}>Grade 5B — Pilot</p>
                  <div className={styles.rosterRow}><span>Sara K.</span><span>80%</span></div>
                  <div className={styles.rosterRow}><span>Ali M.</span><span>45%</span></div>
                  <div className={styles.rosterRow}><span>Fatima R.</span><span>92%</span></div>
                </>
              ),
              (
                <>
                  <p style={{ color: palette.pearlWhite, fontWeight: 700, marginBottom: 14 }}>Onboarding checklist</p>
                  {['Platform walkthrough', 'Grading & dashboard', 'Live Q&A session'].map((item) => (
                    <div key={item} className={styles.rosterRow}>
                      <span>{item}</span>
                      <span style={{ color: palette.reef }}>✓</span>
                    </div>
                  ))}
                </>
              ),
              (
                <>
                  <p style={{ color: palette.pearlWhite, fontWeight: 700, marginBottom: 14 }}>Rollout progress</p>
                  {[{ g: 'Grade 4', v: 82 }, { g: 'Grade 5', v: 91 }, { g: 'Grade 6', v: 76 }].map((row) => (
                    <div key={row.g} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: neutral.pearlFaint, marginBottom: 4 }}>
                        <span>{row.g}</span><span>{row.v}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{ height: 6, borderRadius: 4, width: `${row.v}%`, background: palette.reef }} />
                      </div>
                    </div>
                  ))}
                </>
              ),
            ]
            return (
              <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 40, marginTop: 48, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {howItWorksSteps.map((s, i) => {
                    const active = i === activeStep
                    return (
                      <button
                        key={s.n}
                        type="button"
                        onClick={() => setActiveStep(i)}
                        aria-current={active}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                          padding: '16px 18px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                          border: active ? 'none' : `1px solid ${neutral.inkBorder}`,
                          background: active ? palette.depth : '#fff',
                        }}
                      >
                        <span
                          style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12.5, fontWeight: 700,
                            background: active ? s.color : '#F1F5F4',
                            color: active ? (s.color === palette.pearlGold ? palette.depth : '#fff') : neutral.inkFaint,
                          }}
                        >
                          {s.n}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: active ? palette.pearlWhite : palette.depth }}>
                          {s.title}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div className={styles.dashMock} style={{ position: 'relative' }}>
                    <SampleDataBadge />
                    <div className={styles.dashBar}>
                      <div className={styles.dashDot} />
                      <div className={styles.dashDot} />
                      <div className={styles.dashDot} />
                    </div>
                    <div aria-live="polite">{previews[activeStep]}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                      disabled={activeStep === 0}
                      style={{
                        border: `1px solid ${neutral.inkBorder}`, background: '#fff', borderRadius: 10,
                        padding: '8px 14px', fontSize: 13, fontWeight: 700, color: palette.depth,
                        cursor: activeStep === 0 ? 'default' : 'pointer', opacity: activeStep === 0 ? 0.4 : 1,
                        fontFamily: 'inherit',
                      }}
                    >
                      &larr; Previous
                    </button>
                    <div style={{ display: 'flex', gap: 6 }} aria-hidden>
                      {howItWorksSteps.map((s, i) => (
                        <span
                          key={s.n}
                          style={{
                            width: i === activeStep ? 20 : 7, height: 7, borderRadius: 999,
                            background: i === activeStep ? palette.reef : neutral.inkBorder,
                            transition: 'width .2s ease',
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStep((s) => Math.min(howItWorksSteps.length - 1, s + 1))}
                      disabled={activeStep === howItWorksSteps.length - 1}
                      style={{
                        border: 'none', background: palette.reef, borderRadius: 10,
                        padding: '8px 14px', fontSize: 13, fontWeight: 700, color: palette.depth,
                        cursor: activeStep === howItWorksSteps.length - 1 ? 'default' : 'pointer',
                        opacity: activeStep === howItWorksSteps.length - 1 ? 0.4 : 1,
                        fontFamily: 'inherit',
                      }}
                    >
                      Next &rarr;
                    </button>
                  </div>

                  <p style={{ fontSize: 14, lineHeight: 1.65, color: neutral.inkMuted, marginTop: 20 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })()}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href="#plans" className="btn btn-cta">See packages &amp; pricing &rarr;</a>
          </div>
        </div>
      </div>
      )}

      {/* ================= TRACKS: illustrated path ================= */}
      <div id="tracks" className={styles.tracksSec} style={{ overflow: 'hidden' }}>
        <style>{`
          .trk-card { transition: transform .25s ease, box-shadow .25s ease; }
          .trk-card:hover { transform: translateY(-6px) rotate(0deg) !important; box-shadow: 0 18px 30px rgba(13,43,50,0.14) !important; }
          @media (max-width: 760px) {
            .trk-card { transform: none !important; }
            .trk-row { flex-direction: column; align-items: center !important; }
            .trk-path { display: none; }
          }
        `}</style>
        <div className="container">
          <div className={styles.tracksHead} style={{ position: 'relative' }}>
            <p className="eyebrow">Curriculum overview</p>
            <h2 style={{ display: 'inline-block', position: 'relative' }}>
              What your students will learn
              <svg
                width="280" height="14" viewBox="0 0 280 14"
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -10 }}
                aria-hidden
              >
                <path d="M4 8 Q40 -2 76 8 T148 8 T220 8 T276 8" stroke={palette.pearlGold} strokeWidth={3} fill="none" strokeLinecap="round" />
              </svg>
            </h2>
            <p style={{ color: neutral.inkMuted, maxWidth: 520, margin: '22px auto 0' }}>
              Three tracks, one path — each lesson unlocks the next stop, sequenced
              by age so it drops straight into a class period or after-school slot.
            </p>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18,
                padding: '7px 15px', borderRadius: 999, background: palette.lagoon,
                color: palette.depth, fontSize: 13, fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.reef }} />
              Built for schools, sequenced lesson by lesson
            </span>
          </div>

          <div style={{ position: 'relative', marginTop: 64, paddingBottom: 30 }}>
            {/* dashed path connecting the three stops, decorative */}
            <svg
              className="trk-path"
              viewBox="0 0 1000 120" preserveAspectRatio="none"
              style={{ position: 'absolute', top: 60, left: 0, width: '100%', height: 120, zIndex: 0 }}
              aria-hidden
            >
              <path
                d="M110 100 C 250 20, 400 20, 500 60 S 750 100, 890 20"
                stroke={neutral.inkBorder} strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" fill="none"
              />
              <circle cx="110" cy="100" r="6" fill={palette.reef} />
              <circle cx="500" cy="60" r="6" fill={palette.pearlGold} />
              <circle cx="890" cy="20" r="6" fill={palette.depth} />
            </svg>

            {/* stray doodle stars */}
            <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: -30, left: '18%', opacity: 0.6 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill={palette.pearlGold} />
            </svg>
            <svg width="14" height="14" viewBox="0 0 22 22" style={{ position: 'absolute', top: 10, right: '12%', opacity: 0.5 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill={palette.reef} />
            </svg>

            <div
              className="trk-row"
              style={{
                position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap',
                justifyContent: 'center', alignItems: 'flex-start', gap: 32,
              }}
            >
              {/* Coding */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: `2px solid ${palette.depth}`, boxShadow: `0 8px 0 ${palette.depth}`,
                  transform: 'rotate(-3deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, left: 20, transform: 'rotate(-6deg)',
                    background: palette.depth, color: '#fff', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  STOP 01 · AGES 8–16
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '63% 37% 54% 46% / 55% 45% 45% 55%',
                    background: `linear-gradient(135deg, ${palette.reef}, #17948A)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#fff' }}>{'{ }'}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: palette.depth, margin: '0 0 8px', textAlign: 'center' }}>
                  Coding
                </p>
                <p style={{ color: neutral.inkMuted, fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  Blocks to real Python — students ship actual apps and games.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['Logic', 'Python', 'Debugging'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: palette.depth, background: palette.lagoon, padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: palette.reef, margin: 0 }}>180+ lessons →</p>
              </div>

              {/* AI & Future Tech — raised, center stop */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: `2px solid ${palette.depth}`, boxShadow: `0 8px 0 ${palette.pearlGold}`,
                  transform: 'translateY(-18px) rotate(2deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, left: 20, transform: 'rotate(4deg)',
                    background: palette.pearlGold, color: palette.depth, fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  STOP 02 · AGES 10–16
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
                    background: `linear-gradient(135deg, #E8BE72, ${palette.pearlGold})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: palette.depth }}>AI</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: palette.depth, margin: '0 0 8px', textAlign: 'center' }}>
                  AI &amp; Future Tech
                </p>
                <p style={{ color: neutral.inkMuted, fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  Prompting, data, and real ML basics — AI literacy from day one.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['Prompting', 'Data', 'ML basics'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: palette.depth, background: 'rgba(212,162,76,0.15)', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: palette.pearlGold, margin: 0 }}>160+ lessons →</p>
              </div>

              {/* Entrepreneurship */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: `2px solid ${palette.depth}`, boxShadow: `0 8px 0 ${palette.depth}`,
                  transform: 'rotate(-2deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, left: 20, transform: 'rotate(-5deg)',
                    background: palette.depth, color: '#fff', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  STOP 03 · AGES 10–16
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '50% 50% 38% 62% / 60% 45% 55% 40%',
                    background: `linear-gradient(135deg, #145048, ${palette.depth})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width={26} height={26} viewBox="0 0 20 20">
                    <rect x="2" y="12" width="4" height="6" fill="#fff" />
                    <rect x="8" y="7" width="4" height="11" fill="#fff" />
                    <rect x="14" y="2" width="4" height="16" fill="#fff" />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: palette.depth, margin: '0 0 8px', textAlign: 'center' }}>
                  Entrepreneurship
                </p>
                <p style={{ color: neutral.inkMuted, fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  A first small venture — pricing, marketing, and a real pitch.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['Pricing', 'Marketing', 'Pitching'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: palette.depth, background: palette.lagoon, padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: palette.depth, margin: 0 }}>140+ lessons →</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALUMNI PROJECTS ================= */}
      <div className={styles.alumniSec}>
        <style>{`
          @keyframes plulai-project-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .project-marquee-track {
            animation: plulai-project-scroll 45s linear infinite;
          }
          .project-marquee-track.paused,
          .project-marquee-wrap:hover .project-marquee-track {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .project-marquee-track { animation: none; }
          }
        `}</style>
        <div className="container">
          <p className="eyebrow">Real work, not just quizzes</p>
          <h2>What kids actually build</h2>
          <p className={styles.alumniIntro}>
            Every track ends in a real project, not a certificate for clicking through slides.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
            <button
              type="button"
              onClick={() => scrollMarquee(-1)}
              aria-label="Scroll projects left"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${neutral.inkBorder}`,
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => setMarqueePlaying((p) => !p)}
              aria-pressed={!marqueePlaying}
              aria-label={marqueePlaying ? 'Pause auto-scroll' : 'Resume auto-scroll'}
              style={{
                border: `1px solid ${neutral.inkBorder}`, background: '#fff', borderRadius: 999,
                padding: '0 16px', height: 36, fontSize: 13, fontWeight: 700, color: palette.depth,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {marqueePlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              type="button"
              onClick={() => scrollMarquee(1)}
              aria-label="Scroll projects right"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${neutral.inkBorder}`,
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="project-marquee-wrap" ref={marqueeWrapRef} style={{ overflow: 'hidden' }}>
          <div
            className={`${styles.projectCarousel} project-marquee-track${marqueePlaying ? '' : ' paused'}`}
            style={{ display: 'flex', overflow: 'visible', width: 'max-content' }}
          >
            {[...projects, ...projects].map((project, i) => (
              <div key={`${project.file}-${i}`} className={styles.projectSlide}>
                <div className={styles.projectShot}>
                  <Image
                    src={`/projects/${project.file}`}
                    alt={project.title}
                    fill
                    className={styles.projectImg}
                    sizes="(max-width: 640px) 80vw, 320px"
                  />
                </div>
                <span className={`tag-mono tag-mono--${project.tagColor}`}>{project.track}</span>
                <p className={styles.projectTitle}>{project.title}</p>
                <p className={styles.projectStudent}>{project.student}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= PATH SECTION: before / after ================= */}
      {/* Energetic mode for Families (light, Lagoon/Sun Gold), Depth mode
          for Schools (dark, investor-deck feel) — the two modes are now
          actually visually distinct, not just different copy. */}
      <div
        className={styles.pathSec}
        style={energetic ? { background: `linear-gradient(180deg, ${palette.lagoon}, ${palette.lagoonFill})` } : undefined}
      >
        <style>{`
          @media (max-width: 760px) {
            .ba-grid { grid-template-columns: 1fr !important; }
            .ba-panel-before { border-radius: 20px 20px 0 0 !important; }
            .ba-panel-after { border-radius: 0 0 20px 20px !important; }
            .ba-divider-desktop { display: none !important; }
            .ba-divider-mobile { display: flex !important; }
          }
        `}</style>
        <div className="container">
          <p className="eyebrow" style={energetic ? { color: palette.depth } : undefined}>The pearl path</p>
          <h2 style={{ color: energetic ? palette.depth : palette.pearlWhite }}>
            {audience === 'family'
              ? 'Watch them go from curious to confident'
              : 'Watch your students go from hesitant to confident builders'}
          </h2>
          <p style={{ color: energetic ? neutral.inkMuted : neutral.pearlFaint, maxWidth: 560 }}>
            {audience === 'family'
              ? "This isn't a points system — it's what actually changes over a few months of lessons."
              : "This is the shift schools notice — not a leaderboard, a real change in how students work."}
          </p>

          <div style={{ position: 'relative', marginTop: 56, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="ba-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* BEFORE */}
              <div
                className="ba-panel-before"
                style={{
                  background: energetic ? 'rgba(13,43,50,0.03)' : 'rgba(255,255,255,0.03)',
                  border: energetic ? `1px solid ${neutral.inkBorder}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px 0 0 20px', padding: '40px 34px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6,
                    color: energetic ? neutral.inkFaint : neutral.pearlFaint,
                    background: energetic ? 'rgba(13,43,50,0.06)' : 'rgba(255,255,255,0.06)',
                    padding: '5px 13px', borderRadius: 999, marginBottom: 22,
                  }}
                >
                  BEFORE
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(audience === 'family'
                    ? ['Never touched a line of code', 'Nervous to try, quick to give up', 'Screen time with nothing to show for it']
                    : ['Hesitant, unsure where to start', 'Needs constant hand-holding', 'Engagement drops after week one']
                  ).map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, color: energetic ? neutral.inkMuted : neutral.pearlFaint, lineHeight: 1.5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: energetic ? neutral.inkFaint : neutral.pearlFaint, marginTop: 8, flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AFTER */}
              <div
                className="ba-panel-after"
                style={{
                  background: energetic
                    ? `linear-gradient(135deg, rgba(23,217,192,0.16), rgba(255,185,48,0.10))`
                    : `linear-gradient(135deg, rgba(31,184,166,0.14), rgba(212,162,76,0.07))`,
                  border: `1px solid ${energetic ? 'rgba(23,217,192,0.5)' : 'rgba(31,184,166,0.4)'}`,
                  borderRadius: '0 20px 20px 0',
                  padding: '40px 34px', boxShadow: `0 20px 50px ${energetic ? 'rgba(23,217,192,0.14)' : 'rgba(31,184,166,0.12)'}`,
                }}
              >
                <span
                  style={{
                    display: 'inline-block', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6,
                    color: palette.depth, background: mode.accent, padding: '5px 13px',
                    borderRadius: 999, marginBottom: 22,
                  }}
                >
                  AFTER · 3 MONTHS LATER
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(audience === 'family'
                    ? ['Ships their own app or game', 'Debugs mistakes without asking for help', 'Pitches ideas like they mean it']
                    : ['Builds and presents real projects', 'Works through problems independently', 'Asks to keep going after class ends']
                  ).map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, color: energetic ? palette.depth : palette.pearlWhite, fontWeight: 600, lineHeight: 1.5 }}>
                      <svg width={17} height={17} viewBox="0 0 16 16" style={{ marginTop: 3, flexShrink: 0 }}>
                        <path d="M3 8 L7 12 L13 4" stroke={mode.accent} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* divider: circle w/ arrow, desktop only */}
            <div
              className="ba-divider-desktop"
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 56, height: 56, borderRadius: '50%', background: palette.depth, border: `3px solid ${mode.accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
              }}
            >
              <svg width={22} height={22} viewBox="0 0 20 20">
                <path d="M4 10 H16 M11 5 L16 10 L11 15" stroke={mode.accent} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* divider: arrow row, mobile only */}
            <div
              className="ba-divider-mobile"
              style={{
                display: 'none', justifyContent: 'center', alignItems: 'center',
                background: palette.depth, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '10px 0',
              }}
            >
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M10 4 V16 M5 11 L10 16 L15 11" stroke={mode.accent} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a href="#audience" className="btn btn-cta">
              {audience === 'family' ? 'Start free trial' : 'Book a demo'} &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* ================= CASE STUDY (schools only) ================= */}
      {audience === 'schools' && (
      <div className={styles.tracksSec}>
        <style>{`
          @media (max-width: 720px) {
            .case-study-grid { grid-template-columns: 1fr !important; padding: 32px 24px !important; }
          }
        `}</style>
        <div className="container">
          <div
            className="case-study-grid"
            style={{
              background: palette.depth, borderRadius: 28, padding: '48px 40px',
              display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center',
              position: 'relative',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
                  color: palette.reef, background: 'rgba(31,184,166,0.12)', padding: '5px 12px', borderRadius: 999,
                  marginBottom: 18,
                }}
              >
                ILLUSTRATIVE EXAMPLE
              </span>
              <h2 style={{ color: palette.pearlWhite, marginBottom: 14 }}>A partner school in Tunis</h2>
              <p style={{ color: neutral.pearlFaint, lineHeight: 1.7, marginBottom: 22 }}>
                One of our partner schools piloted Plulai with a single class before
                rolling it out across several grade levels. Their administration
                pointed to the trilingual curriculum and the admin dashboard as the
                deciding factors over other options they trialed.
              </p>
              <p style={{ fontSize: 12, color: neutral.pearlFaint, marginBottom: 22 }}>
                Numbers below are a placeholder scenario, not a published result — ask us for real pilot data on a demo call.
              </p>
              <a href="mailto:hello@plulai.com" className="btn btn-cta">Book a demo &rarr;</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { num: '3 weeks', label: 'Pilot to full rollout' },
                { num: '200+', label: 'Students onboarded' },
                { num: '↑', label: 'Weekly lesson completion' },
                { num: '3', label: 'Grade levels covered' },
              ].map((stat) => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 16px' }}>
                  <p style={{ color: palette.reef, fontWeight: 700, fontSize: 26, margin: '0 0 6px' }}>{stat.num}</p>
                  <p style={{ color: neutral.pearlFaint, fontSize: 13, margin: 0, lineHeight: 1.4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ================= FAMILY PLANS (family only) ================= */}
      {audience === 'family' && (
      <div id="plans" className={styles.tracksSec} style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Family plan</p>
            <h2>One plan, everything included</h2>
            <p style={{ color: neutral.inkMuted, maxWidth: 520, margin: '10px auto 0' }}>
              Try it free for 14 days. No commitment, cancel anytime before the
              trial ends and you won&apos;t be charged.
            </p>
          </div>

          <div style={{ maxWidth: 380, margin: '44px auto 0' }}>
            <div
              style={{
                background: palette.depth, borderRadius: 20, padding: '34px 30px',
                boxShadow: '0 12px 26px rgba(13,43,50,0.18)', textAlign: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
                  padding: '4px 12px', borderRadius: 999, background: mode.accent2, color: palette.depth, marginBottom: 16,
                }}
              >
                14-DAY FREE TRIAL
              </span>
              <p style={{ margin: '0 0 4px' }}>
                <span style={{ fontWeight: 700, fontSize: 40, color: palette.pearlWhite }}>$70</span>
                <span style={{ fontSize: 15, color: neutral.pearlFaint }}>/month</span>
              </p>
              <p style={{ fontSize: 13, margin: '0 0 26px', color: neutral.pearlFaint }}>
                after your free trial ends — billed monthly, cancel anytime
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                {['All three tracks — Coding, AI, Entrepreneurship', 'Unlimited AI tutor', 'Weekly parent summary', 'Arabic, French & English'].map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 14, color: palette.pearlWhite }}>
                    <svg width={15} height={15} viewBox="0 0 16 16" style={{ marginTop: 3, flexShrink: 0 }}>
                      <path d="M3 8 L7 12 L13 4" stroke={palette.reef} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/auth/signup" className="btn btn-cta btn-block">Start 14-day free trial &rarr;</a>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ================= PACKAGES (schools & training centers only) ================= */}
      {audience === 'schools' && (
      <div id="plans" className={styles.tracksSec} style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Schools &amp; training centers</p>
            <h2>A package sized for your institution</h2>
            <p style={{ color: neutral.inkMuted, maxWidth: 520, margin: '10px auto 0' }}>
              Every plan includes all three tracks and the admin dashboard. Pricing
              is scoped to seat count and term length — book a demo for a quote.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 44 }}>
            {[
              {
                name: 'Classroom Pilot',
                blurb: 'Try it with one class before deciding school-wide.',
                seats: '1 classroom · up to 35 seats',
                features: ['All three tracks', 'One term', 'Teacher onboarding session'],
                cta: 'Start a pilot',
                href: 'mailto:hello@plulai.com',
                highlight: false,
              },
              {
                name: 'School-wide',
                blurb: 'The most common setup for a full school rollout.',
                seats: '50–1,000 seats',
                features: ['All three tracks', 'Admin dashboard', 'Teacher training + support', 'Full academic year'],
                cta: 'Book a demo',
                href: '#audience',
                highlight: true,
              },
              {
                name: 'District',
                blurb: 'Multiple schools under one contract and dashboard.',
                seats: '1,000+ seats',
                features: ['Everything in School-wide', 'Multi-school reporting', 'Dedicated success contact'],
                cta: 'Contact sales',
                href: 'mailto:hello@plulai.com',
                highlight: false,
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  background: pkg.highlight ? palette.depth : '#fff',
                  border: pkg.highlight ? 'none' : `1px solid ${neutral.inkBorder}`,
                  borderRadius: 20, padding: '30px 26px', display: 'flex', flexDirection: 'column',
                  boxShadow: pkg.highlight ? '0 12px 26px rgba(13,43,50,0.18)' : '0 1px 2px rgba(13,43,50,0.04)',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 19, margin: '0 0 6px', color: pkg.highlight ? palette.pearlWhite : palette.depth }}>
                  {pkg.name}
                </p>
                <p style={{ fontSize: 13.5, margin: '0 0 4px', color: pkg.highlight ? palette.reef : neutral.inkFaint, fontWeight: 600 }}>
                  {pkg.seats}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '10px 0 20px', color: pkg.highlight ? neutral.pearlFaint : neutral.inkMuted }}>
                  {pkg.blurb}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {pkg.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: pkg.highlight ? palette.pearlWhite : palette.depth }}>
                      <svg width={14} height={14} viewBox="0 0 16 16" style={{ marginTop: 3, flexShrink: 0 }}>
                        <path d="M3 8 L7 12 L13 4" stroke={palette.reef} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={pkg.href} className={pkg.highlight ? 'btn btn-cta btn-block' : 'btn btn-outline btn-block'}>
                  {pkg.cta} &rarr;
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13.5, color: neutral.inkFaint, marginTop: 28 }}>
            Most school partners land somewhere between 50 and 500 seats — book a demo and we&apos;ll scope an exact quote in one call.
          </p>
        </div>
      </div>
      )}

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,40 C300,0 600,70 900,30 C1100,5 1300,45 1440,20 L1440,70 L0,70 Z" fill={palette.reef} />
        </svg>
      </div>

      {/* ================= TESTIMONIALS (now audience-aware) ================= */}
      <div className={styles.testiSec}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: 'center', opacity: 0.7 }}>
            {audience === 'family' ? 'Loved by parents' : 'Loved by principals & curriculum leads'}
          </p>
          <h2 style={{ textAlign: 'center' }}>What people are saying</h2>

          <div className={styles.testiCluster}>
            {visibleTestimonials.map((t) => (
              <div key={t.name} className={styles.testiBubble}>
                <p className={styles.stars}>★★★★★</p>
                <p className={styles.testiQuote}>&quot;{t.quote}&quot;</p>
                <div className={styles.testiPerson}>
                  <div className={styles.testiAvatar}>{t.initial}</div>
                  <div>
                    <p className={styles.testiName}>{t.name}</p>
                    <p className={styles.testiRole}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SECURITY & COMPLIANCE (schools only) ================= */}
      {audience === 'schools' && (
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Security &amp; compliance</p>
            <h2>Data your IT team can sign off on</h2>
            <p style={{ color: neutral.inkMuted, maxWidth: 520, margin: '10px auto 0' }}>
              Built with student privacy as a default, not an add-on.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginTop: 44 }}>
            {[
              {
                title: 'Student data stays protected',
                desc: "Student accounts collect only what's needed to run lessons and track progress — never sold or used for advertising.",
              },
              {
                title: 'Role-based access',
                desc: 'Teachers see their own classes, admins see the school, and students see only their own work.',
              },
              {
                title: 'Regional hosting options',
                desc: 'Data residency options available for institutions with regional requirements.',
              },
              {
                title: 'A named point of contact',
                desc: 'Institution plans get a dedicated contact for data and security questions — not a support queue.',
              },
            ].map((item) => (
              <div key={item.title} style={{ background: '#fff', border: `1px solid ${neutral.inkBorder}`, borderRadius: 18, padding: '24px 22px' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: palette.lagoon,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                  }}
                >
                  <svg width={17} height={17} viewBox="0 0 20 20">
                    <path d="M10 2 L17 5 V10 C17 14 14 17 10 18 C6 17 3 14 3 10 V5 Z" fill={palette.reef} />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15.5, color: palette.depth, margin: '0 0 8px' }}>{item.title}</p>
                <p style={{ fontSize: 13.5, color: neutral.inkMuted, lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: neutral.inkFaint, marginTop: 28 }}>
            Questions for your IT or procurement team? <a href="mailto:hello@plulai.com" style={{ color: palette.reef, fontWeight: 600 }}>Email us</a> for our data handling documentation.
          </p>
        </div>
      </div>
      )}

      {/* ================= FAQ ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className={styles.tracksHead}>
            <p className="eyebrow">FAQ</p>
            <h2>Common questions from families &amp; schools</h2>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleFaq.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={item.q} style={{ border: `1px solid ${neutral.inkBorder}`, borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 15, fontWeight: 600, color: palette.depth, fontFamily: 'inherit',
                    }}
                  >
                    {item.q}
                    <span
                      style={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .2s ease',
                        fontSize: 20, color: palette.reef, flexShrink: 0, marginLeft: 12, lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 14, lineHeight: 1.6, color: neutral.inkMuted }}>
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className={styles.finalCta}>
        <div className="container">
          {audience === 'family' ? (
            <>
              <h2 className={styles.finalCtaTitle}>Ready to give them a head start?</h2>
              <p className={styles.finalCtaText}>
                Join the families across MENA building their kids&apos; first pearl streak.
              </p>
              <div className={styles.finalCtas}>
                <a href="/auth/signup" className="btn btn-cta">Start free trial &rarr;</a>
                <a href="#plans" className="btn btn-outline btn-outline--on-dark">See family plans &rarr;</a>
              </div>
            </>
          ) : (
            <>
              <h2 className={styles.finalCtaTitle}>Ready to bring Plulai to your school?</h2>
              <p className={styles.finalCtaText}>
                Join the schools and training centers building the next generation of MENA creators.
              </p>
              <div className={styles.finalCtas}>
                <a href="#audience" className="btn btn-cta">Book a demo &rarr;</a>
                <a href="mailto:hello@plulai.com" className="btn btn-outline btn-outline--on-dark">Talk to our team &rarr;</a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <style>{`
          @media (max-width: 640px) {
            .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          }
        `}</style>
        <div className="container">
          <div className={`${styles.footerGrid} footer-grid`} style={{ gridTemplateColumns: '1.6fr repeat(3, 1fr)' }}>
            <div>
              <div className="wordmark">
                <span className="brand-mark">/</span>
                <span>Plulai</span>
              </div>
              <p className={styles.footerBrandText}>
                Building tomorrow&apos;s builders, today — made for the MENA region.
              </p>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Product</p>
              <a href="#tracks">Tracks</a>
              <a href="#plans">{audience === 'family' ? 'Pricing' : 'Packages'}</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>For you</p>
              <a href="#audience" onClick={() => setAudience('family')}>For Families</a>
              <a href="#audience" onClick={() => setAudience('schools')}>For Schools</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Company</p>
              <a href="#">About</a>
              <a href="/ar">العربية</a>
              <a href="/fr">Français</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 Plulai Education.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </>
  )
}