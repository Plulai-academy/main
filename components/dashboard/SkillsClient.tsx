'use client'
// components/dashboard/SkillsClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { cn, getTrackColor } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<Language, Record<string, string>> = {
  en: {
    title: 'Skill Tree', sub: 'Unlock skills, earn XP, build your knowledge!',
    start: '▶ Start', cont: '▶ Continue', done: '✅ Complete',
    locked: '🔒 Locked', lessons: 'lessons', complete: 'complete',
    needs: 'Complete first:', xpLabel: 'XP',
  },
  ar: {
    title: 'شجرة المهارات', sub: 'افتح المهارات، اكسب XP، ابنِ معرفتك!',
    start: '▶ ابدأ', cont: '▶ استمر', done: '✅ مكتمل',
    locked: '🔒 مقفل', lessons: 'دروس', complete: 'مكتمل',
    needs: 'أكمل أولاً:', xpLabel: 'XP',
  },
  fr: {
    title: 'Arbre de Compétences', sub: 'Débloque des compétences, gagne des XP, construis tes connaissances !',
    start: '▶ Commencer', cont: '▶ Continuer', done: '✅ Terminé',
    locked: '🔒 Verrouillé', lessons: 'leçons', complete: 'complété',
    needs: 'Complète d\'abord :', xpLabel: 'XP',
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

  const tc = getTrackColor(activeTrack)

  return (
    <div className="p-6 lg:p-10 max-w-3xl" dir={dir}>
      <h1 className="font-fredoka text-3xl lg:text-4xl mb-1">🗺️ {t.title}</h1>
      <p className="text-muted font-semibold mb-7">{t.sub}</p>

      {/* Track tabs */}
      <div className="flex gap-2 mb-8 bg-card rounded-2xl p-2 border border-white/5 flex-wrap">
        {tracks.map(track => {
          const c = getTrackColor(track.id)
          return (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={cn(
                'flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all',
                activeTrack === track.id ? `${c.bg} ${c.text} border ${c.border}` : 'text-muted hover:text-white'
              )}
            >
              <span>{track.emoji}</span>
              <span className="hidden sm:inline">{track.name}</span>
            </button>
          )
        })}
      </div>

      {/* Skill nodes */}
      <div className="relative space-y-0">
        {trackSkills.map((skill, idx) => {
          const unlocked = isUnlocked(skill)
          const complete = isComplete(skill.id)
          const prog     = progressMap[skill.id] ?? 0
          const lCount   = lessonCountMap[skill.id] ?? 3
          const blockers = skill.required_nodes
            .filter(r => (progressMap[r] ?? 0) < 100)
            .map(r => skills.find(s => s.id === r)?.title)
            .filter(Boolean)

          return (
            <div key={skill.id} className="relative">
              {/* Vertical connector */}
              {idx < trackSkills.length - 1 && (
                <div className={cn('absolute left-8 top-full w-0.5 h-8 z-0', complete ? 'bg-accent3/50' : 'bg-white/8')}
                  style={lang === 'ar' ? { left: 'auto', right: '2rem' } : {}} />
              )}

              <div className={cn(
                'relative z-10 flex gap-4 mb-8 p-5 rounded-3xl border transition-all',
                complete  ? 'bg-accent3/8 border-accent3/25' :
                unlocked  ? `${tc.bg} ${tc.border} hover:scale-[1.01] cursor-pointer` :
                            'bg-card2/50 border-white/5 opacity-55'
              )}>
                {/* Icon */}
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border',
                  complete ? 'bg-accent3/15 border-accent3/30' :
                  unlocked ? `${tc.bg} ${tc.border}` :
                             'bg-card2 border-white/10 grayscale'
                )}>
                  {complete ? '✅' : skill.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-base">{skill.title}</h3>
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0',
                      complete ? 'bg-accent3/15 text-accent3' :
                      unlocked ? `${tc.bg} ${tc.text}` :
                                 'bg-card2 text-muted'
                    )}>
                      {complete ? t.done : unlocked ? `+${skill.xp_reward} ${t.xpLabel}` : t.locked}
                    </span>
                  </div>

                  <p className="text-muted text-xs font-semibold mb-3 leading-relaxed">{skill.description}</p>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-black/20 rounded-full overflow-hidden mb-3">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', complete ? 'bg-accent3' : 'xp-bar-fill')}
                      style={{ width: `${prog}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs text-muted font-bold">{lCount} {t.lessons} · {prog}% {t.complete}</span>

                    {unlocked && !complete && (
                      <Link
                        href={`/dashboard/skills/${skill.id}`}
                        className={cn(
                          'text-xs font-extrabold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5',
                          activeTrack === 'coding'   ? 'bg-gradient-to-r from-accent4 to-accent5 text-white' :
                          activeTrack === 'ai'       ? 'bg-gradient-to-r from-accent5 to-accent1 text-white' :
                                                       'bg-gradient-to-r from-accent3 to-accent4 text-white'
                        )}
                      >
                        {prog === 0 ? t.start : t.cont}
                      </Link>
                    )}

                    {complete && (
                      <Link
                        href={`/dashboard/skills/${skill.id}`}
                        className="text-xs font-extrabold px-4 py-2 rounded-xl bg-accent3/15 text-accent3 border border-accent3/25 hover:bg-accent3/25 transition-all"
                      >
                        {t.done} →
                      </Link>
                    )}

                    {!unlocked && blockers.length > 0 && (
                      <span className="text-xs text-muted font-bold">{t.needs} {blockers.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {trackSkills.length === 0 && (
          <div className="text-center py-16 text-muted font-semibold">
            {lang === 'ar' ? 'لا توجد مهارات لهذا المسار حتى الآن.' : lang === 'fr' ? 'Pas encore de compétences pour cette piste.' : 'No skills available for this track yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
