'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v7 — back to the actual reference screenshots
// ─────────────────────────────────────────────────────────
// This drops every experimental concept (reef growth, single-focus play
// screen, voxel/pearl-diver) and rebuilds the same visual grammar as the
// screenshots originally provided:
//   - a solid-color streak card with a row of flame pips (Monfy)
//   - a white "weekly challenge" card: title + progress bar + a solid
//     colored claim/play pill button (Monfy)
//   - colorful course-style cards with a progress bar per lesson,
//     grouped in rows per unit (Weraq's "recently played courses")
//   - a plain ranked list for the leaderboard (Weraq's list style)
//
// Palette = the Energetic-mode brief: Lagoon / Reef bright / Sun gold /
// Coral / Lagoon fill / Ink.
//
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
    unit: 'Unit',
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
    unit: 'الوحدة',
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
    unit: 'Unité',
  },
}

const UNIT_SIZE = 4

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

interface DailyQuest { label: string; current: number; target: number }
interface DailyChallenge { id: string; title: string; emoji: string; xp_reward: number; completed: boolean }

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

// strips internal content-ops labels like "S3 — " or "S12 - " from a title
// before it ever reaches a kid's screen — that's a CMS artifact, not content.
function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*[—-]\s*/i, '').trim() || title
}

type IconKind = 'lock' | 'check' | 'flame' | 'gem' | 'play'

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
  }
}

function ProgressBar({ pct, track = PAL.lagoonFill, fill }: { pct: number; track?: string; fill: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden w-full" style={{ backgroundColor: track }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, pct)}%`, backgroundColor: fill }} />
    </div>
  )
}

function XpBadge({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black shrink-0" style={{ backgroundColor: PAL.lagoon, color: PAL.goldDeep }}>
      +{xp} XP
    </span>
  )
}

// ── streak card: solid color, flame count + row of 7 flame pips (Monfy) ──
function StreakCard({ streak, t }: { streak: number; t: Record<string, string> }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl sm:rounded-3xl p-3 sm:p-4" style={{ backgroundColor: PAL.coral }}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
        <Icon kind="flame" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: PAL.white }} />
        <span className="font-black text-white text-xl sm:text-2xl leading-none">{streak}</span>
        <span className="text-white/85 font-bold text-[11px] sm:text-xs truncate">{t.streakDays}</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: i < Math.min(streak, 7) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.22)' }}
          >
            {i < Math.min(streak, 7) && <Icon kind="flame" className="w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ color: PAL.coralDeep }} />}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── balance card: solid color, big number (Monfy's "current balance") ───
function CoinsCard({ gems, t }: { gems: number; t: Record<string, string> }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl sm:rounded-3xl p-3 sm:p-4" style={{ backgroundColor: PAL.ink }}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
        <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: PAL.gold }}>
          <Icon kind="gem" className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" style={{ color: PAL.white }} />
        </span>
        <span className="font-black text-white text-xl sm:text-2xl leading-none">{gems}</span>
      </div>
      <p className="text-white/70 font-bold text-[11px] sm:text-xs">{t.coins}</p>
    </div>
  )
}

// ── continue card: WHITE card, progress bar, solid claim/play button ────
// (this mirrors Monfy's weekly-challenge card structure directly)
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
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 bg-white" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.06)' }}>
      <button onClick={onBack} className="flex items-center gap-1.5 mb-3 -ms-1 opacity-70 hover:opacity-100 transition-opacity">
        <svg width="15" height="15" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
        <span className="text-[11px] font-black tracking-wide uppercase" style={{ color: PAL.inkSoft }}>{t.continuePlaying}</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="font-black text-lg leading-tight flex items-center gap-2 min-w-0" style={{ color: PAL.ink }}>
              <span className="text-xl shrink-0">{skill.emoji}</span>
              <span className="truncate">{cleanTitle(skill.title)}</span>
            </h2>
            <XpBadge xp={skill.xp_reward} />
          </div>
          <p className="text-xs font-bold mb-2.5" style={{ color: PAL.inkSoft }}>
            {t.lessonOf} {lessonIdx} {t.of} {lessonCount || 1}
          </p>
          <ProgressBar pct={pct} fill={PAL.gold} />
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="shrink-0 w-full sm:w-auto rounded-2xl px-5 py-3 font-black text-sm flex items-center justify-center gap-1.5 text-white transition-transform hover:-translate-y-0.5 active:translate-y-[1px]"
          style={{ backgroundColor: PAL.coral }}
        >
          <Icon kind="play" className="w-4 h-4" />
          {t.play}
        </button>
      </div>
    </div>
  )
}

