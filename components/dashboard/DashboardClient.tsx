'use client'
// components/dashboard/DashboardClient.tsx
//
// REDESIGN v3 — matches the reference mock (cream page, big teal mission
// card, level + streak cards on the right, "Explore your worlds" row).
//
// UNCHANGED: props, Supabase calls (addXP, completeChallenge,
// checkAndAwardBadges, updateStreak), XP/level math, assignmentPillParts,
// the daily-challenge flow, and every existing COPY key (new keys were
// only ADDED).
//
// ICONS: the 3D PNGs are read from /public/icons/ (game-gem, game-streak,
// game-level, game-trophy, game-ai-chip, game-robot, game-controller,
// game-rocket, game-laptop, game-graduation, nav-notifications). Change
// ICON_BASE if you keep them elsewhere.
//
// THINGS TO CHECK (marked CHECK below):
//  - WORLDS hrefs: all point to /dashboard/path until you have per-world pages.
//  - NOTIFICATIONS_HREF: the bell links here; set it to your real page.
//  - HERO_ART: the mock shows a boy + robot illustration; until you have
//    that artwork, Marjan (marjanexcited.png) is used.
//  - World cards use gradient + 3D icon; set `art` on a world to use a
//    scene illustration instead.
//  - The weekly streak row is derived from the streak count (we don't have
//    per-day data): the last N days up to today, within the current week.
// No font is set here, so everything inherits your app font.

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  addXP, completeChallenge, checkAndAwardBadges, updateStreak,
} from '@/lib/supabase/queries'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const ICON_BASE = '/icons'
const icon = (name: string) => `${ICON_BASE}/${name}.png`
const HERO_ART = '/avatars/marjanexcited.png'
const NOTIFICATIONS_HREF = '/dashboard/notifications' // CHECK

