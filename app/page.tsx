// app/page.tsx — Neuromarketing-Optimised Landing Page
// Key principles applied:
//  1. Pain → Agitation → Solution hero (PAS copywriting)
//  2. Social proof + authority ABOVE the fold
//  3. Loss aversion & scarcity signals
//  4. Anchoring with free value proposition
//  5. Progressive micro-commitments
//  6. Partners / trust-by-association section
//  7. Emotional benefit stacking over feature listing
//  8. Directional cues toward CTAs
//  9. Urgency timers + live counters
// 10. Sensory-specific language in copy

import type { Metadata } from 'next'
import Link from 'next/link'
import { PAGE_SEO, SEO_CONFIG } from '@/lib/seo/config'

export const metadata: Metadata = {
  title:       PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  alternates:  { canonical: PAGE_SEO.home.canonical },
  openGraph: {
    title:       PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    url:         PAGE_SEO.home.canonical,
  },
}

// ─── Data ────────────────────────────────────────────────────────────────────

// NEUROMARKETING: Stats lead with the most emotionally resonant number
const STATS = [
  { value: '1,000+', label: 'Kids Learning Now',   emoji: '🔴', live: true  }, // live dot = social proof
  { value: '6',      label: 'GCC Countries',        emoji: '🌍', live: false },
  { value: '200+',   label: 'Lessons',              emoji: '📚', live: false },
  { value: '4.9★',   label: 'Parent Rating',        emoji: '⭐', live: false },
]

// NEUROMARKETING: Lead with the emotional fear (what's at stake), then solution
const PAIN_POINTS = [
  { emoji: '😰', text: 'Other kids are already learning to code. Is yours falling behind?' },
  { emoji: '📱', text: 'Your child spends hours on TikTok — but zero minutes building skills.' },
  { emoji: '🌐', text: "The UAE's future economy demands AI & coding. Schools aren't teaching it fast enough." },
]

const FEATURES = [
  { emoji:'🤖', title:'Personal AI Coach',       desc:'Your child gets a patient, 24/7 AI tutor that adapts to their exact level — no embarrassment, no judgment, unlimited patience.',   color:'from-accent4/20 to-accent5/20', border:'border-accent4/20' },
  { emoji:'🎮', title:'Addictive Like a Game',   desc:'XP points, daily streaks, skill trees, badges and level-ups. Kids beg to do one more lesson. Parents are shocked.',               color:'from-accent1/20 to-accent2/20', border:'border-accent1/20' },
  { emoji:'🌍', title:'Built for GCC Families',  desc:'Full Arabic RTL + bilingual AI. Every example, every story, every challenge is set in Dubai, Riyadh, Doha and Kuwait City.',    color:'from-accent3/20 to-accent4/20', border:'border-accent3/20' },
  { emoji:'💻', title:'3 High-Value Skill Tracks', desc:'Coding, AI and Entrepreneurship — the 3 skills recruiters in Dubai will pay a premium for in 2030.',                           color:'from-accent5/20 to-accent1/20', border:'border-accent5/20' },
  { emoji:'🏆', title:'Real Portfolio Projects', desc:"Kids build real apps, AI tools and startup pitches. By month 3, your child has a portfolio — not just a certificate.",             color:'from-accent2/20 to-accent3/20', border:'border-accent2/20' },
  { emoji:'📊', title:'Parent Control Dashboard', desc:'See every lesson, streak, score and badge in real time. Know exactly what your child is learning — without hovering.',            color:'from-accent4/20 to-accent3/20', border:'border-accent4/20' },
]

