'use client'
// components/dashboard/DashboardClient.tsx
// Duolingo-inspired: top stat bar + center mission + right sidebar.
// Three zones. Crystal clear hierarchy. One tap to start.

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
const UI = {
  en: {
    streak:       'Streak',
    level:        'Level',
    xp:           'XP',
    mission:      "Today's mission",
    newMission:   'First mission',
    start:        'Start',
    continue:     'Continue',
    noMission:    "You're all caught up! 🏆",
    noMissionSub: 'New content coming soon.',
    explore:      'Explore tracks',
    sideQuest:    "Today's challenge",
    claimXP:      'Tap to claim',
    claimed:      'Done ✓',
    leaderboard:  'Leaderboard',
    you:          'You',
    weeklyGoal:   (done: number, goal: number) => `${done} of ${goal} lessons this week`,
    rank:         (n: number) => `#${n}`,
  },
  ar: {
    streak:       'متتالية',
    level:        'مستوى',
    xp:           'نقاط',
    mission:      'مهمة اليوم',
    newMission:   'أول مهمة',
    start:        'ابدأ',
    continue:     'واصل',
    noMission:    'أكملت كل شيء! 🏆',
    noMissionSub: 'محتوى جديد قادم قريباً.',
    explore:      'استكشف المسارات',
    sideQuest:    'تحدي اليوم',
    claimXP:      'اضغط للحصول على XP',
    claimed:      'تم ✓',
    leaderboard:  'المتصدرون',
    you:          'أنت',
    weeklyGoal:   (done: number, goal: number) => `${done} من ${goal} دروس هذا الأسبوع`,
    rank:         (n: number) => `#${n}`,
  },
  fr: {
    streak:       'Série',
    level:        'Niveau',
    xp:           'XP',
    mission:      'Mission du jour',
    newMission:   'Première mission',
    start:        'Commencer',
    continue:     'Continuer',
    noMission:    'Tout terminé ! 🏆',
    noMissionSub: 'Nouveau contenu bientôt.',
    explore:      'Explorer les pistes',
    sideQuest:    "Défi du jour",
    claimXP:      'Récupérer les XP',
    claimed:      'Fait ✓',
    leaderboard:  'Classement',
    you:          'Toi',
    weeklyGoal:   (done: number, goal: number) => `${done} sur ${goal} leçons cette semaine`,
    rank:         (n: number) => `#${n}`,
  },
}

// ── Mascot ────────────────────────────────────────────────────
function Mascot({ streak, size = 80 }: { streak: number; size?: number }) {
  const [err, setErr] = useState(false)
  const src = streak >= 3
    ? '/icons/mascot-celebrating.svg'
    : '/icons/mascot-idle.svg'
  if (!err) return (
    <Image src={src} alt="" width={size} height={size}
      className="object-contain select-none pointer-events-none"
      style={{ width: size, height: size }}
      onError={() => setErr(true)} priority />
  )
  return <span style={{ fontSize: size * 0.6 }} className="select-none">🤖</span>
}

