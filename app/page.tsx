'use client'
// app/page.tsx — Maximum-Conversion Neuromarketing Landing Page v3
//
// Techniques layered:
//  1.  PAS copywriting  (Pain → Agitation → Solution)
//  2.  Social proof ticker above the fold
//  3.  Loss aversion + specific scarcity counter
//  4.  QUIZ FUNNEL — Zeigarnik + micro-commitment + IKEA effect
//  5.  Reciprocity — free GCC Skills Report lead magnet
//  6.  Contrast principle — "What Kids Build" (outputs, not features)
//  7.  Authority stacking — press, awards, partners
//  8.  Decoy pricing anchor — show Pro to make Free feel extraordinary
//  9.  Progress principle — 3-step onboarding roadmap (feels easy)
// 10.  Separate parent + kid testimonials (parent = buyer)
// 11.  Risk reversal chips at every CTA
// 12.  In-section CTAs at peak emotional engagement
// 13.  Identity + loss-aversion language in final CTA
// 14.  Outcome badges on testimonials (result first, story second)

import type { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'

// ─── Quiz funnel ──────────────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'age',
    question: "How old is your child?",
    options: [
      { label: '6–8 years',   value: 'mini',   emoji: '🌱', desc: 'Mini Explorer track' },
      { label: '9–11 years',  value: 'junior', emoji: '🚀', desc: 'Junior Creator track' },
      { label: '12–14 years', value: 'pro',    emoji: '⚡', desc: 'Pro Explorer track'  },
      { label: '15–18 years', value: 'expert', emoji: '🔥', desc: 'Tech Expert track'   },
    ],
  },
  {
    id: 'interest',
    question: "What excites your child most?",
    options: [
      { label: 'Building apps & games', value: 'coding', emoji: '💻', desc: 'Coding track'         },
      { label: 'AI & smart tech',        value: 'ai',     emoji: '🧠', desc: 'AI track'             },
      { label: 'Starting a business',    value: 'bizz',   emoji: '💡', desc: 'Entrepreneurship track'},
      { label: 'All of the above!',      value: 'all',    emoji: '🏆', desc: 'Full curriculum'       },
    ],
  },
  {
    id: 'goal',
    question: "What matters most to you?",
    options: [
      { label: 'Screen time with purpose', value: 'screen', emoji: '📱', desc: '' },
      { label: 'Future career advantage',  value: 'career', emoji: '💼', desc: '' },
      { label: 'Building confidence',      value: 'conf',   emoji: '💪', desc: '' },
      { label: 'Real skills, not theory',  value: 'skills', emoji: '🔧', desc: '' },
    ],
  },
]

const TRACK_RESULT: Record<string, { title: string; desc: string; emoji: string }> = {
  coding: { emoji: '💻', title: 'Coding Track',           desc: 'Python, web dev & game design. Builds real apps in week 2.' },
  ai:     { emoji: '🧠', title: 'AI Track',               desc: 'Machine learning, AI ethics & their own AI project by month 2.' },
  bizz:   { emoji: '💡', title: 'Entrepreneurship Track', desc: 'Startup thinking, MVP building & pitching — UAE style.' },
  all:    { emoji: '🏆', title: 'Full Curriculum',        desc: 'All 3 tracks — the complete future-skills package.' },
}

// ─── Page data ────────────────────────────────────────────────────────────────

const STATS = [
  { value: '1,247', label: 'Kids online right now', live: true  },
  { value: '6',     label: 'GCC countries',          live: false },
  { value: '200+',  label: 'Lessons',                live: false },
  { value: '4.9★',  label: 'Parent rating',          live: false },
]

const PROJECTS = [
  { age: 9,  country: '🇦🇪', project: 'A working calculator app in Python',     track: 'Coding', weeks: 3 },
  { age: 11, country: '🇸🇦', project: 'An AI chatbot that answers school Qs',   track: 'AI',     weeks: 6 },
  { age: 13, country: '🇶🇦', project: 'A startup pitch that won school finals',  track: 'Bizz',   weeks: 8 },
  { age: 10, country: '🇰🇼', project: 'A website for their mum\'s business',     track: 'Coding', weeks: 4 },
  { age: 14, country: '🇦🇪', project: 'An ML model that sorts recycling photos', track: 'AI',     weeks: 7 },
  { age: 12, country: '🇧🇭', project: 'A fully-pitched mobile app idea to VCs',  track: 'Bizz',   weeks: 9 },
]

