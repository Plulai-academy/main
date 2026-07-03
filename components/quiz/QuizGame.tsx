'use client'
// components/quiz/QuizGame.tsx
// Full adaptive quiz game — hearts, streaks, chest drop, infinite sessions

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizOption  { text: string; is_correct: boolean }
interface QuizQuestion {
  id: string; month: number; topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string; options: QuizOption[]
  hint: string | null; explanation: string | null
  xp_reward: number
}
interface ChestDrop {
  tier: 'wood' | 'silver' | 'gold' | 'legendary'
  emoji: string; color: string; label: string
  xp: number; coins: number; badge_id: string | null
}
interface Props {
  userId:     string
  ageGroup:   'pro' | 'expert'
  language?:  'en' | 'ar' | 'fr'
  questions:  QuizQuestion[]   // pre-fetched batch (5-15)
  sessionId:  string           // created server-side before render
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_HEARTS   = 3
const STREAK_BONUS = [0, 0, 0, 50, 100, 150] // bonus XP at streak 3, 4, 5+

const CHEST_STYLES: Record<string, { bg: string; border: string; glow: string }> = {
  wood:      { bg: 'from-amber-900/40 to-amber-800/20',  border: 'border-amber-700/50', glow: 'shadow-amber-900/40' },
  silver:    { bg: 'from-slate-500/40 to-slate-400/20',  border: 'border-slate-400/50', glow: 'shadow-slate-500/40' },
  gold:      { bg: 'from-yellow-500/40 to-yellow-400/20',border: 'border-yellow-400/50',glow: 'shadow-yellow-500/50' },
  legendary: { bg: 'from-purple-600/40 to-purple-500/20',border: 'border-purple-400/50',glow: 'shadow-purple-500/60' },
}

const DIFFICULTY_COLOR = {
  easy:   'text-emerald-400 bg-emerald-400/10',
  medium: 'text-amber-400  bg-amber-400/10',
  hard:   'text-red-400    bg-red-400/10',
}

const UI = {
  en: {
    streak: 'Streak', hearts: 'Hearts', correct: 'Correct!', wrong: 'Not quite!',
    hint: 'Hint', next: 'Next Question', explanation: 'Why?',
    sessionOver: 'Session Over', chestEarned: 'Chest Earned!',
    open: 'Open Chest', xpEarned: 'XP', coinsEarned: 'Coins',
    keepGoing: 'Keep Going!', newSession: 'New Session',
    masteredBanner: '🎉 Concept Mastered!',
    topic: 'Topic', difficulty: 'Difficulty',
    loading: 'Loading next question…',
    flagged: '⚑ Flagged for review',
  },
  ar: {
    streak: 'سلسلة', hearts: 'قلوب', correct: 'صحيح!', wrong: 'ليس تماماً!',
    hint: 'تلميح', next: 'السؤال التالي', explanation: 'لماذا؟',
    sessionOver: 'انتهت الجلسة', chestEarned: 'حصلت على صندوق!',
    open: 'افتح الصندوق', xpEarned: 'XP', coinsEarned: 'عملات',
    keepGoing: 'استمر!', newSession: 'جلسة جديدة',
    masteredBanner: '🎉 أتقنت المفهوم!',
    topic: 'الموضوع', difficulty: 'الصعوبة',
    loading: 'جارٍ تحميل السؤال…',
    flagged: '⚑ مُعلَّم للمراجعة',
  },
  fr: {
    streak: 'Série', hearts: 'Vies', correct: 'Correct !', wrong: 'Pas tout à fait !',
    hint: 'Indice', next: 'Question suivante', explanation: 'Pourquoi ?',
    sessionOver: 'Session terminée', chestEarned: 'Coffre gagné !',
    open: 'Ouvrir le coffre', xpEarned: 'XP', coinsEarned: 'Pièces',
    keepGoing: 'Continue !', newSession: 'Nouvelle session',
    masteredBanner: '🎉 Concept maîtrisé !',
    topic: 'Sujet', difficulty: 'Difficulté',
    loading: 'Chargement…',
    flagged: '⚑ Marqué pour révision',
  },
}

// ─── Heart Icon ───────────────────────────────────────────────────────────────
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(
      'w-7 h-7 transition-all duration-300',
      filled ? 'fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'fill-white/15'
    )}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}

