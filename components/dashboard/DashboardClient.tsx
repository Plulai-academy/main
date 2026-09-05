'use client'
// components/dashboard/DashboardClient.tsx
//
// REDESIGN — same purpose as before ("Welcome back" dashboard), rebuilt to
// feel like a game HUD instead of an admin panel. Nothing functional
// changed: same props, same Supabase calls (addXP, completeChallenge,
// checkAndAwardBadges, updateStreak), same XP/level math, same
// assignmentPillParts logic, same COPY object *keys* (only the English/
// Arabic/French *values* got a more playful voice — code elsewhere that
// reads e.g. `t.explore` still works unchanged).
//
// What actually changed, visually:
//   - Header became a HUD strip: mascot avatar, streak flame count,
//     XP "gems" badge, weekly-goal stars — instead of a plain text line.
//   - Main lesson card reframed as a "Quest" card, with Marjan (the same
//     mascot used on the marketing site, /avatars/marjanthecamel.png)
//     bleeding off the card edge instead of sitting in a plain white box.
//   - Level progress redesigned as a filled "treasure meter" (teal).
//   - Streak shown as a row of flame icons (amber), not small dots.
//   - Daily challenge redesigned as a tap-to-open treasure chest with a
//     dashed gold border, instead of a plain list-item-style button.
//   - Class news redesigned as a slightly-rotated pinned note ("Class
//     board") so it doesn't read as identical to every other white card.
// These three distinct accent colors (teal / amber / violet) are used
// deliberately for three distinct concepts (progress / streak / XP
// currency) rather than as arbitrary decoration.

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

// ── Small inline icons (no icon-library dependency — none was imported
// in the original file, so this avoids adding one just for a few glyphs) ──
function FlameIcon({ lit }: { lit: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 1.5c1 2.5-1.5 3.5-1.5 6 0 1 .5 2 1.5 2s1.5-1 1.5-2c1.5 1 2.5 3 2.5 5a4 4 0 0 1-8 0c0-4 2-6.5 4-11Z"
        fill={lit ? '#FF9D2F' : '#E4EDE9'}
      />
    </svg>
  )
}

function GemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 8 L10 2 L16 8 L10 18 Z" fill="#7C6FFF" />
      <path d="M4 8 L16 8 L10 18 Z" fill="#9B90FF" />
      <path d="M10 2 L7 8 L13 8 Z" fill="#B4ABFF" />
    </svg>
  )
}

