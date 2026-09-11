'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v5 — full layout change
// ──────────────────────────────────
// Goal: the user should know what to do without reading anything. That
// means one obvious focal point, not a dashboard of competing cards.
//
// What this screen is now:
//  - A single "Play" focus screen: a big progress ring around today's
//    level (emoji + fill = how far through it you are) with one giant
//    Play button under it. That's the only large, bright, moving thing
//    on screen — nothing competes with it (isolation effect).
//  - A quiet trail of small circles below it shows nearby levels —
//    checkmark = done, padlock = locked, bigger + glowing = current.
//    These are universally understood without a label (Jakob's law).
//  - Leaderboard and quests/challenges — previously always-visible side
//    cards — now live behind icon-only bottom tabs (progressive
//    disclosure), so the home screen keeps exactly one job.
//  - Streak + pearls are a tiny HUD in the corner, not a headline card —
//    familiar flame/coin iconography needs no caption.
//
// All props, hooks, and routing logic behave the same as the original;
// only the layout and information hierarchy changed.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Play', locked: 'Locked', completed: 'Completed', current: 'Current level',
    allDone: 'World complete!', allDoneSub: "You've cleared every level here.",
    switching: 'Loading…',
    leaderboard: 'Leaderboard', you: 'You',
    dailyQuests: 'Weekly quest', dailyChallenges: 'Daily challenge',
    challengeDone: 'Claimed', challengeCheck: 'Claim',
    stats: 'Your stats', streak: 'Streak', pearls: 'Pearls', timePlayed: 'Time played',
    tabPlay: 'Play', tabTrophies: 'Trophies', tabQuests: 'Quests',
  },
  ar: {
    play: 'العب', locked: 'مقفل', completed: 'مكتمل', current: 'المستوى الحالي',
    allDone: 'أنهيت هذا العالم! 🏆', allDoneSub: 'أكملت كل المستويات هنا.',
    switching: 'جارٍ التحميل…',
    leaderboard: 'لوحة الصدارة', you: 'أنت',
    dailyQuests: 'تحدي الأسبوع', dailyChallenges: 'تحدي اليوم',
    challengeDone: 'تم التحصيل', challengeCheck: 'تحصيل',
    stats: 'إحصائياتك', streak: 'التتابع', pearls: 'اللآلئ', timePlayed: 'وقت اللعب',
    tabPlay: 'العب', tabTrophies: 'الجوائز', tabQuests: 'المهام',
  },
  fr: {
    play: 'Jouer', locked: 'Verrouillé', completed: 'Terminé', current: 'Niveau actuel',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as fini tous les niveaux ici.',
    switching: 'Chargement…',
    leaderboard: 'Classement', you: 'Toi',
    dailyQuests: 'Défi de la semaine', dailyChallenges: 'Défi du jour',
    challengeDone: 'Réclamé', challengeCheck: 'Réclamer',
    stats: 'Tes statistiques', streak: 'Série', pearls: 'Perles', timePlayed: 'Temps joué',
    tabPlay: 'Jouer', tabTrophies: 'Trophées', tabQuests: 'Missions',
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

type IconKind = 'lock' | 'check' | 'flame' | 'pearl' | 'play' | 'trophy' | 'gift' | 'home' | 'chevronDown'

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
          <ellipse cx="9" cy="9" rx="2.6" ry="1.6" fill="#FFFFFF" opacity="0.75" transform="rotate(-30 9 9)"/>
        </svg>
      )
    case 'play':
      return <svg {...common}><path d="M8 5v14l11-7L8 5Z"/></svg>
    case 'trophy':
      return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'gift':
      return <svg {...common}><path d="M20 7h-2.2a3 3 0 0 0-4.8-3.4L12 4.6l-1-1a3 3 0 0 0-4.8 3.4H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM12 20H6v-7h6v7Zm0-9H5V9h7v2Zm0-4h-1.5A1.5 1.5 0 1 1 12 5.5V7Zm2 4h7v7h-7v-7Zm0-4V5.5A1.5 1.5 0 1 1 13.5 7H12Zm6 2h-7V9h7v2Z"/></svg>
    case 'home':
      return <svg {...common}><path d="M12 3 3 10v11h6v-6h6v6h6V10L12 3Z"/></svg>
    case 'chevronDown':
      return <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
  }
}

// ── HUD (top corner, tiny, icon-only) ──────────────────────────────────
function HudStat({ kind, value, color }: { kind: IconKind; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)' }}>
      <Icon kind={kind} className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs font-black" style={{ color: PAL.ink }}>{value}</span>
    </div>
  )
}

