// app/layout.tsx
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { SEO_CONFIG } from '@/lib/seo/config'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const SITE = SEO_CONFIG.siteUrl

export const viewport: Viewport = {
  themeColor: '#0d0d1a',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: SEO_CONFIG.defaultTitle, template: SEO_CONFIG.titleTemplate },
  description: SEO_CONFIG.defaultDescription,
  keywords: SEO_CONFIG.keywords,
  authors: [{ name: 'Plulai', url: SITE }],
  creator: 'Plulai',
  publisher: 'Plulai',
  category: 'Education',
  classification: 'Educational Technology',
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    alternateLocale: ['ar_AE', 'en_SA', 'ar_SA', 'en_QA', 'en_KW'],
    url: SITE,
    siteName: 'Plulai',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [
      { url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: 'Plulai – AI & Coding for Kids in UAE & GCC' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@plulai',
    creator: '@plulai',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [`${SITE}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE,
    languages: { 'en-AE': `${SITE}`, 'ar-AE': `${SITE}/ar`, 'x-default': SITE },
  },
  other: {
    'geo.region':    'AE',
    'geo.placename': 'Dubai, UAE',
    'geo.position':  '25.2048;55.2708',
    ICBM:            '25.2048, 55.2708',
    rating:          'general',
    'revisit-after': '3 days',
    language:        'English, Arabic, French',
    target_country:  'AE,SA,QA,KW,BH,OM',
    'apple-mobile-web-app-capable':            'yes',
    'apple-mobile-web-app-status-bar-style':   'black-translucent',
    'apple-mobile-web-app-title':              'Plulai',
    'mobile-web-app-capable':                  'yes',
    'msapplication-TileColor':                 '#0d0d1a',
    'format-detection':                        'telephone=no',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Organization */}
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_CONFIG.schema.organization) }} />
        {/* WebSite with SearchAction */}
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_CONFIG.schema.website) }} />
        {/* EducationalApp */}
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_CONFIG.schema.educationalApp) }} />
        {/* FAQ — boosts rich results in Google */}
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_CONFIG.schema.faq) }} />
        {/* Course schema */}
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_CONFIG.schema.course) }} />
      </head>
      <body className="font-nunito bg-bg text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
