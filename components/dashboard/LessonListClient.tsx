'use client'
// components/dashboard/LessonListClient.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

// ─── Inline SVG icon set — replaces all literal emoji in the UI chrome ───
type IconKind =
  | 'reading' | 'interactive' | 'quiz' | 'video' | 'project'
  | 'star' | 'clock' | 'library' | 'party' | 'sparkle' | 'lock' | 'check' | 'chevronLeft'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'reading':
      return <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Z"/></svg>
    case 'interactive':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
    case 'quiz':
      return <svg {...common}><path d="M11 18h2v2h-2v-2Zm1-14a5 5 0 0 0-5 5h2a3 3 0 1 1 4.5 2.6c-.9.55-1.5 1.5-1.5 2.4v1h2v-1c0-.4.3-.85.8-1.15A5 5 0 0 0 12 4Z"/></svg>
    case 'video':
      return <svg {...common}><path d="M4 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2.5l4-2.4v11.8l-4-2.4V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/></svg>
    case 'project':
      return <svg {...common}><path d="M21.7 7.3 16.7 2.3 14.6 4.4l1.4 1.4-7.7 7.7-1.4-1.4-2.1 2.1 1.4 1.4-3.4 3.4 1.4 1.4 3.4-3.4 1.4 1.4 2.1-2.1-1.4-1.4 7.7-7.7 1.4 1.4Z"/></svg>
    case 'star':
      return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'clock':
      return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5.4l4 2.4-.75 1.25L11 13V7h2Z"/></svg>
    case 'library':
      return <svg {...common}><path d="M4 4h3v16H4V4Zm5 0h3v16H9V4Zm5 .3 3-.8 4 15.5-3 .8L14 4.3Z"/></svg>
    case 'party':
      return <svg {...common}><path d="M3 21l4-13 13 4-13 4-4 5Zm9-17 1.5 2.6L17 8l-3.6.3L12 11l-1.4-2.7L7 8l3.5-2.4L12 3Z"/></svg>
    case 'sparkle':
      return <svg {...common}><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/></svg>
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'chevronLeft':
      return <svg {...common}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
  }
}

const TYPE_ICON: Record<string, IconKind> = {
  reading:     'reading',
  interactive: 'interactive',
  quiz:        'quiz',
  video:       'video',
  project:     'project',
}

// Each lesson type gets its own color identity, so the list reads as
// "a row of colorful activity cards" rather than a uniform list.
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  reading:     { bg: 'bg-[#1CB0F6]/12', text: 'text-[#1CB0F6]', border: 'border-[#1CB0F6]/25' },
  interactive: { bg: 'bg-[#FAA918]/12', text: 'text-[#FAA918]', border: 'border-[#FAA918]/25' },
  quiz:        { bg: 'bg-[#FF6B6B]/12', text: 'text-[#FF6B6B]', border: 'border-[#FF6B6B]/25' },
  video:       { bg: 'bg-[#A66BFF]/12', text: 'text-[#A66BFF]', border: 'border-[#A66BFF]/25' },
  project:     { bg: 'bg-[#3CB371]/12', text: 'text-[#3CB371]', border: 'border-[#3CB371]/25' },
}
const FALLBACK_TYPE_COLOR = { bg: 'bg-white/8', text: 'text-muted', border: 'border-white/15' }