// ── Progress ring around the current level's emoji ─────────────────────
function ProgressRing({ pct, size = 176, color = PAL.reef, children }: { pct: number; size?: number; color?: string; children: React.ReactNode }) {
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(2, pct) / 100) * c
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PAL.lagoonFill} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

// ── the quiet trail of nearby levels beneath the focus card ────────────
function TrailNode({ skill, state, isCurrent, onClick, label, nodeRef }: {
  skill: Skill
  state: 'done' | 'current' | 'locked'
  isCurrent: boolean
  onClick: () => void
  label: string
  nodeRef?: (el: HTMLButtonElement | null) => void
}) {
  const locked = state === 'locked'
  const [shake, setShake] = useState(false)
  const bg = state === 'current' ? PAL.gold : state === 'done' ? PAL.reef : PAL.lagoonFill

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
      ref={nodeRef}
      type="button"
      onClick={handleClick}
      aria-disabled={locked}
      aria-label={label}
      className={cn(
        'relative z-10 shrink-0 rounded-full flex items-center justify-center transition-transform snap-center',
        !locked && 'active:scale-90',
        locked && 'cursor-not-allowed',
      )}
      style={{
        width: isCurrent ? 52 : 40,
        height: isCurrent ? 52 : 40,
        backgroundColor: bg,
        boxShadow: isCurrent ? `0 0 0 4px ${PAL.gold}55, 0 3px 0 ${PAL.goldDeep}` : '0 2px 0 rgba(41,57,74,0.1)',
        animation: shake ? 'shakeX 0.4s ease' : undefined,
      }}
    >
      {locked ? (
        <Icon kind="lock" className="w-4 h-4" style={{ color: PAL.inkSoft }} />
      ) : (
        <span style={{ fontSize: isCurrent ? 22 : 17 }}>{skill.emoji || '⭐'}</span>
      )}
      {state === 'done' && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: PAL.white }}>
          <Icon kind="check" className="w-2.5 h-2.5" style={{ color: PAL.reefDeep }} />
        </span>
      )}
    </button>
  )
}

