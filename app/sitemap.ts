// app/sitemap.ts
import { MetadataRoute } from 'next'

const BASE = 'https://plulai.com'
const NOW  = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core public pages ─────────────────────────────────────
    { url: BASE,                    lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`,       lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/auth/signup`,   lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/auth/login`,    lastModified: NOW, changeFrequency: 'monthly', priority: 0.6 },

    // ── SEO landing sections (crawlable hash anchors listed as paths) ──
    // These help Google understand the page structure even if JS-rendered
    { url: `${BASE}/#features`,     lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#gcc`,          lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#stories`,      lastModified: NOW, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/#faq`,          lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#tracks`,       lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
