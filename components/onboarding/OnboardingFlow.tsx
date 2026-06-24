'use client'
// components/onboarding/OnboardingFlow.tsx
// Duolingo-style onboarding — mascot-led, one question per screen,
// ends with an inline micro-lesson so the kid arrives at dashboard
// with streak=1 and XP already on the board.

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertProfile, updateStreak, awardBadge, addXP, startFreeTrial } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { AgeGroup, InterestType } from '@/lib/supabase/database.types'

// ── Constants ─────────────────────────────────────────────────
const AVATARS = [
  '🧑‍🚀','👩‍💻','🧑‍🎨','👩‍🔬','🦸','🧙',
  '🤖','🦊','🐉','🦄','🐱','🐸',
  '🦁','🐯','🦋','🌟','🔥','💎','🎮','🎯',
]

const LANGUAGES = [
  { id: 'en', flag: '🇬🇧', label: 'English',  native: 'English'  },
  { id: 'ar', flag: '🇸🇦', label: 'Arabic',   native: 'العربية'  },
  { id: 'fr', flag: '🇫🇷', label: 'French',   native: 'Français' },
]

const COUNTRIES = [
  { code: 'TN', flag: '🇹🇳', name: 'Tunisia'      },
  { code: 'AE', flag: '🇦🇪', name: 'UAE'           },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia'  },
  { code: 'QA', flag: '🇶🇦', name: 'Qatar'         },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco'       },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt'         },
  { code: 'DZ', flag: '🇩🇿', name: 'Algeria'       },
  { code: 'FR', flag: '🇫🇷', name: 'France'        },
  { code: 'KW', flag: '🇰🇼', name: 'Kuwait'        },
  { code: 'BH', flag: '🇧🇭', name: 'Bahrain'       },
  { code: 'OM', flag: '🇴🇲', name: 'Oman'          },
  { code: 'JO', flag: '🇯🇴', name: 'Jordan'        },
  { code: 'LB', flag: '🇱🇧', name: 'Lebanon'       },
  { code: 'GB', flag: '🇬🇧', name: 'UK'            },
  { code: 'US', flag: '🇺🇸', name: 'USA'           },
  { code: 'OTHER', flag: '🌍', name: 'Other'       },
]

// ── Goal types — replaces free-text dream project ─────────────
const GOALS = [
  {
    id:    'build_game',
    emoji: '🎮',
    label: 'Build a game',
    desc:  'Create your own games people can actually play',
    color: 'border-accent1 bg-accent1/10 text-accent1',
    track: 'python-foundation',
  },
  {
    id:    'start_business',
    emoji: '💡',
    label: 'Start a business',
    desc:  'Turn your ideas into a real product or startup',
    color: 'border-accent3 bg-accent3/10 text-accent3',
    track: 'entrepreneurship',
  },
  {
    id:    'learn_ai',
    emoji: '🧠',
    label: 'Learn AI & ML',
    desc:  'Train models and build intelligent systems',
    color: 'border-accent5 bg-accent5/10 text-accent5',
    track: 'ml-explorer',
  },
  {
    id:    'build_app',
    emoji: '📱',
    label: 'Build an app or website',
    desc:  'Ship something real people use every day',
    color: 'border-accent4 bg-accent4/10 text-accent4',
    track: 'ai4youth',
  },
  {
    id:    'learn_coding',
    emoji: '🐍',
    label: 'Learn to code',
    desc:  'Go from zero to writing real Python programs',
    color: 'border-blue-400 bg-blue-400/10 text-blue-400',
    track: 'python-foundation',
  },
  {
    id:    'build_robot',
    emoji: '🤖',
    label: 'Build robots',
    desc:  'Connect code to the real world with hardware',
    color: 'border-orange-400 bg-orange-400/10 text-orange-400',
    track: 'python-foundation',
  },
] as const

type GoalId = typeof GOALS[number]['id']

// ── Weekly commitment options ─────────────────────────────────
const COMMITMENTS = [
  { days: 3, label: 'Casual',   desc: '3 days / week', emoji: '🌱', color: 'border-accent3 bg-accent3/10 text-accent3' },
  { days: 5, label: 'Regular',  desc: '5 days / week', emoji: '🔥', color: 'border-accent4 bg-accent4/10 text-accent4' },
  { days: 7, label: 'Intense',  desc: 'Every day!',    emoji: '⚡', color: 'border-accent1 bg-accent1/10 text-accent1' },
]

