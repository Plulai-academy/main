'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v16 — "The Pearl Diver's Route"
// ─────────────────────────────────────────────────────────────────
// A kid sails a dhow across the Arabian Gulf, island by island,
// collecting pearls (XP) and opening a treasure chest at the end of
// each voyage (unit). This replaces the generic "SaaS cards on a
// white background" e‑learning look with a world that's grounded in
// Gulf pearl-diving heritage — the same heritage your palette names
// (Reef, Lagoon, Pearl gold, Depth) already point to.
//
// Two problems this fixes directly:
//
//   1. "Doesn't show past lessons completed" — the map used to only
//      ever render the current island + one locked teaser. It now
//      renders the FULL charted route: every conquered island stays
//      on screen, in full colour, with a "Conquered" ribbon and an
//      open treasure chest at its last stop. On top of that, a Pearl
//      Necklace strip at the top of the page gives a permanent,
//      tap-to-jump summary of literally every lesson ever finished —
//      so history is never more than a glance (or one scroll) away.
//
//   2. "Feels like an e-learning platform, not a game" — swapped the
//      generic padlock/checkmark/gem icon set for a small maritime
//      icon set (dhow boat = you are here, closed shell = locked
//      stop, mystery chest = the unopened reward waiting at the end
//      of a voyage, open chest = reward claimed), added a dashed
//      "sea route" between islands with anchor waypoints, alternated
//      island placement left/right like a hand-charted map instead of
//      a stack of identical cards, and swapped the corporate
//      Jakarta Sans / Almarai pairing for Baloo 2 / Baloo Bhaijaan 2 —
//      a rounded, playful sibling pairing built for exactly this kind
//      of bilingual kids product.
//
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Set Sail', lessonOf: 'Stop', of: 'of', missions: 'pearls', unit: 'Voyage',
    locked: 'Locked', completed: 'Conquered', current: 'current stop', now: "You're here",
    allDone: 'World complete!', allDoneSub: "You've charted every island here.",
    switching: 'Charting course…',
    hello: 'Ahlan', subtitle: "Let's continue your voyage.",
    streak: 'day streak', level: 'Rank', totalXp: 'total pearls',
    worldName: 'Gulf of Discovery',
  },
  ar: {
    play: 'أبحر', lessonOf: 'محطة', of: 'من', missions: 'لؤلؤة', unit: 'رحلة',
    locked: 'مقفل', completed: 'مُنجزة', current: 'موقعك', now: 'أنت هنا',
    allDone: 'أنهيت هذا العالم! 🏆', allDoneSub: 'اكتشفت كل جزيرة هنا.',
    switching: 'نرسم المسار…',
    hello: 'أهلاً', subtitle: 'يلا نكمل رحلتنا في الخليج!',
    streak: 'أيام متتالية', level: 'الرتبة', totalXp: 'مجموع اللآلئ',
    worldName: 'خليج الاكتشاف',
  },
  fr: {
    play: 'Embarquer', lessonOf: 'Étape', of: 'sur', missions: 'perles', unit: 'Voyage',
    locked: 'Verrouillé', completed: 'Conquise', current: 'position actuelle', now: 'Tu es ici',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as exploré chaque île ici.',
    switching: 'Traçage de la route…',
    hello: 'Ahlan', subtitle: 'Continuons ton voyage dans le Golfe.',
    streak: 'jours de suite', level: 'Rang', totalXp: 'perles au total',
    worldName: 'Golfe de la Découverte',
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
  leaderboard?: LeaderboardEntry[]
  dailyQuest?: DailyQuest
  dailyChallenge?: DailyChallenge | null
  totalTimeMins?: number
  userName?: string
  characterImageUrl?: string
  mascotName?: string
  userTotalXp?: number
  heroBackgroundImageUrl?: string
  unitTitles?: string[]
}

// ── Brand tokens ─────────────────────────────────────────────────
// Luxury mode drives the chrome (header, hero, rail). Energetic mode
// is reserved for the route itself — the one place a kid's finger
// actually lands.
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
  reefLux: '#1FB8A6',
  lagoon: '#EAF7F4',
  lagoonFill: '#D9F1EC',
  reefBright: '#17D9C0',
  sunGold: '#FFB930',
  coral: '#FF6B57',
  coralDeep: '#E24E3C',
  shellLockFrom: '#F0EEE6',
  shellLockTo: '#E6E3D8',
}
const SOFT_SHADOW = '0 2px 14px rgba(13,43,50,0.06)'
const ISLAND_SIZE = 4

