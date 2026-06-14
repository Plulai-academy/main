'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

/* ─── i18n ─────────────────────────────────────────────────────────── */
const UI: Record<string, Record<string, string>> = {
  en: { unit: 'Unit', start: "LET'S GO!", mastered: 'Mastered!', xp: 'XP', reward: 'Treasure!', lessons: 'lessons' },
  ar: { unit: 'الوحدة', start: 'هيا بنا!', mastered: 'أتقنت!', xp: 'XP', reward: 'كنز!', lessons: 'دروس' },
  fr: { unit: 'Unité', start: 'C\u2019EST PARTI!', mastered: 'Réussi!', xp: 'XP', reward: 'Trésor!', lessons: 'leçons' },
}

/* ─── Kid palette (your colors) ────────────────────────────────────── */
const C = {
  bg:        '#0E1A33',
  bg2:       '#152347',
  surface:   '#1B2A55',
  line:      '#2A3A6E',
  ink:       '#F5F5F5',
  muted:     '#A9B4D1',
  blue:      '#1CB0F6',
  cyan:      '#14D4F4',
  deep:      '#2B70C9',
  gold:      '#FAA918',
  red:       '#D33131',
  paper:     '#F5F5F5',
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

/* ─── Geometry ─────────────────────────────────────────────────────── */
const SVG_W     = 360
const VG        = 160
const AMP       = 95
const BUBBLE_R  = 44
const UNIT_SIZE = 4

const getCx = (i: number) => {
  const pat = [0, 0.75, 1, 0.75, 0, -0.75, -1, -0.75]
  return SVG_W / 2 + pat[i % pat.length] * AMP
}
const getCy = (i: number) => i * VG + 80

function bezierPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let k = 0; k < pts.length - 1; k++) {
    const my = (pts[k].y + pts[k + 1].y) / 2
    d += ` C${pts[k].x} ${my},${pts[k + 1].x} ${my},${pts[k + 1].x} ${pts[k + 1].y}`
  }
  return d
}