// ── Inline micro-lesson — 3 questions per goal type ───────────
// These are deliberately easy so the kid gets 3/3 right on day 1.
// Goal: create the "I'm good at this" feeling before they leave onboarding.
const MICRO_LESSONS: Record<GoalId, {
  title: string
  questions: { q: string; options: string[]; correct: number; explanation: string }[]
}> = {
  build_game: {
    title: '🎮 Game Dev Quick Start',
    questions: [
      {
        q: 'What do games and apps have in common?',
        options: ['They both need expensive hardware', 'They are both built with code', 'They can only be made by adults', 'They require a team of 100 people'],
        correct: 1,
        explanation: 'Every game and app — from Minecraft to TikTok — is built with code. That\'s exactly what you\'re going to learn!',
      },
      {
        q: 'Minecraft was created by one person first. What does that tell you?',
        options: ['You need a big team to make a game', 'One person with skills can build something millions love', 'Games are too hard to make alone', 'You need to be a professional'],
        correct: 1,
        explanation: 'Notch (Markus Persson) built the first version of Minecraft alone. Skills beat team size every time.',
      },
      {
        q: 'What\'s the first step to building your own game?',
        options: ['Buy expensive software', 'Wait until you\'re older', 'Start learning the basics today', 'Find a big company to help you'],
        correct: 2,
        explanation: 'Every game developer started exactly where you are. The only difference between them and you is that they started. Let\'s go!',
      },
    ],
  },
  start_business: {
    title: '💡 Entrepreneur Quick Start',
    questions: [
      {
        q: 'What do the best businesses have in common?',
        options: ['They started with millions of dollars', 'They solve a real problem people have', 'They were built by adults only', 'They needed a famous investor first'],
        correct: 1,
        explanation: 'Airbnb, Uber, WhatsApp — every great business started by solving a problem someone actually had. What problems do YOU notice every day?',
      },
      {
        q: 'Mark Zuckerberg built the first version of Facebook at age 19. What does that mean for you?',
        options: ['You need to be at Harvard first', 'Age doesn\'t stop great ideas', 'Only tech people can build businesses', 'You need to wait 10 years'],
        correct: 1,
        explanation: 'Some of the world\'s biggest companies were started by teenagers. Your age is an advantage — you see problems adults have stopped noticing.',
      },
      {
        q: 'What\'s an MVP?',
        options: ['Most Valuable Player', 'A very expensive product', 'The simplest version of your idea that you can test', 'A type of business license'],
        correct: 2,
        explanation: 'MVP = Minimum Viable Product. Instead of building everything, you build the smallest thing that tests your idea. Smart founders ship fast and improve.',
      },
    ],
  },
  learn_ai: {
    title: '🧠 AI Quick Start',
    questions: [
      {
        q: 'How does AI learn to recognize a cat in a photo?',
        options: ['Someone programs every rule manually', 'It sees thousands of cat photos and finds patterns', 'It searches Google', 'It guesses randomly'],
        correct: 1,
        explanation: 'AI learns from examples — just like you do. Show it enough cats, and it figures out what makes a cat a cat. That\'s machine learning.',
      },
      {
        q: 'Which of these is AI being used right now?',
        options: ['A simple calculator', 'TikTok recommending your next video', 'A light switch', 'A paper map'],
        correct: 1,
        explanation: 'TikTok\'s algorithm watches what you watch, skip, and like — then predicts what you\'ll want next. That\'s reinforcement learning in action.',
      },
      {
        q: 'What\'s the most important ingredient for training an AI model?',
        options: ['A supercomputer', 'Data — lots of examples to learn from', 'A PhD in mathematics', 'An expensive subscription'],
        correct: 1,
        explanation: 'Data is everything in AI. The models powering ChatGPT, Gemini, and Claude were trained on billions of text examples. Data is the new oil.',
      },
    ],
  },
  build_app: {
    title: '📱 App Builder Quick Start',
    questions: [
      {
        q: 'Every app you use was built with what?',
        options: ['Magic', 'Code — written by developers', 'Pre-made templates only', 'Artificial intelligence only'],
        correct: 1,
        explanation: 'Instagram, WhatsApp, Snapchat — every app is code. And code is a skill anyone can learn, starting right now.',
      },
      {
        q: 'What does "shipping" mean in the tech world?',
        options: ['Sending physical products in boxes', 'Launching your app or feature for users to use', 'Writing the code', 'Designing the logo'],
        correct: 1,
        explanation: '"Shipping" means releasing something live. The fastest learners ship early and often — even when it\'s not perfect. Done beats perfect.',
      },
      {
        q: 'What\'s the best way to learn to build apps?',
        options: ['Read textbooks for 2 years first', 'Build small things, learn from mistakes, keep going', 'Wait until you know everything', 'Only take university courses'],
        correct: 1,
        explanation: 'Every developer you admire learned by building. Not by reading. Not by watching. By doing. That\'s what you\'re about to start.',
      },
    ],
  },
  learn_coding: {
    title: '🐍 Coding Quick Start',
    questions: [
      {
        q: 'What is a computer program?',
        options: ['A TV show about computers', 'A set of instructions that tells a computer what to do', 'A type of hardware', 'An app you have to pay for'],
        correct: 1,
        explanation: 'Code is instructions. Like a recipe — except instead of cooking food, you\'re telling a computer exactly what to do, step by step.',
      },
      {
        q: 'Python is one of the most popular programming languages. Why do beginners love it?',
        options: ['It\'s the fastest language ever made', 'It reads almost like English and is easy to learn', 'It can only be used for websites', 'It requires expensive software'],
        correct: 1,
        explanation: 'Python was designed to be readable. `print("Hello!")` does exactly what you\'d expect. It\'s used by NASA, Netflix, Google, and now — you.',
      },
      {
        q: 'How old was the youngest professional programmer?',
        options: ['25', '18', '16', 'Under 10'],
        correct: 3,
        explanation: 'Several kids have shipped real apps and games before age 10. The only prerequisite is starting. You\'re doing that right now.',
      },
    ],
  },
  build_robot: {
    title: '🤖 Robotics Quick Start',
    questions: [
      {
        q: 'What makes a robot "smart"?',
        options: ['Expensive parts', 'The code and sensors that control it', 'Being very large', 'Being made in a factory'],
        correct: 1,
        explanation: 'A robot is only as smart as the code running it. Program it well, and a simple robot can do incredible things. That\'s the skill you\'re building.',
      },
      {
        q: 'What do robots and software apps have in common?',
        options: ['Nothing — they\'re completely different', 'Both are controlled by code', 'Both need a WiFi connection', 'Both need to be plugged in'],
        correct: 1,
        explanation: 'Code connects both worlds. Learn to code and you can build software apps AND program physical robots. That\'s a superpower.',
      },
      {
        q: 'What\'s the first step to building a robot?',
        options: ['Buy $5,000 of parts', 'Learn the basics of coding and electronics', 'Get a university degree first', 'Find a factory to build it'],
        correct: 1,
        explanation: 'Coding first, hardware second. The logic you\'ll learn applies to microcontrollers, Arduino, Raspberry Pi — all the tools used to build real robots.',
      },
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────
const getAgeGroup = (age: number): AgeGroup =>
  age <= 8 ? 'mini' : age <= 11 ? 'junior' : age <= 14 ? 'pro' : 'expert'

const AGE_LABELS: Record<AgeGroup, string> = {
  mini:   'Mini Explorer 🌱',
  junior: 'Junior Creator 🛠️',
  pro:    'Pro Explorer 🗺️',
  expert: 'Tech Expert 🚀',
}

// ── Mascot speech bubble ──────────────────────────────────────
function MascotSpeech({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-end gap-4 mb-6">
      {/* Mascot */}
      <div className="flex-shrink-0 w-16 h-16 relative">
        <Image
          src="/icons/mascot-celebrating.svg"
          alt="Jimmy"
          width={64}
          height={64}
          className="w-full h-full object-contain drop-shadow-lg"
          priority
        />
      </div>
      {/* Bubble */}
      <div className="relative bg-card2 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-3.5 flex-1">
        {/* Triangle pointer */}
        <div className="absolute -left-2 bottom-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-card2" />
        <p className="font-extrabold text-sm leading-snug text-white">{text}</p>
        {sub && <p className="text-xs text-muted font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── XP pop animation ──────────────────────────────────────────
function XPPop({ xp }: { xp: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2 animate-bounce">
      <span className="text-2xl">⚡</span>
      <span className="font-fredoka text-2xl text-accent2">+{xp} XP</span>
    </div>
  )
}

// ── Progress dots ─────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cn(
          'rounded-full transition-all duration-300',
          i + 1 === current ? 'w-6 h-2.5 bg-accent4' :
          i + 1 < current   ? 'w-2.5 h-2.5 bg-accent3' :
                               'w-2.5 h-2.5 bg-card2'
        )} />
      ))}
    </div>
  )
}

