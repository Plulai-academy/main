'use client'
// components/dashboard/SkillsClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: {
    title: 'Learning Journey', sub: 'Master your path, one step at a time.',
    start: 'Start', cont: 'Continue', done: 'Review',
    locked: 'Locked', lessons: 'lessons', complete: 'complete',
    needs: 'Unlock previous skills first', xpLabel: 'XP',
  },
  ar: {
    title: 'رحلة التعلم', sub: 'أتقن مسارك، خطوة بخطوة.',
    start: 'ابدأ', cont: 'استمر', done: 'مراجعة',
    locked: 'مقفل', lessons: 'دروس', complete: 'مكتمل',
    needs: 'افتح المهارات السابقة أولاً', xpLabel: 'XP',
  },
  fr: {
    title: 'Parcours d\'apprentissage', sub: 'Maîtrise ton chemin, une étape à la fois.',
    start: 'Commencer', cont: 'Continuer', done: 'Réviser',
    locked: 'Verrouillé', lessons: 'leçons', complete: 'complété',
    needs: 'Débloque d\'abord les compétences précédentes', xpLabel: 'XP',
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

  // Snake pattern logic: x-offsets for a winding path
  const getXOffset = (index: number) => {
    // A more pronounced winding pattern
    const pattern = [0, 45, 80, 95, 80, 45, 0, -45, -80, -95, -80, -45]
    return pattern[index % pattern.length]
  }

  return (
    <div className="min-h-screen pb-32 px-4 md:px-0 bg-black/20" dir={dir}>
      <div className="max-w-2xl mx-auto pt-10 lg:pt-16">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="font-fredoka text-4xl md:text-5xl mb-3 text-[#F5F5F5] tracking-tight">
             {t.title}
          </h1>
          <p className="text-[#6F6F6F] font-bold text-sm md:text-base tracking-wide uppercase opacity-80">{t.sub}</p>
        </div>

        {/* Floating Track Switcher */}
        <div className="sticky top-6 z-40 mb-20 flex justify-center px-4">
          <div className="flex gap-1.5 bg-[#121212]/90 backdrop-blur-2xl rounded-[28px] p-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={cn(
                  'relative px-6 py-3 rounded-[20px] font-black text-xs md:text-sm transition-all duration-500 flex items-center gap-2.5 overflow-hidden group',
                  activeTrack === track.id ? 'text-white' : 'text-[#6F6F6F] hover:text-[#F5F5F5]'
                )}
              >
                {activeTrack === track.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] shadow-inner animate-in fade-in zoom-in-95 duration-500" />
                )}
                <span className="relative z-10 group-hover:scale-110 transition-transform">{track.emoji}</span>
                <span className="relative z-10 hidden sm:inline tracking-tight">{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The Snake Path */}
        <div className="relative flex flex-col items-center">
          
          {/* Decorative Path Line (SVG for smoothness) */}
          <svg className="absolute top-0 w-full h-full pointer-events-none overflow-visible opacity-20" preserveAspectRatio="none">
             <defs>
               <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#1CB0F6" />
                 <stop offset="100%" stopColor="#2B70C9" />
               </linearGradient>
             </defs>
             {/* Dynamic path drawing would be complex here, so we use a styled central line with glow */}
             <rect x="calc(50% - 6px)" y="0" width="12" height="100%" rx="6" fill="url(#pathGradient)" />
          </svg>

          {trackSkills.map((skill, idx) => {
            const unlocked = isUnlocked(skill)
            const complete = isComplete(skill.id)
            const prog     = progressMap[skill.id] ?? 0
            const xOffset  = getXOffset(idx)
            
            return (
              <div 
                key={skill.id} 
                className="relative w-full flex flex-col items-center mb-24 group"
                style={{ transform: `translateX(${dir === 'rtl' ? -xOffset : xOffset}px)` }}
              >
                {/* Random Floating Decor (Stars/Dots) */}
                {idx % 3 === 0 && (
                  <div className="absolute -left-20 top-0 text-2xl animate-pulse opacity-30">✨</div>
                )}
                {idx % 4 === 0 && (
                  <div className="absolute -right-24 bottom-0 text-xl animate-bounce-slow opacity-20">🌟</div>
                )}

                {/* Skill Bubble Container */}
                <div className="relative z-10">
                  {/* Outer Glowing Ring */}
                  {unlocked && !complete && (
                    <div className="absolute inset-[-12px] rounded-full bg-[#1CB0F6]/20 blur-xl animate-pulse" />
                  )}

                  {/* Progress Ring */}
                  <div className="relative w-28 h-28 md:w-32 md:h-32">
                    <svg className="w-full h-full -rotate-90 drop-shadow-2xl">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="40%"
                        className="stroke-[#121212] fill-none"
                        strokeWidth="10"
                      />
                      {unlocked && (
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40%"
                          className={cn(
                            "fill-none transition-all duration-1000 ease-out",
                            complete ? "stroke-[#FAA918]" : "stroke-[#1CB0F6]"
                          )}
                          strokeWidth="10"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * prog) / 100}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>

                    {/* The 3D Bubble Button */}
                    <Link
                      href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                      className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-4xl md:text-5xl transition-all duration-300",
                        "border-b-[10px] active:border-b-0 active:translate-y-[6px] group-hover:-translate-y-1 group-hover:scale-105",
                        complete ? "bg-gradient-to-b from-[#FAA918] to-[#D33131] border-[#B47200] text-white shadow-[0_15px_30px_rgba(250,169,24,0.3)]" :
                        unlocked ? "bg-gradient-to-b from-[#1CB0F6] to-[#2B70C9] border-[#1578A8] text-white shadow-[0_15px_30px_rgba(28,176,246,0.3)]" :
                                   "bg-[#121212] border-[#080808] text-[#6F6F6F] cursor-not-allowed opacity-80"
                      )}
                    >
                      <div className="relative z-10 drop-shadow-lg">
                        {complete ? '🏆' : skill.emoji}
                      </div>
                      {/* Inner Shine */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-50" />
                    </Link>
                  </div>

                  {/* Floating Label Card */}
                  <div className={cn(
                    "absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-5 py-2.5 rounded-2xl border transition-all duration-500",
                    unlocked 
                      ? "bg-[#121212]/90 backdrop-blur-xl border-white/10 opacity-100 translate-y-0 shadow-xl" 
                      : "bg-[#121212]/40 border-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                  )}>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          complete ? "bg-[#FAA918]" : unlocked ? "bg-[#1CB0F6]" : "bg-[#6F6F6F]"
                        )} />
                        <p className="text-[10px] font-black text-[#6F6F6F] uppercase tracking-[0.15em] leading-none">
                          {complete ? t.done : unlocked ? `${prog}% ${t.complete}` : t.locked}
                        </p>
                      </div>
                      <h3 className="font-fredoka text-sm md:text-base text-[#F5F5F5] tracking-wide">{skill.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Side Info Panel (Desktop Hover) */}
                <div className={cn(
                  "absolute top-0 hidden lg:block w-56 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-500 z-50",
                  xOffset > 0 ? "right-[130%] translate-x-4 group-hover:translate-x-0" : "left-[130%] -translate-x-4 group-hover:translate-x-0"
                )}>
                  <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-[24px] shadow-[0_25px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-xl">{skill.emoji}</span>
                       <h4 className="font-fredoka text-[#F5F5F5]">{skill.title}</h4>
                    </div>
                    <p className="text-xs text-[#6F6F6F] font-semibold leading-relaxed mb-4">{skill.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                       <div className="flex items-center gap-1">
                          <span className="text-xs">✨</span>
                          <span className="text-[10px] font-black text-[#FAA918]">+{skill.xp_reward} XP</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <span className="text-xs">📚</span>
                          <span className="text-[10px] font-black text-[#6F6F6F]">{lessonCountMap[skill.id] || 0} {t.lessons}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {trackSkills.length === 0 && (
          <div className="text-center py-24 bg-[#121212]/40 rounded-[40px] border-2 border-dashed border-white/5 animate-pulse mx-4">
            <div className="text-5xl mb-4 opacity-20">🗺️</div>
            <p className="text-[#6F6F6F] font-black tracking-widest uppercase text-xs">
              {lang === 'ar' ? 'رحلة جديدة قيد الإنشاء...' : lang === 'fr' ? 'Nouveau voyage en construction...' : 'New journey under construction...'}
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Background Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1CB0F6]/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2B70C9]/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] left-[30%] w-[10%] h-[10%] bg-white/5 rounded-full blur-[80px]" />
      </div>
    </div>
  )
}
