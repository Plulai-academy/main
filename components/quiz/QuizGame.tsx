'use client'
// components/quiz/QuizGame.tsx  v2
// Duolingo-style · shuffled answers · animated chest · session persistence · rebalanced XP

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizOption   { text: string; is_correct: boolean }
interface ShuffledOpt  { text: string; is_correct: boolean; origIdx: number }
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
  userId:       string
  ageGroup:     'pro' | 'expert'
  language?:    'en' | 'ar' | 'fr'
  questions:    QuizQuestion[]
  sessionId:    string
  initialHearts: number   // from resumed session
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_HEARTS    = 3
const XP_PER_CORRECT = 5
const STREAK_BONUS  = 10   // bonus XP at streak ≥ 5
const STREAK_MIN    = 5    // streak must reach this for bonus

// Shuffle array — Fisher-Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptions(q: QuizQuestion): ShuffledOpt[] {
  return shuffle(q.options.map((o, i) => ({ ...o, origIdx: i })))
}

// ─── UI Strings ───────────────────────────────────────────────────────────────
const UI = {
  en: {
    correct:'Correct!', wrong:'Not quite!', next:'Continue',
    hint:'Show hint', explanation:'Why is this correct?',
    streak:'Streak', sessionOver:'Session over',
    chestTap:'Tap to open', opening:'Opening…',
    newSession:'Play again', xp:'XP', coins:'Coins',
    mastered:'🎉 Concept mastered!', flagged:'Marked for review',
    loading:'Loading…', keyTip:'Press 1-4 to answer · Enter to continue',
    difficulty:{ easy:'Easy', medium:'Medium', hard:'Hard' },
  },
  ar: {
    correct:'صحيح!', wrong:'ليس تماماً!', next:'متابعة',
    hint:'أظهر تلميح', explanation:'لماذا هذا صحيح؟',
    streak:'سلسلة', sessionOver:'انتهت الجلسة',
    chestTap:'اضغط للفتح', opening:'جارٍ الفتح…',
    newSession:'العب مجدداً', xp:'XP', coins:'عملات',
    mastered:'🎉 أتقنت المفهوم!', flagged:'مُعلَّم للمراجعة',
    loading:'جارٍ التحميل…', keyTip:'اضغط 1-4 للإجابة · Enter للمتابعة',
    difficulty:{ easy:'سهل', medium:'متوسط', hard:'صعب' },
  },
  fr: {
    correct:'Correct !', wrong:'Pas tout à fait !', next:'Continuer',
    hint:'Afficher l\'indice', explanation:'Pourquoi c\'est correct ?',
    streak:'Série', sessionOver:'Session terminée',
    chestTap:'Appuie pour ouvrir', opening:'Ouverture…',
    newSession:'Rejouer', xp:'XP', coins:'Pièces',
    mastered:'🎉 Concept maîtrisé !', flagged:'Marqué pour révision',
    loading:'Chargement…', keyTip:'Appuie 1-4 · Entrée pour continuer',
    difficulty:{ easy:'Facile', medium:'Moyen', hard:'Difficile' },
  },
}

const DIFF_STYLE = {
  easy:   { bg:'bg-emerald-500/15', text:'text-emerald-400', dot:'bg-emerald-400' },
  medium: { bg:'bg-amber-500/15',   text:'text-amber-400',   dot:'bg-amber-400' },
  hard:   { bg:'bg-red-500/15',     text:'text-red-400',     dot:'bg-red-400' },
}

const CHEST_CFG = {
  wood:      { bg:'#3D2B1F', lid:'#5C3D2A', body:'#4A3020', clasp:'#C49A3C', glow:'rgba(196,154,60,0.3)',  label:'Wood',      coins_color:'#C49A3C' },
  silver:    { bg:'#2A2A35', lid:'#6B6B80', body:'#555568', clasp:'#E0E0FF', glow:'rgba(180,180,255,0.3)', label:'Silver',    coins_color:'#C0C0FF' },
  gold:      { bg:'#2D2500', lid:'#C9A227', body:'#A07820', clasp:'#FFE066', glow:'rgba(255,200,0,0.5)',   label:'Gold',      coins_color:'#FFE066' },
  legendary: { bg:'#1A0A2E', lid:'#7B2FBE', body:'#5A1E8C', clasp:'#DA77FF', glow:'rgba(180,100,255,0.6)',label:'Legendary', coins_color:'#DA77FF' },
}