// ── course-style card with a progress bar (Weraq's "recently played") ───
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
        width: 'clamp(140px, 36vw, 176px)',
        boxShadow: state === 'current' ? `0 0 0 3px ${PAL.gold}` : `0 1px 0 rgba(41,57,74,0.08)`,
        border: state === 'current' ? 'none' : '1px solid rgba(41,57,74,0.08)',
      }}
    >
      {state === 'current' && (
        <span className="absolute top-2 inset-inline-start-2 z-10 rounded-full px-2 py-1 text-[9px] font-black tracking-wide text-white" style={{ backgroundColor: PAL.goldDeep }}>
          {label}
        </span>
      )}

      <div className="h-20 sm:h-24 flex items-center justify-center relative" style={{ backgroundColor: locked ? PAL.lagoonFill : color.top }}>
        {locked ? (
          <Icon kind="lock" className="w-6 h-6" style={{ color: PAL.inkSoft }} />
        ) : (
          <span className="text-4xl sm:text-5xl select-none" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.12))' }}>{skill.emoji || '⭐'}</span>
        )}
        {state === 'done' && (
          <span className="absolute top-2 inset-inline-end-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: PAL.white }}>
            <Icon kind="check" className="w-3.5 h-3.5" style={{ color: color.deep }} />
          </span>
        )}
      </div>

      <div className="p-3">
        <p
          className="font-black text-sm leading-tight min-h-[2.2em]"
          style={{ color: PAL.ink, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {cleanTitle(skill.title)}
        </p>
        <p className="text-[10px] font-bold mt-0.5 mb-2" style={{ color: PAL.inkSoft }}>
          {locked ? label : `${lessonCount} ${lessonCount === 1 ? t.lesson : t.lessons}`}
        </p>
        <ProgressBar pct={locked ? 0 : pct} fill={locked ? PAL.lagoonFill : color.top} />
      </div>
    </button>
  )
}

// finished and locked units collapse to one quiet line — only the unit
// you're actually working through gets the full colorful card treatment.
function CompactUnitRow({
  unitNumber, title, doneCount, total, mode, expanded, onToggle,
}: {
  unitNumber: number
  title?: string
  doneCount: number
  total: number
  mode: 'done' | 'locked'
  expanded: boolean
  onToggle: () => void
}) {
  const locked = mode === 'locked'
  const [shake, setShake] = useState(false)
  const handleClick = () => {
    if (locked) { setShake(true); window.setTimeout(() => setShake(false), 400); return }
    onToggle()
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={locked}
      className={cn('w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-2xl text-start transition-colors', !locked && 'hover:bg-white')}
      style={{ opacity: locked ? 0.55 : 1, animation: shake ? 'shakeX 0.4s ease' : undefined }}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: locked ? PAL.lagoonFill : PAL.reef }}
      >
        {locked ? <Icon kind="lock" className="w-3.5 h-3.5" style={{ color: PAL.inkSoft }} /> : <Icon kind="check" className="w-3.5 h-3.5" style={{ color: PAL.white }} />}
      </span>
      <span className="text-sm font-bold truncate flex-1 min-w-0" style={{ color: PAL.inkSoft }}>
        {t_unit_label(unitNumber, title)}
      </span>
      {!locked && (
        <>
          <span className="text-xs font-black shrink-0" style={{ color: PAL.reefDeep }}>{doneCount}/{total}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
            <path d="M6 9l6 6 6-6" fill="none" stroke={PAL.inkSoft} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      )}
    </button>
  )
}
function t_unit_label(unitNumber: number, title?: string) {
  return title ? `${cleanTitle(title)}` : `Unit ${unitNumber}`
}
function UnitRow({
  unitNumber, title, doneCount, total, children, scrollerRef,
}: {
  unitNumber: number
  title?: string
  doneCount: number
  total: number
  children: React.ReactNode
  scrollerRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2.5 mb-3 px-0.5">
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ backgroundColor: PAL.ink }}>{unitNumber}</span>
        <p className="text-xs font-black tracking-wide uppercase truncate flex-1 min-w-0" style={{ color: PAL.inkSoft }}>{title ? cleanTitle(title) : ''}</p>
        <span className="text-[11px] font-black shrink-0" style={{ color: PAL.reefDeep }}>{doneCount}/{total}</span>
      </div>
      <div ref={scrollerRef} className="no-scrollbar flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        {children}
      </div>
    </div>
  )
}

function SideCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.06)' }}>{children}</div>
}

function SideHeader({ title, onViewAll, t }: { title: string; onViewAll?: () => void; t: Record<string, string> }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-base" style={{ color: PAL.ink }}>{title}</h3>
      {onViewAll && <button onClick={onViewAll} className="text-xs font-black tracking-wide uppercase" style={{ color: PAL.coralDeep }}>{t.viewAll}</button>}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  return <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>{medal ?? rank}</div>
}

function LeaderboardAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [errored, setErrored] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  if (avatarUrl && !errored) {
    return <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" style={{ backgroundColor: PAL.lagoonFill }} onError={() => setErrored(true)} />
  }
  return <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>{initial}</div>
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
        className="w-full rounded-2xl py-2.5 font-black text-sm text-white transition-opacity"
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
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: PAL.lagoon }}>{challenge.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-bold truncate', challenge.completed && 'line-through')} style={{ color: challenge.completed ? PAL.inkSoft : PAL.ink }}>{challenge.title}</p>
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
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set())

  const currentCardRef = useRef<HTMLButtonElement | null>(null)
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

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  useEffect(() => {
    currentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTrackId])

  const handleTrackSelect = async (trackId: string) => {
    if (trackId === activeTrackId) { setShowPicker(false); return }
    setShowPicker(false); setSwitching(true); setActiveTrackId(trackId)

    const saveResult = await setCurrentTrack(trackId)
    if (saveResult?.error) console.error('Failed to save current track:', saveResult.error)

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
      {dailyChallenge && <ChallengeCard challenge={dailyChallenge} t={t} onOpen={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)} />}
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
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl overflow-hidden z-30" style={{ boxShadow: '0 8px 24px rgba(41,57,74,0.14)' }}>
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

        {/* streak + coins — solid color stat cards, straight from Monfy */}
        <div className="flex gap-2.5 sm:gap-3 mt-3 sm:mt-4">
          <StreakCard streak={streak} t={t} />
          <CoinsCard gems={gems} t={t} />
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
                const isCurrentUnit = unitNumber === currentUnitNumber
                const isFinishedUnit = !isCurrentUnit && unitDoneCount === unitSkills.length
                const isFutureUnit = !isCurrentUnit && !isFinishedUnit && unitDoneCount === 0 && unitNumber > currentUnitNumber
                const expanded = expandedUnits.has(unitNumber)
                const showCards = isCurrentUnit || (isFinishedUnit && expanded)

                if (!showCards) {
                  return (
                    <CompactUnitRow
                      key={`unit-${unitNumber}`}
                      unitNumber={unitNumber}
                      title={unitSkills[0]?.title}
                      doneCount={unitDoneCount}
                      total={unitSkills.length}
                      mode={isFutureUnit ? 'locked' : 'done'}
                      expanded={expanded}
                      onToggle={() => {
                        setExpandedUnits(prev => {
                          const next = new Set(prev)
                          next.has(unitNumber) ? next.delete(unitNumber) : next.add(unitNumber)
                          return next
                        })
                      }}
                    />
                  )
                }

                return (
                  <UnitRow
                    key={`unit-${unitNumber}`}
                    unitNumber={unitNumber}
                    title={unitSkills[0]?.title}
                    doneCount={unitDoneCount}
                    total={unitSkills.length}
                    scrollerRef={() => {}}
                  >
                    {unitSkills.map((s, i) => {
                      const globalIdx = idx + i
                      const unlocked  = isUnlocked(s)
                      const complete  = isComplete(s.id)
                      const isCurrent = s.id === currentSkillId
                      const state: 'done' | 'current' | 'locked' = complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
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

          <div className="lg:hidden flex flex-col gap-4 mt-2">{sidebarWidgets}</div>
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pt-1">
          {sidebarWidgets}
        </aside>
      </div>
    </div>
  )
} 