// ── Total onboarding steps ────────────────────────────────────
// 1 = language, 2 = name, 3 = avatar, 4 = age, 5 = goal,
// 6 = commitment, 7 = micro-lesson, 8 = launch
const TOTAL_STEPS = 8

// ─────────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const router = useRouter()

  const [userId,   setUserId]   = useState('')
  const [step,     setStep]     = useState(1)
  const [lang,     setLang]     = useState('en')
  const [country,  setCountry]  = useState('TN')
  const [name,     setName]     = useState('')
  const [avatar,   setAvatar]   = useState('🧑‍🚀')
  const [age,      setAge]      = useState(13)
  const [goal,     setGoal]     = useState<GoalId | null>(null)
  const [weekDays, setWeekDays] = useState(5)
  const [saving,   setSaving]   = useState(false)

  // Micro-lesson state
  const [mlStep,      setMlStep]      = useState(0)  // 0 = intro, 1-3 = questions, 4 = done
  const [mlSelected,  setMlSelected]  = useState<number | null>(null)
  const [mlSubmitted, setMlSubmitted] = useState(false)
  const [mlScore,     setMlScore]     = useState(0)
  const [showXPPop,   setShowXPPop]   = useState(false)

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      if (user.user_metadata?.display_name) setName(user.user_metadata.display_name)
    })
  }, [router])

  const next = () => {
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => setStep(s => s - 1)

  // ── Micro-lesson logic ──────────────────────────────────────
  const microLesson = goal ? MICRO_LESSONS[goal] : null
  const mlQuestion  = microLesson?.questions[mlStep - 1]

  const submitMlAnswer = () => {
    if (mlSelected === null || !mlQuestion) return
    setMlSubmitted(true)
    if (mlSelected === mlQuestion.correct) {
      setMlScore(s => s + 1)
      setShowXPPop(true)
      setTimeout(() => setShowXPPop(false), 1200)
    }
  }

  const nextMlQuestion = () => {
    setMlSelected(null)
    setMlSubmitted(false)
    if (mlStep >= 3) {
      setMlStep(4) // done
    } else {
      setMlStep(s => s + 1)
    }
  }

  // ── Final save ──────────────────────────────────────────────
  const launch = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const ageGroup  = getAgeGroup(age)
      const goalLabel = GOALS.find(g => g.id === goal)?.label ?? ''

      await upsertProfile(userId, {
        display_name:    name,
        avatar,
        age,
        age_group:       ageGroup,
        interests:       [],               // interests step removed — goal_type replaces it
        dream_project:   goalLabel,        // keep column for AI coach backward compat
        goal_type:       goal,             // new structured column
        weekly_goal:     weekDays,
        language:        lang,
        preferred_language: lang,
        country,
        onboarding_done: true,
      } as any)

      await startFreeTrial(userId)

      Promise.all([
        updateStreak(userId),
        addXP(userId, 60 + mlScore * 15, 'onboarding_complete'),
        awardBadge(userId, 'dream-builder'),
        awardBadge(userId, 'early-bird'),
      ]).catch(console.error)

      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setSaving(false)
    }
  }

  // ── Mascot speech per step ──────────────────────────────────
  const mascotLines: Record<number, { text: string; sub?: string }> = {
    1: { text: "Hi! I'm Jimmy, your AI coach. First — what language do you want to learn in?", sub: 'You can change this anytime.' },
    2: { text: `Great choice! Now — what's your name?`, sub: "I'll use it to personalize everything." },
    3: { text: `Love it, ${name || 'friend'}! Pick an avatar that feels like you.` },
    4: { text: `Nice! How old are you? I'll match the lessons to your level.` },
    5: { text: `Okay ${name || 'friend'}, what do you actually want to BUILD?`, sub: 'Be honest — I\'ll find the perfect path for you.' },
    6: { text: `${GOALS.find(g => g.id === goal)?.emoji ?? '🎯'} Great goal! How often can you practice?`, sub: 'Even 10 minutes a day changes everything.' },
    7: { text: `Let's do a super quick warm-up — 3 questions. Ready?`, sub: 'Earn +15 XP for each correct answer!' },
    8: { text: `${mlScore === 3 ? '🏆 Perfect score!' : mlScore >= 2 ? '🎉 Well done!' : '💪 Great effort!'} You earned ${60 + mlScore * 15} XP today.`, sub: "Your adventure starts now." },
  }

  const currentMascot = step === 7 && mlStep > 0
    ? { text: mlStep === 4 ? `${mlScore}/3 correct — you're on your way! 🚀` : `Question ${mlStep} of 3`, sub: mlStep === 4 ? 'One more click to launch your dashboard.' : undefined }
    : mascotLines[step]

  return (
    <div className="relative min-h-screen z-10 bg-background" dir={dir}>
      <div className="max-w-lg mx-auto px-5 py-8">

        {/* Plulai wordmark */}
        <div className="text-center mb-6">
          <h1 className="font-fredoka text-3xl bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
            🚀 Plulai
          </h1>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-card2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent4 to-accent5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((step / TOTAL_STEPS) * 100)}%` }}
            />
          </div>
          <span className="text-muted text-xs font-bold flex-shrink-0">
            {step}/{TOTAL_STEPS}
          </span>
        </div>

        {/* Mascot speech bubble */}
        {currentMascot && (
          <MascotSpeech text={currentMascot.text} sub={currentMascot.sub} />
        )}

        {/* ── STEP 1: Language ──────────────────────────────── */}
        {step === 1 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-3">
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => { setLang(l.id); setTimeout(next, 250) }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 font-extrabold text-base transition-all',
                  lang === l.id
                    ? 'border-accent4 bg-accent4/15 text-white scale-[1.02]'
                    : 'border-white/8 bg-card2 text-muted hover:border-white/25 hover:text-white'
                )}
              >
                <span className="text-3xl">{l.flag}</span>
                <div className="text-left">
                  <div className="font-extrabold">{l.native}</div>
                  <div className="text-xs text-muted font-semibold">{l.label}</div>
                </div>
                {lang === l.id && <span className="ml-auto text-accent4">✓</span>}
              </button>
            ))}

            {/* Country picker inline — collapsed into step 1 to save a step */}
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">📍 Your country</p>
              <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all',
                      country === c.code
                        ? 'border-accent4 bg-accent4/10 text-white'
                        : 'border-white/8 bg-card2 text-muted hover:border-white/20'
                    )}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="truncate w-full text-center text-[10px]">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={next}
              className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all mt-2"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: Name ─────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-4">
            <input
              className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-2xl px-5 py-4 text-white font-bold text-lg outline-none transition-all placeholder:text-muted"
              placeholder={lang === 'ar' ? 'اكتب اسمك الأول...' : lang === 'fr' ? 'Ton prénom...' : 'Your first name...'}
              maxLength={20}
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && name.trim().length >= 2 && next()}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={back} className="px-5 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">←</button>
              <button
                disabled={name.trim().length < 2}
                onClick={next}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === 'ar' ? 'التالي →' : lang === 'fr' ? 'Suivant →' : "That's me! →"}
              </button>
            </div>
            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}

        {/* ── STEP 3: Avatar ───────────────────────────────── */}
        {step === 3 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((a: string) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={cn(
                    'text-3xl rounded-2xl py-3 transition-all border-2',
                    avatar === a
                      ? 'border-accent4 bg-accent4/15 scale-110 shadow-lg'
                      : 'border-white/8 bg-card2 hover:border-white/25 hover:scale-105'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="px-5 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">←</button>
              <button
                onClick={next}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all"
              >
                {lang === 'ar' ? 'هذا أنا! →' : lang === 'fr' ? "C'est moi ! →" : 'This is me! →'}
              </button>
            </div>
            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}

        {/* ── STEP 4: Age ──────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-5">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setAge((a: number) => Math.max(6, a - 1))}
                className="w-14 h-14 rounded-full bg-card2 font-extrabold text-2xl hover:bg-card border border-white/10 transition-all"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <div className="font-fredoka text-6xl text-accent4 leading-none">{age}</div>
                <div className="text-sm font-bold text-muted mt-2">{AGE_LABELS[getAgeGroup(age)]}</div>
              </div>
              <button
                onClick={() => setAge((a: number) => Math.min(18, a + 1))}
                className="w-14 h-14 rounded-full bg-card2 font-extrabold text-2xl hover:bg-card border border-white/10 transition-all"
              >
                +
              </button>
            </div>

            {/* Age group description */}
            <div className="bg-accent4/8 border border-accent4/20 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-muted">
                {getAgeGroup(age) === 'mini'   && "🌱 We'll use super simple words and fun games. Perfect for you!"}
                {getAgeGroup(age) === 'junior' && "🛠️ You'll get hands-on projects and real coding. Let's build stuff!"}
                {getAgeGroup(age) === 'pro'    && "🗺️ Technical challenges, real AI, and startup thinking. Let's go!"}
                {getAgeGroup(age) === 'expert' && "🚀 Advanced ML, real APIs, and building for production. Time to ship."}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={back} className="px-5 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">←</button>
              <button
                onClick={next}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all"
              >
                {lang === 'ar' ? 'هذا عمري →' : lang === 'fr' ? "C'est mon âge →" : "That's my age! →"}
              </button>
            </div>
            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}

        {/* ── STEP 5: Goal picker ──────────────────────────── */}
        {step === 5 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-3">
            {GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 font-extrabold text-sm transition-all text-left',
                  goal === g.id
                    ? g.color + ' scale-[1.01]'
                    : 'border-white/8 bg-card2 text-muted hover:border-white/25 hover:text-white'
                )}
              >
                <span className="text-2xl flex-shrink-0">{g.emoji}</span>
                <div>
                  <div className="font-extrabold">{g.label}</div>
                  <div className="text-xs opacity-70 font-semibold mt-0.5">{g.desc}</div>
                </div>
                {goal === g.id && <span className="ml-auto">✓</span>}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={back} className="px-5 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">←</button>
              <button
                disabled={!goal}
                onClick={next}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === 'ar' ? 'هذا هدفي →' : lang === 'fr' ? "C'est mon objectif →" : "This is my goal! →"}
              </button>
            </div>
            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}

        {/* ── STEP 6: Commitment ───────────────────────────── */}
        {step === 6 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-3">
            {COMMITMENTS.map(c => (
              <button
                key={c.days}
                onClick={() => setWeekDays(c.days)}
                className={cn(
                  'w-full flex items-center gap-4 p-5 rounded-2xl border-2 font-extrabold transition-all text-left',
                  weekDays === c.days
                    ? c.color + ' scale-[1.01]'
                    : 'border-white/8 bg-card2 text-muted hover:border-white/25 hover:text-white'
                )}
              >
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <div className="font-extrabold text-base">{c.label}</div>
                  <div className="text-sm opacity-70 font-semibold">{c.desc}</div>
                </div>
                {weekDays === c.days && <span className="ml-auto text-lg">✓</span>}
              </button>
            ))}

            {/* Motivational line */}
            <div className="bg-accent2/8 border border-accent2/20 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm font-bold text-accent2">
                {weekDays === 7
                  ? "⚡ Every day? You're going to go far."
                  : weekDays === 5
                  ? '🔥 5 days a week builds a real habit. Good choice.'
                  : '🌱 3 days is more than enough to make progress. Let\'s go!'}
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={back} className="px-5 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">←</button>
              <button
                onClick={next}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all"
              >
                {lang === 'ar' ? 'ملتزم! →' : lang === 'fr' ? "Je m'engage ! →" : "I'm committed! →"}
              </button>
            </div>
            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}

        {/* ── STEP 7: Micro-lesson ─────────────────────────── */}
        {step === 7 && microLesson && (
          <div className="animate-slide-up space-y-4">

            {/* Intro screen */}
            {mlStep === 0 && (
              <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl text-center space-y-4">
                <div className="text-5xl">{GOALS.find(g => g.id === goal)?.emoji}</div>
                <h2 className="font-fredoka text-2xl">{microLesson.title}</h2>
                <p className="text-muted font-semibold text-sm">3 quick questions · Earn up to +45 XP</p>

                {/* XP preview */}
                <div className="flex justify-center gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-accent2/10 border-2 border-accent2/25 flex items-center justify-center text-sm font-extrabold text-accent2">
                        Q{i}
                      </div>
                      <span className="text-xs font-bold text-muted">+15 XP</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setMlStep(1)}
                  className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-0.5 transition-all"
                >
                  {lang === 'ar' ? 'لنبدأ! ⚡' : lang === 'fr' ? 'On y va ! ⚡' : "Let's go! ⚡"}
                </button>
              </div>
            )}

            {/* Question screens */}
            {mlStep >= 1 && mlStep <= 3 && mlQuestion && (
              <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl space-y-4">
                {/* XP pop */}
                {showXPPop && (
                  <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <XPPop xp={15} />
                  </div>
                )}

                {/* Progress dots for questions */}
                <div className="flex justify-center gap-2">
                  {[1,2,3].map(i => (
                    <div key={i} className={cn(
                      'rounded-full transition-all duration-300',
                      i === mlStep ? 'w-6 h-2.5 bg-accent4' :
                      i < mlStep   ? 'w-2.5 h-2.5 bg-accent3' :
                                     'w-2.5 h-2.5 bg-card2'
                    )} />
                  ))}
                </div>

                <p className="font-extrabold text-base leading-relaxed">{mlQuestion.q}</p>

                {/* Options */}
                <div className="space-y-2">
                  {mlQuestion.options.map((opt, oi) => {
                    let cls = 'border-white/8 bg-card2 text-muted hover:border-white/25 hover:text-white cursor-pointer'
                    if (mlSubmitted) {
                      if (oi === mlQuestion.correct) cls = 'border-accent3/60 bg-accent3/15 text-accent3 cursor-default'
                      else if (mlSelected === oi)    cls = 'border-red-500/40 bg-red-500/10 text-red-400 cursor-default'
                      else                           cls = 'border-white/5 bg-card2/50 text-muted/40 cursor-default'
                    } else if (mlSelected === oi) {
                      cls = 'border-accent5/50 bg-accent5/15 text-white cursor-pointer'
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => !mlSubmitted && setMlSelected(oi)}
                        disabled={mlSubmitted}
                        className={cn('w-full text-left px-4 py-3 rounded-xl text-sm font-bold border transition-all', cls)}
                      >
                        <span className="font-extrabold mr-2 text-muted/60">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {mlSubmitted && (
                  <div className={cn(
                    'rounded-xl p-4 border text-sm font-semibold leading-relaxed',
                    mlSelected === mlQuestion.correct
                      ? 'bg-accent3/10 border-accent3/25 text-accent3'
                      : 'bg-white/4 border-white/10 text-muted'
                  )}>
                    {mlSelected === mlQuestion.correct ? '✅ ' : '💡 '}
                    {mlQuestion.explanation}
                  </div>
                )}

                {/* Action button */}
                {!mlSubmitted ? (
                  <button
                    onClick={submitMlAnswer}
                    disabled={mlSelected === null}
                    className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {lang === 'ar' ? 'تحقق' : lang === 'fr' ? 'Vérifier' : 'Check answer'}
                  </button>
                ) : (
                  <button
                    onClick={nextMlQuestion}
                    className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 transition-all"
                  >
                    {mlStep >= 3
                      ? (lang === 'ar' ? 'انظر نتيجتي 🏁' : lang === 'fr' ? 'Voir mes résultats 🏁' : 'See my results 🏁')
                      : (lang === 'ar' ? 'التالي →' : lang === 'fr' ? 'Suivant →' : 'Next →')}
                  </button>
                )}
              </div>
            )}

            {/* Results screen */}
            {mlStep === 4 && (
              <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl text-center space-y-4">
                <div className="text-5xl">
                  {mlScore === 3 ? '🏆' : mlScore >= 2 ? '🎉' : '💪'}
                </div>
                <div className="font-fredoka text-4xl text-accent2">
                  {mlScore}/3
                </div>
                <p className="font-extrabold text-base">
                  {mlScore === 3
                    ? (lang === 'fr' ? 'Parfait ! Tu es prêt.' : lang === 'ar' ? 'ممتاز! أنت جاهز.' : "Perfect! You're a natural.")
                    : mlScore >= 2
                    ? (lang === 'fr' ? 'Bien joué !' : lang === 'ar' ? 'عمل رائع!' : 'Great job!')
                    : (lang === 'fr' ? "Bien essayé — tu vas t'améliorer !" : lang === 'ar' ? 'محاولة جيدة!' : "Good effort — you'll get better!")}
                </p>

                {/* XP earned summary */}
                <div className="bg-accent2/8 border border-accent2/20 rounded-2xl px-4 py-3">
                  <p className="text-sm font-bold text-accent2">
                    ⚡ +{60 + mlScore * 15} XP earned today
                  </p>
                  <p className="text-xs text-muted font-semibold mt-0.5">
                    60 for joining + {mlScore * 15} for the quiz
                  </p>
                </div>

                <button
                  onClick={next}
                  className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-0.5 transition-all"
                >
                  {lang === 'ar' ? 'إلى لوحة التحكم! 🚀' : lang === 'fr' ? 'Vers le tableau de bord ! 🚀' : 'Launch my dashboard! 🚀'}
                </button>
              </div>
            )}

            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}

        {/* ── STEP 8: Launch ───────────────────────────────── */}
        {step === 8 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl animate-slide-up space-y-5 text-center">

            {/* Profile summary card */}
            <div className="bg-gradient-to-br from-accent4/10 to-accent5/10 border border-accent4/20 rounded-2xl p-5">
              <div className="text-5xl mb-3">{avatar}</div>
              <div className="font-fredoka text-2xl">{name}</div>
              <div className="text-sm text-muted font-semibold mt-1">
                {AGE_LABELS[getAgeGroup(age)]} · {LANGUAGES.find(l => l.id === lang)?.flag} · {COUNTRIES.find(c => c.code === country)?.flag}
              </div>

              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                <span className="text-xs font-extrabold bg-accent2/15 text-accent2 border border-accent2/25 px-3 py-1 rounded-full">
                  ⚡ {60 + mlScore * 15} XP
                </span>
                <span className="text-xs font-extrabold bg-accent3/15 text-accent3 border border-accent3/25 px-3 py-1 rounded-full">
                  🔥 Day 1 streak
                </span>
                <span className="text-xs font-extrabold bg-card2 text-muted border border-white/10 px-3 py-1 rounded-full">
                  {GOALS.find(g => g.id === goal)?.emoji} {GOALS.find(g => g.id === goal)?.label}
                </span>
              </div>
            </div>

            {/* Badges earned */}
            <div className="flex justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-2xl bg-accent2/10 border-2 border-accent2/30 flex items-center justify-center text-2xl">🌟</div>
                <span className="text-xs font-bold text-muted">Dream Builder</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-2xl bg-accent3/10 border-2 border-accent3/30 flex items-center justify-center text-2xl">🐦</div>
                <span className="text-xs font-bold text-muted">Early Bird</span>
              </div>
            </div>

            {/* Commitment reminder */}
            <div className="bg-card2 border border-white/8 rounded-2xl px-4 py-3">
              <p className="text-sm font-bold">
                {lang === 'ar'
                  ? `🎯 هدفك: ${weekDays === 7 ? 'كل يوم' : `${weekDays} أيام في الأسبوع`}. أنا سأتابعك!`
                  : lang === 'fr'
                  ? `🎯 Ton objectif : ${weekDays === 7 ? 'tous les jours' : `${weekDays} jours/semaine`}. Je te suivrai !`
                  : `🎯 Your goal: ${weekDays === 7 ? 'every day' : `${weekDays} days/week`}. I'll keep you on track!`}
              </p>
            </div>

            <button
              onClick={launch}
              disabled={saving}
              className={cn(
                'w-full py-5 rounded-2xl font-extrabold text-white text-lg transition-all',
                saving
                  ? 'bg-card2 text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.35)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(107,203,119,0.5)]'
              )}
            >
              {saving
                ? '⏳ Setting up your dashboard...'
                : lang === 'ar' ? '🚀 ابدأ مغامرتي!'
                : lang === 'fr' ? '🚀 Démarrer mon aventure !'
                : '🚀 Start my adventure!'}
            </button>

            <p className="text-xs text-muted font-semibold">
              {lang === 'ar' ? '14 يوماً مجاناً · لا بطاقة مطلوبة'
               : lang === 'fr' ? '14 jours gratuits · Aucune carte requise'
               : '14-day free trial · No credit card needed'}
            </p>

            <ProgressDots total={TOTAL_STEPS} current={step} />
          </div>
        )}
      </div>
    </div>
  )
}