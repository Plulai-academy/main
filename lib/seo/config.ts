// lib/seo/config.ts
// Maximum SEO for GCC edtech dominance — plulai.com

export const SEO_CONFIG = {
  siteName:    'Plulai',
  siteUrl:     process.env.NEXT_PUBLIC_APP_URL || 'https://plulai.com',
  defaultTitle: 'Plulai – #1 AI, Coding & Entrepreneurship for Kids | UAE & GCC',
  titleTemplate: '%s | Plulai',
  defaultDescription: 'Plulai is the #1 edtech platform for kids aged 6-18 in the UAE, Saudi Arabia, Qatar and GCC. Learn coding, AI and entrepreneurship with a personal AI coach, gamified lessons and real projects. Free to start.',
  keywords: [
    // High-intent English — UAE/GCC
    'edtech UAE', 'edtech GCC', 'edtech startup UAE',
    'coding for kids UAE', 'coding for kids Dubai', 'coding for kids Abu Dhabi',
    'kids coding app UAE', 'coding classes for kids Dubai',
    'AI learning for kids', 'AI for kids UAE', 'AI education kids GCC',
    'learn AI kids', 'artificial intelligence for kids',
    'entrepreneurship for kids UAE', 'entrepreneurship for kids GCC',
    'kids entrepreneurship program Dubai',
    'online coding kids', 'programming for children',
    'STEM education UAE', 'STEM for kids GCC',
    'kids tech education Dubai', 'tech skills kids Saudi Arabia',
    'coding for kids Qatar', 'coding for kids Kuwait',
    'kids programming Riyadh', 'kids programming Doha',
    'gamified learning kids', 'Duolingo for coding',
    'AI tutor for kids', 'AI coach for children',
    'online learning platform kids UAE',
    'best edtech app kids 2025', 'top coding app kids Middle East',
    'plulai', 'plulai.com',
    // Arabic keywords
    'تعليم البرمجة للأطفال',
    'الذكاء الاصطناعي للأطفال',
    'ريادة الأعمال للأطفال',
    'تعلم البرمجة الإمارات',
    'تطبيق تعلم الأطفال',
    'تعليم الأطفال دبي',
    'برمجة للأطفال السعودية',
    'تعليم تقني للأطفال الخليج',
    'بلولاي', 'منصة تعليمية للأطفال',
  ],
  schema: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Plulai',
      url: 'https://plulai.com',
      logo: 'https://plulai.com/logo.png',
      description: 'The #1 AI, Coding & Entrepreneurship learning platform for kids aged 6-18 in the UAE and GCC.',
      foundingLocation: { '@type': 'Place', addressCountry: 'AE', addressLocality: 'Dubai' },
      areaServed: [
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'Saudi Arabia' },
        { '@type': 'Country', name: 'Qatar' },
        { '@type': 'Country', name: 'Kuwait' },
        { '@type': 'Country', name: 'Bahrain' },
        { '@type': 'Country', name: 'Oman' },
      ],
      sameAs: [
        'https://twitter.com/plulai',
        'https://instagram.com/plulai',
        'https://linkedin.com/company/plulai',
        'https://tiktok.com/@plulai',
      ],
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Plulai',
      url: 'https://plulai.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://plulai.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    educationalApp: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Plulai',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, iOS, Android',
      inLanguage: ['en', 'ar', 'fr'],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED', availability: 'https://schema.org/InStock' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '1000', bestRating: '5' },
      audience: { '@type': 'EducationalAudience', educationalRole: 'student', suggestedMinAge: 6, suggestedMaxAge: 18 },
    },
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Plulai?',
          acceptedAnswer: { '@type': 'Answer', text: 'Plulai is the #1 AI-powered edtech platform for kids aged 6-18 in the UAE and GCC. Kids learn coding, artificial intelligence, and entrepreneurship through gamified lessons and a personal AI coach.' }
        },
        {
          '@type': 'Question',
          name: 'Is Plulai free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes! Plulai offers a free plan with no credit card required. Kids can start learning AI, coding and entrepreneurship immediately.' }
        },
        {
          '@type': 'Question',
          name: 'What age is Plulai for?',
          acceptedAnswer: { '@type': 'Answer', text: 'Plulai is designed for children aged 6 to 18. The platform automatically adapts content difficulty based on the child\'s age group.' }
        },
        {
          '@type': 'Question',
          name: 'Does Plulai support Arabic?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes! Plulai fully supports Arabic with a right-to-left interface and an AI coach that teaches in Arabic, making it the perfect edtech platform for kids in the UAE, Saudi Arabia, Qatar and across the GCC.' }
        },
        {
          '@type': 'Question',
          name: 'What does Plulai teach?',
          acceptedAnswer: { '@type': 'Answer', text: 'Plulai teaches three essential 21st-century skills: Coding (Python, web development, apps), Artificial Intelligence (machine learning, AI projects), and Entrepreneurship (building startups, pitching ideas, business skills).' }
        },
      ]
    },
    course: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'AI, Coding & Entrepreneurship for Kids',
      description: 'A comprehensive 48-week curriculum teaching kids aged 6-18 coding, artificial intelligence and entrepreneurship through gamified lessons.',
      provider: { '@type': 'Organization', name: 'Plulai', url: 'https://plulai.com' },
      hasCourseInstance: [
        { '@type': 'CourseInstance', name: 'Coding Track', courseMode: 'online' },
        { '@type': 'CourseInstance', name: 'AI Track', courseMode: 'online' },
        { '@type': 'CourseInstance', name: 'Entrepreneurship Track', courseMode: 'online' },
      ],
    },
  },
}

export const PAGE_SEO = {
  home: {
    title:       'Plulai – #1 Coding, AI & Entrepreneurship for Kids | UAE & GCC Edtech',
    description: 'The #1 edtech platform for kids in UAE & GCC. Learn coding, AI and entrepreneurship with a personal AI coach. Gamified like Duolingo. Arabic & English. Free to start!',
    canonical:   'https://plulai.com',
  },
  pricing: {
    title:       'Pricing | Plulai – Affordable Edtech for Kids UAE',
    description: 'Start free. Upgrade for full access to 200+ AI, coding and entrepreneurship lessons. No credit card needed to start.',
    canonical:   'https://plulai.com/pricing',
  },
  login: {
    title:       'Log In | Plulai',
    description: 'Log in to your Plulai account and continue your AI & coding learning journey.',
    canonical:   'https://plulai.com/auth/login',
    noindex:     true,
  },
  signup: {
    title:       'Sign Up Free | Plulai – AI & Coding for Kids UAE',
    description: 'Create your free Plulai account. No credit card needed. Join thousands of kids in UAE & GCC learning AI, coding, and entrepreneurship.',
    canonical:   'https://plulai.com/auth/signup',
  },
}
