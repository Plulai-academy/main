'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useEffect, useRef, useMemo, useCallback, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<string, Record<string, string>> = {
  en: {
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    start: 'Start',
    continueLesson: 'Continue',
    switchTrack: 'Switch',
    allDone: "You've completed this track!",
    allDoneDesc: 'Explore another track to keep learning.',
    explore: 'Explore tracks',
    lockedHint: 'Finish {skill} first',
    locked: 'Locked',
    xp: 'XP',
  },
  ar: {
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    start: 'ابدأ',
    continueLesson: 'واصل',
    switchTrack: 'تغيير',
    allDone: 'أكملت هذا المسار!',
    allDoneDesc: 'استكشف مساراً آخر لمواصلة التعلم.',
    explore: 'استكشف المسارات',
    lockedHint: 'أكمل {skill} أولاً',
    locked: 'مقفل',
    xp: 'XP',
  },
  fr: {
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    start: 'Commencer',
    continueLesson: 'Continuer',
    switchTrack: 'Changer',
    allDone: 'Tu as terminé cette piste !',
    allDoneDesc: "Explore une autre piste pour continuer.",
    explore: 'Explorer les pistes',
    lockedHint: 'Termine {skill} d’abord',
    locked: 'Verrouillé',
    xp: 'XP',
  },
}

interface Track     { id: string; name: string; emoji: string; color: string }
interface Skill     { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg { skill_node_id: string; progress_pct: number; completed_at: string | null }

interface Props {
  userId:                  string
  tracks:                  Track[]
  skills:                  Skill[]
  skillProgress:           SkillProg[]
  lessonCountMap:          Record<string, number>
  language:                string
  userName:                string
  streak:                  number
  currentTrackId:          string | null
  nextSkillId:             string | null
  firstIncompleteLessonId: string | null
}

type NodeStatus = 'complete' | 'current' | 'available' | 'locked'

interface PathNode {
  skill: Skill
  status: NodeStatus
  x: number
  y: number
  size: number
  href: string
}

// ── Path geometry — tuned to fit comfortably inside px-6 on a 320px-wide phone ──
const PATH_WIDTH   = 260
const CENTER       = 130
const AMPLITUDE    = 34
const NODE_GAP_Y   = 100
const START_Y      = 90
const NODE_SIZE    = 56
const CURRENT_SIZE = 70

const PARTICLE_COLORS = ['#FFB344', '#FF7A59', '#FF6FA8', '#4ECDC4', '#7F77DD', '#FFD166']

function getGreeting(lang: string): string {
  const h = new Date().getHours()
  const t = UI[lang] ?? UI.en
  if (h < 12) return t.goodMorning
  if (h < 18) return t.goodAfternoon
  return t.goodEvening
}

function bgColorFor(status: NodeStatus): string {
  switch (status) {
    case 'complete':  return '#1D9E75'
    case 'current':   return '#1e1b3a'
    case 'available': return '#1a1a2e'
    case 'locked':    return '#141420'
  }
}

function iconFor(node: PathNode) {
  if (node.status === 'complete') {
    return (
      <svg width="22" height="22" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (node.status === 'locked') {
    return <span className="text-[19px] opacity-60" aria-hidden="true">🔒</span>
  }
  return <span className="text-[24px]" aria-hidden="true">{node.skill.emoji}</span>
}

export default function SkillsClient({
  userId, tracks, skills, skillProgress, lessonCountMap,
  language, userName, streak, currentTrackId, nextSkillId, firstIncompleteLessonId,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as Language
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [activeTrackId, setActiveTrackId] = useState(currentTrackId ?? tracks[0]?.id ?? '')
  const [showTrackPicker, setShowTrackPicker] = useState(false)
  const [burstingId, setBurstingId] = useState<string | null>(null)
  const [lockedHintId, setLockedHintId] = useState<string | null>(null)
  const [displayXp, setDisplayXp] = useState(0)

  const currentNodeRef = useRef<HTMLButtonElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lockedHintTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  const isUnlocked = useCallback((skill: Skill) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100),
    [progressMap],
  )

  const isComplete = useCallback((id: string) => (progressMap[id] ?? 0) >= 100, [progressMap])

  const trackSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrackId).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrackId],
  )

  const activeTrack = tracks.find(tr => tr.id === activeTrackId)
  const allTrackDone = trackSkills.length > 0 && trackSkills.every(s => isComplete(s.id))

  // Hero skill: the one and only "next" node on the path
  const heroSkill = useMemo(() => {
    if (activeTrackId === currentTrackId && nextSkillId) {
      return trackSkills.find(s => s.id === nextSkillId) ?? null
    }
    return trackSkills.find(s => isUnlocked(s) && !isComplete(s.id)) ?? null
  }, [trackSkills, nextSkillId, activeTrackId, currentTrackId, isUnlocked, isComplete])

