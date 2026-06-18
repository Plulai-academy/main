'use client'
// components/dashboard/LessonViewClient.tsx
import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { completeLesson, addXP, updateSkillProgress, checkAndAwardBadges, updateStreak } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import LessonFeedback from '@/components/dashboard/LessonFeedback'
import LessonCompletionPanel from '@/components/dashboard/LessonCompletionPanel'
// ─────────────────────────────────────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────────────────────────────────────
const UI: Record<string, Record<string, string>> = {
  en: {
    back: '← Lessons', complete: '✅ Mark Complete', completed: '✅ Done!',
    next: 'Next Lesson', finish: '🎉 Finish Skill!', quiz: 'Quick Check',
    correct: '✅ Correct! Great job!', wrong: '❌ Not quite — think it over!',
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
    externalDone: 'Done? Come back here and mark complete ↓',
    // new activities
    speedQuiz: '⚡ Speed Round',
    fillBlank: '✏️ Fill in the Blanks',
    unscramble: '🔀 Unscramble the Code',
    debug: '🐛 Bug Hunt',
    timedChallenge: '⏱️ Timed Challenge',
    remix: '🎨 Remix Challenge',
    timeLeft: 'Time left',
    score: 'Score',
    startQuiz: 'Start Speed Round',
    checkAnswer: 'Check Answer',
    nextQuestion: 'Next →',
    showHint: 'Show Hint',
    hideHint: 'Hide Hint',
    dragToOrder: 'Drag lines into the correct order',
    bugFound: '🐛 Bug found!',
    fixIt: 'I fixed it!',
    bonusChallenge: '🌟 Bonus Challenge Unlocked!',
    startTimer: 'Start Timer',
    submitChallenge: 'Submit',
    remixDesc: 'You nailed the basics. Now twist it.',
    // drag & drop
    dragDrop: '🧩 Drag & Drop',
    dragInstruction: 'Drag each word into the correct slot',
    wordBank: 'Word Bank',
    resetWords: 'Reset',
    // submit work
    submitWork: '📤 Submit Your Work',
    submitUrl: 'Project / website link',
    submitVideo: 'Video demo link (YouTube, Loom…)',
    submitPlaceholder: 'Paste your link here…',
    submitBtn: 'Submit ✅',
    submitDone: '🎉 Submitted! Great work.',
    submitRequired: 'Please paste your link before submitting.',
  },
  ar: {
    back: '← الدروس', complete: '✅ علّم كمكتمل', completed: '✅ تم!',
    next: 'الدرس التالي', finish: '🎉 أكمل المهارة!', quiz: 'اختبار سريع',
    correct: '✅ صحيح! عمل رائع!', wrong: '❌ ليس تماماً — فكّر مجدداً!',
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
    speedQuiz: '⚡ جولة سريعة',
    fillBlank: '✏️ أكمل الفراغات',
    unscramble: '🔀 رتّب الكود',
    debug: '🐛 صياد الأخطاء',
    timedChallenge: '⏱️ تحدي موقوت',
    remix: '🎨 تحدي الريمكس',
    timeLeft: 'الوقت المتبقي',
    score: 'النتيجة',
    startQuiz: 'ابدأ الجولة',
    checkAnswer: 'تحقق من الإجابة',
    nextQuestion: 'التالي →',
    showHint: 'أظهر التلميح',
    hideHint: 'أخفِ التلميح',
    dragToOrder: 'اسحب الأسطر إلى الترتيب الصحيح',
    bugFound: '🐛 وجدت الخطأ!',
    fixIt: 'أصلحته!',
    bonusChallenge: '🌟 تحدي إضافي مفتوح!',
    startTimer: 'ابدأ الموقت',
    submitChallenge: 'أرسل',
    remixDesc: 'أتقنت الأساسيات. الآن طوّرها.',
    dragDrop: '🧩 اسحب وأفلت',
    dragInstruction: 'اسحب كل كلمة إلى المكان الصحيح',
    wordBank: 'بنك الكلمات',
    resetWords: 'إعادة تعيين',
    submitWork: '📤 أرسل عملك',
    submitUrl: 'رابط المشروع / الموقع',
    submitVideo: 'رابط الفيديو (YouTube، Loom…)',
    submitPlaceholder: 'الصق رابطك هنا…',
    submitBtn: 'أرسل ✅',
    submitDone: '🎉 تم الإرسال! عمل رائع.',
    submitRequired: 'الرجاء لصق رابطك قبل الإرسال.',
  },
  fr: {
    back: '← Leçons', complete: '✅ Marquer terminé', completed: '✅ Fait !',
    next: 'Leçon suivante', finish: '🎉 Terminer !', quiz: 'Vérification rapide',
    correct: '✅ Correct ! Super boulot !', wrong: '❌ Pas tout à fait — réfléchis encore !',
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
    speedQuiz: '⚡ Tour rapide',
    fillBlank: '✏️ Complète les blancs',
    unscramble: '🔀 Remets dans l\'ordre',
    debug: '🐛 Chasse aux bugs',
    timedChallenge: '⏱️ Défi chronométré',
    remix: '🎨 Défi remix',
    timeLeft: 'Temps restant',
    score: 'Score',
    startQuiz: 'Commencer',
    checkAnswer: 'Vérifier',
    nextQuestion: 'Suivant →',
    showHint: 'Voir l\'indice',
    hideHint: 'Cacher l\'indice',
    dragToOrder: 'Glisse les lignes dans le bon ordre',
    bugFound: '🐛 Bug trouvé !',
    fixIt: 'Je l\'ai corrigé !',
    bonusChallenge: '🌟 Défi bonus débloqué !',
    startTimer: 'Lancer le chrono',
    submitChallenge: 'Envoyer',
    remixDesc: 'Tu maîtrises les bases. Maintenant, adapte !',
    dragDrop: '🧩 Glisser-Déposer',
    dragInstruction: 'Glisse chaque mot dans le bon emplacement',
    wordBank: 'Banque de mots',
    resetWords: 'Réinitialiser',
    submitWork: '📤 Soumettre ton travail',
    submitUrl: 'Lien projet / site web',
    submitVideo: 'Lien vidéo démo (YouTube, Loom…)',
    submitPlaceholder: 'Colle ton lien ici…',
    submitBtn: 'Envoyer ✅',
    submitDone: '🎉 Envoyé ! Excellent travail.',
    submitRequired: 'Colle ton lien avant d\'envoyer.',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Section interface
// ─────────────────────────────────────────────────────────────────────────────
interface Section {
  type: string
  text?: string
  language?: string
  starter?: string
  instructions?: string
  expected_output?: string
  question?: string
  options?: string[]
  correct?: number
  explanation?: string
  items?: string[]
  title?: string
  hint?: string
  variant?: 'note' | 'warning' | 'danger' | 'success'
  before?: string
  after?: string
  before_label?: string
  after_label?: string
  checks?: string[]
  url?: string
  caption?: string
  src?: string
  alt?: string
  embed_url?: string
  height?: number
  platform?: string
  button_label?: string
  // speed_quiz
  time_per_question?: number
  questions?: Array<{ question: string; options: string[]; correct: number; explanation?: string }>
  // fill_blank
  code?: string
  blanks?: string[]
  hints?: string[]
  // unscramble
  lines?: string[]
  correct_order?: number[]
  // debug
  broken_code?: string
  bugs?: string[]
  // timed_challenge
  duration_seconds?: number
  task?: string
  bonus_task?: string
  base_xp?: number
  speed_bonus_xp?: number
  // remix
  twist?: string
  xp_bonus?: number
  // drag_drop
  word_bank?: string[]
  targets?: Array<{ id: string; label: string; correct: string }>
  // submit_work
  submission_type?: 'url' | 'video' | 'both'
  prompt?: string
  placeholder?: string
  required?: boolean
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
  streak:            number
  finishedAllTracks: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Speed Quiz
// ─────────────────────────────────────────────────────────────────────────────
function SpeedQuizActivity({ s, t }: { s: Section; t: Record<string, string> }) {
  const questions = s.questions ?? []
  const timePerQ  = s.time_per_question ?? 10
  const [started, setStarted]     = useState(false)
  const [qIdx, setQIdx]           = useState(0)
  const [timeLeft, setTimeLeft]   = useState(timePerQ)
  const [selected, setSelected]   = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]         = useState(0)
  const [done, setDone]           = useState(false)
  const [results, setResults]     = useState<boolean[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const goNext = useCallback(() => {
    stopTimer()
    if (qIdx + 1 >= questions.length) {
      setDone(true)
    } else {
      setQIdx(q => q + 1)
      setTimeLeft(timePerQ)
      setSelected(null)
      setSubmitted(false)
    }
  }, [qIdx, questions.length, timePerQ, stopTimer])

  const submitAnswer = useCallback((sel: number | null) => {
    stopTimer()
    setSubmitted(true)
    const correct = sel === questions[qIdx]?.correct
    if (correct) setScore(s => s + 1)
    setResults(r => [...r, correct])
  }, [qIdx, questions, stopTimer])

  useEffect(() => {
    if (!started || submitted || done) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { submitAnswer(selected); return 0 }
        return t - 1
      })
    }, 1000)
    return stopTimer
  }, [started, submitted, done, selected, submitAnswer, stopTimer])

  if (!started) return (
    <div className="bg-gradient-to-br from-accent5/10 to-accent1/10 border-2 border-accent5/30 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">⚡</div>
      <h3 className="font-extrabold text-base mb-2">{t.speedQuiz}</h3>
      <p className="text-sm text-muted font-semibold mb-1">{questions.length} questions · {timePerQ}s each</p>
      {s.text && <p className="text-xs text-muted/70 mb-4">{s.text}</p>}
      <button onClick={() => setStarted(true)}
        className="px-8 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 transition-all shadow-lg">
        {t.startQuiz}
      </button>
    </div>
  )

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct === 100 ? '🏆' : pct >= 70 ? '🎉' : '💪'
    return (
      <div className="bg-gradient-to-br from-accent3/10 to-accent4/10 border-2 border-accent3/30 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">{emoji}</div>
        <h3 className="font-extrabold text-xl mb-1">{score}/{questions.length}</h3>
        <p className="text-sm text-muted font-semibold mb-4">{pct}% — {pct === 100 ? 'Perfect!' : pct >= 70 ? 'Great job!' : 'Keep practising!'}</p>
        <div className="flex justify-center gap-2 mb-4">
          {results.map((r, i) => (
            <span key={i} className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold', r ? 'bg-accent3/20 text-accent3' : 'bg-red-500/20 text-red-400')}>
              {r ? '✓' : '✗'}
            </span>
          ))}
        </div>
        {pct < 100 && (
          <button onClick={() => { setStarted(false); setQIdx(0); setTimeLeft(timePerQ); setSelected(null); setSubmitted(false); setScore(0); setDone(false); setResults([]) }}
            className="px-6 py-2 rounded-xl font-extrabold text-sm border border-white/10 text-muted hover:text-white hover:border-white/25 transition-all">
            {t.tryAgain}
          </button>
        )}
      </div>
    )
  }

  const q    = questions[qIdx]
  const pct  = Math.round((timeLeft / timePerQ) * 100)
  const timerColor = timeLeft <= 3 ? 'bg-red-500' : timeLeft <= 5 ? 'bg-amber-500' : 'bg-accent5'

  return (
    <div className="bg-gradient-to-br from-accent5/10 to-accent1/10 border-2 border-accent5/30 rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-extrabold text-accent5 uppercase tracking-wider">{t.speedQuiz}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted">{qIdx + 1}/{questions.length}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-1000', timerColor)} style={{ width: `${pct}%` }} />
            </div>
            <span className={cn('text-sm font-extrabold tabular-nums w-5 text-right', timeLeft <= 3 ? 'text-red-400' : 'text-white')}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <p className="font-extrabold text-sm mb-4 leading-relaxed">{q.question}</p>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {q.options.map((opt, oi) => {
          let cls = 'border-white/10 bg-white/3 text-muted hover:border-white/25 hover:text-white cursor-pointer'
          if (submitted) {
            if (oi === q.correct) cls = 'border-accent3/60 bg-accent3/15 text-accent3 cursor-default'
            else if (selected === oi) cls = 'border-red-500/40 bg-red-500/10 text-red-400 cursor-default'
            else cls = 'border-white/5 bg-white/1 text-muted/40 cursor-default'
          } else if (selected === oi) {
            cls = 'border-accent5/50 bg-accent5/15 text-white cursor-pointer'
          }
          return (
            <button key={oi} onClick={() => !submitted && setSelected(oi)} disabled={submitted}
              className={cn('w-full text-left px-4 py-3 rounded-xl text-sm font-bold border transition-all', cls)}>
              <span className="font-extrabold mr-2 text-muted/60">{String.fromCharCode(65 + oi)}.</span> {opt}
            </button>
          )
        })}
      </div>

      {/* Action */}
      {!submitted ? (
        <button onClick={() => submitAnswer(selected)} disabled={selected === null}
          className="w-full py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          {t.checkAnswer}
        </button>
      ) : (
        <div className="space-y-3">
          {q.explanation && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-3">
              <p className="text-xs text-muted font-semibold leading-relaxed">{q.explanation}</p>
            </div>
          )}
          <button onClick={goNext}
            className="w-full py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 transition-all">
            {qIdx + 1 >= questions.length ? '🏁 See Results' : t.nextQuestion}
          </button>
        </div>
      )}

      {/* Score tracker */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-muted font-semibold">{t.score}: {score}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn('w-2 h-2 rounded-full', i < results.length ? (results[i] ? 'bg-accent3' : 'bg-red-500') : i === qIdx ? 'bg-accent5' : 'bg-white/10')} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Fill in the Blank
// ─────────────────────────────────────────────────────────────────────────────
function FillBlankActivity({ s, t }: { s: Section; t: Record<string, string> }) {
  const code    = s.code ?? ''
  const blanks  = s.blanks ?? []
  const hints   = s.hints ?? []
  const parts   = code.split('___')
  const [inputs, setInputs]       = useState<string[]>(Array(blanks.length).fill(''))
  const [checked, setChecked]     = useState(false)
  const [results, setResults]     = useState<boolean[]>([])
  const [showHints, setShowHints] = useState<boolean[]>(Array(blanks.length).fill(false))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const check = () => {
    const res = inputs.map((v, i) => v.trim().toLowerCase() === blanks[i].toLowerCase())
    setResults(res)
    setChecked(true)
  }

  const reset = () => {
    setInputs(Array(blanks.length).fill(''))
    setResults([])
    setChecked(false)
    setShowHints(Array(blanks.length).fill(false))
  }

  const allCorrect = checked && results.every(Boolean)
  let blankIdx = 0

  return (
    <div className="bg-[#0b0b16] border border-purple-500/25 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-bold text-purple-400">{t.fillBlank}</span>
        {s.text && <span className="text-xs text-muted/60 ml-auto truncate max-w-xs">{s.text}</span>}
      </div>

      {/* Code with blanks */}
      <div className="p-5 font-mono text-sm leading-8 overflow-x-auto">
        {parts.map((part, pi) => {
          const currentBlank = blankIdx
          if (pi < parts.length - 1) blankIdx++
          const isCorrect = checked && results[currentBlank]
          const isWrong   = checked && !results[currentBlank]
          return (
            <React.Fragment key={pi}>
              <span className="text-green-300 whitespace-pre">{part}</span>
              {pi < parts.length - 1 && (
                <input
                  ref={el => { inputRefs.current[currentBlank] = el }}
                  value={inputs[currentBlank]}
                  onChange={e => {
                    const next = [...inputs]; next[currentBlank] = e.target.value
                    setInputs(next); setChecked(false); setResults([])
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') { const next = inputRefs.current[currentBlank + 1]; if (next) next.focus(); else check() } }}
                  disabled={checked && isCorrect}
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-md border text-sm font-mono font-bold text-center transition-all outline-none',
                    'min-w-[80px]',
                    isCorrect ? 'bg-accent3/20 border-accent3/60 text-accent3' :
                    isWrong   ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                                'bg-white/8 border-white/20 text-white focus:border-purple-400/60 focus:bg-purple-500/10'
                  )}
                  style={{ width: `${Math.max(blanks[currentBlank]?.length * 10 + 24, 80)}px` }}
                  placeholder="___"
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Hints row */}
      {hints.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {hints.map((hint, i) => (
            <div key={i}>
              <button onClick={() => { const n = [...showHints]; n[i] = !n[i]; setShowHints(n) }}
                className="text-xs font-bold text-amber-400/70 hover:text-amber-400 transition-colors">
                {showHints[i] ? t.hideHint : `${t.showHint} ${i + 1}`}
              </button>
              {showHints[i] && <span className="ml-2 text-xs text-muted italic">→ {hint}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between gap-3">
        {allCorrect ? (
          <p className="text-sm font-extrabold text-accent3">✅ Perfect! Every blank is correct.</p>
        ) : checked && !allCorrect ? (
          <p className="text-sm font-bold text-red-400">
            {results.filter(Boolean).length}/{blanks.length} correct — check the red ones
          </p>
        ) : (
          <p className="text-xs text-muted/50">Fill all blanks then check</p>
        )}
        <div className="flex gap-2">
          {checked && !allCorrect && (
            <button onClick={reset} className="px-4 py-2 rounded-xl text-xs font-extrabold border border-white/10 text-muted hover:text-white transition-all">
              Reset
            </button>
          )}
          <button onClick={check} disabled={inputs.some(v => !v.trim()) || allCorrect}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            {t.checkAnswer}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Unscramble
// ─────────────────────────────────────────────────────────────────────────────
function UnscrambleActivity({ s, t }: { s: Section; t: Record<string, string> }) {
  const correctOrder = s.correct_order ?? (s.lines ?? []).map((_, i) => i)
  const [order, setOrder]   = useState<number[]>(() => {
    const shuffled = [...correctOrder]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })
  const [dragging, setDragging]   = useState<number | null>(null)
  const [dragOver, setDragOver]   = useState<number | null>(null)
  const [checked, setChecked]     = useState(false)
  const [correct, setCorrect]     = useState(false)

  const lines = s.lines ?? []

  const check = () => {
    const isCorrect = order.every((v, i) => v === correctOrder[i])
    setCorrect(isCorrect)
    setChecked(true)
  }

  const handleDrop = (targetIdx: number) => {
    if (dragging === null || dragging === targetIdx) return
    const next = [...order]
    const tmp = next[dragging]; next[dragging] = next[targetIdx]; next[targetIdx] = tmp
    setOrder(next); setDragging(null); setDragOver(null); setChecked(false)
  }

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...order]; [next[i], next[i-1]] = [next[i-1], next[i]]; setOrder(next); setChecked(false)
  }
  const moveDown = (i: number) => {
    if (i === order.length - 1) return
    const next = [...order]; [next[i], next[i+1]] = [next[i+1], next[i]]; setOrder(next); setChecked(false)
  }

  return (
    <div className="bg-[#0b0b16] border border-cyan-500/25 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-bold text-cyan-400">{t.unscramble}</span>
        {s.text && <span className="text-xs text-muted/60 ml-auto">{s.text}</span>}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-muted/60 font-semibold mb-3">🖱️ Drag to reorder, or use ↑ ↓ buttons</p>
        {order.map((lineIdx, i) => {
          const lineCorrect = checked && lineIdx === correctOrder[i]
          const lineWrong   = checked && lineIdx !== correctOrder[i]
          return (
            <div key={i}
              draggable
              onDragStart={() => setDragging(i)}
              onDragOver={e => { e.preventDefault(); setDragOver(i) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(i)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none',
                dragOver === i       ? 'border-cyan-400/60 bg-cyan-500/10' :
                lineCorrect          ? 'border-accent3/50 bg-accent3/10' :
                lineWrong            ? 'border-red-500/40 bg-red-500/8' :
                dragging === i       ? 'border-cyan-400/40 bg-cyan-500/8 opacity-50' :
                                       'border-white/8 bg-white/3 hover:border-white/15'
              )}>
              {/* Line number */}
              <span className="text-xs font-mono text-white/20 w-4 flex-shrink-0">{i + 1}</span>
              {/* Drag handle */}
              <span className="text-white/20 text-xs flex-shrink-0">⠿</span>
              {/* Code line */}
              <code className={cn(
                'flex-1 text-sm font-mono whitespace-pre',
                lineCorrect ? 'text-accent3' : lineWrong ? 'text-red-400' : 'text-green-300'
              )}>{lines[lineIdx]}</code>
              {/* Move buttons for touch */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="text-white/20 hover:text-white/60 disabled:opacity-10 text-xs leading-none transition-colors">▲</button>
                <button onClick={() => moveDown(i)} disabled={i === order.length - 1} className="text-white/20 hover:text-white/60 disabled:opacity-10 text-xs leading-none transition-colors">▼</button>
              </div>
              {checked && (lineCorrect ? <span className="text-accent3 text-sm flex-shrink-0">✓</span> : <span className="text-red-400 text-sm flex-shrink-0">✗</span>)}
            </div>
          )
        })}
      </div>

      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
        {correct ? (
          <p className="text-sm font-extrabold text-accent3">✅ Perfect order! The code runs correctly.</p>
        ) : checked ? (
          <p className="text-sm font-bold text-red-400">Not quite — some lines are out of order</p>
        ) : (
          <p className="text-xs text-muted/50">Arrange the lines into the correct order</p>
        )}
        {!correct && (
          <button onClick={check}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all">
            {t.checkAnswer}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Bug Hunt
// ─────────────────────────────────────────────────────────────────────────────
function DebugActivity({ s, t }: { s: Section; t: Record<string, string> }) {
  const bugs      = s.bugs ?? []
  const hints     = s.hints ?? []
  const [found,   setFound]   = useState<boolean[]>(Array(bugs.length).fill(false))
  const [showH,   setShowH]   = useState<boolean[]>(Array(hints.length).fill(false))
  const [allFixed, setAllFixed] = useState(false)
  const [copiedBroken, setCopiedBroken] = useState(false)

  const toggleFound = (i: number) => {
    const next = [...found]; next[i] = !next[i]; setFound(next)
    if (next.every(Boolean)) setAllFixed(true)
  }

  const code = s.broken_code ?? ''

  return (
    <div className="bg-[#0b0b16] border border-red-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-red-950/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-bold text-red-400">{t.debug}</span>
        <span className="ml-auto text-xs text-red-400/60">{bugs.length} bug{bugs.length !== 1 ? 's' : ''} hidden</span>
      </div>

      {/* Description */}
      {s.text && <p className="px-5 pt-4 text-sm text-muted font-semibold">{s.text}</p>}

      {/* Broken code display */}
      <div className="relative">
        <pre className="px-5 py-4 text-sm font-mono text-red-300/90 leading-7 overflow-x-auto whitespace-pre">
          {code}
        </pre>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopiedBroken(true); setTimeout(() => setCopiedBroken(false), 2000) }}
          className="absolute top-3 right-3 text-xs font-bold text-muted/50 hover:text-white border border-white/10 rounded-lg px-2 py-1 transition-all">
          {copiedBroken ? '✓' : '⎘ Copy'}
        </button>
      </div>

      {/* Bug checklist */}
      <div className="px-5 py-4 border-t border-white/5 space-y-2">
        <p className="text-xs font-extrabold text-red-400 uppercase tracking-wider mb-3">
          Find and fix each bug, then check it off:
        </p>
        {bugs.map((bug, i) => (
          <button key={i} onClick={() => toggleFound(i)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all',
              found[i]
                ? 'bg-accent3/10 border-accent3/30 text-accent3'
                : 'bg-red-500/5 border-red-500/20 text-red-300/80 hover:border-red-500/40 hover:text-red-200'
            )}>
            <span className={cn('w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all', found[i] ? 'bg-accent3 border-accent3 text-white' : 'border-red-500/40')}>
              {found[i] && <span className="text-xs font-extrabold">✓</span>}
            </span>
            <span className={cn(found[i] && 'line-through opacity-50')}>Bug {i + 1}: {bug}</span>
          </button>
        ))}
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
          {hints.map((hint, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => { const n = [...showH]; n[i] = !n[i]; setShowH(n) }}
                className="text-xs font-bold text-amber-400/70 hover:text-amber-400 transition-colors">
                🔦 {showH[i] ? 'Hide' : `Hint ${i + 1}`}
              </button>
              {showH[i] && <span className="text-xs text-amber-300/80 italic">{hint}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {allFixed && (
        <div className="px-5 pb-5">
          <div className="bg-accent3/10 border border-accent3/30 rounded-xl p-4 text-center">
            <p className="text-sm font-extrabold text-accent3">🐛 All bugs squashed! Great debugging.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Timed Challenge
// ─────────────────────────────────────────────────────────────────────────────
function TimedChallengeActivity({ s, t, lessonTitle }: { s: Section; t: Record<string, string>; lessonTitle: string }) {
  const duration  = s.duration_seconds ?? 300
  const [phase, setPhase]     = useState<'idle' | 'running' | 'done'>('idle')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [bonusUnlocked, setBonusUnlocked] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = () => {
    setPhase('running')
    setTimeLeft(duration)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const submit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const remaining = timeLeft
    setPhase('done')
    if (remaining > 60) setBonusUnlocked(true)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const pct  = Math.round((timeLeft / duration) * 100)
  const timerColor = pct > 50 ? 'from-accent3 to-accent4' : pct > 25 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-red-600'

  if (phase === 'idle') return (
    <div className="bg-gradient-to-br from-accent2/10 to-accent1/10 border-2 border-accent2/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⏱️</span>
        <span className="text-xs font-extrabold text-accent2 uppercase tracking-wider">{t.timedChallenge}</span>
      </div>
      {s.title && <h3 className="font-extrabold text-base mb-2">{s.title}</h3>}
      <p className="text-sm font-semibold leading-relaxed text-muted mb-4">{s.task ?? s.text}</p>
      {s.expected_output && (
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-muted mb-1">Expected output:</p>
          <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{s.expected_output}</pre>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted font-semibold">
          ⏱ {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')} — finish early for bonus XP!
        </div>
        <button onClick={start}
          className="px-6 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent2 to-accent1 text-black hover:-translate-y-0.5 transition-all shadow-lg">
          {t.startTimer}
        </button>
      </div>
    </div>
  )

  if (phase === 'done') return (
    <div className="bg-gradient-to-br from-accent3/10 to-accent4/10 border-2 border-accent3/30 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">{bonusUnlocked ? '🌟' : '✅'}</div>
      <h3 className="font-extrabold text-lg mb-2">{bonusUnlocked ? t.bonusChallenge : 'Challenge complete!'}</h3>
      {bonusUnlocked && s.bonus_task && (
        <div className="bg-accent2/10 border border-accent2/25 rounded-xl p-4 mt-3 text-left">
          <p className="text-xs font-extrabold text-accent2 mb-2 uppercase tracking-wider">Bonus challenge:</p>
          <p className="text-sm font-semibold text-muted">{s.bonus_task}</p>
        </div>
      )}
      <Link href={`/dashboard/coach?topic=${encodeURIComponent(lessonTitle)}`}
        className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-accent5 hover:text-white transition-colors">
        🤖 Get feedback from AI Coach
      </Link>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-accent2/10 to-accent1/10 border-2 border-accent2/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⏱️</span>
        <span className="text-xs font-extrabold text-accent2 uppercase tracking-wider">{t.timedChallenge}</span>
        {/* Live timer */}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-32 h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000', timerColor)} style={{ width: `${pct}%` }} />
          </div>
          <span className={cn('text-base font-extrabold tabular-nums', timeLeft <= 60 ? 'text-red-400' : 'text-white')}>
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>
      {s.title && <h3 className="font-extrabold text-base mb-2">{s.title}</h3>}
      <p className="text-sm font-semibold leading-relaxed text-muted mb-4">{s.task ?? s.text}</p>
      {s.hint && (
        <details className="mb-4">
          <summary className="text-xs font-bold text-accent5 cursor-pointer hover:text-white transition-colors">💬 Hint</summary>
          <p className="text-sm text-muted font-semibold mt-2 pl-4 border-l-2 border-accent5/30 leading-relaxed">{s.hint}</p>
        </details>
      )}
      <button onClick={submit}
        className="w-full py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent3 to-accent4 text-white hover:-translate-y-0.5 transition-all shadow-lg">
        {t.submitChallenge} {timeLeft > 60 ? `(+${s.speed_bonus_xp ?? 50} bonus XP!)` : ''}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Remix Challenge
// ─────────────────────────────────────────────────────────────────────────────
function RemixActivity({ s, t, lessonTitle }: { s: Section; t: Record<string, string>; lessonTitle: string }) {
  const [unlocked, setUnlocked] = useState(false)

  if (!unlocked) return (
    <div className="border-2 border-dashed border-accent2/30 rounded-2xl p-5 text-center bg-accent2/4">
      <div className="text-3xl mb-2">🎨</div>
      <p className="font-extrabold text-sm mb-1">{t.remix}</p>
      <p className="text-xs text-muted font-semibold mb-4">{t.remixDesc}</p>
      <button onClick={() => setUnlocked(true)}
        className="px-6 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent2 to-accent1 text-black hover:-translate-y-0.5 transition-all">
        Unlock Remix 🔓
      </button>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-accent2/10 to-accent1/10 border-2 border-accent2/30 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎨</span>
        <span className="text-xs font-extrabold text-accent2 uppercase tracking-wider">{t.remix}</span>
        {s.xp_bonus && <span className="ml-auto text-xs font-extrabold text-accent2 bg-accent2/15 border border-accent2/25 px-2.5 py-0.5 rounded-full">+{s.xp_bonus} XP</span>}
      </div>
      {s.title && <h3 className="font-extrabold text-base mb-2">{s.title}</h3>}
      <p className="text-sm font-semibold leading-relaxed mb-4">{s.twist ?? s.text}</p>
      {s.hint && (
        <details className="mb-4">
          <summary className="text-xs font-bold text-accent5 cursor-pointer hover:text-white transition-colors">💬 {t.showHint}</summary>
          <p className="text-sm text-muted font-semibold mt-2 pl-4 border-l-2 border-accent5/30 leading-relaxed">{s.hint}</p>
        </details>
      )}
      <Link href={`/dashboard/coach?topic=${encodeURIComponent(lessonTitle + ' remix')}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-accent5 hover:text-white transition-colors">
        🤖 Show AI Coach my remix
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Drag & Drop — word bank → labelled slots
// ─────────────────────────────────────────────────────────────────────────────
function DragDropActivity({ s, t }: { s: Section; t: Record<string, string> }) {
  const targets   = s.targets ?? []
  const wordBank  = s.word_bank ?? targets.map(tgt => tgt.correct)

  // Shuffle word bank on mount
  const [bank, setBank]     = useState<string[]>(() => {
    const arr = [...wordBank]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })
  const [slots, setSlots]   = useState<Record<string, string>>({})  // targetId → word
  const [dragging, setDragging] = useState<{ word: string; from: 'bank' | string } | null>(null)
  const [checked, setChecked]   = useState(false)
  const [results, setResults]   = useState<Record<string, boolean>>({})

  const check = () => {
    const res: Record<string, boolean> = {}
    targets.forEach(tgt => { res[tgt.id] = (slots[tgt.id] ?? '') === tgt.correct })
    setResults(res)
    setChecked(true)
  }

  const reset = () => {
    setSlots({})
    setBank(() => {
      const arr = [...wordBank]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    })
    setChecked(false)
    setResults({})
    setDragging(null)
  }

  // Drop onto a slot
  const dropOnSlot = (targetId: string) => {
    if (!dragging) return
    const word = dragging.word
    const from = dragging.from
    setSlots(prev => {
      const next = { ...prev }
      // If slot already has a word, send it back to bank
      const evicted = next[targetId]
      next[targetId] = word
      // Remove from old slot if dragging from a slot
      if (from !== 'bank') delete next[from]
      // Add evicted word back to bank
      if (evicted) setBank(b => [...b, evicted])
      return next
    })
    // Remove word from bank if dragged from bank
    if (from === 'bank') setBank(b => b.filter(w => w !== word))
    setDragging(null)
    setChecked(false)
    setResults({})
  }

  // Drop back onto bank
  const dropOnBank = () => {
    if (!dragging || dragging.from === 'bank') return
    const { word, from } = dragging
    setSlots(prev => { const next = { ...prev }; delete next[from]; return next })
    setBank(b => [...b, word])
    setDragging(null)
  }

  const allFilled = targets.every(tgt => slots[tgt.id])
  const allCorrect = checked && targets.every(tgt => results[tgt.id])

  return (
    <div className="bg-[#0b0b16] border border-violet-500/25 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-bold text-violet-400">{t.dragDrop}</span>
        {s.text && <span className="text-xs text-muted/60 ml-auto truncate max-w-xs">{s.text}</span>}
      </div>

      <div className="p-5 space-y-6">
        {/* Instruction */}
        <p className="text-xs font-semibold text-muted/70">
          {s.instructions ?? t.dragInstruction}
        </p>

        {/* Drop slots */}
        <div className="space-y-3">
          {targets.map(tgt => {
            const filled    = slots[tgt.id]
            const isCorrect = checked && results[tgt.id]
            const isWrong   = checked && !results[tgt.id] && !!filled
            return (
              <div key={tgt.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => dropOnSlot(tgt.id)}
                className="flex items-center gap-3">
                {/* Label */}
                <div className="min-w-[120px] sm:min-w-[160px] text-right">
                  <code className="text-sm font-mono text-green-300 whitespace-pre">{tgt.label}</code>
                </div>
                <span className="text-muted/40 font-mono text-sm flex-shrink-0">→</span>
                {/* Drop zone */}
                <div className={cn(
                  'flex-1 min-h-[40px] rounded-xl border-2 border-dashed flex items-center px-3 transition-all',
                  filled
                    ? isCorrect ? 'border-accent3/50 bg-accent3/10'
                    : isWrong   ? 'border-red-500/50 bg-red-500/10'
                    :             'border-violet-400/50 bg-violet-500/10'
                    : dragging   ? 'border-violet-400/50 bg-violet-500/5 scale-[1.01]'
                    :              'border-white/15 bg-white/3'
                )}>
                  {filled ? (
                    <div
                      draggable
                      onDragStart={() => setDragging({ word: filled, from: tgt.id })}
                      className={cn(
                        'px-3 py-1 rounded-lg text-sm font-bold cursor-grab active:cursor-grabbing select-none',
                        isCorrect ? 'bg-accent3/20 text-accent3'
                        : isWrong ? 'bg-red-500/20 text-red-400'
                        :           'bg-violet-500/20 text-violet-300'
                      )}>
                      {filled}
                      {checked && (isCorrect ? ' ✓' : ' ✗')}
                    </div>
                  ) : (
                    <span className="text-xs text-white/20 font-semibold">Drop here</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Word bank */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={dropOnBank}
          className="min-h-[52px] rounded-xl border border-white/8 bg-white/2 p-3">
          <p className="text-xs font-extrabold text-muted/50 uppercase tracking-wider mb-2">{t.wordBank}</p>
          <div className="flex flex-wrap gap-2">
            {bank.length === 0 && (
              <span className="text-xs text-white/20 italic">All words placed — drag back to swap</span>
            )}
            {bank.map((word, i) => (
              <div key={`${word}-${i}`}
                draggable
                onDragStart={() => setDragging({ word, from: 'bank' })}
                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25 cursor-grab active:cursor-grabbing select-none hover:bg-violet-500/25 transition-all">
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* Result message */}
        {allCorrect && (
          <div className="bg-accent3/10 border border-accent3/30 rounded-xl p-4 text-center">
            <p className="text-sm font-extrabold text-accent3">✅ Perfect! Every word is in the right place.</p>
          </div>
        )}
        {checked && !allCorrect && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-red-400">
              {Object.values(results).filter(Boolean).length}/{targets.length} correct — drag and swap the wrong ones
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={reset}
            className="text-xs font-bold text-muted hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:border-white/25">
            {t.resetWords}
          </button>
          <button onClick={check} disabled={!allFilled || allCorrect}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            {t.checkAnswer}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW ACTIVITY: Submit Your Work — kids paste project / video links
// ─────────────────────────────────────────────────────────────────────────────
function SubmitWorkActivity({
  s, t, userId, lessonId,
}: {
  s: Section; t: Record<string, string>; userId: string; lessonId: string
}) {
  const subType = s.submission_type ?? 'both'
  const [urlVal, setUrlVal]     = useState('')
  const [videoVal, setVideoVal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const validate = (val: string) => {
    try { new URL(val); return true } catch { return false }
  }

  const handleSubmit = async () => {
    const urlOk   = subType !== 'video' ? validate(urlVal)   : true
    const videoOk = subType !== 'url'   ? validate(videoVal) : true

    if (subType === 'url'   && !urlOk)               { setError(t.submitRequired); return }
    if (subType === 'video' && !videoOk)              { setError(t.submitRequired); return }
    if (subType === 'both'  && !urlOk && !videoOk)    { setError(t.submitRequired); return }

    setError('')
    setLoading(true)
    try {
      // Save submission to Supabase via API route
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, lessonId,
          projectUrl: urlVal   || null,
          videoUrl:   videoVal || null,
        }),
      })
      setSubmitted(true)
    } catch {
      setError('Could not save — check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="bg-gradient-to-br from-accent3/10 to-accent4/10 border-2 border-accent3/30 rounded-2xl p-6 text-center">
      <div className="text-5xl mb-3">🎉</div>
      <h3 className="font-extrabold text-lg text-accent3 mb-2">{t.submitDone}</h3>
      <p className="text-sm text-muted font-semibold">Your work has been saved to your portfolio.</p>
      {urlVal && (
        <a href={urlVal} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-accent5 hover:text-white transition-colors">
          🔗 View project ↗
        </a>
      )}
      {videoVal && (
        <a href={videoVal} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 ml-4 text-xs font-bold text-accent5 hover:text-white transition-colors">
          🎥 Watch video ↗
        </a>
      )}
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-accent2/8 to-accent1/8 border-2 border-accent2/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/2">
        <span className="text-2xl">📤</span>
        <div>
          <p className="font-extrabold text-sm text-accent2">{t.submitWork}</p>
          {s.prompt && <p className="text-xs text-muted font-semibold mt-0.5">{s.prompt}</p>}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* What to submit context */}
        {s.text && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <p className="text-sm font-semibold text-muted leading-relaxed">{s.text}</p>
          </div>
        )}

        {/* URL input */}
        {(subType === 'url' || subType === 'both') && (
          <div>
            <label className="block text-xs font-extrabold text-accent2 uppercase tracking-wider mb-2">
              🔗 {t.submitUrl}
            </label>
            <input
              type="url"
              value={urlVal}
              onChange={e => { setUrlVal(e.target.value); setError('') }}
              placeholder={s.placeholder ?? t.submitPlaceholder}
              className="w-full bg-white/4 border border-white/12 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder:text-white/25 outline-none focus:border-accent2/50 focus:bg-accent2/5 transition-all"
            />
            {urlVal && !validate(urlVal) && (
              <p className="text-xs text-red-400 font-semibold mt-1.5">That doesn&apos;t look like a valid URL — make sure it starts with https://</p>
            )}
          </div>
        )}

        {/* Video input */}
        {(subType === 'video' || subType === 'both') && (
          <div>
            <label className="block text-xs font-extrabold text-accent2 uppercase tracking-wider mb-2">
              🎥 {t.submitVideo}
            </label>
            <input
              type="url"
              value={videoVal}
              onChange={e => { setVideoVal(e.target.value); setError('') }}
              placeholder="https://loom.com/share/… or https://youtube.com/…"
              className="w-full bg-white/4 border border-white/12 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder:text-white/25 outline-none focus:border-accent2/50 focus:bg-accent2/5 transition-all"
            />
            {videoVal && !validate(videoVal) && (
              <p className="text-xs text-red-400 font-semibold mt-1.5">That doesn&apos;t look like a valid URL — paste the full link</p>
            )}
            {/* Loom tip */}
            <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-white/3 rounded-lg border border-white/6">
              <span className="text-sm flex-shrink-0">💡</span>
              <p className="text-xs text-muted/70 font-semibold leading-relaxed">
                No video yet? Record a 90-second screen demo on{' '}
                <a href="https://loom.com" target="_blank" rel="noopener noreferrer" className="text-accent5 hover:text-white transition-colors">Loom.com</a>
                {' '}— free, no install, works in your browser.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent2 to-accent1 text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent2/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {loading ? '⏳ Saving…' : t.submitBtn}
        </button>

        <p className="text-xs text-center text-muted/50 font-semibold">
          Your submission is saved to your Plulai portfolio and visible to your teacher.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LessonViewClient({
  userId, lesson, skill, completion, totalLessons, lessonIndex,
  prevLesson, nextLesson, language, userName, userAvatar = '🧑‍🚀',
  streak, finishedAllTracks,
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
  const [penaltyTimer, setPenaltyTimer]   = useState<Record<number, number>>({})

  const lang  = language || 'en'
  const t     = UI[lang] ?? UI.en
  const dir   = lang === 'ar' ? 'rtl' : 'ltr'
  const isDone = !!completion || justCompleted

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  let sections: Section[] = []
  try {
    const raw = typeof lesson.content_json === 'string'
      ? JSON.parse(lesson.content_json) : lesson.content_json
    sections = raw?.sections ?? []
  } catch { sections = [] }

  const selectOption = (secIdx: number, optIdx: number) => {
    if (quizState[secIdx]?.submitted) return
    if ((penaltyTimer[secIdx] ?? 0) > 0) return
    setQuiz(prev => ({ ...prev, [secIdx]: { selected: optIdx, submitted: false } }))
  }

  const submitQuiz = (secIdx: number, correct: number) => {
    const selected = quizState[secIdx]?.selected ?? null
    setQuiz(prev => ({ ...prev, [secIdx]: { ...prev[secIdx], submitted: true } }))
    if (selected !== correct) {
      setPenaltyTimer(prev => ({ ...prev, [secIdx]: 20 }))
      const interval = setInterval(() => {
        setPenaltyTimer(prev => {
          const remaining = (prev[secIdx] ?? 1) - 1
          if (remaining <= 0) {
            clearInterval(interval)
            setQuiz(p => ({ ...p, [secIdx]: { selected: null, submitted: false } }))
            return { ...prev, [secIdx]: 0 }
          }
          return { ...prev, [secIdx]: remaining }
        })
      }, 1000)
    }
  }

  const toggleCheck = (secIdx: number, itemIdx: number, total: number) => {
    setChecks(prev => {
      const arr  = prev[secIdx] ?? Array(total).fill(false)
      const next = [...arr]; next[itemIdx] = !next[itemIdx]
      return { ...prev, [secIdx]: next }
    })
  }

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).then(() => { setCopied(idx); setTimeout(() => setCopied(null), 2000) })
  }

  const quizSections      = sections.map((s, i) => ({ s, i })).filter(x => x.s.type === 'quiz')
  const allQuizzesPassed  = quizSections.every(({ s, i }) => {
    const state = quizState[i]; return state?.submitted && state.selected === s.correct
  })
  const checklistSections = sections.map((s, i) => ({ s, i })).filter(x => x.s.type === 'checklist')
  const allChecklistsDone = checklistSections.every(({ s, i }) => {
    const arr = checkState[i] ?? []; return (s.checks ?? []).every((_, ci) => arr[ci] === true)
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
      if (!nextLesson && pct >= 100) await addXP(userId, skill.xp_reward, 'skill_complete', skill.id)
      await checkAndAwardBadges(userId)

      // ── Award coins based on cumulative XP milestones ─────
      fetch('/api/coins/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpEarned: lesson.xp_reward }),
      }).catch(() => {})
      // ──────────────────────────────────────────────────────

      setJustCompleted(true); setShowFeedback(true)
      showToast(`⚡ +${lesson.xp_reward} ${t.xpEarned}`)
      if (result.data && result.data.leveledUp) {
        const rd = result.data as any
        setLevelUp(`🎊 ${t.levelUp} Level ${rd.newLevel}!`)
        setTimeout(() => setLevelUp(null), 4000)
        setTimeout(() => setShareCard({ type: 'level', childName: userName, childAvatar: userAvatar, newLevel: rd.newLevel, levelTitle: rd.levelTitle ?? '', totalXP: rd.totalXP ?? undefined }), 1200)
      }
      if (!nextLesson && pct >= 100) {
        setTimeout(() => setShareCard({ type: 'skill', childName: userName, childAvatar: userAvatar, skillName: skill.title, skillEmoji: skill.emoji, trackName: skill.track_id, xpEarned: (lesson.xp_reward ?? 0) + (skill.xp_reward ?? 0) }), levelUp ? 5000 : 800)
      }
      router.refresh()
    })
  }

  const getVideoEmbed = (url: string): string | null => {
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?byline=0&portrait=0`
    if (url.includes('/embed/') || url.includes('player.')) return url
    return null
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER SECTION
  // ─────────────────────────────────────────────────────────────────────────
  const renderSection = (s: Section, idx: number) => {
    switch (s.type) {

      // ── INTRO / READING ──────────────────────────────────
      case 'intro':
      case 'reading':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📖</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.reading}</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">{s.text}</p>
          </div>
        )

      // ── ANALOGY ──────────────────────────────────────────
      case 'analogy':
        return (
          <div key={idx} className="bg-gradient-to-br from-accent4/10 to-accent5/10 border border-accent4/25 rounded-2xl p-4 sm:p-6">
            <p className="font-extrabold text-sm mb-2 text-accent4">{t.analogy}</p>
            <p className="text-sm font-semibold leading-relaxed">{s.text}</p>
          </div>
        )

      // ── TIP ──────────────────────────────────────────────
      case 'tip':
        return (
          <div key={idx} className="bg-accent2/8 border border-accent2/25 rounded-2xl p-4 sm:p-5 flex gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="font-extrabold text-xs text-accent2 mb-1">{t.tip}</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">{s.text}</p>
            </div>
          </div>
        )

      // ── CODE (static) ─────────────────────────────────────
      case 'code':
        return (
          <div key={idx} className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-bold text-muted flex-1 truncate">{t.code} — {s.language ?? 'code'}</span>
            </div>
            {s.instructions && <p className="px-4 sm:px-5 pt-4 text-xs text-accent4/80 font-semibold italic">{s.instructions}</p>}
            <pre className="px-4 sm:px-5 py-4 text-sm font-mono text-green-400 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all max-w-full">{s.starter}</pre>
            <div className="px-4 sm:px-5 pb-4">
              <Link href={`/dashboard/coach?topic=${encodeURIComponent(lesson.title)}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-accent5 hover:text-white transition-colors">
                🤖 {lang === 'ar' ? 'اسأل المدرب' : lang === 'fr' ? "Demander au Coach" : 'Ask AI Coach to explain'}
              </Link>
            </div>
          </div>
        )

      // ── CODE EDITOR (read-only + copy) ────────────────────
      case 'code_editor':
        return (
          <div key={idx} className="bg-[#0b0b16] border border-emerald-500/20 rounded-2xl overflow-hidden max-w-full">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/2">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex-1 truncate">{t.codeViewer}</span>
              <button onClick={() => copyCode(s.starter ?? '', idx)}
                className={cn('flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex-shrink-0',
                  copiedIdx === idx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white border border-white/8')}>
                {copiedIdx === idx ? `✓ ${t.copied}` : `⎘ ${t.copyCode}`}
              </button>
            </div>
            {s.instructions && (
              <div className="px-4 sm:px-5 py-3 bg-emerald-500/5 border-b border-emerald-500/10">
                <p className="text-xs text-emerald-300/80 font-semibold leading-relaxed">📋 {s.instructions}</p>
              </div>
            )}
            <div className="flex overflow-x-auto">
              <div className="select-none px-3 sm:px-4 py-5 text-right border-r border-white/5 bg-white/1 flex-shrink-0">
                {(s.starter ?? '').split('\n').map((_, i) => (
                  <div key={i} className="text-xs font-mono text-white/15 leading-6">{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 px-4 sm:px-5 py-5 text-sm font-mono text-green-300 leading-6 whitespace-pre-wrap break-all min-w-0 max-w-full overflow-x-auto">{s.starter}</pre>
            </div>
            {s.hint && (
              <div className="px-4 sm:px-5 py-3 border-t border-white/5 bg-amber-500/5">
                <p className="text-xs text-amber-300/80 font-semibold">💡 {s.hint}</p>
              </div>
            )}
            <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/20 font-mono">Python 3.10</span>
              <Link href={`/dashboard/coach?topic=${encodeURIComponent(lesson.title)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent5 hover:text-white transition-colors">
                🤖 {lang === 'ar' ? 'اسأل المدرب' : lang === 'fr' ? 'Demander au Coach' : 'Ask AI Coach'}
              </Link>
            </div>
          </div>
        )

      // ── QUIZ ─────────────────────────────────────────────
      case 'quiz': {
        const state     = quizState[idx] ?? { selected: null, submitted: false }
        const penalty   = penaltyTimer[idx] ?? 0
        const isCorrect = state.submitted && state.selected === s.correct
        const isWrong   = state.submitted && state.selected !== s.correct
        const isLocked  = penalty > 0
        return (
          <div key={idx} className={cn('rounded-2xl p-4 sm:p-6 border transition-all',
            isCorrect ? 'bg-accent3/8 border-accent3/30' : isWrong ? 'bg-red-500/5 border-red-500/20' : 'bg-card border-accent5/25')}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{isCorrect ? '✅' : isWrong ? '❌' : '❓'}</span>
              <span className="text-xs font-bold text-accent5 uppercase tracking-wider">{t.quiz}</span>
            </div>
            <p className="font-extrabold text-sm mb-4 sm:mb-5 leading-relaxed">{s.question}</p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
              {(s.options ?? []).map((opt, oi) => {
                let cls = 'border-white/8 bg-card2 text-muted hover:border-white/25 hover:text-white cursor-pointer'
                if (state.submitted) {
                  if (oi === s.correct && state.selected === oi) cls = 'border-accent3/60 bg-accent3/15 text-accent3 cursor-default'
                  else if (state.selected === oi) cls = 'border-red-500/40 bg-red-500/10 text-red-400 cursor-default'
                  else cls = 'border-white/5 bg-card2/50 text-muted/50 cursor-default'
                } else if (state.selected === oi) cls = 'border-accent5/50 bg-accent5/15 text-white cursor-pointer'
                if (isLocked) cls = 'border-white/5 bg-card2/30 text-muted/30 cursor-not-allowed'
                return (
                  <button key={oi} onClick={() => selectOption(idx, oi)} disabled={state.submitted || isLocked}
                    className={cn('w-full text-start px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm font-bold border transition-all', cls)}>
                    <span className="font-extrabold mr-2 sm:mr-3 text-muted/60">{String.fromCharCode(65 + oi)}.</span>{opt}
                  </button>
                )
              })}
            </div>
            {!state.submitted && !isLocked ? (
              <button onClick={() => submitQuiz(idx, s.correct!)} disabled={state.selected === null}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {t.submit}
              </button>
            ) : isWrong && isLocked ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-xl animate-pulse">⏳</span>
                <div className="flex-1">
                  <p className="text-xs font-extrabold text-red-400 mb-0.5">{t.wrong}</p>
                  <p className="text-xs text-red-400/70 font-semibold">
                    {lang === 'ar' ? `يمكنك المحاولة مجدداً خلال ${penalty} ثانية` : lang === 'fr' ? `Réessaye dans ${penalty}s` : `Try again in ${penalty}s`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-red-500/40 bg-red-500/10 flex items-center justify-center">
                  <span className="text-sm font-extrabold text-red-400 tabular-nums">{penalty}</span>
                </div>
              </div>
            ) : isCorrect ? (
              <div className="space-y-2">
                <p className="text-sm font-extrabold text-accent3">{t.correct}</p>
                {s.explanation && (
                  <div className="mt-3 bg-white/4 border border-white/8 rounded-xl p-3 sm:p-4">
                    <p className="text-xs font-bold text-accent2 mb-1">{lang === 'ar' ? 'الشرح' : lang === 'fr' ? 'Explication' : 'Explanation'}</p>
                    <p className="text-sm text-muted font-semibold leading-relaxed">{s.explanation}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )
      }

      // ── STEPS ────────────────────────────────────────────
      case 'steps':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="text-lg">🪜</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.steps}</span>
            </div>
            {s.text && <p className="text-sm font-semibold text-muted mb-4 leading-relaxed">{s.text}</p>}
            <ol className="space-y-3">
              {(s.items ?? []).map((item, i) => (
                <li key={i} className="flex gap-3 sm:gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent4 to-accent5 flex items-center justify-center text-xs font-extrabold text-white">{i + 1}</span>
                  <p className="text-sm font-semibold leading-relaxed pt-0.5">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        )

      // ── CHALLENGE ────────────────────────────────────────
      case 'challenge':
        return (
          <div key={idx} className="bg-gradient-to-br from-accent2/8 to-accent1/8 border-2 border-accent2/30 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <span className="text-xs font-extrabold text-accent2 uppercase tracking-wider">{t.challenge}</span>
            </div>
            {s.title && <p className="font-extrabold text-base mb-2">{s.title}</p>}
            <p className="text-sm font-semibold leading-relaxed mb-4">{s.text}</p>
            {s.expected_output && (
              <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-xs font-bold text-muted mb-2">{lang === 'ar' ? 'النتيجة المتوقعة:' : lang === 'fr' ? 'Résultat attendu :' : 'Expected output:'}</p>
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap overflow-x-auto break-all max-w-full">{s.expected_output}</pre>
              </div>
            )}
            {s.hint && (
              <details className="mt-2">
                <summary className="text-xs font-bold text-accent5 cursor-pointer hover:text-white transition-colors select-none">
                  💬 {lang === 'ar' ? 'تلميح' : lang === 'fr' ? 'Indice' : 'Hint'}
                </summary>
                <p className="text-sm text-muted font-semibold mt-2 leading-relaxed pl-4 border-l-2 border-accent5/30">{s.hint}</p>
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
          <div key={idx} className={cn('rounded-2xl p-4 sm:p-5 border flex gap-3 sm:gap-4', st.bg, st.border)}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{st.icon}</span>
            <div>
              <p className={cn('font-extrabold text-xs mb-1.5 uppercase tracking-wider', st.text)}>{st.label}</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">{s.text}</p>
            </div>
          </div>
        )
      }

      // ── COMPARISON ───────────────────────────────────────
      case 'comparison':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-white/8 flex items-center gap-2">
              <span className="text-sm">🔄</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.comparison}</span>
            </div>
            {s.text && <p className="px-4 sm:px-5 pt-4 text-sm font-semibold text-muted leading-relaxed">{s.text}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-white/8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xs">✗</span>
                  <span className="text-xs font-extrabold text-red-400 uppercase">{s.before_label ?? (lang === 'ar' ? 'قبل' : lang === 'fr' ? 'Avant' : 'Before')}</span>
                </div>
                <pre className="text-xs font-mono text-red-400/80 bg-red-500/5 border border-red-500/15 rounded-xl p-3 sm:p-4 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-w-full">{s.before}</pre>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-accent3/20 border border-accent3/40 flex items-center justify-center text-xs text-accent3">✓</span>
                  <span className="text-xs font-extrabold text-accent3 uppercase">{s.after_label ?? (lang === 'ar' ? 'بعد' : lang === 'fr' ? 'Après' : 'After')}</span>
                </div>
                <pre className="text-xs font-mono text-accent3/80 bg-accent3/5 border border-accent3/15 rounded-xl p-3 sm:p-4 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-w-full">{s.after}</pre>
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
          <div key={idx} className={cn('rounded-2xl p-4 sm:p-6 border transition-all', allDone ? 'bg-accent3/8 border-accent3/30' : 'bg-card border-white/8')}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{allDone ? '✅' : '☑️'}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.checklist}</span>
            </div>
            {s.text && <p className="text-sm font-semibold text-muted mb-4 leading-relaxed">{s.text}</p>}
            <div className="space-y-2 sm:space-y-3">
              {checks.map((item, i) => (
                <button key={i} onClick={() => toggleCheck(idx, i, checks.length)}
                  className={cn('w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border text-sm font-semibold text-start transition-all',
                    states[i] ? 'bg-accent3/10 border-accent3/30 text-accent3' : 'bg-card2 border-white/8 text-muted hover:border-white/20 hover:text-white')}>
                  <span className={cn('w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all', states[i] ? 'bg-accent3 border-accent3 text-white' : 'border-white/20')}>
                    {states[i] && <span className="text-xs font-extrabold">✓</span>}
                  </span>
                  <span className={cn(states[i] && 'line-through opacity-70')}>{item}</span>
                </button>
              ))}
            </div>
            {allDone && <p className="text-xs font-extrabold text-accent3 mt-4">{lang === 'ar' ? '🎉 أحسنت! اكتملت جميع العناصر' : lang === 'fr' ? '🎉 Bravo ! Tout est coché !' : '🎉 All done!'}</p>}
          </div>
        )
      }

      // ── VIDEO ────────────────────────────────────────────
      case 'video': {
        const embedUrl = s.url ? getVideoEmbed(s.url) : null
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/8">
              <span className="text-sm">▶️</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.video}</span>
              {s.caption && <span className="text-xs text-muted/60 font-semibold ml-auto truncate max-w-[50%] sm:max-w-[60%]">{s.caption}</span>}
            </div>
            {embedUrl ? (
              <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
                <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen title={s.caption ?? 'Lesson video'} loading="lazy" />
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <div className="text-5xl mb-4">▶️</div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-extrabold text-sm bg-red-600/20 text-red-400 border border-red-500/25 hover:bg-red-600/30 transition-all">
                  ▶️ {lang === 'ar' ? 'مشاهدة الفيديو' : lang === 'fr' ? 'Voir la vidéo' : 'Watch Video'} ↗
                </a>
              </div>
            )}
          </div>
        )
      }

      // ── WEBSITE EMBED ─────────────────────────────────────
      case 'website': {
        const iframeSrc   = s.embed_url ?? s.url ?? ''
        const frameHeight = s.height ?? 500
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/8 bg-card2">
              <span className="text-sm flex-shrink-0">🔗</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider flex-1 truncate">{t.website}</span>
              {(s.url ?? s.embed_url) && (
                <a href={s.url ?? s.embed_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-accent5 hover:text-white transition-colors flex-shrink-0 ml-2">
                  ↗ <span className="hidden sm:inline">{t.openSite}</span>
                </a>
              )}
            </div>
            {s.caption && <div className="px-4 sm:px-5 py-2 border-b border-white/5 bg-white/1"><p className="text-xs font-semibold text-muted">{s.caption}</p></div>}
            <div className="px-3 sm:px-4 py-2 bg-white/3 border-b border-white/5 flex items-center gap-2">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs font-mono text-muted/50 truncate">{iframeSrc}</div>
            </div>
            {iframeSrc ? (
              <iframe src={iframeSrc} style={{ height: frameHeight }} className="w-full max-w-full border-0 block"
                title={s.caption ?? 'Interactive resource'} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" loading="lazy" />
            ) : (
              <div className="flex items-center justify-center text-muted text-sm font-semibold" style={{ height: frameHeight }}>No URL provided</div>
            )}
            {s.text && <div className="px-4 sm:px-5 py-4 border-t border-white/5"><p className="text-xs font-semibold text-muted leading-relaxed">{s.text}</p></div>}
          </div>
        )
      }

      // ── IMAGE ────────────────────────────────────────────
      case 'image':
        return (
          <div key={idx} className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/8">
              <span className="text-sm">🖼️</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t.image}</span>
            </div>
            <div className="p-3 sm:p-4">
              {s.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.src} alt={s.alt ?? 'Lesson diagram'} className="w-full rounded-xl border border-white/8 object-contain max-h-64 sm:max-h-96" />
              ) : (
                <div className="h-32 sm:h-40 bg-card2 rounded-xl flex items-center justify-center text-muted text-sm font-semibold">🖼️ Image placeholder</div>
              )}
            </div>
            {(s.alt || s.text) && <p className="px-4 sm:px-5 pb-4 text-xs text-muted font-semibold">{s.alt ?? s.text}</p>}
          </div>
        )

      // ── EXTERNAL ACTIVITY ────────────────────────────────
      case 'external': {
        const platformIcons: Record<string, string> = {
          jupyter: '📓', replit: '💻', scratch: '🐱', 'code.org': '💡',
          colab: '📊', kaggle: '🏆', codepen: '✏️', glitch: '🎏',
          trinket: '💎', w3schools: '🌐', ide: '⌨️',
        }
        const platformKey = (s.platform ?? '').toLowerCase()
        const icon = Object.entries(platformIcons).find(([k]) => platformKey.includes(k))?.[1] ?? '↗'
        const btnLabel = s.button_label ?? `Open on ${s.platform ?? 'external platform'}`
        return (
          <div key={idx} className="rounded-2xl overflow-hidden border border-accent4/30 bg-gradient-to-br from-accent4/8 to-accent5/8">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/2">
              <span className="text-base flex-shrink-0">{icon}</span>
              <span className="text-xs font-bold text-accent4 uppercase tracking-wider">{t.external}</span>
              {s.platform && <span className="ml-auto text-xs font-bold text-muted bg-white/5 border border-white/8 px-2 sm:px-2.5 py-0.5 rounded-full truncate max-w-[40%]">{s.platform}</span>}
            </div>
            <div className="p-4 sm:p-6">
              {s.title && <h3 className="font-extrabold text-base mb-2">{s.title}</h3>}
              {s.text && <p className="text-sm font-semibold text-muted leading-relaxed mb-4 sm:mb-5">{s.text}</p>}
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent5/20 transition-all w-full justify-center">
                <span className="text-lg">{icon}</span>
                <span className="truncate">{btnLabel}</span>
                <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0">↗</span>
              </a>
              <p className="text-center text-xs text-muted font-semibold mt-4">{t.externalDone}</p>
            </div>
            <div className="px-4 sm:px-5 py-3 border-t border-white/5 bg-white/1">
              <p className="text-xs text-muted/60 font-semibold">{t.externalDesc}</p>
            </div>
          </div>
        )
      }

      // ── NEW: SPEED QUIZ ───────────────────────────────────
      case 'speed_quiz':
        return <div key={idx}><SpeedQuizActivity s={s} t={t} /></div>

      // ── NEW: FILL IN THE BLANK ────────────────────────────
      case 'fill_blank':
        return <div key={idx}><FillBlankActivity s={s} t={t} /></div>

      // ── NEW: DRAG & DROP ──────────────────────────────────
      case 'drag_drop':
        return <div key={idx}><DragDropActivity s={s} t={t} /></div>

      // ── NEW: UNSCRAMBLE ───────────────────────────────────
      case 'unscramble':
        return <div key={idx}><UnscrambleActivity s={s} t={t} /></div>

      // ── NEW: BUG HUNT ─────────────────────────────────────
      case 'debug':
        return <div key={idx}><DebugActivity s={s} t={t} /></div>

      // ── NEW: TIMED CHALLENGE ──────────────────────────────
      case 'timed_challenge':
        return <div key={idx}><TimedChallengeActivity s={s} t={t} lessonTitle={lesson.title} /></div>

      // ── NEW: REMIX ────────────────────────────────────────
      case 'remix':
        return <div key={idx}><RemixActivity s={s} t={t} lessonTitle={lesson.title} /></div>

      // ── NEW: SUBMIT WORK ──────────────────────────────────
      case 'submit_work':
        return <div key={idx}><SubmitWorkActivity s={s} t={t} userId={userId} lessonId={lesson.id} /></div>

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
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl w-full overflow-x-hidden" dir={dir}>
      {/* Toast */}
      <div className={cn('fixed top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-50 px-5 py-3 rounded-2xl bg-card border border-accent2/30 text-accent2 font-bold text-sm shadow-xl transition-all duration-300',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none')}>
        {toast}
      </div>

      {/* Level-up overlay */}
      {levelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setLevelUp(null)}>
          <div className="bg-card border border-accent2/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl w-full max-w-sm">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🎊</div>
            <h2 className="font-fredoka text-3xl sm:text-4xl text-accent2 mb-2">{levelUp}</h2>
            <p className="text-muted font-bold text-sm">{lang === 'ar' ? 'استمر، أنت لا يُوقف!' : lang === 'fr' ? 'Continue — inarrêtable !' : 'Keep going — unstoppable!'}</p>
          </div>
        </div>
      )}

      {/* Back */}
      <Link href={`/dashboard/skills/${skill?.id}`} className="inline-flex items-center gap-1 text-muted font-bold text-sm hover:text-white transition-colors mb-5 sm:mb-6">
        {t.back}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-3">
        <div className="text-4xl sm:text-5xl flex-shrink-0 leading-none mt-0.5">{lesson.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-muted">{t.lesson} {lessonIndex}/{totalLessons}</span>
            {isDone && <span className="text-xs font-bold text-accent3 bg-accent3/10 border border-accent3/25 px-2.5 py-0.5 rounded-full">{t.completedBefore}</span>}
          </div>
          <h1 className="font-fredoka text-xl sm:text-2xl lg:text-3xl leading-tight">{lesson.title}</h1>
          <p className="text-muted font-semibold text-sm mt-1 leading-relaxed">{lesson.description}</p>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <span className="text-xs font-bold bg-accent2/15 text-accent2 border border-accent2/25 px-3 py-1 rounded-full">+{lesson.xp_reward} XP</span>
        <span className="text-xs font-bold text-muted">⏱ {lesson.duration_mins} min</span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="flex-1 h-2 bg-card2 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent4 to-accent5 rounded-full transition-all duration-700"
            style={{ width: `${Math.round((lessonIndex / totalLessons) * 100)}%` }} />
        </div>
        <span className="text-xs font-bold text-muted flex-shrink-0">{Math.round((lessonIndex / totalLessons) * 100)}%</span>
      </div>

      {/* AI Coach banner */}
      <div className="bg-gradient-to-r from-accent5/10 to-accent1/10 border border-accent5/20 rounded-2xl p-4 mb-6 sm:mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🤖</span>
          <div>
            <p className="font-extrabold text-sm">{lang === 'ar' ? 'لديك سؤال؟ مدربك الذكي هنا!' : lang === 'fr' ? 'Une question ? Ton Coach IA est là !' : 'Confused? Your AI Coach is here!'}</p>
            <p className="text-muted text-xs font-semibold">{lang === 'ar' ? 'اسأله أي شيء عن هذا الدرس' : lang === 'fr' ? "Demande n'importe quoi sur cette leçon" : 'Ask anything about this lesson'}</p>
          </div>
        </div>
        <Link href={coachUrl} className="flex-shrink-0 px-5 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all text-center">
          {t.askCoach}
        </Link>
      </div>

      {/* Content sections */}
      <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
        {sections.length > 0
          ? sections.map((s, i) => renderSection(s, i))
          : <div className="bg-card border border-white/8 rounded-2xl p-8 text-center"><p className="text-muted font-semibold text-sm">Content loading...</p></div>
        }
      </div>

      {/* Complete button */}
      {!isDone && (
        <div className="bg-card border border-white/8 rounded-2xl p-5 sm:p-6 mb-5 sm:mb-6 text-center">
          {blockingItems.length > 0 && (
            <ul className="mb-4 space-y-1">
              {blockingItems.map((item, i) => (
                <li key={i} className="text-xs text-muted font-semibold flex items-center justify-center gap-2">
                  <span className="text-accent5">›</span> {item}
                </li>
              ))}
            </ul>
          )}
          <button onClick={markComplete} disabled={isPending || !canComplete}
            className={cn('w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all',
              isPending ? 'opacity-50 cursor-not-allowed bg-card2 text-muted' :
              !canComplete ? 'bg-card2 text-muted/60 cursor-not-allowed border border-white/5' :
              'bg-gradient-to-r from-accent3 to-accent4 text-white hover:-translate-y-1 hover:shadow-xl shadow-lg')}>
            {isPending ? '⏳ Saving...' : t.complete}
          </button>
        </div>
      )}

      {isDone && (
        <LessonCompletionPanel
          userId={userId}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonEmoji={lesson.emoji}
          xpEarned={lesson.xp_reward}
          streak={streak}
          skillId={skill.id}
          skillTitle={skill.title}
          nextLesson={nextLesson ?? null}
          lang={lang as 'en' | 'ar' | 'fr'}
          finishedAllTracks={finishedAllTracks}
        />
      
)}

      {/* Prev / Next nav */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-white/5">
        {prevLesson ? (
          <Link href={`/dashboard/skills/${skill?.id}/lesson/${prevLesson.id}`}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-3 rounded-xl font-extrabold text-sm border border-white/10 text-muted hover:text-white hover:border-white/25 transition-all truncate">
            ← {prevLesson.emoji} <span className="truncate">{prevLesson.title}</span>
          </Link>
        ) : (
          <Link href={`/dashboard/skills/${skill?.id}`} className="text-sm font-bold text-muted hover:text-white transition-colors text-center sm:text-left">← {t.back}</Link>
        )}
        {nextLesson ? (
          <Link href={`/dashboard/skills/${skill?.id}/lesson/${nextLesson.id}`}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all truncate">
            {nextLesson.emoji} <span className="truncate">{nextLesson.title}</span> →
          </Link>
        ) : (
          <Link href={`/dashboard/skills/${skill?.id}`}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent2 to-accent1 text-black hover:-translate-y-0.5 hover:shadow-lg transition-all">
            {t.finish}
          </Link>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" onClick={() => setShowFeedback(false)}>
          <div className="bg-card border border-white/10 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <LessonFeedback userId={userId} lessonId={lesson.id} lang={lang as 'en'|'ar'|'fr'} onDone={() => setShowFeedback(false)} onSkip={() => setShowFeedback(false)} />
          </div>
        </div>
      )}

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}