'use client'
// components/dashboard/SkillsClient.tsx
//
// GAME-WORLD REDESIGN
// ────────────────────
// The old version read as a study dashboard (mint SaaS cards, plain header,
// grey dashed line). This version leans all the way into "this is a game
// board, not a lesson list":
//   - a candy-bright sky gradient with a hill horizon behind the path
//   - a mascot greeting the kid up top like a game's home screen
//   - the path is a winding trail between "islands" with a thick dotted
//     trail, sunburst rays behind the current stop, and a fog-cloud over
//     locked stops instead of flat grey circles
//   - a big chunky "PLAY" button instead of a quiet "Continue" link
//   - streak/gems shown as tactile coin-like chips
//   - sidebar recast as a trophy shelf / quest board instead of white cards
//
// All data flow, props, hooks and routing logic are unchanged from the
// original — only the presentation layer and copy tone changed.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    continueBtn: 'Play', startBtn: "Let's play!", jumpHere: 'PLAY HERE!',
    lessonOf: 'Level', of: 'of',
    locked: 'Locked — keep playing to unlock', completed: 'Done — great job!', current: 'Your turn — tap to play',
    allDone: 'World complete!', allDoneSub: "You've collected every star here.",
    switching: 'Opening the gate…', back: 'Back',
    leaderboard: 'Champions', viewAll: 'See all', you: 'You',
    dailyQuests: "Today's quest", dailyChallenges: 'Bonus missions',
    challengeDone: 'Mission complete! 🎉', challengeCheck: 'Tap to start',
    unit: 'World', curriculum: 'Adventure map',
  },
  ar: {
    continueBtn: 'العب', startBtn: 'هيا نلعب', jumpHere: 'العب من هنا!',
    lessonOf: 'المرحلة', of: 'من',
    locked: 'مقفل — استمر لتفتحه', completed: 'أنجزتها! أحسنت', current: 'دورك، اضغط للعب',
    allDone: 'أتممت هذا العالم! 🏆', allDoneSub: 'جمعت كل نجمة هنا.',
    switching: 'جارٍ فتح البوابة…', back: 'رجوع',
    leaderboard: 'الأبطال', viewAll: 'عرض الكل', you: 'أنت',
    dailyQuests: 'مهمة اليوم', dailyChallenges: 'مهام إضافية',
    challengeDone: 'أنجزت المهمة! 🎉', challengeCheck: 'اضغط للبدء',
    unit: 'عالم', curriculum: 'خريطة المغامرة',
  },
  fr: {
    continueBtn: 'Jouer', startBtn: "C'est parti !", jumpHere: 'Joue ici !',
    lessonOf: 'Niveau', of: 'sur',
    locked: 'Verrouillé — continue pour débloquer', completed: 'Terminé, bravo !', current: 'À toi de jouer !',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as ramassé toutes les étoiles ici.',
    switching: 'Ouverture du portail…', back: 'Retour',
    leaderboard: 'Champions', viewAll: 'Tout voir', you: 'Toi',
    dailyQuests: 'Quête du jour', dailyChallenges: 'Missions bonus',
    challengeDone: 'Mission réussie ! 🎉', challengeCheck: 'Appuie pour commencer',
    unit: 'Monde', curriculum: "Carte de l'aventure",
  },
}

const ICONS = {
  streak: '/icons/streak.png',
  gems:   '/icons/gems.png',
  node:   ['/icons/book.png', '/icons/star.png', '/icons/chest.png', '/icons/trophy.png'],
}

const SIDE_AVATARS = [
  '/icons/mascot-idle.svg',
  '/icons/mascot-idle2.svg',
  '/icons/mascot-idle3.svg',
  '/icons/mascot-idle4.svg',
  '/icons/mascot-idle5.svg',
  '/icons/mascot-idle6.svg',
  '/icons/mascot-idle7.svg',
  '/icons/mascot-idle8.svg',
  '/icons/mascot-idle9.svg',
]

const UNIT_SIZE = 4
const AVATAR_EVERY = 4

const AVATAR_SIDE_PATTERN: ('left' | 'right')[] = ['left', 'right', 'right', 'left', 'left', 'right', 'left', 'right']

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

