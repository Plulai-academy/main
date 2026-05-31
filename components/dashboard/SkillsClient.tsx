'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: { unit: 'Unit', start: 'START', locked: 'LOCKED', complete: 'MASTERED', xp: 'XP', jump: 'Jump to' },
  ar: { unit: 'الوحدة', start: 'ابدأ', locked: 'مقفل', complete: 'أتقنت', xp: 'XP', jump: 'انتقل إلى' },
  fr: { unit: 'Unité', start: 'COMMENCER', locked: 'VERROUILLÉ', complete: 'MAÎTRISÉ', xp: 'XP', jump: 'Aller à' },
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
  const [scrollProgress, setScrollProgress] = useState(0)

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

  // Snake Path Constants
  const BUBBLE_SPACING = 180    // margin-bottom between bubbles (px)
  const BUBBLE_SIZE    = 96     // w-24 h-24 = 96px
  const X_AMPLITUDE    = 85

  const getX = (i: number) => {
    const pattern = [0, 0.6, 1, 0.6, 0, -0.6, -1, -0.6]
    return pattern[i % pattern.length] * X_AMPLITUDE
  }

  // Units Grouping
  const units = useMemo(() => {
    const result = []
    for (let i = 0; i < trackSkills.length; i += 4) {
      result.push(trackSkills.slice(i, i + 4))
    }
    return result
  }, [trackSkills])

  // Precompute SVG paths for each unit (top-level useMemo to satisfy hooks rule)
  const unitPaths = useMemo(() => {
    return units.map((unitSkills, unitIdx) => {
      const startGlobalIdx = unitIdx * 4
      if (unitSkills.length < 2) return ''
      let d = `M ${getX(startGlobalIdx)} ${BUBBLE_SIZE / 2}`
      for (let localIdx = 0; localIdx < unitSkills.length - 1; localIdx++) {
        const currX = getX(startGlobalIdx + localIdx)
        const currY = localIdx * (BUBBLE_SIZE + BUBBLE_SPACING) + BUBBLE_SIZE / 2
        const nextX = getX(startGlobalIdx + localIdx + 1)
        const nextY = (localIdx + 1) * (BUBBLE_SIZE + BUBBLE_SPACING) + BUBBLE_SIZE / 2
        const cpY = (currY + nextY) / 2
        d += ` C ${currX} ${cpY}, ${nextX} ${cpY}, ${nextX} ${nextY}`
      }
      return d
    })
  }, [units]) // units depends on trackSkills, which depends on skills/activeTrack

  // Scroll Tracking for Parallax
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setScrollProgress(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen pb-60 relative bg-[#050505] overflow-x-hidden" dir={dir}>
      
      {/* ── PARALLAX BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_20%,#1CB0F608_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 transition-transform duration-1000 ease-out" 
             style={{ transform: `translateY(${scrollProgress * -0.1}%)` }}>
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full" 
                 style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 opacity-10 transition-transform duration-1000 ease-out" 
             style={{ transform: `translateY(${scrollProgress * -0.2}%)` }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-[#1CB0F6] rounded-full blur-[1px]" 
                 style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        
        {/* ── TRACK SELECTOR ── */}
        <div className="sticky top-6 z-50 mb-20 flex justify-center px-4">
          <div className="flex p-1 bg-[#121212]/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={cn(
                  'relative px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2',
                  activeTrack === track.id ? 'text-white' : 'text-[#555] hover:text-[#777]'
                )}
              >
                {activeTrack === track.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-500" />
                )}
                <span className="relative z-10 text-xl">{track.emoji}</span>
                <span className="relative z-10 hidden sm:inline">{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── UNIT SECTIONS ── */}
        <div className="space-y-40">
          {units.map((unitSkills, unitIdx) => {
            const startGlobalIdx = unitIdx * 4
            const unitPath = unitPaths[unitIdx] || ''
            
            return (
              <section key={unitIdx} className="relative">
                
                {/* Unit Milestone Header */}
                <div className="relative mb-20 px-4">
                  <div className="bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#1CB0F6]/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <span className="text-[#1CB0F6] font-black text-[10px] tracking-[0.3em] uppercase opacity-80">{t.unit} {unitIdx + 1}</span>
                      <h2 className="text-white font-fredoka text-3xl md:text-4xl mt-1 tracking-tight">
                        {unitSkills[0].title.split(' ')[0]} Masterclass
                      </h2>
                    </div>
                  </div>
                </div>

                {/* The Map Container */}
                <div className="relative flex flex-col items-center">
                  
                  {/* SVG PATH - now using precomputed unitPath */}
                  {unitPath && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-visible z-0">
                      <svg width="100%" height="100%" className="overflow-visible">
                        <path
                          d={unitPath}
                          fill="none"
                          stroke="#1CB0F6"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray="1, 20"
                          className="opacity-10"
                        />
                        <path
                          d={unitPath}
                          fill="none"
                          stroke="#1CB0F6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="opacity-20"
                        />
                      </svg>
                    </div>
                  )}

                  {unitSkills.map((skill, skillIdx) => {
                    const absoluteIdx = startGlobalIdx + skillIdx
                    const unlocked = isUnlocked(skill)
                    const complete = isComplete(skill.id)
                    const prog = progressMap[skill.id] ?? 0
                    const x = getX(absoluteIdx)
                    
                    return (
                      <div 
                        key={skill.id}
                        className="relative flex flex-col items-center group z-10"
                        style={{ 
                          marginBottom: `${BUBBLE_SPACING}px`,
                          transform: `translateX(${dir === 'rtl' ? -x : x}px)` 
                        }}
                      >
                        {/* Bubble content (unchanged) */}
                        <div className="relative">
                          {unlocked && !complete && (
                            <div className="absolute inset-[-25px] rounded-full bg-[#1CB0F6]/15 blur-3xl animate-pulse" />
                          )}

                          <Link
                            href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                            className={cn(
                              "relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-500",
                              "shadow-[0_12px_32px_rgba(0,0,0,0.6)] active:shadow-none active:translate-y-[8px] hover:-translate-y-2 hover:scale-105",
                              complete ? "bg-[#FAA918] border-b-[8px] border-[#B47200]" :
                              unlocked ? "bg-[#1CB0F6] border-b-[8px] border-[#1578A8]" :
                                         "bg-[#1A1A1A] border-b-[8px] border-[#000000] grayscale opacity-80"
                            )}
                          >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                            <div className="absolute top-2 left-3 right-3 h-1/2 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-40" />
                            
                            <svg className="absolute inset-[-12px] w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
                              <circle cx="50%" cy="50%" r="46%" className="stroke-white/5 fill-none" strokeWidth="6" />
                              {unlocked && (
                                <circle 
                                  cx="50%" cy="50%" r="46%" 
                                  className={cn("fill-none transition-all duration-1000", complete ? "stroke-[#FAA918]" : "stroke-white")}
                                  strokeWidth="6"
                                  strokeDasharray="290"
                                  strokeDashoffset={290 - (290 * prog) / 100}
                                  strokeLinecap="round"
                                />
                              )}
                            </svg>

                            <div className="relative z-10 text-4xl md:text-5xl drop-shadow-2xl group-hover:rotate-6 transition-transform duration-300">
                              {complete ? '💎' : skill.emoji}
                            </div>
                          </Link>

                          {unlocked && !complete && (
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest shadow-2xl animate-bounce">
                              {t.start}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                            </div>
                          )}

                          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                            <h4 className={cn(
                              "font-fredoka text-lg tracking-wide transition-all duration-500",
                              unlocked ? "text-white" : "text-[#444]"
                            )}>
                              {skill.title}
                            </h4>
                            {complete && <p className="text-[9px] font-black text-[#FAA918] tracking-[0.2em] uppercase leading-none mt-1">{t.complete}</p>}
                          </div>
                        </div>

                        {/* Side info (unchanged) */}
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 hidden lg:block w-64 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-500 z-50",
                          x > 0 ? "right-[140%] translate-x-10 group-hover:translate-x-0" : "left-[140%] -translate-x-10 group-hover:translate-x-0"
                        )}>
                          <div className="bg-[#121212]/95 backdrop-blur-3xl border border-white/10 p-7 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{skill.emoji}</div>
                              <h5 className="font-fredoka text-xl text-white">{skill.title}</h5>
                            </div>
                            <p className="text-xs text-[#666] font-medium leading-relaxed mb-6">{skill.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <span className="text-[10px] font-black text-[#FAA918] tracking-widest uppercase">+{skill.xp_reward} {t.xp}</span>
                              <span className="text-[10px] font-black text-[#333] tracking-widest uppercase">{lessonCountMap[skill.id] || 0} LESSONS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* UNIT END TREASURE */}
                  <div className="relative mt-10 mb-20 opacity-30 hover:opacity-100 transition-opacity cursor-pointer group">
                    <div className="w-20 h-20 bg-[#121212] rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                      🎁
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-[#444] tracking-widest uppercase">Unit Reward</div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* ── UNIT QUICK-JUMP (SIDE NAV) ── */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4">
        {units.map((_, i) => (
          <div key={i} className="group relative flex items-center justify-end">
            <span className="absolute right-8 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black text-[#1CB0F6] uppercase tracking-widest whitespace-nowrap bg-black/80 px-3 py-1.5 rounded-lg border border-white/10">
              {t.unit} {i + 1}
            </span>
            <div className="w-2 h-2 rounded-full bg-white/10 border border-white/20 group-hover:bg-[#1CB0F6] group-hover:scale-150 transition-all duration-300" />
          </div>
        ))}
      </div>
    </div>
  )
}