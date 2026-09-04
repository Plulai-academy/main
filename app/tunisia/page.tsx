// File: app/tunisia/page.tsx
//
// Server Component (no 'use client') — metadata export needs this, and it
// ships as plain HTML for crawlers instead of waiting on client JS.
// Reuses the same visual language as the homepage (components/HomeClient.tsx):
// illustrated tracks cards, hero mascot + float badges, dashMock previews.
// FAQ uses native <details>/<summary> — zero JS, still collapsible, still
// fully indexable by Google.

import type { Metadata } from 'next'
import Image from 'next/image'
import styles from '@/app/page.module.css'

const SITE_URL = 'https://plulai.com' // <-- replace with your real domain

export const metadata: Metadata = {
  title: 'Kids Coding & AI Classes in Tunisia | Plulai',
  description: 'AI, coding, and entrepreneurship classes for kids ages 6-18 in Tunisia. Self-paced online learning in Arabic or French, plus curriculum for schools in Tunis, Sfax, and beyond.',
  alternates: { canonical: `${SITE_URL}/tunisia` },
  openGraph: {
    title: 'Kids Coding & AI Classes in Tunisia | Plulai',
    description: 'AI, coding, and entrepreneurship classes for kids ages 6-18 in Tunisia. Self-paced online learning in Arabic or French, plus curriculum for schools in Tunis, Sfax, and beyond.',
    url: `${SITE_URL}/tunisia`,
    images: ['/og-image.png'],
  },
}

function JsonLd() {
  const orgData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Plulai',
    url: `${SITE_URL}/tunisia`,
    areaServed: { '@type': 'Country', name: 'Tunisia' },
    description: 'AI, coding, and entrepreneurship classes for kids ages 6-18 in Tunisia. Self-paced online learning in Arabic or French, plus curriculum for schools in Tunis, Sfax, and beyond.',
  }
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{"@type": "Question", "name": "Is Plulai available in Tunis and across Tunisia?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — Tunisia is our home market. The family plan is fully online, and we already partner with schools locally for in-person workshops."}}, {"@type": "Question", "name": "What languages are lessons taught in?", "acceptedAnswer": {"@type": "Answer", "text": "Arabic and French, taught natively — not machine-translated."}}, {"@type": "Question", "name": "How much does it cost?", "acceptedAnswer": {"@type": "Answer", "text": "Families get a 14-day free trial, then $70/month (approximately 217 TND), billed in USD. School and training center pricing is scoped to seat count — book a demo for a quote."}}, {"@type": "Question", "name": "What ages is Plulai for?", "acceptedAnswer": {"@type": "Answer", "text": "Ages 6 to 18, with the curriculum adapted per age group."}}, {"@type": "Question", "name": "Do you already work with schools in Tunisia?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — we have partner schools in Tunisia already using Plulai. Book a demo to talk about your school specifically."}}],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
    </>
  )
}