// ─── Heart SVG ────────────────────────────────────────────────────────────────
function Heart({ filled, breaking }: { filled: boolean; breaking?: boolean }) {
  return (
    <div className={cn('transition-all duration-300', breaking && 'animate-[heartBreak_0.4s_ease_forwards]')}>
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <path
          d="M16 28s-14-9-14-18a7 7 0 0 1 14 0 7 7 0 0 1 14 0c0 9-14 18-14 18z"
          fill={filled ? '#FF4B4B' : 'rgba(255,255,255,0.12)'}
          stroke={filled ? '#C0392B' : 'rgba(255,255,255,0.08)'}
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
        {filled && (
          <path d="M10 14 Q16 8 22 14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
        )}
      </svg>
    </div>
  )
}

// ─── Animated Chest ───────────────────────────────────────────────────────────
function AnimatedChest({ tier, onOpen, opened, t }: {
  tier: keyof typeof CHEST_CFG
  onOpen: () => void
  opened: boolean
  t: typeof UI['en']
}) {
  const cfg = CHEST_CFG[tier]
  const [shaking, setShaking] = useState(false)
  const [lidAngle, setLidAngle] = useState(0)
  const [particles, setParticles] = useState<{ x:number; y:number; color:string; id:number }[]>([])

  useEffect(() => {
    // Shake after 600ms
    const t1 = setTimeout(() => {
      setShaking(true)
      setTimeout(() => setShaking(false), 800)
    }, 600)
    return () => clearTimeout(t1)
  }, [])

  const handleOpen = () => {
    if (opened) return
    // Animate lid opening
    let angle = 0
    const interval = setInterval(() => {
      angle += 8
      setLidAngle(angle)
      if (angle >= 110) {
        clearInterval(interval)
        // Spawn particles
        setParticles(Array.from({ length: 12 }, (_, i) => ({
          id: i,
          x: 50 + Math.cos((i / 12) * Math.PI * 2) * 40,
          y: 50 + Math.sin((i / 12) * Math.PI * 2) * 40,
          color: [cfg.clasp, cfg.coins_color, '#fff', cfg.clasp][i % 4],
        })))
        setTimeout(() => { setParticles([]); onOpen() }, 600)
      }
    }, 16)
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Glow */}
      <div
        className="relative w-44 h-44 flex items-center justify-center cursor-pointer select-none"
        style={{ filter: `drop-shadow(0 0 32px ${cfg.glow})` }}
        onClick={handleOpen}
      >
        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-3 h-3 rounded-full animate-[particleFly_0.6s_ease_forwards]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.color }}
          />
        ))}

        {/* SVG Chest */}
        <svg
          viewBox="0 0 100 80"
          className={cn('w-44 h-36 transition-transform', shaking && 'animate-[wiggle_0.15s_ease-in-out_4]')}
        >
          {/* Body */}
          <rect x="8" y="38" width="84" height="38" rx="6" fill={cfg.body} stroke={cfg.clasp} strokeWidth="2"/>
          {/* Body band */}
          <rect x="8" y="50" width="84" height="10" rx="0" fill={cfg.lid} opacity="0.6"/>
          {/* Body clasp center */}
          <rect x="42" y="47" width="16" height="16" rx="4" fill={cfg.clasp}/>
          <rect x="46" y="51" width="8" height="8" rx="2" fill={cfg.bg}/>

          {/* Lid — rotates from bottom edge of lid (y=38) */}
          <g
            transform={`rotate(${-lidAngle}, 50, 38)`}
            style={{ transformOrigin: '50px 38px', transformBox: 'fill-box' }}
          >
            <rect x="8" y="12" width="84" height="28" rx="6" fill={cfg.lid} stroke={cfg.clasp} strokeWidth="2"/>
            {/* Lid band */}
            <rect x="8" y="30" width="84" height="8" rx="0" fill={cfg.body} opacity="0.5"/>
            {/* Lid clasp */}
            <rect x="42" y="26" width="16" height="14" rx="4" fill={cfg.clasp}/>
            <rect x="46" y="30" width="8" height="6" rx="2" fill={cfg.bg}/>
            {/* Rivets */}
            {[20,36,64,80].map(x => (
              <circle key={x} cx={x} cy="19" r="3" fill={cfg.clasp} opacity="0.8"/>
            ))}
          </g>

          {/* Lock icon on body when closed */}
          {lidAngle === 0 && (
            <text x="50" y="74" textAnchor="middle" fontSize="10" fill={cfg.clasp} opacity="0.7">✦ ✦ ✦</text>
          )}
        </svg>
      </div>

      {/* Tier label */}
      <div className="px-4 py-1.5 rounded-full text-sm font-extrabold border" style={{
        color: cfg.clasp, borderColor: `${cfg.clasp}44`, background: `${cfg.clasp}15`
      }}>
        {cfg.label} Chest
      </div>

      {!opened && (
        <p className="text-sm text-muted font-bold animate-pulse">{t.chestTap} 👆</p>
      )}
    </div>
  )
}

