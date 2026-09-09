'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v2 — brand palette, card/wallet language
// ──────────────────────────────────────────────────
// Dropped the "game forest" concept entirely. This version follows the
// actual reference apps: a soft lagoon background, cream/white reward
// cards, a streak strip of flame pips, a gem balance card, a bold coral
// "claim/play" pill, and badge-style path nodes with a gold ring on the
// current one. No illustrated mascots, no sky/hill backdrop, no bounce-fest
// — one calm pulse on the current node is the only ambient motion.
//
// All props, hooks and routing logic are unchanged from the original.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    continueBtn: 'Continue', startBtn: 'Start', jumpHere: 'Start here',
    lessonOf: 'Level', of: 'of',
    locked: 'Locked lesson', completed: 'Completed lesson', current: 'Current lesson, tap to start',
    allDone: 'Track complete', allDoneSub: "You've mastered every skill here.",
    switching: 'Loading…', back: 'Back',
    leaderboard: 'Leaderboard', viewAll: 'View all', you: 'You',
    dailyQuests: 'Daily quest', dailyChallenges: 'Daily challenge',
    challengeDone: 'Completed', challengeCheck: "Check today's challenge",
    unit: 'Unit', curriculum: 'Class curriculum',
    streakLabel: 'day streak', gemsLabel: 'your balance',
  },
  ar: {
    continueBtn: 'واصل', startBtn: 'ابدأ', jumpHere: 'ابدأ من هنا',
    lessonOf: 'الدرس', of: 'من',
    locked: 'درس مقفل', completed: 'درس مكتمل', current: 'الدرس الحالي، اضغط للبدء',
    allDone: 'المسار مكتمل', allDoneSub: 'أتقنت كل المهارات هنا.',
    switching: 'جارٍ التحميل…', back: 'رجوع',
    leaderboard: 'لوحة الصدارة', viewAll: 'عرض الكل', you: 'أنت',
    dailyQuests: 'تحدي اليوم', dailyChallenges: 'مهمة اليوم',
    challengeDone: 'مكتمل', challengeCheck: 'تحقق من تحدي اليوم',
    unit: 'الوحدة', curriculum: 'منهج الصف',
    streakLabel: 'أيام متتالية', gemsLabel: 'رصيدك الحالي',
  },
  fr: {
    continueBtn: 'Continuer', startBtn: 'Commencer', jumpHere: 'Commence ici',
    lessonOf: 'Leçon', of: 'sur',
    locked: 'Leçon verrouillée', completed: 'Leçon terminée', current: 'Leçon actuelle, appuie pour commencer',
    allDone: 'Piste terminée', allDoneSub: 'Tu as maîtrisé toutes les compétences ici.',
    switching: 'Chargement…', back: 'Retour',
    leaderboard: 'Classement', viewAll: 'Tout voir', you: 'Toi',
    dailyQuests: 'Défi du jour', dailyChallenges: 'Mission du jour',
    challengeDone: 'Terminé', challengeCheck: 'Vérifie le défi du jour',
    unit: 'Unité', curriculum: 'Programme de la classe',
    streakLabel: 'jours de suite', gemsLabel: 'ton solde',
  },
}

const ICONS = {
  streak: '/icons/streak.png',
  gems:   '/icons/gems.png',
  node:   ['/icons/book.png', '/icons/star.png', '/icons/chest.png', '/icons/trophy.png'],
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

// ── brand palette (Energetic / B2C mode) ────────────────────────────────
const PAL = {
  lagoon:      '#EAF7F4', // page background
  lagoonFill:  '#D9F1EC', // secondary fill / locked state
  reef:        '#17D9C0', // brand teal — completed, accents
  reefDeep:    '#0FA895',
  sun:         '#FFB930', // gold — current node, streak
  sunDeep:     '#E39D1C',
  coral:       '#FF6B57', // CTA / primary action
  coralDeep:   '#E9503C',
  error:       '#E15B71', // forms only — not used here
  pearl:       '#F6F3EA', // warm card background (hero band)
  white:       '#FFFFFF',
  ink:         '#29394A', // body text
  depth:       '#0D2B32', // headings / high-contrast text
  inkSoft:     '#6C8079',
}

function offsetTransform(offset: number) {
  if (offset === 0) return undefined
  return `translateX(calc(${offset} * min(10vw, 40px)))`
}
const OFFSET_PATTERN = [0, -1, 1, 0]

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

type IconKind = 'book' | 'star' | 'chest' | 'trophy' | 'lock' | 'check' | 'flame' | 'gem' | 'chevron'

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
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z"/></svg>
    case 'gem':
      return <svg {...common}><path d="M6 4h12l3 5-9 11L3 9l3-5Zm1.8 2L5.5 9h4.9L7.8 6Zm3.4 0-2.4 3h6.4l-2.4-3h-1.6Zm3.4 0-2.3 3h4.9L14.6 6ZM6.2 11l4.9 7-4-7h-.9Zm11.6 0h-.9l-4 7 4.9-7ZM9.4 11l2.6 6.5L14.6 11H9.4Z"/></svg>
    case 'chevron':
      return <svg {...common}><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  }
}

