// File: AboutClient.tsx
// Placement: components/AboutClient.tsx
// Rendered by app/about/page.tsx. Shares its styles with the landing page.
// Details come from Mohamed's CV; the personal phone and Gmail are left out on purpose.

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { css } from './plulai-styles'

const FOUNDER = {
  name: 'Mohamed Zouari',
  initials: 'MZ',
  badge: 'Founder & CEO',
  role: 'Founder & CEO, Plulai Consulting FZCO',
  photo: '', // e.g. '/founder.jpg' (file in /public)
  linkedin: 'https://linkedin.com/in/mohamed-zouari-ab7196207',
  site: 'https://mohamedzouari.netlify.app',
  bio: 'Mohamed is a Python developer and tech entrepreneur from Tunisia. He has been building apps and games and leading hackathons and bootcamps since 2023, and started a tech club for high school students in Sfax. He founded Plulai to give kids across the MENA region a real path into coding, AI and life skills, in Arabic, French and English.',
  highlights: [
    { title: 'Founder & CEO, Plulai', sub: 'Since January 2025' },
    { title: 'Educator', sub: 'Harvard Business Impact Education' },
    { title: 'Delta Residency 2025', sub: 'Top 15 out of 1,500' },
    { title: 'Tech club founder', sub: 'For Sfax high school students' },
  ],
}

const work = [
  { when: 'Jan 2025 – Present', title: 'Founder & CEO', org: 'Plulai', text: 'Building an online coding, AI and life-skills program for kids and schools across MENA.' },
  { when: 'Jan 2025 – Present', title: 'Chief Executive Officer', org: 'Bloolabb · Hybrid, San Francisco, USA', text: '' },
  { when: 'Oct 2025 – Present', title: 'Educator', org: 'Harvard Business Impact Education', text: '' },
  { when: 'Jul – Oct 2024', title: 'Data Specialist', org: 'Tijara Lab · Sfax, Tunisia', text: '' },
]

const programs = [
  'Delta Residency Program (2025): top 15 out of 1,500',
  'BigTech Africa (2025): Pan-African technology and innovation program',
  'Mentorship by a Managing Partner at 500 Global (2025)',
  'LaunchX Entrepreneurship Program, MIT & LaunchX (2024)',
  'Startup School Online, entrepreneurship program (2024–25)',
  'Entrepreneurship course, Stanford + Y Combinator (2024)',
]

const builds = [
  'Summer Camp MTC: intensive app development bootcamp and hackathon (Jun 2023)',
  'DevHacks V1: organized a web development hackathon (Jul 2023)',
  'DevHacks V2: led a web development hackathon (Aug 2023)',
  'DET Camp: game and Flutter development (Dec 2023)',
  'Founded a tech club for Sfax high school students (2023–24)',
]

const certs = [
  { title: 'AI', items: ['Generative AI, Google (2024)', 'Generative AI: Prompt Engineering Basics, IBM (2026)', 'Introduction to AI, Google (2026)', 'Introduction to AI & Machine Learning, University of Helsinki', 'AI Developer, GoMyCode'] },
  { title: 'Programming & games', items: ['Python Programmer, GoMyCode', 'Programming for Everybody, University of Michigan', 'Python Fundamentals, University of Colorado Boulder', 'Unity Developer Certification (2021)', 'Unity Game Developer Badge (2024)'] },
  { title: 'Business & leadership', items: ['Entrepreneurship, Stanford + Y Combinator and MIT (2024)', 'Business Management, OpenClassrooms (2024)', 'Leadership, Udemy (2024)', 'Foundations of Foresight, Dubai Future Foundation (2023)', 'Management Communication, Peking University (2025)'] },
]

const skills = ['Python', 'C++', 'Unity & C#', 'C', 'HTML & CSS', 'Flutter', 'AI & machine learning', 'Generative AI', 'Prompt engineering', 'Product strategy', 'Public speaking & pitching', 'Mentorship & education']

const Check = () => (
  <span className="pl-check" aria-hidden>
    <svg width={12} height={12} viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
)
const Arrow = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function Block({ tone, title, sub, children }: { tone: 'cream' | 'white'; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className={`pl-sec pl-${tone}`}>
      <div className="pl-wrap">
        <header className="pl-head"><h2>{title}</h2>{sub && <p>{sub}</p>}</header>
        {children}
      </div>
    </section>
  )
}