// ─── Session Over Screen ───────────────────────────────────────────────────────
function SessionOverScreen({ chest, onNewSession, t }: {
  chest: ChestDrop | null
  onNewSession: () => void
  t: typeof UI['en']
}) {
  const [chestOpened, setChestOpened] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const tier = (chest?.tier ?? 'wood') as keyof typeof CHEST_CFG
  const cfg  = CHEST_CFG[tier]

  const handleOpen = () => {
    setChestOpened(true)
    setTimeout(() => setShowRewards(true), 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1622] px-6 text-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted mb-2">{t.sessionOver}</p>

      {chest ? (
        <>
          <AnimatedChest tier={tier} onOpen={handleOpen} opened={chestOpened} t={t} />

          {showRewards && (
            <div className="mt-2 space-y-5 animate-[fadeSlideUp_0.4s_ease]">
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color:'#58CC02' }}>+{chest.xp}</p>
                  <p className="text-xs font-bold text-muted mt-1">{t.xp}</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: cfg.clasp }}>+{chest.coins}</p>
                  <p className="text-xs font-bold text-muted mt-1">{t.coins}</p>
                </div>
              </div>
              <button
                onClick={onNewSession}
                className="w-full max-w-xs py-4 rounded-2xl font-extrabold text-base shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                style={{ background:'#58CC02', color:'#fff' }}
              >
                {t.newSession}
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={onNewSession}
          className="mt-8 py-4 px-10 rounded-2xl font-extrabold text-base"
          style={{ background:'#58CC02', color:'#fff' }}
        >
          {t.newSession}
        </button>
      )}
    </div>
  )
}

