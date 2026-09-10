'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v4 — layout change
// ────────────────────────────
// v3 used a static grid of tiles, which meant juggling column counts per
// breakpoint. This version replaces that with horizontally snap-scrolling
// "level rows" — one row per unit, cards sized for a thumb swipe, closer to
// how mobile games present a level-select screen (and it sidesteps the
// column-count problem entirely: a horizontal strip just works at any
// viewport width without breakpoint math).
//
// Everything else (palette, skill emoji as the tile art, xp coin badges,
// streak/coins header, continue card, sidebar widgets) carries over from v3.
// All props, hooks, and routing logic are unchanged from the original.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Play', continuePlaying: 'Continue playing', jumpTag: 'PLAY',
    lessonOf: 'Lesson', of: 'of', streakDays: 'day streak', coins: 'Coins',
    locked: 'Locked', completed: 'Completed', current: 'Up next', lesson: 'lesson', lessons: 'lessons',
    allDone: 'World complete!', allDoneSub: "You've cleared every level here.",
    switching: 'Loading…', back: 'Back',
    leaderboard: 'Leaderboard', viewAll: 'See all', you: 'You',
    dailyQuests: 'Weekly quest', dailyChallenges: 'Daily challenge',
    challengeDone: 'Claimed 🎉', challengeCheck: 'Claim reward',
    unit: 'Unit', of_x_done: 'done',
    pearls: 'Pearls', levelsToNext: 'more levels to', maxRank: "You've reached the top rank!",
    unitComplete: 'Unit complete!',
  },
  ar: {
    play: 'العب', continuePlaying: 'كمّل من وين وقفت', jumpTag: 'العب',
    lessonOf: 'الدرس', of: 'من', streakDays: 'أيام متتالية', coins: 'رصيدك',
    locked: 'مقفل', completed: 'مكتمل', current: 'التالي', lesson: 'درس', lessons: 'دروس',
    allDone: 'أنهيت هذا العالم! 🏆', allDoneSub: 'أكملت كل المستويات هنا.',
    switching: 'جارٍ التحميل…', back: 'رجوع',
    leaderboard: 'لوحة الصدارة', viewAll: 'عرض الكل', you: 'أنت',
    dailyQuests: 'تحدي الأسبوع', dailyChallenges: 'تحدي اليوم',
    challengeDone: 'تم التحصيل 🎉', challengeCheck: 'تحصيل المكافأة',
    unit: 'الوحدة', of_x_done: 'مكتملة',
    pearls: 'اللآلئ', levelsToNext: 'مستويات أخرى للوصول إلى', maxRank: 'وصلت لأعلى رتبة! 👑',
    unitComplete: 'أنهيت الوحدة!',
  },
  fr: {
    play: 'Jouer', continuePlaying: 'Continuer', jumpTag: 'JOUER',
    lessonOf: 'Leçon', of: 'sur', streakDays: 'jours de suite', coins: 'Pièces',
    locked: 'Verrouillé', completed: 'Terminé', current: 'À suivre', lesson: 'leçon', lessons: 'leçons',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as fini tous les niveaux ici.',
    switching: 'Chargement…', back: 'Retour',
    leaderboard: 'Classement', viewAll: 'Tout voir', you: 'Toi',
    dailyQuests: 'Défi de la semaine', dailyChallenges: 'Défi du jour',
    challengeDone: 'Réclamé 🎉', challengeCheck: 'Réclamer',
    unit: 'Unité', of_x_done: 'faits',
    pearls: 'Perles', levelsToNext: 'niveaux de plus pour atteindre', maxRank: 'Tu as atteint le rang suprême ! 👑',
    unitComplete: 'Unité terminée !',
  },
}

const UNIT_SIZE = 4