export default function AboutClient() {
  const [navOpen, setNavOpen] = useState(false)

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
            '@type': 'ProfilePage',
            mainEntity: {
              '@type': 'Person',
              name: FOUNDER.name,
              jobTitle: 'Founder & CEO',
              worksFor: { '@type': 'Organization', name: 'Plulai Consulting FZCO', url: 'https://plulai.com' },
              url: 'https://plulai.com/about',
              sameAs: [FOUNDER.linkedin, FOUNDER.site],
              knowsAbout: ['Artificial intelligence', 'Python', 'Game development', 'Entrepreneurship', 'Education technology'],
            },
          }),
        }}
      />

      {/* NAV */}
      <header className="pl-navwrap">
        <nav className="pl-nav" aria-label="Main">
          <a href="/" aria-label="Plulai home" className="pl-logo">
            <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 30 }} />
          </a>
          <div className="pl-navlinks">
            <a href="/">Home</a>
            <a href="/#path">The path</a>
            <a href="/#plans">Pricing</a>
            <a href="/about" className="on">About</a>
          </div>
          <div className="pl-navright">
            <a href="/ar" className="pl-lang" lang="ar" hrefLang="ar">العربية</a>
            <a href="/auth/login" className="pl-login">Log in</a>
            <a href="/" className="pl-btn pl-btn-primary pl-btn-sm">Back to Plulai</a>
          </div>
          <button type="button" className="pl-burger" aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
            <span className={navOpen ? 'x1' : ''} /><span className={navOpen ? 'x2' : ''} /><span className={navOpen ? 'x3' : ''} />
          </button>
        </nav>
        {navOpen && (
          <div className="pl-mobile">
            <a href="/">Home</a>
            <a href="/#path">The path</a>
            <a href="/#plans">Pricing</a>
            <a href="/auth/login">Log in</a>
            <a href="/ar" lang="ar" hrefLang="ar">العربية</a>
            <a href="/" className="pl-btn pl-btn-primary">Back to Plulai</a>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* INTRO */}
        <section className="pl-sec pl-cream pl-aboutTop" style={{ paddingBottom: 64 }}>
          <div className="pl-wrap">
            <div className="pl-who">
              <div className="pl-whophoto">
                {FOUNDER.photo ? (
                  <Image src={FOUNDER.photo} alt={`${FOUNDER.name}, founder of Plulai`} fill priority sizes="(max-width: 800px) 100vw, 40vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="pl-initials" aria-hidden>{FOUNDER.initials}</span>
                )}
                <span className="pl-whobadge">{FOUNDER.badge}</span>
              </div>
              <div className="pl-whocopy">
                <span className="pl-tag">About</span>
                <h1 className="pl-h2" style={{ fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{FOUNDER.name}</h1>
                <p className="pl-frole">{FOUNDER.role}</p>
                <p className="pl-sub">{FOUNDER.bio}</p>
                <ul className="pl-hl">
                  {FOUNDER.highlights.map((h) => (
                    <li key={h.title}><b>{h.title}</b><span>{h.sub}</span></li>
                  ))}
                </ul>
                <div className="pl-row">
                  <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn-dark">LinkedIn <Arrow /></a>
                  <a href={FOUNDER.site} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn-ghost">Portfolio</a>
                  <a href="mailto:hello@plulai.com" className="pl-btn pl-btn-ghost">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORK */}
        <Block tone="white" title="What he is building now">
          <div className="pl-rows">
            {work.map((w) => (
              <div key={w.title + w.org} className="pl-rowitem">
                <span className="when">{w.when}</span>
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.org}</p>
                  {w.text && <p style={{ marginTop: 6 }}>{w.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </Block>

        {/* PROGRAMS + EVENTS */}
        <Block tone="cream" title="Programs, bootcamps and hackathons" sub="Learning from the best, then teaching it forward.">
          <div className="pl-twocol">
            <div className="pl-card pl-listcard">
              <h3>Programs and mentorship</h3>
              <ul>{programs.map((p) => <li key={p}><Check />{p}</li>)}</ul>
            </div>
            <div className="pl-card pl-listcard">
              <h3>Events and clubs</h3>
              <ul>{builds.map((p) => <li key={p}><Check />{p}</li>)}</ul>
            </div>
          </div>
        </Block>

        {/* TRAINING */}
        <Block tone="white" title="Training and skills">
          <div className="pl-certs">
            {certs.map((c) => (
              <div key={c.title} className="pl-card pl-listcard">
                <h3>{c.title}</h3>
                <ul>{c.items.map((i) => <li key={i}><Check />{i}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="pl-skills">
            {skills.map((k) => <span key={k} className="pl-chip"><i />{k}</span>)}
            <span className="pl-chip"><i />Arabic (native)</span>
            <span className="pl-chip"><i />English (full professional)</span>
          </div>
        </Block>

        {/* CTA */}
        <section className="pl-sec pl-cream" style={{ paddingTop: 24 }}>
          <div className="pl-wrap">
            <div className="pl-final">
              <div className="pl-glow pl-glow-sm" aria-hidden />
              <div style={{ position: 'relative' }}>
                <h2>Want Plulai for your kids or your school?</h2>
                <p>Get in touch and we will help you pick the right starting point.</p>
                <div className="pl-row" style={{ justifyContent: 'center' }}>
                  <a href="/" className="pl-btn pl-btn-primary pl-btn-lg">See Plulai <Arrow /></a>
                  <a href="mailto:hello@plulai.com" className="pl-btn pl-btn-glass pl-btn-lg">Talk to our team</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
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
            <div><h4>Product</h4><a href="/#path">The path</a><a href="/#plans">Pricing</a></div>
            <div><h4>For you</h4><a href="/">For schools</a><a href="/">For families</a></div>
            <div><h4>Company</h4><a href="/about">About</a><a href="/ar" lang="ar" hrefLang="ar">العربية</a></div>
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