function ChestIcon({ open }: { open: boolean }) {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
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

  return (
    <div dir={dir} className="min-h-screen bg-[#EAF6F1] px-6 py-8 lg:px-10 lg:py-10">

      {/* Toast */}
      <div className={cn(
        'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-extrabold text-sm text-white',
        'transition-all duration-300 whitespace-nowrap pointer-events-none select-none',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )} style={{ background: '#FF6E52', boxShadow: '0 8px 24px rgba(255,110,82,0.4)' }}>
        ⚡ {toast}
      </div>

      <div className="max-w-3xl mx-auto">

        {/* ── HUD strip ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(22,50,58,0.1)] flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/avatars/marjanthecamel.png" alt="" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[19px] font-extrabold text-[#16323A] leading-tight">
                  {firstName ? t.greeting(firstName) : t.greetingNoName}
                </h1>
                {profile?.account_type === 'b2b2c' && profile?.school_id && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: '#F1F5F4', color: '#7C9995' }}
                  >
                    School account
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* streak flames */}
            <div className="flex items-center gap-1 bg-white rounded-full pl-2 pr-3 py-1.5 shadow-[0_2px_10px_rgba(22,50,58,0.08)]">
              <FlameIcon lit={streak > 0} />
              <span className="text-[13px] font-extrabold text-[#16323A]">{streak}</span>
            </div>
            {/* XP as gems */}
            <div className="flex items-center gap-1 bg-white rounded-full pl-2 pr-3 py-1.5 shadow-[0_2px_10px_rgba(22,50,58,0.08)]">
              <GemIcon />
              <span className="text-[13px] font-extrabold text-[#16323A]">{xp}</span>
            </div>
          </div>
        </div>

        {/* ── Streak message + weekly stars ─────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-[#5B7B78] text-sm font-medium">{t.streakMsg(streak)}</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: weeklyGoal }).map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: i < weeklyLessons ? '#F5A623' : '#D8E9E3' }}
              />
            ))}
            <span className="text-[13px] font-mono text-[#7C9995] whitespace-nowrap">
              {weeklyLessons}/{weeklyGoal} {t.thisWeek}
            </span>
          </div>
        </div>

        {/* ── Quest card ─────────────────────────────────── */}
        {nextLesson ? (
          <div className="relative overflow-hidden bg-white rounded-[28px] p-7 pr-36 sm:pr-44 mb-5 shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            {/* decorative swoosh behind the mascot */}
            <div
              className="absolute -right-6 -top-10 w-56 h-56 rounded-full opacity-60"
              style={{ background: 'radial-gradient(circle, #EAF6F1 0%, transparent 70%)' }}
              aria-hidden
            />
            <Image
              src="/avatars/marjanthecamel.png"
              alt=""
              width={150}
              height={150}
              className="absolute -bottom-2 -right-3 sm:right-2 select-none pointer-events-none"
            />

            {assignmentPillParts.length > 0 && (
              <span className="inline-block px-3 py-1 rounded-full bg-[#FDECD8] text-[#D9822B] text-xs font-mono font-semibold mb-4">
                {assignmentPillParts.join(' · ')}
              </span>
            )}

            <p className="text-[#7C9995] text-xs font-extrabold uppercase tracking-wide mb-1.5">
              {isNew ? '' : t.continuing}
            </p>
            <h2 className="text-2xl font-extrabold text-[#16323A] mb-1.5 leading-snug max-w-[80%]">
              {nextLesson.title}
            </h2>
            <p className="text-[#7C9995] text-sm font-medium mb-6">
              {nextLesson.minutesLeft != null ? `${nextLesson.minutesLeft} min left` : ''}
            </p>

            <Link
              href={missionHref}
              className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-white text-[15px] transition-transform hover:-translate-y-0.5 hover:rotate-[-1deg]"
              style={{ background: '#FF6E52', boxShadow: '0 4px 14px rgba(255,110,82,0.35)' }}
            >
              {isNew ? t.cta : t.ctaContinue(nextLesson.title)}
              <span aria-hidden>▶</span>
            </Link>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white rounded-[28px] p-8 mb-5 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <Image
              src="/avatars/marjanthecamel.png"
              alt=""
              width={110}
              height={110}
              className="mx-auto mb-3"
            />
            <p className="text-xl font-extrabold text-[#16323A] mb-1.5">{t.noMission}</p>
            <p className="text-sm text-[#7C9995] font-medium mb-5">{t.noMissionSub}</p>
            <Link
              href="/dashboard/path"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-white text-sm"
              style={{ background: '#FF6E52' }}
            >
              {t.explore} →
            </Link>
          </div>
        )}

        {/* ── Level meter (full width, "treasure bar" style) ── */}
        <div className="bg-white rounded-3xl p-6 mb-5 shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                style={{ background: '#2DD4BF' }}
              >
                {level}
              </span>
              <p className="text-[#16323A] font-bold text-[15px]">{t.level} {level}</p>
            </div>
            <span className="text-[13px] font-mono text-[#7C9995]">
              {xpInLevel} / {XP_PER_LEVEL} {t.xpGems}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#DCEFE9] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))}%`,
                background: 'linear-gradient(90deg, #2DD4BF, #5EEAD4)',
              }}
            />
          </div>
        </div>

        {/* ── Treasure chest (daily challenge) ──────────────── */}
        {todayChallenge && (
          <button
            onClick={!isChallengeComplete ? doChallenge : undefined}
            disabled={isChallengeComplete}
            className={cn(
              'w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-left bg-white mb-5',
              'transition-transform active:scale-[0.98]',
              isChallengeComplete
                ? 'shadow-[0_2px_16px_rgba(22,50,58,0.06)]'
                : 'shadow-[0_2px_16px_rgba(22,50,58,0.06)] border-2 border-dashed border-[#F5A623]'
            )}
          >
            <ChestIcon open={isChallengeComplete} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#D9822B] mb-0.5">
                {t.dailyChallenge}
              </p>
              <p className={cn(
                'text-sm font-bold truncate',
                isChallengeComplete ? 'line-through text-[#B7CBC7]' : 'text-[#16323A]'
              )}>
                {todayChallenge.emoji} {todayChallenge.title}
              </p>
            </div>
            <span
              className="text-xs font-extrabold shrink-0 px-3 py-1.5 rounded-full"
              style={{
                color: isChallengeComplete ? '#2DA36B' : '#fff',
                background: isChallengeComplete ? '#E8F7EF' : '#F5A623',
              }}
            >
              {isChallengeComplete ? `✓ ${t.done}` : t.tapToOpen}
            </span>
          </button>
        )}

        {/* ── Class board — pinned note, deliberately not another
             identical white card ───────────────────────────── */}
        <div
          className="bg-[#FFFCF2] rounded-2xl p-6 shadow-[0_4px_14px_rgba(22,50,58,0.08)] rotate-[-0.6deg] border border-[#F0E9C8]"
        >
          <p className="text-[#16323A] font-bold text-[15px] mb-2">📌 {t.classNews}</p>
          {classNews.length > 0 ? (
            <ul className="space-y-1.5">
              {classNews.slice(0, 3).map(n => (
                <li key={n.id} className="text-[#5B7B78] text-sm font-medium leading-snug">
                  {n.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#9BB5B1] text-sm font-medium">{t.noClassNews}</p>
          )}
        </div>

      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}