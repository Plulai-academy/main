'use client'
// components/dashboard/SkillsClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: {
    title: 'Learning Journey', sub: 'Follow the path to master new skills!',
    start: 'Start', cont: 'Continue', done: 'Review',
    locked: 'Locked', lessons: 'lessons', complete: 'complete',
    needs: 'Unlock previous skills first', xpLabel: 'XP',
  },
  ar: {
    title: 'رحلة التعلم', sub: 'اتبع المسار لإتقان مهارات جديدة!',
    start: 'ابدأ', cont: 'استمر', done: 'مراجعة',
    locked: 'مقفل', lessons: 'دروس', complete: 'مكتمل',
    needs: 'افتح المهارات السابقة أولاً', xpLabel: 'XP',
  },
  fr: {
    title: 'Parcours d\'apprentissage', sub: 'Suis le chemin pour maîtriser de nouvelles compétences !',
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

  // Zig-zag pattern logic
  const getXOffset = (index: number) => {
    const pattern = [0, 40, 60, 40, 0, -40, -60, -40]
    return pattern[index % pattern.length]
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-0" dir={dir}>
      <div className="max-w-2xl mx-auto pt-8 lg:pt-12">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="font-fredoka text-3xl md:text-4xl mb-2 text-[#F5F5F5]">{t.title}</h1>
          <p className="text-[#6F6F6F] font-semibold text-sm md:text-base">{t.sub}</p>
        </div>

        {/* Track Tabs - Premium Floating Style */}
        <div className="sticky top-4 z-30 mb-12 flex justify-center px-2">
          <div className="flex gap-1 bg-[#121212]/80 backdrop-blur-xl rounded-[24px] p-1.5 border border-white/5 shadow-2xl">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={cn(
                  'relative px-5 py-2.5 rounded-[18px] font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 overflow-hidden',
                  activeTrack === track.id 
                    ? 'text-white shadow-lg' 
                    : 'text-[#6F6F6F] hover:text-[#F5F5F5] hover:bg-white/5'
                )}
              >
                {activeTrack === track.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] animate-in fade-in duration-300" />
                )}
                <span className="relative z-10">{track.emoji}</span>
                <span className="relative z-10 hidden sm:inline">{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The Map Path */}
        <div className="relative flex flex-col items-center py-10">
          {/* Background Path Line */}
          <div className="absolute top-0 bottom-0 w-3 bg-[#121212] rounded-full overflow-hidden">
             <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#1CB0F6] to-[#2B70C9] opacity-20 h-full" />
          </div>

          {trackSkills.map((skill, idx) => {
            const unlocked = isUnlocked(skill)
            const complete = isComplete(skill.id)
            const prog     = progressMap[skill.id] ?? 0
            const xOffset  = getXOffset(idx)
            
            return (
              <div 
                key={skill.id} 
                className="relative w-full flex flex-col items-center mb-16 group"
                style={{ transform: `translateX(${dir === 'rtl' ? -xOffset : xOffset}px)` }}
              >
                {/* Skill Bubble Container */}
                <div className="relative z-10">
                  {/* Progress Ring (SVG) */}
                  <svg className="w-24 h-24 md:w-28 md:h-28 -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      className="stroke-[#121212] fill-none"
                      strokeWidth="8"
                    />
                    {unlocked && (
                      <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        className={cn(
                          "fill-none transition-all duration-1000 ease-out",
                          complete ? "stroke-[#FAA918]" : "stroke-[#1CB0F6]"
                        )}
                        strokeWidth="8"
                        strokeDasharray="251.2" // 2 * pi * 40
                        strokeDashoffset={251.2 - (251.2 * prog) / 100}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>

                  {/* The Main Bubble */}
                  <Link
                    href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                    className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                      "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl transition-all duration-300",
                      "shadow-[0_8px_0_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1",
                      complete ? "bg-gradient-to-b from-[#FAA918] to-[#D33131] text-white" :
                      unlocked ? "bg-gradient-to-b from-[#1CB0F6] to-[#2B70C9] text-white" :
                                 "bg-[#121212] text-[#6F6F6F] border-4 border-[#121212] cursor-not-allowed"
                    )}
                  >
                    {complete ? '✨' : skill.emoji}
                  </Link>

                  {/* Tooltip / Label */}
                  <div className={cn(
                    "absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl border transition-all duration-300",
                    unlocked ? "bg-card border-white/10 opacity-100 scale-100" : "bg-card/50 border-transparent opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                  )}>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#6F6F6F] uppercase tracking-widest leading-none mb-1">
                        {complete ? t.done : unlocked ? `${prog}% ${t.complete}` : t.locked}
                      </p>
                      <h3 className="font-fredoka text-sm text-[#F5F5F5]">{skill.title}</h3>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-t border-l border-white/10 rotate-45" />
                  </div>
                </div>

                {/* Pop-out Info Card on Hover (Desktop) */}
                <div className="absolute left-[120%] top-0 hidden lg:block w-48 opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-40">
                  <div className="bg-card/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-xs text-[#F5F5F5] font-medium leading-relaxed mb-3">{skill.description}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-[#FAA918]">+{skill.xp_reward} XP</span>
                       <span className="text-[10px] font-bold text-[#6F6F6F]">{lessonCountMap[skill.id] || 0} {t.lessons}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {trackSkills.length === 0 && (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-white/10 animate-pulse">
            <p className="text-[#6F6F6F] font-bold italic">
              {lang === 'ar' ? 'رحلة جديدة قادمة قريباً...' : lang === 'fr' ? 'Un nouveau voyage arrive bientôt...' : 'A new journey is coming soon...'}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-[#1CB0F6]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-[#2B70C9]/5 rounded-full blur-[100px]" />
      </div>
    </div>
  )
}