// ── palette (candy game-board, not SaaS mint) ──────────────────────────────
const PAL = {
  skyTop: '#5FC6F0',
  skyBottom: '#CFF2DE',
  hill: '#3AC08A',
  hillShade: '#2FA478',
  sun: '#FFD34D',
  coral: '#FF6B57',
  coralDeep: '#E24E3C',
  grass: '#33D19B',
  grassDeep: '#149A72',
  grape: '#9B7EDE',
  grapeDeep: '#7857C4',
  ink: '#20324A',
  inkSoft: '#4C6470',
  fog: '#E4EEE9',
  fogDeep: '#C7D8D1',
  cream: '#FFF9EC',
}

const OFFSET_PATTERN = [0, -1, 1, 0]

function offsetTransform(offset: number) {
  if (offset === 0) return undefined
  return `translateX(calc(${offset} * min(14vw, 54px)))`
}

function avatarForIndex(idx: number): { side: 'left' | 'right'; src: string } | null {
  if (idx === 0 || idx % AVATAR_EVERY !== 0) return null
  const occurrence = idx / AVATAR_EVERY - 1
  const side = AVATAR_SIDE_PATTERN[occurrence % AVATAR_SIDE_PATTERN.length]
  const src = SIDE_AVATARS[occurrence % SIDE_AVATARS.length]
  return { side, src }
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    const [a, b] = points
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  }

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

type IconKind = 'book' | 'star' | 'chest' | 'trophy' | 'rocket' | 'lock' | 'check' | 'bolt' | 'flame' | 'gem'

function NodeIcon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'book':
      return <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Zm0 2h9v1H7a1 1 0 0 1 0-1Z"/></svg>
    case 'star':
      return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'chest':
      return <svg {...common}><path d="M4 9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2h-8v-1h-2v1H4V9Zm0 4h6v1h2v-1h8v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Zm7 0v2h2v-2h-2Z"/></svg>
    case 'trophy':
      return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'rocket':
      return <svg {...common}><path d="M12 2c3 1.5 5 4.8 5 8.5 0 1.7-.4 3.2-1 4.5l2 2V21h-4.5l-1.5-1.5-1.5 1.5H6v-4l2-2c-.6-1.3-1-2.8-1-4.5C7 6.8 9 3.5 12 2Zm0 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.5 15 4 17.5 6.5 20 9 17.5 6.5 15Z"/></svg>
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'bolt':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z"/></svg>
    case 'gem':
      return <svg {...common}><path d="M6 4h12l3 5-9 11L3 9l3-5Zm1.8 2L5.5 9h4.9L7.8 6Zm3.4 0-2.4 3h6.4l-2.4-3h-1.6Zm3.4 0-2.3 3h4.9L14.6 6ZM6.2 11l4.9 7-4-7h-.9Zm11.6 0h-.9l-4 7 4.9-7ZM9.4 11l2.6 6.5L14.6 11H9.4Z"/></svg>
  }
}

function iconForIndex(idx: number): number {
  return idx % ICONS.node.length
}

// A stat chip (streak / gems) that falls back to an emoji "coin" if the
// image asset is missing, so it never looks broken.
function StatChip({ src, value, fallback, tone }: { src: string; value: number; fallback: string; tone: 'coral' | 'grape' }) {
  const [err, setErr] = useState(false)
  const bg = tone === 'coral' ? 'linear-gradient(160deg,#FFD34D,#FF6B57)' : 'linear-gradient(160deg,#C9B6FF,#9B7EDE)'
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm"
        style={{ background: bg, boxShadow: '0 2px 0 rgba(0,0,0,0.12)' }}
      >
        {!err ? (
          <img src={src} alt="" className="w-4 h-4 object-contain" onError={() => setErr(true)} />
        ) : (
          fallback
        )}
      </span>
      <span className="font-black text-base" style={{ color: PAL.ink }}>{value}</span>
    </div>
  )
}

