'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: { unit: 'Unit', start: 'START', locked: 'LOCKED', complete: 'MASTERED', xp: 'XP' },
  ar: { unit: 'الوحدة', start: 'ابدأ', locked: 'مقفل', complete: 'أتقنت', xp: 'XP' },
  fr: { unit: 'Unité', start: 'COMMENCER', locked: 'VERROUILLÉ', complete: 'MAÎTRISÉ', xp: 'XP' },
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

export default function SkillsClient({ userId, tracks, skills, skillProgress, lessonCountMap, language }: Props) {
  const [activeTrack, setActiveTrack] = useState(tracks[0]?.id ?? 'coding')

  const lang = (language || 'en') as Language
  const t    = UI[lang]
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const progressMap = Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct]))

  const trackSkills = useMemo(() => skills
    .filter(s => s.track_id === activeTrack)
    .sort((a, b) => a.sort_order - b.sort_order), [skills, activeTrack])

  const isUnlocked = (skill: Skill) =>
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)

  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  // Snake Path Physics
  const BUBBLE_SPACING = 160
  const X_AMPLITUDE = 80

  const getX = (i: number) => {
    const pattern = [0, 0.6, 1, 0.6, 0, -0.6, -1, -0.6]
    return pattern[i % pattern.length] * X_AMPLITUDE
  }

  // Generate a smooth path for the trail
  const pathD = useMemo(() => {
    if (trackSkills.length < 2) return ''
    let d = `M ${getX(0)} 0`
    for (let i = 0; i < trackSkills.length - 1; i++) {
      const currX = getX(i)
      const currY = i * BUBBLE_SPACING
      const nextX = getX(i + 1)
      const nextY = (i + 1) * BUBBLE_SPACING
      const cpY = (currY + nextY) / 2
      d += ` C ${currX} ${cpY}, ${nextX} ${cpY}, ${nextX} ${nextY}`
    }
    return d
  }, [trackSkills])

  return (
    <div className="min-h-screen pb-60 relative bg-[#080808] overflow-x-hidden" dir={dir}>
      
      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_10%,#1CB0F610_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        
        {/* ── TRACK SWITCHER ── */}
        <div className="sticky top-6 z-50 mb-20 flex justify-center px-4">
          <div className="flex p-1 bg-[#121212]/90 backdrop-blur-2xl rounded-full border border-white/5 shadow-2xl">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={cn(
                  'relative px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-500 flex items-center gap-2',
                  activeTrack === track.id ? 'text-white' : 'text-[#555] hover:text-[#777]'
                )}
              >
                {activeTrack === track.id && (
                  <div className="absolute inset-0 bg-[#1CB0F6] rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-500" />
                )}
                <span className="relative z-10">{track.emoji}</span>
                <span className="relative z-10 hidden sm:inline">{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── THE MAP ── */}
        <div className="relative flex flex-col items-center pt-10">
          
          {/* THE GLOWING TRAIL (SVG) */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-visible">
            <svg width="100%" height="100%" className="overflow-visible">
              <path
                d={pathD}
                fill="none"
                stroke="#1CB0F6"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="1, 15"
                className="opacity-30"
              />
              <path
                d={pathD}
                fill="none"
                stroke="#1CB0F6"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-10"
              />
            </svg>
          </div>

          {trackSkills.map((skill, idx) => {
            const unlocked = isUnlocked(skill)
            const complete = isComplete(skill.id)
            const prog = progressMap[skill.id] ?? 0
            const x = getX(idx)
            
            return (
              <div 
                key={skill.id}
                className="relative flex flex-col items-center group"
                style={{ 
                  marginBottom: `${BUBBLE_SPACING}px`,
                  transform: `translateX(${dir === 'rtl' ? -x : x}px)` 
                }}
              >
                {/* ── THE BUBBLE ── */}
                <div className="relative z-10">
                  
                  {/* Aura for Active */}
                  {unlocked && !complete && (
                    <div className="absolute inset-[-20px] rounded-full bg-[#1CB0F6]/10 blur-3xl animate-pulse" />
                  )}

                  <Link
                    href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                    className={cn(
                      "relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300",
                      "shadow-[0_10px_25px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[6px] hover:-translate-y-1.5",
                      complete ? "bg-[#FAA918] border-b-[6px] border-[#B47200]" :
                      unlocked ? "bg-[#1CB0F6] border-b-[6px] border-[#1578A8]" :
                                 "bg-[#1A1A1A] border-b-[6px] border-[#000000] grayscale opacity-80"
                    )}
                  >
                    {/* Soft 3D Lighting */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                    <div className="absolute top-2 left-2 right-2 h-1/2 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
                    
                    {/* Progress Circle */}
                    <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] -rotate-90">
                      <circle cx="50%" cy="50%" r="46%" className="stroke-white/5 fill-none" strokeWidth="4" />
                      {unlocked && (
                        <circle 
                          cx="50%" cy="50%" r="46%" 
                          className={cn("fill-none transition-all duration-1000", complete ? "stroke-[#FAA918]" : "stroke-white")}
                          strokeWidth="4"
                          strokeDasharray="290"
                          strokeDashoffset={290 - (290 * prog) / 100}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>

                    {/* Icon */}
                    <div className="relative z-10 text-4xl md:text-5xl drop-shadow-lg group-hover:scale-110 transition-transform">
                      {complete ? '🏆' : skill.emoji}
                    </div>
                  </Link>

                  {/* START LABEL */}
                  {unlocked && !complete && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#F5F5F5] text-[#0A0A0A] px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest shadow-xl animate-bounce">
                      {t.start}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#F5F5F5] rotate-45" />
                    </div>
                  )}

                  {/* TITLE */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                    <h4 className={cn(
                      "font-fredoka text-base tracking-wide transition-colors duration-500",
                      unlocked ? "text-white" : "text-[#444]"
                    )}>
                      {skill.title}
                    </h4>
                  </div>
                </div>

                {/* SIDE INFO (Desktop) */}
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 hidden lg:block w-56 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-500 z-50",
                  x > 0 ? "right-[130%] translate-x-6 group-hover:translate-x-0" : "left-[130%] -translate-x-6 group-hover:translate-x-0"
                )}>
                  <div className="bg-[#111]/95 backdrop-blur-2xl border border-white/5 p-5 rounded-3xl shadow-2xl">
                    <h5 className="font-fredoka text-white mb-2">{skill.title}</h5>
                    <p className="text-[11px] text-[#666] leading-relaxed mb-4">{skill.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[9px] font-black text-[#FAA918] tracking-widest">+{skill.xp_reward} {t.xp}</span>
                      <span className="text-[9px] font-black text-[#333] tracking-widest uppercase">{lessonCountMap[skill.id] || 0} LESSONS</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* EMPTY STATE */}
        {trackSkills.length === 0 && (
          <div className="text-center py-40 opacity-20">
            <p className="font-black tracking-widest uppercase text-xs">Awaiting the journey...</p>
          </div>
        )}
      </div>
    </div>
  )
}