// ── Stat pill (top bar) ───────────────────────────────────────
function StatPill({
  icon, value, label, color,
}: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
      style={{ background: `${color}10`, borderColor: `${color}25` }}>
      <span className="text-lg leading-none select-none">{icon}</span>
      <div>
        <p className="font-fredoka text-base leading-none" style={{ color }}>{value}</p>
        <p className="text-[9px] font-black tracking-widest text-white/30 uppercase mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Weekly progress bar ───────────────────────────────────────
function WeekBar({ done, goal, label }: { done: number; goal: number; label: string }) {
  const pct = Math.min(100, Math.round((done / Math.max(goal, 1)) * 100))
  const segs = Array.from({ length: goal }, (_, i) => i < done)
  return (
    <div className="w-full">
      <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-2">{label}</p>
      <div className="flex gap-1.5">
        {segs.map((filled, i) => (
          <div key={i} className="flex-1 h-2 rounded-full transition-all duration-500"
            style={{ background: filled ? '#1CB0F6' : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
    </div>
  )
}

// ── Mission card — the dominant CTA ──────────────────────────
function MissionCard({
  lesson, isNew, href, streak, t,
}: {
  lesson: { id: string; title: string; emoji: string; xp_reward: number; skill_id: string }
  isNew: boolean
  href: string
  streak: number
  t: typeof UI.en
}) {
  return (
    <Link href={href}
      className="group relative block w-full rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
      style={{
        background: 'linear-gradient(145deg, #0f2744 0%, #0a1a2e 100%)',
        border: '2px solid rgba(28,176,246,0.35)',
        boxShadow: '0 0 32px rgba(28,176,246,0.15), 0 8px 32px rgba(0,0,0,0.4)',
      }}>

      {/* Top accent line */}
      <div className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #1CB0F6, #14D4F4, #2B70C9)' }} />

      <div className="p-6">
        {/* Eyebrow */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black tracking-[0.2em] text-[#1CB0F6] uppercase">
            {isNew ? t.newMission : t.mission}
          </span>
          <span className="text-xs font-black text-[#FAA918] bg-[#FAA918]/10 border border-[#FAA918]/20 px-2.5 py-1 rounded-full">
            +{lesson.xp_reward} XP
          </span>
        </div>

        {/* Content row */}
        <div className="flex items-center gap-5">
          {/* Mascot + emoji stacked */}
          <div className="relative flex-shrink-0">
            <Mascot streak={streak} size={72} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(28,176,246,0.2)', border: '1px solid rgba(28,176,246,0.3)' }}>
              {lesson.emoji}
            </div>
          </div>

          {/* Lesson title */}
          <div className="flex-1 min-w-0">
            <h2 className="font-fredoka text-2xl text-white leading-tight">
              {lesson.title}
            </h2>
            <p className="text-sm font-bold text-white/35 mt-1">
              {isNew ? t.start : t.continue} →
            </p>
          </div>
        </div>

        {/* Big CTA button */}
        <div className="mt-6 w-full py-4 rounded-2xl font-extrabold text-base text-center transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #1CB0F6 0%, #14D4F4 100%)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(28,176,246,0.3)',
            color: '#000',
          }}>
          {isNew ? `${t.start} →` : `${t.continue} →`}
        </div>
      </div>
    </Link>
  )
}

// ── Leaderboard entry ─────────────────────────────────────────
function LeaderRow({
  rank, name, xp, isYou,
}: { rank: number; name: string; xp: number; isYou?: boolean }) {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
      isYou ? 'border' : ''
    )}
      style={isYou ? { background: 'rgba(28,176,246,0.08)', borderColor: 'rgba(28,176,246,0.25)' } : {}}>
      <span className="w-6 text-center text-sm font-black"
        style={{ color: medals[rank] ? 'transparent' : 'rgba(255,255,255,0.25)' }}>
        {medals[rank] ?? rank}
      </span>
      <span className={cn('flex-1 text-sm font-bold truncate', isYou ? 'text-white' : 'text-white/60')}>
        {name}
      </span>
      <span className="text-xs font-black text-white/30">{xp.toLocaleString()}</span>
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
  leaderboard?:         { id: string; name: string; xp: number; rank_global: number | null }[]
}

// ─────────────────────────────────────────────────────────────
export default function DashboardClient({
  userId, profile, progress, lessonCompletions,
  todayChallenge, challengeCompletions,
  nextLesson, weeklyLessons = 0, weeklyGoal = 5,
  globalRank, leaderboard = [],
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast,     setToast]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const lang   = (profile?.preferred_language || 'en') as 'en' | 'ar' | 'fr'
  const dir    = lang === 'ar' ? 'rtl' : 'ltr'
  const t      = UI[lang] ?? UI.en
  const xp     = progress?.xp    ?? 0
  const streak = progress?.streak ?? 0
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

  // Merge current user into leaderboard for context
  const lbWithYou = leaderboard.slice(0, 5)

  return (
    <div dir={dir}
      className="min-h-screen text-[#F5F5F5]"
      style={{ background: '#0B0F14' }}>

      {/* ── Toast ──────────────────────────────────────────── */}
      <div className={cn(
        'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-sm',
        'transition-all duration-300 whitespace-nowrap pointer-events-none',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      )} style={{ background: '#1CB0F6', color: '#000', boxShadow: '0 8px 24px rgba(28,176,246,0.4)' }}>
        ⚡ {toast}
      </div>

      {/* ── STAT BAR — always visible, like Duolingo's top bar ── */}
      <div className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between gap-4"
        style={{ background: 'rgba(11,15,20,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Name */}
        <p className="font-fredoka text-base text-white/80 truncate flex-shrink-0">
          {profile.display_name}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <StatPill icon="🔥" value={streak} label={t.streak} color="#FAA918" />
          <StatPill icon="⭐" value={level}  label={t.level}  color="#1CB0F6" />
          <StatPill icon="⚡" value={xp >= 1000 ? `${(xp/1000).toFixed(1)}k` : xp} label={t.xp} color="#14D4F4" />
        </div>
      </div>

      {/* ── MAIN LAYOUT ───────────────────────────────────── */}
      <div className="flex gap-6 px-6 py-8 max-w-5xl mx-auto">

        {/* ── CENTER — mission + weekly bar + challenge ──── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Mission card */}
          {nextLesson ? (
            <MissionCard
              lesson={nextLesson}
              isNew={isNew}
              href={missionHref}
              streak={streak}
              t={t}
            />
          ) : (
            <div className="w-full rounded-3xl p-8 text-center border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-5xl mb-3">🏆</p>
              <p className="font-fredoka text-2xl text-white mb-1">{t.noMission}</p>
              <p className="text-sm text-white/30 font-semibold mb-5">{t.noMissionSub}</p>
              <Link href="/dashboard/skills"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm border transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                {t.explore} →
              </Link>
            </div>
          )}

          {/* Weekly progress — segmented like Duolingo's XP bar */}
          <div className="w-full px-5 py-4 rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <WeekBar done={weeklyLessons} goal={weeklyGoal} label={t.weeklyGoal(weeklyLessons, weeklyGoal)} />
          </div>

          {/* Daily challenge */}
          {todayChallenge && (
            <button onClick={!isChallengeComplete ? doChallenge : undefined}
              disabled={isChallengeComplete}
              className={cn(
                'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all',
                !isChallengeComplete && 'hover:border-[#FAA918]/40 active:scale-[0.99]'
              )}
              style={{
                background:  isChallengeComplete ? 'rgba(255,255,255,0.02)' : 'rgba(250,169,24,0.07)',
                borderColor: isChallengeComplete ? 'rgba(255,255,255,0.06)' : 'rgba(250,169,24,0.2)',
              }}>
              <span className="text-2xl flex-shrink-0 select-none">{todayChallenge.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-widest text-[#FAA918]/50 uppercase mb-0.5">
                  {t.sideQuest}
                </p>
                <p className={cn('text-sm font-bold truncate', isChallengeComplete ? 'line-through text-white/25' : 'text-white')}>
                  {todayChallenge.title}
                </p>
              </div>
              <span className="text-sm font-black flex-shrink-0"
                style={{ color: isChallengeComplete ? '#3CB371' : '#FAA918' }}>
                {isChallengeComplete ? t.claimed : `+${todayChallenge.xp_reward} XP`}
              </span>
            </button>
          )}
        </div>

        {/* ── RIGHT SIDEBAR — leaderboard (desktop only) ─── */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">

          {/* Leaderboard */}
          <div className="w-full rounded-2xl border overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-black tracking-widest text-white/40 uppercase">
                {t.leaderboard}
              </h3>
              <Link href="/dashboard/leaderboard"
                className="text-xs font-black text-[#1CB0F6] hover:text-white transition-colors">
                See all →
              </Link>
            </div>

            {/* Entries */}
            <div className="p-2 space-y-0.5">
              {lbWithYou.length > 0
                ? lbWithYou.map((entry) => (
                    <LeaderRow
                      key={entry.id}
                      rank={entry.rank_global ?? 99}
                      name={entry.id === userId ? (t.you) : entry.name}
                      xp={entry.xp}
                      isYou={entry.id === userId}
                    />
                  ))
                : (
                  <p className="text-xs text-white/20 font-semibold text-center py-4">
                    {lang === 'ar' ? 'لا يوجد بيانات بعد' : lang === 'fr' ? 'Pas encore de données' : 'No data yet'}
                  </p>
                )}
            </div>

            {/* Your rank if not in top 5 */}
            {globalRank != null && globalRank > 5 && (
              <div className="border-t px-2 pb-2 pt-1"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <LeaderRow
                  rank={globalRank}
                  name={t.you}
                  xp={xp}
                  isYou
                />
              </div>
            )}
          </div>

          {/* Quick nav links — like Duolingo's sidebar icons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/skills',      emoji: '🗺️', label: lang === 'ar' ? 'المسارات' : lang === 'fr' ? 'Pistes' : 'Skill Tree' },
              { href: '/dashboard/coach',        emoji: '🤖', label: lang === 'ar' ? 'المدرب'   : lang === 'fr' ? 'Coach'  : 'AI Coach'   },
              { href: '/dashboard/challenges',   emoji: '⚡', label: lang === 'ar' ? 'تحديات'   : lang === 'fr' ? 'Défis'  : 'Challenges' },
              { href: '/dashboard/leaderboard',  emoji: '🏆', label: lang === 'ar' ? 'المتصدرون': lang === 'fr' ? 'Classement' : 'Leaderboard' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center transition-all hover:border-white/20 hover:bg-white/4 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <span className="text-xl select-none">{link.emoji}</span>
                <span className="text-[10px] font-black tracking-wide text-white/35 uppercase">{link.label}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}