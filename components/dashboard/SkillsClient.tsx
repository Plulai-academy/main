'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v6 — "Pearl Diver"
// ─────────────────────────────
// A different visual language entirely: hard-edged, blocky UI (not rounded
// cards) with flat pixel-style shadows that "press in" on tap — the game
// grammar of Minecraft/Roblox rather than a rounded mobile-app dashboard.
// Content is reframed around your own brand words instead of generic app
// tropes: you're a young pearl diver, each level is a dive, XP is shown as
// a segmented dive-meter (not a smooth ring), completed levels are pearls
// sitting in an inventory hotbar at the bottom — the single most recognizable
// Minecraft signifier there is.
//
// The background sweeps from your Energetic lagoon at the surface down to
// your Luxury "Depth" navy at the bottom, so scrolling down literally reads
// as diving deeper — using both palettes you gave, on purpose.
//
// All props, hooks, and routing logic behave the same as the original;
// this is a full visual-language change, not a re-skin of v5.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    dive: 'Dive', locked: 'Locked', completed: 'Collected', current: 'Next dive',
    allDone: 'Every pearl collected!', allDoneSub: 'This sea has nothing left to find.',
    switching: 'Loading…',
    leaderboard: 'Top divers', you: 'You',
    dailyQuests: 'Weekly quest', dailyChallenges: 'Daily find',
    challengeDone: 'Collected', challengeCheck: 'Collect',
    streak: 'Streak', pearls: 'Pearls', timePlayed: 'Time diving',
    tabPlay: 'Dive', tabTrophies: 'Divers', tabQuests: 'Finds',
    diverRank: 'Diver',
  },
  ar: {
    dive: 'اغطس', locked: 'مقفل', completed: 'جُمعت', current: 'الغطسة التالية',
    allDone: 'جمعت كل اللآلئ! 🦪', allDoneSub: 'لم يتبقَّ شيء في هذا البحر.',
    switching: 'جارٍ التحميل…',
    leaderboard: 'أفضل الغواصين', you: 'أنت',
    dailyQuests: 'تحدي الأسبوع', dailyChallenges: 'اكتشاف اليوم',
    challengeDone: 'تم الجمع', challengeCheck: 'اجمعها',
    streak: 'التتابع', pearls: 'اللآلئ', timePlayed: 'وقت الغوص',
    tabPlay: 'اغطس', tabTrophies: 'الغواصون', tabQuests: 'الاكتشافات',
    diverRank: 'غواص',
  },
  fr: {
    dive: 'Plonger', locked: 'Verrouillé', completed: 'Récolté', current: 'Prochaine plongée',
    allDone: 'Toutes les perles récoltées !', allDoneSub: "Il ne reste rien à trouver dans cette mer.",
    switching: 'Chargement…',
    leaderboard: 'Meilleurs plongeurs', you: 'Toi',
    dailyQuests: 'Défi de la semaine', dailyChallenges: 'Trouvaille du jour',
    challengeDone: 'Récolté', challengeCheck: 'Récolter',
    streak: 'Série', pearls: 'Perles', timePlayed: 'Temps de plongée',
    tabPlay: 'Plonger', tabTrophies: 'Plongeurs', tabQuests: 'Trouvailles',
    diverRank: 'Plongeur',
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
}

// Energetic (surface) + Luxury Depth (deep water) — used deliberately together
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
  depth: '#0D2B32',
  pearlGold: '#D4A24C',
}

