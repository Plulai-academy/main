'use client'
// components/dashboard/SkillsClient.tsx
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/skills/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    continueBtn: 'Continue', startBtn: 'Start', jumpHere: 'JUMP HERE?',
    lessonOf: 'Lesson', of: 'of',
    locked: 'Locked lesson', completed: 'Completed lesson', current: 'Current lesson, tap to start',
    allDone: 'Track complete', allDoneSub: "You've mastered every skill here.",
    switching: 'Loading…', back: 'Back',
    leaderboard: 'Leaderboard', viewAll: 'View all', you: 'You',
    dailyQuests: 'Daily Quests', dailyChallenges: 'Daily Challenges',
    challengeDone: 'Completed! 🎉', challengeCheck: "Check today's challenge",
    unit: 'Unit',
  },
  ar: {
    continueBtn: 'واصل', startBtn: 'ابدأ', jumpHere: 'اقفز هنا؟',
    lessonOf: 'الدرس', of: 'من',
    locked: 'درس مقفل', completed: 'درس مكتمل', current: 'الدرس الحالي، اضغط للبدء',
    allDone: 'المسار مكتمل', allDoneSub: 'أتقنت كل المهارات هنا.',
    switching: 'جارٍ التحميل…', back: 'رجوع',
    leaderboard: 'لوحة الصدارة', viewAll: 'عرض الكل', you: 'أنت',
    dailyQuests: 'المهام اليومية', dailyChallenges: 'التحديات اليومية',
    challengeDone: 'مكتمل! 🎉', challengeCheck: 'تحقق من تحدي اليوم',
    unit: 'الوحدة',
  },
  fr: {
    continueBtn: 'Continuer', startBtn: 'Commencer', jumpHere: 'SAUTER ICI ?',
    lessonOf: 'Leçon', of: 'sur',
    locked: 'Leçon verrouillée', completed: 'Leçon terminée', current: 'Leçon actuelle, appuie pour commencer',
    allDone: 'Piste terminée', allDoneSub: 'Tu as maîtrisé toutes les compétences ici.',
    switching: 'Chargement…', back: 'Retour',
    leaderboard: 'Classement', viewAll: 'Tout voir', you: 'Toi',
    dailyQuests: 'Quêtes du jour', dailyChallenges: 'Défis du jour',
    challengeDone: 'Terminé ! 🎉', challengeCheck: 'Vérifie le défi du jour',
    unit: 'Unité',
  },
}

const ICONS = {
  streak: '/icons/streak.png',
  gems:   '/icons/gems.png',
  node:   ['/icons/book.png', '/icons/star.png', '/icons/chest.png', '/icons/trophy.png'],
}

// The three mascot character sets living in public/icons (idle pose used here
// since these are just decorative figures standing along the path, not tied
// to lesson state).
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

// A deliberately non-alternating left/right sequence so avatars don't ping-pong
// in a predictable left-right-left-right pattern down the path.
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

const OFFSET_PATTERN = [0, -1, 1, 0]

function offsetTransform(offset: number) {
  if (offset === 0) return undefined
  return `translateX(calc(${offset} * min(14vw, 54px)))`
}

function avatarForIndex(idx: number): { side: 'left' | 'right'; src: string } | null {
  if (idx === 0 || idx % AVATAR_EVERY !== 0) return null
  // Which occurrence this is (1st avatar, 2nd avatar, 3rd avatar, ...) — used
  // instead of idx directly so the side pattern and avatar choice stay
  // readable and aren't coupled to AVATAR_EVERY's value.
  const occurrence = idx / AVATAR_EVERY - 1
  const side = AVATAR_SIDE_PATTERN[occurrence % AVATAR_SIDE_PATTERN.length]
  const src = SIDE_AVATARS[occurrence % SIDE_AVATARS.length]
  return { side, src }
}

// Builds a smooth curve through every point using a Catmull-Rom -> cubic
// Bezier conversion (uniform parameterization, 1/6 tension). This makes the
// snake line glide through each bubble's real center instead of cutting
// flat segments between them.
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

type IconKind = 'book' | 'star' | 'chest' | 'trophy' | 'fastForward' | 'lock' | 'check' | 'bolt'

