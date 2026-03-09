'use client'
// components/onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertProfile, updateStreak, awardBadge, addXP, startFreeTrial } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { AgeGroup, InterestType } from '@/lib/supabase/database.types'

const AVATARS = ['🧑‍🚀','👩‍💻','🧑‍🎨','👩‍🔬','🦸','🧙','🤖','🦊','🐉','🦄','🐱','🐸','🦁','🐯','🦋','🌟','🔥','💎','🎮','🎯']

const INTERESTS = [
  { id:'coding'          as InterestType, label:'Coding',          emoji:'💻', desc:'Build apps & websites',   color:'border-accent4 bg-accent4/10 text-accent4' },
  { id:'ai'              as InterestType, label:'AI',              emoji:'🧠', desc:'Teach computers to think', color:'border-accent5 bg-accent5/10 text-accent5' },
  { id:'games'           as InterestType, label:'Game Design',     emoji:'🎮', desc:'Create your own games',    color:'border-accent1 bg-accent1/10 text-accent1' },
  { id:'entrepreneurship'as InterestType, label:'Entrepreneurship',emoji:'💡', desc:'Start your business',     color:'border-accent3 bg-accent3/10 text-accent3' },
  { id:'art'             as InterestType, label:'Digital Art',     emoji:'🎨', desc:'Create beautiful things',  color:'border-accent2 bg-accent2/10 text-accent2' },
  { id:'robots'          as InterestType, label:'Robotics',        emoji:'🤖', desc:'Build real-world things',  color:'border-orange-400 bg-orange-400/10 text-orange-400' },
]

const LANGUAGES = [
  { id: 'en', flag: '🇬🇧', label: 'English',  native: 'English'  },
  { id: 'ar', flag: '🇸🇦', label: 'Arabic',   native: 'العربية'  },
  { id: 'fr', flag: '🇫🇷', label: 'French',   native: 'Français' },
]

const COUNTRIES = [
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'KW', flag: '🇰🇼', name: 'Kuwait' },
  { code: 'QA', flag: '🇶🇦', name: 'Qatar' },
  { code: 'BH', flag: '🇧🇭', name: 'Bahrain' },
  { code: 'OM', flag: '🇴🇲', name: 'Oman' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: 'JO', flag: '🇯🇴', name: 'Jordan' },
  { code: 'LB', flag: '🇱🇧', name: 'Lebanon' },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'GB', flag: '🇬🇧', name: 'UK' },
  { code: 'US', flag: '🇺🇸', name: 'USA' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'OTHER', flag: '🌍', name: 'Other' },
]

const getAgeGroup = (age: number): AgeGroup => age <= 8 ? 'mini' : age <= 11 ? 'junior' : age <= 14 ? 'pro' : 'expert'
const AGE_LABELS: Record<AgeGroup, string> = {
  mini: 'Mini Explorer 🌱', junior: 'Junior Creator 🛠️', pro: 'Pro Explorer 🗺️', expert: 'Tech Expert 🚀',
}

// Total steps: 1=name, 2=avatar, 3=age+interests, 4=language+country, 5=dream, 6=summary
const TOTAL_STEPS = 5

