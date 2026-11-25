// File: page.tsx
// Placement: app/ar/page.tsx  (replaces the old Arabic page; Server Component so it can export metadata)

import type { Metadata } from 'next'
import HomeClientAr from '@/components/HomeClientAr'

export const metadata: Metadata = {
  title: 'Plulai | البرمجة والذكاء الاصطناعي والمهارات الحياتية للأطفال والمدارس',
  description:
    'منهج في البرمجة والذكاء الاصطناعي والمهارات الحياتية للأطفال والمدارس في منطقة الشرق الأوسط وشمال أفريقيا، يُدرَّس بالعربية والفرنسية والإنجليزية الأصيلة. حصة مباشرة أسبوعية مع معلّم من Plulai ومنصّة مفتوحة للتدرّب.',
  alternates: {
    canonical: '/ar',
    languages: { ar: '/ar', en: '/' },
  },
}

export default function ArabicPage() {
  return <HomeClientAr />
}
