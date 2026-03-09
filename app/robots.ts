// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/auth/callback', '/admin', '/onboarding'],
      },
      // Allow Googlebot full access to public pages
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/auth/callback', '/admin', '/onboarding'],
      },
    ],
    sitemap: 'https://plulai.com/sitemap.xml',
    host:    'https://plulai.com',
  }
}