function iconForIndex(idx: number): number {
  return idx % ICONS.node.length
}

// ── streak strip: a row of flame pips, lit from the right, echoing the
// reference app's 7-day streak row ──────────────────────────────────────
function FlameStrip({ streak }: { streak: number }) {
  const lit = Math.min(streak, 7)
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 7 }).map((_, i) => {
        const isLit = i >= 7 - lit
        return (
          <span
            key={i}
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: isLit ? `linear-gradient(160deg,${PAL.sun},${PAL.coral})` : PAL.lagoonFill }}
          >
            <NodeIcon kind="flame" className="w-3.5 h-3.5" style={{ color: isLit ? '#FFFFFF' : '#AFC7C0' }} />
          </span>
        )
      })}
    </div>
  )
}

function HeroStat({
  icon, label, value, sub, tone,
}: {
  icon: IconKind
  label: string
  value: number
  sub?: React.ReactNode
  tone: 'sun' | 'reef'
}) {
  const grad = tone === 'sun' ? `linear-gradient(160deg,${PAL.sun},${PAL.coral})` : `linear-gradient(160deg,${PAL.reef},${PAL.reefDeep})`
  return (
    <div className="flex-1 rounded-[20px] px-4 py-3.5" style={{ background: PAL.pearl, border: `1px solid ${PAL.lagoonFill}` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: grad }}>
          <NodeIcon kind={icon} className="w-4 h-4 text-white" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: PAL.inkSoft }}>{label}</span>
      </div>
      <p className="text-2xl font-black leading-none" style={{ color: PAL.depth }}>{value.toLocaleString()}</p>
      {sub && <div className="mt-2">{sub}</div>}
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
      ? { face: PAL.white, ring: PAL.sun, icon: PAL.coralDeep }
      : state === 'done'
      ? { face: `linear-gradient(160deg,${PAL.reef},${PAL.reefDeep})`, ring: 'transparent', icon: '#FFFFFF' }
      : { face: PAL.lagoonFill, ring: 'transparent', icon: '#9DB8B0' }

  const iconSrc = ICONS.node[iconIndex]

  return (
    <div
      ref={nodeRef}
      className="relative flex-shrink-0"
      style={{
        transform: offsetTransform(offset),
        width: 'clamp(56px, 16vw, 66px)',
        height: 'clamp(56px, 16vw, 66px)',
        marginBottom: 'clamp(22px, 6.5vw, 32px)',
      }}
    >
      {isCurrent && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 6px ${PAL.sun}33`, animation: 'ringPulse 2s ease-out infinite' }}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-150 ease-out',
          !disabled && 'hover:-translate-y-0.5 active:translate-y-[1px]',
          disabled && 'cursor-default',
        )}
        style={{
          background: palette.face,
          boxShadow: state === 'current' ? `0 0 0 3px ${palette.ring}, 0 3px 8px rgba(13,43,50,0.12)` : '0 2px 6px rgba(13,43,50,0.08)',
        }}
      >
        {state === 'locked' ? (
          <NodeIcon kind="lock" className="w-[38%] h-[38%]" style={{ color: palette.icon }} />
        ) : !imgError ? (
          <img
            src={iconSrc}
            alt=""
            className="w-[42%] h-[42%] object-contain"
            style={{ filter: state === 'current' ? 'none' : 'brightness(0) invert(1)', opacity: state === 'current' ? 0.85 : 1 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <NodeIcon kind={state === 'current' ? 'star' : 'book'} className="w-[40%] h-[40%]" style={{ color: palette.icon }} />
        )}

        {complete && !isCurrent && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: PAL.sun, boxShadow: '0 1px 2px rgba(13,43,50,0.25)' }}
          >
            <NodeIcon kind="check" className="w-3 h-3" style={{ color: PAL.depth }} />
          </span>
        )}
      </button>
    </div>
  )
}

function StartTag({ text }: { text: string }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-20 select-none pointer-events-none" style={{ top: 'clamp(-38px, -10vw, -34px)' }}>
      <div className="rounded-full px-3.5 py-1.5" style={{ background: PAL.coral, color: '#FFFFFF' }}>
        <span className="font-black text-xs whitespace-nowrap">{text}</span>
      </div>
    </div>
  )
}

function SideCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl p-5', className)} style={{ border: `1px solid ${PAL.lagoonFill}`, boxShadow: '0 2px 10px rgba(13,43,50,0.05)' }}>
      {children}
    </div>
  )
}

function SideCardHeader({ title, onViewAll, t }: { title: string; onViewAll?: () => void; t: Record<string, string> }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-base" style={{ color: PAL.depth }}>{title}</h3>
      {onViewAll && (
        <button onClick={onViewAll} className="text-xs font-extrabold tracking-wide" style={{ color: PAL.coralDeep }}>
          {t.viewAll}
        </button>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? PAL.sun : rank === 2 ? '#C7D2CC' : rank === 3 ? '#E8915A' : null
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
      style={{ backgroundColor: medal ?? PAL.lagoonFill, color: medal ? PAL.depth : PAL.inkSoft }}
    >
      {rank}
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
      <SideCardHeader title={t.leaderboard} onViewAll={onViewAll} t={t} />
      <div className="flex flex-col gap-1.5">
        {top.map(entry => (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl"
            style={entry.is_current_user ? { background: `${PAL.sun}1A`, border: `1px solid ${PAL.sun}66` } : undefined}
          >
            {entry.rank_global != null ? <RankBadge rank={entry.rank_global} /> : <div className="w-8 h-8 shrink-0" />}
            <LeaderboardAvatar name={entry.name} avatarUrl={entry.avatar_url} />
            <span className={cn('flex-1 min-w-0 truncate text-[15px]', entry.is_current_user ? 'font-black' : 'font-bold')} style={{ color: PAL.ink }}>
              {entry.is_current_user ? t.you : entry.name}
            </span>
            <span className="text-sm font-bold shrink-0" style={{ color: PAL.inkSoft }}>{entry.xp} XP</span>
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
      <SideCardHeader title={t.dailyQuests} t={t} />
      <div className="flex items-center gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PAL.reef}1F` }}>
          <NodeIcon kind="chest" className="w-5 h-5" style={{ color: PAL.reefDeep }} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold mb-2" style={{ color: PAL.ink }}>{quest.label}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: PAL.lagoonFill }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: PAL.reef }} />
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: PAL.inkSoft }}>{quest.current} / {quest.target}</span>
          </div>
        </div>
      </div>
    </SideCard>
  )
}

