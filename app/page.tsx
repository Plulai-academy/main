// File: page.tsx
// Placement: app/page.tsx
//
// 'use client' because the mobile nav menu needs local state.
// Nav is inlined here (not a separate component) to keep this a
// 3-file setup: page.tsx / page.module.css / ar/page.tsx.
//
// CHANGES IN THIS VERSION:
// - Repositioned for B2B (schools/institutions) as the primary audience:
//     - Hero copy leads with schools, dashboard is up in the same 
//       sentence as the value prop instead of buried at the bottom
//     - "For Schools" section moved directly after Partners (used to
//       sit near the bottom, after Path/Stats)
//     - Primary CTAs changed from "Try a free lesson" (consumer signup)
//       to "Book a demo" (B2B) across nav, hero, and final CTA
//     - Nav/footer "Pricing" links removed
// - Pricing section removed entirely (was #pricing)
// - Mascot swapped: <Marjan /> component -> <Image src="/marjanthecamel.svg" />
//   NOTE: you need to add marjanthecamel.svg to your /public folder.
//   The old Marjan import was removed since it's no longer used here
//   (leave the component file alone if other pages still use it).

'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Image from 'next/image'

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
  { name: 'Partner 10', file: 'p11.png' },



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
  // { file: '9.png', title: 'Sticker Shop', track: 'Coding', tagColor: 'reef', student: 'Yousef, age 15' },
  { file: '10.png', title: 'Coloring Game', track: 'Game', tagColor: 'reef', student: 'Kamar, age 15' },
  { file: '11.png', title: 'Geological Assistant', track: 'AI', tagColor: 'gold', student: 'Ahmed, age 13' },
  { file: '12.png', title: 'Game', track: 'Game', tagColor: 'reef', student: 'Abd Arrahman, age 12' },
  { file: '13.png', title: 'Maze Game', track: 'Game', tagColor: 'reef', student: 'Serah , age 14' },
  { file: '14.png', title: 'AI For Meditation', track: 'AI', tagColor: 'gold', student: 'Yahya, age 12' },
  { file: '15.png', title: 'Football Game', track: 'Coding', tagColor: 'reef', student: 'Othman, age 10' },
  { file: '17.png', title: 'AI DIY', track: 'AI', tagColor: 'gold', student: '' },
  { file: '18.png', title: 'Sequences Game', track: 'Game', tagColor: 'reef', student: 'Mariam, age 14' },
  { file: '19.png', title: 'Flag Quest', track: 'Coding', tagColor: 'reef', student: 'Farah, age 15' },
  // { file: '20.png', title: '', track: 'Coding', tagColor: 'reef', student: '' } 
]
export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <>
      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navRow}>
            <a href="/" aria-label="Plulai home" style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="/plulai_logo_dark_transparent.png"
                alt="Plulai"
                width={132}
                height={36}
                priority
                style={{ height: 'auto', width: 'auto', maxHeight: 36 }}
              />
            </a>

            <div className={styles.navLinks} style={{ color: '#0D2B32' }}>
              <a href="#tracks" style={{ color: '#0D2B32' }}>Tracks</a>
              <a href="#schools" style={{ color: '#0D2B32', fontWeight: 600 }}>For Schools</a>
            </div>

            <div className={styles.navRight}>
              <a href="/auth/login" style={{ color: '#0D2B32' }}>Log in</a>
              <a href="#schools"><button className="btn btn-dark">Book a demo &rarr;</button></a>
            </div>

            <button
              type="button"
              className={styles.burger}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span className={navOpen ? styles.burgerTopOpen : ''} />
              <span className={navOpen ? styles.burgerMidOpen : ''} />
              <span className={navOpen ? styles.burgerBotOpen : ''} />
            </button>
          </div>

          <div className={`${styles.mobilePanel} ${navOpen ? styles.mobilePanelOpen : ''}`}>
            <a href="#tracks" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32' }}>Tracks</a>
            <a href="#schools" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32', fontWeight: 600 }}>For Schools</a>
            <div className={styles.mobilePanelDivider} />
            <a href="/auth/login" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32' }}>Log in</a>
            <a href="#schools" onClick={() => setNavOpen(false)}>
              <button className="btn btn-cta btn-block">Book a demo &rarr;</button>
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
              <div className={styles.statBadge}>
                <span className={styles.statDot} />
                11+ Partner Schools &amp; Programs 
              </div>
              <h1 className={styles.heroTitle}>
                A coding, AI &amp; entrepreneurship curriculum your school can run.
              </h1>
              <p className={styles.heroSub}>
                15 minutes a day, taught in real Arabic, French, or English — with an AI coach
                built around how kids actually learn, and a dashboard that flags
                who&apos;s stuck before report cards do.
              </p>
              <div className={styles.ctaRow}>
                <a href="#schools"><button className="btn btn-cta">Book a demo &rarr;</button></a>
                <a href="mailto:hello@plulai.com"><button className="btn btn-outline">Talk to our team</button></a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Image
                src="/avatars/marjanthecamel.png"
                alt="Marjan the camel, Plulai's mascot"
                width={280}
                height={280}
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
                  <path d="M10 2 L17 7 L17 18 L3 18 L3 7 Z" fill="#1FB8A6" />
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
          <path d="M0,30 C240,80 480,0 720,25 C960,50 1200,10 1440,35 L1440,70 L0,70 Z" fill="#F6F3EA" />
        </svg>
      </div>

      {/* ================= PARTNERS ================= */}
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
        </div>
      </div>

      {/* ================= SCHOOLS ================= */}
      <div id="schools" className={styles.schoolsSec}>
        <div className="container">
          <div className={styles.schoolsGrid}>
            <div>
              <span className="pill">For Schools &amp; Institutions</span>
              <h2 style={{ marginTop: 18 }}>Bring Plulai into your classroom.</h2>
              <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 460 }}>
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
                  <span>Built for Tunisia&apos;s classrooms, not translated from somewhere else.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>Dedicated support</b>
                  <span>Onboarding, training, a named success contact.</span>
                </div>
              </div>
              <div className={styles.ctaRow}>
                <a href="/schools">
                  <button className="btn btn-dark">Explore for schools &rarr;</button>
                </a>
                <a href="mailto:hello@plulai.com">
                  <button className="btn btn-outline">Book a demo &rarr;</button>
                </a>
              </div>
            </div>

            <div className={styles.dashMock}>
              <div className={styles.dashBar}>
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
              </div>
              <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>
                Grade 5B — Coding Track
              </p>
              <div className={styles.rosterRow}><span>Sara K.</span><span>80%</span></div>
              <div className={styles.rosterRow}><span>Ali M.</span><span>45%</span></div>
              <div className={styles.rosterRow}><span>Fatima R.</span><span>92%</span></div>
              <div className={styles.rosterRow}>
                <span>Yousef A. <span style={{ color: '#D4A24C' }}>· stuck</span></span>
                <span>15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div className={styles.tracksSec}>
        <style>{`
          @media (max-width: 760px) {
            .how-grid { grid-template-columns: 1fr !important; }
            .how-tabs { flex-direction: row !important; overflow-x: auto; gap: 10px !important; padding-bottom: 6px; }
            .how-tab { flex: 0 0 auto !important; white-space: nowrap; }
          }
        `}</style>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">How it works</p>
            <h2>From demo to full rollout</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '10px auto 0' }}>
              Most schools go from first call to a full classroom in under a month.
            </p>
          </div>

          {(() => {
            const steps = [
              {
                n: '01', title: 'Book a demo', color: '#1FB8A6',
                desc: 'A 30-minute walkthrough tailored to your grade levels and goals — see the student view, the teacher view, and the admin dashboard.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>This week</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 16 }}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                        <div
                          key={d + idx}
                          style={{
                            aspectRatio: '1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600,
                            background: idx === 3 ? '#1FB8A6' : 'rgba(255,255,255,0.08)',
                            color: idx === 3 ? '#0D2B32' : '#B7C9C5',
                          }}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className={styles.rosterRow}><span>Demo · Wed, 10:00 AM</span><span style={{ color: '#1FB8A6' }}>Booked</span></div>
                  </>
                ),
              },
              {
                n: '02', title: 'Pilot one classroom', color: '#D4A24C',
                desc: 'Run a free pilot with a single class before committing school-wide — full access, no cost, no pressure to continue.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>Grade 5B — Pilot</p>
                    <div className={styles.rosterRow}><span>Sara K.</span><span>80%</span></div>
                    <div className={styles.rosterRow}><span>Ali M.</span><span>45%</span></div>
                    <div className={styles.rosterRow}><span>Fatima R.</span><span>92%</span></div>
                  </>
                ),
              },
              {
                n: '03', title: 'Train your teachers', color: '#0D2B32',
                desc: 'A short onboarding session — no coding background required. Teachers leave knowing the platform and the dashboard cold.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>Onboarding checklist</p>
                    {['Platform walkthrough', 'Grading & dashboard', 'Live Q&A session'].map((item) => (
                      <div key={item} className={styles.rosterRow}>
                        <span>{item}</span>
                        <span style={{ color: '#1FB8A6' }}>✓</span>
                      </div>
                    ))}
                  </>
                ),
              },
              {
                n: '04', title: 'Roll out school-wide', color: '#053D35',
                desc: 'Scale to the full grade or school, with a dashboard for admins that flags who\u2019s stuck before report cards do.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>Rollout progress</p>
                    {[{ g: 'Grade 4', v: 82 }, { g: 'Grade 5', v: 91 }, { g: 'Grade 6', v: 76 }].map((row) => (
                      <div key={row.g} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#B7C9C5', marginBottom: 4 }}>
                          <span>{row.g}</span><span>{row.v}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>
                          <div style={{ height: 6, borderRadius: 4, width: `${row.v}%`, background: '#1FB8A6' }} />
                        </div>
                      </div>
                    ))}
                  </>
                ),
              },
            ]
            const step = steps[activeStep]
            return (
              <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 40, marginTop: 48, alignItems: 'start' }}>
                <div className="how-tabs" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {steps.map((s, i) => {
                    const active = i === activeStep
                    return (
                      <button
                        key={s.n}
                        type="button"
                        className="how-tab"
                        onClick={() => setActiveStep(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                          padding: '16px 18px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                          border: active ? 'none' : '1px solid #E4E9E7',
                          background: active ? '#0D2B32' : '#fff',
                        }}
                      >
                        <span
                          style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12.5, fontWeight: 700,
                            background: active ? s.color : '#F1F5F4',
                            color: active ? (s.color === '#D4A24C' ? '#402F12' : '#fff') : '#5C7873',
                          }}
                        >
                          {s.n}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: active ? '#F6F3EA' : '#0D2B32' }}>
                          {s.title}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div className={styles.dashMock}>
                    <div className={styles.dashBar}>
                      <div className={styles.dashDot} />
                      <div className={styles.dashDot} />
                      <div className={styles.dashDot} />
                    </div>
                    {step.preview}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(41,57,74,0.75)', marginTop: 20 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })()}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href="#schools">
              <button className="btn btn-cta">Book a demo &rarr;</button>
            </a>
          </div>
        </div>
      </div>

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
                <path d="M4 8 Q40 -2 76 8 T148 8 T220 8 T276 8" stroke="#D4A24C" strokeWidth={3} fill="none" strokeLinecap="round" />
              </svg>
            </h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '22px auto 0' }}>
              Three tracks, one path — each lesson unlocks the next stop, sequenced
              by age so it drops straight into a class period or after-school slot.
            </p>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18,
                padding: '7px 15px', borderRadius: 999, background: '#EAF6F3',
                color: '#0D2B32', fontSize: 13, fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1FB8A6' }} />
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
                stroke="#C9DAD5" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" fill="none"
              />
              <circle cx="110" cy="100" r="6" fill="#1FB8A6" />
              <circle cx="500" cy="60" r="6" fill="#D4A24C" />
              <circle cx="890" cy="20" r="6" fill="#053D35" />
            </svg>

            {/* stray doodle stars */}
            <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: -30, left: '18%', opacity: 0.6 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill="#D4A24C" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 22 22" style={{ position: 'absolute', top: 10, right: '12%', opacity: 0.5 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill="#1FB8A6" />
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
                  border: '2px solid #0D2B32', boxShadow: '0 8px 0 #0D2B32',
                  transform: 'rotate(-3deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, left: 20, transform: 'rotate(-6deg)',
                    background: '#0D2B32', color: '#fff', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  STOP 01 · AGES 8–16
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '63% 37% 54% 46% / 55% 45% 45% 55%',
                    background: 'linear-gradient(135deg, #1FB8A6, #17948A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#fff' }}>{'{ }'}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>
                  Coding
                </p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  Blocks to real Python — students ship actual apps and games.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['Logic', 'Python', 'Debugging'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#0D2B32', background: '#EAF6F3', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#1FB8A6', margin: 0 }}>180+ lessons →</p>
              </div>

              {/* AI & Future Tech — raised, center stop */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: '2px solid #402F12', boxShadow: '0 8px 0 #D4A24C',
                  transform: 'translateY(-18px) rotate(2deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, left: 20, transform: 'rotate(4deg)',
                    background: '#D4A24C', color: '#402F12', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  STOP 02 · AGES 10–16
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
                    background: 'linear-gradient(135deg, #E8BE72, #D4A24C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#402F12' }}>AI</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>
                  AI &amp; Future Tech
                </p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  Prompting, data, and real ML basics — AI literacy from day one.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['Prompting', 'Data', 'ML basics'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#402F12', background: '#FBF1DE', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#D4A24C', margin: 0 }}>160+ lessons →</p>
              </div>

              {/* Entrepreneurship */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: '2px solid #053D35', boxShadow: '0 8px 0 #053D35',
                  transform: 'rotate(-2deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, left: 20, transform: 'rotate(-5deg)',
                    background: '#053D35', color: '#fff', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  STOP 03 · AGES 10–16
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '50% 50% 38% 62% / 60% 45% 55% 40%',
                    background: 'linear-gradient(135deg, #145048, #053D35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width={26} height={26} viewBox="0 0 20 20">
                    <rect x="2" y="12" width="4" height="6" fill="#fff" />
                    <rect x="8" y="7" width="4" height="11" fill="#fff" />
                    <rect x="14" y="2" width="4" height="16" fill="#fff" />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>
                  Entrepreneurship
                </p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  A first small venture — pricing, marketing, and a real pitch.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['Pricing', 'Marketing', 'Pitching'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#053D35', background: '#EAF6F3', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#053D35', margin: 0 }}>140+ lessons →</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALUMNI PROJECTS ================= */}
      <div className={styles.alumniSec}>
        <div className="container">
          <p className="eyebrow">Real work, not just quizzes</p>
          <h2>What kids actually build</h2>
          <p className={styles.alumniIntro}>
            Every track ends in a real project, not a certificate for clicking through slides.
          </p>
        </div>

        <div className={styles.projectCarousel}>
          {projects.map((project) => (
            <div key={project.file} className={styles.projectSlide}>
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
      {/* ================= PATH SECTION ================= */}
      <div className={styles.pathSec}>
        <div className="container">
          <p className="eyebrow">The pearl path</p>
          <h2 style={{ color: 'var(--raw-pearlwhite)' }}>A path that shows exactly what&apos;s next</h2>
          <p style={{ color: '#8FA8A3', maxWidth: 500 }}>
            Every finished lesson cracks open a guaranteed reward — never a random one.
          </p>

          <div className={styles.mapGrid}>
            <div>
              <div className={styles.mapNodes}>
                <div className={styles.mapNode} style={{ background: '#17D9C0' }}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <path d="M3 8 L7 12 L13 4" stroke="#053D35" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.mapLine} />
                <div className={`${styles.mapNode} ${styles.mapNodeCurrent}`} style={{ background: '#FFB930' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#4A3403' }}>/</span>
                </div>
                <div className={styles.mapLine} />
                <div className={styles.mapNode} style={{ background: '#D9F1EC' }}>
                  <LockIcon />
                </div>
                <div className={styles.mapLine} />
                <div className={styles.mapNode} style={{ background: '#D9F1EC' }}>
                  <LockIcon />
                </div>
              </div>

              <div className={styles.hudRow}>
                <div className={styles.hudChip}>
                  Pearls this week
                  <b>4 / 5</b>
                </div>
                <div className={styles.hudChip}>
                  XP to next level
                  <b>240 / 300</b>
                </div>
              </div>

              <div className={styles.moduleCard}>
                <p className={styles.moduleTitle}>Build your first app</p>
                <p className={styles.moduleSub}>Module 1 · 6 lessons · 2 of 6 complete</p>
                <div className={styles.progTrack}>
                  <div className={styles.progFill} />
                </div>
              </div>
              <a href="#schools">
                <button className="btn btn-cta" style={{ marginTop: 24 }}>
                  Book a demo &rarr;
                </button>
              </a>
            </div>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6.5" stroke="#8FA8A3" strokeWidth={1.5} fill="none" />
                    <path d="M8 4.5 V8 L10.5 9.5" stroke="#8FA8A3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <b>15 minutes, not 30</b>
                  <span>Sized for an actual daily habit.</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <path d="M2 3 h12 v7 h-6 l-3 3 v-3 h-3 z" fill="#8FA8A3" />
                  </svg>
                </div>
                <div>
                  <b>A personal AI tutor</b>
                  <span>Adapts to pace and language, in the moment.</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="#D4A24C" />
                    <circle cx="8" cy="8" r="2.5" fill="#123A42" />
                  </svg>
                </div>
                <div>
                  <b>Guaranteed pearl rewards</b>
                  <span>No loot boxes — every lesson pays off the same way.</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <rect x="2" y="2" width="7" height="7" fill="#8FA8A3" />
                    <rect x="7" y="7" width="7" height="7" fill="#5C7873" />
                  </svg>
                </div>
                <div>
                  <b>Real projects</b>
                  <span>Every module ends with something to show.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className={styles.statsSec}>
        <div className="container">
          <div className={styles.statsRow}>
            <div><div className={styles.statNum}>150+</div><div className={styles.statLabel}>Active learners</div></div>
            <div><div className={styles.statNum}>500+</div><div className={styles.statLabel}>Bite-sized lessons</div></div>
            <div><div className={styles.statNum}>9+</div><div className={styles.statLabel}>Partner schools</div></div>
            <div><div className={styles.statNum}>9.2/10</div><div className={styles.statLabel}>User satisfaction</div></div>
          </div>
        </div>
      </div>

      {/* ================= CASE STUDY ================= */}
      {/* <div className={styles.tracksSec}>
        <div className="container">
          <div
            style={{
              background: '#0D2B32', borderRadius: 28, padding: '48px 40px',
              display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
                  color: '#1FB8A6', background: 'rgba(31,184,166,0.12)', padding: '5px 12px', borderRadius: 999,
                  marginBottom: 18,
                }}
              >
                CASE STUDY
              </span>
              <h2 style={{ color: '#F6F3EA', marginBottom: 14 }}>Al Noor International School, Doha</h2>
              <p style={{ color: '#B7C9C5', lineHeight: 1.7, marginBottom: 22 }}>
                Al Noor piloted Plulai with a single Grade 5 class before rolling it
                out across three grade levels. Their principal, Dr. Khalid R., cited
                the native Arabic curriculum and the admin dashboard as the deciding
                factors over other options they trialed.
              </p>
              <a href="mailto:hello@plulai.com">
                <button className="btn btn-cta">Read the full story &rarr;</button>
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { num: '3 weeks', label: 'Pilot to full rollout' },
                { num: '210', label: 'Students onboarded' },
                { num: '+38%', label: 'Weekly lesson completion' },
                { num: '3', label: 'Grade levels covered' },
              ].map((stat) => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 16px' }}>
                  <p style={{ color: '#1FB8A6', fontWeight: 700, fontSize: 26, margin: '0 0 6px' }}>{stat.num}</p>
                  <p style={{ color: '#B7C9C5', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(41,57,74,0.45)', marginTop: 14 }}>
            Figures from Al Noor&apos;s Fall 2025 pilot term.
          </p>
        </div>
      </div> */}

      {/* ================= PACKAGES ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Packages</p>
            <h2>A package sized for your school</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '10px auto 0' }}>
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
                highlight: false,
              },
              {
                name: 'School-wide',
                blurb: 'The most common setup for a full school rollout.',
                seats: '50–1,000 seats',
                features: ['All three tracks', 'Admin dashboard', 'Teacher training + support', 'Full academic year'],
                cta: 'Book a demo',
                highlight: true,
              },
              {
                name: 'District',
                blurb: 'Multiple schools under one contract and dashboard.',
                seats: '1,000+ seats',
                features: ['Everything in School-wide', 'Multi-school reporting', 'Dedicated success contact'],
                cta: 'Contact sales',
                highlight: false,
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  background: pkg.highlight ? '#0D2B32' : '#fff',
                  border: pkg.highlight ? 'none' : '1px solid #E4E9E7',
                  borderRadius: 20, padding: '30px 26px', display: 'flex', flexDirection: 'column',
                  boxShadow: pkg.highlight ? '0 12px 26px rgba(13,43,50,0.18)' : '0 1px 2px rgba(13,43,50,0.04)',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 19, margin: '0 0 6px', color: pkg.highlight ? '#F6F3EA' : '#0D2B32' }}>
                  {pkg.name}
                </p>
                <p style={{ fontSize: 13.5, margin: '0 0 4px', color: pkg.highlight ? '#1FB8A6' : '#5C7873', fontWeight: 600 }}>
                  {pkg.seats}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '10px 0 20px', color: pkg.highlight ? '#B7C9C5' : 'rgba(41,57,74,0.7)' }}>
                  {pkg.blurb}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {pkg.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: pkg.highlight ? '#F6F3EA' : '#0D2B32' }}>
                      <svg width={14} height={14} viewBox="0 0 16 16" style={{ marginTop: 3, flexShrink: 0 }}>
                        <path d="M3 8 L7 12 L13 4" stroke="#1FB8A6" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:hello@plulai.com">
                  <button className={pkg.highlight ? 'btn btn-cta btn-block' : 'btn btn-outline btn-block'}>
                    {pkg.cta} &rarr;
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,40 C300,0 600,70 900,30 C1100,5 1300,45 1440,20 L1440,70 L0,70 Z" fill="#1FB8A6" />
        </svg>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <div className={styles.testiSec}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: 'center', opacity: 0.7 }}>Loved by parents &amp; principals</p>
          <h2 style={{ textAlign: 'center' }}>What people are saying</h2>

          <div className={styles.testiCluster}>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                &quot;My 9-year-old asks to do his lesson after school. I never thought
                I&apos;d see that with coding.&quot;
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>L</div>
                <div>
                  <p className={styles.testiName}>Layla M.</p>
                  <p className={styles.testiRole}>Parent, Riyadh</p>
                </div>
              </div>
            </div>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                &quot;The Arabic isn&apos;t translated — it&apos;s native. That alone sets
                it apart in this region.&quot;
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>D</div>
                <div>
                  <p className={styles.testiName}>Dr. Khalid R.</p>
                  <p className={styles.testiRole}>Principal, Doha</p>
                </div>
              </div>
            </div>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                &quot;He built his first working game in two weeks. The AI tutor is more
                patient than I ever am.&quot;
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>S</div>
                <div>
                  <p className={styles.testiName}>Sara A.</p>
                  <p className={styles.testiRole}>Parent, Dubai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECURITY & COMPLIANCE ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Security &amp; compliance</p>
            <h2>Data your IT team can sign off on</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '10px auto 0' }}>
              Built with student privacy as a default, not an add-on.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginTop: 44 }}>
            {[
              {
                title: 'Student data stays protected',
                desc: 'Student accounts collect only what\u2019s needed to run lessons and track progress \u2014 never sold or used for advertising.',
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
                desc: 'Institution plans get a dedicated contact for data and security questions \u2014 not a support queue.',
              },
            ].map((item) => (
              <div key={item.title} style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 18, padding: '24px 22px' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: '#EAF6F3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                  }}
                >
                  <svg width={17} height={17} viewBox="0 0 20 20">
                    <path d="M10 2 L17 5 V10 C17 14 14 17 10 18 C6 17 3 14 3 10 V5 Z" fill="#1FB8A6" />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15.5, color: '#0D2B32', margin: '0 0 8px' }}>{item.title}</p>
                <p style={{ fontSize: 13.5, color: 'rgba(41,57,74,0.7)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(41,57,74,0.6)', marginTop: 28 }}>
            Questions for your IT or procurement team? <a href="mailto:hello@plulai.com" style={{ color: '#1FB8A6', fontWeight: 600 }}>Email us</a> for our data handling documentation.
          </p>
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className={styles.tracksHead}>
            <p className="eyebrow">FAQ</p>
            <h2>Common questions from schools</h2>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                q: 'What devices or browsers do we need?',
                a: 'Plulai runs in any modern browser \u2014 Chrome, Safari, or Edge \u2014 on Chromebooks, laptops, or tablets. No installation required.',
              },
              {
                q: 'How is student data handled?',
                a: 'We collect only what\u2019s needed to run lessons and track progress. Data is never sold or used for advertising. See the Security & Compliance section above, or email us for full documentation.',
              },
              {
                q: 'How long does onboarding take?',
                a: 'Most schools go from demo to a live pilot classroom within a week, and to full rollout within a month. A short teacher training session is included.',
              },
              {
                q: 'Can lessons fit inside a normal class period?',
                a: 'Yes \u2014 lessons are built in 15-minute units, so they fit inside a class period or an after-school slot without extra scheduling.',
              },
              {
                q: 'How does billing work for institutions?',
                a: 'Institution plans are billed per seat count and term length, with flexible invoicing. Book a demo and we\u2019ll put together a quote for your school.',
              },
              {
                q: 'Do teachers need a coding background?',
                a: 'No. Teachers get a short onboarding session and the lessons are designed to run themselves \u2014 the AI tutor handles most of the one-on-one guidance.',
              },
            ].map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={item.q} style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 15, fontWeight: 600, color: '#0D2B32', fontFamily: 'inherit',
                    }}
                  >
                    {item.q}
                    <span
                      style={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .2s ease',
                        fontSize: 20, color: '#1FB8A6', flexShrink: 0, marginLeft: 12, lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>
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
          <h2 className={styles.finalCtaTitle}>Ready to bring Plulai to your school?</h2>
          <p className={styles.finalCtaText}>
            Join the schools and institutions building the next generation of GCC creators.
          </p>
          <div className={styles.finalCtas}>
            <a href="#schools">
              <button className="btn btn-cta">Book a demo &rarr;</button>
            </a>
            <a href="mailto:hello@plulai.com">
              <button className="btn btn-outline btn-outline--on-dark">Talk to our team</button>
            </a>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <div className="wordmark">
                <span className="brand-mark">/</span>
                <span>Plulai</span>
              </div>
              <p className={styles.footerBrandText}>
                Building tomorrow&apos;s builders, today — made for the GCC.
              </p>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Product</p>
              <a href="#tracks">Tracks</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Schools</p>
              <a href="/schools">Overview</a>
              <a href="mailto:hello@plulai.com">Request demo</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Company</p>
              <a href="#">About</a>
              <a href="/ar">العربية</a>
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

function LockIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14">
      <rect x="3" y="6" width="8" height="6" rx="1" fill="#9AB5B0" />
      <path d="M4.5 6 V4 a2.5 2.5 0 0 1 5 0 V6" stroke="#9AB5B0" strokeWidth={1.6} fill="none" />
    </svg>
  )
}