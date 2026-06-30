'use client'
// components/dashboard/DashboardClient.tsx
// Concept: MISSION BRIEFING — game lobby energy, Duolingo discipline.
// One screen. Player identity at top. One glowing mission card center stage.
// Streak is the dominant number. Weekly XP bar below. Three stats at bottom.
// No clutter. No menus. Just: who you are, what you do next.

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { addXP, completeChallenge, checkAndAwardBadges, updateStreak } from '@/lib/supabase/queries'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

// ── i18n ─────────────────────────────────────────────────────
const UI = {
  en: {
    level:        'LVL',
    mission:      'MISSION',
    streak:       'STREAK',
    weekProgress: 'WEEKLY XP',
    tap:          'Start mission',
    tapContinue:  'Continue mission',
    challenge:    'SIDE QUEST',
    claimXP:      'Claim XP',
    claimed:      'Claimed ✓',
    noMission:    'All missions complete',
    noMissionSub: 'New content drops soon',
    explore:      'Explore tracks',
    lessonsLabel: 'LESSONS',
    rankLabel:    'RANK',
    xpLabel:      'TOTAL XP',
    day:          (n: number) => n === 1 ? '1 day' : `${n} days`,
  },
  ar: {
    level:        'مستوى',
    mission:      'المهمة',
    streak:       'متتالية',
    weekProgress: 'XP الأسبوع',
    tap:          'ابدأ المهمة',
    tapContinue:  'واصل المهمة',
    challenge:    'مهمة جانبية',
    claimXP:      'احصل على XP',
    claimed:      'تم ✓',
    noMission:    'أكملت كل المهام',
    noMissionSub: 'محتوى جديد قادم',
    explore:      'استكشف المسارات',
    lessonsLabel: 'درس',
    rankLabel:    'ترتيب',
    xpLabel:      'إجمالي XP',
    day:          (n: number) => `${n} أيام`,
  },
  fr: {
    level:        'NIV',
    mission:      'MISSION',
    streak:       'SÉRIE',
    weekProgress: 'XP SEMAINE',
    tap:          'Commencer',
    tapContinue:  'Continuer',
    challenge:    'QUÊTE BONUS',
    claimXP:      'Obtenir XP',
    claimed:      'Récupéré ✓',
    noMission:    'Toutes les missions terminées',
    noMissionSub: 'Nouveau contenu bientôt',
    explore:      'Explorer les pistes',
    lessonsLabel: 'LEÇONS',
    rankLabel:    'RANG',
    xpLabel:      'XP TOTAL',
    day:          (n: number) => n === 1 ? '1 jour' : `${n} jours`,
  },
}

// ── Mascot ────────────────────────────────────────────────────
function Mascot({ streak }: { streak: number }) {
  const [err, setErr] = useState(false)
  const src = streak > 0 ? '/icons/mascot-celebrating.svg' : '/icons/mascot-idle.svg'
  if (!err) return (
    <Image src={src} alt="" width={56} height={56}
      className="w-14 h-14 object-contain select-none pointer-events-none"
      onError={() => setErr(true)} priority />
  )
  return <span className="text-4xl select-none">{streak > 0 ? '🤖' : '😴'}</span>
}