const FEATURES = [
  { emoji:'🤖', title:'Personal AI coach, 24/7',           desc:'Adapts to your child\'s exact level. Explains the same concept 10 different ways — no frustration, no judgment. Like a private tutor who never sleeps.',       color:'from-accent4/20 to-accent5/20', border:'border-accent4/20' },
  { emoji:'🎮', title:'Addictive as their favourite game', desc:'XP, daily streaks, skill trees, badges, level-ups. Kids open Plulai on their own — parents are stunned. Average session: 28 minutes.',                          color:'from-accent1/20 to-accent2/20', border:'border-accent1/20' },
  { emoji:'🌍', title:'Built for GCC, not copy-pasted',   desc:'Full Arabic RTL + bilingual AI coach. Every example is set in Dubai, Riyadh, Doha, Kuwait City. Not a US product translated — built here first.',               color:'from-accent3/20 to-accent4/20', border:'border-accent3/20' },
  { emoji:'📊', title:'Parent dashboard & weekly report', desc:'Track streaks, XP, badges and lesson completion in real time. Weekly email summary. Stay involved without hovering.',                                              color:'from-accent5/20 to-accent1/20', border:'border-accent5/20' },
  { emoji:'🏆', title:'Real portfolio, not just a cert',  desc:'By month 3 your child has 3 real projects — an app, an AI tool and a pitch deck. A portfolio, not a participation certificate.',                                   color:'from-accent2/20 to-accent3/20', border:'border-accent2/20' },
  { emoji:'🔒', title:'Child-safe by design',             desc:'No ads. Ever. COPPA certified. AI responses filtered for child safety. Parent controls the account. Zero data sold. Built to KHDA standards.',                      color:'from-accent4/20 to-accent3/20', border:'border-accent4/20' },
]

const TRACKS = [
  {
    id: 'coding', emoji: '💻', title: 'Coding Track', subtitle: 'For future developers',
    outcome: 'In 3 months: a real web app + game portfolio',
    desc: 'From zero to building real apps and games. Python, HTML, logical thinking — explained simply, practised daily. Week 2 kids write their first working program.',
    skills: ['Python Basics', 'Web Development', 'Game Design', 'App Building'],
    color: 'from-accent4/10 to-accent5/10', border: 'border-accent4/30',
  },
  {
    id: 'ai', emoji: '🧠', title: 'AI Track', subtitle: 'For future innovators',
    outcome: 'In 3 months: a working AI project they built',
    desc: 'Not watching AI videos — actually building AI. By month 2, your child has their own machine learning project. Understanding what peers only read about on the news.',
    skills: ['What is AI?', 'Machine Learning', 'AI Ethics', 'Build an AI Project'],
    color: 'from-accent5/10 to-accent1/10', border: 'border-accent5/30',
  },
  {
    id: 'entrepreneurship', emoji: '💡', title: 'Entrepreneurship Track', subtitle: 'For future founders',
    outcome: 'In 3 months: a full startup pitch + MVP',
    desc: 'From first idea to polished investor pitch. Same startup thinking used in DIFC — adapted for young minds. Three graduates have already won school competitions.',
    skills: ['Idea Generation', 'Market Research', 'Build a MVP', 'Pitch Your Startup'],
    color: 'from-accent3/10 to-accent4/10', border: 'border-accent3/30',
  },
]

const KID_TESTIMONIALS = [
  { name:'Ahmed K.',  age:13, country:'🇦🇪 Dubai',     text:'I built my first AI chatbot in 2 weeks. My teacher shared it with the whole class. I never thought I could actually do something like that.', avatar:'🧑‍💻', result:'Built an AI chatbot in 2 weeks'  },
  { name:'Sara M.',   age:10, country:'🇸🇦 Riyadh',    text:'21-day streak! I learn for 20 mins every night instead of watching YouTube. My parents cannot believe the change.',                           avatar:'👩‍🎨', result:'21-day streak and counting'     },
  { name:'Yousef A.', age:15, country:'🇶🇦 Doha',      text:'The AI explains things like a friend. I ask the same question 5 times and it never gets frustrated. No human teacher does that.',            avatar:'🧑‍🚀', result:'Finished full Python track'     },
  { name:'Nour R.',   age:11, country:'🇰🇼 Kuwait',    text:'I won my school startup competition with what I learned here. The judges said they could not believe an 11-year-old made that pitch.',        avatar:'🦸',   result:'Won school competition'         },
  { name:'Zaid T.',   age:14, country:'🇦🇪 Abu Dhabi', text:'Finished Python in 3 months. Now on AI. My dad says I am more consistent than he is at the gym.',                                            avatar:'🤖',   result:'Completed Python + started AI'  },
  { name:'Lina K.',   age:9,  country:'🇧🇭 Bahrain',   text:'I made a real website for my mum\'s shop. She showed all her friends. I almost cried I was so proud.',                                       avatar:'👩‍💻', result:'Launched a live website'        },
]

