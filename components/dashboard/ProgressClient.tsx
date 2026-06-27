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

// ─── Hero ring — fluid sizing, this week's progress not a lifetime total ──
function WeeklyRing({ done, goal }: { done: number; goal: number }) {
  const pct    = Math.min(100, Math.round((done / goal) * 100))
  const radius = 70
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative mx-auto" style={{ width: 'clamp(140px, 38vw, 190px)', height: 'clamp(140px, 38vw, 190px)' }}>
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="80" cy="80" r={radius} fill="none" stroke="#1CB0F6" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
        <span className="font-fredoka leading-none text-[#F5F5F5]" style={{ fontSize: 'clamp(28px, 7vw, 38px)' }}>{done}</span>
        <span className="text-xs font-bold text-[#6F6F6F] text-center mt-1">of {goal} this week</span>
      </div>
    </div>
  )
}

// ─── Badge card — real 3D flip, generous padding, clear locked state ─────
function BadgeCard({ badge, t }: { badge: Badge; t: Record<string, string> }) {
  const [flipped, setFlipped] = useState(false)
  const rarityColor = RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.common

  return (
    <button
      onClick={() => setFlipped(v => !v)}
      className="shrink-0 snap-start [perspective:1000px] outline-none"
      style={{ width: 'clamp(132px, 30vw, 168px)' }}
      aria-label={badge.name}
    >
      <div
        className="relative w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ aspectRatio: '3/4', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center text-center p-4 [backface-visibility:hidden]"
          style={{
            background: badge.earned
              ? `linear-gradient(160deg, ${rarityColor}26 0%, ${rarityColor}0a 100%)`
              : 'rgba(255,255,255,0.035)',
            border: `1.5px solid ${badge.earned ? rarityColor + '4d' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {!badge.earned && (
            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
              <Icon kind="lock" className="w-3 h-3 text-[#F5F5F5]/60" />
            </span>
          )}
          <div
            className={cn('mb-3 flex items-center justify-center rounded-2xl', !badge.earned && 'opacity-45 grayscale')}
            style={{ width: 'clamp(52px, 14vw, 68px)', height: 'clamp(52px, 14vw, 68px)', fontSize: 'clamp(28px, 7vw, 36px)', backgroundColor: badge.earned ? `${rarityColor}1a` : 'rgba(255,255,255,0.04)' }}
          >
            {badge.emoji}
          </div>
          <p className={cn('text-sm font-bold leading-snug px-1', badge.earned ? 'text-[#F5F5F5]' : 'text-[#6F6F6F]')}>
            {badge.name}
          </p>
          <span className="text-[10px] font-bold text-[#6F6F6F]/50 mt-3 uppercase tracking-wide">{t.tapToFlip}</span>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center text-center p-4 [backface-visibility:hidden]"
          style={{
            background: badge.earned ? `${rarityColor}14` : 'rgba(255,255,255,0.035)',
            border: `1.5px solid ${badge.earned ? rarityColor + '4d' : 'rgba(255,255,255,0.08)'}`,
            transform: 'rotateY(180deg)',
          }}
        >
          <Icon kind={badge.earned ? 'check' : 'lock'} className={cn('w-6 h-6 mb-2.5', badge.earned ? 'text-[#3CB371]' : 'text-[#6F6F6F]')} />
          <p className="text-xs font-semibold leading-relaxed text-[#F5F5F5]/80 px-1">
            {badge.earned
              ? (badge.earnedAt ? `${t.earnedOn} ${new Date(badge.earnedAt).toLocaleDateString()}` : t.earned)
              : badge.condition}
          </p>
        </div>
      </div>
    </button>
  )
}

// ─── Badge shelf ────────────────────────────────────────────────────────
function BadgeShelf({ badges, t }: { badges: Badge[]; t: Record<string, string> }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const scrollBy = (dir: 1 | -1) => scrollerRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5] flex items-center gap-2">
          <Icon kind="trophy" className="w-5 h-5 text-[#FAA918]" /> {t.badges}
        </h2>
        <div className="hidden sm:flex items-center gap-1.5">
          <button onClick={() => scrollBy(-1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Icon kind="chevronLeft" className="w-4 h-4 text-[#F5F5F5]/70" />
          </button>
          <button onClick={() => scrollBy(1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Icon kind="chevronRight" className="w-4 h-4 text-[#F5F5F5]/70" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {badges.map(b => <BadgeCard key={b.id} badge={b} t={t} />)}
      </div>
    </div>
  )
}

// ─── Lesson timeline ────────────────────────────────────────────────────
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
    return <div className="text-center py-10 text-[#6F6F6F] font-semibold text-sm">{t.noLessonsYet}</div>
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
                <span className="flex-1 text-sm font-bold text-[#F5F5F5] truncate min-w-0">{item.title}</span>
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
  const lessonsToNextLevel = Math.max(0, Math.ceil((XP_PER_LEVEL - xpInLevel) / 100))

  return (
    <div dir={dir} className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 lg:py-10 w-full max-w-3xl mx-auto text-[#F5F5F5]">

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[#6F6F6F] font-bold text-sm hover:text-white transition-colors mb-6 group">
        <Icon kind="chevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> {t.back}
      </Link>

      {/* ── Hero: this week's ring ── */}
      <div className="text-center mb-8 md:mb-10">
        <WeeklyRing done={lessonsThisWeek} goal={weeklyGoal} />
      </div>

      {/* ── Level, told as a story ── */}
      <div className="bg-card border border-white/5 rounded-3xl p-5 md:p-6 mb-8 md:mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <Icon kind="star" className="w-5 h-5 text-[#FAA918]" />
          <span className="font-fredoka text-xl text-[#F5F5F5]">{tier.name}</span>
        </div>
        <p className="text-sm font-semibold text-[#6F6F6F] px-2">
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
      <div className="mb-8 md:mb-10">
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