function PlayBurst() {
  const dots = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2
      return { bx: Math.cos(angle) * 46, by: Math.sin(angle) * 46, color: i % 2 === 0 ? PAL.gold : PAL.white }
    }),
    [],
  )
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: d.color, '--bx': `${d.bx}px`, '--by': `${d.by}px`, animation: 'burstOut 0.5s ease-out forwards' } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function LeaderboardRow({ entry, t }: { entry: LeaderboardEntry; t: Record<string, string> }) {
  const [errored, setErrored] = useState(false)
  const medal = entry.rank_global === 1 ? '🥇' : entry.rank_global === 2 ? '🥈' : entry.rank_global === 3 ? '🥉' : null
  const initial = entry.name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={entry.is_current_user ? { backgroundColor: PAL.lagoon } : undefined}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>
        {medal ?? entry.rank_global ?? '–'}
      </div>
      {entry.avatar_url && !errored ? (
        <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" onError={() => setErrored(true)} />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>
          {initial}
        </div>
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
  const [bursting, setBursting] = useState(false)

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

  const handlePlayTap = () => {
    setBursting(true)
    window.setTimeout(() => { goToCurrentLesson() }, 220)
    window.setTimeout(() => { setBursting(false) }, 600)
  }

  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const hh = Math.floor((totalTimeMins || 0) / 60)
  const mm = (totalTimeMins || 0) % 60
  const trackColor = activeTrack?.color || PAL.reef

  return (
    <div dir={dir} className="h-screen w-full overflow-hidden flex flex-col font-[Baloo_2,Cairo,sans-serif]" style={{ backgroundColor: PAL.lagoon, color: PAL.ink }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Cairo:wght@600;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes playPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,107,87,0.45), 0 5px 0 ${PAL.coralDeep}; } 50% { box-shadow: 0 0 0 14px rgba(255,107,87,0), 0 5px 0 ${PAL.coralDeep}; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.85) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes floatBubble { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes shakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        @keyframes burstOut { from { opacity: 1; transform: translate(0,0) scale(1); } to { opacity: 0; transform: translate(var(--bx), var(--by)) scale(0.3); } }
        @keyframes navPop { 0% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1); } }
      ` }} />

      {/* ── HUD: track switcher + streak + pearls, tiny, corner, icon-first ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 shrink-0">
        {activeTrack ? (
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowPicker(v => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white"
              style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)' }}
              aria-label={activeTrack.name}
            >
              <span className="text-base">{activeTrack.emoji}</span>
              <Icon kind="chevronDown" className="w-3 h-3" style={{ color: PAL.inkSoft }} />
            </button>
            {showPicker && (
              <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-56 bg-white rounded-2xl overflow-hidden z-30" style={{ boxShadow: '0 8px 24px rgba(41,57,74,0.14)' }}>
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
        ) : <div />}

        <div className="flex items-center gap-2">
          <HudStat kind="flame" value={streak} color={PAL.coral} />
          <HudStat kind="pearl" value={gems} color={PAL.gold} />
        </div>
      </div>

      {/* ── main area: exactly one tab visible at a time ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'play' && (
          <div className="relative h-full flex flex-col items-center justify-center px-4 py-4 gap-6 overflow-hidden">
            {/* ambient: soft glow + a few slow-floating bubbles, purely atmospheric */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div className="absolute rounded-full" style={{ width: 340, height: 340, top: '18%', left: '50%', transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, ${trackColor}22, transparent 70%)` }} />
              <span className="absolute w-3 h-3 rounded-full bg-white/50" style={{ top: '20%', left: '18%', animation: 'floatBubble 5s ease-in-out infinite' }} />
              <span className="absolute w-2 h-2 rounded-full bg-white/40" style={{ top: '65%', right: '15%', animation: 'floatBubble 4s ease-in-out infinite 0.6s' }} />
              <span className="absolute w-2.5 h-2.5 rounded-full bg-white/45" style={{ top: '40%', right: '22%', animation: 'floatBubble 6s ease-in-out infinite 1.1s' }} />
            </div>

            {switching ? (
              <p className="relative font-bold" style={{ color: PAL.inkSoft }}>{t.switching}</p>
            ) : allDone ? (
              <div className="relative text-center" style={{ animation: 'popIn 0.4s ease both' }}>
                <p className="text-6xl mb-3">🏆</p>
                <p className="text-xl font-black">{t.allDone}</p>
                <p className="mt-2 font-bold" style={{ color: PAL.inkSoft }}>{t.allDoneSub}</p>
              </div>
            ) : currentSkill ? (
              <>
                <div className="relative flex flex-col items-center gap-1" style={{ animation: 'popIn 0.4s ease both' }}>
                  <ProgressRing pct={currentProgressPct} size={168} color={trackColor}>
                    <div className="w-[124px] h-[124px] rounded-full flex items-center justify-center text-5xl" style={{ backgroundColor: PAL.white, boxShadow: '0 2px 0 rgba(41,57,74,0.08)' }}>
                      {currentSkill.emoji || '⭐'}
                    </div>
                  </ProgressRing>
                  <p className="font-black text-lg text-center mt-1" style={{ color: PAL.ink }}>{currentSkill.title}</p>
                </div>

                <button
                  type="button"
                  onClick={handlePlayTap}
                  aria-label={t.play}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
                  style={{
                    backgroundColor: PAL.coral,
                    boxShadow: `0 5px 0 ${PAL.coralDeep}`,
                    animation: 'playPulse 2.4s ease-in-out infinite, popIn 0.4s ease 0.08s both',
                  }}
                >
                  <Icon kind="play" className="w-8 h-8 ms-1" style={{ color: PAL.white }} />
                  {bursting && <PlayBurst />}
                </button>

                {/* quiet trail of nearby levels — context, not the focus */}
                <div className="relative w-full max-w-[520px]" style={{ animation: 'popIn 0.4s ease 0.16s both' }}>
                  <div className="no-scrollbar flex items-center gap-3 overflow-x-auto snap-x snap-mandatory px-6 py-2 relative">
                    <div className="absolute left-6 right-6 top-1/2 h-[2px] -translate-y-1/2 z-0" style={{ backgroundColor: PAL.lagoonFill }} />
                    {orderedSkills.map(s => {
                      const unlocked = isUnlocked(s)
                      const complete = isComplete(s.id)
                      const isCurrent = s.id === currentSkillId
                      const state: 'done' | 'current' | 'locked' = complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
                      const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.current : s.title
                      return (
                        <TrailNode
                          key={s.id}
                          skill={s}
                          state={state}
                          isCurrent={isCurrent}
                          onClick={() => handleNodeTap(s, unlocked)}
                          label={label}
                          nodeRef={isCurrent ? (el) => { currentNodeRef.current = el } : undefined}
                        />
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {tab === 'trophies' && (
          <div className="max-w-[560px] mx-auto px-4 py-5">
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: PAL.white }}>
                <Icon kind="flame" className="w-5 h-5 mx-auto mb-1" style={{ color: PAL.coral }} />
                <p className="font-black text-lg leading-none">{streak}</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: PAL.inkSoft }}>{t.streak}</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: PAL.white }}>
                <Icon kind="pearl" className="w-5 h-5 mx-auto mb-1" style={{ color: PAL.gold }} />
                <p className="font-black text-lg leading-none">{gems}</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: PAL.inkSoft }}>{t.pearls}</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: PAL.white }}>
                <Icon kind="trophy" className="w-5 h-5 mx-auto mb-1" style={{ color: PAL.reefDeep }} />
                <p className="font-black text-lg leading-none">{hh}h{mm}m</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: PAL.inkSoft }}>{t.timePlayed}</p>
              </div>
            </div>

            <div className="rounded-3xl p-4 sm:p-5" style={{ backgroundColor: PAL.white }}>
              <h3 className="font-black text-base mb-3">{t.leaderboard}</h3>
              <div className="flex flex-col gap-1">
                {leaderboard.slice(0, 8).map(e => <LeaderboardRow key={e.id} entry={e} t={t} />)}
              </div>
            </div>
          </div>
        )}

        {tab === 'quests' && (
          <div className="max-w-[560px] mx-auto px-4 py-5 flex flex-col gap-4">
            {dailyQuest && (
              <div className="rounded-3xl p-4 sm:p-5" style={{ backgroundColor: PAL.white }}>
                <h3 className="font-black text-base mb-3">{t.dailyQuests}</h3>
                <p className="text-sm font-bold mb-3" style={{ color: PAL.ink }}>{dailyQuest.label}</p>
                {(() => {
                  const pct = dailyQuest.target > 0 ? Math.min(100, Math.round((dailyQuest.current / dailyQuest.target) * 100)) : 0
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 rounded-full overflow-hidden w-full" style={{ backgroundColor: PAL.lagoonFill }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, pct)}%`, backgroundColor: PAL.gold }} />
                        </div>
                        <span className="text-xs font-black shrink-0" style={{ color: PAL.inkSoft }}>{dailyQuest.current}/{dailyQuest.target}</span>
                      </div>
                      <button
                        type="button"
                        disabled={pct < 100}
                        className="w-full rounded-2xl py-2.5 font-black text-sm flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: pct >= 100 ? PAL.coral : PAL.lagoonFill, color: pct >= 100 ? PAL.white : PAL.inkSoft }}
                      >
                        <Icon kind="gift" className="w-4 h-4" />{t.challengeCheck}
                      </button>
                    </>
                  )
                })()}
              </div>
            )}

            {dailyChallenge && (
              <div className="rounded-3xl p-4 sm:p-5" style={{ backgroundColor: PAL.white }}>
                <h3 className="font-black text-base mb-3">{t.dailyChallenges}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: PAL.lagoon }}>{dailyChallenge.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-bold truncate', dailyChallenge.completed && 'line-through')} style={{ color: dailyChallenge.completed ? PAL.inkSoft : PAL.ink }}>{dailyChallenge.title}</p>
                    <p className="text-xs font-black" style={{ color: PAL.goldDeep }}>+{dailyChallenge.xp_reward} XP</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)}
                  disabled={dailyChallenge.completed}
                  className="w-full rounded-2xl py-2.5 font-black text-sm flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: dailyChallenge.completed ? PAL.lagoonFill : PAL.coral, color: dailyChallenge.completed ? PAL.reefDeep : PAL.white }}
                >
                  {dailyChallenge.completed ? <Icon kind="check" className="w-4 h-4" /> : <Icon kind="gift" className="w-4 h-4" />}
                  {dailyChallenge.completed ? t.challengeDone : t.challengeCheck}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── bottom nav: 3 icons, no labels, floating card ── */}
      <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex items-center justify-around bg-white rounded-[28px] px-4 py-2" style={{ boxShadow: '0 4px 18px rgba(41,57,74,0.12)' }}>
          {([
            { key: 'play', icon: 'home' as IconKind, label: t.tabPlay },
            { key: 'trophies', icon: 'trophy' as IconKind, label: t.tabTrophies },
            { key: 'quests', icon: 'gift' as IconKind, label: t.tabQuests },
          ] as const).map(item => {
            const active = tab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                aria-label={item.label}
                className="flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-colors"
                style={{ backgroundColor: active ? PAL.lagoon : 'transparent' }}
              >
                <Icon
                  key={active ? `${item.key}-active` : item.key}
                  kind={item.icon}
                  className="w-5 h-5"
                  style={{ color: active ? PAL.reefDeep : PAL.inkSoft, animation: active ? 'navPop 0.35s ease' : undefined }}
                />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? PAL.reef : 'transparent' }} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}