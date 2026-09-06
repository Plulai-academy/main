'use client'
// components/dashboard/DashboardClient.tsx
//
// REDESIGN v2 — a structural rethink, not another card recolor. v1 (the
// "quest card" version) was still fundamentally a vertical stack of
// rectangular cards. This version borrows the illustrated-path language
// from the marketing site's Tracks section (dashed connector + circular
// nodes) and applies it here: Quest, Treasure Chest, and Level become
// three connected map nodes instead of three separate stacked cards.
// Opening the dashboard should feel like standing on a small map, not
// scrolling an admin panel.
//
// Nothing functional changed from the original file: same props, same
// Supabase calls (addXP, completeChallenge, checkAndAwardBadges,
// updateStreak), same XP/level math, same assignmentPillParts logic,
// same COPY object keys.
//
// What changed, structurally:
//   - The "Quest" (next lesson), "Treasure chest" (daily challenge), and
//     "Level" (XP progress) are now three circular nodes connected by a
//     dashed path — reusing the exact visual grammar already established
//     on the marketing site, so the product and the marketing page speak
//     the same design language instead of two unrelated ones.
//   - Level progress is a circular SVG ring around the level number,
//     not a horizontal bar in its own card.
//   - The dashed connector hides below 760px (same technique used on
//     the marketing site) and the three nodes just wrap onto their own
//     rows — no fragile absolute-position layout on small screens.
//   - HUD strip (mascot, greeting, streak, gems) and the pinned Class
//     board stay largely as before — those weren't the problem, the
//     card stack in the middle was.

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
    continuing:   'Continue where you left off',
    cta:          'Start quest',
    ctaContinue:  'Continue quest',
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
    continuing:   'تابع من حيث توقفت',
    cta:          'ابدأ المهمة',
    ctaContinue:  'تابع المهمة',
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
    continuing:   'Continue là où tu t\'es arrêté',
    cta:          'Commencer la quête',
    ctaContinue:  'Continuer la quête',
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
  classNews?:     ClassNewsItem[]
  className?:     string | null
}

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