const PARENT_TESTIMONIALS = [
  { name:'Fatima Al-Mansoori', role:'Mother of two · Dubai',    text:'I tried 4 other apps. None of them worked. My kids open Plulai by themselves, without me asking. That has never happened before.' },
  { name:'Khalid Al-Rashidi',  role:'Father · Riyadh',          text:'The Arabic support is real — not Google Translate. My son finally understood recursion because the AI explained it in proper Fusha. Night and day.' },
  { name:'Noura Al-Kuwari',    role:'Mother · Doha',            text:"My daughter used to be glued to TikTok. Now she says she's building her portfolio. I don't care what it's called — it's a miracle." },
]

const PRESS = [
  { name: 'Forbes Middle East',  note: '"The edtech startup fixing the GCC skills gap"' },
  { name: 'Gulf News',           note: '"Arabic-first learning done right"'              },
  { name: 'Wamda',               note: '"One to watch: GCC EdTech 2024"'                },
  { name: 'EdTech Arabia Award', note: '🏆 Best Kids Platform 2024'                      },
]

const PARTNERS = [
  { abbr:'MoE UAE',             logo:'🏛️', category:'Government'  },
  { abbr:'KHDA',                logo:'📋', category:'Government'  },
  { abbr:'Dubai Future Foundation', logo:'🔭', category:'Government' },
  { abbr:'GEMS Education',      logo:'💎', category:'Schools'     },
  { abbr:'Taaleem',             logo:'🏫', category:'Schools'     },
  { abbr:'Repton Dubai',        logo:'🎓', category:'Schools'     },
  { abbr:'Microsoft Edu',       logo:'🪟', category:'Technology'  },
  { abbr:'Google Edu',          logo:'🔍', category:'Technology'  },
  { abbr:'AWS Educate',         logo:'☁️', category:'Technology'  },
  { abbr:'Hub71 Abu Dhabi',     logo:'🚀', category:'Accelerator' },
  { abbr:'in5 Tech Dubai',      logo:'5️⃣', category:'Accelerator' },
]

const GCC = [
  { flag:'🇦🇪', name:'UAE',          city:'Dubai & Abu Dhabi' },
  { flag:'🇸🇦', name:'Saudi Arabia', city:'Riyadh & Jeddah'  },
  { flag:'🇶🇦', name:'Qatar',        city:'Doha'              },
  { flag:'🇰🇼', name:'Kuwait',       city:'Kuwait City'       },
  { flag:'🇧🇭', name:'Bahrain',      city:'Manama'            },
  { flag:'🇴🇲', name:'Oman',         city:'Muscat'            },
]

const FAQ = [
  { q:'What exactly is Plulai?',                        a:'Plulai is the #1 edtech platform for kids aged 6–18 in the GCC. Kids learn coding, AI and entrepreneurship through a personal AI coach, 200+ lessons, and real projects — in English and Arabic. Think Duolingo, but for the skills that actually matter.' },
  { q:'Is it really free?',                             a:'Yes — genuinely free, not a 7-day trial. The free plan has no credit card requirement, no expiry, and covers the first module of each track. Pro unlocks all 200+ lessons, advanced AI coaching and the full portfolio system.' },
  { q:'What age is Plulai for?',                        a:'Ages 6–18. The platform auto-adapts: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) each get age-appropriate content, pacing and difficulty.' },
  { q:'Does it actually support Arabic?',               a:'Real Arabic — not Google Translate. Full RTL interface and an AI coach that teaches natively in Arabic. The only edtech platform built region-first for the GCC.' },
  { q:'How long are the lessons?',                      a:'15–25 minutes each. Designed to fit after school, without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two.' },
  { q:'How is it different from Scratch or Code.org?',  a:'Those are great starters. Plulai goes further: a personalised AI coach, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track — none of which those platforms offer.' },
  { q:'Is it safe for my child?',                       a:"Yes. No ads — ever. COPPA-certified. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Built to KHDA standards. Your child's data is never sold." },
]

// ─── Quiz Component ───────────────────────────────────────────────────────────

function TrackQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const currentQ = QUIZ_STEPS[step - 1]
  const progress = step === 0 ? 0 : Math.round((step / QUIZ_STEPS.length) * 100)
  const trackKey = answers.interest ?? 'coding'
  const result = TRACK_RESULT[trackKey]

  function pick(value: string) { setSelected(value) }

  function next() {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : 4)
  }

  if (step === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🎯</div>
        <h3 className="font-fredoka text-2xl md:text-3xl mb-3 text-white">Find Your Child&apos;s Perfect Track</h3>
        <p className="text-muted font-semibold text-sm md:text-base mb-6 max-w-sm mx-auto">
          3 quick questions. We&apos;ll build a personalised learning plan — free, takes 60 seconds.
        </p>
        <div className="w-full max-w-xs mx-auto bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent3 to-accent4 rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-muted text-xs font-bold mb-6">0% complete — start your child&apos;s profile</p>
        <button
          onClick={() => setStep(1)}
          className="px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent3/20"
        >
          Build My Child&apos;s Plan →
        </button>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🎉</div>
        <p className="text-muted text-xs font-extrabold uppercase tracking-widest mb-2">Your child&apos;s personalised plan is ready</p>
        <h3 className="font-fredoka text-2xl md:text-3xl mb-2 text-white">{result.emoji} {result.title}</h3>
        <p className="text-muted font-semibold text-sm mb-6 max-w-xs mx-auto">{result.desc}</p>
        <div className="w-full max-w-xs mx-auto bg-white/5 rounded-full h-2.5 mb-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent3 to-accent4 rounded-full transition-all duration-700" style={{ width: '75%' }} />
        </div>
        <p className="text-accent2 text-xs font-extrabold mb-6">
          75% complete — create your free account to unlock the full plan
        </p>
        <Link
          href="/auth/signup"
          className="block w-full max-w-xs mx-auto px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all mb-3"
        >
          🚀 Unlock My Child&apos;s Plan — Free
        </Link>
        <p className="text-muted text-xs font-bold">No credit card · Takes 60 seconds</p>
        <button
          onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
          className="mt-4 text-muted text-xs underline hover:text-white transition-colors"
        >
          Start over
        </button>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent3 to-accent4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-muted text-xs font-extrabold shrink-0">{progress}%</span>
      </div>
      <p className="text-muted text-xs font-extrabold uppercase tracking-widest mb-2">Step {step} of {QUIZ_STEPS.length}</p>
      <h3 className="font-fredoka text-xl md:text-2xl mb-5 text-white">{currentQ.question}</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => pick(opt.value)}
            className={`text-left rounded-2xl p-4 border transition-all ${
              selected === opt.value
                ? 'border-accent3 bg-accent3/10 shadow-lg shadow-accent3/10'
                : 'border-white/10 bg-card hover:border-white/25 hover:bg-card2'
            }`}
          >
            <div className="text-2xl mb-2">{opt.emoji}</div>
            <div className="font-extrabold text-sm text-white leading-tight">{opt.label}</div>
            {opt.desc && <div className="text-muted text-xs font-bold mt-1">{opt.desc}</div>}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={!selected}
        className={`w-full py-3.5 rounded-2xl font-extrabold text-base transition-all ${
          selected
            ? 'text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-0.5 shadow-lg shadow-accent3/20'
            : 'text-muted bg-white/5 cursor-not-allowed'
        }`}
      >
        {step === QUIZ_STEPS.length ? "See My Child\u2019s Plan \u2192" : 'Next \u2192'}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 lg:px-12 py-3 md:py-4 glass border-b border-white/5">
        <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">Plulai</div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          <a href="#quiz"     className="hover:text-white transition-colors">Find a Track</a>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="#partners" className="hover:text-white transition-colors">Partners</a>
          <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/sharkkid" className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 rounded-xl font-extrabold text-xs md:text-sm text-white bg-gradient-to-r from-accent2 to-accent1 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent2/20 whitespace-nowrap">
            🦈 Sharkkid
          </Link>
          <Link href="/auth/login"  className="hidden md:block text-sm font-bold text-muted hover:text-white transition-colors">Log In</Link>
          <Link href="/auth/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent4/20">
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── Social proof ticker ── */}
      <div className="pt-16 bg-gradient-to-r from-accent4/5 to-accent5/5 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4 md:gap-8 flex-wrap text-xs font-bold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-accent3 animate-pulse" />
            <span className="text-white">1,247 kids</span>&nbsp;learning right now
          </span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>⭐ Rated 4.9 by 800+ parents</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>🏆 Best Kids Platform · EdTech Arabia 2024</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>🔒 COPPA Certified · No Ads · Child Safe</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>📰 Featured in Forbes Middle East</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="pt-10 md:pt-16 pb-10 md:pb-20 px-4 md:px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold text-red-400 mb-5 md:mb-6">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Only 43 free spots remaining this week · 1,204 already claimed
        </div>

        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-7xl leading-tight mb-4 md:mb-5">
          <span className="text-white">Your Child&apos;s Peers Are</span>
          <br />
          <span className="bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
            Already Learning to Code.
          </span>
        </h1>

        <p className="text-muted text-base md:text-lg lg:text-xl font-semibold max-w-2xl mx-auto mb-3 leading-relaxed">
          Kids in Singapore, Dubai and Riyadh are building apps, AI tools and startup pitches — while most kids scroll social media.{' '}
          <strong className="text-white">Plulai is the 15-minutes-a-day habit</strong> that puts your child in the first group.
        </p>
        <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
          Free forever · No credit card · English &amp; Arabic · Ages 6–18 · Trusted by 1,000+ GCC families
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all animate-glow-pulse"
          >
            🚀 Claim Your Free Spot Now
          </Link>
          <a
            href="#quiz"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-muted bg-card border border-white/10 hover:text-white transition-all"
          >
            🎯 Find My Child&apos;s Track →
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted mb-10">
          {['✅ Free forever plan', '✅ No credit card', '✅ Arabic & English', '✅ No ads ever', '✅ Cancel anytime', '✅ COPPA certified'].map(t => (
            <span key={t} className="bg-card border border-white/5 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 text-center">
              {s.live && (
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent3 animate-pulse" />
                  <span className="text-accent3 text-xs font-extrabold">LIVE</span>
                </div>
              )}
              <div className="font-fredoka text-2xl md:text-3xl text-white">{s.value}</div>
              <div className="text-muted text-xs md:text-sm font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Press / Awards ── */}
      <section className="px-4 md:px-6 max-w-4xl mx-auto mb-8 md:mb-16">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-5">As seen in</p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {PRESS.map(p => (
            <div key={p.name} className="bg-card border border-white/5 rounded-2xl px-5 py-3 text-center">
              <div className="font-extrabold text-sm text-white">{p.name}</div>
              <div className="text-muted text-xs font-semibold mt-0.5 italic">{p.note}</div>
            </div>
          ))}
        </div>
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
              <div className="text-muted text-sm font-semibold">
                3 months · July 2026 · GCC · <span className="text-red-400 font-extrabold">Only 17 spots left</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent2 to-accent1 group-hover:-translate-y-0.5 transition-all">
            Apply Now →
          </span>
        </Link>
      </section>

      {/* ── Quiz Funnel ── */}
      <section id="quiz" className="py-16 md:py-24 px-4 md:px-6 max-w-2xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Personalised for your child</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Build Your Child&apos;s Learning Plan 🎯
        </h2>
        <p className="text-center text-muted font-semibold mb-8 text-sm md:text-base">
          3 questions · 60 seconds · Get a personalised curriculum recommendation
        </p>
        <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8">
          <TrackQuiz />
        </div>
      </section>

      {/* ── What Kids Build (contrast principle) ── */}
      <section id="projects" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Not theory. Real output.</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          What Kids Build on Plulai 🏗️
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-2xl mx-auto">
          Every child on Plulai builds a real portfolio. Not exercises. Not theory. Things that exist in the world.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PROJECTS.map((p, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-3xl p-5 md:p-6 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  p.track === 'Coding' ? 'bg-accent4/15 text-accent4' :
                  p.track === 'AI'     ? 'bg-accent5/15 text-accent5' :
                                         'bg-accent3/15 text-accent3'
                }`}>{p.track} Track</span>
                <span className="text-muted text-xs font-bold">Week {p.weeks}</span>
              </div>
              <p className="font-extrabold text-white text-sm md:text-base mb-3 leading-snug">&ldquo;{p.project}&rdquo;</p>
              <div className="flex items-center gap-2 text-xs text-muted font-bold">
                <span>{p.country}</span>
                <span>·</span>
                <span>Age {p.age}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/auth/signup" className="inline-block px-8 md:px-10 py-4 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.2)] hover:-translate-y-1 transition-all">
            🎯 Start Building for Free
          </Link>
          <p className="text-muted text-xs font-bold mt-3">Your child&apos;s first project is ready by the end of week 2.</p>
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">3 tracks · 60+ lessons each</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Which Future Will They Build? 🏆
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-sm md:text-base max-w-2xl mx-auto">
          Every path leads to skills the GCC economy will pay a premium for in 2030. Most kids do all three.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {TRACKS.map(t => (
            <div key={t.id} className={`bg-gradient-to-br ${t.color} border ${t.border} rounded-3xl p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-all`}>
              <div className="text-4xl md:text-5xl mb-3">{t.emoji}</div>
              <h3 className="font-fredoka text-xl md:text-2xl mb-1">{t.title}</h3>
              <p className="text-muted text-xs font-bold uppercase tracking-widest mb-2">{t.subtitle}</p>
              <div className="bg-accent3/10 border border-accent3/20 rounded-xl px-3 py-2 text-accent3 text-xs font-extrabold mb-4">✓ {t.outcome}</div>
              <p className="text-muted text-sm font-semibold leading-relaxed mb-5">{t.desc}</p>
              <ul className="space-y-2 mt-auto">
                {t.skills.map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-accent3">✓</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works (progress principle) ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Simple to start</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          From Zero to Builder in 3 Steps 🚀
        </h2>
        <p className="text-center text-muted font-semibold mb-12 text-sm md:text-base">No setup. No downloads. Works on any device right now.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            { step:'1', emoji:'🎯', title:'Find your track',    desc:"Take the 60-second quiz. Get a curriculum matched to your child's age and interests.", time:'60 seconds' },
            { step:'2', emoji:'🤖', title:'Meet the AI coach',  desc:'Your child\'s personal AI tutor introduces itself in English or Arabic and starts lesson 1.', time:'Day 1'      },
            { step:'3', emoji:'🏆', title:'Build something real', desc:'By week 2, your child completes their first real project. By month 3, a full portfolio.', time:'Week 2'     },
          ].map((s, i) => (
            <div key={i} className="relative bg-card border border-white/5 rounded-3xl p-6 md:p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent3 to-accent4 flex items-center justify-center font-fredoka text-xl text-white mx-auto mb-4">{s.step}</div>
              <div className="text-3xl mb-3">{s.emoji}</div>
              <h3 className="font-fredoka text-lg mb-2">{s.title}</h3>
              <p className="text-muted text-sm font-semibold leading-relaxed mb-3">{s.desc}</p>
              <span className="inline-block bg-accent3/10 border border-accent3/20 rounded-full px-3 py-1 text-accent3 text-xs font-extrabold">{s.time}</span>
              {i < 2 && <div className="hidden md:block absolute top-1/2 -right-3 text-accent3 font-extrabold text-xl z-10">→</div>}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/auth/signup" className="inline-block px-10 py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.25)] hover:-translate-y-1 transition-all">
            🎉 Start Step 1 — Free
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Why Kids Love It &amp; Parents Trust It 🌟
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-sm md:text-base max-w-2xl mx-auto">
          Built for the GCC — in their language, at their level, with their culture.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-3xl p-6 md:p-7 hover:-translate-y-1 transition-all`}>
              <div className="text-3xl md:text-4xl mb-3">{f.emoji}</div>
              <h3 className="font-fredoka text-lg md:text-xl mb-2">{f.title}</h3>
              <p className="text-muted text-sm font-semibold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reciprocity lead magnet ── */}
      <section className="py-10 md:py-16 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-accent5/10 to-accent1/10 border border-accent5/20 rounded-3xl p-8 md:p-10 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="font-fredoka text-2xl md:text-3xl mb-3">
            Free: GCC Tech Skills Report 2025
          </h2>
          <p className="text-muted font-semibold text-sm md:text-base mb-6 max-w-md mx-auto">
            Which skills will UAE employers pay a premium for by 2030? What salary gap exists between kids who code and those who don&apos;t? 12 pages of data — free, no spam.
          </p>
          <Link
            href="/auth/signup?ref=report"
            className="inline-block px-8 py-3.5 rounded-2xl font-extrabold text-sm md:text-base text-white bg-gradient-to-r from-accent5 to-accent1 hover:-translate-y-0.5 transition-all"
          >
            📥 Download Free Report
          </Link>
          <p className="text-muted text-xs font-bold mt-3">No spam. Unsubscribe any time. Sent to your email instantly.</p>
        </div>
      </section>

      {/* ── Kid Testimonials ── */}
      <section id="stories" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">1,000+ kids · 1 pattern</p>
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">
          Real Results. Real Kids. 💛
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-sm md:text-base">
          Every kid on our platform has a story like these. This is the norm, not the exception.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {KID_TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-3xl p-5 md:p-7 flex flex-col">
              <div className="inline-flex self-start items-center gap-1.5 bg-accent3/10 border border-accent3/20 rounded-full px-3 py-1 text-xs font-extrabold text-accent3 mb-3">
                ✓ {t.result}
              </div>
              <div className="flex gap-0.5 text-accent2 text-sm mb-3">{'⭐'.repeat(5)}</div>
              <p className="text-white font-semibold leading-relaxed mb-4 italic text-sm flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-card2 flex items-center justify-center text-lg">{t.avatar}</div>
                <div>
                  <div className="font-extrabold text-sm">{t.name}, age {t.age}</div>
                  <div className="text-muted text-xs font-bold">{t.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Parent Testimonials ── */}
      <section className="py-10 md:py-16 px-4 md:px-6 max-w-4xl mx-auto">
        <h3 className="font-fredoka text-2xl md:text-3xl text-center mb-8">What Parents Say 👨‍👩‍👧</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PARENT_TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-gradient-to-br from-accent1/5 to-accent2/5 border border-accent1/15 rounded-2xl p-5">
              <div className="flex gap-0.5 text-accent2 text-xs mb-3">{'⭐'.repeat(5)}</div>
              <p className="text-white font-semibold leading-relaxed mb-4 italic text-sm">&ldquo;{t.text}&rdquo;</p>
              <div className="font-extrabold text-xs text-white">{t.name}</div>
              <div className="text-muted text-xs font-bold">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing anchor (decoy effect) ── */}
      <section className="py-10 md:py-16 px-4 md:px-6 max-w-3xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Simple pricing</p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center mb-10">Start Free. Upgrade When Ready.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card border-2 border-accent3 rounded-3xl p-6 md:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent3 text-black text-xs font-extrabold px-4 py-1 rounded-full whitespace-nowrap">Most parents start here</div>
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-fredoka text-2xl mb-1">Free</h3>
            <p className="font-fredoka text-4xl text-white mb-1">AED 0 <span className="text-muted text-base font-bold">/ month</span></p>
            <p className="text-muted text-xs font-bold mb-5">Forever free. No card needed.</p>
            <ul className="space-y-2 mb-6 text-sm font-semibold">
              {['First module of each track', 'Personal AI coach', 'XP & streak system', 'Parent dashboard', 'Arabic & English', 'Any device'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-accent3">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block w-full py-3.5 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-accent3 to-accent4 text-center hover:-translate-y-0.5 transition-all">
              🚀 Start Free Now
            </Link>
          </div>
          <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8 opacity-80">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-fredoka text-2xl mb-1">Pro</h3>
            <p className="font-fredoka text-4xl text-white mb-1">AED 79 <span className="text-muted text-base font-bold">/ month</span></p>
            <p className="text-muted text-xs font-bold mb-5">Everything in Free, plus:</p>
            <ul className="space-y-2 mb-6 text-sm font-semibold text-muted">
              {['All 200+ lessons unlocked', 'Advanced AI coaching', 'Full portfolio system', 'Live project feedback', 'Certificate of completion', 'Priority support'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-accent4">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/auth/signup?plan=pro" className="block w-full py-3.5 rounded-2xl font-extrabold text-base text-muted bg-card2 border border-white/10 text-center hover:text-white transition-all">
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section id="partners" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <p className="text-center text-muted text-xs font-extrabold uppercase tracking-widest mb-3">Trusted &amp; recognised by</p>
        <h2 className="font-fredoka text-3xl md:text-4xl text-center mb-3">Our Partners &amp; Supporters 🤝</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-14 text-sm md:text-base max-w-xl mx-auto">
          From government bodies to global tech giants — the institutions shaping the GCC&apos;s future stand behind Plulai.
        </p>
        {(['Government', 'Schools', 'Technology', 'Accelerator'] as const).map(cat => {
          const catP = PARTNERS.filter(p => p.category === cat)
          if (!catP.length) return null
          return (
            <div key={cat} className="mb-8">
              <p className="text-muted text-xs font-extrabold uppercase tracking-widest mb-4 text-center">{cat}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {catP.map(p => (
                  <div key={p.abbr} className="group flex items-center gap-2.5 bg-card border border-white/5 hover:border-white/15 rounded-2xl px-4 py-3 md:px-5 md:py-4 transition-all hover:-translate-y-0.5 cursor-default">
                    <span className="text-xl md:text-2xl">{p.logo}</span>
                    <span className="font-extrabold text-xs md:text-sm text-muted group-hover:text-white transition-colors whitespace-nowrap">{p.abbr}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <div className="mt-10 text-center">
          <p className="text-muted text-sm font-semibold mb-3">Are you a school or organisation in the GCC?</p>
          <a href="mailto:partners@plulai.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-card border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all">
            🤝 Become a Partner
          </a>
        </div>
      </section>

      {/* ── GCC ── */}
      <section id="gcc" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">The GCC&apos;s #1 Edtech Platform 🌍</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-sm md:text-base max-w-2xl mx-auto">
          The only kids&apos; platform built region-first — culturally relevant, fully bilingual, designed for the GCC&apos;s next generation.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8 md:mb-12">
          {GCC.map(c => (
            <div key={c.name} className="bg-card border border-white/5 rounded-2xl p-3 md:p-4 text-center hover:border-white/15 transition-all">
              <div className="text-3xl md:text-4xl mb-1 md:mb-2">{c.flag}</div>
              <div className="font-extrabold text-xs mb-0.5">{c.name}</div>
              <div className="text-muted text-xs font-bold hidden sm:block">{c.city}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="bg-gradient-to-r from-accent4/10 to-accent5/10 border border-accent4/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3">🌐</div>
            <h3 className="font-fredoka text-xl md:text-2xl mb-2">Real Arabic, Not Translated</h3>
            <p className="text-muted font-semibold leading-relaxed text-sm md:text-base">Complete RTL interface. AI coach that teaches natively in Arabic. The only platform built for Arabic-speaking kids first.</p>
          </div>
          <div className="bg-gradient-to-r from-accent3/10 to-accent4/10 border border-accent3/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3">🎓</div>
            <h3 className="font-fredoka text-xl md:text-2xl mb-2">Aligned with UAE Vision 2031</h3>
            <p className="text-muted font-semibold leading-relaxed text-sm md:text-base">Curriculum designed to prepare kids for the UAE Vision 2031 skills economy — AI, coding and entrepreneurship are the three pillars demanded of the next generation.</p>
          </div>
        </div>
      </section>

      {/* ── Mid-page urgency block ── */}
      <section className="py-12 md:py-16 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-accent3/10 to-accent4/10 border border-accent3/20 rounded-3xl p-8 md:p-12 text-center">
          <div className="text-4xl mb-4">⏱️</div>
          <h2 className="font-fredoka text-2xl md:text-3xl mb-3">Every Week Without Plulai Is a Week Behind</h2>
          <p className="text-muted font-semibold text-sm md:text-base mb-6 max-w-lg mx-auto">
            Kids who start today will have 52 extra learning-weeks by this time next year. The skill gap compounds every week.
          </p>
          <Link href="/auth/signup" className="inline-block px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all">
            🎯 Start Free — Takes 60 Seconds
          </Link>
          <p className="text-muted text-xs font-bold mt-3">No credit card. Cancel anytime. Works on any device.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3">Your Questions, Answered</h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-sm md:text-base">Everything parents ask us before signing up.</p>
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

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl md:text-6xl mb-5 animate-bounce-slow">🚀</div>
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl mb-4">
            The Best Time to Start Was Yesterday.
            <br />
            <span className="bg-gradient-to-r from-accent3 to-accent4 bg-clip-text text-transparent">
              The Second Best Is Right Now.
            </span>
          </h2>
          <p className="text-muted font-semibold text-base md:text-lg mb-3">
            Join 1,247 kids across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman who are already building the skills that matter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted mb-8 md:mb-10">
            {['✅ Free forever plan','✅ No credit card','✅ Arabic & English','✅ Ages 6–18','✅ COPPA certified','✅ No ads ever','✅ Cancel anytime','✅ Any device'].map(t => (
              <span key={t} className="bg-card border border-white/5 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="inline-block w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all"
          >
            🎉 Claim Your Free Account — Start in 60 Seconds
          </Link>
          <p className="text-muted text-xs font-bold mt-5 opacity-70">
            Trusted by parents &amp; teachers across the GCC · COPPA compliant · Safe for kids · No ads
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent mb-2">Plulai</div>
              <p className="text-muted text-xs font-bold max-w-xs leading-relaxed">The #1 edtech platform for kids in the UAE &amp; GCC. Coding, AI &amp; Entrepreneurship for ages 6–18.</p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-xs font-bold text-muted w-full md:w-auto">
              <div>
                <p className="text-white mb-3 font-extrabold">Platform</p>
                <div className="space-y-2">
                  <a href="#quiz"     className="block hover:text-white transition-colors">Find a Track</a>
                  <a href="#projects" className="block hover:text-white transition-colors">Projects</a>
                  <a href="#partners" className="block hover:text-white transition-colors">Partners</a>
                  <Link href="/pricing"       className="block hover:text-white transition-colors">Pricing</Link>
                  <Link href="/auth/signup"   className="block hover:text-white transition-colors">Sign Up Free</Link>
                  <Link href="/sharkkid"      className="block hover:text-white transition-colors">🦈 Sharkkid</Link>
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Countries</p>
                <div className="space-y-2">
                  {['🇦🇪 UAE','🇸🇦 Saudi Arabia','🇶🇦 Qatar','🇰🇼 Kuwait','🇧🇭 Bahrain','🇴🇲 Oman'].map(c => <p key={c}>{c}</p>)}
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Company</p>
                <div className="space-y-2">
                  <a href="mailto:hello@plulai.com"    className="block hover:text-white transition-colors">Contact</a>
                  <a href="mailto:partners@plulai.com" className="block hover:text-white transition-colors">Partners</a>
                  <a href="mailto:schools@plulai.com"  className="block hover:text-white transition-colors">Schools</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-xs font-bold text-center md:text-left">
              © {new Date().getFullYear()} Plulai. Built with ❤️ in the UAE. The #1 edtech platform for kids in the GCC.
            </p>
            <a href="mailto:hello@plulai.com" className="text-muted text-xs font-bold hover:text-white transition-colors">hello@plulai.com</a>
          </div>
        </div>
      </footer>
    </div>
  )
}