function PathNode({
  state, iconIndex, complete, onClick, disabled, label, offset, isCurrent, nodeRef,
}: {
  state: 'done' | 'current' | 'locked'
  iconIndex: number
  complete: boolean
  onClick: () => void
  disabled: boolean
  label: string
  offset: number
  isCurrent: boolean
  nodeRef?: (el: HTMLDivElement | null) => void
}) {
  const [imgError, setImgError] = useState(false)

  const palette =
    state === 'current'
      ? { face: `linear-gradient(160deg,${PAL.sun},${PAL.coral})`, base: PAL.coralDeep, icon: '#FFFFFF' }
      : state === 'done'
      ? { face: `linear-gradient(160deg,#57E3B8,${PAL.grass})`, base: PAL.grassDeep, icon: '#FFFFFF' }
      : { face: PAL.fog, base: PAL.fogDeep, icon: '#8CA79C' }

  const iconSrc = ICONS.node[iconIndex]

  return (
    <div
      ref={nodeRef}
      className="relative flex-shrink-0"
      style={{
        transform: offsetTransform(offset),
        width: 'clamp(60px, 18vw, 74px)',
        height: 'clamp(52px, 15.5vw, 62px)',
        marginBottom: 'clamp(26px, 7.5vw, 40px)',
      }}
    >
      {/* sunburst rays behind the current stop */}
      {isCurrent && (
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: '-46%',
            background: `repeating-conic-gradient(${PAL.sun}33 0deg 10deg, transparent 10deg 30deg)`,
            borderRadius: '50%',
            animation: 'raySpin 18s linear infinite',
          }}
        />
      )}

      <div
        aria-hidden
        className="absolute inset-0 rounded-[50%/52%]"
        style={{ backgroundColor: palette.base, transform: 'translateY(5px)' }}
      />

      {isCurrent && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-[50%/52%]"
          style={{ boxShadow: `0 0 0 7px ${PAL.sun}44`, animation: 'ringPulse 1.8s ease-out infinite' }}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'absolute left-0 right-0 top-0 rounded-[50%/54%] flex items-center justify-center',
          'transition-transform duration-100 ease-out',
          !disabled && 'hover:-translate-y-1 active:translate-y-[3px]',
          disabled && 'cursor-default',
          isCurrent && 'animate-[bob_2.2s_ease-in-out_infinite]',
        )}
        style={{
          height: '87%',
          background: palette.face,
          boxShadow: '0 2px 4px rgba(20,40,35,0.18)',
          border: state === 'locked' ? `2px dashed ${palette.base}` : 'none',
        }}
      >
        {state === 'locked' ? (
          <NodeIcon kind="lock" className="w-[38%] h-[38%]" style={{ color: palette.icon } as React.CSSProperties} />
        ) : !imgError ? (
          <img
            src={iconSrc}
            alt=""
            className="w-[46%] h-[46%] object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <NodeIcon
            kind={isCurrent ? 'rocket' : 'book'}
            className="w-[42%] h-[42%]"
            style={{ color: palette.icon } as React.CSSProperties}
          />
        )}

        {complete && !isCurrent && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: PAL.sun, boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}
          >
            <NodeIcon kind="check" className="w-3 h-3" style={{ color: PAL.ink }} />
          </span>
        )}
      </button>
    </div>
  )
}

function JumpBubble({ text }: { text: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 select-none pointer-events-none"
      style={{ top: 'clamp(-50px, -14vw, -46px)', animation: 'jumpBob 1.4s ease-in-out infinite' }}
    >
      <div
        className="relative rounded-2xl px-4 py-2 shadow-[0_4px_0_rgba(0,0,0,0.15)] border-2"
        style={{ background: PAL.cream, borderColor: PAL.sun, color: PAL.coralDeep }}
      >
        <span className="font-black tracking-wide text-sm whitespace-nowrap">{text}</span>
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 rotate-45 border-r-2 border-b-2"
          style={{ background: PAL.cream, borderColor: PAL.sun }}
        />
      </div>
    </div>
  )
}

function SideAvatar({ side, src }: { side: 'left' | 'right'; src: string }) {
  const [imgError, setImgError] = useState(false)
  if (imgError) return null

  const sign = side === 'left' ? -1 : 1

  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-1/2 pointer-events-none select-none z-10"
      style={{
        width: 'clamp(90px, 26vw, 140px)',
        height: 'clamp(111px, 32vw, 172px)',
        transform: `translate(calc(-50% ${sign > 0 ? '+' : '-'} clamp(110px, 28vw, 160px)), calc(-50% + clamp(110px, 16vw, 190px)))`,
        animation: `${side === 'left' ? 'floatL' : 'floatR'} 3.6s ease-in-out infinite`,
      }}
    >
      <img src={src} alt="" className="w-full h-full object-contain object-bottom" onError={() => setImgError(true)} />
    </div>
  )
}

function SideCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('bg-white rounded-[26px] p-5', className)}
      style={{ border: `3px solid ${PAL.fogDeep}`, boxShadow: `0 4px 0 ${PAL.fogDeep}` }}
    >
      {children}
    </div>
  )
}

function SideCardHeader({ title, onViewAll, t, emoji }: { title: string; onViewAll?: () => void; t: Record<string, string>; emoji: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-base flex items-center gap-2" style={{ color: PAL.ink }}>
        <span className="text-lg">{emoji}</span>{title}
      </h3>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-xs font-black tracking-wide uppercase transition-colors"
          style={{ color: PAL.coralDeep }}
        >
          {t.viewAll}
        </button>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-base font-black shrink-0"
      style={{ backgroundColor: medal ? PAL.cream : PAL.fog, color: PAL.inkSoft }}
    >
      {medal ?? rank}
    </div>
  )
}

function LeaderboardAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [errored, setErrored] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (avatarUrl && !errored) {
    return <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" style={{ backgroundColor: PAL.fog }} onError={() => setErrored(true)} />
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.fog, color: PAL.inkSoft }}>
      {initial}
    </div>
  )
}

function LeaderboardCard({ entries, t, onViewAll }: { entries: LeaderboardEntry[]; t: Record<string, string>; onViewAll: () => void }) {
  const top = entries.slice(0, 5)
  return (
    <SideCard>
      <SideCardHeader title={t.leaderboard} onViewAll={onViewAll} t={t} emoji="🏆" />
      <div className="flex flex-col gap-1.5">
        {top.map(entry => (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-2.5 py-2 rounded-2xl"
            style={entry.is_current_user ? { background: '#FFF1E4', border: `2px solid ${PAL.sun}` } : undefined}
          >
            {entry.rank_global != null ? <RankBadge rank={entry.rank_global} /> : <div className="w-8 h-8 shrink-0" />}
            <LeaderboardAvatar name={entry.name} avatarUrl={entry.avatar_url} />
            <span className={cn('flex-1 min-w-0 truncate text-[15px]', entry.is_current_user ? 'font-black' : 'font-bold')} style={{ color: PAL.ink }}>
              {entry.is_current_user ? t.you : entry.name}
            </span>
            <span className="text-sm font-black shrink-0" style={{ color: PAL.coralDeep }}>{entry.xp} XP</span>
          </div>
        ))}
      </div>
    </SideCard>
  )
}

function DailyQuestCard({ quest, t }: { quest: DailyQuest; t: Record<string, string> }) {
  const pct = quest.target > 0 ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 0
  return (
    <SideCard>
      <SideCardHeader title={t.dailyQuests} t={t} emoji="🗺️" />
      <div className="flex items-center gap-3">
        <span
          className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(160deg,${PAL.sun},${PAL.coral})` }}
        >
          <NodeIcon kind="chest" className="w-6 h-6 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold mb-2" style={{ color: PAL.ink }}>{quest.label}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: PAL.fog }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg,${PAL.sun},${PAL.coral})` }}
              />
            </div>
            <span className="text-xs font-black shrink-0" style={{ color: PAL.inkSoft }}>{quest.current}/{quest.target}</span>
          </div>
        </div>
      </div>
    </SideCard>
  )
}