function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*[—-]\s*/i, '').trim() || title
}

// ── Icon set ─────────────────────────────────────────────────────
type IconKind = 'lock' | 'check' | 'flame' | 'chevronR'

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
    case 'chevronR':
      return <svg {...lined}><path d="M9 6l6 6-6 6"/></svg>
  }
}

// small maritime marks, drawn separately from Icon() because they mix
// fills and strokes in ways a single-path switch can't express.
function Anchor({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" /><path d="M12 7v13" /><path d="M5 14a7 7 0 0 0 14 0" /><path d="M8 10h8" />
    </svg>
  )
}
function Wheel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 5v3M12 16v3M5 12h3M16 12h3M7.05 7.05l2.1 2.1M14.85 14.85l2.1 2.1M7.05 16.95l2.1-2.1M14.85 9.15l2.1-2.1" />
    </svg>
  )
}
function BoatMarker({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 28 24">
      <path d="M4 16 L24 16 L20 21 H8 Z" fill="currentColor" />
      <path d="M14 16 V4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <path d="M14 4 L20 14.5 L14 14.5 Z" fill="currentColor" opacity={0.6} />
    </svg>
  )
}
function ChestClosed({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10.5" width="16" height="8" rx="1.6" />
      <path d="M4 10.5c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5" />
      <circle cx="12" cy="14.3" r="1.1" fill="currentColor" stroke="none" />
      <path d="M12 15.4v1.3" />
    </svg>
  )
}
function ChestOpen({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="12" width="16" height="7" rx="1.6" fill="currentColor" fillOpacity={0.16} />
      <path d="M4.6 12C5.4 8.7 8.4 5 12 5" />
      <path d="M19.4 12c-.8-3.3-3.8-7-7.4-7" />
      <circle cx="12" cy="8.2" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}
function CompassRose({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 120" fill="none" stroke="currentColor">
      <circle cx="60" cy="60" r="52" strokeWidth={1} />
      <circle cx="60" cy="60" r="2.5" fill="currentColor" stroke="none" />
      <path d="M60 10 L66 58 L60 64 L54 58 Z" fill="currentColor" stroke="none" />
      <path d="M60 110 L54 62 L60 56 L66 62 Z" fill="currentColor" stroke="none" opacity={0.4} />
      <path d="M10 60 L58 54 L64 60 L58 66 Z" fill="currentColor" stroke="none" opacity={0.4} />
      <path d="M110 60 L62 66 L56 60 L62 54 Z" fill="currentColor" stroke="none" opacity={0.4} />
    </svg>
  )
}

// faint mashrabiya-style lattice across the whole page — the one
// place the design nods to Gulf ornament without shouting about it.
function ArabesqueBackdrop() {
  return (
    <svg aria-hidden className="fixed inset-0 w-full h-full pointer-events-none -z-10" style={{ opacity: 0.05 }}>
      <defs>
        <pattern id="arabesque" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M24 4 L44 24 L24 44 L4 24 Z" fill="none" stroke={PAL.depth} strokeWidth={1} />
          <circle cx="24" cy="24" r="6" fill="none" stroke={PAL.pearlGold} strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arabesque)" />
    </svg>
  )
}

// ── Progress ring ────────────────────────────────────────────────
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
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PAL.sunGold} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {emoji && <span className="absolute inset-0 flex items-center justify-center text-4xl">{emoji}</span>}
    </div>
  )
}

// ── Page header ──────────────────────────────────────────────────
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
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold mb-2" style={{ backgroundColor: PAL.lagoonFill, color: PAL.reefLux }}>
          <Anchor className="w-3 h-3" /> {t.worldName}
        </span>
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