function DailyChallengeCard({ challenge, t, onOpen }: { challenge: DailyChallenge; t: Record<string, string>; onOpen?: () => void }) {
  return (
    <SideCard>
      <SideCardHeader title={t.dailyChallenges} t={t} />
      <button
        type="button"
        onClick={onOpen}
        disabled={challenge.completed}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
        style={{ background: PAL.lagoon }}
      >
        <span
          aria-hidden
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: challenge.completed ? PAL.reef : PAL.white, border: challenge.completed ? 'none' : `1px solid ${PAL.lagoonFill}` }}
        >
          {challenge.completed ? <NodeIcon kind="check" className="w-4 h-4 text-white" /> : <span className="text-sm">{challenge.emoji}</span>}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn('truncate text-sm font-bold', challenge.completed && 'line-through')} style={{ color: challenge.completed ? '#9AA7AD' : PAL.ink }}>
            {challenge.title}
          </p>
          <p className="text-xs font-bold mt-0.5" style={{ color: challenge.completed ? PAL.reefDeep : PAL.coralDeep }}>
            {challenge.completed ? t.challengeDone : t.challengeCheck}
          </p>
        </div>
        <span className="text-xs font-black shrink-0 mr-1" style={{ color: PAL.sunDeep }}>+{challenge.xp_reward} XP</span>
        <NodeIcon kind="chevron" className="w-4 h-4 shrink-0 rtl:rotate-180" style={{ color: PAL.inkSoft }} />
      </button>
    </SideCard>
  )
}