export default function OnboardingFlow() {
  const router   = useRouter()
  const [userId, setUserId]     = useState('')
  const [step,   setStep]       = useState(1)
  const [name,   setName]       = useState('')
  const [avatar, setAvatar]     = useState('🧑‍🚀')
  const [age,    setAge]        = useState(12)
  const [interests, setInterests] = useState<InterestType[]>([])
  const [dream,  setDream]      = useState('')
  const [lang,   setLang]       = useState('en')
  const [country, setCountry]   = useState('AE')
  const [saving, setSaving]     = useState(false)
  const [toast,  setToast]      = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      if (user.user_metadata?.display_name) setName(user.user_metadata.display_name)
    })
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const next = (n: number) => {
    const toasts: Record<number, string> = {
      2: '⭐ +10 XP – Name saved!',
      3: '⭐ +10 XP – Avatar chosen!',
      4: '⭐ +15 XP – Profile growing!',
      5: '⭐ +15 XP – Almost there!',
      6: '🎉 +25 XP – Profile complete!',
    }
    if (toasts[n]) showToast(toasts[n])
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleInterest = (id: InterestType) =>
    setInterests((prev: InterestType[]) => prev.includes(id) ? prev.filter((i: InterestType) => i !== id) : [...prev, id])

  const launch = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const ageGroup = getAgeGroup(age)

      // Save full profile including language + country
      const { error: profileError } = await upsertProfile(userId, {
        display_name:  name,
        avatar,
        age,
        age_group:     ageGroup,
        interests,
        dream_project: dream,
        language:      lang,
        country,
        onboarding_done: true,
      })
      if (profileError) throw new Error(`Profile save failed: ${profileError.message}`)

      // Start 14-day free trial (DB trigger also does this, but belt-and-suspenders)
      await startFreeTrial(userId)

      // Onboarding rewards — fire-and-forget, non-blocking
      Promise.all([
        updateStreak(userId),
        addXP(userId, 60, 'onboarding_complete'),
        awardBadge(userId, 'dream-builder'),
        awardBadge(userId, 'early-bird'),
      ]).catch(console.error)

      // Hard redirect so the server re-reads the fresh profile from DB
      // (avoids router cache showing stale onboarding_done=false)
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Onboarding error:', err)
      showToast(`⚠️ ${err?.message ?? 'Something went wrong — please try again'}`)
      setSaving(false)
    }
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100)
  const ageGroup    = getAgeGroup(age)
  const dir         = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="relative min-h-screen z-10" dir={dir}>
      {/* Toast */}
      <div className={cn(
        'fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-card border border-accent2/30 text-accent2 font-bold text-sm shadow-xl transition-all duration-400',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      )}>{toast}</div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="font-fredoka text-4xl bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
            🚀 Plulai
          </h1>
          <p className="text-muted font-bold text-sm mt-1">Learn AI • Code • Build • Launch 🌍</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 my-7">
          <div className="flex-1 h-2.5 bg-card2 rounded-full overflow-hidden">
            <div className="h-full xp-bar-fill rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-muted text-xs font-bold">Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
        </div>

        {/* ── STEP 1: Name ── */}
        {step === 1 && (
          <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl animate-slide-up">
            <h2 className="font-fredoka text-3xl mb-2">👋 Hey there, superstar!</h2>
            <p className="text-muted font-semibold mb-7">What&apos;s your name? We&apos;ll personalize everything just for you!</p>
            <input
              className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-2xl px-5 py-4 text-white font-bold text-lg outline-none transition-all placeholder:text-muted"
              placeholder="Type your first name..." maxLength={20} value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && name.trim().length >= 2 && next(2)}
              autoFocus
            />
            <button disabled={name.trim().length < 2} onClick={() => next(2)}
              className="w-full mt-7 py-4 rounded-2xl font-extrabold text-white text-lg bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Let's go! →
            </button>
          </div>
        )}

        {/* ── STEP 2: Avatar ── */}
        {step === 2 && (
          <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl animate-slide-up">
            <h2 className="font-fredoka text-3xl mb-2">🎨 Pick your avatar, {name}!</h2>
            <p className="text-muted font-semibold mb-6">Choose the character that feels most like you.</p>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {AVATARS.map((a: string) => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={cn(
                    'text-3xl rounded-2xl py-3 transition-all border-2',
                    avatar === a
                      ? 'border-accent4 bg-accent4/15 scale-110 shadow-lg'
                      : 'border-white/8 bg-card2 hover:border-white/25 hover:scale-105'
                  )}>
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => next(1)} className="flex-1 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">← Back</button>
              <button onClick={() => next(3)} className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-1 transition-all">
                Looking good! →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Age + Interests ── */}
        {step === 3 && (
          <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl animate-slide-up">
            <h2 className="font-fredoka text-3xl mb-2">📅 How old are you?</h2>
            <p className="text-muted font-semibold mb-5">We&apos;ll tailor the lessons to your level.</p>

            <div className="flex items-center gap-5 mb-6">
              <button onClick={() => setAge((a: number) => Math.max(4, a - 1))}
                className="w-12 h-12 rounded-full bg-card2 font-extrabold text-xl hover:bg-card border border-white/10 transition-all">−</button>
              <div className="flex-1 text-center">
                <div className="font-fredoka text-5xl text-accent4">{age}</div>
                <div className="text-xs font-bold text-muted mt-1">{AGE_LABELS[ageGroup]}</div>
              </div>
              <button onClick={() => setAge((a: number) => Math.min(18, a + 1))}
                className="w-12 h-12 rounded-full bg-card2 font-extrabold text-xl hover:bg-card border border-white/10 transition-all">+</button>
            </div>

            <h3 className="font-fredoka text-2xl mb-2">⚡ What excites you?</h3>
            <p className="text-muted font-semibold mb-4 text-sm">Pick at least 2 interests.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {INTERESTS.map(item => (
                <button key={item.id} onClick={() => toggleInterest(item.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all text-start',
                    interests.includes(item.id) ? item.color + ' scale-[1.02]' : 'border-white/8 bg-card2 text-muted hover:border-white/20'
                  )}>
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <div className="font-extrabold">{item.label}</div>
                    <div className="text-xs opacity-70 font-semibold">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => next(2)} className="flex-1 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">← Back</button>
              <button disabled={interests.length < 2} onClick={() => next(4)}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Language + Country ── */}
        {step === 4 && (
          <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl animate-slide-up">
            <h2 className="font-fredoka text-3xl mb-2">🌍 Where are you from?</h2>
            <p className="text-muted font-semibold mb-6">This helps us show the right leaderboard and language.</p>

            {/* Language */}
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">🗣️ Preferred Language</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {LANGUAGES.map(l => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-4 rounded-2xl border-2 font-bold transition-all',
                    lang === l.id
                      ? 'border-accent4 bg-accent4/10 text-white scale-[1.02]'
                      : 'border-white/8 bg-card2 text-muted hover:border-white/20'
                  )}>
                  <span className="text-3xl">{l.flag}</span>
                  <span className="text-sm font-extrabold">{l.native}</span>
                </button>
              ))}
            </div>

            {/* Country */}
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">📍 Country</h3>
            <div className="grid grid-cols-3 gap-2 mb-6 max-h-56 overflow-y-auto pr-1">
              {COUNTRIES.map(c => (
                <button key={c.code} onClick={() => setCountry(c.code)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all',
                    country === c.code
                      ? 'border-accent4 bg-accent4/10 text-white'
                      : 'border-white/8 bg-card2 text-muted hover:border-white/20 hover:text-white'
                  )}>
                  <span className="text-lg flex-shrink-0">{c.flag}</span>
                  <span className="truncate text-xs font-bold">{c.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => next(3)} className="flex-1 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">← Back</button>
              <button onClick={() => next(5)}
                className="flex-1 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-1 transition-all">
                Almost there! →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Dream Project ── */}
        {step === 5 && (
          <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl animate-slide-up">
            <h2 className="font-fredoka text-3xl mb-2">🌟 Your Dream Project</h2>
            <p className="text-muted font-semibold mb-5">What&apos;s ONE thing you&apos;d love to build? Dream really big!</p>
            <textarea
              className="w-full bg-card2 border-2 border-white/8 focus:border-accent5 rounded-2xl px-5 py-4 text-white font-semibold text-base outline-none resize-none min-h-[120px] transition-all placeholder:text-muted"
              placeholder="e.g. I want to build an AI that writes bedtime stories..."
              value={dream}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDream(e.target.value)}
            />

            {/* Summary preview */}
            <div className="mt-5 bg-gradient-to-br from-accent4/8 to-accent5/8 border border-accent4/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <div className="font-extrabold">{name}</div>
                  <div className="text-xs text-muted font-semibold">Age {age} · {AGE_LABELS[ageGroup]}</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-sm">{LANGUAGES.find(l => l.id === lang)?.flag}</span>
                  <span className="text-sm">{COUNTRIES.find(c => c.code === country)?.flag}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((id: string) => {
                  const item = INTERESTS.find(x => x.id === id)!
                  return (
                    <span key={id} className="flex items-center gap-1 bg-card2 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
                      {item.emoji} {item.label}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-accent2/8 border border-accent2/20 rounded-2xl px-4 py-3 mt-4 mb-6">
              <span className="text-2xl">🎁</span>
              <p className="text-sm font-bold">
                You'll get <span className="text-accent2">+60 XP</span> + 2 exclusive founder badges +
                <span className="text-accent4"> 14-day free trial</span>!
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => next(4)} className="flex-1 py-4 rounded-2xl font-extrabold bg-card2 text-muted hover:text-white transition-all">← Back</button>
              <button onClick={launch} disabled={saving || dream.trim().length < 10}
                className="flex-1 py-5 rounded-2xl font-extrabold text-white text-lg bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_30px_rgba(107,203,119,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 animate-glow-pulse">
                {saving ? '⏳ Setting up...' : '🚀 Start My Adventure!'}
              </button>
            </div>
          </div>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-7">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={cn(
              'rounded-full transition-all duration-300',
              i + 1 === step ? 'w-6 h-2.5 bg-accent4' :
              i + 1 < step  ? 'w-2.5 h-2.5 bg-accent3' :
                               'w-2.5 h-2.5 bg-card2'
            )} />
          ))}
        </div>
      </div>
    </div>
  )
}
