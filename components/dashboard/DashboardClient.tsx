'use client'
// components/dashboard/DashboardClient.tsx
//
// REDESIGN v2 — same props, same Supabase calls (addXP, completeChallenge,
// checkAndAwardBadges, updateStreak), same XP/level math, same
// assignmentPillParts logic, same COPY keys (two new keys were ADDED:
// `toNext` and `minLeft`; nothing was renamed or removed).
//
// What changed visually:
//   - Two-column layout on desktop (quest + level on the left, a "progress"
//     column on the right); single column on phones. The mobile bottom nav
//     no longer covers the last card (extra bottom padding).
//   - The quest card is now the one dark, high-contrast element on the page
//     (dark teal, Marjan bleeding off the edge, coral start button), so the
//     next action is obvious.
//   - Streak + weekly goal are one "progress" card with a goal ring.
//   - Level meter shows how many gems are left until the next level.
//   - Treasure chest wiggles on hover and glows while it is unopened.
//   - RTL: left/right utilities were replaced with start/end ones, so the
//     layout mirrors correctly in Arabic.
// No font is set here, so everything inherits your app font.

import { useState, useTransition } from 'react'
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
    toNext:       (n: number) => `${n} gems to the next level`,
    minLeft:      (n: number) => `${n} min left`,
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
    toNext:       (n: number) => `${n} جوهرة للمستوى التالي`,
    minLeft:      (n: number) => `${n} دقيقة متبقية`,
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
    toNext:       (n: number) => `${n} gemmes avant le niveau suivant`,
    minLeft:      (n: number) => `${n} min restantes`,
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
}

/* ── Small inline icons (no icon-library dependency) ── */
function FlameIcon({ lit, size = 18 }: { lit: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 1.5c1 2.5-1.5 3.5-1.5 6 0 1 .5 2 1.5 2s1.5-1 1.5-2c1.5 1 2.5 3 2.5 5a4 4 0 0 1-8 0c0-4 2-6.5 4-11Z"
        fill={lit ? '#FF9D2F' : '#E4EDE9'}
      />
    </svg>
  )
}

function GemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 8 L10 2 L16 8 L10 18 Z" fill="#7C6FFF" />
      <path d="M4 8 L16 8 L10 18 Z" fill="#9B90FF" />
      <path d="M10 2 L7 8 L13 8 Z" fill="#B4ABFF" />
    </svg>
  )
}

function ChestIcon({ open }: { open: boolean }) {
  return (
    <svg width={44} height={44} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="4" y="18" width="32" height="16" rx="3" fill="#D9822B" />
      <rect x="4" y="18" width="32" height="6" rx="2" fill="#B4681D" />
      {open ? (
        <path d="M4 18 L10 8 H30 L36 18 Z" fill="#F5A623" />
      ) : (
        <rect x="4" y="14" width="32" height="6" rx="2" fill="#F5A623" />
      )}
      <circle cx="20" cy="24" r="3" fill="#7C4A16" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z" />
      <path d="M12 14v7" />
    </svg>
  )
}

const CARD = 'bg-white rounded-[28px] shadow-[0_2px_16px_rgba(22,50,58,0.06)] ring-1 ring-[#E1EEE9]'