// Rank titles for the reef, one per tier (0 = just started, 4 = maxed out),
// driven purely by how many levels in the current track are complete —
// no new data needed, it's all already in `skillProgress`.
const RANKS: Record<string, string[]> = {
  en: ['Tide Pool Explorer', 'Shallow Reef Starter', 'Coral Garden Keeper', 'Reef Kingdom Guardian', 'Ocean Legend'],
  ar: ['مستكشف البرك الساحلية', 'بادئ الشعاب الضحلة', 'حارس حديقة المرجان', 'حامي مملكة الشعاب', 'أسطورة المحيط'],
  fr: ['Explorateur de flaques', 'Débutant du lagon', 'Gardien du jardin corallien', 'Gardien du récif', "Légende de l'océan"],
}
const TIER_BOUNDARIES = [20, 40, 60, 80] // % complete needed to reach tier 1,2,3,4

interface Track    { id: string; name: string; emoji: string; color: string }
interface Skill    { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg{ skill_node_id: string; progress_pct: number; completed_at: string | null }

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
}

// ── Energetic-mode palette ──────────────────────────────────────────────
const PAL = {
  lagoon: '#EAF7F4',
  lagoonFill: '#D9F1EC',
  reef: '#17D9C0',
  reefDeep: '#0FA893',
  gold: '#FFB930',
  goldDeep: '#DB9410',
  coral: '#FF6B57',
  coralDeep: '#E24E3C',
  ink: '#29394A',
  inkSoft: '#5C7080',
  white: '#FFFFFF',
}

const TILE_COLORS = [
  { top: PAL.reef, deep: PAL.reefDeep },
  { top: PAL.gold, deep: PAL.goldDeep },
  { top: PAL.coral, deep: PAL.coralDeep },
]

function colorForIndex(i: number) { return TILE_COLORS[i % TILE_COLORS.length] }

type IconKind = 'lock' | 'check' | 'flame' | 'gem' | 'play' | 'coin' | 'chevronR' | 'chevronL' | 'pearl'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z"/></svg>
    case 'gem':
      return <svg {...common}><path d="M6 4h12l3 5-9 11L3 9l3-5Zm1.8 2L5.5 9h4.9L7.8 6Zm3.4 0-2.4 3h6.4l-2.4-3h-1.6Zm3.4 0-2.3 3h4.9L14.6 6ZM6.2 11l4.9 7-4-7h-.9Zm11.6 0h-.9l-4 7 4.9-7ZM9.4 11l2.6 6.5L14.6 11H9.4Z"/></svg>
    case 'play':
      return <svg {...common}><path d="M8 5v14l11-7L8 5Z"/></svg>
    case 'coin':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1 1-1.7 3-1.7s3 .7 3 1.6-1 1.4-3 1.6-3 .7-3 1.7 1 1.8 3 1.8 3-.6 3-1.6" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>
    case 'chevronR':
      return <svg {...common}><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'chevronL':
      return <svg {...common}><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'pearl':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="currentColor"/>
          <ellipse cx="9" cy="9" rx="2.6" ry="1.6" fill="#FFFFFF" opacity="0.75" transform="rotate(-30 9 9)"/>
        </svg>
      )
  }
}