/* deterministic "random" so SSR matches CSR */
const rand = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
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
    const r: Skill[][] = []
    for (let i = 0; i < trackSkills.length; i += UNIT_SIZE) r.push(trackSkills.slice(i, i + UNIT_SIZE))
    return r
  }, [trackSkills])

  const isUnlocked = (s: Skill) => s.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)
  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  // rotating themes per unit
  const themes = [
    { color: C.blue, mascot: '🐻', name: 'Bear Bay'      },
    { color: C.gold, mascot: '🦊', name: 'Fox Forest'    },
    { color: C.red,  mascot: '🐲', name: 'Dragon Den'    },
    { color: C.cyan, mascot: '🐬', name: 'Dolphin Cove'  },
    { color: C.deep, mascot: '🦉', name: 'Owl Outpost'   },
  ]

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full overflow-hidden pb-32"
      style={{
        fontFamily: "'Baloo 2','Nunito',system-ui,sans-serif",
        background: `radial-gradient(900px 500px at 50% -150px, ${C.deep}55, transparent 60%), linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`,
        color: C.ink,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap');
        @keyframes floatY    { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(2deg)} }
        @keyframes wiggle    { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        @keyframes bounceY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.18);opacity:0} }
        @keyframes twinkle   { 0%,100%{opacity:.25;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes drift     { 0%{transform:translateX(0)} 100%{transform:translateX(20px)} }
        .k-float   { animation: floatY 3.6s ease-in-out infinite; }
        .k-wiggle  { animation: wiggle 1.4s ease-in-out infinite; }
        .k-bounce  { animation: bounceY 1.6s ease-in-out infinite; }
        .k-twinkle { animation: twinkle 2.4s ease-in-out infinite; }
        .k-drift   { animation: drift 6s ease-in-out infinite alternate; }
        .k-pulse-ring::after{
          content:""; position:absolute; inset:-10px; border-radius:9999px;
          border:4px solid currentColor; animation: ringPulse 1.6s ease-out infinite;
        }
        .k-press:active{ transform: translateY(6px) !important; }
      `}</style>

      {/* floating background clouds & stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => {
          const top  = rand(i + 1) * 100
          const left = rand(i + 9) * 100
          const size = 10 + rand(i + 17) * 14
          const isStar = i % 3 === 0
          return (
            <div
              key={i}
              className={isStar ? 'k-twinkle absolute' : 'k-drift absolute'}
              style={{
                top: `${top}%`, left: `${left}%`,
                fontSize: size, color: isStar ? C.gold : '#ffffff22',
                animationDelay: `${rand(i + 33) * 4}s`,
              }}
            >
              {isStar ? '✦' : '☁'}
            </div>
          )
        })}
      </div>

      {/* ── TRACK SELECTOR ── */}
      <div
        className="sticky top-0 z-30 backdrop-blur"
        style={{ background: `${C.bg}cc`, borderBottom: `2px solid ${C.line}` }}
      >
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
          {tracks.map(track => {
            const active = activeTrack === track.id
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className="k-press flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide transition-transform"
                style={{
                  background: active ? C.blue : C.surface,
                  color: active ? '#fff' : C.ink,
                  border: `3px solid ${active ? C.cyan : C.line}`,
                  boxShadow: `0 5px 0 ${active ? C.deep : '#0c1730'}`,
                }}
              >
                <span className="text-lg">{track.emoji}</span>
                {track.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── UNITS ── */}
      <div className="relative mx-auto max-w-md px-4 pt-6">
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
          const theme = themes[unitIdx % themes.length]

          return (
            <section key={unitIdx} className="mb-14">
              {/* Unit Banner — cartoon sign */}
              <div
                className="relative mb-6 overflow-hidden rounded-[28px] px-6 py-5"
                style={{
                  background: `linear-gradient(135deg, ${theme.color}, ${theme.color}cc)`,
                  border: `4px solid #ffffff20`,
                  boxShadow: `0 8px 0 rgba(0,0,0,.25), inset 0 -6px 0 rgba(0,0,0,.18), inset 0 3px 0 rgba(255,255,255,.35)`,
                }}
              >
                {/* polka dots */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: `radial-gradient(#fff 2px, transparent 2px)`,
                    backgroundSize: '18px 18px',
                  }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">
                      {t.unit} {unitIdx + 1}
                    </div>
                    <div className="mt-0.5 text-2xl font-black leading-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,.2)]">
                      {theme.name}
                    </div>
                    <div className="mt-0.5 text-[12px] font-bold text-white/85">
                      {unitSkills[0].title}
                    </div>
                  </div>
                  <div className="k-float text-[56px] drop-shadow-[0_4px_0_rgba(0,0,0,.25)]">
                    {theme.mascot}
                  </div>
                </div>
              </div>

              {/* Snake map */}
              <div className="relative" style={{ height: svgH }}>
                {/* soft glow under path */}
                <svg
                  viewBox={`0 0 ${SVG_W} ${svgH}`}
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMin meet"
                >
                  <defs>
                    <linearGradient id={`pg-${unitIdx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor={C.cyan} />
                      <stop offset="100%" stopColor={C.blue} />
                    </linearGradient>
                  </defs>

                  {/* outer glow */}
                  <path d={fullPath} stroke={`${theme.color}33`} strokeWidth={24} fill="none" strokeLinecap="round" />
                  {/* dashed footprints */}
                  <path
                    d={fullPath}
                    stroke="#ffffff22"
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="2 22"
                  />
                  {progPath && (
                    <path
                      d={progPath}
                      stroke={`url(#pg-${unitIdx})`}
                      strokeWidth={8}
                      fill="none"
                      strokeLinecap="round"
                      opacity={0.9}
                    />
                  )}
                </svg>

                {/* scattered candy decorations */}
                {unitSkills.map((_, idx) => {
                  const x = getCx(unitBase + idx) + (rand(unitIdx * 7 + idx) - 0.5) * 160
                  const y = getCy(idx) + (rand(unitIdx * 11 + idx) - 0.5) * 60
                  const emojis = ['🍭', '🌟', '🍀', '🎈', '🍩', '🪁']
                  const e = emojis[(unitIdx + idx) % emojis.length]
                  return (
                    <div
                      key={`d-${idx}`}
                      className="k-float pointer-events-none absolute text-2xl opacity-70"
                      style={{
                        left: `${(x / SVG_W) * 100}%`,
                        top: y - 20,
                        animationDelay: `${rand(idx + 5) * 3}s`,
                      }}
                    >
                      {e}
                    </div>
                  )
                })}

                {/* Bubbles */}
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

                  const face = complete ? C.gold : isActive ? C.blue : unlocked ? C.deep : C.surface
                  const ring = complete ? '#B57600' : isActive ? '#0E5A8A' : unlocked ? '#163E70' : C.line
                  const text = complete ? '#3a1d00' : '#fff'

                  return (
                    <div
                      key={skill.id}
                      className="group absolute -translate-x-1/2"
                      style={{ left: `${leftPct}%`, top: topPx - BUBBLE_R - 4 }}
                    >
                      {/* START speech bubble */}
                      {isActive && (
                        <div className="k-bounce absolute -top-14 left-1/2 -translate-x-1/2">
                          <div
                            className="relative rounded-2xl px-3.5 py-2 text-[12px] font-black uppercase tracking-wider"
                            style={{
                              background: C.paper,
                              color: C.blue,
                              boxShadow: `0 4px 0 ${C.muted}, 0 0 0 3px #fff inset`,
                            }}
                          >
                            {t.start}
                            <div
                              className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
                              style={{
                                borderLeft: '9px solid transparent',
                                borderRight: '9px solid transparent',
                                borderTop: `9px solid ${C.paper}`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* ground shadow */}
                      <div
                        className="absolute left-1/2 top-[86px] h-3 w-20 -translate-x-1/2 rounded-full"
                        style={{ background: 'rgba(0,0,0,.35)', filter: 'blur(4px)' }}
                      />

                      <button
                        disabled={!unlocked}
                        onClick={() => unlocked && (window.location.href = `/lesson/${skill.id}`)}
                        className={cn(
                          'k-press relative flex h-[88px] w-[88px] items-center justify-center rounded-full text-[38px] select-none transition-transform',
                          unlocked ? 'hover:-translate-y-[3px]' : 'cursor-default opacity-70',
                          isActive && 'k-pulse-ring k-wiggle',
                        )}
                        style={{
                          background: `radial-gradient(circle at 35% 30%, #ffffff55, transparent 55%), ${face}`,
                          border: `4px solid ${ring}`,
                          boxShadow: `0 10px 0 ${ring}, 0 0 40px ${face}55`,
                          color: text,
                        }}
                      >
                        {/* sheen */}
                        <span
                          className="pointer-events-none absolute left-3 right-3 top-3 h-3 rounded-full"
                          style={{ background: 'rgba(255,255,255,.5)', filter: 'blur(1px)' }}
                        />

                        {/* progress ring */}
                        {prog > 0 && prog < 100 && (
                          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r={BUBBLE_R} stroke="rgba(0,0,0,.25)" strokeWidth="6" fill="none" />
                            <circle
                              cx="48" cy="48" r={BUBBLE_R}
                              stroke={C.cyan} strokeWidth="6" fill="none"
                              strokeLinecap="round"
                              strokeDasharray={circ}
                              strokeDashoffset={offset}
                            />
                          </svg>
                        )}

                        <span className="relative drop-shadow-[0_3px_0_rgba(0,0,0,.25)]">{icon}</span>
                      </button>

                      {/* label chip */}
                      <div
                        className="relative mx-auto mt-3 w-max max-w-[140px] rounded-full px-3 py-1 text-center text-[11px] font-extrabold uppercase tracking-wider"
                        style={{
                          background: unlocked ? C.surface : '#ffffff10',
                          color: unlocked ? C.ink : C.muted,
                          border: `2px solid ${unlocked ? C.line : '#ffffff15'}`,
                          boxShadow: unlocked ? `0 3px 0 #0c1730` : 'none',
                        }}
                      >
                        {skill.title}
                      </div>

                      {complete && (
                        <div
                          className="mx-auto mt-2 w-fit rounded-full px-2.5 py-[2px] text-[9px] font-black uppercase tracking-widest"
                          style={{ background: C.gold, color: '#3a1d00', boxShadow: `0 2px 0 #B57600` }}
                        >
                          ⭐ {t.mastered}
                        </div>
                      )}

                      {/* hover card */}
                      {unlocked && (
                        <div
                          className={cn(
                            'pointer-events-none absolute top-1/2 hidden w-60 -translate-y-1/2 rounded-2xl p-3.5 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 md:block',
                            getCx(absIdx) > SVG_W / 2 ? 'right-[120%]' : 'left-[120%]',
                          )}
                          style={{ background: C.paper, color: '#1B2A55', border: `3px solid ${C.line}` }}
                        >
                          <div className="text-sm font-black">{skill.title}</div>
                          <div className="mt-1 text-xs font-semibold opacity-75">{skill.description}</div>
                          <div className="mt-2 flex items-center justify-between text-[11px] font-extrabold">
                            <span style={{ color: C.red }}>+{skill.xp_reward} {t.xp}</span>
                            <span style={{ color: C.blue }}>{lessonCountMap[skill.id] ?? 0} {t.lessons}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Treasure chest at unit end */}
              <div className="mt-6 flex flex-col items-center">
                <div
                  className="k-float relative flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold}, #ffcd5b)`,
                    border: `4px solid #B57600`,
                    boxShadow: `0 8px 0 #8a5400, 0 0 40px ${C.gold}66`,
                  }}
                >
                  🎁
                  <span className="k-twinkle absolute -top-2 -right-2 text-xl" style={{ color: C.gold }}>✦</span>
                </div>
                <div
                  className="mt-3 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest"
                  style={{ background: C.gold, color: '#3a1d00', boxShadow: `0 3px 0 #8a5400` }}
                >
                  {t.reward}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* Mascot helper bottom-right */}
      <div
        className={cn(
          'fixed bottom-5 z-40 flex items-end gap-2',
          isRtl ? 'left-5' : 'right-5',
        )}
      >
        <div
          className="hidden rounded-2xl px-3 py-2 text-[12px] font-extrabold sm:block"
          style={{
            background: C.paper, color: C.deep,
            boxShadow: `0 4px 0 ${C.muted}`,
          }}
        >
          You can do it! 🎉
        </div>
        <div className="k-bounce text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,.3)]">🦉</div>
      </div>
    </div>
  )
}
