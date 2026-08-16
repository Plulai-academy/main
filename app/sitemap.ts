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
    { url: `${BASE}/ar`,            lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/schools`,       lastModified: NOW, changeFrequency: 'weekly',  priority: 0.9 },

    // ── Country landing pages ─────────────────────────────────
    { url: `${BASE}/qatar`,         lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/uae`,           lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/saudi-arabia`,  lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tunisia`,       lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },

    // NOTE: removed the '/#features', '/#gcc', '/#stories', '/#faq',
    // '/#tracks' hash-fragment entries that were here before. Google
    // strips URL fragments before indexing, so a sitemap entry for
    // `${BASE}/#faq` is treated as identical to `${BASE}` — it doesn't
    // register as a separate page and just adds noise. If any of those
    // sections (FAQ, tracks, etc.) deserve their own SEO weight, they
    // need to be real routes, not anchors — happy to help split any of
    // them out if that's useful.
  ]
}