// ── Pulsing glow border animation ─────────────────────────────
// The ONE animated element — makes the mission card feel alive.
const GLOW_KEYFRAMES = `
@keyframes missionGlow {
  0%, 100% { box-shadow: 0 0 24px 2px rgba(28,176,246,0.25), 0 0 0 1px rgba(28,176,246,0.3); }
  50%       { box-shadow: 0 0 40px 6px rgba(28,176,246,0.45), 0 0 0 1px rgba(28,176,246,0.6); }
}
@keyframes streakPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

// ── Weekly XP bar ─────────────────────────────────────────────
function WeekBar({
  done, goal, lang,
}: { done: number; goal: number; lang: string }) {
  const t   = (UI as any)[lang] ?? UI.en
  const pct = Math.min(100, Math.round((done / Math.max(goal, 1)) * 100))

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.15em] text-white/30">
          {t.weekProgress}
        </span>
        <span className="text-[10px] font-black text-white/30">
          {done}/{goal}
        </span>
      </div>
      <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #1CB0F6, #14D4F4)',
          }}
        />
      </div>
    </div>
  )
}

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
  nextLesson, weeklyLessons = 0, weeklyGoal = 5, globalRank,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast,     setToast]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const lang   = (profile?.preferred_language || 'en') as 'en' | 'ar' | 'fr'
  const dir    = lang === 'ar' ? 'rtl' : 'ltr'
  const t      = UI[lang] ?? UI.en
  const xp     = progress?.xp     ?? 0
  const streak = progress?.streak  ?? 0
  const level  = getLevel(xp)
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

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col items-center justify-center px-5 py-8 text-[#F5F5F5]"
      style={{ background: '#0B0F14' }}
    >
      <style>{GLOW_KEYFRAMES}</style>

      {/* ── Toast ──────────────────────────────────────────── */}
      <div className={cn(
        'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl',
        'bg-[#1CB0F6] text-black font-black text-sm shadow-xl',
        'transition-all duration-300 whitespace-nowrap',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        ⚡ {toast}
      </div>

      {/* ── Main column — max 480px, vertically centered ───── */}
      <div
        className="w-full flex flex-col gap-5"
        style={{
          maxWidth: 480,
          animation: mounted ? 'slideUp 0.4s ease-out both' : undefined,
        }}
      >

        {/* ── PLAYER IDENTITY ROW ───────────────────────────── */}
        <div className="flex items-center justify-between">

          {/* Left: mascot + name + level */}
          <div className="flex items-center gap-3">
            <Mascot streak={streak} />
            <div>
              <p className="font-fredoka text-lg text-white leading-tight">
                {profile.display_name}
              </p>
              {/* Level badge */}
              <div className="inline-flex items-center gap-1 mt-0.5 bg-[#1CB0F6]/15 border border-[#1CB0F6]/25 rounded-full px-2 py-0.5">
                <span className="text-[10px] font-black text-[#1CB0F6] tracking-widest">{t.level}</span>
                <span className="text-[10px] font-black text-white">{level}</span>
              </div>
            </div>
          </div>

          {/* Right: STREAK — the dominant number, Duolingo-style */}
          <div
            className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2"
            style={{
              background: streak > 0 ? 'rgba(250,169,24,0.12)' : 'rgba(255,255,255,0.04)',
              borderColor: streak > 0 ? 'rgba(250,169,24,0.35)' : 'rgba(255,255,255,0.08)',
              animation: streak > 2 ? 'streakPop 2s ease-in-out infinite' : undefined,
            }}
          >
            <span className="text-xl leading-none select-none">
              {streak > 0 ? '🔥' : '💤'}
            </span>
            <span
              className="font-fredoka text-lg leading-tight"
              style={{ color: streak > 0 ? '#FAA918' : 'rgba(255,255,255,0.2)' }}
            >
              {streak}
            </span>
            <span
              className="text-[8px] font-black tracking-widest"
              style={{ color: streak > 0 ? 'rgba(250,169,24,0.6)' : 'rgba(255,255,255,0.15)' }}
            >
              {t.streak}
            </span>
          </div>
        </div>

        {/* ── MISSION CARD — the one thing that matters ─────── */}
        {nextLesson ? (
          <Link
            href={missionHref}
            className="block w-full rounded-3xl overflow-hidden transition-transform duration-150 active:scale-[0.98] hover:-translate-y-0.5"
            style={{ animation: 'missionGlow 3s ease-in-out infinite' }}
          >
            {/* Mission eyebrow */}
            <div
              className="flex items-center justify-between px-5 pt-4 pb-2"
              style={{ background: 'rgba(28,176,246,0.08)' }}
            >
              <span className="text-[10px] font-black tracking-[0.2em] text-[#1CB0F6]">
                {t.mission}
              </span>
              <span className="text-[10px] font-black text-[#FAA918]">
                +{nextLesson.xp_reward} XP
              </span>
            </div>

            {/* Mission content */}
            <div
              className="flex items-center gap-4 px-5 pb-5 pt-3"
              style={{ background: 'rgba(28,176,246,0.06)' }}
            >
              {/* Emoji */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 border"
                style={{
                  background: 'rgba(28,176,246,0.15)',
                  borderColor: 'rgba(28,176,246,0.2)',
                }}
              >
                {nextLesson.emoji}
              </div>

              {/* Title + CTA */}
              <div className="flex-1 min-w-0">
                <p className="font-fredoka text-xl text-white leading-snug">
                  {nextLesson.title}
                </p>
                <p className="text-xs font-bold text-white/40 mt-1">
                  {isNew ? t.tap : t.tapContinue} →
                </p>
              </div>

              {/* Arrow button */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #1CB0F6, #2B70C9)',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/>
                </svg>
              </div>
            </div>
          </Link>
        ) : (
          /* No next lesson — finished everything */
          <div
            className="w-full rounded-3xl p-6 text-center border"
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-fredoka text-xl text-white mb-1">{t.noMission}</p>
            <p className="text-sm text-white/30 font-semibold mb-4">{t.noMissionSub}</p>
            <Link
              href="/dashboard/skills"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm border transition-all hover:bg-white/6"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
            >
              {t.explore} →
            </Link>
          </div>
        )}

        {/* ── WEEKLY PROGRESS BAR ───────────────────────────── */}
        <WeekBar done={weeklyLessons} goal={weeklyGoal} lang={lang} />

        {/* ── SIDE QUEST (daily challenge) ──────────────────── */}
        {todayChallenge && (
          <button
            onClick={!isChallengeComplete ? doChallenge : undefined}
            disabled={isChallengeComplete}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all',
              'active:scale-[0.98]'
            )}
            style={{
              background:   isChallengeComplete ? 'rgba(255,255,255,0.02)' : 'rgba(250,169,24,0.06)',
              borderColor:  isChallengeComplete ? 'rgba(255,255,255,0.06)' : 'rgba(250,169,24,0.25)',
              cursor:       isChallengeComplete ? 'default' : 'pointer',
            }}
          >
            <span className="text-[10px] font-black tracking-[0.18em] text-[#FAA918]/60 flex-shrink-0">
              {t.challenge}
            </span>
            <span className="text-sm font-bold text-white flex-1 min-w-0 truncate">
              {todayChallenge.emoji} {todayChallenge.title}
            </span>
            <span
              className="text-xs font-black flex-shrink-0"
              style={{ color: isChallengeComplete ? '#3CB371' : '#FAA918' }}
            >
              {isChallengeComplete
                ? t.claimed
                : `+${todayChallenge.xp_reward} XP`}
            </span>
          </button>
        )}

        {/* ── THREE STATS ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t.lessonsLabel, value: lessonCompletions.length, color: '#3CB371' },
            { label: t.rankLabel,    value: globalRank != null ? `#${globalRank}` : '—', color: '#1CB0F6' },
            { label: t.xpLabel,      value: xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp, color: '#FAA918' },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border"
              style={{
                background:   'rgba(255,255,255,0.025)',
                borderColor:  'rgba(255,255,255,0.06)',
              }}
            >
              <span
                className="font-fredoka text-2xl leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </span>
              <span className="text-[9px] font-black tracking-[0.18em] text-white/25">
                {s.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}