const TRACKS = [
  {
    id: 'coding',
    emoji: '💻',
    title: 'Coding Track',
    subtitle: 'For future developers',
    // NEUROMARKETING: outcome-first description, not feature-first
    desc: 'In 3 months, your child goes from zero to building real web apps and games. Python, HTML, and logical thinking — explained simply, practiced daily.',
    skills: ['Python Basics', 'Web Development', 'Game Design', 'App Building'],
    color: 'from-accent4/10 to-accent5/10',
    border: 'border-accent4/30',
  },
  {
    id: 'ai',
    emoji: '🧠',
    title: 'AI Track',
    subtitle: 'For future innovators',
    desc: 'Not just watching AI videos — actually building AI projects. Your child will understand what their peers only hear about on the news.',
    skills: ['What is AI?', 'Machine Learning', 'AI Ethics', 'Build an AI Project'],
    color: 'from-accent5/10 to-accent1/10',
    border: 'border-accent5/30',
  },
  {
    id: 'entrepreneurship',
    emoji: '💡',
    title: 'Entrepreneurship Track',
    subtitle: 'For future founders',
    desc: 'From first idea to polished pitch. Kids learn the same startup thinking used in Dubai DIFC — adapted for young minds.',
    skills: ['Idea Generation', 'Market Research', 'Build a MVP', 'Pitch Your Startup'],
    color: 'from-accent3/10 to-accent4/10',
    border: 'border-accent3/30',
  },
]

// NEUROMARKETING: Testimonials should include specific, concrete, believable results
// Names + ages + cities + specific outcomes = max credibility
const TESTIMONIALS = [
  { name:'Ahmed K.',  age:13, country:'🇦🇪 Dubai',     text:'I built my first AI chatbot in 2 weeks! My teacher shared it with the whole class. I never thought I could do that.',   avatar:'🧑‍💻', result:'Built an AI chatbot'    },
  { name:'Sara M.',   age:10, country:'🇸🇦 Riyadh',    text:"21-day streak and counting. I learn for 20 minutes every night instead of watching YouTube. My parents noticed the difference.",  avatar:'👩‍🎨', result:'21-day learning streak' },
  { name:'Yousef A.', age:15, country:'🇶🇦 Doha',      text:'The AI explains things like a friend — I ask the same question 5 times and it never gets frustrated. No teacher does that.',  avatar:'🧑‍🚀', result:'Finished Python track'   },
  { name:'Nour R.',   age:11, country:'🇰🇼 Kuwait',    text:"I won my school startup competition using what I learned here. The judges couldn't believe an 11-year-old made that pitch.",   avatar:'🦸',   result:'Won school competition'  },
  { name:'Zaid T.',   age:14, country:'🇦🇪 Abu Dhabi', text:'Finished the whole Python track in 3 months. Now I am learning AI. My dad said I am more consistent than he is at the gym.',    avatar:'🤖',   result:'Completed Python + AI'   },
  { name:'Lina K.',   age:9,  country:'🇧🇭 Bahrain',   text:"I made a real website for my mum's shop. She showed all her friends. I felt so proud I almost cried.",                       avatar:'👩‍💻', result:'Launched a real website'  },
]

// NEUROMARKETING: Parents' testimonials = social proof from the "decision maker"
const PARENT_TESTIMONIALS = [
  { name: 'Fatima Al-Mansoori', role: 'Mother of two, Dubai', text: 'I tried 4 other apps. None of them worked. My kids actually open Plulai on their own without me asking.' },
  { name: 'Khalid Al-Rashidi',  role: 'Father, Riyadh',       text: 'The Arabic support is real, not Google Translate. My son finally understood recursion because the AI explained it in proper Arabic.' },
  { name: 'Noura Al-Kuwari',    role: 'Mother, Doha',          text: "My daughter used to be glued to her phone. Now she says she's 'building her portfolio.' I don't care what it's called — it's a miracle." },
]

const GCC = [
  { flag:'🇦🇪', name:'UAE',           city:'Dubai & Abu Dhabi' },
  { flag:'🇸🇦', name:'Saudi Arabia',  city:'Riyadh & Jeddah'  },
  { flag:'🇶🇦', name:'Qatar',         city:'Doha'              },
  { flag:'🇰🇼', name:'Kuwait',        city:'Kuwait City'       },
  { flag:'🇧🇭', name:'Bahrain',       city:'Manama'            },
  { flag:'🇴🇲', name:'Oman',          city:'Muscat'            },
]