// ─── Option Button ─────────────────────────────────────────────────────────────
function OptionBtn({
  opt, idx, answered, selectedIdx, onSelect,
}: {
  opt: ShuffledOpt; idx: number; answered: boolean
  selectedIdx: number | null; onSelect: (i:number) => void
}) {
  const isSelected = selectedIdx === idx
  const isCorrect  = opt.is_correct

  let border = 'border-[#3D4F65]'
  let bg     = 'bg-[#162032]'
  let label  = 'bg-[#223045] text-[#8EA5C0]'
  let ring   = ''

  if (answered) {
    if (isCorrect) {
      border = 'border-[#58CC02]'; bg = 'bg-[#0D2E00]'; label = 'bg-[#58CC02] text-white'; ring = 'ring-2 ring-[#58CC02]/30'
    } else if (isSelected) {
      border = 'border-[#FF4B4B]'; bg = 'bg-[#2E0000]'; label = 'bg-[#FF4B4B] text-white'; ring = 'ring-2 ring-[#FF4B4B]/30'
    } else {
      border = 'border-[#2A3748]'; bg = 'bg-[#0F1A27]'; label = 'bg-[#1A2A3A] text-[#4A6080]'
    }
  } else if (isSelected) {
    border = 'border-[#1CB0F6]'; bg = 'bg-[#0A2040]'; label = 'bg-[#1CB0F6] text-white'
  }

  return (
    <button
      onClick={() => !answered && onSelect(idx)}
      disabled={answered}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all duration-150 touch-manipulation select-none',
        bg, border, ring,
        !answered && 'hover:border-[#1CB0F6]/60 hover:bg-[#0A2040]/60 active:scale-[0.98]'
      )}
    >
      <span className={cn('shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all', label)}>
        {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : String.fromCharCode(65 + idx)}
      </span>
      <span className={cn('leading-snug', answered && !isCorrect && !isSelected && 'opacity-40')}>
        {opt.text}
      </span>
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function QuizGame({
  userId, ageGroup, language = 'en', questions, sessionId, initialHearts,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const t   = (UI[language] ?? UI.en) as typeof UI['en']
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  // ── State ──────────────────────────────────────────────────────────────────
  const [queue, setQueue]           = useState<QuizQuestion[]>(questions)
  const [shuffled, setShuffled]     = useState<ShuffledOpt[]>(() => shuffleOptions(questions[0]))
  const [qIdx, setQIdx]             = useState(0)
  const [hearts, setHearts]         = useState(initialHearts)
  const [streak, setStreak]         = useState(0)
  const [totalXP, setTotalXP]       = useState(0)
  const [answered, setAnswered]     = useState(false)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showHint, setShowHint]     = useState(false)
  const [showExpl, setShowExpl]     = useState(false)
  const [breakingHeart, setBreakingHeart] = useState(false)
  const [masteredTopic, setMasteredTopic] = useState<string | null>(null)
  const [chest, setChest]           = useState<ChestDrop | null>(null)
  const [sessionDead, setSessionDead] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const nextBtnRef = useRef<HTMLButtonElement>(null)

  const current = queue[qIdx]

  // Re-shuffle options every time the question changes
  useEffect(() => {
    if (current) setShuffled(shuffleOptions(current))
  }, [qIdx, queue])

  // ── Answer ─────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (idx: number) => {
    if (answered || !current) return
    setSelectedIdx(idx)
    setAnswered(true)

    const correct = shuffled[idx]?.is_correct ?? false
    const newStreak = correct ? streak + 1 : 0
    const bonus  = (correct && newStreak >= STREAK_MIN) ? STREAK_BONUS : 0
    const xp     = correct ? XP_PER_CORRECT + bonus : 0

    setStreak(newStreak)
    if (xp > 0) setTotalXP(x => x + xp)

    if (!correct) {
      setBreakingHeart(true)
      setTimeout(() => setBreakingHeart(false), 500)
      const next = hearts - 1
      setHearts(next)
      if (next <= 0) {
        setTimeout(() => endSession(), 1200)
      }
    }

    // Fire-and-forget server call
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
            selectedIdx: shuffled[idx]?.origIdx ?? idx,
            isCorrect:   correct,
            xpGained:    xp,
          }),
        })
        if (correct && newStreak >= 3) {
          const r = await fetch(`/api/quiz/mastery?userId=${userId}&topic=${current.topic}&month=${current.month}`)
          const d = await r.json()
          if (d.justMastered) setMasteredTopic(current.topic)
        }
      } catch { /* non-fatal */ }
    })
  }, [answered, current, shuffled, streak, hearts, sessionId, userId])

  // ── End session ────────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    setSessionDead(true)
    try {
      const r = await fetch('/api/quiz/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      })
      const d = await r.json()
      if (d.chest) setChest(d.chest)
    } catch {
      setChest({ tier:'wood', emoji:'📦', color:'#C49A3C', label:'Wood Chest', xp:15, coins:75, badge_id:null })
    }
  }, [sessionId, userId])

  // ── Next question ──────────────────────────────────────────────────────────
  const nextQuestion = useCallback(async () => {
    setAnswered(false)
    setSelectedIdx(null)
    setShowHint(false)
    setShowExpl(false)
    setMasteredTopic(null)

    const nextIdx = qIdx + 1
    if (nextIdx >= queue.length - 2) {
      // Pre-fetch more in the background
      setLoadingMore(true)
      try {
        const count = Math.floor(Math.random() * 11) + 5
        const r = await fetch(`/api/quiz/questions?userId=${userId}&ageGroup=${ageGroup}&count=${count}`)
        const d = await r.json()
        if (d.questions?.length) setQueue(q => [...q, ...d.questions])
      } catch { /* keep going */ }
      setLoadingMore(false)
    }
    setQIdx(nextIdx)
  }, [qIdx, queue.length, userId, ageGroup])

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sessionDead) return
      if (!answered) {
        if (['1','2','3','4'].includes(e.key)) handleAnswer(Number(e.key) - 1)
      } else {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextQuestion() }
        if (e.key === 'h') setShowHint(h => !h)
        if (e.key === 'e') setShowExpl(x => !x)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, sessionDead, handleAnswer, nextQuestion])

  // ── Session over screen ────────────────────────────────────────────────────
  if (sessionDead) return (
    <SessionOverScreen
      chest={chest}
      onNewSession={() => router.refresh()}
      t={t}
    />
  )

  if (!current) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted font-bold animate-pulse">{t.loading}</p>
    </div>
  )

  const correct = answered && selectedIdx !== null && shuffled[selectedIdx]?.is_correct
  const wrong   = answered && selectedIdx !== null && !shuffled[selectedIdx]?.is_correct
  const diff    = DIFF_STYLE[current.difficulty]

  return (
    <div className="min-h-screen bg-[#0B1622] flex flex-col" dir={dir}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-2 max-w-lg mx-auto w-full">
        {/* Hearts */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              filled={i < hearts}
              breaking={breakingHeart && i === hearts - 1}
            />
          ))}
        </div>

        {/* Streak */}
        <div className={cn(
          'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border transition-all ml-auto',
          streak >= STREAK_MIN
            ? 'bg-amber-500/20 border-amber-400/40 text-amber-400'
            : 'bg-white/5 border-white/10 text-muted'
        )}>
          🔥 {streak}
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1">
          <span className="text-emerald-400 text-xs font-extrabold">+{totalXP} {t.xp}</span>
        </div>
      </div>

      {/* ── PROGRESS BAR (Duolingo style) ── */}
      <div className="px-4 max-w-lg mx-auto w-full mb-4">
        <div className="h-3 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-[#58CC02]"
            style={{ width: `${Math.min(((qIdx + 1) / Math.max(queue.length, 10)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* ── QUESTION AREA ── */}
      <div className="flex-1 flex flex-col px-4 pb-8 max-w-lg mx-auto w-full">

        {/* Mastered banner */}
        {masteredTopic && (
          <div className="mb-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-center text-sm font-extrabold text-emerald-400">
            {t.mastered} — {masteredTopic}
          </div>
        )}

        {/* Topic + difficulty badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full', diff.bg, diff.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', diff.dot)} />
            {t.difficulty[current.difficulty]}
          </span>
          <span className="text-xs font-bold text-muted bg-white/5 px-3 py-1 rounded-full">
            {current.topic} · M{current.month}
          </span>
        </div>

        {/* Question text */}
        <p className="font-extrabold text-lg md:text-xl leading-snug mb-6 whitespace-pre-wrap text-white">
          {current.question}
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {shuffled.map((opt, idx) => (
            <OptionBtn
              key={`${current.id}-${idx}`}
              opt={opt} idx={idx}
              answered={answered}
              selectedIdx={selectedIdx}
              onSelect={handleAnswer}
            />
          ))}
        </div>

        {/* ── FEEDBACK PANEL ── */}
        {answered && (
          <div className={cn(
            'rounded-3xl p-5 mb-4 border-2 transition-all animate-[fadeSlideUp_0.25s_ease]',
            correct ? 'bg-[#0D2E00] border-[#58CC02]' : 'bg-[#2E0000] border-[#FF4B4B]'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{correct ? '🎉' : '❌'}</span>
              <p className={cn('font-extrabold text-base', correct ? 'text-[#58CC02]' : 'text-[#FF4B4B]')}>
                {correct ? t.correct : t.wrong}
              </p>
              {correct && streak >= STREAK_MIN && (
                <span className="ml-auto text-xs font-black text-amber-400">🔥 +{STREAK_BONUS} bonus!</span>
              )}
            </div>

            {/* Hint (wrong answer only) */}
            {wrong && current.hint && (
              <div className="mt-2">
                <button onClick={() => setShowHint(h => !h)}
                  className="text-xs font-bold text-amber-400 underline underline-offset-2">
                  {t.hint}
                </button>
                {showHint && (
                  <p className="text-sm text-[#FF9999] font-semibold mt-1.5 leading-relaxed">{current.hint}</p>
                )}
              </div>
            )}

            {/* Explanation */}
            {current.explanation && (
              <div className="mt-2">
                <button onClick={() => setShowExpl(x => !x)}
                  className={cn('text-xs font-bold underline underline-offset-2', correct ? 'text-[#58CC02]/70' : 'text-[#FF9999]/70')}>
                  {t.explanation}
                </button>
                {showExpl && (
                  <p className="text-sm text-muted font-semibold mt-1.5 leading-relaxed">{current.explanation}</p>
                )}
              </div>
            )}

            {wrong && (
              <p className="text-[10px] font-bold text-[#FF4B4B]/50 mt-2">⚑ {t.flagged}</p>
            )}
          </div>
        )}

        {/* ── CONTINUE BUTTON (Duolingo green, bottom-pinned) ── */}
        {answered && hearts > 0 && (
          <button
            ref={nextBtnRef}
            onClick={nextQuestion}
            className="w-full py-4 rounded-2xl font-extrabold text-base text-white shadow-[0_4px_0_#3a7a02] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all touch-manipulation"
            style={{ background: '#58CC02' }}
          >
            {t.next}
          </button>
        )}

        {/* Keyboard tip — desktop only */}
        {!answered && (
          <p className="hidden md:block text-center text-[10px] text-muted/40 font-bold mt-4">
            {t.keyTip}
          </p>
        )}
      </div>

      {/* CSS keyframes injected globally */}
      <style>{`
        @keyframes wiggle {
          0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)}
        }
        @keyframes heartBreak {
          0%{transform:scale(1)} 30%{transform:scale(1.3)} 60%{transform:scale(0.8)} 100%{transform:scale(1)}
        }
        @keyframes fadeSlideUp {
          from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes particleFly {
          0%{opacity:1;transform:scale(1) translate(0,0)}
          100%{opacity:0;transform:scale(0) translate(var(--dx,20px),var(--dy,-30px))}
        }
      `}</style>
    </div>
  )
}