function ChestIcon({ open, size = 30 }: { open: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
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
  const levelProgress = xpInLevel / XP_PER_LEVEL
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

  const assignmentPillParts = [
    className,
    nextLesson?.assignedBy ? `Assigned by ${nextLesson.assignedBy}` : null,
    nextLesson?.dueLabel ? `Due ${nextLesson.dueLabel}` : null,
  ].filter(Boolean)

  // Ring math for the level node
  const ringR = 34
  const ringCircumference = 2 * Math.PI * ringR
  const ringOffset = ringCircumference * (1 - levelProgress)

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

      <style>{`
        @media (min-width: 760px) { .path-connector { display: block !important; } }
        .path-node { transition: transform .2s ease; }
        .path-node:hover { transform: translateY(-4px); }
      `}</style>

      <div className="max-w-3xl mx-auto">

        {/* ── HUD strip ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(22,50,58,0.1)] flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/avatars/marjanhi.png" alt="" width={40} height={40} className="object-contain" />
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
              <p className="text-[#5B7B78] text-sm font-medium mt-0.5">{t.streakMsg(streak)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-full pl-2 pr-3 py-1.5 shadow-[0_2px_10px_rgba(22,50,58,0.08)]">
              <FlameIcon lit={streak > 0} />
              <span className="text-[13px] font-extrabold text-[#16323A]">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-full pl-2 pr-3 py-1.5 shadow-[0_2px_10px_rgba(22,50,58,0.08)]">
              <GemIcon />
              <span className="text-[13px] font-extrabold text-[#16323A]">{xp}</span>
            </div>
          </div>
        </div>

        {/* ── THE PATH: three connected nodes instead of stacked cards ── */}
        <div className="relative mb-8" style={{ paddingTop: 8 }}>
          {/* dashed connector — hidden below 760px, same technique as the marketing site */}
          <svg
            className="path-connector"
            viewBox="0 0 600 100" preserveAspectRatio="none"
            style={{ position: 'absolute', top: 50, left: 0, width: '100%', height: 100, zIndex: 0, display: 'none' }}
            aria-hidden
          >
            <path
              d="M90 70 C 200 20, 320 20, 380 55 S 480 80, 520 30"
              stroke="#CFE3DC" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" fill="none"
            />
          </svg>

          <div className="relative z-10 flex flex-wrap items-start justify-center gap-8 sm:gap-10">

            {/* ── Node 1: Quest ── */}
            <Link href={missionHref} className="path-node flex flex-col items-center text-center w-[150px]">
              {assignmentPillParts.length > 0 && (
                <span className="mb-2 px-2.5 py-0.5 rounded-full bg-[#FDECD8] text-[#D9822B] text-[10px] font-mono font-semibold">
                  {assignmentPillParts.join(' · ')}
                </span>
              )}
              <div
                className="relative w-[104px] h-[104px] rounded-full flex items-center justify-center mb-3"
                style={{
                  background: nextLesson ? 'linear-gradient(135deg, #FF6E52, #FF8B6E)' : 'linear-gradient(135deg, #2DD4BF, #5EEAD4)',
                  boxShadow: nextLesson ? '0 10px 26px rgba(255,110,82,0.4)' : '0 10px 26px rgba(45,212,191,0.35)',
                }}
              >
                <span className="text-3xl select-none" aria-hidden>
                  {nextLesson ? (nextLesson.emoji || '🎯') : '✓'}
                </span>
                <Image
                  src="/avatars/marjanexcited.png"
                  alt=""
                  width={56}
                  height={56}
                  className="absolute -bottom-3 -right-4 select-none pointer-events-none"
                />
              </div>
              <p className="text-[15px] font-extrabold text-[#16323A] leading-snug line-clamp-2">
                {nextLesson ? nextLesson.title : t.noMission}
              </p>
              <p className="text-[12px] text-[#7C9995] font-medium mt-1">
                {nextLesson
                  ? (nextLesson.minutesLeft != null ? `${nextLesson.minutesLeft} min · ${isNew ? t.cta : t.ctaContinue}` : (isNew ? t.cta : t.ctaContinue))
                  : t.noMissionSub}
              </p>
            </Link>

            {/* ── Node 2: Treasure chest ── */}
            <button
              onClick={!isChallengeComplete ? doChallenge : undefined}
              disabled={!todayChallenge || isChallengeComplete}
              className={cn('path-node flex flex-col items-center text-center w-[120px]', !todayChallenge && 'opacity-40 pointer-events-none')}
            >
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center mb-3 bg-white',
                  !isChallengeComplete && 'border-2 border-dashed border-[#F5A623]'
                )}
                style={{ boxShadow: '0 8px 20px rgba(22,50,58,0.1)' }}
              >
                <ChestIcon open={isChallengeComplete} />
              </div>
              <p className="text-[13px] font-extrabold text-[#16323A]">{t.dailyChallenge}</p>
              <p className="text-[11px] font-bold mt-1" style={{ color: isChallengeComplete ? '#2DA36B' : '#D9822B' }}>
                {isChallengeComplete ? `✓ ${t.done}` : t.tapToOpen}
              </p>
            </button>

            {/* ── Node 3: Level ── */}
            <div className="path-node flex flex-col items-center text-center w-[120px]">
              <div className="relative w-20 h-20 mb-3">
                <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                  <circle cx="40" cy="40" r={ringR} fill="none" stroke="#DCEFE9" strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r={ringR} fill="none" stroke="#2DD4BF" strokeWidth="7"
                    strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-[#16323A]">{level}</span>
                </div>
              </div>
              <p className="text-[13px] font-extrabold text-[#16323A]">{t.level} {level}</p>
              <p className="text-[11px] text-[#7C9995] font-mono mt-1">{xpInLevel}/{XP_PER_LEVEL} {t.xpGems}</p>
            </div>
          </div>
        </div>

        {/* ── Weekly goal — small caption strip, not its own card ── */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {Array.from({ length: weeklyGoal }).map((_, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: i < weeklyLessons ? '#F5A623' : '#D8E9E3' }}
            />
          ))}
          <span className="text-[13px] font-mono text-[#7C9995] whitespace-nowrap ml-1">
            {weeklyLessons}/{weeklyGoal} {t.thisWeek}
          </span>
        </div>

        {/* ── Class board — pinned note, still deliberately different from the nodes above ── */}
        <div className="bg-[#FFFCF2] rounded-2xl p-6 shadow-[0_4px_14px_rgba(22,50,58,0.08)] rotate-[-0.6deg] border border-[#F0E9C8] max-w-md mx-auto">
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