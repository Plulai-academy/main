'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v15 — five islands, one quiet rail card
// ────────────────────────────────────────────────
// Two fixes from feedback:
//
//   1. Every unit was rendering the exact same blob silhouette — fine
//      once, boring by unit three. There are now 5 distinct island
//      shapes (different silhouette, different scatter of stops,
//      different soft color wash) that cycle by unit index, so a kid
//      scrolling through several units actually sees different islands
//      instead of the same shape re-skinned.
//
//   2. The rail had three cards competing for attention (level/streak,
//      weekly quest, leaderboard). Cut to just the one — level + streak
//      + XP in a single badge, still tied visually to the hero. Quest
//      and leaderboard are gone from this screen entirely; they can
//      live on their own page/tab when you're ready to build it, this
//      component just doesn't render them anymore.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Play', lessonOf: 'Lesson', of: 'of', missions: 'missions', unit: 'Unit',
    locked: 'Locked', completed: 'Completed', current: 'Up next', now: 'Now',
    allDone: 'World complete!', allDoneSub: "You've cleared every level here.",
    switching: 'Loading…',
    hello: 'Hello', subtitle: "Let's pick up where you left off.",
    streak: 'day streak', level: 'Level', totalXp: 'Total XP',
  },
  ar: {
    play: 'العب', lessonOf: 'الدرس', of: 'من', missions: 'مهام', unit: 'الوحدة',
    locked: 'مقفل', completed: 'مكتمل', current: 'التالي', now: 'الآن',
    allDone: 'أنهيت هذا العالم! 🏆', allDoneSub: 'أكملت كل المستويات هنا.',
    switching: 'جارٍ التحميل…',
    hello: 'أهلاً', subtitle: 'يلا نكمل من وين وقفت.',
    streak: 'أيام متتالية', level: 'المستوى', totalXp: 'مجموع النقاط',
  },
  fr: {
    play: 'Jouer', lessonOf: 'Leçon', of: 'sur', missions: 'missions', unit: 'Unité',
    locked: 'Verrouillé', completed: 'Terminé', current: 'À suivre', now: 'Maintenant',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as fini tous les niveaux ici.',
    switching: 'Chargement…',
    hello: 'Bonjour', subtitle: 'On continue où tu t\u2019es arrêté.',
    streak: 'jours de suite', level: 'Niveau', totalXp: 'XP total',
  },
}

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
  // still accepted for backward compatibility / a future leaderboard page —
  // not rendered on this screen anymore.
  leaderboard?: LeaderboardEntry[]
  dailyQuest?: DailyQuest
  dailyChallenge?: DailyChallenge | null
  totalTimeMins?: number
  userName?: string
  characterImageUrl?: string
  mascotName?: string
  userTotalXp?: number
  heroBackgroundImageUrl?: string
  /** real chapter/unit names, indexed 0, 1, 2… — falls back to the first
   * skill's own title per island if not provided. */
  unitTitles?: string[]
}

// ── Brand tokens — premium set drives the shell; energetic set is
// reserved for progress/interactive moments (and now, island washes).
const PAL = {
  depth: '#0D2B32',
  depthSoft: '#153B44',
  pearlWhite: '#F6F3EA',
  pearlGold: '#D4A24C',
  pearlGoldSoft: '#E9CE9A',
  goldDeep: '#B9791A',
  ink: '#29394A',
  inkSoft: '#5C7080',
  inkFaint: '#98A6B2',
  white: '#FFFFFF',
  reef: '#17D9C0',
  reefDeep: '#0EA294',
  gold: '#FFB930',
  coral: '#FF6B57',
  coralDeep: '#E24E3C',
  islandLockFrom: '#F0EEE6',
  islandLockTo: '#E6E3D8',
}
const SOFT_SHADOW = '0 2px 14px rgba(13,43,50,0.06)'

function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*[—-]\s*/i, '').trim() || title
}

type IconKind = 'lock' | 'check' | 'flame' | 'play' | 'chevronR' | 'star' | 'gem'

function Icon({ kind, className, style, strokeWidth = 2 }: { kind: IconKind; className?: string; style?: React.CSSProperties; strokeWidth?: number }) {
  const filled = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  const lined = { className, style, fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'lock':
      return <svg {...lined}><rect x="6" y="10.5" width="12" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>
    case 'check':
      return <svg {...filled}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'flame':
      return <svg {...filled}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z"/></svg>
    case 'play':
      return <svg {...filled}><path d="M8 5v14l11-7L8 5Z"/></svg>
    case 'star':
      return <svg {...filled}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'gem':
      return <svg {...filled}><path d="M6 4h12l3 5-9 11L3 9l3-5Zm1.8 2L5.5 9h4.9L7.8 6Zm3.4 0-2.4 3h6.4l-2.4-3h-1.6Zm3.4 0-2.3 3h4.9L14.6 6ZM6.2 11l4.9 7-4-7h-.9Zm11.6 0h-.9l-4 7 4.9-7ZM9.4 11l2.6 6.5L14.6 11H9.4Z"/></svg>
    case 'chevronR':
      return <svg {...lined}><path d="M9 6l6 6-6 6"/></svg>
  }
}

