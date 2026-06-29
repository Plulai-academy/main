'use client'
// components/dashboard/DashboardClient.tsx
//
// ONE SCREEN. ONE TAP. NO THINKING.
//
// Design principle: the home screen IS the action.
// The kid sees their mission, their streak, their rank.
// One button. One destination. Zero navigation required.

import { useState, useTransition } from 'react'
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
    streak:        (n: number) => n > 0 ? `${n}-day streak 🔥` : 'Start your streak today 🌱',
    noStreak:      'Open the app daily to build your streak',
    mission:       "Today's mission",
    missionNew:    'Your first lesson',
    tap:           'Start →',
    tapContinue:   'Continue →',
    tapDone:       'Keep going →',
    xpToday:       'XP today',
    rank:          'Rank',
    done:          'lessons done',
    challenge:     "Today's challenge",
    challengeDone: '✅ Done for today',
    weekGoal:      (done: number, goal: number) => `${done}/${goal} this week`,
    level:         'Level',
    noMission:     "You're all caught up! 🏆",
    noMissionSub:  'New content drops soon. Check the skill tree.',
    exploreCta:    'Explore tracks →',
  },
  ar: {
    streak:        (n: number) => n > 0 ? `${n} أيام متتالية 🔥` : 'ابدأ سلسلتك اليوم 🌱',
    noStreak:      'افتح التطبيق يومياً لبناء سلسلتك',
    mission:       'مهمة اليوم',
    missionNew:    'درسك الأول',
    tap:           'ابدأ →',
    tapContinue:   'استمر →',
    tapDone:       'واصل →',
    xpToday:       'XP اليوم',
    rank:          'الترتيب',
    done:          'درس مكتمل',
    challenge:     'تحدي اليوم',
    challengeDone: '✅ تم اليوم',
    weekGoal:      (done: number, goal: number) => `${done}/${goal} هذا الأسبوع`,
    level:         'المستوى',
    noMission:     '🏆 أكملت كل شيء!',
    noMissionSub:  'محتوى جديد قادم قريباً. تحقق من شجرة المهارات.',
    exploreCta:    'استكشف المسارات →',
  },
  fr: {
    streak:        (n: number) => n > 0 ? `${n} jours de suite 🔥` : 'Lance ta série aujourd\'hui 🌱',
    noStreak:      'Ouvre l\'app chaque jour pour construire ta série',
    mission:       'Ta mission du jour',
    missionNew:    'Ta première leçon',
    tap:           'Commencer →',
    tapContinue:   'Continuer →',
    tapDone:       'Avancer →',
    xpToday:       'XP aujourd\'hui',
    rank:          'Classement',
    done:          'leçons faites',
    challenge:     'Défi du jour',
    challengeDone: '✅ Défi terminé',
    weekGoal:      (done: number, goal: number) => `${done}/${goal} cette semaine`,
    level:         'Niveau',
    noMission:     '🏆 Tout terminé !',
    noMissionSub:  'Nouveau contenu arrive bientôt.',
    exploreCta:    'Explorer les pistes →',
  },
}

