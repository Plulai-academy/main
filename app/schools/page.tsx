// File: page.tsx
// Placement: app/schools/page.tsx
//
// REBUILT to match the main site's design system (app/page.tsx / page.module.css)
// instead of a disconnected dark "Duolingo" theme with its own font stack and
// color tokens. Reuses the same nav, footer, section classes, and palette
// (navy #0D2B32, teal #1FB8A6, gold #D4A24C, cream #F6F3EA) as the homepage.
//
// CONTENT CHANGES:
// - Removed the "Delta Residency / Sam Altman" and "Khailee Ng / 500 Global"
//   credential claims per request — replaced with verifiable stats already
//   used elsewhere on the site (11+ partners, 9.2/10 satisfaction).
// - "GCC" region framing swapped to "MENA" to match the rest of the site.
// - Kept the workshop package pricing (Starter Workshop / Intensive Week /
//   Bootcamp / Annual Licence) as-is — that's a distinct in-person-workshop
//   offering from the seat-based platform packages on the homepage, so both
//   can coexist, just re-skinned to match the brand.

'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from '../page.module.css'

const PACKAGES = [
  {
    name: 'Starter Workshop',
    badge: null,
    duration: '1–2 days',
    price: '$800–$1,200',
    color: '#1FB8A6',
    colorBg: '#EAF6F3',
    includes: [
      'Intro to AI + vibe coding',
      'One session per age group',
      'Certificate for every student',
      'Hands-on project demo',
    ],
    ideal: 'A low-commitment first step with high impact.',
    icon: (
      <svg width={22} height={22} viewBox="0 0 20 20">
        <rect x="2" y="4" width="16" height="13" rx="2" stroke="#fff" strokeWidth="1.6" fill="none" />
        <path d="M2 8 H18" stroke="#fff" strokeWidth="1.6" />
        <path d="M6 2 V5.5 M14 2 V5.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Intensive Week',
    badge: 'Most popular',
    duration: '1 week (5 days)',
    price: '$2,500–$3,500',
    color: '#D4A24C',
    colorBg: '#FBF1DE',
    includes: [
      'Full Coding + AI + Entrepreneurship track',
      'Students build a working project',
      'Mini Demo Day on the last day',
      'Teacher training included',
      'Certificate for every student',
    ],
    ideal: 'The format most schools turn into a multi-year partnership.',
    icon: (
      <svg width={22} height={22} viewBox="0 0 20 20">
        <path d="M10 2 L12.2 7.4 L18 8.2 L13.8 12.1 L15 18 L10 15 L5 18 L6.2 12.1 L2 8.2 L7.8 7.4 Z" fill="#402F12" />
      </svg>
    ),
  },
  {
    name: 'SharkKid Bootcamp',
    badge: 'Maximum impact',
    duration: '2–4 weeks',
    price: '$4,500–$8,000',
    color: '#0D2B32',
    colorBg: '#EEF2F1',
    includes: [
      'Full SharkKid entrepreneurship curriculum',
      'A real startup built end-to-end',
      'Demo Day with local investors',
      'Media coverage opportunity',
      'Certificate + portfolio for every student',
    ],
    ideal: 'The flagship program — schools that run it become known for it.',
    icon: (
      <svg width={22} height={22} viewBox="0 0 20 20">
        <path d="M11 2 C14.5 5 15.5 9 13.5 13.5 L11 19 L8.5 13.5 C6.5 9 7.5 5 11 2 Z" fill="#fff" />
        <circle cx="11" cy="8.5" r="2" fill="#0D2B32" />
      </svg>
    ),
  },
  {
    name: 'Annual Platform Licence',
    badge: 'Online · No travel',
    duration: '12 months online',
    price: '$2,000–$5,000',
    color: '#1FB8A6',
    colorBg: '#EAF6F3',
    includes: [
      'Plulai platform access for all students',
      'Monthly progress reports',
      'Arabic, French & English — no travel required',
      'Parent communication built in',
    ],
    ideal: 'Best for always-on, curriculum-aligned learning.',
    icon: (
      <svg width={22} height={22} viewBox="0 0 20 20">
        <rect x="2" y="3" width="16" height="11" rx="1.5" stroke="#fff" strokeWidth="1.6" fill="none" />
        <path d="M7 17 H13 M10 14 V17" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
]

const PROCESS = [
  { n: '01', title: 'Book a 20-min call', badge: 'Day 1', desc: 'We scope the format, age groups, timing, and budget together. No obligation.' },
  { n: '02', title: 'Receive a custom proposal', badge: 'Day 2–3', desc: 'Tailored to your school — curriculum outline, logistics, and pricing in one document.' },
  { n: '03', title: 'Sign & pay 50% upfront', badge: 'Week 1', desc: '50% secures the date. We handle everything from here — curriculum, materials, localisation.' },
  { n: '04', title: 'We arrive & deliver', badge: 'Workshop', desc: 'Our team runs every session, manages the students, and keeps you updated throughout.' },
  { n: '05', title: 'Demo Day & certificates', badge: 'Final day', desc: 'Students present their projects, every student gets a certificate, and the school gets a full impact report.' },
]

const FAQS = [
  { q: 'Do you travel to our school?', a: 'Yes — for the Starter Workshop, Intensive Week, and SharkKid Bootcamp, we come to you. The Annual Platform Licence is fully online and requires no travel.' },
  { q: 'What ages do you work with?', a: 'Ages 6–18. We adapt the curriculum per age group: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14), and Tech Experts (15–18).' },
  { q: 'Is the content in Arabic?', a: 'Yes — real Arabic and French, not machine-translated. Full RTL support, with an AI coach that teaches natively alongside English.' },
  { q: 'What does the school need to prepare?', a: 'Just a room and students. We bring the curriculum, materials, and facilitation. For the online licence, students need a device and internet access.' },
  { q: 'How many students per session?', a: 'We recommend 15–25 students per session for in-person formats. The online platform scales to any school size.' },
  { q: 'Can we customise the curriculum?', a: 'Yes. For the Intensive Week and Bootcamp, we tailor the content to your school\u2019s context, vision, and student level.' },
]

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" style={{ marginTop: 3, flexShrink: 0 }}>
      <path d="M3 8 L7 12 L13 4" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SchoolsPage() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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

            <div className={styles.navLinks} style={{ color: '#0D2B32' }}>
              <a href="/#tracks" style={{ color: '#0D2B32' }}>Tracks</a>
              <a href="/schools" style={{ color: '#1FB8A6', fontWeight: 700 }}>For Schools</a>
            </div>

            <div className={styles.navRight}>
              <a href="/auth/login" style={{ color: '#0D2B32' }}>Log in</a>
              <a href="mailto:hello@plulai.com"><button className="btn btn-dark">Book a demo &rarr;</button></a>
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
            <a href="/#tracks" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32' }}>Tracks</a>
            <a href="/schools" onClick={() => setNavOpen(false)} style={{ color: '#1FB8A6', fontWeight: 700 }}>For Schools</a>
            <div className={styles.mobilePanelDivider} />
            <a href="/auth/login" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32' }}>Log in</a>
            <a href="mailto:hello@plulai.com" onClick={() => setNavOpen(false)}>
              <button className="btn btn-cta btn-block">Book a demo &rarr;</button>
            </a>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div className={styles.hero}>
        <span aria-hidden className={styles.heroWatermark}>/</span>
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div className={styles.statBadge} style={{ margin: '0 auto 24px' }}>
              <span className={styles.statDot} />
              For Schools · MENA &amp; International
            </div>

            <h1 className={styles.heroTitle}>
              Bring coding, AI &amp; entrepreneurship to your students.
            </h1>

            <p className={styles.heroSub} style={{ margin: '0 auto 28px' }}>
              Workshop formats for every budget and timeline. We come to you — in
              Arabic, French, and English, for ages 6–18, across MENA and
              internationally.
            </p>

            <div style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 20, padding: '22px 26px', marginBottom: 32, textAlign: 'left' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: '#5C7873', marginBottom: 8 }}>
                Why schools trust us
              </p>
              <p style={{ fontSize: 14, color: 'rgba(41,57,74,0.7)', lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: '#0D2B32' }}>11+ partner schools across MENA</strong> and a{' '}
                <strong style={{ color: '#0D2B32' }}>9.2/10 satisfaction score</strong> — with a curriculum
                built natively in Arabic, French, and English, not translated from somewhere else.
              </p>
            </div>

            <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
              <a href="mailto:hello@plulai.com"><button className="btn btn-cta">Book a 20-min demo &rarr;</button></a>
              <a href="mailto:hello@plulai.com"><button className="btn btn-outline">Get the curriculum guide</button></a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,30 C240,80 480,0 720,25 C960,50 1200,10 1440,35 L1440,70 L0,70 Z" fill="#F6F3EA" />
        </svg>
      </div>

      {/* ================= STATS ================= */}
      <div className={styles.statsSec}>
        <div className="container">
          <div className={styles.statsRow}>
            <div><div className={styles.statNum}>11+</div><div className={styles.statLabel}>Partner schools</div></div>
            <div><div className={styles.statNum}>200+</div><div className={styles.statLabel}>Students trained</div></div>
            <div><div className={styles.statNum}>3</div><div className={styles.statLabel}>Languages taught</div></div>
            <div><div className={styles.statNum}>9.2/10</div><div className={styles.statLabel}>Satisfaction</div></div>
          </div>
        </div>
      </div>

      {/* ================= PRICING ADVANTAGE ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div style={{ maxWidth: 780, margin: '0 auto', background: '#EAF6F3', border: '1px solid rgba(31,184,166,0.25)', borderRadius: 20, padding: '24px 28px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1FB8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path d="M3 14 L8 9 L11.5 12 L17 5" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 5 H17 V9" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: '#0D2B32', margin: '0 0 8px' }}>
                Your pricing advantage
              </p>
              <p style={{ fontSize: 14, color: 'rgba(41,57,74,0.75)', lineHeight: 1.7, margin: 0 }}>
                International workshops from Western providers typically run{' '}
                <strong style={{ color: '#0D2B32' }}>$5,000–$15,000 per week</strong>. Plulai delivers the same
                quality starting at <strong style={{ color: '#0D2B32' }}>$800</strong> — built for the region,
                not flown in for it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PACKAGES ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">School packages</p>
            <h2>Pick the format that fits your school</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 560, margin: '10px auto 0' }}>
              From a one-day taster to a full-year licence. Every package includes
              certification for students and full facilitation by our team.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 44 }}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  background: '#fff', border: '1px solid #E4E9E7', borderRadius: 20,
                  padding: '28px 26px', display: 'flex', gap: 20, alignItems: 'flex-start',
                  boxShadow: '0 1px 2px rgba(13,43,50,0.04)',
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: pkg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {pkg.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: 0 }}>{pkg.name}</p>
                        {pkg.badge && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: pkg.colorBg, color: pkg.color === '#D4A24C' ? '#402F12' : pkg.color }}>
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 22, color: '#0D2B32' }}>{pkg.price}</span>
                        <span style={{ fontSize: 13, color: '#5C7873', fontWeight: 600 }}>· {pkg.duration}</span>
                      </div>
                    </div>
                    <a href="mailto:hello@plulai.com">
                      <button className="btn btn-cta">Enquire &rarr;</button>
                    </a>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pkg.includes.map((f) => (
                      <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: 'rgba(41,57,74,0.75)' }}>
                        <CheckIcon color={pkg.color} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: pkg.colorBg, color: pkg.color === '#D4A24C' ? '#402F12' : pkg.color, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>
                    ✦ {pkg.ideal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= PAYMENT & LOGISTICS ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">Payment &amp; logistics</p>
            <h2>Simple structure, no surprises</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 44 }}>
            <div style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 18, padding: '24px 22px' }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#D4A24C', margin: '0 0 10px' }}>Payment structure</p>
              <p style={{ fontSize: 13.5, color: 'rgba(41,57,74,0.7)', lineHeight: 1.6, margin: 0 }}>
                Always <strong style={{ color: '#0D2B32' }}>50% upfront, 50% on arrival</strong>. A $2,500
                Intensive Week means $1,250 upfront to secure the date.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 18, padding: '24px 22px' }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1FB8A6', margin: '0 0 10px' }}>What we handle</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Curriculum & materials', 'Facilitation & teaching', 'Arabic & French localisation', 'Student certificates', 'Parent communication'].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: 'rgba(41,57,74,0.75)' }}>
                    <CheckIcon color="#1FB8A6" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 18, padding: '24px 22px' }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#0D2B32', margin: '0 0 10px' }}>What the school provides</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['A room', 'Students (15–25 per session)', 'Devices or computer lab', 'Internet access'].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: 'rgba(41,57,74,0.7)' }}>
                    <CheckIcon color="#5C7873" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#0D2B32', borderRadius: 18, padding: '24px 22px' }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1FB8A6', margin: '0 0 10px' }}>Proven across the region</p>
              <p style={{ fontSize: 13.5, color: '#B7C9C5', lineHeight: 1.6, margin: 0 }}>
                11+ partner schools across MENA and a 9.2/10 satisfaction score —
                built and run by a team fluent in the region&apos;s classrooms, not
                flown in from abroad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PROCESS ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className={styles.tracksHead}>
            <p className="eyebrow">How it works</p>
            <h2>From first email to Demo Day</h2>
          </div>

          <div style={{ marginTop: 44 }}>
            {PROCESS.map((s, i, arr) => (
              <div key={s.n} style={{ display: 'flex', gap: 20, padding: '22px 0', borderBottom: i < arr.length - 1 ? '1px solid #E4E9E7' : 'none' }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%', background: i === arr.length - 1 ? '#1FB8A6' : '#0D2B32',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#0D2B32', margin: 0 }}>{s.title}</p>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#EAF6F3', color: '#0D2B32' }}>
                      {s.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'rgba(41,57,74,0.7)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className={styles.tracksHead}>
            <p className="eyebrow">FAQ</p>
            <h2>Questions schools always ask</h2>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((item, i) => {
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
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, margin: '0 auto 20px',
              padding: '7px 15px', borderRadius: 999, background: 'rgba(31,184,166,0.14)',
              color: '#1FB8A6', fontSize: 13, fontWeight: 700,
            }}
          >
            ✓ 11+ schools already partnered
          </div>
          <h2 className={styles.finalCtaTitle}>Ready to bring Plulai to your students?</h2>
          <p className={styles.finalCtaText}>
            Book a free 20-minute call. No commitment — we&apos;ll recommend the
            right package for your school.
          </p>
          <div className={styles.finalCtas}>
            <a href="mailto:hello@plulai.com">
              <button className="btn btn-cta">Book a free demo &rarr;</button>
            </a>
            <a href="mailto:hello@plulai.com">
              <button className="btn btn-outline btn-outline--on-dark">Email us directly</button>
            </a>
          </div>
          <p style={{ fontSize: 13, color: '#8FA8A3', marginTop: 20 }}>hello@plulai.com</p>
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
                Building tomorrow&apos;s builders, today — made for the MENA region.
              </p>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Product</p>
              <a href="/#tracks">Tracks</a>
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