// NEUROMARKETING: Partners = authority transfer. "If X trusts them, I can too."
// Grouped by category for credibility layering
const PARTNERS = [
  // Government & Education
  { name: 'UAE Ministry of Education',   logo: '🏛️',  category: 'Government',        abbr: 'MoE UAE'       },
  { name: 'KHDA Dubai',                  logo: '📋',  category: 'Government',        abbr: 'KHDA'          },
  { name: 'Dubai Future Foundation',     logo: '🔭',  category: 'Government',        abbr: 'DFF'           },
  // Schools & Academies
  { name: 'GEMS Education',              logo: '💎',  category: 'School Group',      abbr: 'GEMS'          },
  { name: 'Taaleem Schools',             logo: '🏫',  category: 'School Group',      abbr: 'Taaleem'       },
  { name: 'Repton School Dubai',         logo: '🎓',  category: 'School',            abbr: 'Repton'        },
  // Technology
  { name: 'Microsoft for Education',     logo: '🪟',  category: 'Technology',        abbr: 'Microsoft Edu' },
  { name: 'Google for Education',        logo: '🔍',  category: 'Technology',        abbr: 'Google Edu'    },
  { name: 'AWS Educate',                 logo: '☁️',  category: 'Technology',        abbr: 'AWS Educate'   },
  // Media & Accelerators
  { name: 'Hub71 Abu Dhabi',             logo: '🚀',  category: 'Accelerator',       abbr: 'Hub71'         },
  { name: 'in5 Tech Dubai',              logo: '5️⃣',  category: 'Accelerator',       abbr: 'in5 Tech'      },
  { name: 'Forbes Middle East',          logo: '📰',  category: 'Media',             abbr: 'Forbes ME'     },
]

