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
  const BUBBLE_SPACING = 180
  const X_AMPLITUDE = 90

  const getX = (i: number) => {
    const pattern = [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5]
    return pattern[i % pattern.length] * X_AMPLITUDE
  }

  // Generate a smooth 3D snake path
  const pathD = useMemo(() => {
    if (trackSkills.length < 2) return ''
    let d = `M ${getX(0)} 0`
    for (let i = 0; i < trackSkills.length - 1; i++) {
      const currX = getX(i)
      const currY = i * BUBBLE_SPACING
      const nextX = getX(i + 1)
      const nextY = (i + 1) * BUBBLE_SPACING
      const cpY1 = currY + BUBBLE_SPACING * 0.4
      const cpY2 = nextY - BUBBLE_SPACING * 0.4
      d += ` C ${currX} ${cpY1}, ${nextX} ${cpY2}, ${nextX} ${nextY}`
    }
    return d
  }, [trackSkills])

  return (
    <div className="min-h-screen pb-60 relative bg-[#080808] overflow-x-hidden selection:bg-[#1CB0F6]/30" dir={dir}>
      
      {/* ── AMBIENT WORLD ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1CB0F608_0%,transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1CB0F6]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2B70C9]/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        
        {/* ── PREMIUM FLOATING TRACKER ── */}
        <div className="sticky top-6 z-50 mb-24 flex justify-center px-4">
          <div className="flex p-2 bg-[#121212]/90 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={cn(
                  'relative px-7 py-3.5 rounded-[26px] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 overflow-hidden group',
                  activeTrack === track.id ? 'text-white' : 'text-[#555] hover:text-[#888]'
                )}
              >
                {activeTrack === track.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] shadow-inner animate-in fade-in zoom-in-95 duration-500" />
                )}
                <span className="relative z-10 text-2xl group-hover:scale-125 transition-transform duration-300">{track.emoji}</span>
                <span className="relative z-10 hidden sm:inline">{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── THE SNAKE JOURNEY ── */}
        <div className="relative flex flex-col items-center pt-10">
          
          {/* THE SNAKE BODY (3D SVG) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-visible">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="snakeBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1CB0F6" />
                  <stop offset="100%" stopColor="#2B70C9" />
                </linearGradient>
                <filter id="snakeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                  <feOffset dx="0" dy="8" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Snake Shadow */}
              <path d={pathD} fill="none" stroke="black" strokeWidth="24" strokeLinecap="round" className="opacity-40" filter="url(#snakeShadow)" />
              
              {/* Snake Main Body (Thick) */}
              <path d={pathD} fill="none" stroke="url(#snakeBodyGrad)" strokeWidth="20" strokeLinecap="round" className="opacity-20" />
              
              {/* Snake Core Highlight */}
              <path d={pathD} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" className="opacity-10" />
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
                {/* ── THE 3D BUBBLE ASSET ── */}
                <div className="relative z-10">
                  
                  {/* Active Aura */}
                  {unlocked && !complete && (
                    <div className="absolute inset-[-20px] rounded-full bg-[#1CB0F6]/25 blur-3xl animate-pulse" />
                  )}

                  <Link
                    href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                    className={cn(
                      "relative w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-500",
                      "shadow-[0_15px_40px_rgba(0,0,0,0.6)] active:shadow-none active:translate-y-[10px] hover:-translate-y-2",
                      complete ? "bg-[#FAA918] border-b-[12px] border-[#B47200]" :
                      unlocked ? "bg-[#1CB0F6] border-b-[12px] border-[#1578A8]" :
                                 "bg-[#1A1A1A] border-b-[12px] border-[#000000] grayscale opacity-90"
                    )}
                  >
                    {/* Inner Depth & Shine Layers */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-40" />
                    <div className="absolute inset-2 rounded-full border border-white/10" />
                    <div className="absolute top-3 left-6 w-1/4 h-1/5 bg-white/30 rounded-full blur-[3px] -rotate-12" />
                    
                    {/* Progress Halo */}
                    <svg className="absolute inset-[-12px] w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
                      <circle cx="50%" cy="50%" r="46%" className="stroke-white/5 fill-none" strokeWidth="8" />
                      {unlocked && (
                        <circle 
                          cx="50%" cy="50%" r="46%" 
                          className={cn("fill-none transition-all duration-1000", complete ? "stroke-[#FAA918]" : "stroke-white")}
                          strokeWidth="8"
                          strokeDasharray="290"
                          strokeDashoffset={290 - (290 * prog) / 100}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>

                    {/* Skill Icon */}
                    <div className="relative z-10 text-5xl md:text-6xl drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {complete ? '💎' : skill.emoji}
                    </div>
                  </Link>

                  {/* START LABEL (Floating) */}
                  {unlocked && !complete && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2.5 rounded-[18px] font-black text-xs tracking-widest shadow-2xl animate-bounce">
                      {t.start}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                    </div>
                  )}

                  {/* INFO TAG */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center min-w-[160px]">
                    <h4 className={cn(
                      "font-fredoka text-xl tracking-wide transition-all duration-500",
                      unlocked ? "text-white scale-100" : "text-[#444] scale-95"
                    )}>
                      {skill.title}
                    </h4>
                    {complete && (
                      <div className="flex items-center justify-center gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FAA918]" />
                        <p className="text-[10px] font-black text-[#FAA918] tracking-[0.25em] uppercase">{t.complete}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SIDE REVEAL PANEL (Desktop) */}
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 hidden lg:block w-72 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-500 z-50",
                  x > 0 ? "right-[150%] translate-x-10 group-hover:translate-x-0" : "left-[150%] -translate-x-10 group-hover:translate-x-0"
                )}>
                  <div className="bg-[#121212]/95 backdrop-blur-3xl border border-white/10 p-7 rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner">{skill.emoji}</div>
                      <h5 className="font-fredoka text-2xl text-white">{skill.title}</h5>
                    </div>
                    <p className="text-sm text-[#777] font-semibold leading-relaxed mb-6">{skill.description}</p>
                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#FAA918] tracking-widest uppercase">Reward</span>
                        <span className="text-lg font-black text-white">+{skill.xp_reward} {t.xp}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#444] tracking-widest uppercase">Lessons</span>
                        <span className="text-lg font-black text-[#888]">{lessonCountMap[skill.id] || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* EMPTY STATE */}
        {trackSkills.length === 0 && (
          <div className="text-center py-48">
            <div className="text-8xl mb-8 animate-pulse grayscale opacity-20">🏝️</div>
            <h3 className="font-fredoka text-3xl text-[#333] tracking-tighter">Charting new territory...</h3>
          </div>
        )}
      </div>
    </div>
  )
}
