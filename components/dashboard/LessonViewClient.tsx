'use client'
// components/dashboard/LessonViewClient.tsx
import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { completeLesson, addXP, updateSkillProgress, checkAndAwardBadges, updateStreak } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import LessonFeedback from '@/components/dashboard/LessonFeedback'

const UI: Record<string, Record<string, string>> = {
  en: {
    back: '← Lessons', complete: '✅ Mark Complete', completed: '✅ Done!',
    next: 'Next Lesson', finish: '🎉 Finish Skill!', quiz: 'Quick Check',
    correct: '✅ Correct! Great job!', wrong: '❌ Not quite — try again!',
    xpEarned: 'XP earned!', levelUp: 'Level Up!', tryAgain: 'Try Again',
    submit: 'Submit Answer', askCoach: '🤖 Ask AI Coach',
    reading: 'Reading', code: 'Code Example', analogy: '💡 Think of it this way',
    tip: '💡 Pro Tip', completedBefore: '✅ Already Completed',
    progress: 'Your Progress', lesson: 'Lesson',
    steps: 'Step-by-Step', challenge: '🎯 Challenge', callout_note: '📝 Note',
    callout_warning: '⚠️ Warning', callout_danger: '🚫 Important',
    comparison: 'Before vs After', checklist: 'Checklist',
    video: 'Video', image: 'Diagram',
    checkAll: 'Check all items before continuing',
    codeViewer: '🐍 Python Code',
    copyCode: 'Copy', copied: 'Copied!',
    website: '🔗 Interactive Resource',
    openSite: 'Open in new tab',
    external: 'External Activity',
    externalDesc: 'This activity takes place on another platform. Complete it there, then come back and mark this lesson done.',
    externalBtn: 'Open Activity',
    externalDone: "Done? Come back here and mark complete ↓",
  },
  ar: {
    back: '← الدروس', complete: '✅ علّم كمكتمل', completed: '✅ تم!',
    next: 'الدرس التالي', finish: '🎉 أكمل المهارة!', quiz: 'اختبار سريع',
    correct: '✅ صحيح! عمل رائع!', wrong: '❌ ليس تماماً — حاول مجدداً!',
    xpEarned: 'XP مكتسب!', levelUp: 'ترقية المستوى!', tryAgain: 'حاول مجدداً',
    submit: 'أرسل الإجابة', askCoach: '🤖 اسأل المدرب الذكي',
    reading: 'قراءة', code: 'مثال كودي', analogy: '💡 فكر بهذه الطريقة',
    tip: '💡 نصيحة احترافية', completedBefore: '✅ مكتمل بالفعل',
    progress: 'تقدمك', lesson: 'درس',
    steps: 'خطوة بخطوة', challenge: '🎯 تحدي', callout_note: '📝 ملاحظة',
    callout_warning: '⚠️ تحذير', callout_danger: '🚫 مهم',
    comparison: 'قبل وبعد', checklist: 'قائمة التحقق',
    video: 'فيديو', image: 'رسم توضيحي',
    checkAll: 'تحقق من جميع العناصر قبل المتابعة',
    codeViewer: '🐍 كود Python',
    copyCode: 'نسخ', copied: 'تم النسخ!',
    website: '🔗 مورد تفاعلي',
    openSite: 'فتح في تبويب جديد',
    external: 'نشاط خارجي',
    externalDesc: 'يتم هذا النشاط على منصة أخرى. أكمله هناك، ثم عد وعلّم الدرس كمكتمل.',
    externalBtn: 'فتح النشاط',
    externalDone: 'انتهيت؟ عد هنا وعلّم الدرس كمكتمل ↓',
  },
  fr: {
    back: '← Leçons', complete: '✅ Marquer terminé', completed: '✅ Fait !',
    next: 'Leçon suivante', finish: '🎉 Terminer !', quiz: 'Vérification rapide',
    correct: '✅ Correct ! Super boulot !', wrong: '❌ Pas tout à fait — réessaie !',
    xpEarned: 'XP gagné !', levelUp: 'Niveau supérieur !', tryAgain: 'Réessayer',
    submit: 'Soumettre', askCoach: '🤖 Demander au Coach IA',
    reading: 'Lecture', code: 'Exemple de code', analogy: '💡 Imagine ça ainsi',
    tip: '💡 Conseil pro', completedBefore: '✅ Déjà complété',
    progress: 'Ta progression', lesson: 'Leçon',
    steps: 'Étape par étape', challenge: '🎯 Défi', callout_note: '📝 Note',
    callout_warning: '⚠️ Attention', callout_danger: '🚫 Important',
    comparison: 'Avant / Après', checklist: 'Liste de contrôle',
    video: 'Vidéo', image: 'Schéma',
    checkAll: 'Coche tous les éléments avant de continuer',
    codeViewer: '🐍 Code Python',
    copyCode: 'Copier', copied: 'Copié !',
    website: '🔗 Ressource interactive',
    openSite: 'Ouvrir dans un nouvel onglet',
    external: 'Activité externe',
    externalDesc: "Cette activité se déroule sur une autre plateforme. Complète-la là-bas, puis reviens ici pour marquer la leçon terminée.",
    externalBtn: "Ouvrir l'activité",
    externalDone: 'Terminé ? Reviens ici et marque la leçon complète ↓',
  },
}

