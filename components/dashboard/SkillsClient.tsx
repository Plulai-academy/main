'use client'

// components/dashboard/SkillsClient.tsx
//
// REDESIGN v12 — "premium shell, playful only where it counts"
// ────────────────────────────────────────────────────────────
// This assumes the app's sidebar already exists elsewhere — this
// component is just the main content area of the page, built to sit
// next to it and actually look intentional on a wide screen instead of
// a mobile column stranded in the middle of a desktop viewport.
//
// Direction: premium/GCC-dashboard shell (Depth ink, Pearl white,
// Pearl gold), with the energetic palette (Reef, Coral, Sun gold)
// reserved for the handful of things a kid actually taps or watches
// move: the progress ring, the path status dots, and the Play button.
// Everything else — header, cards, typography, the rail — reads calm,
// grown-up, and spacious.
//
// Laws still in force:
//   • Hick's / isolation — Play is the only saturated, high-contrast
//     element on the page. Rail cards are quiet, single-purpose,
//     low-chroma.
//   • Fitts's Law — on a desktop viewport, "reachable" means large and
//     unmissable in the natural reading flow, not glued to a screen
//     edge — so Play sits inline in the hero, full height, easy target.
//   • Jakob's Law — padlock / checkmark / ring are unchanged; a
//     dashboard rail with quiet stat cards is itself a pattern from
//     every admin/analytics tool a parent or teacher already knows.
//   • Progressive disclosure — leaderboard and the weekly quest are
//     reduced to one quiet glance-card each in the rail, linking out.
//     Full detail lives on their own page, not competing here.

import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Play',
    lessonOf: 'Lesson',
    of: 'of',
    locked: 'Locked',
    completed: 'Completed',
    current: 'Up next',
    now: 'Now',
    allDone: 'World complete!',
    allDoneSub: "You've cleared every level here.",
    switching: 'Loading…',
    hello: 'Hello',
    subtitle: "Let's pick up where you left off.",
    streak: 'Day streak',
    level: 'Level',
    totalXp: 'Total XP',
    toNext: 'to next level',
    leaderboard: 'Leaderboard',
    rank: 'this week',
    viewBoard: 'View board',
    weeklyQuest: 'Weekly quest',
    claim: 'Claim',
  },

  ar: {
    play: 'العب',
    lessonOf: 'الدرس',
    of: 'من',
    locked: 'مقفل',
    completed: 'مكتمل',
    current: 'التالي',
    now: 'الآن',
    allDone: 'أنهيت هذا العالم! 🏆',
    allDoneSub: 'أكملت كل المستويات هنا.',
    switching: 'جارٍ التحميل…',
    hello: 'أهلاً',
    subtitle: 'يلا نكمل من وين وقفت.',
    streak: 'أيام متتالية',
    level: 'المستوى',
    totalXp: 'مجموع النقاط',
    toNext: 'للمستوى القادم',
    leaderboard: 'لوحة الصدارة',
    rank: 'هذا الأسبوع',
    viewBoard: 'عرض اللوحة',
    weeklyQuest: 'تحدي الأسبوع',
    claim: 'تحصيل',
  },

  fr: {
    play: 'Jouer',
    lessonOf: 'Leçon',
    of: 'sur',
    locked: 'Verrouillé',
    completed: 'Terminé',
    current: 'À suivre',
    now: 'Maintenant',
    allDone: 'Monde terminé !',
    allDoneSub: 'Tu as fini tous les niveaux ici.',
    switching: 'Chargement…',
    hello: 'Bonjour',
    subtitle: 'On continue où tu t’es arrêté.',
    streak: 'jours de suite',
    level: 'Niveau',
    totalXp: 'XP total',
    toNext: 'avant le niveau suivant',
    leaderboard: 'Classement',
    rank: 'cette semaine',
    viewBoard: 'Voir le classement',
    weeklyQuest: 'Défi de la semaine',
    claim: 'Réclamer',
  },
}

interface Track {
  id: string
  name: string
  emoji: string
  color: string
}

interface Skill {
  id: string
  track_id: string
  title: string
  emoji: string
  description: string
  xp_reward: number
  sort_order: number
  required_nodes: string[]
}

interface SkillProg {
  skill_node_id: string
  progress_pct: number
  completed_at: string | null
}

