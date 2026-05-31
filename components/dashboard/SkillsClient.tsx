'use client'
// components/dashboard/SkillsClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: { title: 'Skill Path', sub: 'Structured learning journey to mastery.', start: 'Start Module', cont: 'Continue', done: 'Completed', locked: 'Locked', xp: 'XP' },
  ar: { title: 'مسار المهارات', sub: 'رحلة تعلم منظمة نحو الإتقان.', start: 'ابدأ الوحدة', cont: 'استمر', done: 'مكتمل', locked: 'مقفل', xp: 'XP' },
  fr: { title: 'Parcours de Compétences', sub: 'Un parcours d\'apprentissage structuré vers la maîtrise.', start: 'Démarrer le module', cont: 'Continuer', done: 'Terminé', locked: 'Verrouillé', xp: 'XP' },
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] pb-24" dir={dir}>
      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t.title}</h1>
          <p className="text-[#6F6F6F] font-medium">{t.sub}</p>
        </div>

        {/* Professional Track Switcher */}
        <div className="flex gap-2 mb-16 border-b border-white/5 pb-1">
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={cn(
                'px-6 py-3 text-sm font-bold transition-all relative',
                activeTrack === track.id 
                  ? 'text-[#1CB0F6]' 
                  : 'text-[#6F6F6F] hover:text-[#F5F5F5]'
              )}
            >
              <div className="flex items-center gap-2">
                <span>{track.emoji}</span>
                <span>{track.name}</span>
              </div>
              {activeTrack === track.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1CB0F6] animate-in fade-in duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Professional Timeline Path */}
        <div className="relative space-y-12">
          {/* Vertical Path Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#1CB0F6]/50 via-white/5 to-white/5" 
               style={lang === 'ar' ? { left: 'auto', right: '1.5rem' } : {}} />

          {trackSkills.map((skill, idx) => {
            const unlocked = isUnlocked(skill)
            const complete = isComplete(skill.id)
            const prog = progressMap[skill.id] ?? 0
            
            return (
              <div key={skill.id} className="relative pl-16 group" style={lang === 'ar' ? { paddingLeft: 0, paddingRight: '4rem' } : {}}>
                
                {/* Milestone Node */}
                <div className={cn(
                  "absolute left-3 top-0 w-6 h-6 rounded-full border-2 transition-all duration-500 z-10 flex items-center justify-center",
                  complete ? "bg-[#1CB0F6] border-[#1CB0F6]" :
                  unlocked ? "bg-[#0A0A0A] border-[#1CB0F6] shadow-[0_0_15px_rgba(28,176,246,0.3)]" :
                             "bg-[#0A0A0A] border-[#1A1A1A]"
                )} style={lang === 'ar' ? { left: 'auto', right: '0.75rem' } : {}}>
                  {complete && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {unlocked && !complete && <div className="w-1.5 h-1.5 rounded-full bg-[#1CB0F6] animate-pulse" />}
                </div>

                {/* Module Card */}
                <div className={cn(
                  "p-6 rounded-2xl border transition-all duration-300",
                  unlocked ? "bg-white/[0.02] border-white/10 hover:border-white/20" : "bg-transparent border-white/5 opacity-40"
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border transition-colors",
                        unlocked ? "bg-white/5 border-white/10" : "bg-white/5 border-transparent"
                      )}>
                        {skill.emoji}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{skill.title}</h3>
                          {complete && (
                            <span className="text-[10px] font-black text-[#1CB0F6] uppercase tracking-widest bg-[#1CB0F6]/10 px-2 py-0.5 rounded-md">
                              {t.done}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#6F6F6F] font-medium max-w-xl leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-[#6F6F6F] uppercase tracking-widest mb-1">Module Progress</p>
                        <p className="text-sm font-bold text-[#F5F5F5]">{prog}%</p>
                      </div>

                      {unlocked && !complete && (
                        <Link
                          href={`/dashboard/skills/${skill.id}`}
                          className="bg-[#1CB0F6] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#14D4F4] transition-all shadow-lg shadow-[#1CB0F6]/10"
                        >
                          {prog > 0 ? t.cont : t.start}
                        </Link>
                      )}

                      {complete && (
                        <Link
                          href={`/dashboard/skills/${skill.id}`}
                          className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                        >
                          Review
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar (Subtle) */}
                  {unlocked && (
                    <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1CB0F6] transition-all duration-1000 ease-out"
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {trackSkills.length === 0 && (
          <div className="text-center py-24 border border-dashed border-white/5 rounded-3xl">
            <p className="text-[#6F6F6F] font-medium">No modules available for this track yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
