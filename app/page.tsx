// File: page.tsx
// Placement: app/page.tsx
//
// 'use client' because the mobile nav menu needs local state.
// Nav is inlined here (not a separate component) to keep this a
// 3-file setup: page.tsx / page.module.css / ar/page.tsx.

'use client'

import { useState } from 'react'
import Marjan from '@/components/brand/Marjan'
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

  return (
    <>
      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navRow}>
            <a href="/" className="wordmark">
              <span className="brand-mark">/</span>
              <span>Plulai</span>
            </a>

            <div className={styles.navLinks}>
              <a href="#tracks">Tracks</a>
              <a href="#schools">For Schools</a>
              <a href="#pricing">Pricing</a>
            </div>

            <div className={styles.navRight}>
              <a href="/auth/login">Log in</a>
              <a href="/auth/signup"><button className="btn btn-dark">Try a free lesson &rarr;</button></a>
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
            <a href="#tracks" onClick={() => setNavOpen(false)}>Tracks</a>
            <a href="#schools" onClick={() => setNavOpen(false)}>For Schools</a>
            <a href="#pricing" onClick={() => setNavOpen(false)}>Pricing</a>
            <div className={styles.mobilePanelDivider} />
            <a href="/auth/login" onClick={() => setNavOpen(false)}>Log in</a>
            <a href="/auth/signup" onClick={() => setNavOpen(false)}>
              <button className="btn btn-cta btn-block">Try a free lesson &rarr;</button>
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
                150+ learners across the GCC
              </div>
              <h1 className={styles.heroTitle}>
                Where kids learn to code, think in AI, and build their first business.
              </h1>
              <p className={styles.heroSub}>
                15 minutes a day, taught in real Arabic or English — with an AI coach
                built around how kids actually learn.
              </p>
              <div className={styles.ctaRow}>
                <a href="/auth/signup"><button className="btn btn-cta">Try a free lesson &rarr;</button></a>
                <a href="mailto:hello@plulai.com"><button className="btn btn-outline">Book a live intro call</button></a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Marjan mood="neutral" size={280} />

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

      {/* ================= TRACKS: pearl cluster ================= */}
      <div id="tracks" className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Three tracks</p>
            <h2>Pick a starting point</h2>
          </div>

          <div className={styles.pearlCluster}>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleMd}`}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: 22, color: '#053D35' }}>{'{ }'}</span>
              </div>
              <p className={styles.pearlName}>Coding</p>
              <p className={styles.pearlDesc}>Blocks to real Python — build actual apps and games.</p>
              <p className={styles.pearlCta}>180+ lessons →</p>
            </div>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleLg}`}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: 26, color: '#402F12' }}>AI</span>
              </div>
              <p className={styles.pearlName}>AI &amp; Future Tech</p>
              <p className={styles.pearlDesc}>How AI actually works — prompting, data, real ML basics.</p>
              <p className={styles.pearlCta}>160+ lessons →</p>
            </div>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleSm}`}>
                <svg width={26} height={26} viewBox="0 0 20 20">
                  <rect x="2" y="12" width="4" height="6" fill="#fff" />
                  <rect x="8" y="7" width="4" height="11" fill="#fff" />
                  <rect x="14" y="2" width="4" height="16" fill="#fff" />
                </svg>
              </div>
              <p className={styles.pearlName}>Entrepreneurship</p>
              <p className={styles.pearlDesc}>Launch a first small venture — pricing, marketing, pitch.</p>
              <p className={styles.pearlCta}>140+ lessons →</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALUMNI PROJECTS ================= */}
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
              <a href="/auth/signup">
                <button className="btn btn-cta" style={{ marginTop: 24 }}>
                  Start the path &rarr;
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
                  <b>Arabic + English curriculum</b>
                  <span>Structured around the UAE&apos;s National AI Curriculum.</span>
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

      {/* ================= PRICING ================= */}
      <div id="pricing" className={styles.pricingSec}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: 'center' }}>Simple &amp; fair</p>
          <h2 style={{ textAlign: 'center' }}>Pick your plan</h2>

          <svg width={500} height={60} viewBox="0 0 500 60" style={{ margin: '50px auto 0', display: 'block', maxWidth: '100%' }}>
            <path d="M40 30 Q250 -10 460 30" fill="none" stroke="#D9E4E1" strokeWidth={2} />
            <circle cx={60} cy={27} r={10} fill="#1FB8A6" />
            <circle cx={250} cy={12} r={16} fill="#D4A24C" />
            <circle cx={440} cy={27} r={12} fill="#0D2B32" />
          </svg>

          <div className={styles.priceRow}>
            <div className={styles.pricePanel}>
              <p className={styles.planName}>Explorer</p>
              <p className={styles.planPrice}>Free</p>
              <p className={styles.planNote}>No card, no time limit</p>
              <div className={styles.planFeatures}>
                <span>First 5 lessons</span>
                <span>Coding basics</span>
              </div>
              <button className="btn btn-outline btn-block">Try free</button>
            </div>

            <div className={`${styles.pricePanel} ${styles.heroPlan}`}>
              <p className={styles.planName}>Prodigy · most popular</p>
              <p className={styles.planPrice}>$70<span style={{ fontSize: 13, opacity: 0.7 }}>/mo</span></p>
              <p className={styles.planNote}>14 days free, then $70/mo</p>
              <div className={styles.planFeatures}>
                <span>All three tracks</span>
                <span>Unlimited AI tutor</span>
                <span>Weekly parent summary</span>
              </div>
              <button className="btn btn-cta btn-block">Start free trial</button>
            </div>

            <div className={styles.pricePanel}>
              <p className={styles.planName}>Institution</p>
              <p className={styles.planPrice}>Custom</p>
              <p className={styles.planNote}>Schools, 50+ seats</p>
              <div className={styles.planFeatures}>
                <span>Teacher dashboard</span>
                <span>Bulk seat pricing</span>
              </div>
              <button className="btn btn-outline btn-block">Contact sales</button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className={styles.finalCta}>
        <div className="container">
          <h2 className={styles.finalCtaTitle}>Ready to give them a head start?</h2>
          <p className={styles.finalCtaText}>
            Join the families and schools building the next generation of GCC creators.
          </p>
          <div className={styles.finalCtas}>
            <a href="/auth/signup">
              <button className="btn btn-cta">Try a free lesson &rarr;</button>
            </a>
            <a href="mailto:hello@plulai.com">
              <button className="btn btn-outline btn-outline--on-dark">Book a live intro call</button>
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
              <a href="#">Tracks</a>
              <a href="#pricing">Pricing</a>
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