interface LeaderboardEntry {
  id: string
  rank_global: number | null
  name: string
  avatar_url: string | null
  xp: number
  is_current_user?: boolean
}

interface DailyQuest {
  label: string
  current: number
  target: number
}

interface DailyChallenge {
  id: string
  title: string
  emoji: string
  xp_reward: number
  completed: boolean
}

interface Props {
  userId: string
  tracks: Track[]
  initialTrackId: string | null
  skills: Skill[]
  skillProgress: SkillProg[]
  lessonCountMap: Record<string, number>
  language: string
  streak: number
  gems: number
  initialCurrentSkillId: string | null
  initialFirstIncompleteLessonId: string | null
  leaderboard?: LeaderboardEntry[]
  dailyQuest?: DailyQuest
  dailyChallenge?: DailyChallenge | null
  totalTimeMins?: number
  userName?: string
  characterImageUrl?: string
  mascotName?: string
  userTotalXp?: number
  heroBackgroundImageUrl?: string
}

// ── Brand tokens — the premium/luxury set drives the shell; the
// energetic set is used only where a kid is meant to look and tap.
const PAL = {
  // premium shell
  depth: '#0D2B32',
  depthSoft: '#153B44',
  pearlWhite: '#F6F3EA',
  pearlGold: '#D4A24C',
  pearlGoldSoft: '#E9CE9A',
  ink: '#29394A',
  inkSoft: '#5C7080',
  inkFaint: '#98A6B2',
  white: '#FFFFFF',
  hairline: 'rgba(41,57,74,0.10)',

  // energetic accents — reserved for interactive/progress moments
  reef: '#17D9C0',
  reefDeep: '#0EA294',
  gold: '#FFB930',

  // deeper gold for small text-on-white legibility
  goldDeepFallback: '#B9791A',

  coral: '#FF6B57',
  coralDeep: '#E24E3C',
  lagoonFill: '#EFF7F5',
}

function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*[—-]\s*/i, '').trim() || title
}

type IconKind =
  | 'lock'
  | 'check'
  | 'flame'
  | 'play'
  | 'chevronR'
  | 'star'
  | 'trophy'
  | 'gift'

function Icon({
  kind,
  className,
  style,
  strokeWidth = 2,
}: {
  kind: IconKind
  className?: string
  style?: React.CSSProperties
  strokeWidth?: number
}) {
  const filled = {
    className,
    style,
    fill: 'currentColor',
    viewBox: '0 0 24 24' as const,
  }

  const lined = {
    className,
    style,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24' as const,
  }

  switch (kind) {
    case 'lock':
      return (
        <svg {...lined}>
          <rect x="6" y="10.5" width="12" height="9" rx="2" />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        </svg>
      )

    case 'check':
      return (
        <svg {...filled}>
          <path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z" />
        </svg>
      )

    case 'flame':
      return (
        <svg {...filled}>
          <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z" />
        </svg>
      )

    case 'play':
      return (
        <svg {...filled}>
          <path d="M8 5v14l11-7L8 5Z" />
        </svg>
      )

    case 'star':
      return (
        <svg {...filled}>
          <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z" />
        </svg>
      )

    case 'chevronR':
      return (
        <svg {...lined}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      )

    case 'trophy':
      return (
        <svg {...lined}>
          <path d="M7 5h10v4a5 5 0 0 1-10 0V5Z" />
          <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5c0 2 1.5 3.2 3.3 3.4M17 6h2.5A1.5 1.5 0 0 1 21 7.5c0 2-1.5 3.2-3.3 3.4" />
          <path d="M12 14v3.5M9 20.5h6M9.8 17.5h4.4l.4 3H9.4z" />
        </svg>
      )

    case 'gift':
      return (
        <svg {...lined}>
          <rect x="4.5" y="9.5" width="15" height="10" rx="1.5" />
          <path d="M4.5 9.5h15M12 9.5v10" />
          <path d="M12 9.5c-1.2-3-3-4-4.3-3.2-1.3.8-.7 3.2 4.3 3.2Zm0 0c1.2-3 3-4 4.3-3.2 1.3.8.7 3.2-4.3 3.2Z" />
        </svg>
      )
  }
}