export default function TunisiaPage() {
  return (
    <>
      <JsonLd />

      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navRow}>
            <a href="/?intl=1" aria-label="Plulai home" style={{ display: 'flex', alignItems: 'center' }}>
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
              <a href="#tracks" style={{ color: '#0D2B32' }}>Tracks</a>
              <a href="#pitch" style={{ color: '#0D2B32' }}>For Families &amp; Schools</a>
              <a href="/schools" style={{ color: '#0D2B32' }}>Schools</a>
            </div>
            <div className={styles.navRight}>
              <a href="/auth/login" style={{ color: '#0D2B32' }}>Log in</a>
              <a href="/auth/signup"><button className="btn btn-dark">Start free trial &rarr;</button></a>
            </div>
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
                Now serving families &amp; schools in Tunisia
              </div>
              <h1 className={styles.heroTitle}>
                AI, Coding &amp; Entrepreneurship Classes for Kids in Tunisia
              </h1>
              <p className={styles.heroSub}>
                15 minutes a day, taught in real Arabic or French — with
                an AI coach built around how kids actually learn. Available online
                across Tunisia (Tunis, Sfax, Sousse), with in-person workshops available
                for schools on request.
              </p>
              <div className={styles.ctaRow}>
                <a href="/auth/signup"><button className="btn btn-cta">Start free trial &rarr;</button></a>
                <a href="/schools"><button className="btn btn-outline">Book a demo for your school &rarr;</button></a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Image
                src="/avatars/heroplulai.png"
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
                  <div className={styles.floatBadgeSub}>Tunis · Coding</div>
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

      {/* ================= FAMILY + SCHOOLS PITCH (both shown, no toggle) ================= */}
      <div id="pitch" className={styles.schoolsSec} style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div className={styles.schoolsGrid}>
            <div>
              <span className="pill">For Families in Tunisia</span>
              <h2 style={{ marginTop: 18 }}>Learning that fits your family&apos;s schedule.</h2>
              <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 460 }}>
                No classroom, no fixed timetable — 15 minutes a day, self-paced,
                in Arabic or French. A 14-day free trial, then
                $70/month (approximately 217 TND).
              </p>
              <div className={styles.schoolsList}>
                <div className={styles.schoolsItem}>
                  <b>Learn anytime, anywhere in Tunisia</b>
                  <span>Self-paced lessons your child starts and stops on their own.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>Arabic &amp; French</b>
                  <span>A native curriculum, not translated from somewhere else.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>Weekly parent summary</b>
                  <span>See what they learned and where they got stuck.</span>
                </div>
              </div>
              <div className={styles.ctaRow}>
                <a href="/auth/signup"><button className="btn btn-dark">Start free trial &rarr;</button></a>
              </div>
            </div>
            <div className={styles.dashMock}>
              <div className={styles.dashBar}>
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
              </div>
              <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>This week</p>
              <div className={styles.rosterRow}><span>Lessons completed</span><span>5 / 5</span></div>
              <div className={styles.rosterRow}><span>Current streak</span><span style={{ color: '#D4A24C' }}>4 pearls 🔥</span></div>
              <div className={styles.rosterRow}><span>Track</span><span>Coding</span></div>
            </div>
          </div>

          <div className={styles.schoolsGrid} style={{ marginTop: 56 }}>
            <div>
              <span className="pill">For Schools &amp; Training Centers</span>
              <h2 style={{ marginTop: 18 }}>Bring Plulai into your classroom in Tunisia.</h2>
              <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 460 }}>
                A curriculum your teachers can run — with a dashboard that flags
                who&apos;s stuck before report cards do. Delivered online or in
                person for schools in Tunisia.
              </p>
              <div className={styles.schoolsList}>
                <div className={styles.schoolsItem}>
                  <b>Bulk seats, 50–5,000</b>
                  <span>Regional pricing, flexible billing.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>Arabic &amp; French curriculum</b>
                  <span>Built for Tunisia classrooms, not translated from somewhere else.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>Dedicated support</b>
                  <span>Onboarding, training, a named success contact.</span>
                </div>
              </div>
              <div className={styles.ctaRow}>
                <a href="/schools"><button className="btn btn-dark">Book a demo &rarr;</button></a>
              </div>
            </div>
            <div className={styles.dashMock}>
              <div className={styles.dashBar}>
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
              </div>
              <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>Grade 5B — Coding Track</p>
              <div className={styles.rosterRow}><span>Sara K.</span><span>80%</span></div>
              <div className={styles.rosterRow}><span>Ali M.</span><span>45%</span></div>
              <div className={styles.rosterRow}>
                <span>Yousef A. <span style={{ color: '#D4A24C' }}>· stuck</span></span>
                <span>15%</span>
              </div>
            </div>
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
              What your kids will learn
              <svg width="280" height="14" viewBox="0 0 280 14" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -10 }} aria-hidden>
                <path d="M4 8 Q40 -2 76 8 T148 8 T220 8 T276 8" stroke="#D4A24C" strokeWidth={3} fill="none" strokeLinecap="round" />
              </svg>
            </h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '22px auto 0' }}>
              Three tracks, one path — sequenced by age so it drops straight into
              a class period or a family&apos;s daily 15 minutes.
            </p>
          </div>

          <div style={{ position: 'relative', marginTop: 64, paddingBottom: 30 }}>
            <svg className="trk-path" viewBox="0 0 1000 120" preserveAspectRatio="none" style={{ position: 'absolute', top: 60, left: 0, width: '100%', height: 120, zIndex: 0 }} aria-hidden>
              <path d="M110 100 C 250 20, 400 20, 500 60 S 750 100, 890 20" stroke="#C9DAD5" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" fill="none" />
              <circle cx="110" cy="100" r="6" fill="#1FB8A6" />
              <circle cx="500" cy="60" r="6" fill="#D4A24C" />
              <circle cx="890" cy="20" r="6" fill="#053D35" />
            </svg>
            <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: -30, left: '18%', opacity: 0.6 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill="#D4A24C" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 22 22" style={{ position: 'absolute', top: 10, right: '12%', opacity: 0.5 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill="#1FB8A6" />
            </svg>

            <div className="trk-row" style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 32 }}>
              <div className="trk-card" style={{ width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px', border: '2px solid #0D2B32', boxShadow: '0 8px 0 #0D2B32', transform: 'rotate(-3deg)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -14, left: 20, transform: 'rotate(-6deg)', background: '#0D2B32', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3 }}>
                  STOP 01 · AGES 8–16
                </span>
                <div style={{ width: 76, height: 76, margin: '18px auto 16px', borderRadius: '63% 37% 54% 46% / 55% 45% 45% 55%', background: 'linear-gradient(135deg, #1FB8A6, #17948A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#fff' }}>{'{ }'}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>Coding</p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  Blocks to real Python — students ship actual apps and games.
                </p>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#1FB8A6', margin: 0 }}>180+ lessons →</p>
              </div>

              <div className="trk-card" style={{ width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px', border: '2px solid #402F12', boxShadow: '0 8px 0 #D4A24C', transform: 'translateY(-18px) rotate(2deg)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -14, left: 20, transform: 'rotate(4deg)', background: '#D4A24C', color: '#402F12', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3 }}>
                  STOP 02 · AGES 10–16
                </span>
                <div style={{ width: 76, height: 76, margin: '18px auto 16px', borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%', background: 'linear-gradient(135deg, #E8BE72, #D4A24C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#402F12' }}>AI</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>AI &amp; Future Tech</p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  Prompting, data, and real ML basics — AI literacy from day one.
                </p>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#D4A24C', margin: 0 }}>160+ lessons →</p>
              </div>

              <div className="trk-card" style={{ width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px', border: '2px solid #053D35', boxShadow: '0 8px 0 #053D35', transform: 'rotate(-2deg)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -14, left: 20, transform: 'rotate(-5deg)', background: '#053D35', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3 }}>
                  STOP 03 · AGES 10–16
                </span>
                <div style={{ width: 76, height: 76, margin: '18px auto 16px', borderRadius: '50% 50% 38% 62% / 60% 45% 55% 40%', background: 'linear-gradient(135deg, #145048, #053D35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width={26} height={26} viewBox="0 0 20 20">
                    <rect x="2" y="12" width="4" height="6" fill="#fff" />
                    <rect x="8" y="7" width="4" height="11" fill="#fff" />
                    <rect x="14" y="2" width="4" height="16" fill="#fff" />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>Entrepreneurship</p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  A first small venture — pricing, marketing, and a real pitch.
                </p>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#053D35', margin: 0 }}>140+ lessons →</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOCAL DEPTH CONTENT (unique per-country text for SEO) ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 26, color: '#0D2B32', marginBottom: 16 }}>AI and Coding Education for Kids in Tunisia</h2>
          <p style={{ color: 'rgba(41,57,74,0.75)', lineHeight: 1.75, marginBottom: 20 }}>
            Tunisia is Plulai&apos;s home market — families in Tunis, Sfax, and Sousse were the first to use the platform, and partner schools here are already running it in real classrooms. That means the curriculum, the Arabic and French language tracks, and the day-to-day support aren&apos;t an afterthought for this market — they were built around it from the start.
          </p>
          <p style={{ color: 'rgba(41,57,74,0.75)', lineHeight: 1.75 }}>
            For families, that&apos;s a 14-day free trial and 15 minutes a day, self-paced, in Arabic or French. For schools and training centers, it&apos;s a classroom-ready curriculum with sessions built for a 30–45 minute class period and a teacher dashboard that flags who&apos;s falling behind — already in use at partner schools across Tunisia. Book a demo to see it, or start a free trial directly.
          </p>
        </div>
      </div>

      {/* ================= FAQ (native details/summary — zero JS) ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className={styles.tracksHead}>
            <p className="eyebrow">FAQ</p>
            <h2>Questions from families &amp; schools in Tunisia</h2>
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <details style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', padding: '4px 20px' }}>
              <summary style={{ padding: '14px 0', fontSize: 15, fontWeight: 600, color: '#0D2B32', cursor: 'pointer' }}>Is Plulai available in Tunis and across Tunisia?</summary>
              <p style={{ margin: 0, padding: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>Yes — Tunisia is our home market. The family plan is fully online, and we already partner with schools locally for in-person workshops.</p>
            </details>
            <details style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', padding: '4px 20px' }}>
              <summary style={{ padding: '14px 0', fontSize: 15, fontWeight: 600, color: '#0D2B32', cursor: 'pointer' }}>What languages are lessons taught in?</summary>
              <p style={{ margin: 0, padding: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>Arabic and French, taught natively — not machine-translated.</p>
            </details>
            <details style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', padding: '4px 20px' }}>
              <summary style={{ padding: '14px 0', fontSize: 15, fontWeight: 600, color: '#0D2B32', cursor: 'pointer' }}>How much does it cost?</summary>
              <p style={{ margin: 0, padding: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>Families get a 14-day free trial, then $70/month (approximately 217 TND), billed in USD. School and training center pricing is scoped to seat count — book a demo for a quote.</p>
            </details>
            <details style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', padding: '4px 20px' }}>
              <summary style={{ padding: '14px 0', fontSize: 15, fontWeight: 600, color: '#0D2B32', cursor: 'pointer' }}>What ages is Plulai for?</summary>
              <p style={{ margin: 0, padding: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>Ages 6 to 18, with the curriculum adapted per age group.</p>
            </details>
            <details style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', padding: '4px 20px' }}>
              <summary style={{ padding: '14px 0', fontSize: 15, fontWeight: 600, color: '#0D2B32', cursor: 'pointer' }}>Do you already work with schools in Tunisia?</summary>
              <p style={{ margin: 0, padding: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>Yes — we have partner schools in Tunisia already using Plulai. Book a demo to talk about your school specifically.</p>
            </details>
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className={styles.finalCta}>
        <div className="container">
          <h2 className={styles.finalCtaTitle}>Ready to start in Tunisia?</h2>
          <p className={styles.finalCtaText}>Free 14-day trial for families. Free demo for schools.</p>
          <div className={styles.finalCtas}>
            <a href="/auth/signup"><button className="btn btn-cta">Start free trial &rarr;</button></a>
            <a href="/schools"><button className="btn btn-outline btn-outline--on-dark">Book a demo &rarr;</button></a>
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
              <p className={styles.footerBrandText}>Building tomorrow&apos;s builders, today — made for the MENA region.</p>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Product</p>
              <a href="/?intl=1#tracks">Tracks</a>
              <a href="/?intl=1#plans">Pricing</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Also serving</p>
              <a href="/qatar">Qatar</a>
              <a href="/uae">the UAE</a>
              <a href="/saudi-arabia">Saudi Arabia</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Company</p>
              <a href="/?intl=1">Home</a>
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