// ─── Streak Fire ──────────────────────────────────────────────────────────────
function StreakBadge({ count }: { count: number }) {
  if (count < 2) return null
  return (
    <div className={cn(
      'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-extrabold transition-all',
      count >= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
      count >= 3 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                   'bg-orange-500/15 text-orange-400 border border-orange-500/20'
    )}>
      🔥 {count}
    </div>
  )
}

// ─── Chest Reveal Component ───────────────────────────────────────────────────
function ChestReveal({
  chest, onClose, onNewSession, t,
}: {
  chest: ChestDrop
  onClose: () => void
  onNewSession: () => void
  t: typeof UI['en']
}) {
  const [opened, setOpened] = useState(false)
  const [shaking, setShaking] = useState(false)
  const style = CHEST_STYLES[chest.tier]

  useEffect(() => {
    // Shake the chest before opening
    const t1 = setTimeout(() => setShaking(true), 400)
    const t2 = setTimeout(() => { setShaking(false); setOpened(true) }, 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={cn(
        'w-full max-w-sm rounded-3xl border p-8 text-center bg-gradient-to-b shadow-2xl',
        style.bg, style.border, style.glow
      )}>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">{t.sessionOver}</p>
        <p className="text-lg font-extrabold mb-6">{t.chestEarned}</p>

        {/* Chest emoji — shakes then reveals */}
        <div
          className={cn(
            'text-8xl mb-6 transition-transform select-none cursor-pointer',
            shaking && 'animate-[wiggle_0.15s_ease-in-out_5]',
            !opened && 'hover:scale-110'
          )}
          onClick={() => !opened && setOpened(true)}
        >
          {opened ? chest.emoji : '📦'}
        </div>

        {opened ? (
          <div className="space-y-4 animate-[fadeIn_0.4s_ease]">
            <p className="font-extrabold text-2xl" style={{ color: chest.color }}>
              {chest.label}
            </p>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-[#1CB0F6]">+{chest.xp}</p>
                <p className="text-xs text-muted font-bold">{t.xpEarned}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-amber-400">+{chest.coins}</p>
                <p className="text-xs text-muted font-bold">{t.coinsEarned}</p>
              </div>
            </div>
            {chest.badge_id && (
              <div className="bg-white/8 rounded-2xl p-3">
                <p className="text-xs font-bold text-amber-400">🏅 Badge Unlocked!</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onNewSession}
                className="flex-1 py-3 rounded-2xl bg-[#1CB0F6] text-black font-extrabold text-sm shadow-[0_3px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {t.newSession}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-white/8 font-extrabold text-sm hover:bg-white/12 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted font-bold animate-pulse">{t.open} →</p>
        )}
      </div>
    </div>
  )
}

// ─── Main Quiz Game ───────────────────────────────────────────────────────────
export default function QuizGame({ userId, ageGroup, language = 'en', questions, sessionId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const t = UI[language] ?? UI.en
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  // ── State ──────────────────────────────────────────────────────────────────
  const [queue, setQueue]             = useState<QuizQuestion[]>(questions)
  const [qIndex, setQIndex]           = useState(0)
  const [hearts, setHearts]           = useState(MAX_HEARTS)
  const [streak, setStreak]           = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalXP, setTotalXP]         = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [answered, setAnswered]       = useState(false)
  const [showHint, setShowHint]       = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [masteredTopic, setMasteredTopic]     = useState<string | null>(null)
  const [chest, setChest]             = useState<ChestDrop | null>(null)
  const [sessionDead, setSessionDead] = useState(false)
  const [loading, setLoading]         = useState(false)

  const current = queue[qIndex]
  const isLast  = qIndex >= queue.length - 1

  // ── Answer handler ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (idx: number) => {
    if (answered || !current) return
    setSelectedIdx(idx)
    setAnswered(true)
    setShowHint(false)

    const correct = current.options[idx]?.is_correct ?? false
    const xpGained = correct ? current.xp_reward + (STREAK_BONUS[Math.min(streak + 1, 5)] ?? 0) : 0

    if (correct) {
      setStreak(s => s + 1)
      setTotalCorrect(c => c + 1)
      setTotalXP(x => x + xpGained)
    } else {
      setStreak(0)
      setHearts(h => {
        const next = h - 1
        if (next <= 0) {
          // End session after short delay
          setTimeout(() => endSession(), 1400)
        }
        return next
      })
    }

    // Record answer + update mastery server-side
    startTransition(async () => {
      try {
        await fetch('/api/quiz/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId, userId,
            questionId:  current.id,
            topic:       current.topic,
            month:       current.month,
            selectedIdx: idx,
            isCorrect:   correct,
            xpGained,
          }),
        })

        // Check if concept was just mastered (3 correct in a row on same topic)
        if (correct && streak + 1 >= 3) {
          const res = await fetch(`/api/quiz/mastery?userId=${userId}&topic=${current.topic}&month=${current.month}`)
          const data = await res.json()
          if (data.justMastered) setMasteredTopic(current.topic)
        }
      } catch (e) { /* non-fatal */ }
    })
  }, [answered, current, streak, sessionId, userId])

  // ── End session → get chest ────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    setSessionDead(true)
    try {
      const res = await fetch('/api/quiz/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      })
      const data = await res.json()
      if (data.chest) setChest(data.chest)
    } catch (e) { /* show generic chest */ }
  }, [sessionId, userId])

  // ── Next question ──────────────────────────────────────────────────────────
  const nextQuestion = useCallback(async () => {
    setMasteredTopic(null)
    setShowExplanation(false)

    if (isLast) {
      // Fetch more questions from adaptive engine
      setLoading(true)
      try {
        const res = await fetch(`/api/quiz/questions?userId=${userId}&ageGroup=${ageGroup}&count=${Math.floor(Math.random() * 11) + 5}`)
        const data = await res.json()
        if (data.questions?.length) {
          setQueue(prev => [...prev, ...data.questions])
        }
      } catch (e) { /* keep going with what we have */ }
      setLoading(false)
    }

    setQIndex(i => i + 1)
    setSelectedIdx(null)
    setAnswered(false)
    setShowHint(false)
  }, [isLast, userId, ageGroup])

  // ── New session ────────────────────────────────────────────────────────────
  const startNewSession = () => {
    router.refresh() // server re-creates session + fetches new questions
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!answered) {
        if (['1','2','3','4'].includes(e.key)) handleAnswer(Number(e.key) - 1)
      } else {
        if (e.key === 'Enter' || e.key === 'ArrowRight') nextQuestion()
        if (e.key === 'h') setShowHint(h => !h)
        if (e.key === 'e') setShowExplanation(x => !x)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [answered, handleAnswer, nextQuestion])

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!current && !loading) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 md:py-10" dir={dir}>

      {/* Chest reveal overlay */}
      {chest && (
        <ChestReveal
          chest={chest}
          onClose={() => setChest(null)}
          onNewSession={startNewSession}
          t={t}
        />
      )}

      {/* ── HUD ── */}
      <div className="w-full max-w-xl mb-6 flex items-center justify-between gap-4">

        {/* Hearts */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart key={i} filled={i < hearts} />
          ))}
        </div>

        {/* Streak */}
        <StreakBadge count={streak} />

        {/* XP counter */}
        <div className="flex items-center gap-1.5 bg-[#1CB0F6]/10 border border-[#1CB0F6]/25 rounded-full px-3 py-1">
          <span className="text-[#1CB0F6] text-xs font-black">+{totalXP} XP</span>
        </div>
      </div>

      {/* ── Question Card ── */}
      {loading ? (
        <div className="w-full max-w-xl bg-card border border-white/8 rounded-3xl p-8 text-center">
          <p className="text-muted font-bold animate-pulse">{t.loading}</p>
        </div>
      ) : current ? (
        <div className="w-full max-w-xl space-y-4">

          {/* Mastered banner */}
          {masteredTopic && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-center text-sm font-extrabold text-emerald-400 animate-[fadeIn_0.3s_ease]">
              {t.masteredBanner} — {masteredTopic}
            </div>
          )}

          {/* Question */}
          <div className="bg-card border border-white/8 rounded-3xl p-6 shadow-xl">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-bold bg-white/8 text-muted px-2.5 py-1 rounded-full">
                {current.topic}
              </span>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', DIFFICULTY_COLOR[current.difficulty])}>
                {current.difficulty}
              </span>
              <span className="text-xs font-bold text-[#1CB0F6] ml-auto">M{current.month}</span>
            </div>

            <p className="font-extrabold text-base md:text-lg leading-snug whitespace-pre-wrap">
              {current.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {current.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx
              const isCorrect  = opt.is_correct
              let style = 'bg-card border-white/8 hover:border-white/20 hover:bg-white/5'
              if (answered) {
                if (isCorrect)
                  style = 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                else if (isSelected && !isCorrect)
                  style = 'bg-red-500/15 border-red-500/50'
                else
                  style = 'bg-card border-white/5 opacity-50'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border font-semibold text-sm transition-all duration-200 touch-manipulation',
                    style
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span className={cn(
                      'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border',
                      answered && isCorrect  ? 'bg-emerald-500 border-emerald-400 text-white' :
                      answered && isSelected ? 'bg-red-500 border-red-400 text-white' :
                                              'bg-white/8 border-white/15 text-muted'
                    )}>
                      {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Feedback area */}
          {answered && (
            <div className={cn(
              'rounded-3xl p-5 space-y-3 border animate-[fadeIn_0.3s_ease]',
              current.options[selectedIdx ?? 0]?.is_correct
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : 'bg-red-500/10 border-red-500/25'
            )}>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {current.options[selectedIdx ?? 0]?.is_correct ? '🎉' : '💡'}
                </span>
                <p className="font-extrabold">
                  {current.options[selectedIdx ?? 0]?.is_correct ? t.correct : t.wrong}
                </p>
                {streak >= 3 && current.options[selectedIdx ?? 0]?.is_correct && (
                  <span className="ml-auto text-xs font-black text-amber-400">
                    🔥 +{STREAK_BONUS[Math.min(streak, 5)]} bonus XP
                  </span>
                )}
              </div>

              {/* Hint */}
              {current.hint && !current.options[selectedIdx ?? 0]?.is_correct && (
                <div>
                  <button
                    onClick={() => setShowHint(h => !h)}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    {t.hint} {showHint ? '▲' : '▼'}
                  </button>
                  {showHint && (
                    <p className="text-sm text-muted font-semibold mt-1 leading-relaxed">
                      {current.hint}
                    </p>
                  )}
                </div>
              )}

              {/* Explanation */}
              {current.explanation && (
                <div>
                  <button
                    onClick={() => setShowExplanation(x => !x)}
                    className="text-xs font-bold text-[#1CB0F6] hover:underline"
                  >
                    {t.explanation} {showExplanation ? '▲' : '▼'}
                  </button>
                  {showExplanation && (
                    <p className="text-sm text-muted font-semibold mt-1 leading-relaxed">
                      {current.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Flagged notice */}
              {!current.options[selectedIdx ?? 0]?.is_correct && (
                <p className="text-xs font-bold text-red-400/70">{t.flagged}</p>
              )}
            </div>
          )}

          {/* Next button */}
          {answered && hearts > 0 && !sessionDead && (
            <button
              onClick={nextQuestion}
              className="w-full py-4 rounded-2xl bg-[#1CB0F6] text-black font-extrabold text-sm shadow-[0_4px_0_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all touch-manipulation"
            >
              {t.next} →
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}