function ProgressBar({ pct, track = PAL.lagoonFill, fill }: { pct: number; track?: string; fill: string }) {
  return (
    <div className="h-1.5 sm:h-2 rounded-full overflow-hidden w-full" style={{ backgroundColor: track }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, pct)}%`, backgroundColor: fill }} />
    </div>
  )
}

function XpBadge({ xp, tone = 'light' }: { xp: number; tone?: 'light' | 'dark' }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black shrink-0"
      style={{ backgroundColor: tone === 'light' ? 'rgba(255,255,255,0.9)' : PAL.lagoon, color: PAL.goldDeep }}
    >
      <Icon kind="coin" className="w-3 h-3" style={{ color: PAL.gold }} />
      +{xp}
    </span>
  )
}

function StreakPill({ streak, t }: { streak: number; t: Record<string, string> }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ backgroundColor: PAL.coral }}>
      <Icon kind="flame" className="w-5 h-5 shrink-0" style={{ color: PAL.white }} />
      <div className="min-w-0 leading-none">
        <span className="font-black text-white text-lg sm:text-xl">{streak}</span>
        <span className="text-white/85 font-bold text-[10px] sm:text-[11px] block truncate">{t.streakDays}</span>
      </div>
    </div>
  )
}

function PearlsPill({ gems, t }: { gems: number; t: Record<string, string> }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ backgroundColor: PAL.ink }}>
      <Icon kind="pearl" className="w-5 h-5 shrink-0" style={{ color: PAL.gold }} />
      <div className="min-w-0 leading-none">
        <span className="font-black text-white text-lg sm:text-xl">{gems}</span>
        <span className="text-white/70 font-bold text-[10px] sm:text-[11px] block truncate">{t.pearls}</span>
      </div>
    </div>
  )
}

// ── The Reef ─────────────────────────────────────────────────────────────
// A living scene that fills in with coral and fish as the student clears
// levels in this track. Five visual tiers, purely a function of % complete
// — no extra data needed. This replaces a countdown-style mechanic (which
// creates pressure) with a growth-style one (which creates pride and an
// urge to check back in and see how much bigger it's gotten).
function ReefScene({ tier }: { tier: number }) {
  // cumulative coral clusters — each tier adds to, never replaces, the last
  const corals: { x: number; y: number; r: number; c: string }[] = [
    { x: 100, y: 128, r: 17, c: PAL.lagoonFill },
    ...(tier >= 1 ? [{ x: 62, y: 124, r: 13, c: PAL.reef }, { x: 142, y: 126, r: 12, c: PAL.reef }] : []),
    ...(tier >= 2 ? [{ x: 40, y: 116, r: 15, c: PAL.gold }, { x: 168, y: 118, r: 13, c: PAL.gold }] : []),
    ...(tier >= 3 ? [{ x: 84, y: 106, r: 19, c: PAL.coral }, { x: 122, y: 108, r: 15, c: PAL.coral }] : []),
    ...(tier >= 4 ? [{ x: 18, y: 112, r: 11, c: PAL.reefDeep }, { x: 190, y: 110, r: 11, c: PAL.goldDeep }] : []),
  ]
  const fishCount = tier >= 4 ? 2 : tier >= 2 ? 1 : 0

  return (
    <svg viewBox="0 0 220 150" className="w-full h-[128px] sm:h-[150px]" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <defs>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PAL.reef} stopOpacity="0.9" />
          <stop offset="100%" stopColor={PAL.reefDeep} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="220" height="150" fill="url(#water)" />

      {/* bubbles */}
      <circle cx="30" cy="40" r="3" fill="white" opacity="0.35" />
      <circle cx="182" cy="60" r="2.5" fill="white" opacity="0.3" />
      {tier >= 2 && <circle cx="110" cy="30" r="2" fill="white" opacity="0.3" />}

      {/* sandy seabed */}
      <path d="M0 138 Q60 128 110 136 T220 132 V150 H0 Z" fill={PAL.lagoon} opacity="0.9" />

      {/* corals */}
      {corals.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.c} />
      ))}

      {/* fish */}
      {fishCount >= 1 && (
        <g transform="translate(150,95)">
          <ellipse rx="9" ry="5.5" fill={PAL.gold} />
          <path d="M8 0 L16 -5 L16 5 Z" fill={PAL.gold} />
          <circle cx="-4" cy="-1" r="1.1" fill={PAL.ink} />
        </g>
      )}
      {fishCount >= 2 && (
        <g transform="translate(55,90) scale(-1,1)">
          <ellipse rx="7" ry="4.5" fill={PAL.white} />
          <path d="M6.5 0 L13 -4 L13 4 Z" fill={PAL.white} />
          <circle cx="-3" cy="-1" r="1" fill={PAL.ink} />
        </g>
      )}
    </svg>
  )
}

function ReefCard({
  tier, rankTitle, nextRankTitle, levelsToNext, maxed, t,
}: {
  tier: number
  rankTitle: string
  nextRankTitle: string | null
  levelsToNext: number
  maxed: boolean
  t: Record<string, string>
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4" style={{ backgroundColor: PAL.reefDeep }}>
      <ReefScene tier={tier} />
      <div className="px-4 py-3 sm:px-5 sm:py-3.5" style={{ backgroundColor: PAL.white }}>
        <p className="font-black text-sm sm:text-base truncate" style={{ color: PAL.ink }}>{rankTitle}</p>
        {maxed ? (
          <p className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: PAL.goldDeep }}>{t.maxRank}</p>
        ) : (
          <p className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: PAL.inkSoft }}>
            {levelsToNext} {t.levelsToNext} <span style={{ color: PAL.reefDeep }}>{nextRankTitle}</span>
          </p>
        )}
      </div>
    </div>
  )
}

function ContinueCard({
  skill, lessonIdx, lessonCount, pct, onPlay, onBack, t,
}: {
  skill: Skill
  lessonIdx: number
  lessonCount: number
  pct: number
  onPlay: () => void
  onBack: () => void
  t: Record<string, string>
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-7" style={{ backgroundColor: PAL.reef }}>
      <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 160, height: 160, top: -60, insetInlineEnd: -50, background: 'rgba(255,255,255,0.08)' }} />

      <button onClick={onBack} className="relative flex items-center gap-1.5 mb-3 -ms-1 opacity-90 hover:opacity-100 transition-opacity">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
        <span className="text-[11px] font-black tracking-wide uppercase text-white/85">{t.continuePlaying}</span>
      </button>

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-white font-black text-lg leading-tight flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{skill.emoji}</span>
              <span className="truncate">{skill.title}</span>
            </h2>
            <XpBadge xp={skill.xp_reward} />
          </div>
          <p className="text-white/80 text-xs font-bold mb-2.5">
            {t.lessonOf} {lessonIdx} {t.of} {lessonCount || 1}
          </p>
          <ProgressBar pct={pct} track="rgba(255,255,255,0.28)" fill={PAL.white} />
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="shrink-0 w-full sm:w-auto rounded-2xl px-5 py-3 font-black text-sm flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5 active:translate-y-[1px]"
          style={{ backgroundColor: PAL.white, color: PAL.reefDeep }}
        >
          <Icon kind="play" className="w-4 h-4" />
          {t.play}
        </button>
      </div>
    </div>
  )
}

// A card sized for a horizontal swipe row rather than a grid cell.
function LevelCard({
  skill, idx, state, lessonCount, pct, onClick, label, t, cardRef,
}: {
  skill: Skill
  idx: number
  state: 'done' | 'current' | 'locked'
  lessonCount: number
  pct: number
  onClick: () => void
  label: string
  t: Record<string, string>
  cardRef?: (el: HTMLButtonElement | null) => void
}) {
  const color = colorForIndex(idx)
  const locked = state === 'locked'

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onClick}
      disabled={locked}
      aria-label={label}
      className={cn(
        'relative text-start rounded-2xl sm:rounded-3xl overflow-hidden bg-white shrink-0 snap-center transition-transform',
        !locked && 'hover:-translate-y-0.5 active:translate-y-[1px]',
        locked && 'opacity-60 cursor-default',
      )}
      style={{
        width: 'clamp(132px, 34vw, 168px)',
        boxShadow: state === 'current' ? `0 0 0 3px ${PAL.gold}, 0 4px 0 ${PAL.goldDeep}` : `0 1px 0 rgba(41,57,74,0.08)`,
        border: state === 'current' ? 'none' : '1px solid rgba(41,57,74,0.08)',
      }}
    >
      {state === 'current' && (
        <span
          className="absolute top-2 inset-inline-start-2 z-10 rounded-full px-2 py-1 text-[9px] font-black tracking-wide text-white flex items-center gap-1"
          style={{ backgroundColor: PAL.goldDeep }}
        >
          <Icon kind="play" className="w-2.5 h-2.5" />{label}
        </span>
      )}

      <div className="h-20 sm:h-24 flex items-center justify-center relative" style={{ backgroundColor: locked ? PAL.lagoonFill : color.top }}>
        {locked && (
          <span className="absolute z-10 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(41,57,74,0.75)' }}>
            <Icon kind="lock" className="w-4 h-4" style={{ color: PAL.white }} />
          </span>
        )}
        <span
          className="text-4xl sm:text-5xl select-none"
          style={{ filter: locked ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 2px 2px rgba(0,0,0,0.12))' }}
        >
          {skill.emoji || '⭐'}
        </span>

        {state === 'done' && (
          <span className="absolute top-2 inset-inline-end-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: PAL.white }}>
            <Icon kind="check" className="w-3.5 h-3.5" style={{ color: color.deep }} />
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="font-black text-sm leading-tight truncate" style={{ color: PAL.ink }}>{skill.title}</p>
        <div className="flex items-center justify-between gap-1.5 mt-0.5 mb-2">
          <p className="text-[10px] font-bold truncate" style={{ color: PAL.inkSoft }}>
            {locked ? label : `${lessonCount} ${lessonCount === 1 ? t.lesson : t.lessons}`}
          </p>
        </div>
        <ProgressBar pct={locked ? 0 : pct} fill={locked ? PAL.lagoonFill : color.top} />
        {!locked && (
          <div className="mt-2">
            <XpBadge xp={skill.xp_reward} tone="dark" />
          </div>
        )}
      </div>
    </button>
  )
}

function UnitRow({
  unitNumber, title, doneCount, total, children, scrollerRef, t,
}: {
  unitNumber: number
  title?: string
  doneCount: number
  total: number
  children: React.ReactNode
  scrollerRef: (el: HTMLDivElement | null) => void
  t: Record<string, string>
}) {
  const complete = total > 0 && doneCount === total
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2.5 mb-3 px-0.5">
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ backgroundColor: complete ? PAL.reefDeep : PAL.ink }}>
          {complete ? <Icon kind="check" className="w-3 h-3" style={{ color: PAL.white }} /> : unitNumber}
        </span>
        <p className="text-xs font-black tracking-wide uppercase truncate flex-1 min-w-0" style={{ color: PAL.inkSoft }}>
          {title}
        </p>
        {complete ? (
          <span className="text-[11px] font-black shrink-0 px-2 py-0.5 rounded-full" style={{ color: PAL.white, backgroundColor: PAL.reef }}>
            {t.unitComplete}
          </span>
        ) : (
          <span className="text-[11px] font-black shrink-0" style={{ color: PAL.reefDeep }}>{doneCount}/{total}</span>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-3 px-3 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
    </div>
  )
}

function SideCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.06)' }}>
      {children}
    </div>
  )
}

function SideHeader({ title, onViewAll, t }: { title: string; onViewAll?: () => void; t: Record<string, string> }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-base" style={{ color: PAL.ink }}>{title}</h3>
      {onViewAll && (
        <button onClick={onViewAll} className="text-xs font-black tracking-wide uppercase" style={{ color: PAL.coralDeep }}>
          {t.viewAll}
        </button>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>
      {medal ?? rank}
    </div>
  )
}

function LeaderboardAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [errored, setErrored] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  if (avatarUrl && !errored) {
    return <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" style={{ backgroundColor: PAL.lagoonFill }} onError={() => setErrored(true)} />
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>
      {initial}
    </div>
  )
}

function LeaderboardCard({ entries, t, onViewAll }: { entries: LeaderboardEntry[]; t: Record<string, string>; onViewAll: () => void }) {
  const top = entries.slice(0, 5)
  return (
    <SideCard>
      <SideHeader title={t.leaderboard} onViewAll={onViewAll} t={t} />
      <div className="flex flex-col gap-1">
        {top.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 px-2 py-2 rounded-2xl" style={entry.is_current_user ? { backgroundColor: PAL.lagoon } : undefined}>
            {entry.rank_global != null ? <RankBadge rank={entry.rank_global} /> : <div className="w-7 h-7 shrink-0" />}
            <LeaderboardAvatar name={entry.name} avatarUrl={entry.avatar_url} />
            <span className={cn('flex-1 min-w-0 truncate text-sm', entry.is_current_user ? 'font-black' : 'font-bold')} style={{ color: PAL.ink }}>
              {entry.is_current_user ? t.you : entry.name}
            </span>
            <span className="text-xs font-black shrink-0" style={{ color: PAL.coralDeep }}>{entry.xp} XP</span>
          </div>
        ))}
      </div>
    </SideCard>
  )
}

function QuestCard({ quest, t }: { quest: DailyQuest; t: Record<string, string> }) {
  const pct = quest.target > 0 ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 0
  return (
    <SideCard>
      <SideHeader title={t.dailyQuests} t={t} />
      <p className="text-sm font-bold mb-3" style={{ color: PAL.ink }}>{quest.label}</p>
      <div className="flex items-center gap-2 mb-3">
        <ProgressBar pct={pct} fill={PAL.gold} />
        <span className="text-xs font-black shrink-0" style={{ color: PAL.inkSoft }}>{quest.current}/{quest.target}</span>
      </div>
      <button
        type="button"
        disabled={pct < 100}
        className="w-full rounded-2xl py-2.5 font-black text-sm transition-opacity"
        style={{ backgroundColor: pct >= 100 ? PAL.coral : PAL.lagoonFill, color: pct >= 100 ? PAL.white : PAL.inkSoft }}
      >
        {t.challengeCheck}
      </button>
    </SideCard>
  )
}

function ChallengeCard({ challenge, t, onOpen }: { challenge: DailyChallenge; t: Record<string, string>; onOpen?: () => void }) {
  return (
    <SideCard>
      <SideHeader title={t.dailyChallenges} t={t} />
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: PAL.lagoon }}>
          {challenge.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-bold truncate', challenge.completed && 'line-through')} style={{ color: challenge.completed ? PAL.inkSoft : PAL.ink }}>
            {challenge.title}
          </p>
          <p className="text-xs font-black" style={{ color: PAL.goldDeep }}>+{challenge.xp_reward} XP</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={challenge.completed}
        className="w-full rounded-2xl py-2.5 font-black text-sm transition-opacity"
        style={{ backgroundColor: challenge.completed ? PAL.lagoonFill : PAL.coral, color: challenge.completed ? PAL.reefDeep : PAL.white }}
      >
        {challenge.completed ? t.challengeDone : t.challengeCheck}
      </button>
    </SideCard>
  )
}

export default function SkillsClient({
  userId, tracks = [], initialTrackId, skills = [], skillProgress = [], lessonCountMap = {},
  language, streak = 0, gems = 0, initialCurrentSkillId, initialFirstIncompleteLessonId,
  leaderboard = [], dailyQuest, dailyChallenge, totalTimeMins = 0,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as 'en' | 'ar' | 'fr'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [activeTrackId, setActiveTrackId] = useState<string | null>(initialTrackId)
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(initialCurrentSkillId)
  const [firstIncompleteLessonId, setFirstIncompleteLessonId] = useState<string | null>(initialFirstIncompleteLessonId)
  const [showPicker, setShowPicker] = useState(false)
  const [switching, setSwitching] = useState(false)

  const currentCardRef = useRef<HTMLButtonElement | null>(null)
  const currentScrollerRef = useRef<HTMLDivElement | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  const orderedSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrackId).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrackId],
  )

  const isUnlocked = (skill: Skill) =>
    !skill.required_nodes?.length || skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)
  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  const activeTrack = tracks.find(tr => tr.id === activeTrackId) ?? null
  const currentSkill = orderedSkills.find(s => s.id === currentSkillId) ?? null
  const allDone = orderedSkills.length > 0 && orderedSkills.every(s => isComplete(s.id))

  const currentSkillIdx = currentSkill ? orderedSkills.findIndex(s => s.id === currentSkill.id) : -1
  const currentUnitNumber = currentSkillIdx >= 0 ? Math.floor(currentSkillIdx / UNIT_SIZE) + 1 : 1
  const totalUnits = orderedSkills.length > 0 ? Math.ceil(orderedSkills.length / UNIT_SIZE) : 1

  // reef tier: purely a function of how many levels in this track are done
  const doneInTrack = orderedSkills.filter(s => isComplete(s.id)).length
  const pctInTrack = orderedSkills.length > 0 ? (doneInTrack / orderedSkills.length) * 100 : 0
  const reefTier = TIER_BOUNDARIES.filter(b => pctInTrack >= b).length
  const ranks = RANKS[lang] ?? RANKS.en
  const reefMaxed = reefTier >= 4
  const nextBoundaryPct = TIER_BOUNDARIES[reefTier] ?? 100
  const levelsToNextRank = reefMaxed
    ? 0
    : Math.max(1, Math.ceil((nextBoundaryPct / 100) * orderedSkills.length) - doneInTrack)

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  useEffect(() => {
    // scroll the unit's carousel so the current level is in view, and bring
    // that section into the vertical viewport too
    currentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTrackId])

  const handleTrackSelect = async (trackId: string) => {
    if (trackId === activeTrackId) { setShowPicker(false); return }
    setShowPicker(false); setSwitching(true); setActiveTrackId(trackId)

    const saveResult = await setCurrentTrack(trackId)
    if (saveResult?.error) {
      console.error('Failed to save current track:', saveResult.error)
    }

    try {
      const res = await fetch('/api/path/resolve-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })
      const data = await res.json()
      setCurrentSkillId(data.skillId ?? null)
      setFirstIncompleteLessonId(data.lessonId ?? null)
    } catch {
      const trackSkills = skills.filter(s => s.track_id === trackId).sort((a, b) => a.sort_order - b.sort_order)
      const fallback = trackSkills.find(s => isUnlocked(s) && !isComplete(s.id)) ?? trackSkills[0] ?? null
      setCurrentSkillId(fallback?.id ?? null)
      setFirstIncompleteLessonId(null)
    } finally {
      setSwitching(false)
    }
  }

  const goToCurrentLesson = () => {
    if (!currentSkill) return
    if (firstIncompleteLessonId) router.push(`/dashboard/path/${currentSkill.id}/lesson/${firstIncompleteLessonId}`)
    else router.push(`/dashboard/path/${currentSkill.id}`)
  }

  const handleCardTap = (skill: Skill, unlocked: boolean) => {
    if (!unlocked) return
    if (skill.id === currentSkillId) goToCurrentLesson()
    else router.push(`/dashboard/path/${skill.id}`)
  }

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  const sidebarWidgets = (
    <>
      <LeaderboardCard entries={leaderboard} t={t} onViewAll={() => router.push('/dashboard/leaderboard')} />
      {dailyQuest && <QuestCard quest={dailyQuest} t={t} />}
      {dailyChallenge && (
        <ChallengeCard challenge={dailyChallenge} t={t} onOpen={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)} />
      )}
    </>
  )

  return (
    <div dir={dir} className="min-h-screen w-full overflow-x-hidden font-[Baloo_2,Cairo,sans-serif]" style={{ backgroundColor: PAL.lagoon, color: PAL.ink }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Cairo:wght@600;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      ` }} />

      {/* ── Header ── */}
      <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-7 pb-4 max-w-[1100px] mx-auto w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {activeTrack && (
              <h1 className="font-black text-xl sm:text-2xl md:text-3xl leading-tight truncate flex items-center gap-2">
                <span>{activeTrack.emoji}</span>{activeTrack.name}
              </h1>
            )}
            <p className="text-xs sm:text-sm font-bold truncate" style={{ color: PAL.inkSoft }}>
              {t.unit} {currentUnitNumber} {t.of} {totalUnits}
            </p>
          </div>

          {activeTrack && (
            <div className="relative shrink-0" ref={pickerRef}>
              <button
                onClick={() => setShowPicker(v => !v)}
                aria-label="Switch track"
                className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-2xl transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.08)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M7 10l5 5 5-5z"/></svg>
              </button>

              {showPicker && (
                <div
                  className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl overflow-hidden z-30"
                  style={{ boxShadow: '0 8px 24px rgba(41,57,74,0.14)' }}
                >
                  {tracks.map(tr => (
                    <button
                      key={tr.id}
                      onClick={() => handleTrackSelect(tr.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ backgroundColor: tr.id === activeTrackId ? PAL.lagoon : 'transparent' }}
                    >
                      <span>{tr.emoji}</span>
                      <span className="flex-1 font-bold truncate">{tr.name}</span>
                      {tr.id === activeTrackId && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PAL.reef }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* the reef: grows with real progress in this track */}
        {orderedSkills.length > 0 && (
          <ReefCard
            tier={reefTier}
            rankTitle={ranks[reefTier]}
            nextRankTitle={reefMaxed ? null : ranks[reefTier + 1]}
            levelsToNext={levelsToNextRank}
            maxed={reefMaxed}
            t={t}
          />
        )}

        {/* streak + pearls */}
        <div className="flex gap-2.5 sm:gap-3">
          <StreakPill streak={streak} t={t} />
          <PearlsPill gems={gems} t={t} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-center gap-6 px-3 sm:px-4 pb-12 max-w-[1100px] mx-auto w-full">
        <div className="flex-1 min-w-0 w-full lg:max-w-[680px]">
          {switching ? (
            <div className="flex items-center justify-center py-20">
              <p className="font-bold" style={{ color: PAL.inkSoft }}>{t.switching}</p>
            </div>
          ) : allDone ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl">
              <p className="text-5xl sm:text-6xl mb-3">🏆</p>
              <p className="text-lg sm:text-xl font-black">{t.allDone}</p>
              <p className="mt-2 font-bold text-sm sm:text-base" style={{ color: PAL.inkSoft }}>{t.allDoneSub}</p>
            </div>
          ) : currentSkill ? (
            <>
              <ContinueCard
                skill={currentSkill}
                lessonIdx={currentLessonIdx}
                lessonCount={currentLessonCount}
                pct={currentProgressPct}
                onPlay={goToCurrentLesson}
                onBack={() => router.back()}
                t={t}
              />

              {orderedSkills.map((skill, idx) => {
                const startsNewUnit = idx % UNIT_SIZE === 0
                if (!startsNewUnit) return null
                const unitNumber = Math.floor(idx / UNIT_SIZE) + 1
                const unitSkills = orderedSkills.slice(idx, idx + UNIT_SIZE)
                const unitDoneCount = unitSkills.filter(s => isComplete(s.id)).length

                return (
                  <UnitRow
                    key={`unit-${unitNumber}`}
                    unitNumber={unitNumber}
                    title={unitSkills[0]?.title}
                    doneCount={unitDoneCount}
                    total={unitSkills.length}
                    scrollerRef={(el) => { if (unitNumber === currentUnitNumber) currentScrollerRef.current = el }}
                    t={t}
                  >
                    {unitSkills.map((s, i) => {
                      const globalIdx = idx + i
                      const unlocked  = isUnlocked(s)
                      const complete  = isComplete(s.id)
                      const isCurrent = s.id === currentSkillId
                      const state: 'done' | 'current' | 'locked' =
                        complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
                      const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.jumpTag : t.current

                      return (
                        <LevelCard
                          key={s.id}
                          skill={s}
                          idx={globalIdx}
                          state={state}
                          lessonCount={lessonCountMap[s.id] ?? 0}
                          pct={progressMap[s.id] ?? 0}
                          onClick={() => handleCardTap(s, unlocked)}
                          label={label}
                          t={t}
                          cardRef={isCurrent ? (el) => { currentCardRef.current = el } : undefined}
                        />
                      )
                    })}
                  </UnitRow>
                )
              })}
            </>
          ) : null}

          {/* widgets inline on mobile/tablet, since the sidebar only shows at lg+ */}
          <div className="lg:hidden flex flex-col gap-4 mt-2">
            {sidebarWidgets}
          </div>
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pt-1">
          {sidebarWidgets}
        </aside>
      </div>
    </div>
  )
}