function NodeIcon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'book':
      return (
        <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Zm0 2h9v1H7a1 1 0 0 1 0-1Z"/></svg>
      )
    case 'star':
      return (
        <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
      )
    case 'chest':
      return (
        <svg {...common}><path d="M4 9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2h-8v-1h-2v1H4V9Zm0 4h6v1h2v-1h8v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Zm7 0v2h2v-2h-2Z"/></svg>
      )
    case 'trophy':
      return (
        <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
      )
    case 'fastForward':
      return (
        <svg {...common} viewBox="0 0 24 24"><path d="M4 5l8 7-8 7V5Zm9 0l8 7-8 7V5Z"/></svg>
      )
    case 'lock':
      return (
        <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
      )
    case 'check':
      return (
        <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
      )
    case 'bolt':
      return (
        <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
      )
  }
}

function iconForIndex(idx: number): number {
  return idx % ICONS.node.length
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
      ? { face: '#1CB0F6', base: '#15527A', icon: '#FFFFFF' }
      : state === 'done'
      ? { face: '#27B883', base: '#1A4D3C', icon: '#FFFFFF' }
      : { face: '#3A4450', base: '#262E37', icon: '#8A96A3' }

  const iconSrc = ICONS.node[iconIndex]

  return (
    <div
      ref={nodeRef}
      className="relative flex-shrink-0"
      style={{
        transform: offsetTransform(offset),
        width: 'clamp(56px, 17vw, 68px)',
        height: 'clamp(48px, 14.5vw, 58px)',
        marginBottom: 'clamp(24px, 7vw, 36px)',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-[50%/52%]"
        style={{ backgroundColor: palette.base, transform: 'translateY(4px)' }}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'absolute left-0 right-0 top-0 rounded-[50%/54%] flex items-center justify-center',
          'transition-transform duration-100 ease-out',
          !disabled && 'hover:-translate-y-0.5 active:translate-y-[2px]',
          disabled && 'cursor-default',
        )}
        style={{
          height: '87%',
          backgroundColor: palette.face,
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      >
        {!imgError ? (
        <img
          src={iconSrc}
          alt=""
          className="w-[44%] h-[44%] object-contain"
          style={{
            filter: 'brightness(0) invert(1)',
            opacity: state === 'locked' ? 0.6 : 1,
          }}
          onError={() => setImgError(true)}
        />
        ) : (
          <NodeIcon
            kind={isCurrent ? 'fastForward' : 'book'}
            className="w-[40%] h-[40%]"
            style={{ color: palette.icon } as React.CSSProperties}
          />
        )}

        {complete && !isCurrent && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FAA918', boxShadow: '0 1px 0 rgba(0,0,0,0.2)' }}
          >
            <NodeIcon kind="check" className="w-3 h-3 text-white" />
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
      style={{
        top: 'clamp(-46px, -13vw, -42px)',
        animation: 'jumpBob 1.6s ease-in-out infinite',
      }}
    >
      <div
        className="relative rounded-2xl px-4 py-2 bg-white shadow-[0_4px_0_rgba(0,0,0,0.15)]"
        style={{ color: '#1CB0F6' }}
      >
        <span className="font-extrabold tracking-wide text-sm whitespace-nowrap">
          {text}
        </span>
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-3 h-3 bg-white rotate-45"
        />
      </div>
    </div>
  )
}

function SideAvatar({
  side, src,
}: {
  side: 'left' | 'right'
  src: string
}) {
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
      }}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-contain object-bottom"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function SideCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#10151B] border border-white/10 rounded-2xl p-5', className)}>
      {children}
    </div>
  )
}

function SideCardHeader({ title, onViewAll, t }: { title: string; onViewAll?: () => void; t: Record<string, string> }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-base">{title}</h3>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-xs font-extrabold tracking-wide uppercase text-[#1CB0F6] hover:text-[#14D4F4] transition-colors"
        >
          {t.viewAll}
        </button>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '#FFC93C' : rank === 2 ? '#B9C2CC' : rank === 3 ? '#E8915A' : null
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
      style={{
        backgroundColor: medal ?? 'rgba(245,245,245,0.08)',
        color: medal ? '#1A1A1A' : 'rgba(245,245,245,0.6)',
      }}
    >
      {rank}
    </div>
  )
}

function LeaderboardAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [errored, setErrored] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (avatarUrl && !errored) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10"
        onError={() => setErrored(true)}
      />
    )
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
      style={{ backgroundColor: 'rgba(245,245,245,0.08)', color: 'rgba(245,245,245,0.6)' }}
    >
      {initial}
    </div>
  )
}