function UnitBanner({ unitNumber, title, t }: { unitNumber: number; title?: string; t: Record<string, string> }) {
  return (
    <div className="relative z-10 w-full my-6 flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: PAL.lagoonFill }} />
      <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 shrink-0" style={{ background: PAL.white, border: `1px solid ${PAL.lagoonFill}` }}>
        <span className="text-[11px] font-black tracking-wide" style={{ color: PAL.reefDeep }}>{t.unit} {unitNumber}</span>
        {title && <span className="text-xs font-bold truncate max-w-[160px]" style={{ color: PAL.inkSoft }}>· {title}</span>}
      </div>
      <div className="flex-1 h-px" style={{ background: PAL.lagoonFill }} />
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
    <div dir={dir} className="min-h-screen font-[Cairo,sans-serif] flex flex-col" style={{ background: PAL.lagoon, color: PAL.ink }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap');` }} />

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-2 max-w-[1100px] mx-auto w-full">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {activeTrack && (
              <h1 className="font-black text-2xl sm:text-3xl leading-tight truncate" style={{ color: PAL.depth }}>
                {activeTrack.name}
              </h1>
            )}
            <p className="text-sm sm:text-base font-bold truncate" style={{ color: PAL.inkSoft }}>
              {t.curriculum} · {t.unit} {currentUnitNumber} {t.of} {totalUnits}
            </p>
          </div>

          {activeTrack && (
            <div className="relative shrink-0" ref={pickerRef}>
              <button
                onClick={() => setShowPicker(v => !v)}
                aria-label="Switch track"
                className="flex items-center gap-2 bg-white rounded-full pl-3.5 pr-2.5 py-2 transition-colors"
                style={{ border: `1px solid ${PAL.lagoonFill}` }}
              >
                <span className="text-lg">{activeTrack.emoji}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M7 10l5 5 5-5z"/></svg>
              </button>

              {showPicker && (
                <div
                  className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white rounded-xl overflow-hidden z-30"
                  style={{ border: `1px solid ${PAL.lagoonFill}`, boxShadow: '0 8px 24px rgba(13,43,50,0.12)' }}
                >
                  {tracks.map(tr => (
                    <button
                      key={tr.id}
                      onClick={() => handleTrackSelect(tr.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ background: tr.id === activeTrackId ? PAL.lagoon : 'transparent' }}
                    >
                      <span>{tr.emoji}</span>
                      <span className="flex-1 font-bold" style={{ color: PAL.ink }}>{tr.name}</span>
                      {tr.id === activeTrackId && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAL.reef }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* wallet-style stat row: streak strip + gem balance, like the reference app's stat boxes */}
        <div className="flex gap-3">
          <HeroStat
            icon="flame" label={t.streakLabel} value={streak} tone="sun"
            sub={<FlameStrip streak={streak} />}
          />
          <HeroStat
            icon="gem" label={t.gemsLabel} value={gems} tone="reef"
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center gap-8 px-4 pb-12 pt-4 max-w-[1100px] mx-auto w-full">
        <div className="relative flex-1 min-w-0 max-w-[640px]">
          {switching ? (
            <div className="flex items-center justify-center py-20">
              <p className="font-bold" style={{ color: PAL.inkSoft }}>{t.switching}</p>
            </div>
          ) : allDone ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-3">🏆</p>
              <p className="text-xl font-black" style={{ color: PAL.depth }}>{t.allDone}</p>
              <p className="mt-2 font-bold" style={{ color: PAL.inkSoft }}>{t.allDoneSub}</p>
            </div>
          ) : currentSkill ? (
            <>
              {/* current-lesson reward card */}
              <div
                className="rounded-2xl px-4 py-4 mb-8 flex items-center justify-between gap-3"
                style={{ background: PAL.pearl, border: `1px solid ${PAL.lagoonFill}` }}
              >
                <div className="flex-1 min-w-0">
                  <button onClick={() => router.back()} aria-label={t.back} className="flex items-center gap-1.5 -ml-1 mb-1 opacity-80 hover:opacity-100 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
                    <span className="text-xs font-black tracking-wide uppercase" style={{ color: PAL.inkSoft }}>
                      {t.lessonOf} {currentLessonIdx} {t.of} {currentLessonCount || 1}
                    </span>
                  </button>
                  <h2 className="font-black text-lg leading-tight truncate" style={{ color: PAL.depth }}>{currentSkill.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={goToCurrentLesson}
                  className="shrink-0 rounded-full px-5 py-3 font-black text-sm text-white transition-transform hover:-translate-y-0.5 active:translate-y-[1px]"
                  style={{ background: PAL.coral, boxShadow: `0 3px 10px ${PAL.coral}55` }}
                >
                  {t.continueBtn}
                </button>
              </div>

              <div ref={pathContainerRef} className="relative z-10 flex flex-col items-center w-full">
                {svgSize.width > 0 && (
                  <svg className="absolute top-0 left-0 pointer-events-none" width={svgSize.width} height={svgSize.height} style={{ zIndex: 0 }}>
                    <path d={snakePath} fill="none" stroke={PAL.lagoonFill} strokeWidth={5} strokeLinecap="round" />
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

                  return (
                    <div key={skill.id} className="w-full flex flex-col items-center">
                      {startsNewUnit && <UnitBanner unitNumber={unitNumber} title={unitTitle} t={t} />}

                      <div className="relative flex justify-center" style={{ zIndex: 1 }}>
                        {isCurrent && <StartTag text={t.jumpHere} />}
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

        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pt-1">
          <LeaderboardCard entries={leaderboard} t={t} onViewAll={() => router.push('/dashboard/leaderboard')} />
          {dailyQuest && <DailyQuestCard quest={dailyQuest} t={t} />}
          {dailyChallenge && (
            <DailyChallengeCard challenge={dailyChallenge} t={t} onOpen={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)} />
          )}
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ringPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.35); opacity: 0; } }
      ` }} />
    </div>
  )
}