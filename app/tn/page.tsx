// File: app/tunisia/page.tsx
//
// Server Component (no 'use client') so `metadata` export works and the
// page ships as plain HTML for crawlers — no client-side render delay.
// FAQ uses native <details>/<summary> for a zero-JS accordion.

import type { Metadata } from 'next'
import Image from 'next/image'

const SITE_URL = 'https://plulai.com' // <-- replace with your real domain

export const metadata: Metadata = {
  title: 'Kids Coding & AI Classes in Tunisia | Plulai',
  description: 'AI, coding, and entrepreneurship classes for kids ages 6-18 in Tunisia. Self-paced online learning in Arabic or French, plus curriculum for schools in Tunis, Sfax, and beyond.',
  alternates: {
    canonical: `${SITE_URL}/tunisia`,
  },
  openGraph: {
    title: 'Kids Coding & AI Classes in Tunisia | Plulai',
    description: 'AI, coding, and entrepreneurship classes for kids ages 6-18 in Tunisia. Self-paced online learning in Arabic or French, plus curriculum for schools in Tunis, Sfax, and beyond.',
    url: `${SITE_URL}/tunisia`,
    images: ['/og-image.png'],
  },
}

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Plulai',
    url: `${SITE_URL}/tunisia`,
    areaServed: {
      '@type': 'Country',
      name: 'Tunisia',
    },
    description: 'AI, coding, and entrepreneurship classes for kids ages 6-18 in Tunisia. Self-paced online learning in Arabic or French, plus curriculum for schools in Tunis, Sfax, and beyond.',
  }

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{"@type": "Question", "name": "Is Plulai available in Tunis and across Tunisia?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — Tunisia is our home market. The family plan is fully online, and we already partner with schools locally for in-person workshops."}}, {"@type": "Question", "name": "What languages are lessons taught in?", "acceptedAnswer": {"@type": "Answer", "text": "Arabic and French, taught natively — not machine-translated."}}, {"@type": "Question", "name": "How much does it cost?", "acceptedAnswer": {"@type": "Answer", "text": "Families get a 14-day free trial, then $70/month (approximately 217 TND), billed in USD. School and training center pricing is scoped to seat count — book a demo for a quote."}}, {"@type": "Question", "name": "What ages is Plulai for?", "acceptedAnswer": {"@type": "Answer", "text": "Ages 6 to 18, with the curriculum adapted per age group."}}, {"@type": "Question", "name": "Do you already work with schools in Tunisia?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — we have partner schools in Tunisia already using Plulai. Book a demo to talk about your school specifically."}}],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
    </>
  )
}

