'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: { unit: 'Unit', start: 'START', locked: 'LOCKED', complete: 'MASTERED', xp: 'XP', jump: 'Jump to', reward: 'Unit Reward' },
  ar: { unit: 'الوحدة', start: 'ابدأ', locked: 'مقفل', complete: 'أتقنت', xp: 'XP', jump: 'انتقل إلى', reward: 'مكافأة الوحدة' },
  fr: { unit: 'Unité', start: 'COMMENCER', locked: 'VERROUILLÉ', complete: 'MAÎTRISÉ', xp: 'XP', jump: 'Aller à', reward: 'Récompense' },
}

interface Track { id: string; name: string; emoji: string; color: string }
interface Skill  { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg { skill_node_id: string; progress_pct: number; completed_at: string | null }

interface Props {
  userId:         string
  tracks:         Track[]
  skills:         Skill[]
  skillProgress:  SkillProg[]
  lessonCountMap: Record<string, number>
  language:       string
}

// Snake path X positions — 8-step repeating wave
const AMPLITUDE   = 90   // px left/right of center
const VERT_GAP    = 140  // px between each bubble vertically
const SVG_WIDTH   = 320  // internal SVG coordinate width
const BUBBLE_R    = 40   // bubble radius
const UNIT_SIZE   = 4    // skills per unit

function getXOffset(i: number): number {
  const pattern = [0, 0.75, 1, 0.75, 0, -0.75, -1, -0.75]
  return pattern[i % pattern.length] * AMPLITUDE
}

function getCx(i: number): number {
  return SVG_WIDTH / 2 + getXOffset(i)
}

function getCy(i: number): number {
  return i * VERT_GAP + 60
}

// Build a smooth cubic-bezier snake SVG path through all points
function buildPath(indices: number[]): string {
  if (indices.length < 2) return ''
  let d = `M ${getCx(indices[0])} ${getCy(indices[0])}`
  for (let k = 0; k < indices.length - 1; k++) {
    const i    = indices[k]
    const j    = indices[k + 1]
    const midY = (getCy(i) + getCy(j)) / 2
    d += ` C ${getCx(i)} ${midY}, ${getCx(j)} ${midY}, ${getCx(j)} ${getCy(j)}`
  }
  return d
}

export default function SkillsClient({
  userId, tracks, skills, skillProgress, lessonCountMap, language,
}: Props) {
  const [activeTrack, setActiveTrack] = useState(tracks[0]?.id ?? '')

  const lang = (language || 'en') as Language
  const t    = UI[lang]
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'
  const isRtl = dir === 'rtl'

  // progress lookup
  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress]
  )

  const trackSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrack).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrack]
  )

  const units = useMemo(() => {
    const result: Skill[][] = []
    for (let i = 0; i < trackSkills.length; i += UNIT_SIZE) {
      result.push(trackSkills.slice(i, i + UNIT_SIZE))
    }
    return result
  }, [trackSkills])

  const isUnlocked = (skill: Skill) =>
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)

  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  // SVG height to hold all bubbles
  const svgHeight = trackSkills.length * VERT_GAP + 100

  // Full dotted track path (all bubbles)
  const allIndices  = trackSkills.map((_, i) => i)
  const fullPath    = buildPath(allIndices)

  // Green progress path: all complete bubbles + the current active one
  const activeIdx = trackSkills.findIndex(s => isUnlocked(s) && !isComplete(s.id))
  const completedIndices = trackSkills
    .map((_, i) => i)
    .filter(i => isComplete(trackSkills[i].id))

  let progressIndices: number[] = [...completedIndices]
  if (activeIdx !== -1 && !progressIndices.includes(activeIdx)) {
    progressIndices = [...progressIndices, activeIdx].sort((a, b) => a - b)
  }
  const progressPath = buildPath(progressIndices)

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#111]" dir={dir}>

      {/* ── TRACK SELECTOR ── */}
      <div className="sticky top-0 z-50 bg-[#f7f7f7]/90 dark:bg-[#111]/90 backdrop-blur border-b border-black/5 dark:border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex gap-2 justify-center flex-wrap">
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border-b-[3px]',
                activeTrack === track.id
                  ? 'bg-[#58CC02] border-[#46A302] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1e1e1e] border-black/10 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
              )}
            >
              <span className="text-lg">{track.emoji}</span>
              <span className="hidden sm:inline">{track.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN MAP ── */}
      <div className="max-w-lg mx-auto px-4 pb-32 pt-6">
        {units.map((unitSkills, unitIdx) => {
          const unitStartAbsoluteIdx = unitIdx * UNIT_SIZE

          return (
            <div key={unitIdx}>

              {/* Unit Banner */}
              <div className="mb-4 px-2">
                <div className="rounded-2xl bg-white dark:bg-[#1e1e1e] border border-black/8 dark:border-white/8 shadow-sm px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#58CC02] uppercase tracking-widest mb-0.5">
                      {t.unit} {unitIdx + 1}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      {unitSkills[0].title}
                    </h2>
                  </div>
                  <div className="text-3xl">{unitSkills[0].emoji}</div>
                </div>
              </div>

              {/* Snake Map for this unit */}
              <div className="relative" style={{ minHeight: unitSkills.length * VERT_GAP + 80 }}>

                {/* SVG path */}
                <svg
                  viewBox={`0 0 ${SVG_WIDTH} ${unitSkills.length * VERT_GAP + 80}`}
                  className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Dotted gray base track */}
                  <path
                    d={buildPath(unitSkills.map((_, i) => unitStartAbsoluteIdx + i))}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="1 20"
                  />

                  {/* Green progress overlay */}
                  {(() => {
                    const unitProgressIndices = unitSkills
                      .map((s, i) => ({ s, i: unitStartAbsoluteIdx + i }))
                      .filter(({ s }) => isComplete(s.id) || (isUnlocked(s) && !isComplete(s.id)))
                      .map(({ i }) => i)

                    if (unitProgressIndices.length < 2) return null
                    return (
                      <path
                        d={buildPath(unitProgressIndices)}
                        fill="none"
                        stroke="#58CC02"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                    )
                  })()}
                </svg>

                {/* Skill Bubbles */}
                {unitSkills.map((skill, skillIdx) => {
                  const absIdx    = unitStartAbsoluteIdx + skillIdx
                  const unlocked  = isUnlocked(skill)
                  const complete  = isComplete(skill.id)
                  const isActive  = unlocked && !complete
                  const prog      = progressMap[skill.id] ?? 0

                  // Position as % of SVG width
                  const cx = getCx(absIdx)
                  const leftPct = (cx / SVG_WIDTH) * 100

                  // Vertical position
                  const topPx = skillIdx * VERT_GAP + 60

                  // Progress ring math
                  const ringR    = BUBBLE_R + 6
                  const ringCirc = 2 * Math.PI * ringR
                  const ringOffset = ringCirc - (ringCirc * prog) / 100

                  const href = unlocked ? `/dashboard/skills/${skill.id}` : '#'

                  return (
                    <div
                      key={skill.id}
                      className="absolute"
                      style={{
                        left: `${leftPct}%`,
                        top: topPx,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="relative flex flex-col items-center group">

                        {/* Active pulse halo */}
                        {isActive && (
                          <span className="absolute inset-[-16px] rounded-full bg-[#58CC02]/20 animate-ping" />
                        )}

                        {/* START tooltip */}
                        {isActive && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1e1e1e] border border-black/10 dark:border-white/10 shadow-md text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest whitespace-nowrap">
                            {t.start}
                            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#1e1e1e] border-r border-b border-black/10 dark:border-white/10 rotate-45 block" />
                          </div>
                        )}

                        {/* Bubble */}
                        <Link
                          href={href}
                          aria-label={`${skill.title}${!unlocked ? ' — locked' : complete ? ' — mastered' : ''}`}
                          className={cn(
                            'relative flex items-center justify-center rounded-full text-4xl transition-all duration-200 select-none outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
                            'w-20 h-20',
                            complete
                              ? 'bg-[#FFC800] border-b-[5px] border-[#D4A200] hover:-translate-y-1 focus-visible:ring-[#FFC800]'
                              : unlocked
                              ? 'bg-[#58CC02] border-b-[5px] border-[#46A302] hover:-translate-y-1 active:translate-y-0 active:border-b-0 focus-visible:ring-[#58CC02]'
                              : 'bg-gray-200 dark:bg-[#2a2a2a] border-b-[5px] border-gray-300 dark:border-[#1a1a1a] grayscale opacity-60 pointer-events-none'
                          )}
                        >
                          {/* Sheen */}
                          <span className="absolute top-2 left-3 right-3 h-1/3 rounded-full bg-white/20 pointer-events-none" />

                          {/* Progress ring */}
                          {prog > 0 && prog < 100 && (
                            <svg
                              className="absolute pointer-events-none"
                              style={{ inset: -10, width: 'calc(100% + 20px)', height: 'calc(100% + 20px)' }}
                              viewBox="0 0 100 100"
                            >
                              <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="5" />
                              <circle
                                cx="50" cy="50" r="46"
                                fill="none"
                                stroke="white"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 46}`}
                                strokeDashoffset={`${2 * Math.PI * 46 * (1 - prog / 100)}`}
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                          )}

                          {/* Icon */}
                          <span className="relative z-10 drop-shadow">
                            {complete ? '⭐' : unlocked ? skill.emoji : '🔒'}
                          </span>
                        </Link>

                        {/* Label */}
                        <div className="mt-3 text-center">
                          <p className={cn(
                            'text-[13px] font-bold leading-tight',
                            unlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                          )}>
                            {skill.title}
                          </p>
                          {complete && (
                            <p className="text-[10px] font-black text-[#FFC800] tracking-widest uppercase mt-0.5">
                              {t.complete}
                            </p>
                          )}
                        </div>

                        {/* Hover card (desktop) */}
                        {unlocked && (
                          <div className={cn(
                            'absolute top-1/2 -translate-y-1/2 w-56 z-50',
                            'opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200',
                            'bg-white dark:bg-[#1e1e1e] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-4 hidden lg:block',
                            isRtl
                              ? (getXOffset(absIdx) < 0 ? 'right-[110%]' : 'left-[110%]')
                              : (getXOffset(absIdx) > 0 ? 'right-[110%]' : 'left-[110%]')
                          )}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{skill.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{skill.description}</p>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-t border-black/5 dark:border-white/5 pt-3">
                              <span className="text-[#FFC800]">+{skill.xp_reward} {t.xp}</span>
                              <span className="text-gray-400">{lessonCountMap[skill.id] ?? 0} lessons</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Unit reward chest */}
              <div className="flex flex-col items-center py-8 opacity-40 hover:opacity-90 transition-opacity cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1e1e1e] border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🎁
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{t.reward}</p>
              </div>

            </div>
          )
        })}
      </div>

      {/* ── UNIT QUICK-JUMP ── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
        {units.map((unitSkills, i) => {
          const anyUnlocked = unitSkills.some(s => isUnlocked(s))
          return (
            <div key={i} className="group relative flex items-center justify-end gap-2">
              <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest whitespace-nowrap bg-white dark:bg-[#1e1e1e] px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 shadow">
                {t.unit} {i + 1}
              </span>
              <div className={cn(
                'w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-white/20 transition-all duration-200 group-hover:scale-125',
                anyUnlocked ? 'bg-[#58CC02]' : 'bg-gray-200 dark:bg-[#333]'
              )} />
            </div>
          )
        })}
      </div>
    </div>
  )
}