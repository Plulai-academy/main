'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

/* ─── i18n ─────────────────────────────────────────────────────────── */
const UI: Record<Language, Record<string, string>> = {
  en: { unit: 'Unit', start: 'START', mastered: 'Mastered', xp: 'XP', reward: 'Unit Reward', lessons: 'lessons' },
  ar: { unit: 'الوحدة', start: 'ابدأ', mastered: 'أتقنت', xp: 'XP', reward: 'مكافأة', lessons: 'دروس' },
  fr: { unit: 'Unité', start: 'COMMENCER', mastered: 'Maîtrisé', xp: 'XP', reward: 'Récompense', lessons: 'leçons' },
}

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Track     { id: string; name: string; emoji: string; color: string }
interface Skill     { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg { skill_node_id: string; progress_pct: number; completed_at: string | null }

interface Props {
  userId:         string
  tracks:         Track[]
  skills:         Skill[]
  skillProgress:  SkillProg[]
  lessonCountMap: Record<string, number>
  language:       string
}

/* ─── Snake-path geometry ───────────────────────────────────────────── */
const SVG_W     = 340   // internal SVG coordinate width
const VG        = 148   // vertical gap between bubble centres (px in SVG units)
const AMP       = 82    // left-right amplitude
const BUBBLE_R  = 38    // bubble radius for progress ring
const UNIT_SIZE = 4     // skills per unit section

/** Centre-X for bubble at absolute index i */
function getCx(i: number): number {
  const pat = [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7]
  return SVG_W / 2 + pat[i % pat.length] * AMP
}

/** Centre-Y for bubble at local (within-unit) index i */
function getCy(i: number): number {
  return i * VG + 60
}

/** Smooth cubic-bezier path through a list of {x, y} points */
function bezierPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let k = 0; k < pts.length - 1; k++) {
    const my = (pts[k].y + pts[k + 1].y) / 2
    d += ` C${pts[k].x} ${my},${pts[k + 1].x} ${my},${pts[k + 1].x} ${pts[k + 1].y}`
  }
  return d
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function SkillsClient({
  userId, tracks, skills, skillProgress, lessonCountMap, language,
}: Props) {
  const [activeTrack, setActiveTrack] = useState(tracks[0]?.id ?? '')

  const lang  = (language || 'en') as Language
  const t     = UI[lang]
  const isRtl = lang === 'ar'

  /* progress lookup */
  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  /* skills for the active track, sorted */
  const trackSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrack).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrack],
  )

  /* group into units */
  const units = useMemo(() => {
    const result: Skill[][] = []
    for (let i = 0; i < trackSkills.length; i += UNIT_SIZE) result.push(trackSkills.slice(i, i + UNIT_SIZE))
    return result
  }, [trackSkills])

  const isUnlocked = (skill: Skill) => skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)
  const isComplete = (id: string)   => (progressMap[id] ?? 0) >= 100

  return (
    <div
      className="min-h-screen bg-[#09090f] pb-28"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* ── Google Font ── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');`}</style>

      {/* ── TRACK SELECTOR ── */}
      <div className="sticky top-0 z-50 bg-[#09090f]/90 backdrop-blur border-b border-white/5">
        <div className="flex gap-2.5 justify-center flex-wrap px-4 py-3">
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-extrabold transition-all duration-200',
                'border border-[#1e1e35] bg-[#111120]',
                activeTrack === track.id
                  ? 'bg-[#1e1b4b] border-[#6366f1] text-[#a5b4fc] shadow-[0_0_20px_#6366f130]'
                  : 'text-[#4a5568] hover:border-[#4338ca] hover:text-[#a5b4fc]',
              )}
            >
              <span className="text-lg">{track.emoji}</span>
              <span className="hidden sm:inline">{track.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── UNIT SECTIONS ── */}
      <div className="max-w-[420px] mx-auto px-4 pt-6">
        {units.map((unitSkills, unitIdx) => {
          const unitBase = unitIdx * UNIT_SIZE

          /* geometry points for this unit (local Y, absolute X) */
          const pts = unitSkills.map((_, i) => ({ x: getCx(unitBase + i), y: getCy(i) }))

          /* full dashed track */
          const fullPath = bezierPath(pts)

          /* green progress path */
          const progPts = unitSkills
            .map((s, i) => ({ s, i }))
            .filter(({ s }) => isComplete(s.id) || (isUnlocked(s) && !isComplete(s.id)))
            .map(({ i }) => pts[i])
          const progPath = bezierPath(progPts)

          const svgH = unitSkills.length * VG + 60

          return (
            <div key={unitIdx}>

              {/* Unit Banner */}
              <div className="relative flex items-center justify-between bg-[#111120] border border-[#1e1e35] rounded-2xl px-5 py-4 mb-8 overflow-hidden">
                {/* top accent line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#818cf8] to-transparent" />
                <div>
                  <p className="text-[10px] font-black text-[#818cf8] tracking-[.2em] uppercase mb-1">
                    {t.unit} {unitIdx + 1}
                  </p>
                  <h2 className="text-[17px] font-extrabold text-white leading-tight">
                    {unitSkills[0].title} Foundations
                  </h2>
                </div>
                <span className="text-3xl">{unitSkills[0].emoji}</span>
              </div>

              {/* Snake Map */}
              <div className="relative" style={{ height: svgH + 60 }}>

                {/* SVG path layer */}
                <svg
                  viewBox={`0 0 ${SVG_W} ${svgH}`}
                  className="absolute inset-0 w-full overflow-visible pointer-events-none"
                  style={{ height: svgH }}
                  preserveAspectRatio="xMidYMin meet"
                >
                  {/* base track – dark solid + dashed overlay */}
                  <path d={fullPath} fill="none" stroke="#1e1e35" strokeWidth="12" strokeLinecap="round" />
                  <path d={fullPath} fill="none" stroke="#1e1e35" strokeWidth="3"  strokeLinecap="round" strokeDasharray="2 18" />
                  {/* progress glow */}
                  {progPath && (
                    <path d={progPath} fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
                  )}
                </svg>

                {/* Bubble nodes */}
                {unitSkills.map((skill, skillIdx) => {
                  const absIdx   = unitBase + skillIdx
                  const unlocked = isUnlocked(skill)
                  const complete = isComplete(skill.id)
                  const isActive = unlocked && !complete
                  const prog     = progressMap[skill.id] ?? 0

                  const leftPct  = (getCx(absIdx) / SVG_W) * 100
                  const topPx    = getCy(skillIdx)

                  const circ     = 2 * Math.PI * BUBBLE_R
                  const offset   = circ - (circ * prog) / 100

                  const icon = complete ? '⭐' : unlocked ? skill.emoji : '🔒'

                  const bubbleCls = cn(
                    'relative flex items-center justify-center w-[76px] h-[76px] rounded-full text-[30px]',
                    'border-none cursor-pointer transition-transform duration-150 outline-none select-none',
                    'hover:scale-110 active:scale-95',
                    complete
                      ? 'bg-[#78350f] border-2 border-[#f59e0b] shadow-[0_7px_0_#451a03,0_0_30px_#fbbf2430]'
                      : isActive
                      ? 'bg-[#1e3a5f] border-2 border-[#38bdf8] shadow-[0_7px_0_#1e3a5f,0_0_40px_#38bdf840] animate-pulse'
                      : unlocked
                      ? 'bg-[#166534] border-2 border-[#22c55e] shadow-[0_7px_0_#14532d,0_0_30px_#4ade8020]'
                      : 'bg-[#1e1e2e] border-2 border-[#2d2d45] shadow-[0_5px_0_#0d0d1a] opacity-60 cursor-default',
                  )

                  return (
                    <div
                      key={skill.id}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${leftPct}%`, top: topPx, transform: 'translate(-50%, -50%)' }}
                    >
                      {/* START pill */}
                      {isActive && (
                        <div
                          className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest"
                          style={{ background: '#38bdf8', color: '#0c1a24', boxShadow: '0 4px 14px #38bdf840' }}
                        >
                          {t.start}
                          <span
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                            style={{ background: '#38bdf8' }}
                          />
                        </div>
                      )}

                      <Link
                        href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                        className={bubbleCls}
                        aria-label={`${skill.title}${!unlocked ? ' — locked' : complete ? ' — mastered' : ''}`}
                        tabIndex={unlocked ? 0 : -1}
                      >
                        {/* sheen */}
                        <span
                          className="absolute top-2 left-2.5 right-2.5 rounded-full pointer-events-none"
                          style={{ height: '35%', background: 'rgba(255,255,255,.12)' }}
                        />

                        {/* progress ring */}
                        {prog > 0 && prog < 100 && (
                          <svg
                            className="absolute pointer-events-none"
                            style={{ inset: -10, width: 'calc(100% + 20px)', height: 'calc(100% + 20px)' }}
                            viewBox="0 0 96 96"
                          >
                            <circle cx="48" cy="48" r={BUBBLE_R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="5" />
                            <circle
                              cx="48" cy="48" r={BUBBLE_R}
                              fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={circ.toFixed(1)}
                              strokeDashoffset={offset.toFixed(1)}
                              transform="rotate(-90 48 48)"
                              opacity="0.7"
                            />
                          </svg>
                        )}

                        <span className="relative z-10">{icon}</span>
                      </Link>

                      {/* label */}
                      <p className={cn('mt-3 text-[13px] font-extrabold text-center whitespace-nowrap', unlocked ? 'text-[#e2e8f0]' : 'text-[#4a5568]')}>
                        {skill.title}
                      </p>
                      {complete && (
                        <p className="text-[9px] font-black text-[#fbbf24] tracking-[.18em] uppercase mt-0.5">
                          {t.mastered}
                        </p>
                      )}

                      {/* desktop hover card */}
                      {unlocked && (
                        <div className={cn(
                          'absolute top-1/2 -translate-y-1/2 w-52 z-50 pointer-events-none',
                          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                          'bg-[#111120] border border-[#1e1e35] rounded-2xl p-4 shadow-2xl hidden lg:block',
                          getCx(absIdx) > SVG_W / 2 ? 'right-[115%]' : 'left-[115%]',
                        )}>
                          <p className="text-sm font-extrabold text-white mb-1">{skill.title}</p>
                          <p className="text-xs text-[#6b7280] leading-relaxed mb-3">{skill.description}</p>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-t border-[#1e1e35] pt-3">
                            <span className="text-[#fbbf24]">+{skill.xp_reward} {t.xp}</span>
                            <span className="text-[#4a5568]">{lessonCountMap[skill.id] ?? 0} {t.lessons}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Unit reward chest */}
              {/* <div className="flex flex-col items-center py-8 opacity-35 hover:opacity-90 transition-opacity cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-[#111120] border-2 border-dashed border-[#1e1e35] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🎁
                </div>
                <p className="mt-2 text-[9px] font-black text-[#4a5568] tracking-[.15em] uppercase">{t.reward}</p>
              </div> */}

            </div>
          )
        })}
      </div>

      {/* ── QUICK-JUMP SIDEBAR ── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
        {units.map((unitSkills, i) => {
          const anyUnlocked = unitSkills.some(s => isUnlocked(s))
          return (
            <div key={i} className="group relative flex items-center justify-end gap-2">
              <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap text-[10px] font-black text-[#818cf8] tracking-widest uppercase bg-[#111120] border border-[#1e1e35] px-3 py-1.5 rounded-lg shadow">
                {t.unit} {i + 1}
              </span>
              <div className={cn(
                'w-2.5 h-2.5 rounded-full border transition-all duration-200 group-hover:scale-125',
                anyUnlocked ? 'bg-[#22c55e] border-[#166534]' : 'bg-[#1e1e2e] border-[#2d2d45]',
              )} />
            </div>
          )
        })}
      </div>
    </div>
  )
}