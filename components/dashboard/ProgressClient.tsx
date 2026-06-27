'use client'
// components/dashboard/ProgressClient.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

const XP_PER_LEVEL = 1000
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

type IconKind = 'chevronLeft' | 'chevronRight' | 'fire' | 'star' | 'trophy' | 'book'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'chevronLeft':  return <svg {...common}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
    case 'chevronRight': return <svg {...common}><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/></svg>
    case 'fire':          return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'star':          return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'trophy':        return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'book':          return <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Z"/></svg>
  }
}
interface Props {
  language: string
  xp: number
  streak: number
  lessonsThisWeek: number
  weeklyGoal: number
  badgesEarned: number
  badgesTotal: number
  totalLessons: number
}

const UI: Record<string, Record<string, string>> = {
  en: {
    back: 'Home', thisWeek: 'lessons this week', level: 'Level', streak: 'streak',
    badges: 'Badges', lessons: 'Lessons',
  },
  ar: {
    back: 'الرئيسية', thisWeek: 'دروس هذا الأسبوع', level: 'المستوى', streak: 'متتالية',
    badges: 'الشارات', lessons: 'الدروس',
  },
  fr: {
    back: 'Accueil', thisWeek: 'leçons cette semaine', level: 'Niveau', streak: 'série',
    badges: 'Badges', lessons: 'Leçons',
  },
}

// ─── Fixed sizes per breakpoint — no vw units, nothing that can miscalculate
// against a sidebar layout ────────────────────────────────────────────────
function WeeklyRing({ done, goal, label }: { done: number; goal: number; label: string }) {
  const pct    = Math.min(100, Math.round((done / goal) * 100))
  const radius = 56
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius} fill="none" stroke="#1CB0F6" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-fredoka text-2xl text-[#F5F5F5] leading-none">{done}/{goal}</span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-[#6F6F6F] mt-2 text-center">{label}</span>
    </div>
  )
}

// One row pattern, reused for both link-outs — identical shape, identical
// touch target, so the brain only has to learn the pattern once.
function LinkRow({ icon, color, label, value, href }: { icon: IconKind; color: string; label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 bg-card border border-white/5 rounded-2xl px-4 py-3.5 hover:border-white/15 transition-colors">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1a` }}>
        <Icon kind={icon} className="w-5 h-5" style={{ color } as React.CSSProperties} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-[#F5F5F5] truncate">{label}</span>
        <span className="block text-xs font-semibold text-[#6F6F6F]">{value}</span>
      </span>
      <Icon kind="chevronRight" className="w-4 h-4 text-[#6F6F6F]/50 shrink-0" />
    </Link>
  )
}

export default function ProgressClient({
  language, xp, streak, lessonsThisWeek, weeklyGoal, badgesEarned, badgesTotal, totalLessons,
}: Props) {
  const lang = language || 'en'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const level     = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL
  const xpPct     = Math.round((xpInLevel / XP_PER_LEVEL) * 100)

  return (
    // min-w-0 + w-full: prevents a flex/grid sidebar layout from forcing this
    // column wider than the viewport, which is what clipped content before.
    <div dir={dir} className="w-full min-w-0 max-w-md mx-auto px-4 py-4 md:py-6 text-[#F5F5F5]">

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[#6F6F6F] font-bold text-sm hover:text-white transition-colors mb-6">
        <Icon kind="chevronLeft" className="w-4 h-4" /> {t.back}
      </Link>

      {/* ── Ring + streak, stacked, centered — one glance, no math ── */}
      <div className="flex flex-col items-center gap-5 mb-6">
        <WeeklyRing done={lessonsThisWeek} goal={weeklyGoal} label={t.thisWeek} />
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full',
          streak > 0 ? 'bg-[#FAA918]/10' : 'bg-white/5',
        )}>
          <Icon kind="fire" className={cn('w-4 h-4', streak > 0 ? 'text-[#FAA918]' : 'text-[#6F6F6F]')} />
          <span className="font-fredoka text-base text-[#F5F5F5]">{streak}</span>
          <span className="text-xs font-bold text-[#6F6F6F]">{t.streak}</span>
        </div>
      </div>

      {/* ── Level bar — the bar is the whole explanation ── */}
      <div className="bg-card border border-white/5 rounded-2xl p-4 mb-3">
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

      {/* ── Two link-outs — same row shape, no embedded lists/grids ── */}
      <div className="space-y-3">
        <LinkRow icon="trophy" color="#FAA918" label={t.badges} value={`${badgesEarned}/${badgesTotal}`} href="/dashboard/badges" />
        <LinkRow icon="book"   color="#1CB0F6" label={t.lessons} value={`${totalLessons}`} href="/dashboard/skills" />
      </div>
    </div>
  )
}