interface Section {
  type: string
  // shared
  text?: string
  // code / code_editor
  language?: string
  starter?: string
  instructions?: string
  expected_output?: string
  // quiz
  question?: string
  options?: string[]
  correct?: number
  explanation?: string
  // steps
  items?: string[]
  // challenge
  title?: string
  hint?: string
  // callout
  variant?: 'note' | 'warning' | 'danger' | 'success'
  // comparison
  before?: string
  after?: string
  before_label?: string
  after_label?: string
  // checklist
  checks?: string[]
  // video
  url?: string
  caption?: string
  // image
  src?: string
  alt?: string
  // website embed
  embed_url?: string
  height?: number
  // external activity
  platform?: string   // e.g. "Jupyter", "Code.org", "Replit", "Scratch"
  button_label?: string
}

interface Props {
  userId:       string
  lesson:       any
  skill:        any
  completion:   any
  totalLessons: number
  lessonIndex:  number
  prevLesson:   any
  nextLesson:   any
  language:     string
  userName:     string
  userAvatar?:  string
}

export default function LessonViewClient({
  userId, lesson, skill, completion, totalLessons, lessonIndex,
  prevLesson, nextLesson, language, userName, userAvatar = '🧑‍🚀',
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast]         = useState<string | null>(null)
  const [levelUp, setLevelUp]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const [quizState, setQuiz]      = useState<Record<number, { selected: number | null; submitted: boolean }>>({})
  const [checkState, setChecks]   = useState<Record<number, boolean[]>>({})
  const [copiedIdx, setCopied]    = useState<number | null>(null)
  const [justCompleted, setJustCompleted] = useState(false)
  const [showFeedback, setShowFeedback]   = useState(false)

  const lang  = language || 'en'
  const t     = UI[lang] ?? UI.en
  const dir   = lang === 'ar' ? 'rtl' : 'ltr'
  const isDone = !!completion || justCompleted

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  let sections: Section[] = []
  try {
    const raw = typeof lesson.content_json === 'string'
      ? JSON.parse(lesson.content_json)
      : lesson.content_json
    sections = raw?.sections ?? []
  } catch { sections = [] }

  const selectOption = (secIdx: number, optIdx: number) => {
    if (quizState[secIdx]?.submitted) return
    setQuiz((prev: Record<number, { selected: number | null; submitted: boolean }>) => ({ ...prev, [secIdx]: { selected: optIdx, submitted: false } }))
  }
  const submitQuiz = (secIdx: number) => {
    setQuiz((prev: Record<number, { selected: number | null; submitted: boolean }>) => ({ ...prev, [secIdx]: { ...prev[secIdx], submitted: true } }))
  }

  const toggleCheck = (secIdx: number, itemIdx: number, total: number) => {
    setChecks((prev: Record<number, boolean[]>) => {
      const arr  = prev[secIdx] ?? Array(total).fill(false)
      const next = [...arr]
      next[itemIdx] = !next[itemIdx]
      return { ...prev, [secIdx]: next }
    })
  }

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(idx)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const quizSections      = sections.map((s, i) => ({ s, i })).filter(x => x.s.type === 'quiz')
  const allQuizzesPassed  = quizSections.every(({ s, i }) => {
    const state = quizState[i]
    return state?.submitted && state.selected === s.correct
  })
  const checklistSections = sections.map((s, i) => ({ s, i })).filter(x => x.s.type === 'checklist')
  const allChecklistsDone = checklistSections.every(({ s, i }) => {
    const arr = checkState[i] ?? []
    return (s.checks ?? []).every((_, ci) => arr[ci] === true)
  })
  const canComplete = allQuizzesPassed && allChecklistsDone

  const markComplete = () => {
    if (isDone) return
    startTransition(async () => {
      const score = quizSections.length > 0 ? (allQuizzesPassed ? 100 : 70) : 100
      await completeLesson(userId, lesson.id, score, lesson.duration_mins)
      await updateStreak(userId)
      const result = await addXP(userId, lesson.xp_reward, 'lesson_complete', lesson.id)
      const pct = Math.min(100, Math.round((lessonIndex / totalLessons) * 100))
      await updateSkillProgress(userId, skill.id, pct)
      if (!nextLesson && pct >= 100) {
        await addXP(userId, skill.xp_reward, 'skill_complete', skill.id)
      }
      await checkAndAwardBadges(userId)
      setJustCompleted(true)
      setShowFeedback(true)
      showToast(`⚡ +${lesson.xp_reward} ${t.xpEarned}`)
      if (result.data && result.data.leveledUp) {
        const rd = result.data as any
        setLevelUp(`🎊 ${t.levelUp} Level ${rd.newLevel}!`)
        setTimeout(() => setLevelUp(null), 4000)
        setTimeout(() => setShareCard({
          type: 'level', childName: userName, childAvatar: userAvatar,
          newLevel: rd.newLevel, levelTitle: rd.levelTitle ?? '',
          totalXP: rd.totalXP ?? undefined,
        }), 1200)
      }
      if (!nextLesson && pct >= 100) {
        setTimeout(() => setShareCard({
          type: 'skill', childName: userName, childAvatar: userAvatar,
          skillName: skill.title, skillEmoji: skill.emoji, trackName: skill.track_id,
          xpEarned: (lesson.xp_reward ?? 0) + (skill.xp_reward ?? 0),
        }), levelUp ? 5000 : 800)
      }
      router.refresh()
    })
  }

  // ── Embed URL helpers ─────────────────────────────────────
  const getYouTubeEmbed = (url: string) => {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1` : null
  }

  const getVideoEmbed = (url: string): string | null => {
    // YouTube
    const yt = getYouTubeEmbed(url)
    if (yt) return yt
    // Vimeo
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?byline=0&portrait=0`
    // Already an embed URL
    if (url.includes('/embed/') || url.includes('player.')) return url
    return null
  }

  const renderSection = (s: Section, idx: number) => {
    switch (s.type) {

      // ── INTRO / READING ──────────────────────────────────
      case 'intro':
      case 'reading':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📖</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.reading}</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">{s.text}</p>
          </div>
        )

      // ── ANALOGY ──────────────────────────────────────────
      case 'analogy':
        return (
          <div key={idx} className="bg-gradient-to-br from-accent4/10 to-accent5/10 border border-accent4/25 rounded-2xl p-6">
            <p className="font-extrabold text-sm mb-2 text-accent4">{t.analogy}</p>
            <p className="text-sm font-semibold leading-relaxed">{s.text}</p>
          </div>
        )

      // ── TIP ──────────────────────────────────────────────
      case 'tip':
        return (
          <div key={idx} className="bg-accent2/8 border border-accent2/25 rounded-2xl p-5 flex gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="font-extrabold text-xs text-accent2 mb-1">{t.tip}</p>
              <p className="text-sm font-semibold leading-relaxed">{s.text}</p>
            </div>
          </div>
        )

      // ── CODE (static display) ─────────────────────────────
      case 'code':
        return (
          <div key={idx} className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-bold text-muted flex-1">{t.code} — {s.language ?? 'code'}</span>
            </div>
            {s.instructions && (
              <p className="px-5 pt-4 text-xs text-accent4/80 font-semibold italic">{s.instructions}</p>
            )}
            <pre className="px-5 py-4 text-sm font-mono text-green-400 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
              {s.starter}
            </pre>
            <div className="px-5 pb-4">
              <Link
                href={`/dashboard/coach?topic=${encodeURIComponent(lesson.title)}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-accent5 hover:text-white transition-colors"
              >
                🤖 {lang === 'ar' ? 'اسأل المدرب عن هذا الكود' : lang === 'fr' ? "Demander au Coach d'expliquer" : 'Ask AI Coach to explain this'}
              </Link>
            </div>
          </div>
        )

      // ── CODE VIEWER (read-only with copy) ─────────────────
      // Replaces the old interactive code_editor — no execution needed
      case 'code_editor':
        return (
          <div key={idx} className="bg-[#0b0b16] border border-emerald-500/20 rounded-2xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex-1">{t.codeViewer}</span>
              <button
                onClick={() => copyCode(s.starter ?? '', idx)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                  copiedIdx === idx
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white border border-white/8'
                )}
              >
                {copiedIdx === idx ? `✓ ${t.copied}` : `⎘ ${t.copyCode}`}
              </button>
            </div>

            {/* Instructions banner */}
            {s.instructions && (
              <div className="px-5 py-3 bg-emerald-500/5 border-b border-emerald-500/10">
                <p className="text-xs text-emerald-300/80 font-semibold leading-relaxed">
                  📋 {s.instructions}
                </p>
              </div>
            )}

            {/* Code with line numbers */}
            <div className="flex overflow-x-auto">
              {/* Line numbers */}
              <div className="select-none px-4 py-5 text-right border-r border-white/5 bg-white/1 flex-shrink-0">
                {(s.starter ?? '').split('\n').map((_, i) => (
                  <div key={i} className="text-xs font-mono text-white/15 leading-6">{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <pre className="flex-1 px-5 py-5 text-sm font-mono text-green-300 leading-6 whitespace-pre break-words min-w-0">
                {s.starter}
              </pre>
            </div>

            {/* Hint */}
            {s.hint && (
              <div className="px-5 py-3 border-t border-white/5 bg-amber-500/5">
                <p className="text-xs text-amber-300/80 font-semibold">
                  💡 {s.hint}
                </p>
              </div>
            )}

            {/* Ask AI Coach */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/20 font-mono">Python 3.10</span>
              <Link
                href={`/dashboard/coach?topic=${encodeURIComponent(lesson.title)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent5 hover:text-white transition-colors"
              >
                🤖 {lang === 'ar' ? 'اسأل المدرب' : lang === 'fr' ? 'Demander au Coach' : 'Ask AI Coach'}
              </Link>
            </div>
          </div>
        )

      // ── QUIZ ─────────────────────────────────────────────
      case 'quiz': {
        const state     = quizState[idx] ?? { selected: null, submitted: false }
        const isCorrect = state.submitted && state.selected === s.correct
        const isWrong   = state.submitted && state.selected !== s.correct
        return (
          <div key={idx} className={cn(
            'rounded-2xl p-6 border transition-all',
            isCorrect ? 'bg-accent3/8 border-accent3/30' :
            isWrong   ? 'bg-red-500/5 border-red-500/20' :
                        'bg-card border-accent5/25'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{isCorrect ? '✅' : isWrong ? '❌' : '❓'}</span>
              <span className="text-xs font-bold text-accent5 uppercase tracking-wider">{t.quiz}</span>
            </div>
            <p className="font-extrabold text-sm mb-5 leading-relaxed">{s.question}</p>
            <div className="space-y-3 mb-5">
              {(s.options ?? []).map((opt, oi) => {
                let cls = 'border-white/8 bg-card2 text-muted hover:border-white/25 hover:text-white cursor-pointer'
                if (state.submitted) {
                  if (oi === s.correct)           cls = 'border-accent3/60 bg-accent3/15 text-accent3 cursor-default'
                  else if (state.selected === oi) cls = 'border-red-500/40 bg-red-500/10 text-red-400 cursor-default'
                  else                            cls = 'border-white/5 bg-card2/50 text-muted/50 cursor-default'
                } else if (state.selected === oi) {
                  cls = 'border-accent5/50 bg-accent5/15 text-white cursor-pointer'
                }
                return (
                  <button key={oi} onClick={() => selectOption(idx, oi)} disabled={state.submitted}
                    className={cn('w-full text-start px-5 py-3.5 rounded-xl text-sm font-bold border transition-all', cls)}>
                    <span className="font-extrabold mr-3 text-muted/60">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {!state.submitted ? (
              <button onClick={() => submitQuiz(idx)} disabled={state.selected === null}
                className="px-6 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {t.submit}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className={cn('text-sm font-extrabold', isCorrect ? 'text-accent3' : 'text-red-400')}>
                    {isCorrect ? t.correct : t.wrong}
                  </p>
                  {isWrong && (
                    <button onClick={() => setQuiz((prev: Record<number, { selected: number | null; submitted: boolean }>) => ({ ...prev, [idx]: { selected: null, submitted: false } }))}
                      className="text-xs font-bold text-muted hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
                      ↩ {t.tryAgain}
                    </button>
                  )}
                </div>
                {s.explanation && (
                  <div className="mt-3 bg-white/4 border border-white/8 rounded-xl p-4">
                    <p className="text-xs font-bold text-accent2 mb-1">
                      {lang === 'ar' ? 'الشرح' : lang === 'fr' ? 'Explication' : 'Explanation'}
                    </p>
                    <p className="text-sm text-muted font-semibold leading-relaxed">{s.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }

      // ── STEPS ────────────────────────────────────────────
      case 'steps':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">🪜</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.steps}</span>
            </div>
            {s.text && <p className="text-sm font-semibold text-muted mb-4 leading-relaxed">{s.text}</p>}
            <ol className="space-y-3">
              {(s.items ?? []).map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent4 to-accent5 flex items-center justify-center text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold leading-relaxed pt-0.5">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        )

      // ── CHALLENGE ────────────────────────────────────────
      case 'challenge':
        return (
          <div key={idx} className="bg-gradient-to-br from-accent2/8 to-accent1/8 border-2 border-accent2/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <span className="text-xs font-extrabold text-accent2 uppercase tracking-wider">{t.challenge}</span>
            </div>
            {s.title && <p className="font-extrabold text-base mb-2">{s.title}</p>}
            <p className="text-sm font-semibold leading-relaxed mb-4">{s.text}</p>
            {s.expected_output && (
              <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-muted mb-2">
                  {lang === 'ar' ? 'النتيجة المتوقعة:' : lang === 'fr' ? 'Résultat attendu :' : 'Expected output:'}
                </p>
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{s.expected_output}</pre>
              </div>
            )}
            {s.hint && (
              <details className="mt-2">
                <summary className="text-xs font-bold text-accent5 cursor-pointer hover:text-white transition-colors select-none">
                  💬 {lang === 'ar' ? 'تلميح' : lang === 'fr' ? 'Indice' : 'Hint'}
                </summary>
                <p className="text-sm text-muted font-semibold mt-2 leading-relaxed pl-4 border-l-2 border-accent5/30">
                  {s.hint}
                </p>
              </details>
            )}
            <div className="mt-4">
              <Link href={`/dashboard/coach?topic=${encodeURIComponent(s.title ?? lesson.title)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-accent2/15 text-accent2 border border-accent2/25 hover:bg-accent2/25 transition-all">
                🤖 {lang === 'ar' ? 'اطلب مساعدة المدرب' : lang === 'fr' ? "Aide du Coach IA" : 'Get help from AI Coach'}
              </Link>
            </div>
          </div>
        )

      // ── CALLOUT ──────────────────────────────────────────
      case 'callout': {
        const variant = s.variant ?? 'note'
        const styles = {
          note:    { bg: 'bg-blue-500/8',   border: 'border-blue-500/25',   icon: '📝', text: 'text-blue-400',   label: t.callout_note },
          warning: { bg: 'bg-yellow-500/8', border: 'border-yellow-500/25', icon: '⚠️', text: 'text-yellow-400', label: t.callout_warning },
          danger:  { bg: 'bg-red-500/8',    border: 'border-red-500/25',    icon: '🚫', text: 'text-red-400',    label: t.callout_danger },
          success: { bg: 'bg-accent3/8',    border: 'border-accent3/25',    icon: '✅', text: 'text-accent3',    label: '✅ Good to know' },
        }
        const st = styles[variant] ?? styles.note
        return (
          <div key={idx} className={cn('rounded-2xl p-5 border flex gap-4', st.bg, st.border)}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{st.icon}</span>
            <div>
              <p className={cn('font-extrabold text-xs mb-1.5 uppercase tracking-wider', st.text)}>{st.label}</p>
              <p className="text-sm font-semibold leading-relaxed">{s.text}</p>
            </div>
          </div>
        )
      }

      // ── COMPARISON ───────────────────────────────────────
      case 'comparison':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/8 flex items-center gap-2">
              <span className="text-sm">🔄</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.comparison}</span>
            </div>
            {s.text && <p className="px-5 pt-4 text-sm font-semibold text-muted leading-relaxed">{s.text}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-white/8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xs">✗</span>
                  <span className="text-xs font-extrabold text-red-400 uppercase">{s.before_label ?? (lang === 'ar' ? 'قبل' : lang === 'fr' ? 'Avant' : 'Before')}</span>
                </div>
                <pre className="text-xs font-mono text-red-400/80 bg-red-500/5 border border-red-500/15 rounded-xl p-4 whitespace-pre-wrap break-words leading-relaxed">
                  {s.before}
                </pre>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-accent3/20 border border-accent3/40 flex items-center justify-center text-xs text-accent3">✓</span>
                  <span className="text-xs font-extrabold text-accent3 uppercase">{s.after_label ?? (lang === 'ar' ? 'بعد' : lang === 'fr' ? 'Après' : 'After')}</span>
                </div>
                <pre className="text-xs font-mono text-accent3/80 bg-accent3/5 border border-accent3/15 rounded-xl p-4 whitespace-pre-wrap break-words leading-relaxed">
                  {s.after}
                </pre>
              </div>
            </div>
          </div>
        )

      // ── CHECKLIST ────────────────────────────────────────
      case 'checklist': {
        const checks  = s.checks ?? []
        const states  = checkState[idx] ?? Array(checks.length).fill(false)
        const allDone = checks.every((_, i) => states[i])
        return (
          <div key={idx} className={cn(
            'rounded-2xl p-6 border transition-all',
            allDone ? 'bg-accent3/8 border-accent3/30' : 'bg-card border-white/8'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{allDone ? '✅' : '☑️'}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.checklist}</span>
            </div>
            {s.text && <p className="text-sm font-semibold text-muted mb-4 leading-relaxed">{s.text}</p>}
            <div className="space-y-3">
              {checks.map((item, i) => (
                <button key={i} onClick={() => toggleCheck(idx, i, checks.length)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold text-start transition-all',
                    states[i]
                      ? 'bg-accent3/10 border-accent3/30 text-accent3'
                      : 'bg-card2 border-white/8 text-muted hover:border-white/20 hover:text-white'
                  )}>
                  <span className={cn(
                    'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all',
                    states[i] ? 'bg-accent3 border-accent3 text-white' : 'border-white/20'
                  )}>
                    {states[i] && <span className="text-xs font-extrabold">✓</span>}
                  </span>
                  <span className={cn(states[i] && 'line-through opacity-70')}>{item}</span>
                </button>
              ))}
            </div>
            {allDone && (
              <p className="text-xs font-extrabold text-accent3 mt-4">
                {lang === 'ar' ? '🎉 أحسنت! اكتملت جميع العناصر' : lang === 'fr' ? '🎉 Bravo ! Tout est coché !' : '🎉 All done!'}
              </p>
            )}
          </div>
        )
      }

      // ── VIDEO (YouTube, Vimeo, or any embed URL) ──────────
      case 'video': {
        const embedUrl = s.url ? getVideoEmbed(s.url) : null
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
              <span className="text-sm">▶️</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.video}</span>
              {s.caption && (
                <span className="text-xs text-muted/60 font-semibold ml-auto truncate max-w-[60%]">{s.caption}</span>
              )}
            </div>
            {embedUrl ? (
              <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={s.caption ?? 'Lesson video'}
                  loading="lazy"
                />
              </div>
            ) : (
              // Non-embeddable URL — open in new tab
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">▶️</div>
                <p className="text-sm font-semibold text-muted mb-4">
                  {lang === 'ar' ? 'انقر لمشاهدة الفيديو' : lang === 'fr' ? 'Cliquez pour voir la vidéo' : 'Click to watch the video'}
                </p>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-red-600/20 text-red-400 border border-red-500/25 hover:bg-red-600/30 transition-all">
                  ▶️ {lang === 'ar' ? 'مشاهدة الفيديو' : lang === 'fr' ? 'Voir la vidéo' : 'Watch Video'} ↗
                </a>
              </div>
            )}
          </div>
        )
      }

      // ── WEBSITE EMBED ─────────────────────────────────────
      // Insert any URL — shows in an iframe inside the lesson.
      // Use embed_url for the iframe src, url for the "open in new tab" fallback.
      // Set height (default 500px). Not all sites allow embedding (X-Frame-Options).
      case 'website': {
        const iframeSrc  = s.embed_url ?? s.url ?? ''
        const frameHeight = s.height ?? 500
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-card2">
              <span className="text-sm">🔗</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider flex-1">{t.website}</span>
              {(s.url ?? s.embed_url) && (
                <a
                  href={s.url ?? s.embed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-accent5 hover:text-white transition-colors flex-shrink-0"
                >
                  ↗ {t.openSite}
                </a>
              )}
            </div>

            {/* Title / caption */}
            {s.caption && (
              <div className="px-5 py-2 border-b border-white/5 bg-white/1">
                <p className="text-xs font-semibold text-muted">{s.caption}</p>
              </div>
            )}

            {/* Fake browser chrome */}
            <div className="px-4 py-2 bg-white/3 border-b border-white/5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs font-mono text-muted/50 truncate">
                {iframeSrc}
              </div>
            </div>

            {/* The iframe */}
            {iframeSrc ? (
              <iframe
                src={iframeSrc}
                style={{ height: frameHeight }}
                className="w-full border-0 block"
                title={s.caption ?? 'Interactive resource'}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center text-muted text-sm font-semibold" style={{ height: frameHeight }}>
                No URL provided
              </div>
            )}

            {/* Description */}
            {s.text && (
              <div className="px-5 py-4 border-t border-white/5">
                <p className="text-xs font-semibold text-muted leading-relaxed">{s.text}</p>
              </div>
            )}
          </div>
        )
      }

      // ── IMAGE ────────────────────────────────────────────
      case 'image':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
              <span className="text-sm">🖼️</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.image}</span>
            </div>
            <div className="p-4">
              {s.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.src}
                  alt={s.alt ?? 'Lesson diagram'}
                  className="w-full rounded-xl border border-white/8 object-contain max-h-96"
                />
              ) : (
                <div className="h-40 bg-card2 rounded-xl flex items-center justify-center text-muted text-sm font-semibold">
                  🖼️ Image placeholder
                </div>
              )}
            </div>
            {(s.alt || s.text) && (
              <p className="px-5 pb-4 text-xs text-muted font-semibold">{s.alt ?? s.text}</p>
            )}
          </div>
        )

      // ── EXTERNAL ACTIVITY ────────────────────────────────
      // For activities on Jupyter, Code.org, Replit, Scratch, etc.
      // DB shape: { "type":"external", "url":"https://...", "platform":"Jupyter",
      //             "title":"My Activity", "text":"Instructions...",
      //             "button_label":"Open Notebook" }
      case 'external': {
        // Pick a platform icon
        const platformIcons: Record<string, string> = {
          jupyter: '📓', replit: '💻', scratch: '🐱', 'code.org': '💡',
          colab: '📊', kaggle: '🏆', codepen: '✏️', glitch: '🎏',
          trinket: '💎', w3schools: '🌐', ide: '⌨️',
        }
        const platformKey = (s.platform ?? '').toLowerCase()
        const icon = Object.entries(platformIcons).find(([k]) => platformKey.includes(k))?.[1] ?? '↗'
        const btnLabel = s.button_label
          ?? (lang === 'ar' ? `افتح على ${s.platform ?? 'المنصة'}` : lang === 'fr' ? `Ouvrir sur ${s.platform ?? 'la plateforme'}` : `Open on ${s.platform ?? 'external platform'}`)

        return (
          <div key={idx} className="rounded-2xl overflow-hidden border border-accent4/30 bg-gradient-to-br from-accent4/8 to-accent5/8">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/2">
              <span className="text-base">{icon}</span>
              <span className="text-xs font-bold text-accent4 uppercase tracking-wider">{t.external}</span>
              {s.platform && (
                <span className="ml-auto text-xs font-bold text-muted bg-white/5 border border-white/8 px-2.5 py-0.5 rounded-full">
                  {s.platform}
                </span>
              )}
            </div>

            <div className="p-6">
              {/* Activity title */}
              {s.title && (
                <h3 className="font-extrabold text-base mb-2">{s.title}</h3>
              )}

              {/* Instructions */}
              {s.text && (
                <p className="text-sm font-semibold text-muted leading-relaxed mb-5">{s.text}</p>
              )}

              {/* The big CTA button */}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent5/20 transition-all w-full justify-center"
              >
                <span className="text-lg">{icon}</span>
                {btnLabel}
                <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">↗</span>
              </a>

              {/* Come-back reminder */}
              <p className="text-center text-xs text-muted font-semibold mt-4">
                {t.externalDone}
              </p>
            </div>

            {/* Info bar */}
            <div className="px-5 py-3 border-t border-white/5 bg-white/1">
              <p className="text-xs text-muted/60 font-semibold">{t.externalDesc}</p>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  const coachUrl       = `/dashboard/coach?topic=${encodeURIComponent(skill?.title ?? '')}&lesson=${encodeURIComponent(lesson.title)}`
  const needsQuiz      = quizSections.length > 0
  const needsChecklist = checklistSections.length > 0
  const blockingItems  = [
    ...(needsQuiz && !allQuizzesPassed ? [lang === 'ar' ? 'أجب على جميع الأسئلة' : lang === 'fr' ? 'Réponds aux quiz' : 'Answer all quiz questions'] : []),
    ...(needsChecklist && !allChecklistsDone ? [lang === 'ar' ? 'أكمل قائمة التحقق' : lang === 'fr' ? 'Complète la liste' : 'Complete the checklist'] : []),
  ]

  return (
    <div className="p-6 lg:p-10 max-w-3xl" dir={dir}>
      {/* Toast */}
      <div className={cn(
        'fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-card border border-accent2/30 text-accent2 font-bold text-sm shadow-xl transition-all duration-300',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        {toast}
      </div>

      {/* Level-up overlay */}
      {levelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setLevelUp(null)}>
          <div className="bg-card border border-accent2/30 rounded-3xl p-10 text-center shadow-2xl">
            <div className="text-7xl mb-4 animate-bounce">🎊</div>
            <h2 className="font-fredoka text-4xl text-accent2 mb-2">{levelUp}</h2>
            <p className="text-muted font-bold">
              {lang === 'ar' ? 'استمر، أنت لا يُوقف!' : lang === 'fr' ? 'Continue — inarrêtable !' : 'Keep going — unstoppable!'}
            </p>
          </div>
        </div>
      )}

      {/* Back */}
      <Link href={`/dashboard/skills/${skill?.id}`} className="inline-flex items-center gap-1 text-muted font-bold text-sm hover:text-white transition-colors mb-6">
        {t.back}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        <div className="text-5xl flex-shrink-0">{lesson.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-muted">{t.lesson} {lessonIndex}/{totalLessons}</span>
            {isDone && <span className="text-xs font-bold text-accent3 bg-accent3/10 border border-accent3/25 px-2.5 py-0.5 rounded-full">{t.completedBefore}</span>}
          </div>
          <h1 className="font-fredoka text-2xl lg:text-3xl leading-tight">{lesson.title}</h1>
          <p className="text-muted font-semibold text-sm mt-1 leading-relaxed">{lesson.description}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs font-bold bg-accent2/15 text-accent2 border border-accent2/25 px-3 py-1 rounded-full">+{lesson.xp_reward} XP</span>
        <span className="text-xs font-bold text-muted">⏱ {lesson.duration_mins} min</span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-2 bg-card2 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent4 to-accent5 rounded-full transition-all duration-700"
            style={{ width: `${Math.round((lessonIndex / totalLessons) * 100)}%` }} />
        </div>
        <span className="text-xs font-bold text-muted">{Math.round((lessonIndex / totalLessons) * 100)}%</span>
      </div>

      {/* AI Coach banner */}
      <div className="bg-gradient-to-r from-accent5/10 to-accent1/10 border border-accent5/20 rounded-2xl p-4 mb-7 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-extrabold text-sm">
              {lang === 'ar' ? 'لديك سؤال؟ مدربك الذكي هنا!' : lang === 'fr' ? 'Une question ? Ton Coach IA est là !' : 'Confused? Your AI Coach is here!'}
            </p>
            <p className="text-muted text-xs font-semibold">
              {lang === 'ar' ? 'اسأله أي شيء عن هذا الدرس' : lang === 'fr' ? "Demande n'importe quoi sur cette leçon" : 'Ask anything about this lesson'}
            </p>
          </div>
        </div>
        <Link href={coachUrl} className="flex-shrink-0 px-5 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all">
          {t.askCoach}
        </Link>
      </div>

      {/* Content sections */}
      <div className="space-y-5 mb-10">
        {sections.length > 0
          ? sections.map((s, i) => renderSection(s, i))
          : <div className="bg-card border border-white/8 rounded-2xl p-8 text-center">
              <p className="text-muted font-semibold text-sm">Content loading...</p>
            </div>
        }
      </div>

      {/* Complete button */}
      {!isDone && (
        <div className="bg-card border border-white/8 rounded-2xl p-6 mb-6 text-center">
          {blockingItems.length > 0 && (
            <ul className="mb-4 space-y-1">
              {blockingItems.map((item, i) => (
                <li key={i} className="text-xs text-muted font-semibold flex items-center justify-center gap-2">
                  <span className="text-accent5">›</span> {item}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={markComplete}
            disabled={isPending || !canComplete}
            className={cn(
              'px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all',
              isPending ? 'opacity-50 cursor-not-allowed bg-card2 text-muted' :
              !canComplete
                ? 'bg-card2 text-muted/60 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-accent3 to-accent4 text-white hover:-translate-y-1 hover:shadow-xl shadow-lg'
            )}
          >
            {isPending ? '⏳ Saving...' : t.complete}
          </button>
        </div>
      )}

      {isDone && (
        <div className="bg-accent3/8 border border-accent3/30 rounded-2xl p-6 mb-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-extrabold text-accent3">
            {lang === 'ar' ? 'درس مكتمل! أحسنت!' : lang === 'fr' ? 'Leçon complète ! Excellent !' : 'Lesson complete! Great work!'}
          </p>
        </div>
      )}

      {/* Prev / Next nav */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/5 flex-wrap">
        {prevLesson ? (
          <Link href={`/dashboard/skills/${skill?.id}/lesson/${prevLesson.id}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm border border-white/10 text-muted hover:text-white hover:border-white/25 transition-all">
            ← {prevLesson.emoji} {prevLesson.title}
          </Link>
        ) : (
          <Link href={`/dashboard/skills/${skill?.id}`} className="text-sm font-bold text-muted hover:text-white transition-colors">
            ← {t.back}
          </Link>
        )}
        {nextLesson ? (
          <Link href={`/dashboard/skills/${skill?.id}/lesson/${nextLesson.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all">
            {nextLesson.emoji} {nextLesson.title} →
          </Link>
        ) : (
          <Link href={`/dashboard/skills/${skill?.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent2 to-accent1 text-black hover:-translate-y-0.5 hover:shadow-lg transition-all">
            {t.finish}
          </Link>
        )}
      </div>

      {/* Share card modal */}
      {/* Lesson Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowFeedback(false)}>
          <div className="bg-card border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <LessonFeedback
              userId={userId}
              lessonId={lesson.id}
              lang={lang as 'en'|'ar'|'fr'}
              onDone={() => setShowFeedback(false)}
              onSkip={() => setShowFeedback(false)}
            />
          </div>
        </div>
      )}

      {shareCard && (
        <ShareCardModal
          props={shareCard}
          onClose={() => setShareCard(null)}
        />
      )}
    </div>
  )
}
