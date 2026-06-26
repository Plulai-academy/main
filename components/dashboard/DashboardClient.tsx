'use client'
// components/dashboard/DashboardClient.tsx
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { addXP, completeChallenge, checkAndAwardBadges, updateStreak } from '@/lib/supabase/queries'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

// ─── Icon set (chrome only — same pattern as SkillsClient/LessonViewClient) ───
type IconKind = 'fire' | 'seedling' | 'rocket' | 'chevronRight' | 'sparkle' | 'partyPop'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'fire':         return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'seedling':     return <svg {...common}><path d="M12 22a1 1 0 0 1-1-1v-6.1C8 14.4 5 12 5 8c4 0 6.4 2 7 4.5C12.6 10 15 8 19 8c0 4-3 6.4-6 6.9V21a1 1 0 0 1-1 1Z"/></svg>
    case 'rocket':       return <svg {...common}><path d="M13.5 2.5c3 .3 5.3 2.6 5.6 5.6.2 2-.4 4-1.7 5.6l.1 3.4-3.4-.1c-1.6 1.3-3.6 1.9-5.6 1.7-3-.3-5.3-2.6-5.6-5.6-.2-2 .4-4 1.7-5.6L4.5 4.2l3.4.1c1.6-1.3 3.6-1.9 5.6-1.7Zm-2.8 8.8a2 2 0 1 0 2.8-2.8 2 2 0 0 0-2.8 2.8ZM3 21l3-1 -2-2-1 3Z"/></svg>
    case 'chevronRight': return <svg {...common}><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/></svg>
    case 'sparkle':       return <svg {...common}><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/></svg>
    case 'partyPop':      return <svg {...common}><path d="M3 21l4-13 13 4-13 4-4 5Zm9-17 1.5 2.6L17 8l-3.6.3L12 11l-1.4-2.7L7 8l3.5-2.4L12 3Z"/></svg>
  }
}


// ─── Mascot — same state logic as SkillsClient (idle/celebrating/tired/noStreak) ───
// Drop files in public/icons to replace these automatically:
// mascot-idle.svg, mascot-celebrating.svg, mascot-tired.svg, mascot-nostreak.svg
type MascotState = 'celebrating' | 'tired' | 'noStreak' | 'idle'
const MASCOT_SRC: Record<MascotState, string | null> = {
  idle: '/icons/mascot-idle.svg',
  celebrating: '/icons/mascot-celebrating.svg',
  tired: '/icons/mascot-tired.svg',
  noStreak: '/icons/mascot-nostreak.svg',
}
const TIRED_THRESHOLD_MINS = 60

function Mascot({ state }: { state: MascotState }) {
  const [errored, setErrored] = useState(false)
  const src = MASCOT_SRC[state]

  if (src && !errored) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        onError={() => setErrored(true)}
        className={cn('select-none pointer-events-none', state === 'celebrating' && 'animate-bounce-slow')}
        style={{ width: 'clamp(140px, 32vw, 220px)' }}
      />
    )
  }
  // Fallback chip if mascot art isn't present yet
  const tint = state === 'celebrating' ? '#FAA918' : state === 'tired' ? '#5B6772' : state === 'noStreak' ? '#3A4450' : '#1CB0F6'
  return (
    <div
      aria-hidden
      className={cn('rounded-3xl flex items-center justify-center', state === 'celebrating' && 'animate-bounce-slow')}
      style={{ width: 'clamp(120px, 28vw, 170px)', height: 'clamp(120px, 28vw, 170px)', backgroundColor: `${tint}22` }}
    >
      <Icon kind={state === 'celebrating' ? 'partyPop' : 'rocket'} className="w-1/2 h-1/2" style={{ color: tint } as React.CSSProperties} />
    </div>
  )
}

interface Props {
  userId:               string
  profile:              any
  progress:             any
  skillProgress:        any[]
  lessonCompletions:    any[]
  userBadges:           any[]
  allBadges:            any[]
  todayChallenge:       any
  challengeCompletions: any[]
  balance?:             number | null
}

