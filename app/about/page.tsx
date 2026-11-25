// File: page.tsx
// Placement: app/about/page.tsx  (Server Component, so it can export SEO metadata)

import type { Metadata } from 'next'
import AboutClient from '@/components/AboutClient'

export const metadata: Metadata = {
  title: 'About Mohamed Zouari, Founder & CEO | Plulai',
  description:
    'Meet Mohamed Zouari, founder and CEO of Plulai: a Python developer and tech entrepreneur building a coding, AI and life-skills program for kids and schools across MENA.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return <AboutClient />
}