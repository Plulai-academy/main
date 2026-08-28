// File: components/CountryBanner.tsx
// Placement: components/CountryBanner.tsx
//
// Server Component — reads the `visitor_country_slug` cookie set by
// middleware.ts and renders a small, dismissible banner suggesting the
// visitor's local page. No redirect, no gating — just a suggestion they
// can ignore.
//
// IMPORTANT: your app/page.tsx is a Client Component ('use client', for
// the audience toggle). This component uses `cookies()`, a server-only
// API, so it CANNOT be imported inside page.tsx directly — Next.js will
// break on the client/server boundary. Instead, render it in
// app/layout.tsx (which is a Server Component), right before {children}:
//
//   <body>
//     <CountryBanner />
//     {children}
//   </body>
//
// It'll then appear above every page, but only actually renders content
// when a country cookie is present and not dismissed — everywhere else
// it returns null, so this is safe to leave in globally.
//
// Dismissal uses a Server Action (the inline `dismissBanner` function)
// so the × button works without any client-side JavaScript.

import { cookies } from 'next/headers'

const COUNTRY_NAMES: Record<string, string> = {
  qatar: 'Qatar',
  uae: 'the UAE',
  'saudi-arabia': 'Saudi Arabia',
  tunisia: 'Tunisia',
}

async function dismissBanner() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.set('banner_dismissed', '1', { maxAge: 60 * 60 * 24, path: '/' })
}

export default async function CountryBanner() {
  const cookieStore = await cookies()
  const slug = cookieStore.get('visitor_country_slug')?.value
  const dismissed = cookieStore.get('banner_dismissed')?.value === '1'

  if (!slug || dismissed || !COUNTRY_NAMES[slug]) {
    return null
  }

  const countryName = COUNTRY_NAMES[slug]

  return (
    <div
      style={{
        background: '#0D2B32', color: '#F6F3EA', padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        fontSize: 13.5, flexWrap: 'wrap', textAlign: 'center',
      }}
    >
      <span>
        Looking for Plulai in {countryName}?{' '}
        <a href={`/${slug}`} style={{ color: '#1FB8A6', fontWeight: 700, textDecoration: 'underline' }}>
          View local info &rarr;
        </a>
      </span>
      <form action={dismissBanner}>
        <button
          type="submit"
          aria-label="Dismiss"
          style={{
            background: 'none', border: 'none', color: '#8FA8A3', cursor: 'pointer',
            fontSize: 16, lineHeight: 1, padding: 4,
          }}
        >
          ×
        </button>
      </form>
    </div>
  )
}