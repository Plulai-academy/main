// File: page.tsx
// Placement: app/page.tsx
//
// Thin Server Component. All the actual homepage content/interactivity
// lives in components/HomeClient.tsx (a Client Component). This split
// exists specifically so CountryBanner (a Server Component using
// cookies()) can render here, scoped to the homepage only — it can't be
// imported directly inside HomeClient.tsx because that's a Client
// Component and cookies() is a server-only API.

import CountryBanner from '@/components/CountryBanner'
import HomeClient from '@/components/HomeClient'

export default function Page() {
  return (
    <>
      <CountryBanner />
      <HomeClient />
    </>
  )
}