export default function DashboardClient({
  userId, profile, progress, lessonCompletions,
  todayChallenge, challengeCompletions,
  nextLesson, weeklyLessons = 0, weeklyGoal = 5,
  classNews = [], className = null,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast,     setToast]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const lang   = (profile?.preferred_language || 'en') as 'en' | 'ar' | 'fr'
  const dir    = lang === 'ar' ? 'rtl' : 'ltr'
  const t      = COPY[lang] ?? COPY.en
  const xp     = progress?.xp     ?? 0
  const streak = progress?.streak ?? 0
  const level  = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL
  const isNew  = lessonCompletions.length === 0
  const firstName = (profile?.display_name ?? '').split(' ')[0] || profile?.display_name

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

  // Level meter + weekly goal ring (display math only)
  const levelPct = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))
  const gemsToNext = XP_PER_LEVEL - xpInLevel
  const goalPct = weeklyGoal > 0 ? Math.min(1, weeklyLessons / weeklyGoal) : 0
  const RING_R = 34
  const RING_C = 2 * Math.PI * RING_R

  return (
    <div dir={dir} className="min-h-screen bg-[#EAF6F1] px-5 pt-6 pb-28 sm:px-8 lg:px-10 lg:py-10">

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-extrabold text-sm text-white',
          'transition-all duration-300 whitespace-nowrap pointer-events-none select-none',
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
        style={{ background: '#FF6E52', boxShadow: '0 8px 24px rgba(255,110,82,0.4)' }}
      >
        ⚡ {toast}
      </div>

      <div className="mx-auto max-w-5xl">

        {/* ── HUD header ─────────────────────────────────── */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(22,50,58,0.1)] ring-1 ring-[#E1EEE9]">
              <Image src="/avatars/marjanhi.png" alt="" width={42} height={42} className="object-contain" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[21px] font-extrabold leading-tight text-[#16323A] sm:text-[24px]">
                {firstName ? t.greeting(firstName) : t.greetingNoName}
              </h1>
              {profile?.account_type === 'b2b2c' && profile?.school_id && (
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#7C9995] ring-1 ring-[#E1EEE9]">
                  School account
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pe-3 ps-2 shadow-[0_2px_10px_rgba(22,50,58,0.08)] ring-1 ring-[#E1EEE9]" title={t.streakMsg(streak)}>
              <FlameIcon lit={streak > 0} />
              <span className="text-[13px] font-extrabold tabular-nums text-[#16323A]">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pe-3 ps-2 shadow-[0_2px_10px_rgba(22,50,58,0.08)] ring-1 ring-[#E1EEE9]">
              <GemIcon />
              <span className="text-[13px] font-extrabold tabular-nums text-[#16323A]">{xp}</span>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">

          {/* ══════════ LEFT: quest + level ══════════ */}
          <div className="space-y-5">

            {nextLesson ? (
              <section className="relative overflow-hidden rounded-[32px] bg-[#16323A] p-7 pe-36 text-white shadow-[0_18px_40px_rgba(22,50,58,0.22)] sm:p-9 sm:pe-60">
                {/* glow + dotted texture */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -end-16 -top-24 h-80 w-80 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.32) 0%, transparent 65%)' }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: 'radial-gradient(#F6F3EA 1.2px, transparent 1.4px)', backgroundSize: '22px 22px' }}
                />
                <Image
                  src="/avatars/marjanexcited.png"
                  alt=""
                  width={190}
                  height={190}
                  className="pointer-events-none absolute -bottom-3 end-0 w-36 select-none sm:end-3 sm:w-48"
                />

                <div className="relative">
                  {assignmentPillParts.length > 0 && (
                    <span className="mb-4 inline-block rounded-full bg-[#F5A623] px-3 py-1 font-mono text-xs font-semibold text-[#402F12]">
                      {assignmentPillParts.join(' · ')}
                    </span>
                  )}

                  {!isNew && (
                    <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-[#7FD9CC]">
                      {t.continuing}
                    </p>
                  )}
                  <h2 className="mb-4 text-2xl font-extrabold leading-snug sm:text-[30px]">
                    {nextLesson.title}
                  </h2>

                  <div className="mb-7 flex flex-wrap items-center gap-2">
                    {nextLesson.minutesLeft != null && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold text-[#D8E9E3]">
                        {t.minLeft(nextLesson.minutesLeft)}
                      </span>
                    )}
                    {nextLesson.xp_reward != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold text-[#D8E9E3]">
                        <GemIcon size={14} /> +{nextLesson.xp_reward}
                      </span>
                    )}
                  </div>

                  <Link
                    href={missionHref}
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-[#FF6E52] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(255,110,82,0.4)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    {isNew ? t.cta : t.ctaContinue(nextLesson.title)}
                    <span aria-hidden className="rtl:rotate-180">▶</span>
                  </Link>
                </div>
              </section>
            ) : (
              <section className={cn(CARD, 'relative overflow-hidden p-8 text-center')}>
                <Image
                  src="/avatars/marjanexcited.png"
                  alt=""
                  width={120}
                  height={120}
                  className="mx-auto mb-3"
                />
                <p className="mb-1.5 text-xl font-extrabold text-[#16323A]">{t.noMission}</p>
                <p className="mb-5 text-sm font-medium text-[#7C9995]">{t.noMissionSub}</p>
                <Link
                  href="/dashboard/path"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6E52] px-6 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(255,110,82,0.35)] transition-transform hover:-translate-y-0.5"
                >
                  {t.explore} <span aria-hidden className="rtl:rotate-180">→</span>
                </Link>
              </section>
            )}

            {/* Level meter */}
            <section className={cn(CARD, 'p-6')}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-[#0D2B32] shadow-[0_6px_14px_rgba(45,212,191,0.35)]"
                    style={{ background: 'linear-gradient(135deg, #5EEAD4, #2DD4BF)' }}
                  >
                    {level}
                  </span>
                  <div>
                    <p className="text-[16px] font-extrabold text-[#16323A]">{t.level} {level}</p>
                    <p className="text-[12.5px] font-semibold text-[#7C9995]">{t.toNext(gemsToNext)}</p>
                  </div>
                </div>
                <span className="font-mono text-[13px] font-semibold tabular-nums text-[#7C9995]">
                  {xpInLevel} / {XP_PER_LEVEL} {t.xpGems}
                </span>
              </div>
              <div
                className="h-3.5 w-full overflow-hidden rounded-full bg-[#DCEFE9]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={XP_PER_LEVEL}
                aria-valuenow={xpInLevel}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, #2DD4BF, #5EEAD4)' }}
                />
              </div>
            </section>
          </div>

          {/* ══════════ RIGHT: progress, chest, board ══════════ */}
          <div className="space-y-5">

            {/* Streak + weekly goal */}
            <section className={cn(CARD, 'p-6')}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1DF]">
                  <FlameIcon lit={streak > 0} size={24} />
                </span>
                <p className="text-sm font-semibold leading-snug text-[#5B7B78]">{t.streakMsg(streak)}</p>
              </div>

              <div className="my-5 h-px bg-[#E4EDE9]" />

              <div className="flex items-center gap-4">
                <div className="relative h-[84px] w-[84px] shrink-0">
                  <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90" aria-hidden>
                    <circle cx="42" cy="42" r={RING_R} fill="none" stroke="#E8F1EE" strokeWidth="9" />
                    <circle
                      cx="42" cy="42" r={RING_R} fill="none" stroke="#F5A623" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={RING_C}
                      strokeDashoffset={RING_C * (1 - goalPct)}
                      style={{ transition: 'stroke-dashoffset .7s ease' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[17px] font-extrabold tabular-nums text-[#16323A]">
                    {weeklyLessons}/{weeklyGoal}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-[13.5px] font-bold text-[#16323A]">{t.thisWeek}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Array.from({ length: weeklyGoal }).map((_, i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: i < weeklyLessons ? '#F5A623' : '#D8E9E3' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Treasure chest (daily challenge) */}
            {todayChallenge && (
              <button
                onClick={!isChallengeComplete ? doChallenge : undefined}
                disabled={isChallengeComplete}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-[28px] bg-white px-5 py-4 text-start',
                  'transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]',
                  isChallengeComplete
                    ? 'shadow-[0_2px_16px_rgba(22,50,58,0.06)] ring-1 ring-[#E1EEE9]'
                    : 'border-2 border-dashed border-[#F5A623] shadow-[0_6px_22px_rgba(245,166,35,0.22)]'
                )}
              >
                <span className={cn('shrink-0 transition-transform', !isChallengeComplete && 'group-hover:-rotate-6 group-hover:scale-110')}>
                  <ChestIcon open={isChallengeComplete} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#D9822B]">
                    {t.dailyChallenge}
                  </p>
                  <p className={cn(
                    'truncate text-sm font-bold',
                    isChallengeComplete ? 'text-[#B7CBC7] line-through' : 'text-[#16323A]'
                  )}>
                    {todayChallenge.emoji} {todayChallenge.title}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold"
                  style={{
                    color: isChallengeComplete ? '#2DA36B' : '#fff',
                    background: isChallengeComplete ? '#E8F7EF' : '#F5A623',
                  }}
                >
                  {isChallengeComplete ? `✓ ${t.done}` : t.tapToOpen}
                </span>
              </button>
            )}

            {/* Class board — a pinned note, not another white card */}
            <section className="rounded-3xl border border-[#F0E9C8] bg-[#FFFCF2] p-6 shadow-[0_4px_14px_rgba(22,50,58,0.08)] lg:-rotate-[0.6deg]">
              <p className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-[#16323A]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FDECD8] text-[#D9822B]"><PinIcon /></span>
                {t.classNews}
              </p>
              {classNews.length > 0 ? (
                <ul className="space-y-2">
                  {classNews.slice(0, 3).map(n => (
                    <li key={n.id} className="text-sm font-medium leading-snug text-[#5B7B78]">
                      {n.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium text-[#9BB5B1]">{t.noClassNews}</p>
              )}
            </section>
          </div>
        </div>
      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}