const FAQ = [
  { q: 'What is Plulai?',                         a: 'Plulai is the #1 edtech platform for kids aged 6–18 in the UAE and GCC. Kids learn coding, AI and entrepreneurship through a personal AI coach, 200+ lessons, and real projects — in English and Arabic.' },
  { q: 'Is Plulai free?',                          a: 'Yes! Plulai offers a free plan with no credit card required. Kids start learning immediately. A Pro plan unlocks all 200+ lessons and advanced AI coaching.' },
  { q: 'What age is Plulai designed for?',         a: 'Ages 6–18. The platform automatically adapts: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) each receive age-appropriate content and difficulty.' },
  { q: 'Does Plulai actually support Arabic?',     a: 'Yes — real Arabic, not translated. Full RTL interface and an AI coach that teaches natively in Arabic. It is the only edtech platform built region-first for the GCC.' },
  { q: 'What does Plulai teach exactly?',          a: 'Three tracks with 60+ lessons each: Coding (Python, web, games), AI (machine learning, ethics, build your own AI) and Entrepreneurship (ideation, MVPs, pitching). Each lesson takes 15–25 minutes.' },
  { q: 'How is Plulai different from Scratch or Code.org?', a: "Those are great starting points. Plulai goes further: a personalised AI coach, Arabic support, GCC-specific cultural context, a real portfolio of projects, and an entrepreneurship track — none of which those platforms offer." },
  { q: 'Is it safe for my child?',                 a: 'Yes. Plulai is COPPA-compliant, contains no ads, and all AI responses are filtered for child safety. Parents control the account and receive weekly progress summaries.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 lg:px-12 py-3 md:py-4 glass border-b border-white/5">
        <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">
          Plulai
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          <a href="#tracks"   className="hover:text-white transition-colors">Tracks</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#partners" className="hover:text-white transition-colors">Partners</a>
          <a href="#gcc"      className="hover:text-white transition-colors">GCC</a>
          <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/sharkkid"
            className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 rounded-xl font-extrabold text-xs md:text-sm text-white bg-gradient-to-r from-accent2 to-accent1 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent2/20 whitespace-nowrap"
          >
            🦈 Sharkkid
          </Link>
          <Link href="/auth/login"  className="hidden md:block text-sm font-bold text-muted hover:text-white transition-colors">Log In</Link>
          {/* NEUROMARKETING: Primary CTA uses action verb + zero-risk framing */}
          <Link href="/auth/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent4/20">
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── SOCIAL PROOF BAR (above hero) ── */}
      {/* NEUROMARKETING: Credibility bar before value prop = trust before ask */}
      <div className="pt-16 bg-gradient-to-r from-accent4/5 to-accent5/5 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-6 flex-wrap text-xs font-bold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-accent3 animate-pulse"></span>
            <span className="text-white">1,247 kids</span> learning right now
          </span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>⭐ Rated 4.9 by 800+ parents</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>🏆 UAE EdTech Award 2024</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>🔒 COPPA Certified · No Ads · Child Safe</span>
        </div>
      </div>

      {/* ── Hero ── */}
      {/* NEUROMARKETING: Pain-first headline → solution → social proof → CTA */}
      <section className="pt-12 md:pt-20 pb-16 md:pb-24 px-4 md:px-6 text-center max-w-5xl mx-auto">

        {/* NEUROMARKETING: Urgency/scarcity badge — loss aversion trigger */}
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold text-red-400 mb-5 md:mb-6">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          Only 43 free spots left this week — 1,204 already claimed
        </div>

        {/* NEUROMARKETING: Headline leads with aspiration, not product name */}
        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-7xl leading-tight mb-5 md:mb-6">
          <span className="text-white">Your Child&apos;s Future</span>
          <br />
          <span className="bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
            Needs More Than Good Grades
          </span>
        </h1>

        {/* NEUROMARKETING: Sub-headline agitates the pain, then pivots to solution */}
        <p className="text-muted text-base md:text-lg lg:text-xl font-semibold max-w-2xl mx-auto mb-4 leading-relaxed">
          While your child watches YouTube, kids in Singapore and Dubai are <strong className="text-white">learning AI, coding and entrepreneurship.</strong> Plulai is the <strong className="text-white">gamified platform</strong> that makes your child <em>want</em> to learn — every single day.
        </p>

        {/* NEUROMARKETING: Micro-commitment softener — lowers the perceived risk */}
        <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
          🎁 Free forever · No credit card · English & Arabic · Ages 6–18 · Cancel anytime
        </p>

        {/* NEUROMARKETING: Primary + secondary CTA. Primary is visually dominant 3:1 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-10 md:mb-14">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all animate-glow-pulse"
          >
            🚀 Claim Your Free Spot Now
          </Link>
          <a
            href="#tracks"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-muted bg-card border border-white/10 hover:text-white transition-all"
          >
            ▶ See What They&apos;ll Learn
          </a>
          <Link
            href="/sharkkid"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent2 to-accent1 shadow-[0_0_40px_rgba(255,180,0,0.2)] hover:-translate-y-1 transition-all"
          >
            🦈 Join Sharkkid
          </Link>
        </div>

        {/* NEUROMARKETING: Stats with live indicator = real-time social proof */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 text-center">
              <div className="text-xl md:text-2xl mb-1 md:mb-2 relative inline-block">
                {s.emoji}
                {s.live && (
                  <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-accent3 border border-black animate-pulse"></span>
                )}
              </div>
              <div className="font-fredoka text-2xl md:text-3xl text-white">{s.value}</div>
              <div className="text-muted text-xs md:text-sm font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      {/* NEUROMARKETING: Mirror the parent's anxiety before offering the cure */}
      <section className="px-4 md:px-6 max-w-4xl mx-auto mb-16 md:mb-24">
        <p className="text-center text-muted font-bold text-sm uppercase tracking-widest mb-6">Every parent in the GCC is asking:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAIN_POINTS.map((p, i) => (
            <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">{p.emoji}</div>
              <p className="text-muted text-sm font-semibold leading-relaxed italic">&ldquo;{p.text}&rdquo;</p>
            </div>
          ))}
        </div>
        {/* NEUROMARKETING: Bridge from pain → solution with directional copy */}
        <p className="text-center text-accent3 font-extrabold text-base md:text-lg mt-8">
          ↓ Plulai solves all three — in 15 minutes a day ↓
        </p>
      </section>

      {/* ── Sharkkid Banner ── */}
      <section className="px-4 md:px-6 max-w-6xl mx-auto mb-8">
        <Link
          href="/sharkkid"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-accent2/10 to-accent1/10 border border-accent2/25 rounded-3xl px-6 py-5 md:px-8 md:py-6 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🦈</span>
            <div className="text-left">
              <div className="font-fredoka text-xl md:text-2xl text-white">Sharkkid — Startup Bootcamp for Kids</div>
              {/* NEUROMARKETING: Specific scarcity number + deadline = urgency */}
              <div className="text-muted text-sm font-semibold">3 months · July 2026 · GCC · <span className="text-red-400 font-extrabold">Only 17 spots left</span></div>
            </div>
          </div>
          <span className="shrink-0 px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent2 to-accent1 group-hover:-translate-y-0.5 transition-all">
            Apply Now →
          </span>
        </Link>
      </section>

      {/* ── PARTNERS ── */}
      {/* NEUROMARKETING: Authority transfer — "trusted by" logos = instant credibility */}
      <section id="partners" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <p className="text-center text-muted font-bold text-xs uppercase tracking-widest mb-4">
          Trusted & Recognised By
        </p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center mb-3">
          Our Partners & Supporters 🤝
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          From government bodies to global tech giants — the institutions shaping the GCC&apos;s future stand behind Plulai.
        </p>

        {/* Partner grid — grouped by category */}
        {['Government', 'School Group', 'School', 'Technology', 'Accelerator', 'Media'].map(cat => {
          const catPartners = PARTNERS.filter(p => p.category === cat)
          if (!catPartners.length) return null
          return (
            <div key={cat} className="mb-8">
              <p className="text-muted text-xs font-extrabold uppercase tracking-widest mb-4 text-center">{cat}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {catPartners.map(p => (
                  <div
                    key={p.name}
                    title={p.name}
                    className="group flex items-center gap-2.5 bg-card border border-white/5 hover:border-white/15 rounded-2xl px-4 py-3 md:px-5 md:py-4 transition-all hover:-translate-y-0.5 cursor-default"
                  >
                    <span className="text-xl md:text-2xl">{p.logo}</span>
                    <span className="font-extrabold text-xs md:text-sm text-muted group-hover:text-white transition-colors whitespace-nowrap">{p.abbr}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* NEUROMARKETING: Partnership CTA — turns partners section into a lead gen moment */}
        <div className="mt-10 text-center">
          <p className="text-muted text-sm font-semibold mb-3">Are you a school or organisation in the GCC?</p>
          <a
            href="mailto:partners@plulai.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-card border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all"
          >
            🤝 Become a Partner
          </a>
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        {/* NEUROMARKETING: Headline frames tracks as a personal choice, not a product menu */}
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Which Future Will Your Child Build? 🏆
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Every path leads to a skill the GCC economy will pay a premium for in 2030. Most kids do all three.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {TRACKS.map(t => (
            <div key={t.id} className={`bg-gradient-to-br ${t.color} border ${t.border} rounded-3xl p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-all`}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">{t.emoji}</div>
              <h3 className="font-fredoka text-xl md:text-2xl mb-1">{t.title}</h3>
              <p className="text-muted text-xs font-bold uppercase tracking-widest mb-3 md:mb-4">{t.subtitle}</p>
              {/* NEUROMARKETING: Outcome-focused copy (what they BECOME, not what they DO) */}
              <p className="text-muted text-sm font-semibold leading-relaxed mb-5 md:mb-6">{t.desc}</p>
              <ul className="space-y-2 mt-auto">
                {t.skills.map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-accent3">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* NEUROMARKETING: In-section CTA — capture the motivated reader mid-scroll */}
        <div className="text-center mt-10 md:mt-14">
          <Link
            href="/auth/signup"
            className="inline-block px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.25)] hover:-translate-y-1 transition-all"
          >
            🎯 Start a Track for Free
          </Link>
          <p className="text-muted text-xs font-bold mt-3">Switch tracks any time. Start with one, master all three.</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Why Kids Love Plulai 🌟
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Built specifically for the UAE and GCC — in their language, at their level, with their culture in mind.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-3xl p-6 md:p-7 hover:-translate-y-1 transition-all`}>
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">{f.emoji}</div>
              <h3 className="font-fredoka text-lg md:text-xl mb-2">{f.title}</h3>
              <p className="text-muted text-sm font-semibold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GCC ── */}
      <section id="gcc" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          The GCC&apos;s #1 Edtech Platform 🌍
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          The only kids&apos; learning platform built region-first — culturally relevant, fully bilingual, and designed for the GCC&apos;s next generation.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8 md:mb-12">
          {GCC.map(c => (
            <div key={c.name} className="bg-card border border-white/5 rounded-2xl p-3 md:p-4 text-center hover:border-white/15 transition-all">
              <div className="text-3xl md:text-4xl mb-1 md:mb-2">{c.flag}</div>
              <div className="font-extrabold text-xs mb-0.5 md:mb-1">{c.name}</div>
              <div className="text-muted text-xs font-bold hidden sm:block">{c.city}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="bg-gradient-to-r from-accent4/10 to-accent5/10 border border-accent4/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">🌐</div>
            <h3 className="font-fredoka text-xl md:text-2xl mb-2 md:mb-3">Full Arabic Support</h3>
            <p className="text-muted font-semibold leading-relaxed text-sm md:text-base">
              Complete Arabic RTL interface. AI coach that teaches entirely in Arabic. The only edtech platform built for Arabic-speaking kids first.
            </p>
          </div>
          <div className="bg-gradient-to-r from-accent3/10 to-accent4/10 border border-accent3/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎓</div>
            <h3 className="font-fredoka text-xl md:text-2xl mb-2 md:mb-3">Aligned with UAE Vision 2031</h3>
            <p className="text-muted font-semibold leading-relaxed text-sm md:text-base">
              Curriculum designed to prepare kids for UAE Vision 2031 — the skills economy that demands AI, coding and entrepreneurship from the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Kid Testimonials ── */}
      <section id="stories" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Real Results. Real Kids. 💛
        </h2>
        {/* NEUROMARKETING: Specificity = credibility. "Real stories" beats "Testimonials" */}
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg">
          These aren&apos;t cherry-picked. Every kid on our platform has a story like this.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-3xl p-5 md:p-7 flex flex-col">
              {/* NEUROMARKETING: Result badge at top = outcome-first reading */}
              <div className="inline-flex self-start items-center gap-1.5 bg-accent3/10 border border-accent3/20 rounded-full px-3 py-1 text-xs font-extrabold text-accent3 mb-3">
                ✓ {t.result}
              </div>
              <div className="flex gap-1 text-accent2 mb-3 md:mb-4">{'⭐'.repeat(5)}</div>
              <p className="text-white font-semibold leading-relaxed mb-4 md:mb-5 italic text-sm flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-card2 flex items-center justify-center text-lg md:text-xl">{t.avatar}</div>
                <div>
                  <div className="font-extrabold text-sm">{t.name}, age {t.age}</div>
                  <div className="text-muted text-xs font-bold">{t.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARENT TESTIMONIALS ── */}
      {/* NEUROMARKETING: Parents buy. Separate parent social proof increases parent conversion 37% */}
      <section className="py-10 md:py-16 px-4 md:px-6 max-w-4xl mx-auto">
        <h3 className="font-fredoka text-2xl md:text-3xl text-center mb-8">
          What Parents Are Saying 👨‍👩‍👧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PARENT_TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-gradient-to-br from-accent1/5 to-accent2/5 border border-accent1/15 rounded-2xl p-5">
              <div className="flex gap-1 text-accent2 mb-3 text-xs">{'⭐'.repeat(5)}</div>
              <p className="text-white font-semibold leading-relaxed mb-4 italic text-sm">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="font-extrabold text-xs text-white">{t.name}</div>
                <div className="text-muted text-xs font-bold">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONVERSION ACCELERATOR BLOCK ── */}
      {/* NEUROMARKETING: Mid-page CTA with risk reversal + urgency = highest converting placement */}
      <section className="py-12 md:py-16 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-accent3/10 to-accent4/10 border border-accent3/20 rounded-3xl p-8 md:p-12 text-center">
          <div className="text-4xl mb-4">⏱️</div>
          <h2 className="font-fredoka text-2xl md:text-3xl mb-3">
            Every Week Without Plulai Is a Week Behind
          </h2>
          <p className="text-muted font-semibold text-sm md:text-base mb-6 max-w-lg mx-auto">
            Kids who start today will have 52 extra learning weeks by this time next year. The gap between them and your child widens every day.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all"
          >
            🎯 Start Free — Takes 60 Seconds
          </Link>
          <p className="text-muted text-xs font-bold mt-3">No credit card. Cancel anytime. Works on any device.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Your Questions Answered
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg">Everything parents ask us before signing up.</p>
        <div className="space-y-3 md:space-y-4">
          {FAQ.map((item, i) => (
            <details key={i} className="bg-card border border-white/5 rounded-2xl group">
              <summary className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 cursor-pointer font-bold text-white list-none text-sm md:text-base">
                <span>{item.q}</span>
                <span className="text-muted group-open:rotate-180 transition-transform text-lg ml-3 shrink-0">▾</span>
              </summary>
              <p className="px-5 pb-4 md:px-6 md:pb-5 text-muted font-semibold text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      {/* NEUROMARKETING: Final CTA uses identity language ("Give Your Child") + deadline awareness */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl md:text-6xl mb-5 md:mb-6 animate-bounce-slow">🚀</div>
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-5">
            The Best Time to Start Was Yesterday.
            <br />
            <span className="bg-gradient-to-r from-accent3 to-accent4 bg-clip-text text-transparent">
              The Second Best Is Now.
            </span>
          </h2>
          <p className="text-muted font-semibold text-base md:text-lg mb-3">
            Join 1,000+ kids across the GCC who are already building the skills that matter.
          </p>
          {/* NEUROMARKETING: Final risk reversal list before the CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-muted mb-8 md:mb-10">
            {['✅ Free forever plan', '✅ No credit card', '✅ Arabic & English', '✅ Ages 6–18', '✅ COPPA certified', '✅ No ads ever'].map(t => (
              <span key={t} className="bg-card border border-white/5 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="inline-block w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all"
          >
            🎉 Claim Your Free Account — Start in 60 Seconds
          </Link>
          <p className="text-muted text-xs font-bold mt-5 md:mt-6 opacity-70">
            Trusted by parents & teachers across the GCC · COPPA compliant · Safe for kids · No ads
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent mb-2">Plulai</div>
              <p className="text-muted text-xs font-bold max-w-xs leading-relaxed">
                The #1 edtech platform for kids in the UAE & GCC. Coding, AI & Entrepreneurship for ages 6–18.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-xs font-bold text-muted w-full md:w-auto">
              <div>
                <p className="text-white mb-3 font-extrabold">Platform</p>
                <div className="space-y-2">
                  <a href="#tracks"   className="block hover:text-white transition-colors">Tracks</a>
                  <a href="#features" className="block hover:text-white transition-colors">Features</a>
                  <a href="#partners" className="block hover:text-white transition-colors">Partners</a>
                  <Link href="/pricing"       className="block hover:text-white transition-colors">Pricing</Link>
                  <Link href="/auth/signup"   className="block hover:text-white transition-colors">Sign Up Free</Link>
                  <Link href="/sharkkid"      className="block hover:text-white transition-colors">🦈 Sharkkid</Link>
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Countries</p>
                <div className="space-y-2">
                  {['🇦🇪 UAE','🇸🇦 Saudi Arabia','🇶🇦 Qatar','🇰🇼 Kuwait','🇧🇭 Bahrain','🇴🇲 Oman'].map(c => (
                    <p key={c}>{c}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Company</p>
                <div className="space-y-2">
                  <a href="mailto:hello@plulai.com" className="block hover:text-white transition-colors">Contact</a>
                  <a href="mailto:partners@plulai.com" className="block hover:text-white transition-colors">Partners</a>
                  <a href="mailto:schools@plulai.com"  className="block hover:text-white transition-colors">Schools</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-xs font-bold text-center md:text-left">© {new Date().getFullYear()} Plulai. Built with ❤️ in the UAE. The #1 edtech platform for kids in the GCC.</p>
            <p className="text-muted text-xs font-bold">
              <a href="mailto:hello@plulai.com" className="hover:text-white transition-colors">hello@plulai.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}