type IconKind = 'lock' | 'check' | 'flame' | 'pearl' | 'play' | 'trophy' | 'chest' | 'mask' | 'anchor'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z"/></svg>
    case 'pearl':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="currentColor"/>
          <ellipse cx="9" cy="9" rx="2.6" ry="1.6" fill="#FFFFFF" opacity="0.8" transform="rotate(-30 9 9)"/>
        </svg>
      )
    case 'play':
      return <svg {...common}><path d="M8 5v14l11-7L8 5Z"/></svg>
    case 'trophy':
      return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'chest':
      return <svg {...common}><path d="M4 9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2h-8v-1h-2v1H4V9Zm0 4h6v1h2v-1h8v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Zm7 0v2h2v-2h-2Z"/></svg>
    case 'mask':
      return <svg {...common}><path d="M4 9c0-2 2-3 4-3 1.6 0 2.7.7 3.5 1.6.3.4 1.2.4 1.5 0C13.8 6.7 14.9 6 16.5 6c2 0 4 1 4 3 0 3-2.2 6-5 6-1.7 0-2.7-.8-3.5-2-.8 1.2-1.8 2-3.5 2-2.8 0-5-3-5-6Zm0 8h16v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1Z"/></svg>
    case 'anchor':
      return <svg {...common}><path d="M12 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-1 5.5h2V11h4a1 1 0 0 1 0 2h-1a5 5 0 0 1-4 4.9V21l3-2v2.4l-4 2.4-4-2.4V19l3 2v-3.1A5 5 0 0 1 6 13H5a1 1 0 0 1 0-2h4V7.5Z"/></svg>
  }
}

// ── hard-edge "pixel panel": flat offset shadow, no blur, no rounding ──────
function PixelPanel({ children, className, tone = 'light', pad = true }: {
  children: React.ReactNode
  className?: string
  tone?: 'light' | 'dark'
  pad?: boolean
}) {
  return (
    <div
      className={cn('relative', pad && 'p-3', className)}
      style={{
        backgroundColor: tone === 'light' ? PAL.white : PAL.depth,
        border: `2px solid ${tone === 'light' ? PAL.ink : PAL.reef}`,
        boxShadow: `4px 4px 0 rgba(13,43,50,0.28)`,
      }}
    >
      {children}
    </div>
  )
}

// segmented dive-progress meter — a row of filled/empty blocks, not a ring
function DiveMeter({ pct, segments = 10, color = PAL.reef }: { pct: number; segments?: number; color?: string }) {
  const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * segments)
  return (
    <div className="flex gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className="flex-1"
          style={{ height: 10, backgroundColor: i < filled ? color : PAL.lagoonFill, border: `1px solid ${PAL.ink}22` }}
        />
      ))}
    </div>
  )
}

// square inventory slot — used for both the dive trail and the bottom hotbar
function Slot({
  size = 44, content, state, onClick, label, selected, nodeRef,
}: {
  size?: number
  content: React.ReactNode
  state: 'done' | 'current' | 'locked' | 'neutral'
  onClick?: () => void
  label: string
  selected?: boolean
  nodeRef?: (el: HTMLButtonElement | null) => void
}) {
  const locked = state === 'locked'
  const [shake, setShake] = useState(false)
  const handleClick = () => {
    if (locked) { setShake(true); window.setTimeout(() => setShake(false), 400); return }
    onClick?.()
  }
  const bg = state === 'current' ? PAL.gold : state === 'done' ? PAL.reef : state === 'locked' ? PAL.depth : PAL.white
  const borderColor = selected || state === 'current' ? PAL.gold : PAL.ink
  return (
    <button
      ref={nodeRef}
      type="button"
      onClick={handleClick}
      aria-disabled={locked}
      aria-label={label}
      className="relative shrink-0 flex items-center justify-center transition-transform active:translate-x-[2px] active:translate-y-[2px]"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        border: `2px solid ${borderColor}`,
        boxShadow: `2px 2px 0 rgba(13,43,50,0.3)`,
        animation: shake ? 'shakeX 0.4s ease' : undefined,
      }}
    >
      {locked ? <Icon kind="lock" className="w-4 h-4" style={{ color: PAL.reef }} /> : content}
      {state === 'done' && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center" style={{ backgroundColor: PAL.gold, border: `1.5px solid ${PAL.ink}` }}>
          <Icon kind="check" className="w-2.5 h-2.5" style={{ color: PAL.ink }} />
        </span>
      )}
    </button>
  )
}

