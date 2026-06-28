'use client'
// components/dashboard/ProgressClient.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

type IconKind = 'chevronLeft' | 'fire' | 'star' | 'trophy' | 'book' | 'close'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'chevronLeft': return <svg {...common}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
    case 'fire':         return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'star':         return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'trophy':       return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'book':         return <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Z"/></svg>
    case 'close':        return <svg {...common}><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z"/></svg>
  }
}

interface Props {
  language: string
  xp: number
  streak: number
  lessonsThisWeek: number
  weeklyGoal: number
  badgesEarned: number
  totalLessons: number
}

const UI: Record<string, Record<string, string>> = {
  en: { back: 'Home', thisWeek: 'this week', streak: 'Streak', level: 'Level', badges: 'Badges', lessons: 'Lessons', totalXp: 'Total XP', xpToNext: 'XP to next level' },
  ar: { back: 'الرئيسية', thisWeek: 'هذا الأسبوع', streak: 'متتالية', level: 'المستوى', badges: 'الشارات', lessons: 'الدروس', totalXp: 'إجمالي XP', xpToNext: 'XP للمستوى التالي' },
  fr: { back: 'Accueil', thisWeek: 'cette semaine', streak: 'Série', level: 'Niveau', badges: 'Badges', lessons: 'Leçons', totalXp: 'XP Total', xpToNext: 'XP avant le niveau suivant' },
}

// ─── Hero ring — the only thing with any visual complexity on this whole
// page. Everything below it is flat and identical, color-coded only. ──────
function WeeklyRing({ done, goal, label }: { done: number; goal: number; label: string }) {
  const pct    = Math.min(100, Math.round((done / goal) * 100))
  const radius = 56
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
          <circle
            cx="64" cy="64" r={radius} fill="none" stroke="#1CB0F6" strokeWidth="11" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-fredoka text-3xl text-[#F5F5F5] leading-none">{done}/{goal}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-[#6F6F6F] mt-2">{label}</span>
    </div>
  )
}

// ─── One tile shape, used four times — icon + big number + one-word label.
// Tap any tile to see more: Badges/Lessons go to their own page; Level opens
// a quick detail popup instead, since there's no dedicated page for it. ───
function StatTile({ icon, color, value, label, sublabel, onTap }: { icon: IconKind; color: string; value: string; label: string; sublabel?: string; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-5 active:scale-95 transition-transform"
      style={{ backgroundColor: `${color}14` }}
    >
      <Icon kind={icon} className="w-6 h-6" style={{ color }} />
      <span className="font-fredoka text-2xl text-[#F5F5F5] leading-none">{value}</span>
      <span className="text-[11px] font-bold text-[#6F6F6F]">{sublabel ?? label}</span>
    </button>
  )
}

// ─── Level detail — exact XP + progress bar live here, one tap away,
// instead of cluttering the main screen with numbers to calculate. ────────
function LevelSheet({
  level, xp, xpInLevel, t, onClose,
}: { level: number; xp: number; xpInLevel: number; t: Record<string, string>; onClose: () => void }) {
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100)
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center relative animate-slide-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Icon kind="close" className="w-4 h-4 text-[#F5F5F5]/60" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-[#1CB0F6]/15 flex items-center justify-center mx-auto mb-4">
          <Icon kind="star" className="w-8 h-8 text-[#1CB0F6]" />
        </div>
        <p className="font-fredoka text-2xl text-[#F5F5F5] mb-1">{t.level} {level}</p>
        <p className="text-sm font-semibold text-[#6F6F6F] mb-4">{xp.toLocaleString()} {t.totalXp}</p>
        <div className="h-2.5 bg-card2 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] transition-all duration-700" style={{ width: `${xpPct}%` }} />
        </div>
        <p className="text-xs font-bold text-[#6F6F6F]">{XP_PER_LEVEL - xpInLevel} {t.xpToNext}</p>
      </div>
    </div>
  )
}

export default function ProgressClient({
  language, xp, streak, lessonsThisWeek, weeklyGoal, badgesEarned, totalLessons,
}: Props) {
  const router = useRouter()
  const lang = language || 'en'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [showLevel, setShowLevel] = useState(false)

  const level     = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL

  return (
    // min-w-0 + w-full: stops a flex/grid sidebar layout from forcing this
    // column wider than the screen, which is what clipped content before.
    <div dir={dir} className="w-full min-w-0 max-w-sm mx-auto px-4 py-4 md:py-6 text-[#F5F5F5]">

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[#6F6F6F] font-bold text-sm hover:text-white transition-colors mb-6">
        <Icon kind="chevronLeft" className="w-4 h-4" /> {t.back}
      </Link>

      {/* ── One hero: this week's lessons as a ring ── */}
      <div className="flex justify-center mb-8">
        <WeeklyRing done={lessonsThisWeek} goal={weeklyGoal} label={t.thisWeek} />
      </div>

      {/* ── Four identical tiles: streak, level, badges, lessons. Same
           shape, same rule (tap to see more), nothing to calculate. ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile icon="fire"   color="#FAA918" value={`${streak}`}       label={t.streak}  onTap={() => setShowLevel(false)} />
        <StatTile icon="star"   color="#1CB0F6" value={`${level}`}        label={t.level}   sublabel={`${xp.toLocaleString()} XP`} onTap={() => setShowLevel(true)} />
        <StatTile icon="trophy" color="#3CB371" value={`${badgesEarned}`} label={t.badges}  onTap={() => router.push('/dashboard/badges')} />
        <StatTile icon="book"   color="#A66BFF" value={`${totalLessons}`} label={t.lessons} onTap={() => router.push('/dashboard/skills')} />
      </div>

      {showLevel && (
        <LevelSheet level={level} xp={xp} xpInLevel={xpInLevel} t={t} onClose={() => setShowLevel(false)} />
      )}
    </div>
  )
}