const COPY = {
  en: {
    streakMsg:    (n: number) => n > 0 ? `${n}-day streak — one more today keeps it alive` : `Start your streak today!`,
    continuing:   'where you left off yesterday',
    cta:          'Start quest',
    ctaContinue:  (title: string) => `Continue: ${title}`,
    noMission:    'Quest complete!',
    noMissionSub: 'New quests unlock soon',
    explore:      'Explore the map',
    level:        'Level',
    thisWeek:     'this week',
    classNews:    'Class board',
    noClassNews:  'Nothing pinned yet',
    dailyChallenge: 'Treasure chest',
    done:         'Opened',
    tapToOpen:    'Tap to open',
    xpGems:       'gems',
    greeting:     (name: string) => `Ready to play, ${name}?`,
    greetingNoName: 'Ready to play?',
    // added in v3
    headline:     'Ready to create?',
    subhead:      'Your next adventure starts here.',
    nextMission:  'Your next mission',
    startAdv:     'Start adventure',
    continueAdv:  'Continue adventure',
    yourLevel:    'Your level',
    dailyStreak:  'Daily streak',
    streakDays:   (n: number) => n === 1 ? '1 day' : `${n} days`,
    exploreWorlds:'Explore your worlds',
    minLeft:      (n: number) => `${n} min left`,
    notifications:'Notifications',
    days:         ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    worlds:       { ai: 'AI Universe', game: 'Game Lab', startup: 'Startup City' },
  },
  ar: {
    streakMsg:    (n: number) => n > 0 ? `${n} أيام متتالية — يوم آخر يحافظ عليها` : `ابدأ سلسلتك اليوم!`,
    continuing:   'من حيث توقفت أمس',
    cta:          'ابدأ المهمة',
    ctaContinue:  (title: string) => `تابع: ${title}`,
    noMission:    'أنجزت كل المهام!',
    noMissionSub: 'مهام جديدة تُفتح قريبًا',
    explore:      'استكشف الخريطة',
    level:        'مستوى',
    thisWeek:     'هذا الأسبوع',
    classNews:    'لوحة الصف',
    noClassNews:  'لا يوجد شيء مثبت بعد',
    dailyChallenge: 'صندوق الكنز',
    done:         'تم الفتح',
    tapToOpen:    'اضغط للفتح',
    xpGems:       'جوهرة',
    greeting:     (name: string) => `جاهز للعب يا ${name}؟`,
    greetingNoName: 'جاهز للعب؟',
    headline:     'جاهز للإبداع؟',
    subhead:      'مغامرتك القادمة تبدأ من هنا.',
    nextMission:  'مهمتك القادمة',
    startAdv:     'ابدأ المغامرة',
    continueAdv:  'تابع المغامرة',
    yourLevel:    'مستواك',
    dailyStreak:  'السلسلة اليومية',
    streakDays:   (n: number) => n === 1 ? 'يوم واحد' : `${n} أيام`,
    exploreWorlds:'استكشف عوالمك',
    minLeft:      (n: number) => `${n} دقيقة متبقية`,
    notifications:'الإشعارات',
    days:         ['إثن','ثلا','أرب','خمي','جمع','سبت','أحد'],
    worlds:       { ai: 'عالم الذكاء الاصطناعي', game: 'مختبر الألعاب', startup: 'مدينة الشركات الناشئة' },
  },
  fr: {
    streakMsg:    (n: number) => n > 0 ? `${n} jours de suite — encore un aujourd'hui !` : `Lance ta série aujourd'hui !`,
    continuing:   'là où tu t\'es arrêté hier',
    cta:          'Commencer la quête',
    ctaContinue:  (title: string) => `Continuer : ${title}`,
    noMission:    'Quête terminée !',
    noMissionSub: 'Nouvelles quêtes bientôt',
    explore:      'Explorer la carte',
    level:        'Niveau',
    thisWeek:     'cette semaine',
    classNews:    'Tableau de classe',
    noClassNews:  'Rien d\'épinglé pour l\'instant',
    dailyChallenge: 'Coffre au trésor',
    done:         'Ouvert',
    tapToOpen:    'Toucher pour ouvrir',
    xpGems:       'gemmes',
    greeting:     (name: string) => `Prêt à jouer, ${name} ?`,
    greetingNoName: 'Prêt à jouer ?',
    headline:     'Prêt à créer ?',
    subhead:      'Ta prochaine aventure commence ici.',
    nextMission:  'Ta prochaine mission',
    startAdv:     'Commencer l\'aventure',
    continueAdv:  'Continuer l\'aventure',
    yourLevel:    'Ton niveau',
    dailyStreak:  'Série quotidienne',
    streakDays:   (n: number) => n === 1 ? '1 jour' : `${n} jours`,
    exploreWorlds:'Explore tes mondes',
    minLeft:      (n: number) => `${n} min restantes`,
    notifications:'Notifications',
    days:         ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
    worlds:       { ai: 'Univers IA', game: 'Labo de jeux', startup: 'Ville des startups' },
  },
}

interface ClassNewsItem { id: string; text: string }

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
  nextLesson?: {
    id: string; title: string; emoji: string; xp_reward: number; skill_id: string
    assignedBy?: string; dueLabel?: string; minutesLeft?: number
  } | null
  weeklyLessons?: number
  weeklyGoal?:    number
  globalRank?:    number | null
  classNews?:     ClassNewsItem[]   // not yet wired to a table — pass in when ready
  className?:     string | null    // B2B2C only — e.g. "Grade 5B"
  notificationCount?: number       // shows the red dot on the bell when > 0
}

/* ── tiny pieces ── */
function Png({ name, size, className }: { name: string; size: number; className?: string }) {
  return <Image src={icon(name)} alt="" width={size} height={size} className={cn('object-contain', className)} />
}

function ChestIcon({ open }: { open: boolean }) {
  return (
    <svg width={44} height={44} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="4" y="18" width="32" height="16" rx="3" fill="#D9822B" />
      <rect x="4" y="18" width="32" height="6" rx="2" fill="#B4681D" />
      {open ? <path d="M4 18 L10 8 H30 L36 18 Z" fill="#F5A623" /> : <rect x="4" y="14" width="32" height="6" rx="2" fill="#F5A623" />}
      <circle cx="20" cy="24" r="3" fill="#7C4A16" />
    </svg>
  )
}