// ── Pearl necklace — the permanent, tappable record of every lesson
// finished. This is the direct fix for "you can't see past progress":
// nothing ever drops off this strip, no matter how far the map below
// has scrolled or how many islands are still fogged in.
function PearlNecklace({ skills, isCompleteFn, currentSkillId, onJump, t }: {
  skills: Skill[]; isCompleteFn: (id: string) => boolean; currentSkillId: string | null
  onJump: (islandIdx: number) => void; t: Record<string, string>
}) {
  if (!skills.length) return null
  const doneCount = skills.filter(s => isCompleteFn(s.id)).length
  return (
    <div className="mt-5 rounded-2xl bg-white px-4 py-3.5 flex items-center gap-3" style={{ boxShadow: SOFT_SHADOW }}>
      <p className="shrink-0 text-sm font-extrabold whitespace-nowrap" style={{ color: PAL.ink }}>
        {doneCount} <span className="font-semibold" style={{ color: PAL.inkSoft }}>{t.missions}</span>
      </p>
      <div className="h-7 w-px shrink-0" style={{ backgroundColor: PAL.shellLockTo }} />
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 flex-1">
        {skills.map((s, i) => {
          const complete = isCompleteFn(s.id)
          const current = s.id === currentSkillId
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(Math.floor(i / ISLAND_SIZE))}
              aria-label={cleanTitle(s.title)}
              className="shrink-0 rounded-full transition-transform hover:-translate-y-0.5"
              style={{
                width: current ? 16 : 11, height: current ? 16 : 11,
                backgroundColor: complete || current ? PAL.pearlGold : 'transparent',
                border: complete || current ? 'none' : `1.5px solid ${PAL.shellLockTo}`,
                boxShadow: current ? '0 0 0 4px rgba(255,185,48,0.22)' : complete ? '0 1px 3px rgba(185,121,26,0.35)' : 'none',
                animation: current ? 'glowPulse 1.8s ease-in-out infinite' : undefined,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Hero — "today's voyage" ──────────────────────────────────────
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
        <CompassRose className="absolute -bottom-10 -left-10 w-56 h-56" style={{ color: PAL.pearlWhite, opacity: 0.05 }} />
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
            +{skill.xp_reward} {t.missions}
          </span>
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="sm:shrink-0 w-full sm:w-auto h-16 sm:px-9 rounded-2xl flex items-center justify-center gap-2.5 font-extrabold text-lg text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ backgroundColor: PAL.coral, boxShadow: '0 10px 24px rgba(255,107,87,0.35)' }}
        >
          <Wheel className="w-5 h-5" />
          {t.play}
        </button>
      </div>
    </div>
  )
}

// ── Island path ──────────────────────────────────────────────────
const ISLAND_SHAPES: { blob: string; points: { x: number; y: number }[]; from: string; to: string }[] = [
  {
    blob: 'M40,20 C90,-10 180,0 220,30 C270,55 292,108 260,150 C230,190 150,202 100,180 C40,155 8,112 20,70 C25,45 20,35 40,20 Z',
    points: [{ x: 75, y: 140 }, { x: 140, y: 68 }, { x: 205, y: 118 }, { x: 165, y: 172 }],
    from: PAL.lagoon, to: PAL.lagoonFill,
  },
  {
    blob: 'M20,90 C15,45 70,15 140,18 C215,21 280,40 285,88 C289,132 240,168 168,178 C98,187 40,168 22,132 C13,115 17,102 20,90 Z',
    points: [{ x: 55, y: 105 }, { x: 120, y: 62 }, { x: 190, y: 105 }, { x: 245, y: 70 }],
    from: '#FBF3E6', to: '#F3E1C4',
  },
  {
    blob: 'M150,10 C212,10 268,52 271,108 C274,162 218,196 153,196 C88,196 33,164 24,110 C15,54 92,10 150,10 Z',
    points: [{ x: 80, y: 140 }, { x: 150, y: 48 }, { x: 220, y: 140 }, { x: 150, y: 168 }],
    from: '#EAF4FB', to: '#D3E9F7',
  },
  {
    blob: 'M92,15 C142,-2 194,20 208,62 C222,104 212,152 190,182 C168,208 118,207 88,186 C58,165 36,128 42,88 C48,50 60,26 92,15 Z',
    points: [{ x: 128, y: 42 }, { x: 96, y: 92 }, { x: 152, y: 138 }, { x: 108, y: 178 }],
    from: '#F2F8EA', to: '#E1EFCE',
  },
  {
    blob: 'M30,62 C42,20 104,4 152,20 C188,32 178,58 220,54 C262,50 288,82 276,122 C264,162 208,192 148,180 C108,172 90,150 58,155 C22,160 4,120 15,90 C20,76 25,68 30,62 Z',
    points: [{ x: 52, y: 92 }, { x: 122, y: 42 }, { x: 195, y: 90 }, { x: 242, y: 140 }],
    from: '#FFF1EE', to: '#FFD9D1',
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

// route waypoint drawn between two islands — gold once you've sailed
// it, grey while it's still ahead in the fog.
function RouteConnector({ reached }: { reached: boolean }) {
  return (
    <div className="flex items-center justify-center py-1.5" aria-hidden>
      <div className="flex flex-col items-center gap-1">
        <span className="block w-0.5 h-3 rounded-full" style={{ backgroundColor: reached ? PAL.pearlGold : PAL.shellLockTo }} />
        <Anchor className="w-3.5 h-3.5" style={{ color: reached ? PAL.pearlGold : PAL.inkFaint }} />
        <span className="block w-0.5 h-3 rounded-full" style={{ backgroundColor: reached ? PAL.pearlGold : PAL.shellLockTo }} />
      </div>
    </div>
  )
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
  const size = current ? 58 : isLast ? 52 : 46

  let bg = PAL.white
  let border = `1.5px solid rgba(41,57,74,0.10)`
  let iconEl: React.ReactNode = null

  if (locked) {
    bg = isLast ? PAL.shellLockFrom : PAL.white
    iconEl = isLast
      ? <ChestClosed className="w-4.5 h-4.5" style={{ color: PAL.inkFaint }} />
      : <Icon kind="lock" className="w-4 h-4" style={{ color: PAL.inkFaint }} strokeWidth={1.8} />
  } else if (current) {
    bg = PAL.sunGold
    border = 'none'
    iconEl = <BoatMarker className="w-7 h-6" style={{ color: PAL.white }} />
  } else if (complete) {
    bg = isLast ? PAL.pearlGoldSoft : PAL.reefBright
    border = isLast ? `1.5px solid ${PAL.pearlGold}` : 'none'
    iconEl = isLast
      ? <ChestOpen className="w-5 h-5" style={{ color: PAL.goldDeep }} />
      : <Icon kind="check" className="w-4 h-4" style={{ color: PAL.white }} />
  } else if (isLast) {
    bg = PAL.pearlGoldSoft
    border = `1.5px dashed ${PAL.pearlGold}`
    iconEl = <ChestClosed className="w-4.5 h-4.5" style={{ color: PAL.goldDeep }} />
  } else {
    iconEl = <span className="block rounded-full" style={{ width: 5, height: 5, backgroundColor: PAL.lagoonFill }} />
  }

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${(x / 300) * 100}%`, top: `${(y / 200) * 100}%`, transform: 'translate(-50%,-50%)' }}
    >
      {current && (
        <span className="mb-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white relative whitespace-nowrap" style={{ backgroundColor: PAL.sunGold }}>
          {label}
          <span className="absolute left-1/2 -bottom-1 w-2 h-2 -translate-x-1/2 rotate-45" style={{ backgroundColor: PAL.sunGold }} />
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={locked}
        aria-label={label}
        className={cn('flex items-center justify-center transition-transform', !locked && 'hover:-translate-y-0.5 active:translate-y-0', current && 'animate-[bob_2.4s_ease-in-out_infinite]')}
        style={{
          width: size, height: size, borderRadius: '9999px',
          backgroundColor: bg, border,
          boxShadow: current
            ? '0 0 0 5px rgba(255,185,48,0.20), 0 6px 14px rgba(13,43,50,0.18)'
            : '0 3px 8px rgba(13,43,50,0.14)',
          animation: shake ? 'shakeX 0.4s ease' : current ? 'bob 2.4s ease-in-out infinite' : undefined,
        }}
      >
        {iconEl}
      </button>
    </div>
  )
}

function IslandUnit({ title, index, skills, currentSkillId, isUnlockedFn, isCompleteFn, onTap, islandLocked, islandCompleted, t }: {
  title: string; index: number; skills: Skill[]; currentSkillId: string | null
  isUnlockedFn: (s: Skill) => boolean; isCompleteFn: (id: string) => boolean
  onTap: (s: Skill, unlocked: boolean) => void; islandLocked: boolean; islandCompleted: boolean; t: Record<string, string>
}) {
  const shape = ISLAND_SHAPES[index % ISLAND_SHAPES.length]
  const pts = skills.map((_, i) => shape.points[i % shape.points.length])
  const pathD = buildSmoothPath(pts)
  const gradId = `island-grad-${index}-${islandLocked ? 'lock' : 'live'}`

  return (
    <div
      id={`island-${index}`}
      className={cn('sm:w-[90%]', index % 2 === 0 ? 'sm:me-auto' : 'sm:ms-auto')}
      style={{ scrollMarginTop: 24 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold shrink-0"
          style={{ backgroundColor: islandLocked ? PAL.shellLockTo : islandCompleted ? PAL.pearlGold : PAL.reefBright, color: islandLocked ? PAL.inkFaint : PAL.white }}
          aria-label={`${t.unit} ${index + 1}`}
        >
          {index + 1}
        </span>
        <h3 className="text-base sm:text-lg font-extrabold flex-1 min-w-0 truncate" style={{ color: islandLocked ? PAL.inkFaint : PAL.ink }}>
          {title}
        </h3>
        {islandCompleted && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ backgroundColor: PAL.lagoonFill, color: PAL.reefLux }}>
            <Icon kind="check" className="w-3 h-3" /> {t.completed}
          </span>
        )}
      </div>

      <div className="relative w-full" style={{ aspectRatio: '300 / 200' }}>
        <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={islandLocked ? PAL.shellLockFrom : shape.from} />
              <stop offset="100%" stopColor={islandLocked ? PAL.shellLockTo : shape.to} />
            </linearGradient>
          </defs>
          <path d={shape.blob} fill={`url(#${gradId})`} />
          <path
            d={pathD} fill="none" stroke={islandLocked ? '#C9C6BA' : PAL.reefLux}
            strokeOpacity={islandLocked ? 0.5 : 0.55} strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round"
          />
        </svg>

        {skills.map((s, i) => {
          const unlocked = !islandLocked && isUnlockedFn(s)
          const complete = !islandLocked && isCompleteFn(s.id)
          const isCurrent = !islandLocked && s.id === currentSkillId
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

        {islandLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold" style={{ backgroundColor: 'rgba(13,43,50,0.72)', color: PAL.pearlWhite }}>
              <Icon kind="lock" className="w-3 h-3" /> {t.locked}
            </span>
          </div>
        )}
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

  // full sailed history + current + two fogged-in teasers ahead —
  // nothing a kid has already conquered ever falls off this list.
  const visibleIslands = islands.slice(0, currentIslandIdx + 3)

  useEffect(() => {
    const id = window.setTimeout(() => {
      document.getElementById(`island-${currentIslandIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSkillId])

  return (
    <div className="rounded-[28px] bg-white p-5 sm:p-7 mt-5 overflow-hidden" style={{ boxShadow: SOFT_SHADOW }}>
      {visibleIslands.map((chunk, islandIdx) => {
        const islandLocked = islandIdx > currentIslandIdx
        const islandCompleted = islandIdx < currentIslandIdx
        const title = unitTitles?.[islandIdx] ?? cleanTitle(chunk[0]?.title ?? '')
        return (
          <div key={islandIdx}>
            {islandIdx > 0 && <RouteConnector reached={islandIdx <= currentIslandIdx} />}
            <IslandUnit
              title={title}
              index={islandIdx}
              skills={chunk}
              currentSkillId={currentSkillId}
              isUnlockedFn={isUnlockedFn}
              isCompleteFn={isCompleteFn}
              onTap={onTap}
              islandLocked={islandLocked}
              islandCompleted={islandCompleted}
              t={t}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Diver rank — the one rail card ──────────────────────────────
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
  const fontFamily = lang === 'ar' ? "'Baloo Bhaijaan 2', sans-serif" : "'Baloo 2', sans-serif"

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

  const jumpToIsland = (islandIdx: number) => {
    document.getElementById(`island-${islandIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  return (
    <div dir={dir} className="relative w-full min-h-screen" style={{ backgroundColor: PAL.pearlWhite, color: PAL.ink, fontFamily }}>
      <ArabesqueBackdrop />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Baloo+Bhaijaan+2:wght@500;600;700;800&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        @keyframes shakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        @keyframes bob { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 4px rgba(255,185,48,0.18); } 50% { box-shadow: 0 0 0 8px rgba(255,185,48,0.3); } }
      ` }} />

      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-6 sm:py-9 relative">
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

        {!switching && orderedSkills.length > 0 && (
          <PearlNecklace
            skills={orderedSkills}
            isCompleteFn={isComplete}
            currentSkillId={currentSkillId}
            onJump={jumpToIsland}
            t={t}
          />
        )}

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