function LeaderboardRow({ entry, t }: { entry: LeaderboardEntry; t: Record<string, string> }) {
  const [errored, setErrored] = useState(false)
  const medal = entry.rank_global === 1 ? '🥇' : entry.rank_global === 2 ? '🥈' : entry.rank_global === 3 ? '🥉' : null
  const initial = entry.name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="flex items-center gap-3 px-2 py-2" style={{ backgroundColor: entry.is_current_user ? PAL.lagoon : 'transparent', borderBottom: `1px solid ${PAL.lagoonFill}` }}>
      <div className="w-7 h-7 flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft, border: `1.5px solid ${PAL.ink}` }}>
        {medal ?? entry.rank_global ?? '–'}
      </div>
      {entry.avatar_url && !errored ? (
        <img src={entry.avatar_url} alt="" className="w-7 h-7 object-cover shrink-0" style={{ border: `1.5px solid ${PAL.ink}` }} onError={() => setErrored(true)} />
      ) : (
        <div className="w-7 h-7 flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft, border: `1.5px solid ${PAL.ink}` }}>{initial}</div>
      )}
      <span className={cn('flex-1 min-w-0 truncate text-sm', entry.is_current_user ? 'font-black' : 'font-bold')} style={{ color: PAL.ink }}>
        {entry.is_current_user ? t.you : entry.name}
      </span>
      <span className="text-xs font-black shrink-0" style={{ color: PAL.coralDeep }}>{entry.xp} XP</span>
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
  const [tab, setTab] = useState<'play' | 'trophies' | 'quests'>('play')

  const currentNodeRef = useRef<HTMLButtonElement | null>(null)
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
  const diverLevel = orderedSkills.length > 0 ? orderedSkills.filter(s => isComplete(s.id)).length + 1 : 1

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  useEffect(() => {
    currentNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTrackId, tab])

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

  const handleNodeTap = (skill: Skill, unlocked: boolean) => {
    if (!unlocked) return
    if (skill.id === currentSkillId) goToCurrentLesson()
    else router.push(`/dashboard/path/${skill.id}`)
  }

  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const hh = Math.floor((totalTimeMins || 0) / 60)
  const mm = (totalTimeMins || 0) % 60

  return (
    <div
      dir={dir}
      className="h-screen w-full overflow-hidden flex flex-col font-[Baloo_2,Cairo,sans-serif]"
      style={{ background: `linear-gradient(180deg, ${PAL.lagoon} 0%, ${PAL.reef} 55%, ${PAL.depth} 100%)`, color: PAL.ink }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Cairo:wght@600;700;800;900&family=Press+Start+2P&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes shakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        .pixel-font { font-family: 'Press Start 2P', monospace; }
      ` }} />

      {/* ── HUD: diver badge left, streak + pearls right, all hard-edged ── */}
      <div className="flex items-start justify-between px-3 sm:px-5 pt-3 sm:pt-4 shrink-0">
        <div className="relative" ref={pickerRef}>
          <button onClick={() => setShowPicker(v => !v)} className="flex items-center gap-2 px-2.5 py-1.5" style={{ backgroundColor: PAL.white, border: `2px solid ${PAL.ink}`, boxShadow: '2px 2px 0 rgba(13,43,50,0.3)' }}>
            <Icon kind="mask" className="w-4 h-4" style={{ color: PAL.reefDeep }} />
            <span className="pixel-font" style={{ fontSize: 9, color: PAL.ink }}>LV{diverLevel}</span>
          </button>
          {showPicker && (
            <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-56 bg-white z-30" style={{ border: `2px solid ${PAL.ink}`, boxShadow: '3px 3px 0 rgba(13,43,50,0.3)' }}>
              {tracks.map(tr => (
                <button key={tr.id} onClick={() => handleTrackSelect(tr.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left" style={{ backgroundColor: tr.id === activeTrackId ? PAL.lagoon : 'transparent', borderBottom: `1px solid ${PAL.lagoonFill}` }}>
                  <span>{tr.emoji}</span>
                  <span className="flex-1 font-bold truncate">{tr.name}</span>
                  {tr.id === activeTrackId && <span className="w-2 h-2 shrink-0" style={{ backgroundColor: PAL.reef }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5" style={{ backgroundColor: PAL.white, border: `2px solid ${PAL.ink}`, boxShadow: '2px 2px 0 rgba(13,43,50,0.3)' }}>
            <Icon kind="flame" className="w-3.5 h-3.5" style={{ color: PAL.coral }} />
            <span className="pixel-font" style={{ fontSize: 9, color: PAL.ink }}>{streak}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5" style={{ backgroundColor: PAL.white, border: `2px solid ${PAL.ink}`, boxShadow: '2px 2px 0 rgba(13,43,50,0.3)' }}>
            <Icon kind="pearl" className="w-3.5 h-3.5" style={{ color: PAL.pearlGold }} />
            <span className="pixel-font" style={{ fontSize: 9, color: PAL.ink }}>{gems}</span>
          </div>
        </div>
      </div>

      {/* ── main: one tab visible at a time ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'play' && (
          <div className="h-full flex flex-col items-center justify-center px-4 py-4 gap-5">
            {switching ? (
              <p className="font-bold text-white">{t.switching}</p>
            ) : allDone ? (
              <div className="text-center">
                <p className="text-6xl mb-3">🦪</p>
                <p className="text-xl font-black text-white">{t.allDone}</p>
                <p className="mt-2 font-bold text-white/80">{t.allDoneSub}</p>
              </div>
            ) : currentSkill ? (
              <>
                {/* the current dive: square portal, not a circle */}
                <PixelPanel className="w-[168px]" tone="light">
                  <div className="w-full aspect-square flex items-center justify-center text-6xl mb-2" style={{ backgroundColor: PAL.lagoon, border: `2px solid ${PAL.ink}` }}>
                    {currentSkill.emoji || '⭐'}
                  </div>
                  <p className="font-black text-sm text-center truncate mb-2" style={{ color: PAL.ink }}>{currentSkill.title}</p>
                  <DiveMeter pct={currentProgressPct} color={PAL.reef} />
                </PixelPanel>

                {/* dive button: flat, presses in on tap */}
                <button
                  type="button"
                  onClick={goToCurrentLesson}
                  aria-label={t.dive}
                  className="flex items-center gap-2 px-8 py-3.5 transition-transform active:translate-x-[3px] active:translate-y-[3px]"
                  style={{ backgroundColor: PAL.coral, border: `2px solid ${PAL.ink}`, boxShadow: `4px 4px 0 rgba(13,43,50,0.35)` }}
                >
                  <Icon kind="play" className="w-5 h-5" style={{ color: PAL.white }} />
                  <span className="font-black text-white text-sm uppercase tracking-wide">{t.dive}</span>
                </button>

                {/* nearby dives — inventory-style slots, current one gold-bordered */}
                <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory px-6 py-1 max-w-full">
                  {orderedSkills.map(s => {
                    const unlocked = isUnlocked(s)
                    const complete = isComplete(s.id)
                    const isCurrent = s.id === currentSkillId
                    const state: 'done' | 'current' | 'locked' = complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
                    const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.current : s.title
                    return (
                      <Slot
                        key={s.id}
                        size={isCurrent ? 48 : 38}
                        state={state}
                        content={<span style={{ fontSize: isCurrent ? 20 : 16 }}>{s.emoji || '⭐'}</span>}
                        onClick={() => handleNodeTap(s, unlocked)}
                        label={label}
                        nodeRef={isCurrent ? (el) => { currentNodeRef.current = el } : undefined}
                      />
                    )
                  })}
                </div>
              </>
            ) : null}
          </div>
        )}

        {tab === 'trophies' && (
          <div className="max-w-[560px] mx-auto px-4 py-5">
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <PixelPanel className="text-center">
                <Icon kind="flame" className="w-5 h-5 mx-auto mb-1" style={{ color: PAL.coral }} />
                <p className="font-black text-lg leading-none">{streak}</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: PAL.inkSoft }}>{t.streak}</p>
              </PixelPanel>
              <PixelPanel className="text-center">
                <Icon kind="pearl" className="w-5 h-5 mx-auto mb-1" style={{ color: PAL.pearlGold }} />
                <p className="font-black text-lg leading-none">{gems}</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: PAL.inkSoft }}>{t.pearls}</p>
              </PixelPanel>
              <PixelPanel className="text-center">
                <Icon kind="anchor" className="w-5 h-5 mx-auto mb-1" style={{ color: PAL.reefDeep }} />
                <p className="font-black text-lg leading-none">{hh}h{mm}m</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: PAL.inkSoft }}>{t.timePlayed}</p>
              </PixelPanel>
            </div>

            <PixelPanel pad={false}>
              <h3 className="font-black text-base p-3" style={{ borderBottom: `2px solid ${PAL.ink}` }}>{t.leaderboard}</h3>
              <div className="flex flex-col">
                {leaderboard.slice(0, 8).map(e => <LeaderboardRow key={e.id} entry={e} t={t} />)}
              </div>
            </PixelPanel>
          </div>
        )}

        {tab === 'quests' && (
          <div className="max-w-[560px] mx-auto px-4 py-5 flex flex-col gap-4">
            {dailyQuest && (
              <PixelPanel>
                <h3 className="font-black text-base mb-3">{t.dailyQuests}</h3>
                <p className="text-sm font-bold mb-3" style={{ color: PAL.ink }}>{dailyQuest.label}</p>
                {(() => {
                  const pct = dailyQuest.target > 0 ? Math.min(100, Math.round((dailyQuest.current / dailyQuest.target) * 100)) : 0
                  return (
                    <>
                      <div className="mb-3"><DiveMeter pct={pct} color={PAL.gold} /></div>
                      <p className="text-xs font-black mb-3" style={{ color: PAL.inkSoft }}>{dailyQuest.current}/{dailyQuest.target}</p>
                      <button
                        type="button"
                        disabled={pct < 100}
                        className="w-full py-2.5 font-black text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                        style={{ backgroundColor: pct >= 100 ? PAL.coral : PAL.lagoonFill, color: pct >= 100 ? PAL.white : PAL.inkSoft, border: `2px solid ${PAL.ink}`, boxShadow: pct >= 100 ? '3px 3px 0 rgba(13,43,50,0.3)' : 'none' }}
                      >
                        <Icon kind="chest" className="w-4 h-4" />{t.challengeCheck}
                      </button>
                    </>
                  )
                })()}
              </PixelPanel>
            )}

            {dailyChallenge && (
              <PixelPanel>
                <h3 className="font-black text-base mb-3">{t.dailyChallenges}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: PAL.lagoon, border: `2px solid ${PAL.ink}` }}>{dailyChallenge.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-bold truncate', dailyChallenge.completed && 'line-through')} style={{ color: dailyChallenge.completed ? PAL.inkSoft : PAL.ink }}>{dailyChallenge.title}</p>
                    <p className="text-xs font-black" style={{ color: PAL.goldDeep }}>+{dailyChallenge.xp_reward} XP</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)}
                  disabled={dailyChallenge.completed}
                  className="w-full py-2.5 font-black text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                  style={{ backgroundColor: dailyChallenge.completed ? PAL.lagoonFill : PAL.coral, color: dailyChallenge.completed ? PAL.reefDeep : PAL.white, border: `2px solid ${PAL.ink}`, boxShadow: dailyChallenge.completed ? 'none' : '3px 3px 0 rgba(13,43,50,0.3)' }}
                >
                  {dailyChallenge.completed ? <Icon kind="check" className="w-4 h-4" /> : <Icon kind="chest" className="w-4 h-4" />}
                  {dailyChallenge.completed ? t.challengeDone : t.challengeCheck}
                </button>
              </PixelPanel>
            )}
          </div>
        )}
      </div>

      {/* ── bottom: literal inventory hotbar as the nav ── */}
      <div className="shrink-0 flex items-center justify-center gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {([
          { key: 'play', icon: 'mask' as IconKind, label: t.tabPlay },
          { key: 'trophies', icon: 'trophy' as IconKind, label: t.tabTrophies },
          { key: 'quests', icon: 'chest' as IconKind, label: t.tabQuests },
        ] as const).map(item => (
          <Slot
            key={item.key}
            size={48}
            selected={tab === item.key}
            state="neutral"
            content={<Icon kind={item.icon} className="w-5 h-5" style={{ color: tab === item.key ? PAL.ink : PAL.inkSoft }} />}
            onClick={() => setTab(item.key)}
            label={item.label}
          />
        ))}
      </div>
    </div>
  )
}