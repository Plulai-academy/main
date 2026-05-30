'use client'
// components/dashboard/SkillsClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: {
    unit: 'Unit',
    start: 'START',
    locked: 'LOCKED',
    complete: 'MASTERED',
    xp: 'XP',
  },
  ar: {
    unit: 'الوحدة',
    start: 'ابدأ',
    locked: 'مقفل',
    complete: 'أتقنت',
    xp: 'XP',
  },
  fr: {
    unit: 'Unité',
    start: 'COMMENCER',
    locked: 'VERROUILLÉ',
    complete: 'MAÎTRISÉ',
    xp: 'XP',
  },
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

  const trackSkills = skills
    .filter(s => s.track_id === activeTrack)
    .sort((a, b) => a.sort_order - b.sort_order)

  const isUnlocked = (skill: Skill) =>
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)

  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  // Addictive Snake Logic
  const getXOffset = (index: number) => {
    const offsets = [0, 50, 80, 50, 0, -50, -80, -50]
    return offsets[index % offsets.length]
  }

  // Grouping skills into "Units" (Duolingo style)
  const units = []
  const skillsPerUnit = 4
  for (let i = 0; i < trackSkills.length; i += skillsPerUnit) {
    units.push(trackSkills.slice(i, i + skillsPerUnit))
  }

  return (
    <div className="min-h-screen pb-40 relative selection:bg-[#1CB0F6]/30" dir={dir}>
      
      {/* ── IMMERSIVE BACKGROUND ── */}
      <div className="fixed inset-0 z-0 bg-[#0A0A0A]">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1CB0F6]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2B70C9]/10 rounded-full blur-[120px] animate-pulse" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        
        {/* ── PREMIUM TRACK SWITCHER ── */}
        <div className="sticky top-6 z-50 mb-16 px-4">
          <div className="flex p-1.5 bg-black/40 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[26px] transition-all duration-500 overflow-hidden group',
                  activeTrack === track.id ? 'text-white' : 'text-[#6F6F6F] hover:text-[#F5F5F5]'
                )}
              >
                {activeTrack === track.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] animate-in fade-in zoom-in-95 duration-500" />
                )}
                <span className="relative z-10 text-xl group-hover:scale-125 transition-transform duration-300">{track.emoji}</span>
                <span className="relative z-10 font-black text-xs uppercase tracking-widest hidden sm:inline">{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── THE JOURNEY ── */}
        <div className="space-y-24">
          {units.map((unitSkills, unitIdx) => (
            <section key={unitIdx} className="relative">
              
              {/* Unit Header */}
              <div className="relative mb-16 px-6">
                <div className="bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] rounded-[28px] p-6 shadow-2xl border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <h2 className="text-white font-black text-sm uppercase tracking-[0.2em] opacity-80 mb-1">{t.unit} {unitIdx + 1}</h2>
                    <h3 className="text-white font-fredoka text-2xl md:text-3xl">
                      {unitSkills[0].title.split(' ')[0]} Exploration
                    </h3>
                  </div>
                </div>
              </div>

              {/* Skills Path */}
              <div className="flex flex-col items-center space-y-20 relative">
                {/* Stepping Stones (Connectors) */}
                <div className="absolute top-0 bottom-0 w-1 bg-white/5 rounded-full" />

                {unitSkills.map((skill, skillIdx) => {
                  const absoluteIdx = unitIdx * skillsPerUnit + skillIdx
                  const xOffset = getXOffset(absoluteIdx)
                  const unlocked = isUnlocked(skill)
                  const complete = isComplete(skill.id)
                  const prog = progressMap[skill.id] ?? 0
                  
                  return (
                    <div 
                      key={skill.id}
                      className="relative flex flex-col items-center group"
                      style={{ transform: `translateX(${dir === 'rtl' ? -xOffset : xOffset}px)` }}
                    >
                      {/* Floating Tooltip (The "Juice") */}
                      <div className={cn(
                        "absolute -top-16 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl bg-[#1CB0F6] text-black font-black text-[10px] tracking-widest uppercase shadow-[0_8px_0_0_#1578A8] transition-all duration-300 pointer-events-none whitespace-nowrap z-20",
                        unlocked && !complete ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-75"
                      )}>
                        {t.start}
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1CB0F6] rotate-45" />
                      </div>

                      {/* 3D Bubble */}
                      <Link
                        href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                        className={cn(
                          "relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300",
                          "shadow-[0_12px_0_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[8px] hover:-translate-y-2",
                          complete ? "bg-gradient-to-b from-[#FAA918] to-[#D33131] border-b-[8px] border-[#B47200]" :
                          unlocked ? "bg-gradient-to-b from-[#1CB0F6] to-[#2B70C9] border-b-[8px] border-[#1578A8]" :
                                     "bg-[#1A1A1A] border-b-[8px] border-[#000000] grayscale cursor-not-allowed"
                        )}
                      >
                        {/* Progress Ring */}
                        <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] -rotate-90 pointer-events-none">
                          <circle cx="50%" cy="50%" r="44%" className="stroke-white/5 fill-none" strokeWidth="6" />
                          {unlocked && (
                            <circle 
                              cx="50%" cy="50%" r="44%" 
                              className={cn("fill-none transition-all duration-1000", complete ? "stroke-[#FAA918]" : "stroke-[#1CB0F6]")}
                              strokeWidth="6"
                              strokeDasharray="276"
                              strokeDashoffset={276 - (276 * prog) / 100}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>

                        {/* Icon */}
                        <div className="relative z-10 text-4xl md:text-5xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          {complete ? '🏆' : skill.emoji}
                        </div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-40" />
                      </Link>

                      {/* Skill Title */}
                      <div className="mt-6 text-center">
                        <h4 className={cn(
                          "font-fredoka text-lg tracking-wide transition-colors duration-300",
                          unlocked ? "text-[#F5F5F5]" : "text-[#6F6F6F]"
                        )}>
                          {skill.title}
                        </h4>
                        {complete && (
                          <span className="text-[10px] font-black text-[#FAA918] tracking-[0.2em] uppercase">{t.complete}</span>
                        )}
                      </div>

                      {/* Hover Info Card (Juicy Reveal) */}
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 hidden lg:block w-64 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-500 z-50",
                        xOffset > 0 ? "right-[140%] translate-x-8 group-hover:translate-x-0" : "left-[140%] -translate-x-8 group-hover:translate-x-0"
                      )}>
                        <div className="bg-[#121212]/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{skill.emoji}</div>
                            <h5 className="font-fredoka text-xl text-white">{skill.title}</h5>
                          </div>
                          <p className="text-sm text-[#6F6F6F] font-medium leading-relaxed mb-6">{skill.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="px-3 py-1.5 rounded-full bg-[#FAA918]/10 border border-[#FAA918]/20">
                              <span className="text-[10px] font-black text-[#FAA918]">+{skill.xp_reward} {t.xp}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#6F6F6F] uppercase tracking-widest">{lessonCountMap[skill.id] || 0} LESSONS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Empty State */}
        {trackSkills.length === 0 && (
          <div className="text-center py-32">
            <div className="text-6xl mb-6 animate-bounce">🔭</div>
            <h3 className="font-fredoka text-2xl text-[#6F6F6F]">Discovering new worlds...</h3>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(-30px) translateX(-10px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