// ── XP ring — weekly progress at a glance ────────────────────
function WeekRing({
  done, goal, xp, lang,
}: { done: number; goal: number; xp: number; lang: string }) {
  const t       = (UI as any)[lang] ?? UI.en
  const pct     = Math.min(100, Math.round((done / Math.max(goal, 1)) * 100))
  const radius  = 44
  const circ    = 2 * Math.PI * radius
  const offset  = circ - (pct / 100) * circ
  const level   = getLevel(xp)
  const xpInLvl = xp % XP_PER_LEVEL
  const lvlPct  = Math.round((xpInLvl / XP_PER_LEVEL) * 100)

  return (
    <div className="flex items-center gap-4">
      {/* Ring */}
      <div className="relative w-[88px] h-[88px] flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Level ring (outer) */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="#1CB0F6" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (lvlPct / 100) * circ}
            className="transition-all duration-1000"
          />
          {/* Week ring (inner) */}
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="34" fill="none"
            stroke="#FAA918" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 34}
            strokeDashoffset={2 * Math.PI * 34 - (pct / 100) * 2 * Math.PI * 34}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-fredoka text-base text-white leading-none">{level}</span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wide">
            {(UI as any)[lang]?.level ?? 'Level'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1CB0F6] flex-shrink-0" />
          <span className="text-xs font-bold text-white/60">
            {t.level} {level} · {xpInLvl}/{XP_PER_LEVEL} XP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FAA918] flex-shrink-0" />
          <span className="text-xs font-bold text-white/60">
            {t.weekGoal(done, goal)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10 flex-shrink-0" />
          <span className="text-xs font-bold text-white/40">
            {xp.toLocaleString()} XP total
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Mascot ────────────────────────────────────────────────────
type MascotState = 'celebrating' | 'idle' | 'noStreak'
function Mascot({ state }: { state: MascotState }) {
  const [errored, setErrored] = useState(false)
  const src =
    state === 'celebrating' ? '/icons/mascot-celebrating.svg' :
    state === 'noStreak'    ? '/icons/mascot-nostreak.svg'    :
                              '/icons/mascot-idle.svg'

  if (!errored) return (
    <Image
      src={src} alt="" width={96} height={96}
      className={cn(
        'w-20 h-20 object-contain select-none pointer-events-none flex-shrink-0',
        state === 'celebrating' && 'animate-bounce'
      )}
      onError={() => setErrored(true)}
      priority
    />
  )

  // Emoji fallback
  const emoji = state === 'celebrating' ? '🎉' : state === 'noStreak' ? '😴' : '🤖'
  return <span className="text-5xl select-none">{emoji}</span>
}

// ── Mission card — THE dominant element ──────────────────────
// This is what the kid's eye lands on first. Big, clear, one tap.
function MissionCard({
  title, subtitle, emoji, href, ctaLabel, isNew, xpReward,
}: {
  title:     string
  subtitle?: string
  emoji:     string
  href:      string
  ctaLabel:  string
  isNew:     boolean
  xpReward?: number
}) {
  return (
    <Link
      href={href}
      className="group block w-full rounded-3xl overflow-hidden border-2 border-[#1CB0F6]/30 bg-gradient-to-br from-[#1CB0F6]/12 to-[#2B70C9]/8 hover:border-[#1CB0F6]/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1CB0F6]/15 transition-all active:translate-y-0"
    >
      <div className="flex items-center gap-4 p-5">
        {/* Lesson emoji / icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#1CB0F6]/20 border border-[#1CB0F6]/20 flex items-center justify-center text-3xl flex-shrink-0">
          {emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-base text-white leading-snug truncate">{title}</p>
          {subtitle && (
            <p className="text-xs font-semibold text-white/50 mt-0.5 truncate">{subtitle}</p>
          )}
          {xpReward && (
            <p className="text-xs font-extrabold text-[#FAA918] mt-1">+{xpReward} XP</p>
          )}
        </div>

        {/* CTA arrow */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1CB0F6] flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.25)] group-hover:-translate-y-0.5 group-hover:shadow-[0_5px_0_rgba(0,0,0,0.25)] transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/>
          </svg>
        </div>
      </div>

      {/* Bottom bar — visual progress cue */}
      {!isNew && (
        <div className="h-1 w-full bg-[#1CB0F6]/10">
          <div className="h-full bg-[#1CB0F6] w-[40%] rounded-full" />
        </div>
      )}
    </Link>
  )
}

// ── Daily challenge pill ──────────────────────────────────────
function ChallengePill({
  challenge, isDone, lang, onTap,
}: {
  challenge: any; isDone: boolean; lang: string; onTap: () => void
}) {
  const t = (UI as any)[lang] ?? UI.en
  return (
    <button
      onClick={!isDone ? onTap : undefined}
      disabled={isDone}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left',
        isDone
          ? 'border-white/6 bg-white/3 cursor-default'
          : 'border-[#FAA918]/30 bg-[#FAA918]/8 hover:bg-[#FAA918]/14 hover:border-[#FAA918]/50 active:scale-[0.98]'
      )}
    >
      <span className="text-xl flex-shrink-0">{challenge.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-extrabold truncate', isDone ? 'line-through text-white/30' : 'text-white')}>
          {challenge.title}
        </p>
        <p className={cn('text-xs font-bold mt-0.5', isDone ? 'text-[#3CB371]' : 'text-[#FAA918]')}>
          {isDone ? t.challengeDone : `+${challenge.xp_reward} XP`}
        </p>
      </div>
      {!isDone && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(250,169,24,0.7)">
          <path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/>
        </svg>
      )}
    </button>
  )
}