// ── Progress ring — the one interactive/playful shape reused (without
// an emoji) as the level badge's frame in the rail.
function ProgressRing({ pct, size = 96, stroke = 8, emoji, trackColor = 'rgba(255,255,255,0.14)' }: {
  pct: number; size?: number; stroke?: number; emoji?: string; trackColor?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PAL.gold} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {emoji && <span className="absolute inset-0 flex items-center justify-center text-4xl">{emoji}</span>}
    </div>
  )
}

// ── Page header — calm, spacious, one quiet track switcher.
function PageHeader({
  userName, t, activeTrack, tracks, showPicker, setShowPicker, pickerRef, onSelectTrack, activeTrackId,
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
        <h1 className="font-extrabold text-2xl sm:text-[28px] leading-tight" style={{ color: PAL.ink }}>
          {t.hello}{userName ? `, ${userName}` : ''}.
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: PAL.inkSoft }}>{t.subtitle}</p>
      </div>

      {activeTrack && (
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(v => !v)}
            aria-label="Switch track"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-white transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: SOFT_SHADOW }}
          >
            <span className="text-base">{activeTrack.emoji}</span>
            <span className="text-sm font-bold" style={{ color: PAL.ink }}>{activeTrack.name}</span>
            <Icon kind="chevronR" className="w-3.5 h-3.5 rotate-90" style={{ color: PAL.inkFaint }} />
          </button>
          {showPicker && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-2xl overflow-hidden z-30" style={{ boxShadow: '0 12px 32px rgba(13,43,50,0.16)' }}>
              {tracks.map(tr => (
                <button
                  key={tr.id}
                  onClick={() => onSelectTrack(tr.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{ backgroundColor: tr.id === activeTrackId ? PAL.pearlWhite : 'transparent' }}
                >
                  <span>{tr.emoji}</span>
                  <span className="flex-1 font-bold truncate text-sm" style={{ color: PAL.ink }}>{tr.name}</span>
                  {tr.id === activeTrackId && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PAL.pearlGold }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Hero mission panel — unchanged.
function MissionHero({ skill, lessonIdx, lessonCount, pct, onPlay, t }: {
  skill: Skill; lessonIdx: number; lessonCount: number; pct: number; onPlay: () => void; t: Record<string, string>
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-6 sm:p-8"
      style={{ background: `linear-gradient(135deg, ${PAL.depth} 0%, ${PAL.depthSoft} 100%)` }}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <span className="absolute rounded-full" style={{ width: 320, height: 320, top: -140, right: -100, background: `radial-gradient(circle, ${PAL.pearlGold}22, transparent 70%)` }} />
        <span className="absolute inset-0 rounded-[28px]" style={{ boxShadow: `inset 0 0 0 1px ${PAL.pearlGold}33` }} />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <ProgressRing pct={pct} emoji={skill.emoji} />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: PAL.pearlGoldSoft, letterSpacing: '0.08em' }}>
            {t.lessonOf} {lessonIdx} {t.of} {lessonCount || 1}
          </p>
          <h2 className="font-extrabold text-2xl sm:text-3xl leading-tight" style={{ color: PAL.pearlWhite }}>
            {cleanTitle(skill.title)}
          </h2>
          <span className="inline-flex items-center gap-1 mt-3 rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: 'rgba(212,162,76,0.16)', color: PAL.pearlGoldSoft }}>
            +{skill.xp_reward} XP
          </span>
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="sm:shrink-0 w-full sm:w-auto h-16 sm:px-9 rounded-2xl flex items-center justify-center gap-2.5 font-extrabold text-lg text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ backgroundColor: PAL.coral, boxShadow: `0 10px 24px rgba(255,107,87,0.35)` }}
        >
          <Icon kind="play" className="w-5 h-5" />
          {t.play}
        </button>
      </div>
    </div>
  )
}

// ── Island path ──────────────────────────────────────────────────────
const ISLAND_SIZE = 4

// 5 distinct silhouettes, each with its own scatter of up to 4 stops and
// its own soft color wash — cycled by unit index so units 1, 2, 3, 4, 5
// all look different, and unit 6 repeats unit 1's shape rather than
// every unit repeating the same one.
const ISLAND_SHAPES: { blob: string; points: { x: number; y: number }[]; from: string; to: string }[] = [
  { // rounded organic blob, path winds bottom-left → top-mid → right → bottom
    blob: 'M40,20 C90,-10 180,0 220,30 C270,55 292,108 260,150 C230,190 150,202 100,180 C40,155 8,112 20,70 C25,45 20,35 40,20 Z',
    points: [{ x: 75, y: 140 }, { x: 140, y: 68 }, { x: 205, y: 118 }, { x: 165, y: 172 }],
    from: '#EAF7F4', to: '#D9F1EC', // reef wash
  },
  { // long horizontal atoll, path drifts left → right in a shallow wave
    blob: 'M20,90 C15,45 70,15 140,18 C215,21 280,40 285,88 C289,132 240,168 168,178 C98,187 40,168 22,132 C13,115 17,102 20,90 Z',
    points: [{ x: 55, y: 105 }, { x: 120, y: 62 }, { x: 190, y: 105 }, { x: 245, y: 70 }],
    from: '#FBF3E6', to: '#F3E1C4', // sandy-gold wash
  },
  { // round island, path spirals inward
    blob: 'M150,10 C212,10 268,52 271,108 C274,162 218,196 153,196 C88,196 33,164 24,110 C15,54 92,10 150,10 Z',
    points: [{ x: 80, y: 140 }, { x: 150, y: 48 }, { x: 220, y: 140 }, { x: 150, y: 168 }],
    from: '#EAF4FB', to: '#D3E9F7', // pale lagoon-blue wash
  },
  { // tall narrow island, path runs top to bottom
    blob: 'M92,15 C142,-2 194,20 208,62 C222,104 212,152 190,182 C168,208 118,207 88,186 C58,165 36,128 42,88 C48,50 60,26 92,15 Z',
    points: [{ x: 128, y: 42 }, { x: 96, y: 92 }, { x: 152, y: 138 }, { x: 108, y: 178 }],
    from: '#F2F8EA', to: '#E1EFCE', // soft palm-green wash
  },
  { // archipelago with a bay, path curls around the notch
    blob: 'M30,62 C42,20 104,4 152,20 C188,32 178,58 220,54 C262,50 288,82 276,122 C264,162 208,192 148,180 C108,172 90,150 58,155 C22,160 4,120 15,90 C20,76 25,68 30,62 Z',
    points: [{ x: 52, y: 92 }, { x: 122, y: 42 }, { x: 195, y: 90 }, { x: 242, y: 140 }],
    from: '#FFF1EE', to: '#FFD9D1', // warm coral wash
  },
]

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function IslandNode({ locked, complete, current, isLast, onClick, label, x, y }: {
  locked: boolean; complete: boolean; current: boolean; isLast: boolean
  onClick: () => void; label: string; x: number; y: number
}) {
  const [shake, setShake] = useState(false)
  const handleClick = () => {
    if (locked) { setShake(true); window.setTimeout(() => setShake(false), 400); return }
    onClick()
  }
  const size = current ? 56 : 46
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${(x / 300) * 100}%`, top: `${(y / 200) * 100}%`, transform: 'translate(-50%,-50%)' }}
    >
      {current && (
        <span className="mb-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white relative" style={{ backgroundColor: PAL.gold }}>
          {label}
          <span className="absolute left-1/2 -bottom-1 w-2 h-2 -translate-x-1/2 rotate-45" style={{ backgroundColor: PAL.gold }} />
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={locked}
        aria-label={label}
        className={cn('flex items-center justify-center transition-transform', !locked && 'hover:-translate-y-0.5 active:translate-y-0')}
        style={{
          width: size, height: size, borderRadius: '9999px',
          backgroundColor: complete ? PAL.reef : PAL.white,
          border: current ? `2.5px solid ${PAL.gold}` : locked ? '1.5px solid rgba(41,57,74,0.10)' : 'none',
          boxShadow: current
            ? `0 0 0 5px rgba(255,185,48,0.18), 0 6px 14px rgba(13,43,50,0.18)`
            : '0 3px 8px rgba(13,43,50,0.14)',
          animation: shake ? 'shakeX 0.4s ease' : undefined,
        }}
      >
        {locked ? (
          <Icon kind="lock" className="w-4 h-4" style={{ color: PAL.inkFaint }} strokeWidth={1.8} />
        ) : current ? (
          <Icon kind="star" className="w-5 h-5" style={{ color: PAL.gold }} />
        ) : complete && isLast ? (
          <Icon kind="gem" className="w-4.5 h-4.5" style={{ color: PAL.goldDeep }} />
        ) : complete ? (
          <Icon kind="check" className="w-4 h-4" style={{ color: PAL.white }} />
        ) : null}
      </button>
    </div>
  )
}

// one illustrated island: a unit label, a curved dashed trail, and a
// handful of stops scattered across it. Shape/wash rotate by index so
// consecutive units don't look identical. `locked` mutes the whole
// thing to a grey-pearl palette regardless of which shape it drew.
function IslandUnit({ title, index, skills, currentSkillId, isUnlockedFn, isCompleteFn, onTap, locked, t }: {
  title: string; index: number; skills: Skill[]; currentSkillId: string | null
  isUnlockedFn: (s: Skill) => boolean; isCompleteFn: (id: string) => boolean
  onTap: (s: Skill, unlocked: boolean) => void; locked: boolean; t: Record<string, string>
}) {
  const shape = ISLAND_SHAPES[index % ISLAND_SHAPES.length]
  const pts = skills.map((_, i) => shape.points[i % shape.points.length])
  const pathD = buildSmoothPath(pts)
  const gradId = `island-grad-${index}-${locked ? 'lock' : 'live'}`

  return (
    <div className={cn(index > 0 && 'mt-2')}>
      <p className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: locked ? PAL.inkFaint : PAL.goldDeep }}>
        {t.unit} {index + 1}
      </p>
      <h3 className="text-base sm:text-lg font-extrabold mb-3" style={{ color: locked ? PAL.inkFaint : PAL.ink }}>
        {title}
      </h3>

      <div className="relative w-full" style={{ aspectRatio: '300 / 200' }}>
        <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={locked ? PAL.islandLockFrom : shape.from} />
              <stop offset="100%" stopColor={locked ? PAL.islandLockTo : shape.to} />
            </linearGradient>
          </defs>
          <path d={shape.blob} fill={`url(#${gradId})`} />
          <path
            d={pathD} fill="none" stroke={locked ? '#C9C6BA' : PAL.reef}
            strokeOpacity={locked ? 0.5 : 0.55} strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round"
          />
        </svg>

        {skills.map((s, i) => {
          const unlocked = !locked && isUnlockedFn(s)
          const complete = !locked && isCompleteFn(s.id)
          const isCurrent = !locked && s.id === currentSkillId
          const pos = pts[i]
          return (
            <IslandNode
              key={s.id}
              x={pos.x} y={pos.y}
              locked={!unlocked} complete={complete} current={isCurrent} isLast={i === skills.length - 1}
              onClick={() => onTap(s, unlocked)}
              label={!unlocked ? t.locked : complete ? t.completed : isCurrent ? t.now : cleanTitle(s.title)}
            />
          )
        })}
      </div>
    </div>
  )
}

function IslandPath({ skills, currentSkillId, isUnlockedFn, isCompleteFn, onTap, t, unitTitles }: {
  skills: Skill[]; currentSkillId: string | null
  isUnlockedFn: (s: Skill) => boolean; isCompleteFn: (id: string) => boolean
  onTap: (s: Skill, unlocked: boolean) => void; t: Record<string, string>; unitTitles?: string[]
}) {
  const islands = useMemo(() => {
    const chunks: Skill[][] = []
    for (let i = 0; i < skills.length; i += ISLAND_SIZE) chunks.push(skills.slice(i, i + ISLAND_SIZE))
    return chunks
  }, [skills])

  const currentIslandIdx = Math.max(0, islands.findIndex(chunk => chunk.some(s => s.id === currentSkillId)))
  const doneCount = skills.filter(s => isCompleteFn(s.id)).length
  const visibleIslands = islands.slice(currentIslandIdx, currentIslandIdx + 2)

  return (
    <div className="rounded-[28px] bg-white p-5 sm:p-7 mt-5" style={{ boxShadow: SOFT_SHADOW }}>
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold mb-5" style={{ backgroundColor: 'rgba(212,162,76,0.14)', color: PAL.goldDeep }}>
        {doneCount}/{skills.length} {t.missions}
      </span>

      {visibleIslands.map((chunk, i) => {
        const islandIdx = currentIslandIdx + i
        const isLocked = i > 0
        const title = unitTitles?.[islandIdx] ?? cleanTitle(chunk[0]?.title ?? '')
        return (
          <IslandUnit
            key={islandIdx}
            title={title}
            index={islandIdx}
            skills={chunk}
            currentSkillId={currentSkillId}
            isUnlockedFn={isUnlockedFn}
            isCompleteFn={isCompleteFn}
            onTap={onTap}
            locked={isLocked}
            t={t}
          />
        )
      })}
    </div>
  )
}

// ── Level + streak badge — the one rail card left. Tied visually to the
// hero (same dark/gold surface) instead of a plain white KPI row.
function LevelBadgeCard({ streak, level, totalXp, xpIntoLevel, xpForLevel, t }: {
  streak: number; level: number; totalXp: number; xpIntoLevel: number; xpForLevel: number; t: Record<string, string>
}) {
  const pct = Math.round((xpIntoLevel / xpForLevel) * 100)
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${PAL.depth} 0%, ${PAL.depthSoft} 100%)` }}>
      <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 180, height: 180, top: -80, right: -70, background: `radial-gradient(circle, ${PAL.pearlGold}1f, transparent 70%)` }} />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative w-20 h-20 mb-3">
          <ProgressRing pct={pct} size={80} stroke={6} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: PAL.pearlGoldSoft }}>{t.level}</span>
            <span className="text-2xl font-extrabold" style={{ color: PAL.pearlWhite }}>{level}</span>
          </div>
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: PAL.coral, border: `2.5px solid ${PAL.depth}` }}>
            <Icon kind="flame" className="w-3.5 h-3.5" style={{ color: PAL.white }} />
          </span>
        </div>
        <p className="text-xs font-extrabold" style={{ color: PAL.pearlGoldSoft }}>{streak} {t.streak}</p>
        <p className="text-[11px] font-semibold mt-1" style={{ color: 'rgba(246,243,234,0.55)' }}>{totalXp.toLocaleString()} {t.totalXp}</p>
      </div>
    </div>
  )
}

export default function SkillsClient({
  tracks = [], initialTrackId, skills = [], skillProgress = [], lessonCountMap = {},
  language, streak = 0, initialCurrentSkillId, initialFirstIncompleteLessonId,
  leaderboard = [], userName, userTotalXp, unitTitles,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as 'en' | 'ar' | 'fr'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'
  const fontFamily = lang === 'ar' ? "'Almarai', sans-serif" : "'Plus Jakarta Sans', sans-serif"

  const [activeTrackId, setActiveTrackId] = useState<string | null>(initialTrackId)
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(initialCurrentSkillId)
  const [firstIncompleteLessonId, setFirstIncompleteLessonId] = useState<string | null>(initialFirstIncompleteLessonId)
  const [showPicker, setShowPicker] = useState(false)
  const [switching, setSwitching] = useState(false)

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

  const leaderboardMe = leaderboard.find(e => e.is_current_user)
  const fallbackXp = useMemo(
    () => skills.reduce((sum, s) => (isComplete(s.id) ? sum + (s.xp_reward || 0) : sum), 0),
    [skills, progressMap],
  )
  const totalXp = userTotalXp ?? leaderboardMe?.xp ?? fallbackXp
  const XP_PER_LEVEL = 500
  const level = 1 + Math.floor(totalXp / XP_PER_LEVEL)
  const xpIntoLevel = totalXp % XP_PER_LEVEL

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

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

  return (
    <div dir={dir} className="w-full min-h-screen" style={{ backgroundColor: PAL.pearlWhite, color: PAL.ink, fontFamily }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Almarai:wght@400;700;800&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes shakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
      ` }} />

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
              <div className="flex items-center justify-center py-24 rounded-[28px] bg-white" style={{ boxShadow: SOFT_SHADOW }}>
                <p className="font-bold" style={{ color: PAL.inkSoft }}>{t.switching}</p>
              </div>
            ) : allDone ? (
              <div className="text-center py-20 rounded-[28px]" style={{ background: `linear-gradient(135deg, ${PAL.depth} 0%, ${PAL.depthSoft} 100%)` }}>
                <p className="text-5xl sm:text-6xl mb-3">🏆</p>
                <p className="text-lg sm:text-xl font-extrabold" style={{ color: PAL.pearlWhite }}>{t.allDone}</p>
                <p className="mt-2 font-semibold text-sm sm:text-base" style={{ color: PAL.pearlGoldSoft }}>{t.allDoneSub}</p>
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
                <IslandPath
                  skills={orderedSkills}
                  currentSkillId={currentSkillId}
                  isUnlockedFn={isUnlocked}
                  isCompleteFn={isComplete}
                  onTap={handleCardTap}
                  t={t}
                  unitTitles={unitTitles}
                />
              </>
            ) : null}
          </main>

          <aside>
            <LevelBadgeCard streak={streak} level={level} totalXp={totalXp} xpIntoLevel={xpIntoLevel} xpForLevel={XP_PER_LEVEL} t={t} />
          </aside>
        </div>
      </div>
    </div>
  )
}