function LeaderboardCard({
  entries, t, onViewAll,
}: {
  entries: LeaderboardEntry[]
  t: Record<string, string>
  onViewAll: () => void
}) {
  const top = entries.slice(0, 5)
  return (
    <SideCard>
      <SideCardHeader title={t.leaderboard} onViewAll={onViewAll} t={t} />
      <div className="flex flex-col gap-1.5">
        {top.map(entry => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-3 px-2.5 py-2 rounded-xl',
              entry.is_current_user && 'bg-[#16324A] border border-[#1CB0F6]/40',
            )}
          >
            {entry.rank_global != null ? (
              <RankBadge rank={entry.rank_global} />
            ) : (
              <div className="w-8 h-8 shrink-0" />
            )}
            <LeaderboardAvatar name={entry.name} avatarUrl={entry.avatar_url} />
            <span className={cn('flex-1 min-w-0 truncate text-[15px]', entry.is_current_user ? 'font-black' : 'font-bold')}>
              {entry.is_current_user ? t.you : entry.name}
            </span>
            <span className="text-sm font-bold text-[#F5F5F5]/60 shrink-0">{entry.xp} XP</span>
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
        <span className="shrink-0" style={{ color: '#FAA918' }}>
          <NodeIcon kind="bolt" className="w-7 h-7" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold mb-2">{quest.label}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: '#FAA918' }}
              />
            </div>
            <span className="text-xs font-bold text-[#F5F5F5]/50 shrink-0">{quest.current} / {quest.target}</span>
          </div>
        </div>
      </div>
    </SideCard>
  )
}

function DailyChallengeCard({
  challenge, t, onOpen,
}: {
  challenge: DailyChallenge
  t: Record<string, string>
  onOpen?: () => void
}) {
  return (
    <SideCard>
      <SideCardHeader title={t.dailyChallenges} t={t} />
      <button
        type="button"
        onClick={onOpen}
        disabled={challenge.completed}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors',
          challenge.completed
            ? 'border-white/5 bg-white/[0.02] cursor-default'
            : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]',
        )}
      >
        <span
          aria-hidden
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: challenge.completed ? '#3CB371' : 'rgba(245,245,245,0.08)',
          }}
        >
          {challenge.completed ? (
            <NodeIcon kind="check" className="w-4 h-4 text-white" />
          ) : (
            <span className="text-sm">{challenge.emoji}</span>
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'truncate text-sm font-bold',
              challenge.completed && 'line-through text-[#F5F5F5]/40',
            )}
          >
            {challenge.title}
          </p>
          <p
            className={cn(
              'text-xs font-bold mt-0.5',
              challenge.completed ? 'text-[#3CB371]' : 'text-[#1CB0F6]',
            )}
          >
            {challenge.completed ? t.challengeDone : t.challengeCheck}
          </p>
        </div>
        <span className="text-xs font-black text-[#1CB0F6] shrink-0">+{challenge.xp_reward} XP</span>
      </button>
    </SideCard>
  )
}

function UnitBanner({
  unitNumber, title, t,
}: {
  unitNumber: number
  title?: string
  t: Record<string, string>
}) {
  return (
    <div
      className="relative z-10 w-full rounded-2xl px-4 py-3 my-6 shadow-[0_4px_0_rgba(0,0,0,0.25)]"
      style={{ backgroundColor: '#1CB0F6' }}
    >
      <p className="text-xs font-black tracking-wider uppercase text-white/90">
        {t.unit} {unitNumber}
      </p>
      {title && (
        <h3 className="text-white font-black text-lg leading-tight truncate">
          {title}
        </h3>
      )}
    </div>
  )
}