  const heroLessonId = activeTrackId === currentTrackId ? firstIncompleteLessonId : null
  const heroProgress = heroSkill ? (progressMap[heroSkill.id] ?? 0) : 0

  const heroHref = heroSkill && heroLessonId
    ? `/dashboard/skills/${heroSkill.id}/lesson/${heroLessonId}`
    : heroSkill
    ? `/dashboard/skills/${heroSkill.id}`
    : '/dashboard/skills'

  // ── Build the winding path ──
  const pathNodes: PathNode[] = useMemo(() => {
    return trackSkills.map((skill, i) => {
      const complete = isComplete(skill.id)
      const unlocked = isUnlocked(skill)
      const status: NodeStatus =
        complete ? 'complete' :
        skill.id === heroSkill?.id ? 'current' :
        unlocked ? 'available' : 'locked'
      const size = status === 'current' ? CURRENT_SIZE : NODE_SIZE
      const href = status === 'current' ? heroHref : `/dashboard/skills/${skill.id}`
      return {
        skill,
        status,
        x: Math.sin(i * 1.05) * AMPLITUDE,
        y: i * NODE_GAP_Y + START_Y,
        size,
        href,
      }
    })
  }, [trackSkills, isComplete, isUnlocked, heroSkill, heroHref])

  const pathHeight = pathNodes.length
    ? pathNodes[pathNodes.length - 1].y + CURRENT_SIZE / 2 + 30
    : 0

