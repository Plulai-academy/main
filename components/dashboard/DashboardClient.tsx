'use client'
// components/dashboard/DashboardClient.tsx
// Light "Welcome back" concept — mint background, coral CTA, teal progress.
//
// CHANGE FROM PREVIOUS VERSION: added `className` prop (the student's
// class name, e.g. "Grade 5B") and folded it into the assignment pill
// alongside assignedBy/dueLabel. This was already being fetched
// server-side in page.tsx but had nowhere to go until now. Everything
// else is unchanged.

import { useState, useTransition } from 'react'
import Link from 'next/link'
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
    cta:          'Start lesson',
    ctaContinue:  (title: string) => `Continue ${title}`,
    noMission:    "You're all caught up!",
    noMissionSub: 'New lessons coming soon',
    explore:      'Explore tracks',
    level:        'Level',
    thisWeek:     'this week',
    classNews:    'Class news',
    noClassNews:  'No news yet — check back soon',
    dailyChallenge: 'Daily challenge',
    done:         'Done',
  },
  ar: {
    streakMsg:    (n: number) => n > 0 ? `${n} أيام متتالية — يوم آخر يحافظ عليها` : `ابدأ سلسلتك اليوم!`,
    continuing:   'من حيث توقفت أمس',
    cta:          'ابدأ الدرس',
    ctaContinue:  (title: string) => `واصل ${title}`,
    noMission:    'أكملت كل شيء!',
    noMissionSub: 'دروس جديدة قريباً',
    explore:      'استكشف',
    level:        'مستوى',
    thisWeek:     'هذا الأسبوع',
    classNews:    'أخبار الصف',
    noClassNews:  'لا أخبار بعد — تحقق لاحقاً',
    dailyChallenge: 'التحدي اليومي',
    done:         'تم',
  },
  fr: {
    streakMsg:    (n: number) => n > 0 ? `${n} jours de suite — encore un aujourd'hui !` : `Lance ta série aujourd'hui !`,
    continuing:   'là où tu t\'es arrêté hier',
    cta:          'Commencer',
    ctaContinue:  (title: string) => `Continuer ${title}`,
    noMission:    'Tout terminé !',
    noMissionSub: 'Nouvelles leçons bientôt',
    explore:      'Explorer',
    level:        'Niveau',
    thisWeek:     'cette semaine',
    classNews:    'Actualités',
    noClassNews:  'Pas encore d\'actualités',
    dailyChallenge: 'Défi du jour',
    done:         'Fait',
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

        {/* ── Header row ─────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[26px] font-extrabold text-[#16323A] leading-tight">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
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
            <p className="text-[#5B7B78] text-sm font-medium mt-1">
              {t.streakMsg(streak)}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: weeklyGoal }).map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: i < weeklyLessons ? '#F5A623' : '#D8E9E3' }}
                />
              ))}
            </div>
            <span className="text-[13px] font-mono text-[#7C9995] whitespace-nowrap">
              {weeklyLessons}/{weeklyGoal} {t.thisWeek}
            </span>
          </div>
        </div>

        {/* ── Main lesson card ──────────────────────────────── */}
        {nextLesson ? (
          <div className="bg-white rounded-3xl p-7 mb-5 shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            {assignmentPillParts.length > 0 && (
              <span className="inline-block px-3 py-1 rounded-full bg-[#FDECD8] text-[#D9822B] text-xs font-mono font-semibold mb-4">
                {assignmentPillParts.join(' · ')}
              </span>
            )}

            <h2 className="text-2xl font-extrabold text-[#16323A] mb-1.5 leading-snug">
              {nextLesson.title}
            </h2>
            <p className="text-[#7C9995] text-sm font-medium mb-6">
              {nextLesson.minutesLeft != null ? `${nextLesson.minutesLeft} min left · ` : ''}
              {t.continuing}
            </p>

            <Link
              href={missionHref}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-white text-[15px] transition-transform hover:-translate-y-0.5"
              style={{ background: '#FF6E52', boxShadow: '0 4px 14px rgba(255,110,82,0.35)' }}
            >
              {isNew ? t.cta : t.ctaContinue(nextLesson.title)}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 mb-5 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
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

        {/* ── Two-up cards: XP + Class news ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <p className="text-[#16323A] font-bold text-[15px] mb-3">
              {t.level} {level} · {xpInLevel} / {XP_PER_LEVEL} XP
            </p>
            <div className="h-2 w-full rounded-full bg-[#DCEFE9] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))}%`,
                  background: '#2DD4BF',
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <p className="text-[#16323A] font-bold text-[15px] mb-2">{t.classNews}</p>
            {classNews.length > 0 ? (
              <ul className="space-y-1.5">
                {classNews.slice(0, 2).map(n => (
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

        {/* ── Daily challenge — kept, quieter, third row ────── */}
        {todayChallenge && (
          <button
            onClick={!isChallengeComplete ? doChallenge : undefined}
            disabled={isChallengeComplete}
            className="mt-4 w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left bg-white shadow-[0_2px_16px_rgba(22,50,58,0.06)] transition-transform active:scale-[0.99]"
          >
            <span className="text-xl select-none flex-shrink-0">{todayChallenge.emoji}</span>
            <span className={cn(
              'flex-1 text-sm font-bold truncate',
              isChallengeComplete ? 'line-through text-[#B7CBC7]' : 'text-[#16323A]'
            )}>
              {todayChallenge.title}
            </span>
            <span
              className="text-xs font-extrabold flex-shrink-0"
              style={{ color: isChallengeComplete ? '#2DA36B' : '#FF6E52' }}
            >
              {isChallengeComplete ? `✓ ${t.done}` : `+${todayChallenge.xp_reward} XP`}
            </span>
          </button>
        )}

      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}
