'use client'
// components/dashboard/LessonListClient.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const TYPE_ICONS: Record<string, string> = {
  reading:     '📖',
  interactive: '⚡',
  quiz:        '❓',
  video:       '🎬',
  project:     '🏗️',
}

const UI: Record<Language, Record<string, string>> = {
  en: {
    back: '← Skill Tree', lessons: 'Lessons', start: 'Start', continue: 'Continue', completed: '✅ Completed',
    xpReward: 'XP reward', mins: 'min', of: 'of', done: 'done',
    allDone: '🎉 All lessons complete! Great work!',
  },
  ar: {
    back: '← شجرة المهارات', lessons: 'الدروس', start: 'ابدأ', continue: 'استمر', completed: '✅ مكتمل',
    xpReward: 'مكافأة XP', mins: 'دقيقة', of: 'من', done: 'منجز',
    allDone: '🎉 كل الدروس مكتملة! عمل رائع!',
  },
  fr: {
    back: '← Arbre de compétences', lessons: 'Leçons', start: 'Commencer', continue: 'Continuer', completed: '✅ Complété',
    xpReward: 'Récompense XP', mins: 'min', of: 'sur', done: 'terminé',
    allDone: '🎉 Toutes les leçons terminées ! Excellent travail !',
  },
}

interface Lesson {
  id: string; title: string; emoji: string; description: string
  lesson_type: string; xp_reward: number; duration_mins: number; sort_order: number
}
interface Completion {
  lesson_id: string; score_pct: number; time_spent_mins: number; completed_at: string
}
interface SkillProgress {
  progress_pct: number; completed_at: string | null
}

interface Props {
  userId:        string
  skill:         any
  lessons:       Lesson[]
  completions:   Completion[]
  skillProgress: SkillProgress | null
  language:      string
}

export default function LessonListClient({ userId, skill, lessons, completions, skillProgress, language }: Props) {
  const lang = (language || 'en') as Language
  const t    = UI[lang]
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const completedIds = new Set(completions.map(c => c.lesson_id))
  const doneCount    = completions.length
  const pct          = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0
  const allDone      = doneCount >= lessons.length && lessons.length > 0

  return (
    <div className="p-6 lg:p-10 max-w-3xl" dir={dir}>
      {/* Back */}
      <Link href="/dashboard/skills" className="text-muted font-bold text-sm hover:text-white transition-colors mb-6 flex items-center gap-1">
        {t.back}
      </Link>

      {/* Skill header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="text-5xl">{skill.emoji}</div>
        <div>
          <h1 className="font-fredoka text-3xl lg:text-4xl">{skill.title}</h1>
          <p className="text-muted font-semibold text-sm mt-0.5">{skill.description}</p>
        </div>
      </div>

      {/* XP reward */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-bold bg-accent2/15 text-accent2 border border-accent2/25 px-3 py-1 rounded-full">
          +{skill.xp_reward} XP {t.xpReward}
        </span>
        <span className="text-xs font-bold text-muted">
          {doneCount} {t.of} {lessons.length} {t.done}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-card2 rounded-full overflow-hidden mb-8">
        <div
          className="h-full xp-bar-fill rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {allDone && (
        <div className="bg-accent3/10 border border-accent3/30 rounded-2xl p-4 text-center mb-6 font-extrabold text-accent3">
          {t.allDone}
        </div>
      )}

      {/* Lesson list */}
      <h2 className="font-fredoka text-xl mb-5">📚 {t.lessons}</h2>
      <div className="space-y-4">
        {lessons.map((lesson, idx) => {
          const done      = completedIds.has(lesson.id)
          const isFirst   = idx === 0
          // A lesson is unlocked if it's the first, or the previous one is done
          const prevDone  = idx === 0 || completedIds.has(lessons[idx - 1]?.id)
          const isLocked  = !prevDone && !done

          return (
            <div
              key={lesson.id}
              className={cn(
                'bg-card border rounded-2xl p-5 transition-all',
                done    ? 'border-accent3/25 bg-accent3/5' :
                isLocked? 'border-white/5 opacity-50' :
                          'border-white/8 hover:border-white/20 hover:-translate-y-0.5'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Number / done indicator */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm',
                  done    ? 'bg-accent3/20 text-accent3 border border-accent3/30' :
                  isLocked? 'bg-card2 text-muted/40 border border-white/5' :
                            'bg-accent4/15 text-accent4 border border-accent4/25'
                )}>
                  {done ? '✅' : isLocked ? '🔒' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xl">{lesson.emoji}</span>
                    <h3 className="font-extrabold text-sm">{lesson.title}</h3>
                    <span className="text-xs text-muted font-bold">
                      {TYPE_ICONS[lesson.lesson_type]} {lesson.lesson_type}
                    </span>
                  </div>
                  <p className="text-muted text-xs font-semibold leading-relaxed">{lesson.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-accent2">+{lesson.xp_reward} XP</span>
                    <span className="text-xs text-muted font-bold">⏱ {lesson.duration_mins} {t.mins}</span>
                  </div>
                </div>

                {/* CTA */}
                {!isLocked && (
                  <Link
                    href={`/dashboard/skills/${skill.id}/lesson/${lesson.id}`}
                    className={cn(
                      'px-5 py-2.5 rounded-xl font-extrabold text-xs flex-shrink-0 transition-all',
                      done
                        ? 'bg-accent3/15 text-accent3 border border-accent3/25 hover:bg-accent3/25'
                        : 'bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 hover:shadow-lg'
                    )}
                  >
                    {done ? t.completed : isFirst || completedIds.size > 0 ? t.continue : t.start}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
