'use client'
// components/dashboard/DashboardClient.tsx
// Concept: JIMMY'S WORLD
// Jimmy is large, centered, alive. He presents the one button.
// Streak lives in his speech bubble. Amber is the hero color.
// No card soup. No gradient hell. One screen, one action.

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  addXP, completeChallenge, checkAndAwardBadges, updateStreak,
} from '@/lib/supabase/queries'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

// ── i18n ─────────────────────────────────────────────────────
const COPY = {
  en: {
    streakMsg:   (n: number) => n > 0 ? `${n} day streak! 🔥` : `Start your streak today!`,
    noStreak:    `Open the app daily to build a streak`,
    cta:         `Start lesson`,
    ctaContinue: `Continue`,
    noMission:   `You're all caught up!`,
    noMissionSub:`New lessons coming soon`,
    explore:     `Explore tracks`,
    level:       `Level`,
    xpOf:        (cur: number, max: number) => `${cur} / ${max} XP`,
  },
  ar: {
    streakMsg:   (n: number) => n > 0 ? `${n} أيام متتالية! 🔥` : `ابدأ سلسلتك اليوم!`,
    noStreak:    `افتح التطبيق يومياً`,
    cta:         `ابدأ الدرس`,
    ctaContinue: `واصل`,
    noMission:   `أكملت كل شيء!`,
    noMissionSub:`دروس جديدة قريباً`,
    explore:     `استكشف`,
    level:       `مستوى`,
    xpOf:        (cur: number, max: number) => `${cur} / ${max} XP`,
  },
  fr: {
    streakMsg:   (n: number) => n > 0 ? `${n} jours de suite ! 🔥` : `Lance ta série aujourd'hui !`,
    noStreak:    `Ouvre l'app chaque jour`,
    cta:         `Commencer`,
    ctaContinue: `Continuer`,
    noMission:   `Tout terminé !`,
    noMissionSub:`Nouvelles leçons bientôt`,
    explore:     `Explorer`,
    level:       `Niveau`,
    xpOf:        (cur: number, max: number) => `${cur} / ${max} XP`,
  },
}

// ── Dot-grid background — hand-crafted feel, not AI void ─────
const DOT_GRID_SVG = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='14' cy='14' r='1.5' fill='rgba(255,255,255,0.055)'/%3E%3C/svg%3E")`

// ── Props ─────────────────────────────────────────────────────
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
  nextLesson?:          { id: string; title: string; emoji: string; xp_reward: number; skill_id: string } | null
  weeklyLessons?:       number
  weeklyGoal?:          number
  globalRank?:          number | null
}