const Chevron = () => (
  <svg className="h-[18px] w-[18px] rtl:-scale-x-100" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 3l5 5-5 5" />
  </svg>
)

const CARD = 'rounded-[28px] bg-[#FFFCF7] shadow-[0_4px_20px_rgba(11,59,68,0.07)] ring-1 ring-[#F0E7DA]'

const WORLDS = [
  { key: 'ai',      href: '/dashboard/path', icon: 'game-ai-chip',    bg: 'linear-gradient(180deg,#8EDBF2 0%,#D4F5EC 100%)', chev: '#19B7A4', tint: '#DDF5F0', art: '' }, // CHECK hrefs
  { key: 'game',    href: '/dashboard/path', icon: 'game-controller', bg: 'linear-gradient(180deg,#FFC9A6 0%,#CDBDF7 100%)', chev: '#FF6B4F', tint: '#FFE6DD', art: '' },
  { key: 'startup', href: '/dashboard/path', icon: 'game-rocket',     bg: 'linear-gradient(180deg,#FFE3A3 0%,#A6DDF6 100%)', chev: '#E3A21A', tint: '#FFF0CC', art: '' },
] as const

export default function DashboardClient({
  userId, profile, progress, lessonCompletions,
  todayChallenge, challengeCompletions,
  nextLesson, weeklyLessons = 0, weeklyGoal = 5,
  classNews = [], className = null, notificationCount = 0,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast,     setToast]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const [today,     setToday]     = useState<number | null>(null) // Mon = 0 … Sun = 6, set after mount

  useEffect(() => { setToday((new Date().getDay() + 6) % 7) }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const lang   = (profile?.preferred_language || 'en') as 'en' | 'ar' | 'fr'
  const dir    = lang === 'ar' ? 'rtl' : 'ltr'
  const t      = COPY[lang] ?? COPY.en
  const xp     = progress?.xp     ?? 0
  const streak = progress?.streak ?? 0
  const level  = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL
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
    ? `/dashboard/path/${nextLesson.skill_id}/lesson/${nextLesson.id}`
    : '/dashboard/path'

  // Builds "Grade 5B · Assigned by Ms. Ranya · Due Aug 15" from
  // whichever of the three pieces are actually present.
  const assignmentPillParts = [
    className,
    nextLesson?.assignedBy ? `Assigned by ${nextLesson.assignedBy}` : null,
    nextLesson?.dueLabel ? `Due ${nextLesson.dueLabel}` : null,
  ].filter(Boolean)

  const levelPct = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))

  // Mission title: last word in gold, like the mock ("Become an AI Creator.")
  const words = (nextLesson?.title ?? '').trim().split(/\s+/)
  const titleHead = words.slice(0, -1).join(' ')
  const titleLast = words[words.length - 1] ?? ''

  const isDayDone = (i: number) => today !== null && streak > 0 && i <= today && i >= today - streak + 1

  const hasBoard = classNews.length > 0 || !!className

  return (
    <div dir={dir} className="min-h-screen bg-[#FBF5EC] px-5 pb-28 pt-6 sm:px-8 lg:px-10 lg:pb-10 lg:pt-8">

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed top-5 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-extrabold text-white',
          'pointer-events-none select-none transition-all duration-300',
          toast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        )}
        style={{ background: '#FF6B4F', boxShadow: '0 8px 24px rgba(255,107,79,0.4)' }}
      >
        ⚡ {toast}
      </div>

      <div className="mx-auto max-w-6xl">

        {/* ── Header ─────────────────────────────────────── */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/dashboard/profile"
              aria-label={profile?.display_name ?? 'Profile'}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_4px_14px_rgba(11,59,68,0.15)] ring-[3px] ring-white sm:h-[68px] sm:w-[68px]"
            >
              <Image
                src={profile?.avatar || '/avatars/marjanhi.png'}
                alt=""
                fill
                sizes="68px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-[24px] font-extrabold leading-tight text-[#0B3B44] sm:text-[34px]">{t.headline}</h1>
              <p className="truncate text-[14px] font-medium text-[#5E7F83] sm:text-[17px]">{t.subhead}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-1.5 rounded-full bg-[#FFFCF7] py-1.5 pe-3.5 ps-2.5 shadow-[0_3px_12px_rgba(11,59,68,0.08)] ring-1 ring-[#F0E7DA] sm:gap-2 sm:py-2 sm:pe-5"
              title={t.streakMsg(streak)}
            >
              <Png name="game-streak" size={28} className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="text-[15px] font-extrabold tabular-nums text-[#0B3B44] sm:text-[20px]">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#FFFCF7] py-1.5 pe-3.5 ps-2.5 shadow-[0_3px_12px_rgba(11,59,68,0.08)] ring-1 ring-[#F0E7DA] sm:gap-2 sm:py-2 sm:pe-5">
              <Png name="game-gem" size={30} className="h-6 w-6 sm:h-[30px] sm:w-[30px]" />
              <span className="text-[15px] font-extrabold tabular-nums text-[#0B3B44] sm:text-[20px]">{fmt(xp)}</span>
            </div>
            <Link
              href={NOTIFICATIONS_HREF}
              aria-label={t.notifications}
              className="relative hidden h-12 w-12 items-center justify-center rounded-full bg-[#FFFCF7] shadow-[0_3px_12px_rgba(11,59,68,0.08)] ring-1 ring-[#F0E7DA] sm:flex sm:h-[58px] sm:w-[58px]"
            >
              <Png name="nav-notifications" size={30} className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]" />
              {notificationCount > 0 && (
                <span className="absolute end-3 top-3 h-3 w-3 rounded-full bg-[#FF4B3E] ring-2 ring-[#FFFCF7]" />
              )}
            </Link>
          </div>
        </header>

        {/* ── Mission + side cards ───────────────────────── */}
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">

          {/* Mission card */}
          {nextLesson ? (
            <section className="relative min-h-[340px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0B5A62] via-[#0B4B55] to-[#093F49] p-7 pe-[42%] text-white shadow-[0_18px_40px_rgba(11,59,68,0.28)] sm:min-h-[400px] sm:p-10 sm:pe-[44%]">
              <div
                aria-hidden
                className="pointer-events-none absolute -end-10 top-0 h-full w-3/5"
                style={{ background: 'radial-gradient(circle at 60% 40%, rgba(45,212,191,0.28), transparent 65%)' }}
              />

              {/* artwork */}
              <Image
                src={HERO_ART}
                alt=""
                width={380}
                height={380}
                priority
                className="pointer-events-none absolute -bottom-2 end-0 w-[44%] max-w-[360px] select-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.3)] sm:end-2"
              />
              <Png name="game-robot" size={96} className="pointer-events-none absolute end-[3%] top-[6%] hidden h-20 w-20 sm:block lg:h-24 lg:w-24" />
              <Png name="game-laptop" size={96} className="pointer-events-none absolute bottom-[4%] end-[40%] hidden h-20 w-20 sm:block lg:h-24 lg:w-24" />

              <div className="relative">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-extrabold uppercase tracking-wide ring-1 ring-white/15 sm:text-[14px]" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" />
                  </svg>
                  {t.nextMission}
                </span>

                <h2 className="text-[30px] font-extrabold leading-[1.08] tracking-tight sm:text-[48px]">
                  {titleHead && <>{titleHead} </>}
                  <span className="relative inline-block italic text-[#FFC21A]">
                    {titleLast}
                    <svg className="absolute -bottom-2 start-0 w-full" viewBox="0 0 120 10" preserveAspectRatio="none" height={8} aria-hidden>
                      <path d="M2 7 C 30 2, 70 2, 118 5" stroke="#FFC21A" strokeWidth={3} fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                </h2>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {assignmentPillParts.length > 0 && (
                    <span className="rounded-full bg-[#FFC21A] px-3 py-1 font-mono text-xs font-semibold text-[#402F12]">
                      {assignmentPillParts.join(' · ')}
                    </span>
                  )}
                  {!isNew && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-bold text-[#CDE7E3]">{t.continuing}</span>
                  )}
                  {nextLesson.minutesLeft != null && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-bold text-[#CDE7E3]">{t.minLeft(nextLesson.minutesLeft)}</span>
                  )}
                  {nextLesson.xp_reward != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-bold text-[#CDE7E3]">
                      <Png name="game-gem" size={16} className="h-4 w-4" /> +{nextLesson.xp_reward}
                    </span>
                  )}
                </div>

                <Link
                  href={missionHref}
                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#FF6B4F] px-7 py-4 text-[16px] font-extrabold text-white shadow-[0_10px_24px_rgba(255,107,79,0.45)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:text-[18px]"
                >
                  {isNew ? t.startAdv : t.continueAdv}
                  <svg className="h-5 w-5 rtl:-scale-x-100" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 10h13M11 5l5 5-5 5" />
                  </svg>
                </Link>
              </div>
            </section>
          ) : (
            <section className={cn(CARD, 'flex flex-col items-center justify-center p-8 text-center')}>
              <Png name="game-trophy" size={120} className="mb-3 h-28 w-28" />
              <p className="mb-1.5 text-2xl font-extrabold text-[#0B3B44]">{t.noMission}</p>
              <p className="mb-6 text-[15px] font-medium text-[#5E7F83]">{t.noMissionSub}</p>
              <Link
                href="/dashboard/path"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF6B4F] px-7 py-3.5 text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(255,107,79,0.4)] transition-transform hover:-translate-y-0.5"
              >
                {t.explore} <span aria-hidden className="rtl:rotate-180">→</span>
              </Link>
            </section>
          )}

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* Level */}
            <section className={cn(CARD, 'p-5 sm:p-6')}>
              <div className="flex items-center gap-4">
                <Png name="game-level" size={72} className="h-[68px] w-[68px] shrink-0 sm:h-[76px] sm:w-[76px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-extrabold uppercase tracking-wide text-[#6F8E8B]">{t.yourLevel}</p>
                  <p className="text-[26px] font-extrabold leading-tight text-[#0B3B44] sm:text-[30px]">{t.level} {level}</p>
                </div>
                <span className="shrink-0 self-start pt-1 text-[13px] font-semibold tabular-nums text-[#6F8E8B] sm:text-[15px]">
                  {fmt(xpInLevel)} / {fmt(XP_PER_LEVEL)} XP
                </span>
              </div>
              <div
                className="mt-4 h-4 w-full overflow-hidden rounded-full bg-[#D3EDE8]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={XP_PER_LEVEL}
                aria-valuenow={xpInLevel}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, #14B8A6, #2DD4BF)' }}
                />
              </div>
            </section>

            {/* Daily streak */}
            <section className={cn(CARD, 'p-5 sm:p-6')}>
              <div className="flex items-center gap-4">
                <Png name="game-streak" size={64} className="h-[60px] w-[60px] shrink-0" />
                <div>
                  <p className="text-[12.5px] font-extrabold uppercase tracking-wide text-[#6F8E8B]">{t.dailyStreak}</p>
                  <p className="text-[26px] font-extrabold leading-tight text-[#FF6B4F] sm:text-[30px]">{t.streakDays(streak)}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
                {t.days.map((d, i) => {
                  const done = isDayDone(i)
                  return (
                    <div key={d} className="flex flex-col items-center gap-2">
                      <span className={cn('text-[12px] font-bold sm:text-[13.5px]', done ? 'text-[#0B3B44]' : 'text-[#8CA5A3]')}>{d}</span>
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10',
                          done ? 'bg-[#FF6B4F] shadow-[0_4px_10px_rgba(255,107,79,0.4)]' : 'bg-[#D8ECE8]'
                        )}
                        aria-label={done ? 'done' : undefined}
                      >
                        {done && (
                          <svg width={18} height={18} viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M4.5 10.5l4 4 7-8" />
                          </svg>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              <p className="mt-4 text-[12.5px] font-semibold text-[#6F8E8B]">
                {weeklyLessons}/{weeklyGoal} {t.thisWeek}
              </p>
            </section>

            {/* Daily challenge */}
            {todayChallenge && (
              <button
                onClick={!isChallengeComplete ? doChallenge : undefined}
                disabled={isChallengeComplete}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-[28px] bg-[#FFFCF7] px-5 py-4 text-start',
                  'transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]',
                  isChallengeComplete
                    ? 'shadow-[0_4px_20px_rgba(11,59,68,0.07)] ring-1 ring-[#F0E7DA]'
                    : 'border-2 border-dashed border-[#F5A623] shadow-[0_6px_22px_rgba(245,166,35,0.22)]'
                )}
              >
                <span className={cn('shrink-0 transition-transform', !isChallengeComplete && 'group-hover:-rotate-6 group-hover:scale-110')}>
                  <ChestIcon open={isChallengeComplete} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#D9822B]">{t.dailyChallenge}</p>
                  <p className={cn('truncate text-sm font-bold', isChallengeComplete ? 'text-[#B7CBC7] line-through' : 'text-[#0B3B44]')}>
                    {todayChallenge.emoji} {todayChallenge.title}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold"
                  style={{ color: isChallengeComplete ? '#2DA36B' : '#fff', background: isChallengeComplete ? '#E8F7EF' : '#F5A623' }}
                >
                  {isChallengeComplete ? `✓ ${t.done}` : t.tapToOpen}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Explore your worlds ────────────────────────── */}
        <section className="mt-9" aria-labelledby="worlds-title">
          <h2 id="worlds-title" className="mb-5 flex items-center gap-3 text-[24px] font-extrabold text-[#0B3B44] sm:text-[28px]">
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#E3A21A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9.5" />
              <path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#E3A21A" stroke="none" />
            </svg>
            {t.exploreWorlds}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORLDS.map(w => (
              <Link
                key={w.key}
                href={w.href}
                className="group relative block overflow-hidden rounded-[28px] shadow-[0_6px_22px_rgba(11,59,68,0.1)] ring-1 ring-[#F0E7DA] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
              >
                <div className="relative h-44 sm:h-48" style={{ background: w.bg }}>
                  {w.art ? (
                    <Image src={w.art} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <>
                      <span aria-hidden className="absolute start-[8%] top-[18%] h-10 w-24 rounded-full bg-white/60 blur-[2px]" />
                      <span aria-hidden className="absolute end-[10%] top-[34%] h-8 w-20 rounded-full bg-white/50 blur-[2px]" />
                      <Png name={w.icon} size={150} className="absolute inset-x-0 top-3 mx-auto h-32 w-32 drop-shadow-[0_14px_20px_rgba(11,59,68,0.28)] transition-transform duration-300 group-hover:scale-110 sm:h-36 sm:w-36" />
                    </>
                  )}
                </div>
                <div className="relative -mt-5 flex items-center gap-3 rounded-[24px] bg-[#FFFCF7] px-4 py-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: w.tint }}>
                    <Png name={w.icon} size={32} className="h-8 w-8" />
                  </span>
                  <span className="flex-1 truncate text-[19px] font-extrabold text-[#0B3B44]">{t.worlds[w.key]}</span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" style={{ background: w.chev }}>
                    <Chevron />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Class board (only when there is something to show) ── */}
        {hasBoard && (
          <section className={cn(CARD, 'mt-7 flex items-start gap-4 p-6')}>
            <Png name="game-graduation" size={56} className="h-14 w-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-[17px] font-extrabold text-[#0B3B44]">
                {t.classNews}{className ? ` · ${className}` : ''}
              </p>
              {classNews.length > 0 ? (
                <ul className="space-y-1.5">
                  {classNews.slice(0, 3).map(n => (
                    <li key={n.id} className="text-sm font-medium leading-snug text-[#4F7276]">{n.text}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium text-[#8CA5A3]">{t.noClassNews}</p>
              )}
            </div>
          </section>
        )}
      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}