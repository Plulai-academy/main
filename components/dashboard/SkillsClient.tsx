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
    dailyChallengesSub: 'New challenges every day',
  },
  ar: {
    continueBtn: 'واصل', startBtn: 'ابدأ', jumpHere: 'اقفز هنا؟',
    lessonOf: 'الدرس', of: 'من',
    locked: 'درس مقفل', completed: 'درس مكتمل', current: 'الدرس الحالي، اضغط للبدء',
    allDone: 'المسار مكتمل', allDoneSub: 'أتقنت كل المهارات هنا.',
    switching: 'جارٍ التحميل…', back: 'رجوع',
    leaderboard: 'لوحة الصدارة', viewAll: 'عرض الكل', you: 'أنت',
    dailyQuests: 'المهام اليومية', dailyChallenges: 'التحديات اليومية',
    dailyChallengesSub: 'تحديات جديدة كل يوم',
  },
  fr: {
    continueBtn: 'Continuer', startBtn: 'Commencer', jumpHere: 'SAUTER ICI ?',
    lessonOf: 'Leçon', of: 'sur',
    locked: 'Leçon verrouillée', completed: 'Leçon terminée', current: 'Leçon actuelle, appuie pour commencer',
    allDone: 'Piste terminée', allDoneSub: 'Tu as maîtrisé toutes les compétences ici.',
    switching: 'Chargement…', back: 'Retour',
    leaderboard: 'Classement', viewAll: 'Tout voir', you: 'Toi',
    dailyQuests: 'Quêtes du jour', dailyChallenges: 'Défis du jour',
    dailyChallengesSub: 'De nouveaux défis chaque jour',
  },
}

const ICONS = {
  streak: '/icons/streak.png',
  gems:   '/icons/gem.png',
}
// Drop /icons/mascot.png in public to replace the SVG silhouette automatically.
const MASCOT_SRC: string | null = null

interface Track    { id: string; name: string; emoji: string; color: string }
interface Skill    { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg{ skill_node_id: string; progress_pct: number; completed_at: string | null }

interface LeaderboardEntry {
  user_id: string
  rank: number
  name: string
  avatar_url: string | null
  points: number
  is_current_user?: boolean
}

interface DailyQuest {
  label: string
  current: number
  target: number
  icon_url?: string | null
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
}

const OFFSET_PATTERN = [0, -1, 1, 0]

function offsetTransform(offset: number) {
  if (offset === 0) return undefined
  return `translateX(calc(${offset} * min(14vw, 54px)))`
}

// ─── Inline SVG icon set ────────────────────────────────────────────
type IconKind = 'book' | 'star' | 'chest' | 'trophy' | 'fastForward' | 'lock' | 'check'

function NodeIcon({ kind, className }: { kind: IconKind; className?: string }) {
  const common = { className, fill: 'currentColor', viewBox: '0 0 24 24' as const }
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
  }
}

function iconForIndex(idx: number): IconKind {
  const set: IconKind[] = ['book', 'star', 'chest', 'trophy']
  return set[idx % set.length]
}

// ─── 3D oval node ──────────────────────────────────────────────────
function PathNode({
  state, icon, complete, onClick, disabled, label, offset, isCurrent,
}: {
  state: 'done' | 'current' | 'locked'
  icon: IconKind
  complete: boolean
  onClick: () => void
  disabled: boolean
  label: string
  offset: number
  isCurrent: boolean
}) {
  const palette =
    state === 'current'
      ? { front: '#1CB0F6', base: '#1280B8', text: '#FFFFFF' }
      : state === 'done'
      ? { front: '#FAA918', base: '#B87A0E', text: '#FFFFFF' }
      : { front: '#2A323A', base: '#1B2026', text: '#5B6772' }

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        transform: offsetTransform(offset),
        width: 'clamp(72px, 22vw, 96px)',
        height: 'clamp(72px, 22vw, 96px)',
        marginBottom: 'clamp(28px, 8vw, 44px)',
      }}
    >
      {/* Base shadow oval */}
      {state !== 'locked' && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-[50%/60%]"
          style={{
            backgroundColor: palette.base,
            transform: 'translateY(6px)',
          }}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'absolute inset-0 rounded-[50%/60%] flex items-center justify-center',
          'transition-transform duration-100 ease-out',
          !disabled && 'hover:-translate-y-0.5 active:translate-y-[4px]',
          disabled && 'cursor-default',
        )}
        style={{
          backgroundColor: palette.front,
          color: palette.text,
          boxShadow:
            state === 'locked'
              ? 'inset 0 -3px 0 rgba(0,0,0,0.25)'
              : 'inset 0 6px 0 rgba(255,255,255,0.22), inset 0 -4px 0 rgba(0,0,0,0.18)',
        }}
      >
        <NodeIcon
          kind={isCurrent ? 'fastForward' : icon}
          className="w-[46%] h-[46%] drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]"
        />

        {/* Completion badge */}
        {complete && !isCurrent && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#58CC02',
              boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
            }}
          >
            <NodeIcon kind="check" className="w-4 h-4 text-white" />
          </span>
        )}
      </button>
    </div>
  )
}