// ─────────────────────────────────────────────────────────────
export default function DashboardClient({
  userId, profile, progress, lessonCompletions,
  todayChallenge, challengeCompletions,
  nextLesson, weeklyLessons = 0, weeklyGoal = 5,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast,     setToast]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const [jimmyErr,  setJimmyErr]  = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const lang   = (profile?.preferred_language || 'en') as 'en' | 'ar' | 'fr'
  const dir    = lang === 'ar' ? 'rtl' : 'ltr'
  const t      = COPY[lang] ?? COPY.en
  const xp     = progress?.xp    ?? 0
  const streak = progress?.streak ?? 0
  const level  = getLevel(xp)
  const xpInLevel  = xp % XP_PER_LEVEL
  const isNew  = lessonCompletions.length === 0

  const isChallengeComplete = todayChallenge
    ? challengeCompletions.some((c: any) => c.challenge_id === todayChallenge.id)
    : false

  const doChallenge = () => {
    if (!todayChallenge || isChallengeComplete) return
    startTransition(async () => {
      await updateStreak(userId)
      await addXP(userId, todayChallenge.xp_reward, 'daily_challenge', todayChallenge.id)
      await completeChallenge(userId, todayChallenge.id, 'daily')
      await checkAndAwardBadges(userId)
      showToast(`+${todayChallenge.xp_reward} XP!`)
      router.refresh()
    })
  }

  const missionHref = nextLesson
    ? `/dashboard/skills/${nextLesson.skill_id}/lesson/${nextLesson.id}`
    : '/dashboard/skills'

  // Jimmy's mood
  const jimmySrc = streak >= 3
    ? '/icons/mascot-celebrating.svg'
    : streak === 0
    ? '/icons/mascot-idle.svg'
    : '/icons/mascot-idle.svg'

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col items-center justify-center text-[#F5F5F5] relative overflow-hidden"
      style={{
        background: '#0D1117',
        backgroundImage: DOT_GRID_SVG,
      }}
    >

      {/* ── Toast ──────────────────────────────────────────── */}
      <div className={cn(
        'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-black text-sm',
        'transition-all duration-300 whitespace-nowrap pointer-events-none select-none',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )} style={{ background: '#FAA918', color: '#000', boxShadow: '0 8px 32px rgba(250,169,24,0.5)' }}>
        ⚡ {toast}
      </div>

      {/* ── Ambient glow behind Jimmy ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(28,176,246,0.07) 0%, transparent 70%)',
        }} />

      {/* ── Main content — single column, centered ─────────── */}
      <div className="relative z-10 flex flex-col items-center w-full px-6"
        style={{ maxWidth: 440 }}>

        {/* ── LEVEL + XP bar — compact, top ─────────────────── */}
        <div className="w-full mb-8 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-widest text-white/30 uppercase">
              {t.level} {level}
            </span>
            <span className="text-xs font-black text-white/25">
              {t.xpOf(xpInLevel, XP_PER_LEVEL)}
            </span>
          </div>
          {/* XP bar — thin, amber fill */}
          <div className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))}%`,
                background: 'linear-gradient(90deg, #FAA918, #f7c948)',
              }} />
          </div>
        </div>

        {/* ── SPEECH BUBBLE — streak lives here ─────────────── */}
        <div className="relative mb-1 self-center">
          <div
            className="relative px-5 py-2.5 rounded-2xl font-black text-sm text-center select-none"
            style={{
              background: streak > 0 ? '#FAA918' : 'rgba(255,255,255,0.07)',
              color:      streak > 0 ? '#000' : 'rgba(255,255,255,0.3)',
              minWidth:   160,
              // Triangle pointing down toward Jimmy
              filter: streak > 0 ? 'drop-shadow(0 4px 16px rgba(250,169,24,0.4))' : undefined,
            }}
          >
            {t.streakMsg(streak)}
            {/* Triangle */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
              style={{
                borderLeft:  '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop:   `8px solid ${streak > 0 ? '#FAA918' : 'rgba(255,255,255,0.07)'}`,
              }} />
          </div>
        </div>

        {/* ── JIMMY — large, centered, the identity ──────────── */}
        <div className="relative flex items-center justify-center mb-6"
          style={{ height: 200 }}>
          {!jimmyErr ? (
            <Image
              src={jimmySrc}
              alt="Jimmy"
              width={180}
              height={180}
              className="object-contain select-none pointer-events-none drop-shadow-2xl"
              style={{
                width: 180,
                height: 180,
                filter: 'drop-shadow(0 16px 40px rgba(28,176,246,0.25))',
                // Slight lean — asymmetric, not AI-default
                transform: 'rotate(-3deg)',
              }}
              onError={() => setJimmyErr(true)}
              priority
            />
          ) : (
            <span style={{ fontSize: 120 }} className="select-none">🤖</span>
          )}

          {/* Lesson emoji badge — floats off Jimmy's shoulder */}
          {nextLesson && (
            <div
              className="absolute top-2 right-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border:     '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                transform: 'rotate(6deg)',
              }}
            >
              {nextLesson.emoji}
            </div>
          )}
        </div>

        {/* ── LESSON TITLE — bold, large, clear ─────────────── */}
        {nextLesson && (
          <p className="font-fredoka text-2xl text-center text-white/80 mb-6 leading-snug px-2">
            {nextLesson.title}
          </p>
        )}

        {/* ── THE ONE BUTTON ────────────────────────────────── */}
        {nextLesson ? (
          <Link
            href={missionHref}
            className="w-full flex items-center justify-center gap-3 rounded-2xl font-black text-lg transition-all duration-150 hover:-translate-y-1 active:translate-y-0.5 active:shadow-none select-none"
            style={{
              background:  '#FAA918',
              color:       '#000',
              padding:     '18px 32px',
              boxShadow:   '0 6px 0 #c07a00, 0 12px 32px rgba(250,169,24,0.35)',
              letterSpacing: '0.02em',
            }}
          >
            <span>{isNew ? t.cta : t.ctaContinue}</span>
            {/* XP badge inside button */}
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.15)', color: '#000' }}
            >
              +{nextLesson.xp_reward} XP
            </span>
          </Link>
        ) : (
          <div className="w-full text-center">
            <p className="font-fredoka text-2xl text-white mb-2">{t.noMission}</p>
            <p className="text-sm text-white/30 font-semibold mb-5">{t.noMissionSub}</p>
            <Link
              href="/dashboard/skills"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base transition-all hover:-translate-y-0.5"
              style={{
                background:  '#FAA918',
                color:       '#000',
                boxShadow:   '0 5px 0 #c07a00',
              }}
            >
              {t.explore} →
            </Link>
          </div>
        )}

        {/* ── Weekly dots — 5 small dots below the button ────── */}
        <div className="flex items-center gap-2 mt-6">
          {Array.from({ length: weeklyGoal }).map((_, i) => (
            <div key={i}
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                background: i < weeklyLessons ? '#FAA918' : 'rgba(255,255,255,0.1)',
                transform:  i < weeklyLessons ? 'scale(1.2)' : 'scale(1)',
                boxShadow:  i < weeklyLessons ? '0 0 8px rgba(250,169,24,0.5)' : 'none',
              }} />
          ))}
        </div>
        <p className="text-xs font-bold text-white/20 mt-2 tracking-wider">
          {weeklyLessons}/{weeklyGoal} THIS WEEK
        </p>

        {/* ── Daily challenge — below the fold, quiet ─────────── */}
        {todayChallenge && (
          <button
            onClick={!isChallengeComplete ? doChallenge : undefined}
            disabled={isChallengeComplete}
            className="mt-8 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
            style={{
              background:  'rgba(255,255,255,0.04)',
              border:      `1px solid ${isChallengeComplete ? 'rgba(255,255,255,0.05)' : 'rgba(250,169,24,0.2)'}`,
            }}
          >
            <span className="text-xl select-none flex-shrink-0">{todayChallenge.emoji}</span>
            <span className={cn('flex-1 text-sm font-bold truncate', isChallengeComplete ? 'line-through text-white/20' : 'text-white/70')}>
              {todayChallenge.title}
            </span>
            <span className="text-xs font-black flex-shrink-0"
              style={{ color: isChallengeComplete ? '#3CB371' : '#FAA918' }}>
              {isChallengeComplete ? '✓ Done' : `+${todayChallenge.xp_reward} XP`}
            </span>
          </button>
        )}

      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}