  const linePath = useMemo(() => {
    if (!pathNodes.length) return ''
    return pathNodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${CENTER + n.x} ${n.y}`).join(' ')
  }, [pathNodes])

  const trackXp = useMemo(
    () => trackSkills.filter(s => isComplete(s.id)).reduce((sum, s) => sum + s.xp_reward, 0),
    [trackSkills, isComplete],
  )

  // Count XP up to its real value — a small, satisfying tick rather than an instant jump
  useEffect(() => {
    const start = displayXp
    const diff = trackXp - start
    if (diff === 0) return
    const duration = 500
    const startTime = performance.now()
    let frame: number
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setDisplayXp(Math.round(start + diff * progress))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackXp])

  // Gently bring the active node into view on load
  useEffect(() => {
    if (!allTrackDone) {
      currentNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [heroSkill?.id, allTrackDone])

  useEffect(() => {
    return () => {
      if (lockedHintTimeout.current) clearTimeout(lockedHintTimeout.current)
      if (navTimeout.current) clearTimeout(navTimeout.current)
    }
  }, [])

  // A tiny synthesized chime — no audio asset required, fails silently if unsupported
  const playPop = useCallback((rising: boolean) => {
    try {
      if (!audioCtxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AC()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(rising ? 520 : 640, ctx.currentTime)
      if (rising) osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.07, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {
      // Audio not available in this environment — fine to skip
    }
  }, [])

  const lockedHintText = (skill: Skill) => {
    const reqTitles = (skill.required_nodes || [])
      .map(id => skills.find(s => s.id === id)?.title)
      .filter(Boolean) as string[]
    return t.lockedHint.replace('{skill}', reqTitles[0] ?? '')
  }

  const handleLockedTap = (skill: Skill) => {
    setLockedHintId(skill.id)
    if (lockedHintTimeout.current) clearTimeout(lockedHintTimeout.current)
    lockedHintTimeout.current = setTimeout(() => setLockedHintId(null), 1800)
  }

  // The one tap that matters: feedback first, then go
  const handleNodeTap = (skill: Skill, status: NodeStatus, href: string) => {
    if (status === 'locked') {
      handleLockedTap(skill)
      return
    }
    setBurstingId(skill.id)
    playPop(status === 'current')
    navTimeout.current = setTimeout(() => {
      setBurstingId(null)
      router.push(href)
    }, 240)
  }

  return (
    <div
      className="min-h-screen bg-[#09090f] pb-28 select-none"
      dir={dir}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;700;800;900&display=swap');
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(127,119,221,0.45); }
          50%      { box-shadow: 0 0 0 10px rgba(127,119,221,0); }
        }
        @keyframes bobbing {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes burstFly {
          to { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))); opacity: 0; }
        }
        .path-particle {
          position: absolute; top: 50%; left: 50%;
          width: 6px; height: 6px; border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: burstFly 0.5s ease-out forwards;
          pointer-events: none;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="px-6 pt-8 pb-2">
        <p className="text-[13px] text-white/40 mb-1">{getGreeting(lang)}</p>

        <div className="flex items-center justify-between mb-5">
          {userName ? (
            <h1 className="text-[24px] font-bold text-white leading-tight">{userName}</h1>
          ) : <span />}

          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-[#141420] border border-white/8 rounded-full px-3 py-1.5">
                <span className="text-[15px]" aria-hidden="true">🔥</span>
                <span className="text-[13px] font-bold text-white">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-[#141420] border border-white/8 rounded-full px-3 py-1.5">
              <span className="text-[13px] font-bold text-[#AFA9EC]">{displayXp}</span>
              <span className="text-[11px] text-white/40">{t.xp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {activeTrack && (
              <>
                <span className="text-[16px]" aria-hidden="true">{activeTrack.emoji}</span>
                <span className="text-[14px] font-bold text-white/70">{activeTrack.name}</span>
              </>
            )}
          </div>
          {tracks.length > 1 && (
            <button
              onClick={() => setShowTrackPicker(v => !v)}
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F77DD]"
            >
              {t.switchTrack}
            </button>
          )}
        </div>

        {showTrackPicker && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tracks.map(tr => (
              <button
                key={tr.id}
                onClick={() => { setActiveTrackId(tr.id); setShowTrackPicker(false) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F77DD]',
                  tr.id === activeTrackId
                    ? 'bg-[#1e1b3a] border-[#534AB7] text-[#AFA9EC]'
                    : 'bg-[#141420] border-white/8 text-white/50 hover:border-white/20',
                )}
              >
                <span aria-hidden="true">{tr.emoji}</span>
                <span>{tr.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── PATH ── */}
      {allTrackDone ? (
        <div className="px-6">
          <div className="bg-[#141420] border border-white/8 rounded-[24px] p-7 text-center">
            <div className="text-[44px] mb-3" aria-hidden="true">🏆</div>
            <p className="text-[18px] font-bold text-white mb-2">{t.allDone}</p>
            <p className="text-[14px] text-white/50 mb-5">{t.allDoneDesc}</p>
            <button
              onClick={() => setShowTrackPicker(true)}
              className="px-6 py-3 rounded-[14px] bg-[#7F77DD] text-white text-[15px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t.explore}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6">
          <div className="relative mx-auto" style={{ width: PATH_WIDTH, height: pathHeight }}>
            <svg
              width={PATH_WIDTH}
              height={pathHeight}
              viewBox={`0 0 ${PATH_WIDTH} ${pathHeight}`}
              className="absolute top-0 left-0"
              aria-hidden="true"
            >
              <path
                d={linePath}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
                strokeDasharray="2 10"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {pathNodes.map(node => {
              const isLockedHint = lockedHintId === node.skill.id
              const bubbleTop = node.y - node.size / 2 - 38

              return (
                <div key={node.skill.id}>
                  {node.status === 'current' && (
                    <div
                      className="absolute motion-safe:animate-[bobbing_1.8s_ease-in-out_infinite] bg-[#7F77DD] text-white text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap z-10"
                      style={{ left: CENTER + node.x, top: bubbleTop, transform: 'translateX(-50%)' }}
                    >
                      {heroProgress > 0 ? t.continueLesson : t.start}
                    </div>
                  )}

                  {isLockedHint && (
                    <div
                      className="absolute bg-[#1a1a2e] border border-white/10 text-white/80 text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap z-10"
                      style={{ left: CENTER + node.x, top: bubbleTop, transform: 'translateX(-50%)' }}
                    >
                      {lockedHintText(node.skill)}
                    </div>
                  )}

                  <button
                    ref={node.status === 'current' ? currentNodeRef : undefined}
                    onClick={() => handleNodeTap(node.skill, node.status, node.href)}
                    aria-label={node.status === 'locked' ? `${node.skill.title} — ${t.locked}` : node.skill.title}
                    className={cn(
                      'absolute flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F77DD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]',
                      node.status === 'locked'
                        ? 'cursor-default opacity-50'
                        : 'cursor-pointer active:scale-90 transition-transform',
                      node.status === 'current' && 'motion-safe:animate-[pulseGlow_2.2s_ease-in-out_infinite]',
                    )}
                    style={{
                      left: CENTER + node.x - node.size / 2,
                      top: node.y - node.size / 2,
                      width: node.size,
                      height: node.size,
                      background: bgColorFor(node.status),
                      border: node.status === 'current' ? '3px solid #7F77DD' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {iconFor(node)}
                    {burstingId === node.skill.id && Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i / 8) * Math.PI * 2
                      const dx = Math.cos(angle) * 36
                      const dy = Math.sin(angle) * 36
                      return (
                        <span
                          key={i}
                          className="path-particle"
                          style={{
                            '--dx': `${dx}px`,
                            '--dy': `${dy}px`,
                            background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                          } as CSSProperties}
                        />
                      )
                    })}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}