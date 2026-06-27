'use client'
// components/dashboard/ProgressClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

type IconKind = 'chevronLeft' | 'fire' | 'star' | 'trophy' | 'lock' | 'close'

function Icon({ kind, className }: { kind: IconKind; className?: string }) {
  const common = { className, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'chevronLeft': return <svg {...common}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
    case 'fire':         return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'star':         return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'trophy':       return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'lock':         return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'close':        return <svg {...common}><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z"/></svg>
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
  common: '#1CB0F6',
  rare: '#A66BFF',
  legendary: '#FAA918',
}

const UI: Record<string, Record<string, string>> = {
  en: {
    back: 'Home', thisWeek: 'lessons this week', level: 'Level', streak: 'streak',
    badges: 'Badges', earnedOn: 'Earned on', locked: 'Not earned yet',
    history: 'Recent Lessons', seeAll: 'See all', noLessonsYet: 'No lessons yet.',
  },
  ar: {
    back: 'الرئيسية', thisWeek: 'دروس هذا الأسبوع', level: 'المستوى', streak: 'متتالية',
    badges: 'الشارات', earnedOn: 'تم الحصول عليها في', locked: 'لم تُكتسب بعد',
    history: 'الدروس الأخيرة', seeAll: 'عرض الكل', noLessonsYet: 'لا دروس بعد.',
  },
  fr: {
    back: 'Accueil', thisWeek: 'leçons cette semaine', level: 'Niveau', streak: 'série',
    badges: 'Badges', earnedOn: 'Obtenu le', locked: 'Pas encore obtenu',
    history: 'Leçons récentes', seeAll: 'Tout voir', noLessonsYet: 'Pas encore de leçons.',
  },
}

// ─── Weekly ring — fixed sizes per breakpoint, no vw units (vw measures the
// whole browser viewport, not the space next to your sidebar — that was the
// original sizing bug) ──────────────────────────────────────────────────
function WeeklyRing({ done, goal, label }: { done: number; goal: number; label: string }) {
  const pct    = Math.min(100, Math.round((done / goal) * 100))
  const radius = 60
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
      <svg viewBox="0 0 136 136" className="w-full h-full -rotate-90">
        <circle cx="68" cy="68" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="68" cy="68" r={radius} fill="none" stroke="#1CB0F6" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-fredoka text-2xl sm:text-3xl text-[#F5F5F5] leading-none">{done}/{goal}</span>
      </div>
      <span className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-bold text-[#6F6F6F]">{label}</span>
    </div>
  )
}

function BadgeCard({ badge, onTap }: { badge: Badge; onTap: () => void }) {
  const rarityColor = RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.common
  return (
    <button onClick={onTap} className="flex flex-col items-center text-center gap-1.5 w-full min-w-0">
      <div
        className={cn('relative w-full aspect-square rounded-2xl flex items-center justify-center text-3xl', !badge.earned && 'opacity-50')}
        style={{ backgroundColor: badge.earned ? `${rarityColor}22` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${badge.earned ? rarityColor + '55' : 'rgba(255,255,255,0.08)'}` }}
      >
        <span className={cn(!badge.earned && 'grayscale')}>{badge.emoji}</span>
        {!badge.earned && (
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
            <Icon kind="lock" className="w-2.5 h-2.5 text-white/70" />
          </span>
        )}
      </div>
      <span className={cn('text-xs font-bold leading-tight line-clamp-2 px-0.5', badge.earned ? 'text-[#F5F5F5]' : 'text-[#6F6F6F]')}>
        {badge.name}
      </span>
    </button>
  )
}

function BadgeSheet({ badge, t, onClose }: { badge: Badge; t: Record<string, string>; onClose: () => void }) {
  const rarityColor = RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.common
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center relative animate-slide-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Icon kind="close" className="w-4 h-4 text-[#F5F5F5]/60" />
        </button>
        <div
          className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4', !badge.earned && 'opacity-50')}
          style={{ backgroundColor: badge.earned ? `${rarityColor}22` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${badge.earned ? rarityColor + '55' : 'rgba(255,255,255,0.08)'}` }}
        >
          <span className={cn(!badge.earned && 'grayscale')}>{badge.emoji}</span>
        </div>
        <p className="font-fredoka text-lg text-[#F5F5F5] mb-2">{badge.name}</p>
        <p className="text-sm font-semibold text-[#6F6F6F] leading-relaxed">
          {badge.earned
            ? (badge.earnedAt ? `${t.earnedOn} ${new Date(badge.earnedAt).toLocaleDateString()}` : t.earnedOn)
            : badge.condition}
        </p>
        {!badge.earned && (
          <p className="text-xs font-bold text-[#6F6F6F]/60 mt-3 flex items-center justify-center gap-1.5">
            <Icon kind="lock" className="w-3 h-3" /> {t.locked}
          </p>
        )}
      </div>
    </div>
  )
}

function LessonRow({ item }: { item: Completion }) {
  return (
    <div className="flex items-center gap-3 bg-card2/60 rounded-xl px-3.5 py-2.5 min-w-0">
      <span className="text-lg shrink-0">{item.emoji}</span>
      <span className="flex-1 text-sm font-bold text-[#F5F5F5] truncate min-w-0">{item.title}</span>
      <span className="text-xs font-semibold text-[#6F6F6F] shrink-0">
        {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
    </div>
  )
}

export default function ProgressClient({
  displayName, language, xp, streak, lessonsThisWeek, weeklyGoal, badges, completions,
}: Props) {
  const lang = language || 'en'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [openBadge, setOpenBadge] = useState<Badge | null>(null)
  const [showAllLessons, setShowAllLessons] = useState(false)

  const level     = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL
  const xpPct     = Math.round((xpInLevel / XP_PER_LEVEL) * 100)

  const visibleLessons = showAllLessons ? completions : completions.slice(0, 5)

  return (
    // w-full + min-w-0 here is deliberate: a flex/grid parent (your sidebar
    // layout) can otherwise force this column to its content's natural width
    // instead of shrinking it, which is what clipped the ring/badges before.
    <div dir={dir} className="w-full min-w-0 max-w-2xl mx-auto px-4 sm:px-6 py-4 md:py-6 text-[#F5F5F5]">

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[#6F6F6F] font-bold text-sm hover:text-white transition-colors mb-6">
        <Icon kind="chevronLeft" className="w-4 h-4" /> {t.back}
      </Link>

      {/* ── Weekly ring, alone, centered, full width available ── */}
      <div className="mb-8 pb-2">
        <WeeklyRing done={lessonsThisWeek} goal={weeklyGoal} label={t.thisWeek} />
      </div>

      {/* ── Streak — its own row, not squeezed beside the ring ── */}
      <div className={cn(
        'flex items-center justify-center gap-2 mb-8 px-4 py-3 rounded-2xl',
        streak > 0 ? 'bg-[#FAA918]/10' : 'bg-white/5',
      )}>
        <Icon kind="fire" className={cn('w-5 h-5 shrink-0', streak > 0 ? 'text-[#FAA918]' : 'text-[#6F6F6F]')} />
        <span className="font-fredoka text-lg text-[#F5F5F5]">{streak}</span>
        <span className="text-sm font-bold text-[#6F6F6F]">{t.streak}</span>
      </div>

      {/* ── Level — the bar communicates progress, no sentence to read ── */}
      <div className="bg-card border border-white/5 rounded-2xl p-4 mb-8">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="flex items-center gap-1.5 font-fredoka text-base text-[#F5F5F5] min-w-0 truncate">
            <Icon kind="star" className="w-4 h-4 text-[#FAA918] shrink-0" /> {t.level} {level}
          </span>
          <span className="text-xs font-bold text-[#6F6F6F] shrink-0">{xpInLevel}/{XP_PER_LEVEL}</span>
        </div>
        <div className="h-2.5 bg-card2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] transition-all duration-700" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      {/* ── Badges — wraps into a grid, never scrolls horizontally ── */}
      <div className="mb-8">
        <h2 className="font-fredoka text-base text-[#F5F5F5] flex items-center gap-2 mb-3">
          <Icon kind="trophy" className="w-5 h-5 text-[#FAA918]" /> {t.badges}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map(b => <BadgeCard key={b.id} badge={b} onTap={() => setOpenBadge(b)} />)}
        </div>
      </div>

      {/* ── Recent lessons — short list, "see all" instead of a wall ── */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="font-fredoka text-base text-[#F5F5F5]">{t.history}</h2>
          {completions.length > 5 && (
            <button onClick={() => setShowAllLessons(v => !v)} className="text-xs font-bold text-[#1CB0F6] hover:underline underline-offset-2 shrink-0">
              {showAllLessons ? '' : t.seeAll}
            </button>
          )}
        </div>
        {completions.length === 0 ? (
          <p className="text-center py-8 text-[#6F6F6F] font-semibold text-sm">{t.noLessonsYet}</p>
        ) : (
          <div className="space-y-2">
            {visibleLessons.map(item => <LessonRow key={item.lessonId + item.completedAt} item={item} />)}
          </div>
        )}
      </div>

      {openBadge && <BadgeSheet badge={openBadge} t={t} onClose={() => setOpenBadge(null)} />}
    </div>
  )
}