export default function DashboardClient({
  userId, profile, progress, skillProgress, lessonCompletions,
  userBadges, allBadges, todayChallenge, challengeCompletions,
  balance,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast]           = useState<string | null>(null)
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null)
  const [shareCard, setShareCard]   = useState<ShareCardProps | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const xp     = progress?.xp || 0
  const streak = progress?.streak || 0
  const lang   = profile?.preferred_language || 'en'
  const isNewUser = lessonCompletions.length === 0

  // Kept as a background action only — Challenges now lives on its own page
  // (sidebar), but if a notification or deep link ever lands here mid-challenge,
  // this still works without needing the old card UI.
  const isChallengeComplete = todayChallenge
    ? challengeCompletions.some((c: any) => c.challenge_id === todayChallenge.id)
    : false
  const doChallenge = () => {
    if (!todayChallenge || isChallengeComplete) return
    startTransition(async () => {
      await updateStreak(userId)
      const result = await addXP(userId, todayChallenge.xp_reward, 'daily_challenge', todayChallenge.id)
      await completeChallenge(userId, todayChallenge.id, 'daily')
      await checkAndAwardBadges(userId)
      showToast(`+${todayChallenge.xp_reward} XP!`)
      if (result.data?.leveledUp) setLevelUpMsg(`Level Up! You're now Level ${result.data.newLevel}!`)
      router.refresh()
    })
  }

  // ── Mascot state: celebrate > tired > no-streak > idle ──────────────────
  // allDone / totalTimeMins aren't tracked on Home — plug in real signals
  // here if you want Home's mascot to react to daily-time or full-track
  // completion the same way the skill-path mascot does.
  const allDone = false
  const totalTimeMins = 0
  const mascotState: MascotState = allDone
    ? 'celebrating'
    : totalTimeMins >= TIRED_THRESHOLD_MINS
    ? 'tired'
    : streak === 0
    ? 'noStreak'
    : 'idle'

  // ── Copy — one line, no jargon, no paragraph ─────────────────────────────
  const greetingsByLang: Record<string, Record<string, string>> = {
    en: {
      mini:   `Hi ${profile.display_name}!`,
      junior: `Hey ${profile.display_name}!`,
      pro:    `Welcome back, ${profile.display_name}`,
      expert: `${profile.display_name}`,
    },
    ar: {
      mini:   `أهلاً ${profile.display_name}!`,
      junior: `مرحباً ${profile.display_name}!`,
      pro:    `أهلاً بعودتك ${profile.display_name}`,
      expert: `${profile.display_name}`,
    },
    fr: {
      mini:   `Salut ${profile.display_name} !`,
      junior: `Hé ${profile.display_name} !`,
      pro:    `Bon retour, ${profile.display_name}`,
      expert: `${profile.display_name}`,
    },
  }
  const greetings = greetingsByLang[lang] ?? greetingsByLang.en

  const ctaLabel = isNewUser
    ? (lang === 'ar' ? 'ابدأ أول درس' : lang === 'fr' ? 'Commencer' : "Let's Go")
    : (lang === 'ar' ? 'استمر' : lang === 'fr' ? 'Continuer' : 'Continue')

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center text-center px-4 py-10 text-[#F5F5F5]">

      {/* ── Level-up modal — a celebratory interrupt tied to a real action, not standing clutter ── */}
      {levelUpMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4" onClick={() => setLevelUpMsg(null)}>
          <div className="bg-card border border-[#1CB0F6]/40 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-[#1CB0F6]/20 animate-star-pop w-full max-w-sm ring-1 ring-[#1CB0F6]/20">
            <div className="w-20 h-20 rounded-full bg-[#1CB0F6]/15 flex items-center justify-center mx-auto mb-5 animate-bounce-slow">
              <Icon kind="partyPop" className="w-10 h-10 text-[#1CB0F6]" />
            </div>
            <h2 className="font-fredoka text-2xl md:text-3xl text-[#1CB0F6] mb-2">{levelUpMsg}</h2>
            <p className="text-[#6F6F6F] font-bold text-sm">Keep going!</p>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-5 py-3 rounded-2xl',
        'bg-card/95 backdrop-blur-sm border border-[#14D4F4]/40 text-[#14D4F4] font-bold text-sm shadow-xl shadow-[#14D4F4]/10',
        'transition-all duration-400 flex items-center gap-2',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        <Icon kind="sparkle" className="w-4 h-4 shrink-0" />
        {toast}
      </div>

      {/* ── Streak pill — the one stat worth keeping visible (it's the habit
           hook). XP/level/badges now live on their own page, off the sidebar. ── */}
      <div className={cn(
        'inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full mb-6',
        streak > 0 ? 'text-[#FAA918] bg-[#FAA918]/10' : 'text-[#3CB371] bg-[#3CB371]/10',
      )}>
        <Icon kind={streak > 0 ? 'fire' : 'seedling'} className="w-4 h-4" />
        {streak > 0
          ? (lang === 'ar' ? `${streak} أيام متتالية` : lang === 'fr' ? `${streak} jours de suite` : `${streak}-day streak`)
          : (lang === 'ar' ? 'ابدأ سلسلتك اليوم' : lang === 'fr' ? "Lance ta série aujourd'hui" : 'Start your streak today')}
      </div>

      {/* ── Mascot — the visual anchor of the page ── */}
      <Mascot state={mascotState} />

      {/* ── One line ── */}
      <h1 className="font-fredoka text-2xl md:text-3xl mt-6 mb-8 leading-tight">
        {greetings[profile.age_group] || greetings.pro}
      </h1>

      {/* ── One button — the only action on this screen ── */}
      <Link
        href="/dashboard/skills"
        className="inline-flex items-center gap-2 px-12 py-4 rounded-2xl font-extrabold text-base bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] text-black shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none transition-all"
      >
        {ctaLabel}
        <Icon kind="chevronRight" className="w-5 h-5" />
      </Link>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}