// ── Stat row — 3 numbers in one line ─────────────────────────
function StatRow({
  streak, rank, lessonsTotal, lang,
}: { streak: number; rank: number | null; lessonsTotal: number; lang: string }) {
  const t = (UI as any)[lang] ?? UI.en

  const stats = [
    { value: streak,                         label: '🔥',   sub: lang === 'ar' ? 'متتالية' : lang === 'fr' ? 'série' : 'streak',  color: '#FAA918' },
    { value: rank != null ? `#${rank}` : '—', label: '🏆',  sub: t.rank,   color: '#1CB0F6' },
    { value: lessonsTotal,                   label: '📚',   sub: t.done,   color: '#3CB371' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 bg-white/3 border border-white/6 rounded-2xl py-3 px-2"
        >
          <span className="text-xl leading-none">{s.label}</span>
          <span className="font-fredoka text-xl text-white leading-none">{s.value}</span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide">{s.sub}</span>
        </div>
      ))}
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
  // New props — pass from the server page
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
  const [isPending, startTransition] = useTransition()
  const [toast, setToast]           = useState<string | null>(null)
  const [shareCard, setShareCard]   = useState<ShareCardProps | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const lang   = (profile?.preferred_language || 'en') as 'en' | 'ar' | 'fr'
  const dir    = lang === 'ar' ? 'rtl' : 'ltr'
  const t      = UI[lang] ?? UI.en
  const xp     = progress?.xp     ?? 0
  const streak = progress?.streak  ?? 0
  const isNew  = lessonCompletions.length === 0

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
      router.refresh()
    })
  }

  const mascotState: MascotState =
    streak === 0    ? 'noStreak'    :
    weeklyLessons >= weeklyGoal ? 'celebrating' :
    'idle'

  // Mission destination
  const missionHref = nextLesson
    ? `/dashboard/skills/${nextLesson.skill_id}/lesson/${nextLesson.id}`
    : '/dashboard/skills'

  const ctaLabel = isNew ? t.tap : t.tapContinue

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col items-center justify-start px-6 pt-6 pb-10 text-[#F5F5F5] w-full max-w-2xl mx-auto"
    >

      {/* ── Toast ──────────────────────────────────────────── */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-5 py-3 rounded-2xl',
        'bg-card/95 backdrop-blur-sm border border-[#14D4F4]/40 text-[#14D4F4] font-bold text-sm shadow-xl',
        'transition-all duration-300',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        ⚡ {toast}
      </div>

      {/* ── TOP ROW: mascot + streak pill ─────────────────── */}
      <div className="w-full flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Mascot state={mascotState} />
          <div>
            <p className="font-fredoka text-lg text-white leading-tight">
              {lang === 'ar'
                ? `أهلاً ${profile.display_name}`
                : lang === 'fr'
                ? `Salut ${profile.display_name}`
                : `Hey ${profile.display_name}`}
            </p>
            <p className="text-xs font-bold text-white/40 mt-0.5">
              {streak > 0
                ? t.streak(streak)
                : (lang === 'ar' ? 'ابدأ سلسلتك اليوم' : lang === 'fr' ? "Lance ta série !" : 'Start your streak today')}
            </p>
          </div>
        </div>

        {/* XP badge */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-fredoka text-xl text-[#1CB0F6]">{xp.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">XP</span>
        </div>
      </div>

      {/* ── WEEK RING + STATS ─────────────────────────────── */}
<div className="w-full bg-white/3 border border-white/6 rounded-3xl p-4 mb-4">
  <WeekRing done={weeklyLessons} goal={weeklyGoal} xp={xp} lang={lang} />
</div>

{/* ── TWO COLUMN ON DESKTOP ─────────────────────────── */}
<div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

  {/* Left: Mission */}
  <div className="flex flex-col gap-3">
    <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">
      {isNew ? t.missionNew : t.mission}
    </p>
    {nextLesson ? (
      <MissionCard
        title={nextLesson.title}
        subtitle={isNew ? undefined : t.tapContinue}
        emoji={nextLesson.emoji}
        href={missionHref}
        ctaLabel={ctaLabel}
        isNew={isNew}
        xpReward={nextLesson.xp_reward}
      />
    ) : (
      <div className="w-full rounded-3xl border border-white/8 bg-white/3 p-6 text-center">
        <p className="font-fredoka text-xl mb-1">{t.noMission}</p>
        <p className="text-sm text-white/40 font-semibold mb-4">{t.noMissionSub}</p>
        <Link
          href="/dashboard/skills"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-white/8 border border-white/12 hover:bg-white/14 transition-all"
        >
          {t.exploreCta}
        </Link>
      </div>
    )}
  </div>

  {/* Right: Challenge + Stats */}
  <div className="flex flex-col gap-3">
    {todayChallenge && (
      <>
        <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest px-1">
          {t.challenge}
        </p>
        <ChallengePill
          challenge={todayChallenge}
          isDone={isChallengeComplete}
          lang={lang}
          onTap={doChallenge}
        />
      </>
    )}
    <StatRow
      streak={streak}
      rank={globalRank ?? null}
      lessonsTotal={lessonCompletions.length}
      lang={lang}
    />
  </div>

    </div>
    </div>
  )
}