export default function SkillsClient({
  userId, tracks, initialTrackId, skills, skillProgress, lessonCountMap,
  language, streak, gems, initialCurrentSkillId, initialFirstIncompleteLessonId,
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

  // --- snake-line path measuring ---
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
    !skill.required_nodes?.length ||
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)
  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  const activeTrack = tracks.find(tr => tr.id === activeTrackId) ?? null
  const currentSkill = orderedSkills.find(s => s.id === currentSkillId) ?? null
  const allDone = orderedSkills.length > 0 && orderedSkills.every(s => isComplete(s.id))

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

  // recompute the snake path whenever the visible skill list or layout changes
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
        // getBoundingClientRect() reflects this element's own CSS transform
        // (the zigzag offset lives on this exact node), so these points are
        // the true on-screen centers of each bubble.
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
      // Optionally surface a toast/banner here so the user knows
      // their selection won't persist across a refresh.
    }

    try {
      const res = await fetch('/api/skills/resolve-track', {
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
    if (firstIncompleteLessonId) router.push(`/dashboard/skills/${currentSkill.id}/lesson/${firstIncompleteLessonId}`)
    else router.push(`/dashboard/skills/${currentSkill.id}`)
  }

  const handleNodeTap = (skill: Skill, unlocked: boolean) => {
    if (!unlocked) return
    if (skill.id === currentSkillId) goToCurrentLesson()
    else router.push(`/dashboard/skills/${skill.id}`)
  }

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  return (
    <div dir={dir} className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] font-[Nunito,sans-serif] flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');`}</style>

      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#F5F5F5]/90 font-extrabold">
            <img src={ICONS.streak} alt="" className="w-5 h-5"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }}/>
            {streak}
          </div>
          <div className="flex items-center gap-1.5 text-[#F5F5F5]/90 font-extrabold">
            <img src={ICONS.gems} alt="" className="w-5 h-5"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }}/>
            {gems}
          </div>
        </div>

        {activeTrack && (
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowPicker(v => !v)}
              className="flex items-center gap-1.5 text-[#F5F5F5]/90 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors max-w-[40vw] sm:max-w-none font-extrabold"
            >
              <span>{activeTrack.emoji}</span>
              <span className="truncate">{activeTrack.name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
            </button>

            {showPicker && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141A21] border border-white/10 rounded-xl overflow-hidden shadow-xl z-30">
                {tracks.map(tr => (
                  <button
                    key={tr.id}
                    onClick={() => handleTrackSelect(tr.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      tr.id === activeTrackId ? 'bg-[#1CB0F6]/12' : 'hover:bg-white/5',
                    )}
                  >
                    <span>{tr.emoji}</span>
                    <span className="flex-1 font-bold">{tr.name}</span>
                    {tr.id === activeTrackId && (
                      <span className="w-2 h-2 rounded-full bg-[#1CB0F6]"/>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center gap-8 px-4 pb-12 pt-4 max-w-[1100px] mx-auto w-full">
        <div className="relative flex-1 min-w-0 max-w-[640px]">
          {switching ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-[#F5F5F5]/70 font-bold">{t.switching}</p>
            </div>
          ) : allDone ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-3">🏆</p>
              <p className="text-xl font-black">{t.allDone}</p>
              <p className="text-[#F5F5F5]/60 mt-2">{t.allDoneSub}</p>
            </div>
          ) : currentSkill ? (
            <>
              <div className="bg-[#1CB0F6] rounded-2xl px-4 py-3 mb-8 flex items-start justify-between gap-3 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.back()}
                    aria-label={t.back}
                    className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity -ml-1 mb-0.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
                    <span className="text-xs font-black tracking-wider uppercase text-white/90">
                      {t.lessonOf} {currentLessonIdx} {t.of} {currentLessonCount || 1}
                    </span>
                  </button>
                  <h2 className="text-white font-black text-lg leading-tight truncate">{currentSkill.title}</h2>
                </div>
                <div className="text-2xl shrink-0">{currentSkill.emoji}</div>
              </div>

              <div ref={pathContainerRef} className="relative z-10 flex flex-col items-center w-full">
                {svgSize.width > 0 && (
                  <svg
                    className="absolute top-0 left-0 pointer-events-none"
                    width={svgSize.width}
                    height={svgSize.height}
                    style={{ zIndex: 0 }}
                  >
                    <path
                      d={snakePath}
                      fill="none"
                      stroke="#2A3440"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray="2 14"
                    />
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
                      {startsNewUnit && (
                        <UnitBanner unitNumber={unitNumber} title={unitTitle} t={t} />
                      )}

                      <div
                        className="relative flex justify-center"
                        style={{ zIndex: 1 }}
                      >
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

        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pt-1">
          <LeaderboardCard
            entries={leaderboard}
            t={t}
            onViewAll={() => router.push('/dashboard/leaderboard')}
          />
          {dailyQuest && <DailyQuestCard quest={dailyQuest} t={t} />}
          {dailyChallenge && (
            <DailyChallengeCard
              challenge={dailyChallenge}
              t={t}
              onOpen={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)}
            />
          )}
        </aside>
      </div>

      <style>{`
        @keyframes jumpBob {
          0%, 100% { transform: translate(-50%, 0); }
          50%      { transform: translate(-50%, -4px); }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  )
}