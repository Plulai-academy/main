'use client'
// components/dashboard/ProgressClient.tsx
import { useState, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
const TIERS = ['Rookie', 'Explorer', 'Builder', 'Creator', 'Innovator', 'Strategist', 'Visionary', 'Elite', 'Legend', 'Grandmaster']
const getTier = (level: number) => {
  const tierIndex = Math.floor((level - 1) / 10)
  const tierLevel = ((level - 1) % 10) + 1
  return { name: TIERS[Math.min(tierIndex, TIERS.length - 1)], levelInTier: tierLevel }
}

type IconKind = 'chevronLeft' | 'chevronRight' | 'fire' | 'star' | 'trophy' | 'lock' | 'check'

function Icon({ kind, className }: { kind: IconKind; className?: string }) {
  const common = { className, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'chevronLeft':  return <svg {...common}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
    case 'chevronRight': return <svg {...common}><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/></svg>
    case 'fire':         return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'star':         return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'trophy':       return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'lock':         return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':        return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
  }
}

interface Badge {
  id: string
  name: string
  emoji: string
  condition: string
  rarity: string
  earned: boolean
  earnedAt: string | null
}
interface Completion {
  lessonId: string
  completedAt: string
  title: string
  emoji: string
}
interface Props {
  displayName: string
  language: string
  xp: number
  streak: number
  lessonsThisWeek: number
  weeklyGoal: number
  badges: Badge[]
  completions: Completion[]
}

const RARITY_COLORS: Record<string, string> = {
  common:    '#1CB0F6',
  rare:      '#A66BFF',
  legendary: '#FAA918',
}

// ─── Hero ring — this week's progress, not a lifetime total ──────────────
function WeeklyRing({ done, goal }: { done: number; goal: number }) {
  const pct    = Math.min(100, Math.round((done / goal) * 100))
  const radius = 70
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="80" cy="80" r={radius} fill="none" stroke="#1CB0F6" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-fredoka text-4xl text-[#F5F5F5]">{done}</span>
        <span className="text-xs font-bold text-[#6F6F6F]">of {goal} this week</span>
      </div>
    </div>
  )
}

// ─── Badge shelf — one badge in focus at a time, swipe to browse ─────────
function BadgeShelf({ badges, t }: { badges: Badge[]; t: Record<string, string> }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5] flex items-center gap-2">
          <Icon kind="trophy" className="w-5 h-5 text-[#FAA918]" /> {t.badges}
        </h2>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scrollBy(-1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Icon kind="chevronLeft" className="w-4 h-4 text-[#F5F5F5]/70" />
          </button>
          <button onClick={() => scrollBy(1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Icon kind="chevronRight" className="w-4 h-4 text-[#F5F5F5]/70" />
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
        {badges.map(b => {
          const rarityColor = RARITY_COLORS[b.rarity] ?? RARITY_COLORS.common
          const isFlipped = flipped[b.id]
          return (
            <button
              key={b.id}
              onClick={() => setFlipped(prev => ({ ...prev, [b.id]: !prev[b.id] }))}
              className="shrink-0 w-40 h-48 snap-start rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300"
              style={{
                background: b.earned
                  ? `linear-gradient(160deg, ${rarityColor}22 0%, ${rarityColor}08 100%)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${b.earned ? rarityColor + '40' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {!isFlipped ? (
                <>
                  <div className={cn('text-5xl mb-3', !b.earned && 'grayscale opacity-40')}>{b.emoji}</div>
                  <p className={cn('text-sm font-bold leading-snug', b.earned ? 'text-[#F5F5F5]' : 'text-[#6F6F6F]')}>{b.name}</p>
                  {!b.earned && <Icon kind="lock" className="w-3.5 h-3.5 text-[#6F6F6F]/50 mt-2" />}
                  <span className="text-[10px] font-bold text-[#6F6F6F]/60 mt-2">{t.tapToFlip}</span>
                </>
              ) : (
                <>
                  <Icon kind={b.earned ? 'check' : 'lock'} className={cn('w-6 h-6 mb-3', b.earned ? 'text-[#3CB371]' : 'text-[#6F6F6F]')} />
                  <p className="text-xs font-semibold leading-relaxed text-[#F5F5F5]/80">
                    {b.earned
                      ? (b.earnedAt ? `${t.earnedOn} ${new Date(b.earnedAt).toLocaleDateString()}` : t.earned)
                      : b.condition}
                  </p>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Lesson timeline — calendar-app style, grouped by day ─────────────────
function groupByDay(completions: Completion[], lang: string) {
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

  const labelFor = (date: Date) => {
    const d = new Date(date); d.setHours(0,0,0,0)
    if (d.getTime() === today.getTime()) return lang === 'ar' ? 'اليوم' : lang === 'fr' ? "Aujourd'hui" : 'Today'
    if (d.getTime() === yesterday.getTime()) return lang === 'ar' ? 'الأمس' : lang === 'fr' ? 'Hier' : 'Yesterday'
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const groups: { label: string; items: Completion[] }[] = []
  for (const c of completions) {
    const label = labelFor(new Date(c.completedAt))
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(c)
    else groups.push({ label, items: [c] })
  }
  return groups
}

function LessonTimeline({ completions, lang, t }: { completions: Completion[]; lang: string; t: Record<string, string> }) {
  const groups = groupByDay(completions, lang)

  if (completions.length === 0) {
    return (
      <div className="text-center py-10 text-[#6F6F6F] font-semibold text-sm">
        {t.noLessonsYet}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((g, gi) => (
        <div key={gi}>
          <p className="text-xs font-black text-[#6F6F6F] uppercase tracking-wider mb-2.5">{g.label}</p>
          <div className="space-y-2">
            {g.items.map(item => (
              <div key={item.lessonId + item.completedAt} className="flex items-center gap-3 bg-card2/60 rounded-xl px-3.5 py-2.5">
                <span className="text-lg shrink-0">{item.emoji}</span>
                <span className="flex-1 text-sm font-bold text-[#F5F5F5] truncate">{item.title}</span>
                <span className="text-xs font-semibold text-[#6F6F6F] shrink-0">
                  {new Date(item.completedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const UI: Record<string, Record<string, string>> = {
  en: {
    back: 'Home', progress: 'Your Progress', nextTier: 'Next',
    moreLessons: 'more lessons to', badges: 'Badges', tapToFlip: 'Tap to flip',
    earned: 'Earned!', earnedOn: 'Earned on', history: 'Lesson History',
    noLessonsYet: 'No lessons yet — your history will show up here.',
  },
  ar: {
    back: 'الرئيسية', progress: 'تقدمك', nextTier: 'التالي',
    moreLessons: 'دروس أخرى لـ', badges: 'الشارات', tapToFlip: 'اضغط للتقليب',
    earned: 'تم الحصول عليها!', earnedOn: 'تم الحصول عليها في', history: 'سجل الدروس',
    noLessonsYet: 'لا دروس بعد — سيظهر سجلك هنا.',
  },
  fr: {
    back: 'Accueil', progress: 'Ta progression', nextTier: 'Suivant',
    moreLessons: 'leçons de plus pour', badges: 'Badges', tapToFlip: 'Touche pour retourner',
    earned: 'Obtenu !', earnedOn: 'Obtenu le', history: 'Historique des leçons',
    noLessonsYet: "Pas encore de leçons — ton historique apparaîtra ici.",
  },
}

export default function ProgressClient({
  displayName, language, xp, streak, lessonsThisWeek, weeklyGoal, badges, completions,
}: Props) {
  const lang = language || 'en'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const level = getLevel(xp)
  const tier  = getTier(level)
  const xpInLevel = xp % XP_PER_LEVEL
  const lessonsToNextLevel = Math.max(0, Math.ceil((XP_PER_LEVEL - xpInLevel) / 100)) // rough estimate, tune to real xp-per-lesson

  return (
    <div dir={dir} className="p-4 md:p-6 lg:p-10 max-w-2xl mx-auto text-[#F5F5F5]">

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[#6F6F6F] font-bold text-sm hover:text-white transition-colors mb-6 group">
        <Icon kind="chevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> {t.back}
      </Link>

      {/* ── Hero: this week's ring, not a lifetime stat ── */}
      <div className="text-center mb-10">
        <WeeklyRing done={lessonsThisWeek} goal={weeklyGoal} />
      </div>

      {/* ── Level, told as a story not a number ── */}
      <div className="bg-card border border-white/5 rounded-3xl p-5 md:p-6 mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <Icon kind="star" className="w-5 h-5 text-[#FAA918]" />
          <span className="font-fredoka text-xl text-[#F5F5F5]">{tier.name}</span>
        </div>
        <p className="text-sm font-semibold text-[#6F6F6F]">
          {lessonsToNextLevel > 0
            ? `${t.nextTier}: ${lessonsToNextLevel} ${t.moreLessons} ${tier.levelInTier < 10 ? `${tier.name} ${tier.levelInTier + 1}` : TIERS[Math.min(Math.floor(level / 10), TIERS.length - 1)]}`
            : tier.name}
        </p>
        {streak > 0 && (
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#FAA918] bg-[#FAA918]/10 px-3 py-1 rounded-full">
            <Icon kind="fire" className="w-3.5 h-3.5" /> {streak}-day streak
          </div>
        )}
      </div>

      {/* ── Badge shelf ── */}
      <div className="mb-10">
        <BadgeShelf badges={badges} t={t} />
      </div>

      {/* ── Lesson history ── */}
      <div>
        <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5] mb-4">{t.history}</h2>
        <LessonTimeline completions={completions} lang={lang} t={t} />
      </div>
    </div>
  )
}