function DailyChallengeCard({ challenge, t, onOpen }: { challenge: DailyChallenge; t: Record<string, string>; onOpen?: () => void }) {
  return (
    <SideCard>
      <SideCardHeader title={t.dailyChallenges} t={t} emoji="🎯" />
      <button
        type="button"
        onClick={onOpen}
        disabled={challenge.completed}
        className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-transform', !challenge.completed && 'hover:-translate-y-0.5')}
        style={{ background: challenge.completed ? '#F1F9F5' : PAL.cream, border: `2px solid ${challenge.completed ? PAL.grass : PAL.sun}` }}
      >
        <span
          aria-hidden
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: challenge.completed ? PAL.grass : 'white', border: challenge.completed ? 'none' : `2px solid ${PAL.sun}` }}
        >
          {challenge.completed ? <NodeIcon kind="check" className="w-4 h-4 text-white" /> : <span className="text-sm">{challenge.emoji}</span>}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn('truncate text-sm font-bold', challenge.completed && 'line-through')} style={{ color: challenge.completed ? '#9AA7AD' : PAL.ink }}>
            {challenge.title}
          </p>
          <p className="text-xs font-bold mt-0.5" style={{ color: challenge.completed ? PAL.grassDeep : PAL.coralDeep }}>
            {challenge.completed ? t.challengeDone : t.challengeCheck}
          </p>
        </div>
        <span className="text-xs font-black shrink-0" style={{ color: PAL.grapeDeep }}>+{challenge.xp_reward} XP</span>
      </button>
    </SideCard>
  )
}

