'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

/* ─── i18n ─────────────────────────────────────────────────────────── */
const UI: Record<string, Record<string, string>> = {
  en: { unit: 'Unit', start: 'START', mastered: 'Mastered', xp: 'XP', reward: 'Unit Reward', lessons: 'lessons' },
  ar: { unit: 'الوحدة', start: 'ابدأ', mastered: 'أتقنت', xp: 'XP', reward: 'مكافأة', lessons: 'دروس' },
  fr: { unit: 'Unité', start: 'COMMENCER', mastered: 'Maîtrisé', xp: 'XP', reward: 'Récompense', lessons: 'leçons' },
}

/* ─── Palette ──────────────────────────────────────────────────────────
   Brand: #1CB0F6 (Duo blue), #14D4F4 (cyan), #2B70C9 (deep blue),
          #FAA918 (gold), #D33131 (red), #F5F5F5 (paper), #6F6F6F (muted)
   Dark surfaces tuned to sit under those accents.
*/
const C = {
  bg:       '#0B1220',
  surface:  '#111A2E',
  surface2: '#0E1726',
  line:     '#1B2A44',
  ink:      '#F5F5F5',
  muted:    '#6F6F6F',
  blue:     '#1CB0F6',
  cyan:     '#14D4F4',
  deep:     '#2B70C9',
  gold:     '#FAA918',
  red:      '#D33131',
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
const SVG_W     = 340
const VG        = 148
const AMP       = 88
const BUBBLE_R  = 38
const UNIT_SIZE = 4

function getCx(i: number): number {
  const pat = [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7]
  return SVG_W / 2 + pat[i % pat.length] * AMP
}
function getCy(i: number): number {
  return i * VG + 70
}
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
  const [activeTrack, setActiveTrack] = useState<string>(tracks[0]?.id ?? '')

  const lang  = (language || 'en') as Language
  const t     = UI[lang]
  const isRtl = lang === 'ar'

  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  const trackSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrack).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrack],
  )

  const units = useMemo(() => {
    const result: Skill[][] = []
    for (let i = 0; i < trackSkills.length; i += UNIT_SIZE) result.push(trackSkills.slice(i, i + UNIT_SIZE))
    return result
  }, [trackSkills])

  const isUnlocked = (skill: Skill) => skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)
  const isComplete = (id: string)   => (progressMap[id] ?? 0) >= 100

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full pb-24"
      style={{
        fontFamily: "'Nunito', system-ui, sans-serif",
        background: `radial-gradient(1200px 600px at 50% -200px, ${C.deep}22, transparent 60%), ${C.bg}`,
        color: C.ink,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
        @keyframes duoBob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes duoPulse { 0%,100%{box-shadow:0 8px 0 #0B3A5C, 0 0 0 0 ${C.blue}55}
                              50%   {box-shadow:0 8px 0 #0B3A5C, 0 0 0 18px ${C.blue}00} }
        @keyframes duoDash  { to { stroke-dashoffset: -32 } }
        .duo-bob   { animation: duoBob 2.4s ease-in-out infinite; }
        .duo-pulse { animation: duoPulse 1.8s ease-out infinite; }
        .duo-dash  { animation: duoDash 1.2s linear infinite; }
      `}</style>

      {/* ── TRACK SELECTOR (sticky banner like Duo's section header) ── */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: `${C.bg}cc`, borderBottom: `1px solid ${C.line}` }}
      >
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
          {tracks.map(track => {
            const active = activeTrack === track.id
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold uppercase tracking-wide transition-transform active:translate-y-[2px]"
                style={{
                  background: active ? C.blue : C.surface,
                  color: active ? '#fff' : C.ink,
                  border: `2px solid ${active ? C.cyan : C.line}`,
                  boxShadow: active
                    ? `0 4px 0 ${C.deep}`
                    : `0 4px 0 ${C.surface2}`,
                }}
              >
                <span className="text-base">{track.emoji}</span>
                {track.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── UNIT SECTIONS ── */}
      <div className="mx-auto max-w-md px-4 pt-6">
        {units.map((unitSkills, unitIdx) => {
          const unitBase = unitIdx * UNIT_SIZE
          const pts = unitSkills.map((_, i) => ({ x: getCx(unitBase + i), y: getCy(i) }))
          const fullPath = bezierPath(pts)

          const progPts = unitSkills
            .map((s, i) => ({ s, i }))
            .filter(({ s }) => isComplete(s.id) || (isUnlocked(s) && !isComplete(s.id)))
            .map(({ i }) => pts[i])
          const progPath = bezierPath(progPts)

          const svgH = unitSkills.length * VG + 80

          // alternate unit banner colors
          const bannerColors = [C.blue, C.gold, C.red, C.deep]
          const banner = bannerColors[unitIdx % bannerColors.length]

          return (
            <section key={unitIdx} className="mb-12">
              {/* Unit Banner */}
              <div
                className="relative mb-4 flex items-center justify-between overflow-hidden rounded-2xl px-5 py-4"
                style={{
                  background: banner,
                  boxShadow: `0 6px 0 ${C.surface2}, inset 0 -3px 0 rgba(0,0,0,.15)`,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'rgba(255,255,255,.35)' }} />
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                    {t.unit} {unitIdx + 1}
                  </div>
                  <div className="mt-0.5 text-lg font-black leading-tight text-white">
                    {unitSkills[0].title} Foundations
                  </div>
                </div>
                <div className="text-4xl drop-shadow-[0_3px_0_rgba(0,0,0,.25)]">
                  {unitSkills[0].emoji}
                </div>
              </div>

              {/* Snake Map */}
              <div className="relative" style={{ height: svgH }}>
                <svg
                  viewBox={`0 0 ${SVG_W} ${svgH}`}
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMin meet"
                >
                  {/* base dashed track */}
                  <path
                    d={fullPath}
                    stroke={C.line}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="2 18"
                  />
                  {/* progress path */}
                  {progPath && (
                    <>
                      <path
                        d={progPath}
                        stroke={C.deep}
                        strokeWidth={10}
                        fill="none"
                        strokeLinecap="round"
                        opacity={0.55}
                      />
                      <path
                        d={progPath}
                        stroke={C.cyan}
                        strokeWidth={4}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="14 18"
                        className="duo-dash"
                      />
                    </>
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

                  const circ   = 2 * Math.PI * BUBBLE_R
                  const offset = circ - (circ * prog) / 100
                  const icon   = complete ? '⭐' : unlocked ? skill.emoji : '🔒'

                  // Duo-style chunky bubble (face color + dark "ground" shadow)
                  const face   = complete ? C.gold : isActive ? C.blue : unlocked ? C.deep : C.surface
                  const ring   = complete ? '#C77A00' : isActive ? '#0B3A5C' : unlocked ? '#163E70' : C.line
                  const glow   = complete ? `${C.gold}55` : isActive ? `${C.blue}55` : 'transparent'

                  return (
                    <div
                      key={skill.id}
                      className="group absolute -translate-x-1/2"
                      style={{ left: `${leftPct}%`, top: topPx - BUBBLE_R }}
                    >
                      {/* START pill */}
                      {isActive && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 duo-bob">
                          <div
                            className="relative rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-widest"
                            style={{
                              background: C.ink,
                              color: C.blue,
                              boxShadow: `0 3px 0 ${C.muted}`,
                            }}
                          >
                            {t.start}
                            <div
                              className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
                              style={{
                                borderLeft: '7px solid transparent',
                                borderRight: '7px solid transparent',
                                borderTop: `7px solid ${C.ink}`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        disabled={!unlocked}
                        className={cn(
                          'relative flex h-[78px] w-[78px] items-center justify-center rounded-full text-[32px] select-none transition-transform',
                          unlocked ? 'hover:-translate-y-[2px] active:translate-y-[3px]' : 'cursor-default opacity-70',
                          isActive && 'duo-pulse',
                        )}
                        style={{
                          background: face,
                          border: `3px solid ${ring}`,
                          boxShadow: `0 8px 0 ${ring}, 0 0 30px ${glow}`,
                          color: complete ? '#3a1d00' : '#fff',
                        }}
                        onClick={() => unlocked && (window.location.href = `/lesson/${skill.id}`)}
                      >
                        {/* glossy sheen */}
                        <span
                          className="pointer-events-none absolute left-2 right-2 top-2 h-3 rounded-full"
                          style={{ background: 'rgba(255,255,255,.28)', filter: 'blur(1px)' }}
                        />

                        {/* progress ring */}
                        {prog > 0 && prog < 100 && (
                          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 84 84">
                            <circle cx="42" cy="42" r={BUBBLE_R} stroke="rgba(0,0,0,.25)" strokeWidth="5" fill="none" />
                            <circle
                              cx="42" cy="42" r={BUBBLE_R}
                              stroke={C.cyan} strokeWidth="5" fill="none"
                              strokeLinecap="round"
                              strokeDasharray={circ}
                              strokeDashoffset={offset}
                            />
                          </svg>
                        )}

                        <span className="relative drop-shadow-[0_2px_0_rgba(0,0,0,.25)]">{icon}</span>
                      </button>

                      {/* label */}
                      <div
                        className="mt-2 text-center text-[11px] font-extrabold uppercase tracking-wider"
                        style={{ color: unlocked ? C.ink : C.muted }}
                      >
                        {skill.title}
                      </div>

                      {complete && (
                        <div
                          className="mx-auto mt-1 w-fit rounded-full px-2 py-[2px] text-[9px] font-black uppercase tracking-widest"
                          style={{ background: C.gold, color: '#3a1d00' }}
                        >
                          {t.mastered}
                        </div>
                      )}

                      {/* hover card */}
                      {unlocked && (
                        <div
                          className={cn(
                            'pointer-events-none absolute top-1/2 hidden w-56 -translate-y-1/2 rounded-2xl p-3 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 md:block',
                            getCx(absIdx) > SVG_W / 2 ? 'right-[115%]' : 'left-[115%]',
                          )}
                          style={{ background: C.surface, border: `2px solid ${C.line}`, color: C.ink }}
                        >
                          <div className="text-sm font-black">{skill.title}</div>
                          <div className="mt-1 text-xs" style={{ color: C.muted }}>{skill.description}</div>
                          <div className="mt-2 flex items-center justify-between text-[11px] font-extrabold">
                            <span style={{ color: C.gold }}>+{skill.xp_reward} {t.xp}</span>
                            <span style={{ color: C.cyan }}>{lessonCountMap[skill.id] ?? 0} {t.lessons}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Unit reward chest */}
              <div className="mt-4 flex flex-col items-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{
                    background: C.gold,
                    border: `3px solid #C77A00`,
                    boxShadow: `0 6px 0 #8a5400, 0 0 30px ${C.gold}55`,
                  }}
                >
                  🎁
                </div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-widest" style={{ color: C.gold }}>
                  {t.reward}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* ── QUICK-JUMP SIDEBAR ── */}
      <aside
        className={cn(
          'fixed top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 rounded-2xl p-3 lg:flex',
          isRtl ? 'left-4' : 'right-4',
        )}
        style={{ background: `${C.surface}dd`, border: `1px solid ${C.line}` }}
      >
        {units.map((unitSkills, i) => {
          const anyUnlocked = unitSkills.some(s => isUnlocked(s))
          const dotColors = [C.blue, C.gold, C.red, C.deep]
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background: anyUnlocked ? dotColors[i % dotColors.length] : C.line,
                  boxShadow: anyUnlocked ? `0 0 10px ${dotColors[i % dotColors.length]}` : 'none',
                }}
              />
              <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: C.ink }}>
                {t.unit} {i + 1}
              </span>
            </div>
          )
        })}
      </aside>
    </div>
  )
}