export default function TunisiaPage() {
  return (
    <>
      <JsonLd />

      {/* ================= NAV (static, no JS toggle — SEO landing page) ================= */}
      <nav style={{ borderBottom: '1px solid #E4E9E7', position: 'sticky', top: 0, background: '#fff', zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', flexWrap: 'wrap', gap: 12 }}>
          <a href="/?intl=1" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/logo.png" alt="Plulai" width={120} height={32} style={{ height: 'auto', width: 'auto', maxHeight: 32 }} />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <a href="/#tracks" style={{ color: '#0D2B32', fontSize: 14 }}>Tracks</a>
            <a href="/schools" style={{ color: '#0D2B32', fontSize: 14 }}>For Schools</a>
            <a href="/#audience"><button className="btn btn-dark">Start free trial &rarr;</button></a>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div style={{ padding: '64px 0 48px', textAlign: 'center', background: '#F6F3EA' }}>
        <div className="container">
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 22,
              padding: '7px 16px', borderRadius: 999, background: '#fff', border: '1px solid #E4E9E7',
              fontSize: 13, fontWeight: 600, color: '#0D2B32',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1FB8A6' }} />
            Now serving families &amp; schools in Tunisia
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#0D2B32', maxWidth: 760, margin: '0 auto 20px', lineHeight: 1.15 }}>
            AI, Coding &amp; Entrepreneurship Classes for Kids in Tunisia
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(41,57,74,0.75)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
            15 minutes a day, taught in real Arabic or French — with an AI coach
            built around how kids actually learn. Available online across Tunisia (Tunis, Sfax, Sousse), with
            in-person workshops available for schools on request.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/#audience"><button className="btn btn-cta">Start free trial &rarr;</button></a>
            <a href="/schools"><button className="btn btn-outline">Book a demo for your school &rarr;</button></a>
          </div>
        </div>
      </div>

      {/* ================= WHO IT'S FOR ================= */}
      <div style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 20, padding: '30px 28px' }}>
              <span className="pill">For Families in Tunisia</span>
              <h2 style={{ marginTop: 16, fontSize: 22, color: '#0D2B32' }}>Learning that fits your family&apos;s schedule</h2>
              <p style={{ color: 'rgba(41,57,74,0.7)', lineHeight: 1.65, margin: '10px 0 20px' }}>
                No classroom, no fixed timetable — 15 minutes a day, self-paced, in
                Arabic or French. A 14-day free trial, then $70/month (≈ 217 TND).
              </p>
              <a href="/#audience"><button className="btn btn-dark">Start free trial &rarr;</button></a>
            </div>
            <div style={{ background: '#0D2B32', borderRadius: 20, padding: '30px 28px' }}>
              <span className="pill" style={{ background: 'rgba(31,184,166,0.15)', color: '#1FB8A6' }}>For Schools &amp; Training Centers</span>
              <h2 style={{ marginTop: 16, fontSize: 22, color: '#F6F3EA' }}>A curriculum your teachers can run</h2>
              <p style={{ color: '#B7C9C5', lineHeight: 1.65, margin: '10px 0 20px' }}>
                A dashboard that flags who&apos;s stuck before report cards do. Delivered
                online or in person for schools in Tunisia — get in touch to check
                availability in your city.
              </p>
              <a href="/schools"><button className="btn btn-cta">Book a demo &rarr;</button></a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TRACKS (condensed) ================= */}
      <div style={{ padding: '20px 0 64px', background: '#F6F3EA' }}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: 'center' }}>Curriculum overview</p>
          <h2 style={{ textAlign: 'center', fontSize: 28, color: '#0D2B32', marginBottom: 36 }}>Three tracks, one path</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { name: 'Coding', desc: 'Blocks to real Python — build actual apps and games.' },
              { name: 'AI & Future Tech', desc: 'Prompting, data, and real ML basics.' },
              { name: 'Entrepreneurship', desc: 'Pricing, marketing, and a real pitch.' },
            ].map((t) => (
              <div key={t.name} style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#0D2B32', marginBottom: 8 }}>{t.name}</p>
                <p style={{ fontSize: 13.5, color: 'rgba(41,57,74,0.7)', lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 28 }}>
            <a href="/#tracks" style={{ color: '#1FB8A6', fontWeight: 600, fontSize: 14 }}>See the full curriculum &rarr;</a>
          </p>
        </div>
      </div>

      {/* ================= FAQ (native details/summary — zero JS) ================= */}
      <div style={{ padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <p className="eyebrow" style={{ textAlign: 'center' }}>FAQ</p>
          <h2 style={{ textAlign: 'center', fontSize: 28, color: '#0D2B32', marginBottom: 36 }}>
            Questions from families &amp; schools in Tunisia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      <div style={{ background: '#0D2B32', padding: '64px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#F6F3EA', fontSize: 30, marginBottom: 14 }}>Ready to start in Tunisia?</h2>
          <p style={{ color: '#B7C9C5', marginBottom: 28 }}>Free 14-day trial for families. Free demo for schools.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/#audience"><button className="btn btn-cta">Start free trial &rarr;</button></a>
            <a href="/schools"><button className="btn btn-outline btn-outline--on-dark">Book a demo &rarr;</button></a>
          </div>
        </div>
      </div>

      {/* ================= FOOTER (internal links to other country pages) ================= */}
      <footer style={{ padding: '32px 0', borderTop: '1px solid #E4E9E7' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(41,57,74,0.5)' }}>© 2026 Plulai Education.</span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <span style={{ color: 'rgba(41,57,74,0.5)' }}>Also serving:</span>
            <a href="/qatar" style={{ color: '#1FB8A6' }}>Qatar</a>
            <a href="/uae" style={{ color: '#1FB8A6' }}>the UAE</a>
            <a href="/saudi-arabia" style={{ color: '#1FB8A6' }}>Saudi Arabia</a>
            <a href="/?intl=1" style={{ color: '#1FB8A6' }}>Home</a>
            <a href="/ar" style={{ color: '#1FB8A6' }}>العربية</a>
          </div>
        </div>
      </footer>
    </>
  )
}