function UnitBanner({ unitNumber, title, t }: { unitNumber: number; title?: string; t: Record<string, string> }) {
  return (
    <div className="relative z-10 w-full my-7 flex items-center gap-3">
      <div className="flex-1 h-[3px] rounded-full" style={{ background: `${PAL.fogDeep}` }} />
      <div
        className="flex items-center gap-2.5 rounded-full px-4 py-2 shrink-0"
        style={{ background: 'white', border: `3px solid ${PAL.sun}`, boxShadow: `0 3px 0 ${PAL.coral}55` }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
          style={{ background: `linear-gradient(160deg,${PAL.sun},${PAL.coral})` }}
        >
          {unitNumber}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black tracking-wider uppercase leading-none" style={{ color: PAL.coralDeep }}>{t.unit}</p>
          {title && <p className="text-sm font-black truncate leading-tight" style={{ color: PAL.ink }}>{title}</p>}
        </div>
      </div>
      <div className="flex-1 h-[3px] rounded-full" style={{ background: `${PAL.fogDeep}` }} />
    </div>
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

  const currentNodeRef = useRef<HTMLDivElement | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const pathContainerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [snakePath, setSnakePath] = useState<string>('')
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 })

  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el)
    else nodeRefs.current.delete(id)
  }

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
    currentNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeTrackId])

  useEffect(() => {
    const container = pathContainerRef.current
    if (!container || orderedSkills.length === 0) {
      setSnakePath('')
      return
    }

    const computePath = () => {
      const containerRect = container.getBoundingClientRect()
      const points: { x: number; y: number }[] = []

      for (const skill of orderedSkills) {
        const el = nodeRefs.current.get(skill.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        points.push({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        })
      }

      if (points.length < 2) {
        setSnakePath('')
        return
      }

      setSnakePath(buildSmoothPath(points))
      setSvgSize({ width: containerRect.width, height: containerRect.height })
    }

    computePath()

    const ro = new ResizeObserver(computePath)
    ro.observe(container)
    window.addEventListener('resize', computePath)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', computePath)
    }
  }, [orderedSkills, activeTrackId, switching])

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

  const handleNodeTap = (skill: Skill, unlocked: boolean) => {
    if (!unlocked) return
    if (skill.id === currentSkillId) goToCurrentLesson()
    else router.push(`/dashboard/path/${skill.id}`)
  }

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  return (
    <div
      dir={dir}
      className="min-h-screen font-[Cairo,sans-serif] flex flex-col relative overflow-hidden"
      style={{ color: PAL.ink, background: `linear-gradient(180deg, ${PAL.skyTop} 0%, ${PAL.skyBottom} 60%)` }}
    >
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap');` }} />

      {/* decorative sky: sun glow + drifting cloud blobs, purely atmospheric */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 260, height: 260, top: -80, insetInlineEnd: -60, background: `radial-gradient(circle, ${PAL.sun}bb, transparent 70%)` }} />
        <div className="absolute rounded-full bg-white/70" style={{ width: 90, height: 40, top: 60, insetInlineStart: '8%', filter: 'blur(1px)' }} />
        <div className="absolute rounded-full bg-white/60" style={{ width: 130, height: 50, top: 140, insetInlineEnd: '18%', filter: 'blur(1px)' }} />
        <div className="absolute rounded-full bg-white/50" style={{ width: 70, height: 32, top: 30, insetInlineStart: '38%', filter: 'blur(1px)' }} />
      </div>

      {/* ── Header: mascot greeting + world name + coin chips ── */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-7 pb-2 max-w-[1100px] mx-auto w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {activeTrack && (
              <h1 className="font-black text-2xl sm:text-3xl leading-tight truncate flex items-center gap-2" style={{ color: PAL.ink }}>
                <span className="text-2xl sm:text-3xl">{activeTrack.emoji || '🎮'}</span>
                {activeTrack.name}
              </h1>
            )}
            <p className="text-sm sm:text-base font-bold truncate" style={{ color: PAL.inkSoft }}>
              {t.curriculum} · {t.unit} {currentUnitNumber} {t.of} {totalUnits}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center gap-3 bg-white rounded-full px-4 py-2"
              style={{ border: `2.5px solid ${PAL.fogDeep}`, boxShadow: `0 3px 0 ${PAL.fogDeep}` }}
            >
              <StatChip src={ICONS.streak} value={streak} fallback="🔥" tone="coral" />
              <div className="w-px h-5" style={{ backgroundColor: PAL.fog }} />
              <StatChip src={ICONS.gems} value={gems} fallback="💎" tone="grape" />
            </div>

            {activeTrack && (
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowPicker(v => !v)}
                  aria-label="Switch track"
                  className="flex items-center justify-center w-11 h-11 bg-white rounded-full transition-transform hover:-translate-y-0.5"
                  style={{ border: `2.5px solid ${PAL.fogDeep}`, boxShadow: `0 3px 0 ${PAL.fogDeep}` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M7 10l5 5 5-5z"/></svg>
                </button>

                {showPicker && (
                  <div
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white rounded-2xl overflow-hidden z-30"
                    style={{ border: `2.5px solid ${PAL.fogDeep}`, boxShadow: `0 4px 0 ${PAL.fogDeep}` }}
                  >
                    {tracks.map(tr => (
                      <button
                        key={tr.id}
                        onClick={() => handleTrackSelect(tr.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                        style={{ background: tr.id === activeTrackId ? PAL.cream : 'transparent' }}
                      >
                        <span>{tr.emoji}</span>
                        <span className="flex-1 font-bold" style={{ color: PAL.ink }}>{tr.name}</span>
                        {tr.id === activeTrackId && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAL.grass }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* hill horizon separating the header sky from the play area */}
      <div className="relative z-10 w-full" style={{ marginTop: 8 }}>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[42px] sm:h-[56px]" aria-hidden>
          <path d="M0 40 Q150 0 320 30 T650 20 T1000 35 T1200 15 V60 H0 Z" fill={PAL.hill} />
          <path d="M0 52 Q200 30 420 48 T800 40 T1200 46 V60 H0 Z" fill={PAL.hillShade} opacity="0.5" />
        </svg>
      </div>

      <div className="flex-1 flex justify-center gap-8 px-4 pb-12 pt-2 max-w-[1100px] mx-auto w-full relative z-10" style={{ background: PAL.hillShade + '00' }}>
        <div className="relative flex-1 min-w-0 max-w-[640px]" style={{ background: PAL.hillShade, borderRadius: 32, padding: '1px' }}>
          <div className="rounded-[32px] px-3 sm:px-5 pt-5 pb-8" style={{ background: `linear-gradient(180deg, ${PAL.hillShade}, ${PAL.hillShade}dd 40%, ${PAL.hillShade}88)` }}>
          {switching ? (
            <div className="flex items-center justify-center py-20">
              <p className="font-black text-white/90">{t.switching}</p>
            </div>
          ) : allDone ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-3">🏆</p>
              <p className="text-xl font-black text-white">{t.allDone}</p>
              <p className="text-white/80 mt-2 font-bold">{t.allDoneSub}</p>
            </div>
          ) : currentSkill ? (
            <>
              {/* quest card: current stop + big PLAY button */}
              <div
                className="rounded-[26px] px-4 py-4 mb-8 flex items-center justify-between gap-3"
                style={{ background: 'white', border: `3px solid ${PAL.sun}`, boxShadow: `0 5px 0 ${PAL.coralDeep}` }}
              >
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.back()}
                    aria-label={t.back}
                    className="flex items-center gap-1.5 -ml-1 mb-1 transition-opacity hover:opacity-70"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
                    <span className="text-xs font-black tracking-wide uppercase" style={{ color: PAL.inkSoft }}>
                      {t.lessonOf} {currentLessonIdx} {t.of} {currentLessonCount || 1}
                    </span>
                  </button>
                  <h2 className="font-black text-lg leading-tight truncate flex items-center gap-2" style={{ color: PAL.ink }}>
                    <span className="text-xl">{currentSkill.emoji}</span>{currentSkill.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={goToCurrentLesson}
                  className="shrink-0 rounded-2xl px-5 py-3 font-black text-white text-sm transition-transform hover:-translate-y-0.5 active:translate-y-[2px]"
                  style={{ background: `linear-gradient(160deg,${PAL.sun},${PAL.coral})`, boxShadow: `0 4px 0 ${PAL.coralDeep}` }}
                >
                  {t.continueBtn} ▶
                </button>
              </div>

              <div ref={pathContainerRef} className="relative z-10 flex flex-col items-center w-full">
                {svgSize.width > 0 && (
                  <svg className="absolute top-0 left-0 pointer-events-none" width={svgSize.width} height={svgSize.height} style={{ zIndex: 0 }}>
                    <path d={snakePath} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={7} strokeLinecap="round" strokeDasharray="1 16" />
                  </svg>
                )}

                {orderedSkills.map((skill, idx) => {
                  const unlocked  = isUnlocked(skill)
                  const complete  = isComplete(skill.id)
                  const isCurrent = skill.id === currentSkillId
                  const offset    = OFFSET_PATTERN[idx % OFFSET_PATTERN.length]
                  const state: 'done' | 'current' | 'locked' =
                    complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
                  const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.current : skill.title

                  const startsNewUnit = idx !== 0 && idx % UNIT_SIZE === 0
                  const unitNumber = Math.floor(idx / UNIT_SIZE) + 1
                  const unitTitle = startsNewUnit ? skill.title : undefined
                  const avatar = !isCurrent ? avatarForIndex(idx) : null

                  return (
                    <div key={skill.id} className="w-full flex flex-col items-center">
                      {startsNewUnit && <UnitBanner unitNumber={unitNumber} title={unitTitle} t={t} />}

                      <div className="relative flex justify-center" style={{ zIndex: 1 }}>
                        {isCurrent && <JumpBubble text={t.jumpHere} />}
                        {avatar && <SideAvatar side={avatar.side} src={avatar.src} />}
                        <PathNode
                          state={state}
                          iconIndex={iconForIndex(idx)}
                          complete={complete}
                          onClick={() => handleNodeTap(skill, unlocked)}
                          disabled={!unlocked}
                          label={label}
                          offset={offset}
                          isCurrent={isCurrent}
                          nodeRef={(el) => {
                            setNodeRef(skill.id)(el)
                            if (isCurrent) currentNodeRef.current = el
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
          </div>
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pt-1">
          <LeaderboardCard entries={leaderboard} t={t} onViewAll={() => router.push('/dashboard/leaderboard')} />
          {dailyQuest && <DailyQuestCard quest={dailyQuest} t={t} />}
          {dailyChallenge && (
            <DailyChallengeCard challenge={dailyChallenge} t={t} onOpen={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)} />
          )}
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes jumpBob { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -5px); } }
        @keyframes ringPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes raySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes floatL { 0%, 100% { transform: translate(calc(-50% - clamp(110px, 28vw, 160px)), calc(-50% + clamp(110px, 16vw, 190px))) rotate(-2deg); } 50% { transform: translate(calc(-50% - clamp(110px, 28vw, 160px)), calc(-50% + clamp(104px, 15vw, 184px))) rotate(2deg); } }
        @keyframes floatR { 0%, 100% { transform: translate(calc(-50% + clamp(110px, 28vw, 160px)), calc(-50% + clamp(110px, 16vw, 190px))) rotate(2deg); } 50% { transform: translate(calc(-50% + clamp(110px, 28vw, 160px)), calc(-50% + clamp(104px, 15vw, 184px))) rotate(-2deg); } }
      ` }} />
    </div>
  )
}