// ─── JUMP HERE bubble ──────────────────────────────────────────────
function JumpBubble({ text }: { text: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 select-none pointer-events-none"
      style={{
        top: 'clamp(-58px, -16vw, -52px)',
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
        {/* Tail */}
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-3 h-3 bg-white rotate-45"
        />
      </div>
    </div>
  )
}

// ─── Mascot silhouette ─────────────────────────────────────────────
function MascotPlaceholder() {
  if (MASCOT_SRC) {
    return (
      <img
        src={MASCOT_SRC}
        alt=""
        aria-hidden
        className="select-none pointer-events-none opacity-40"
        style={{ width: 'clamp(110px, 28vw, 170px)' }}
      />
    )
  }
  return (
    <svg
      viewBox="0 0 120 140"
      aria-hidden
      className="select-none pointer-events-none opacity-25"
      style={{ width: 'clamp(110px, 28vw, 170px)', color: '#5B6772' }}
      fill="currentColor"
    >
      <ellipse cx="60" cy="55" rx="38" ry="42" />
      <rect x="28" y="80" width="64" height="50" rx="24" />
      <circle cx="48" cy="52" r="5" fill="#0B0F14" />
      <circle cx="72" cy="52" r="5" fill="#0B0F14" />
      <ellipse cx="60" cy="110" rx="18" ry="14" fill="#3a4550" />
    </svg>
  )
}

// ─── Sidebar: card shell ────────────────────────────────────────────
function SideCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-[#141A21] border border-white/10 rounded-2xl p-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── Sidebar: rank pill (medal for top 3, number otherwise) ───────
function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '#FFD43B' : rank === 2 ? '#C9CFD6' : rank === 3 ? '#D98F4E' : null
  if (medal) {
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-[#0B0F14] shrink-0"
        style={{ backgroundColor: medal }}
      >
        {rank}
      </div>
    )
  }
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-[#F5F5F5]/50 shrink-0">
      {rank}
    </div>
  )
}

// ─── Sidebar: live leaderboard ─────────────────────────────────────
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <NodeIcon kind="trophy" className="w-5 h-5" />
          <h3 className="font-black text-[15px]">{t.leaderboard}</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-extrabold text-[#1CB0F6] hover:text-[#14D4F4] transition-colors"
        >
          {t.viewAll}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {top.map(entry => (
          <div
            key={entry.user_id}
            className={cn(
              'flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl',
              entry.is_current_user && 'bg-[#1CB0F6]/12',
            )}
          >
            <RankBadge rank={entry.rank} />
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#2A323A] shrink-0 flex items-center justify-center text-[11px] font-black">
              {entry.avatar_url ? (
                <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                entry.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="flex-1 min-w-0 truncate text-sm font-bold">
              {entry.is_current_user ? t.you : entry.name}
            </span>
            <span className="text-sm font-black text-[#FAA918] shrink-0">{entry.points}</span>
          </div>
        ))}
      </div>
    </SideCard>
  )
}

// ─── Sidebar: daily quest progress ─────────────────────────────────
function DailyQuestCard({ quest, t }: { quest: DailyQuest; t: Record<string, string> }) {
  const pct = quest.target > 0 ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 0
  return (
    <SideCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <NodeIcon kind="star" className="w-5 h-5 text-[#FAA918]" />
          <h3 className="font-black text-[15px]">{t.dailyQuests}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FAA918]/15 flex items-center justify-center shrink-0">
          <NodeIcon kind="star" className="w-5 h-5 text-[#FAA918]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1.5 truncate">{quest.label}</p>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FAA918] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] font-extrabold text-[#F5F5F5]/50 mt-1">
            {quest.current} / {quest.target}
          </p>
        </div>
      </div>
    </SideCard>
  )
}

// ─── Sidebar: daily challenges CTA ─────────────────────────────────
function DailyChallengesCard({ t, onClick }: { t: Record<string, string>; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#1CB0F6] rounded-2xl p-4 shadow-[0_4px_0_#1280B8] active:translate-y-[2px] active:shadow-[0_2px_0_#1280B8] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <NodeIcon kind="fastForward" className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-[15px] leading-tight">{t.dailyChallenges}</p>
          <p className="text-white/80 text-xs font-bold truncate">{t.dailyChallengesSub}</p>
        </div>
      </div>
    </button>
  )
}

// ─── Main component ────────────────────────────────────────────────
export default function SkillsClient({
  userId, tracks, initialTrackId, skills, skillProgress, lessonCountMap,
  language, streak, gems, initialCurrentSkillId, initialFirstIncompleteLessonId,
  leaderboard = [], dailyQuest,
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

  const handleTrackSelect = async (trackId: string) => {
    if (trackId === activeTrackId) { setShowPicker(false); return }
    setShowPicker(false); setSwitching(true); setActiveTrackId(trackId)
    setCurrentTrack(trackId).catch(() => {})
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

      {/* ── TOP BAR ── */}
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

      {/* ── BODY: path + sidebar ── */}
      <div className="flex-1 flex justify-center gap-8 px-4 pb-32 pt-4 max-w-[1100px] mx-auto w-full">
        {/* ── PATH (main column) ── */}
        <div className="relative flex-1 min-w-0 max-w-[640px]">
          {/* Mascot */}
          <div
            aria-hidden
            className={cn(
              'absolute top-1/2 -translate-y-1/2 z-0 hidden xs:block sm:block',
              dir === 'rtl' ? 'left-2 sm:left-6' : 'right-2 sm:right-6',
            )}
          >
            <MascotPlaceholder />
          </div>

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
              {/* Unit banner */}
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

              <div className="relative z-10 flex flex-col items-center">
                {orderedSkills.map((skill, idx) => {
                  const unlocked  = isUnlocked(skill)
                  const complete  = isComplete(skill.id)
                  const isCurrent = skill.id === currentSkillId
                  const offset    = OFFSET_PATTERN[idx % OFFSET_PATTERN.length]
                  const state: 'done' | 'current' | 'locked' =
                    complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
                  const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.current : skill.title

                  return (
                    <div
                      key={skill.id}
                      ref={isCurrent ? currentNodeRef : null}
                      className="relative flex justify-center"
                    >
                      {isCurrent && <JumpBubble text={t.jumpHere} />}
                      <PathNode
                        state={state}
                        icon={iconForIndex(idx)}
                        complete={complete}
                        onClick={() => handleNodeTap(skill, unlocked)}
                        disabled={!unlocked}
                        label={label}
                        offset={offset}
                        isCurrent={isCurrent}
                      />
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 pt-1">
          <LeaderboardCard
            entries={leaderboard}
            t={t}
            onViewAll={() => router.push('/dashboard/leaderboard')}
          />
          {dailyQuest && <DailyQuestCard quest={dailyQuest} t={t} />}
          <DailyChallengesCard
            t={t}
            onClick={() => router.push('/dashboard/challenges')}
          />
        </aside>
      </div>

      {/* ── BOTTOM BAR ── */}
      {!switching && !allDone && currentSkill && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0B0F14]/95 backdrop-blur border-t border-white/10 px-4 py-3 z-20">
          {/* Mirrors the body's flex layout above so the button lines up with the path column, not the sidebar */}
          <div className="flex justify-center gap-8 max-w-[1100px] mx-auto w-full">
            <div className="flex-1 min-w-0 max-w-[640px]">
              <button
                onClick={goToCurrentLesson}
                className="w-full bg-[#1CB0F6] rounded-2xl px-5 py-3 flex flex-col items-start shadow-[0_4px_0_#1280B8] active:translate-y-[2px] active:shadow-[0_2px_0_#1280B8] transition-all"
              >
                <span className="text-white font-black tracking-wide">
                  {currentProgressPct > 0 ? t.continueBtn : t.startBtn}
                </span>
                <span className="text-white/85 text-xs font-bold truncate max-w-full">
                  {t.lessonOf} {currentLessonIdx} — {currentSkill.title}
                </span>
              </button>
            </div>
            {/* Ghost spacer matching sidebar width so the button column stays aligned with the path above */}
            <div className="hidden lg:block w-[320px] shrink-0" aria-hidden />
          </div>
        </div>
      )}

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