// ── Progress ring — the one interactive/playful shape on the page.
function ProgressRing({
  pct,
  size = 96,
  stroke = 8,
  emoji,
}: {
  pct: number
  size?: number
  stroke?: number
  emoji?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset =
    c - (Math.max(0, Math.min(100, pct)) / 100) * c

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={PAL.gold}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>

      {emoji && (
        <span className="absolute inset-0 flex items-center justify-center text-4xl">
          {emoji}
        </span>
      )}
    </div>
  )
}

// ── Page header — calm, spacious, one quiet stat cluster. No banners,
// no illustration, no mascot: this is the "grown-up dashboard" register.
function PageHeader({
  userName,
  t,
  activeTrack,
  tracks,
  showPicker,
  setShowPicker,
  pickerRef,
  onSelectTrack,
  activeTrackId,
}: {
  userName?: string
  t: Record<string, string>
  activeTrack: Track | null
  tracks: Track[]
  showPicker: boolean
  setShowPicker: (v: boolean | ((p: boolean) => boolean)) => void
  pickerRef: React.RefObject<HTMLDivElement>
  onSelectTrack: (id: string) => void
  activeTrackId: string | null
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1
          className="font-extrabold text-2xl sm:text-[28px] leading-tight"
          style={{ color: PAL.ink }}
        >
          {t.hello}
          {userName ? `, ${userName}` : ''}.
        </h1>

        <p
          className="text-sm font-medium mt-1"
          style={{ color: PAL.inkSoft }}
        >
          {t.subtitle}
        </p>
      </div>

      {activeTrack && (
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(v => !v)}
            aria-label="Switch track"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-white transition-colors hover:bg-[#F6F3EA]"
            style={{ border: `1px solid ${PAL.hairline}` }}
          >
            <span className="text-base">{activeTrack.emoji}</span>

            <span
              className="text-sm font-bold"
              style={{ color: PAL.ink }}
            >
              {activeTrack.name}
            </span>

            <Icon
              kind="chevronR"
              className="w-3.5 h-3.5 rotate-90"
              style={{ color: PAL.inkFaint }}
            />
          </button>

          {showPicker && (
            <div
              className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-2xl overflow-hidden z-30"
              style={{
                boxShadow: '0 12px 32px rgba(13,43,50,0.16)',
                border: `1px solid ${PAL.hairline}`,
              }}
            >
              {tracks.map(tr => (
                <button
                  key={tr.id}
                  onClick={() => onSelectTrack(tr.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    backgroundColor:
                      tr.id === activeTrackId
                        ? PAL.lagoonFill
                        : 'transparent',
                  }}
                >
                  <span>{tr.emoji}</span>

                  <span
                    className="flex-1 font-bold truncate text-sm"
                    style={{ color: PAL.ink }}
                  >
                    {tr.name}
                  </span>

                  {tr.id === activeTrackId && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: PAL.pearlGold }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Hero mission panel — the one dark, rich, "premium" surface on the
// page. Ring + Play button are the only saturated colors in it.
function MissionHero({
  skill,
  lessonIdx,
  lessonCount,
  pct,
  onPlay,
  t,
}: {
  skill: Skill
  lessonIdx: number
  lessonCount: number
  pct: number
  onPlay: () => void
  t: Record<string, string>
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-6 sm:p-8"
      style={{
        background: `linear-gradient(135deg, ${PAL.depth} 0%, ${PAL.depthSoft} 100%)`,
      }}
    >
      {/* quiet gold texture — a single soft glow + hairline, not a pattern
          that competes with the content */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <span
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            top: -140,
            right: -100,
            background: `radial-gradient(circle, ${PAL.pearlGold}22, transparent 70%)`,
          }}
        />

        <span
          className="absolute inset-0 rounded-[28px]"
          style={{
            boxShadow: `inset 0 0 0 1px ${PAL.pearlGold}33`,
          }}
        />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <ProgressRing pct={pct} emoji={skill.emoji} />

        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
            style={{
              color: PAL.pearlGoldSoft,
              letterSpacing: '0.08em',
            }}
          >
            {t.lessonOf} {lessonIdx} {t.of} {lessonCount || 1}
          </p>

          <h2
            className="font-extrabold text-2xl sm:text-3xl leading-tight"
            style={{ color: PAL.pearlWhite }}
          >
            {cleanTitle(skill.title)}
          </h2>

          <span
            className="inline-flex items-center gap-1 mt-3 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{
              backgroundColor: 'rgba(212,162,76,0.16)',
              color: PAL.pearlGoldSoft,
            }}
          >
            +{skill.xp_reward} XP
          </span>
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="sm:shrink-0 w-full sm:w-auto h-16 sm:px-9 rounded-2xl flex items-center justify-center gap-2.5 font-extrabold text-lg text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{
            backgroundColor: PAL.coral,
            boxShadow: `0 10px 24px rgba(255,107,87,0.35)`,
          }}
        >
          <Icon kind="play" className="w-5 h-5" />
          {t.play}
        </button>
      </div>
    </div>
  )
}

const PATH_WINDOW = 6

function PathNode({
  locked,
  complete,
  current,
  onClick,
  label,
}: {
  locked: boolean
  complete: boolean
  current: boolean
  onClick: () => void
  label: string
}) {
  const [shake, setShake] = useState(false)

  const handleClick = () => {
    if (locked) {
      setShake(true)
      window.setTimeout(() => setShake(false), 400)
      return
    }

    onClick()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={locked}
      aria-label={label}
      className={cn(
        'flex items-center justify-center transition-transform shrink-0',
        !locked && 'hover:-translate-y-0.5 active:translate-y-0'
      )}
      style={{
        width: current ? 56 : 46,
        height: current ? 56 : 46,
        borderRadius: '9999px',
        backgroundColor: complete
          ? PAL.reef
          : current
            ? PAL.white
            : PAL.pearlWhite,
        border: current
          ? `2.5px solid ${PAL.gold}`
          : `1.5px solid ${PAL.hairline}`,
        boxShadow: current
          ? `0 0 0 5px rgba(255,185,48,0.16), 0 6px 14px rgba(13,43,50,0.16)`
          : '0 1px 0 rgba(41,57,74,0.04)',
        animation: shake ? 'shakeX 0.4s ease' : undefined,
      }}
    >
      {locked ? (
        <Icon
          kind="lock"
          className="w-4 h-4"
          style={{ color: PAL.inkFaint }}
          strokeWidth={1.8}
        />
      ) : current ? (
        <Icon
          kind="star"
          className="w-5 h-5"
          style={{ color: PAL.gold }}
        />
      ) : complete ? (
        <Icon
          kind="check"
          className="w-4 h-4"
          style={{ color: PAL.white }}
        />
      ) : null}
    </button>
  )
}

// ── Path — a quiet, elegant row of status dots. Reef marks progress
// (the one place besides the ring where the energetic palette shows up);
// everything else is ink, pearl, and hairlines.
function PathStrip({
  skills,
  currentSkillId,
  isUnlockedFn,
  isCompleteFn,
  onTap,
  dir,
  t,
}: {
  skills: Skill[]
  currentSkillId: string | null
  isUnlockedFn: (s: Skill) => boolean
  isCompleteFn: (id: string) => boolean
  onTap: (s: Skill, unlocked: boolean) => void
  dir: 'ltr' | 'rtl'
  t: Record<string, string>
}) {
  const currentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [currentSkillId])

  return (
    <div
      className="rounded-[28px] bg-white p-5 sm:p-7 mt-5"
      style={{ border: `1px solid ${PAL.hairline}` }}
    >
      <p
        className="text-xs font-bold uppercase tracking-wider mb-5"
        style={{
          color: PAL.inkFaint,
          letterSpacing: '0.08em',
        }}
      >
        {t.leaderboard ? '' : ''}Your journey
      </p>

      <div className="no-scrollbar overflow-x-auto -mx-1 px-1">
        <div className="flex items-center gap-0" dir={dir}>
          {skills.map((s, i) => {
            const unlocked = isUnlockedFn(s)
            const complete = isCompleteFn(s.id)
            const isCurrent = s.id === currentSkillId

            return (
              <div
                key={s.id}
                className="flex items-center"
                ref={isCurrent ? currentRef : undefined}
              >
                <div
                  className="flex flex-col items-center gap-2"
                  style={{ width: 76 }}
                >
                  <PathNode
                    locked={!unlocked}
                    complete={complete}
                    current={isCurrent}
                    onClick={() => onTap(s, unlocked)}
                    label={
                      !unlocked
                        ? t.locked
                        : complete
                          ? t.completed
                          : isCurrent
                            ? t.current
                            : cleanTitle(s.title)
                    }
                  />

                  <span
                    className="text-[11px] font-bold"
                    style={{
                      color: isCurrent
                        ? PAL.goldDeepFallback
                        : PAL.inkFaint,
                    }}
                  >
                    {isCurrent ? t.now : ''}
                  </span>
                </div>

                {i < skills.length - 1 && (
                  <span
                    className="h-px w-8 sm:w-10 shrink-0"
                    style={{
                      backgroundColor: complete
                        ? PAL.reef
                        : PAL.hairline,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RailCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{ border: `1px solid ${PAL.hairline}` }}
    >
      {children}
    </div>
  )
}

function StreakLevelCard({
  streak,
  level,
  totalXp,
  xpIntoLevel,
  xpForLevel,
  t,
}: {
  streak: number
  level: number
  totalXp: number
  xpIntoLevel: number
  xpForLevel: number
  t: Record<string, string>
}) {
  const pct = Math.round((xpIntoLevel / xpForLevel) * 100)

  return (
    <RailCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: PAL.pearlWhite }}
          >
            <Icon
              kind="flame"
              className="w-4 h-4"
              style={{ color: PAL.coral }}
            />
          </span>

          <div>
            <p
              className="text-sm font-extrabold leading-none"
              style={{ color: PAL.ink }}
            >
              {streak}
            </p>

            <p
              className="text-[11px] font-bold mt-0.5"
              style={{ color: PAL.inkFaint }}
            >
              {t.streak}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p
            className="text-sm font-extrabold leading-none"
            style={{ color: PAL.ink }}
          >
            {t.level} {level}
          </p>

          <p
            className="text-[11px] font-bold mt-0.5"
            style={{ color: PAL.inkFaint }}
          >
            {totalXp.toLocaleString()} {t.totalXp}
          </p>
        </div>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: PAL.pearlWhite }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: PAL.pearlGold,
          }}
        />
      </div>

      <p
        className="text-[11px] font-semibold mt-2"
        style={{ color: PAL.inkFaint }}
      >
        {xpForLevel - xpIntoLevel} XP {t.toNext}
      </p>
    </RailCard>
  )
}

function LeaderboardTeaser({
  entries,
  t,
  onView,
}: {
  entries: LeaderboardEntry[]
  t: Record<string, string>
  onView: () => void
}) {
  const me = entries.find(e => e.is_current_user)
  const rank = me?.rank_global

  return (
    <button
      type="button"
      onClick={onView}
      className="w-full text-left rounded-2xl bg-white p-5 transition-colors hover:bg-[#FBFAF6]"
      style={{ border: `1px solid ${PAL.hairline}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: PAL.pearlWhite }}
        >
          <Icon
            kind="trophy"
            className="w-4.5 h-4.5"
            style={{ color: PAL.pearlGold }}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-extrabold"
            style={{ color: PAL.ink }}
          >
            {t.leaderboard}
          </p>

          <p
            className="text-[11px] font-bold"
            style={{ color: PAL.inkFaint }}
          >
            {rank ? `#${rank} ${t.rank}` : t.viewBoard}
          </p>
        </div>

        <Icon
          kind="chevronR"
          className="w-4 h-4 shrink-0"
          style={{ color: PAL.inkFaint }}
        />
      </div>
    </button>
  )
}

function QuestTeaser({
  quest,
  t,
}: {
  quest: DailyQuest
  t: Record<string, string>
}) {
  const pct =
    quest.target > 0
      ? Math.min(100, Math.round((quest.current / quest.target) * 100))
      : 0

  return (
    <RailCard>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: PAL.pearlWhite }}
        >
          <Icon
            kind="gift"
            className="w-4.5 h-4.5"
            style={{ color: PAL.reefDeep }}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-extrabold"
            style={{ color: PAL.ink }}
          >
            {t.weeklyQuest}
          </p>

          <p
            className="text-[11px] font-bold truncate"
            style={{ color: PAL.inkFaint }}
          >
            {quest.label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="h-1.5 rounded-full overflow-hidden flex-1"
          style={{ backgroundColor: PAL.pearlWhite }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              backgroundColor: PAL.reef,
            }}
          />
        </div>

        <span
          className="text-[11px] font-bold shrink-0"
          style={{ color: PAL.inkFaint }}
        >
          {quest.current}/{quest.target}
        </span>
      </div>
    </RailCard>
  )
}

export default function SkillsClient({
  tracks = [],
  initialTrackId,
  skills = [],
  skillProgress = [],
  lessonCountMap = {},
  language,
  streak = 0,
  initialCurrentSkillId,
  initialFirstIncompleteLessonId,
  leaderboard = [],
  dailyQuest,
  userName,
  userTotalXp,
}: Props) {
  const router = useRouter()

  const lang = (language || 'en') as 'en' | 'ar' | 'fr'
  const t = UI[lang] ?? UI.en
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const fontFamily =
    lang === 'ar'
      ? "'Almarai', sans-serif"
      : "'Plus Jakarta Sans', sans-serif"

  const [activeTrackId, setActiveTrackId] =
    useState<string | null>(initialTrackId)

  const [currentSkillId, setCurrentSkillId] =
    useState<string | null>(initialCurrentSkillId)

  const [firstIncompleteLessonId, setFirstIncompleteLessonId] =
    useState<string | null>(initialFirstIncompleteLessonId)

  const [showPicker, setShowPicker] = useState(false)
  const [switching, setSwitching] = useState(false)

  const pickerRef = useRef<HTMLDivElement | null>(null)

  const progressMap = useMemo(
    () =>
      Object.fromEntries(
        skillProgress.map(p => [
          p.skill_node_id,
          p.progress_pct,
        ])
      ),
    [skillProgress]
  )

  const orderedSkills = useMemo(
    () =>
      skills
        .filter(s => s.track_id === activeTrackId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrackId]
  )

  const isUnlocked = (skill: Skill) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every(
      r => (progressMap[r] ?? 0) >= 100
    )

  const isComplete = (id: string) =>
    (progressMap[id] ?? 0) >= 100

  const activeTrack =
    tracks.find(tr => tr.id === activeTrackId) ?? null

  const currentSkill =
    orderedSkills.find(s => s.id === currentSkillId) ?? null

  const allDone =
    orderedSkills.length > 0 &&
    orderedSkills.every(s => isComplete(s.id))

  const currentSkillIdx = currentSkill
    ? orderedSkills.findIndex(
        s => s.id === currentSkill.id
      )
    : -1

  const islandStart =
    currentSkillIdx >= 0
      ? Math.max(0, currentSkillIdx - 1)
      : 0

  const islandSkills = orderedSkills.slice(
    islandStart,
    islandStart + PATH_WINDOW
  )

  const leaderboardMe = leaderboard.find(
    e => e.is_current_user
  )

  const fallbackXp = useMemo(
    () =>
      skills.reduce(
        (sum, s) =>
          isComplete(s.id)
            ? sum + (s.xp_reward || 0)
            : sum,
        0
      ),
    [skills, progressMap]
  )

  const totalXp =
    userTotalXp ??
    leaderboardMe?.xp ??
    fallbackXp

  const XP_PER_LEVEL = 500

  const level =
    1 + Math.floor(totalXp / XP_PER_LEVEL)

  const xpIntoLevel =
    totalXp % XP_PER_LEVEL

  useEffect(() => {
    if (!showPicker) return

    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          e.target as Node
        )
      ) {
        setShowPicker(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handler
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handler
      )
  }, [showPicker])

  const handleTrackSelect = async (
    trackId: string
  ) => {
    if (trackId === activeTrackId) {
      setShowPicker(false)
      return
    }

    setShowPicker(false)
    setSwitching(true)
    setActiveTrackId(trackId)

    const saveResult =
      await setCurrentTrack(trackId)

    if (saveResult?.error) {
      console.error(
        'Failed to save current track:',
        saveResult.error
      )
    }

    try {
      const res = await fetch(
        '/api/path/resolve-track',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trackId }),
        }
      )

      const data = await res.json()

      setCurrentSkillId(
        data.skillId ?? null
      )

      setFirstIncompleteLessonId(
        data.lessonId ?? null
      )
    } catch {
      const trackSkills = skills
        .filter(s => s.track_id === trackId)
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order
        )

      const fallback =
        trackSkills.find(
          s =>
            isUnlocked(s) &&
            !isComplete(s.id)
        ) ??
        trackSkills[0] ??
        null

      setCurrentSkillId(
        fallback?.id ?? null
      )

      setFirstIncompleteLessonId(null)
    } finally {
      setSwitching(false)
    }
  }

  const goToCurrentLesson = () => {
    if (!currentSkill) return

    if (firstIncompleteLessonId) {
      router.push(
        `/dashboard/path/${currentSkill.id}/lesson/${firstIncompleteLessonId}`
      )
    } else {
      router.push(
        `/dashboard/path/${currentSkill.id}`
      )
    }
  }

  const handleCardTap = (
    skill: Skill,
    unlocked: boolean
  ) => {
    if (!unlocked) return

    if (skill.id === currentSkillId) {
      goToCurrentLesson()
    } else {
      router.push(
        `/dashboard/path/${skill.id}`
      )
    }
  }

  const currentLessonCount = currentSkill
    ? lessonCountMap[currentSkill.id] ?? 0
    : 0

  const currentProgressPct = currentSkill
    ? progressMap[currentSkill.id] ?? 0
    : 0

  const currentLessonIdx =
    currentLessonCount > 0
      ? Math.min(
          Math.round(
            (currentProgressPct / 100) *
              currentLessonCount
          ) + 1,
          currentLessonCount
        )
      : 1

  return (
    <div
      dir={dir}
      className="w-full min-h-screen"
      style={{
        backgroundColor: PAL.pearlWhite,
        color: PAL.ink,
        fontFamily,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Almarai:wght@400;700;800&display=swap');

            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }

            @keyframes shakeX {
              0%,100% {
                transform: translateX(0);
              }

              20% {
                transform: translateX(-5px);
              }

              40% {
                transform: translateX(5px);
              }

              60% {
                transform: translateX(-3px);
              }

              80% {
                transform: translateX(3px);
              }
            }
          `,
        }}
      />

      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-6 sm:py-9">
        <PageHeader
          userName={userName}
          t={t}
          activeTrack={activeTrack}
          tracks={tracks}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          pickerRef={pickerRef}
          onSelectTrack={handleTrackSelect}
          activeTrackId={activeTrackId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-6 sm:mt-8">
          <main className="min-w-0">
            {switching ? (
              <div
                className="flex items-center justify-center py-24 rounded-[28px] bg-white"
                style={{
                  border: `1px solid ${PAL.hairline}`,
                }}
              >
                <p
                  className="font-bold"
                  style={{ color: PAL.inkSoft }}
                >
                  {t.switching}
                </p>
              </div>
            ) : allDone ? (
              <div
                className="text-center py-20 rounded-[28px]"
                style={{
                  background: `linear-gradient(135deg, ${PAL.depth} 0%, ${PAL.depthSoft} 100%)`,
                }}
              >
                <p className="text-5xl sm:text-6xl mb-3">
                  🏆
                </p>

                <p
                  className="text-lg sm:text-xl font-extrabold"
                  style={{
                    color: PAL.pearlWhite,
                  }}
                >
                  {t.allDone}
                </p>

                <p
                  className="mt-2 font-semibold text-sm sm:text-base"
                  style={{
                    color: PAL.pearlGoldSoft,
                  }}
                >
                  {t.allDoneSub}
                </p>
              </div>
            ) : currentSkill ? (
              <>
                <MissionHero
                  skill={currentSkill}
                  lessonIdx={currentLessonIdx}
                  lessonCount={currentLessonCount}
                  pct={currentProgressPct}
                  onPlay={goToCurrentLesson}
                  t={t}
                />

                <PathStrip
                  skills={islandSkills}
                  currentSkillId={currentSkillId}
                  isUnlockedFn={isUnlocked}
                  isCompleteFn={isComplete}
                  onTap={handleCardTap}
                  dir={dir}
                  t={t}
                />
              </>
            ) : null}
          </main>

          <aside className="flex flex-col gap-4">
            <StreakLevelCard
              streak={streak}
              level={level}
              totalXp={totalXp}
              xpIntoLevel={xpIntoLevel}
              xpForLevel={XP_PER_LEVEL}
              t={t}
            />

            {dailyQuest && (
              <QuestTeaser
                quest={dailyQuest}
                t={t}
              />
            )}

            <LeaderboardTeaser
              entries={leaderboard}
              t={t}
              onView={() =>
                router.push(
                  '/dashboard/leaderboard'
                )
              }
            />
          </aside>
        </div>
      </div>
    </div>
  )
}