const UI: Record<Language, Record<string, string>> = {
  en: {
    back: 'Skill Tree', lessons: 'Lessons', start: 'Start', continue: 'Continue', completed: 'Done',
    xpReward: 'XP reward', mins: 'min', of: 'of', done: 'done',
    allDone: 'All lessons complete! Great work!',
    locked: 'Finish the lesson above to unlock this one',
  },
  ar: {
    back: 'شجرة المهارات', lessons: 'الدروس', start: 'ابدأ', continue: 'استمر', completed: 'مكتمل',
    xpReward: 'مكافأة XP', mins: 'دقيقة', of: 'من', done: 'منجز',
    allDone: 'كل الدروس مكتملة! عمل رائع!',
    locked: 'أكمل الدرس السابق لفتح هذا الدرس',
  },
  fr: {
    back: 'Arbre de compétences', lessons: 'Leçons', start: 'Commencer', continue: 'Continuer', completed: 'Fait',
    xpReward: 'Récompense XP', mins: 'min', of: 'sur', done: 'terminé',
    allDone: 'Toutes les leçons terminées ! Excellent travail !',
    locked: 'Termine la leçon précédente pour débloquer celle-ci',
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

// ─── Progress trail: a row of dots/checks instead of a flat bar ───
function ProgressTrail({ lessons, completedIds }: { lessons: Lesson[]; completedIds: Set<string> }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {lessons.map((lesson) => {
        const done = completedIds.has(lesson.id)
        return (
          <div
            key={lesson.id}
            title={lesson.title}
            className={cn(
              'h-2.5 flex-1 min-w-[14px] rounded-full transition-all duration-500',
              done ? 'bg-[#3CB371]' : 'bg-white/10',
            )}
          />
        )
      })}
    </div>
  )
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
    <div className="p-4 md:p-6 lg:p-10 max-w-3xl" dir={dir}>
      {/* Back */}
      <Link
        href="/dashboard/skills"
        className="inline-flex items-center gap-1.5 text-muted font-extrabold text-sm hover:text-white transition-colors mb-5 md:mb-6 group"
      >
        <Icon kind="chevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        {t.back}
      </Link>

      {/* Skill header */}
      <div className="flex items-center gap-3 md:gap-4 mb-3">
        <div
          aria-hidden
          className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-3xl md:text-4xl shrink-0 shadow-[0_4px_0_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: '#1CB0F6' }}
        >
          {skill.emoji}
        </div>
        <div className="min-w-0">
          <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl leading-tight">{skill.title}</h1>
          <p className="text-muted font-semibold text-xs md:text-sm mt-0.5 line-clamp-2">{skill.description}</p>
        </div>
      </div>

      {/* XP reward + progress count */}
      <div className="flex items-center gap-2 md:gap-3 mb-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-black bg-[#FAA918]/15 text-[#FAA918] border border-[#FAA918]/30 px-3 py-1.5 rounded-full">
          <Icon kind="star" className="w-3.5 h-3.5" /> +{skill.xp_reward} XP {t.xpReward}
        </span>
        <span className="text-xs font-black text-muted bg-white/5 px-3 py-1.5 rounded-full">
          {doneCount} {t.of} {lessons.length} {t.done}
        </span>
      </div>

      {/* Progress trail */}
      <div className="mb-6 md:mb-8">
        <ProgressTrail lessons={lessons} completedIds={completedIds} />
      </div>

      {allDone && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#3CB371]/15 to-[#1CB0F6]/15 border-2 border-[#3CB371]/40 rounded-3xl p-5 text-center mb-6 md:mb-8">
          <Icon kind="party" className="w-9 h-9 mx-auto mb-2 text-[#3CB371]" />
          <p className="font-fredoka text-[#3CB371] text-base md:text-lg">{t.allDone}</p>
        </div>
      )}

      {/* Lesson list */}
      <h2 className="font-fredoka text-lg md:text-xl mb-4 md:mb-5 flex items-center gap-2">
        <Icon kind="library" className="w-5 h-5 text-[#1CB0F6]" /> {t.lessons}
      </h2>

      <div className="space-y-3 md:space-y-4">
        {lessons.map((lesson, idx) => {
          const done       = completedIds.has(lesson.id)
          const isFirst    = idx === 0
          const prevDone   = idx === 0 || completedIds.has(lessons[idx - 1]?.id)
          const isLocked   = !prevDone && !done
          const typeColor  = TYPE_COLORS[lesson.lesson_type] ?? FALLBACK_TYPE_COLOR
          const typeIcon   = TYPE_ICON[lesson.lesson_type] ?? 'sparkle'

          return (
            <div
              key={lesson.id}
              className={cn(
                'relative rounded-3xl p-4 md:p-5 border-2 transition-all duration-150',
                done
                  ? 'bg-[#3CB371]/8 border-[#3CB371]/35'
                  : isLocked
                  ? 'bg-card border-white/5 opacity-55'
                  : 'bg-card border-white/10 hover:border-[#1CB0F6]/50 hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.2)]',
              )}
            >
              <div className="flex items-start gap-3 md:gap-4">
                {/* Number / status indicator — chunky disc */}
                <div
                  className={cn(
                    'w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base shadow-[0_3px_0_rgba(0,0,0,0.2)]',
                    done     ? 'bg-[#3CB371] text-white' :
                    isLocked ? 'bg-white/5 text-muted/40' :
                               'bg-[#1CB0F6] text-white',
                  )}
                >
                  {done ? (
                    <Icon kind="check" className="w-5 h-5" />
                  ) : isLocked ? (
                    <Icon kind="lock" className="w-[18px] h-[18px]" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5 mb-1 flex-wrap">
                    <span className="text-lg md:text-xl leading-none mt-0.5" aria-hidden>{lesson.emoji}</span>
                    <h3 className="font-extrabold text-sm md:text-[15px] leading-snug">{lesson.title}</h3>
                  </div>

                  {/* Type badge — colored per lesson type */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border mb-2',
                      typeColor.bg, typeColor.text, typeColor.border,
                    )}
                  >
                    <Icon kind={typeIcon} className="w-3 h-3" /> {lesson.lesson_type}
                  </span>

                  <p className="text-muted text-xs font-semibold leading-relaxed mb-3">{lesson.description}</p>

                  {/* Meta row: XP + duration + CTA */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#FAA918] flex items-center gap-1">
                        <Icon kind="star" className="w-3.5 h-3.5" /> +{lesson.xp_reward} XP
                      </span>
                      <span className="text-xs text-muted font-bold flex items-center gap-1">
                        <Icon kind="clock" className="w-3.5 h-3.5" /> {lesson.duration_mins} {t.mins}
                      </span>
                    </div>

                    {!isLocked && (
                      <Link
                        href={`/dashboard/skills/${skill.id}/lesson/${lesson.id}`}
                        className={cn(
                          'px-4 py-2 rounded-2xl font-black text-xs shrink-0 transition-all touch-manipulation',
                          'active:translate-y-0.5 active:shadow-none',
                          done
                            ? 'bg-[#3CB371]/15 text-[#3CB371] border border-[#3CB371]/30 hover:bg-[#3CB371]/25'
                            : 'bg-[#1CB0F6] text-white shadow-[0_3px_0_rgba(0,0,0,0.25)] hover:bg-[#14D4F4]',
                        )}
                      >
                        {done ? t.completed : isFirst || completedIds.size > 0 ? t.continue : t.start}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtle lock hint, only for locked cards */}
              {isLocked && (
                <p className="text-[11px] font-bold text-muted/60 mt-3 ml-[52px] md:ml-[56px] flex items-center gap-1">
                  <Icon kind="lock" className="w-3 h-3" /> {t.locked}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}