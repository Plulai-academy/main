'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v9 — "an adventure, not a course list"
// ───────────────────────────────────────────────
// Adds the piece every prior version was missing: a voice. A hero banner
// greets the kid by name, a companion character delivers a rotating
// encouraging message in a speech bubble, and the learning path is now a
// wide illustrated landscape (sky, clouds, soft mountain silhouettes)
// instead of a small isolated blob — closer to "opening a world" than
// "opening a lesson list."
//
// `characterImageUrl` is a real prop — plug in your own character art here.
// If it's not provided, the banner still works (sky + greeting + stats),
// it just won't have a character illustration.
//
// Everything from the last round is preserved: no fake unit grouping,
// finished lessons collapse into one line by default, the current
// neighborhood is a handful of stops on a curved trail, not a wall of
// content.
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Play', continuePlaying: 'Continue playing',
    lessonOf: 'Lesson', of: 'of', streakDays: 'day streak',
    locked: 'Locked', completed: 'Completed', current: 'Up next', now: 'Now',
    lesson: 'lesson', lessons: 'lessons', mission: 'mission', missions: 'missions',
    allDone: 'World complete!', allDoneSub: "You've cleared every level here.",
    switching: 'Loading…', back: 'Back',
    leaderboard: 'Leaderboard', viewAll: 'See all', you: 'You',
    dailyQuests: 'Weekly quest', dailyChallenges: 'Daily challenge',
    challengeDone: 'Claimed 🎉', challengeCheck: 'Claim reward',
    heroSubtitle: 'Big ideas start with small steps.',
    pathHeading: 'Your Learning Path', pathSubtitle: 'Complete missions, unlock new skills.',
    level: 'Level', totalXp: 'Total XP',
  },
  ar: {
    play: 'العب', continuePlaying: 'كمّل من وين وقفت',
    lessonOf: 'الدرس', of: 'من', streakDays: 'أيام متتالية',
    locked: 'مقفل', completed: 'مكتمل', current: 'التالي', now: 'الآن',
    lesson: 'درس', lessons: 'دروس', mission: 'مهمة', missions: 'مهام',
    allDone: 'أنهيت هذا العالم! 🏆', allDoneSub: 'أكملت كل المستويات هنا.',
    switching: 'جارٍ التحميل…', back: 'رجوع',
    leaderboard: 'لوحة الصدارة', viewAll: 'عرض الكل', you: 'أنت',
    dailyQuests: 'تحدي الأسبوع', dailyChallenges: 'تحدي اليوم',
    challengeDone: 'تم التحصيل 🎉', challengeCheck: 'تحصيل المكافأة',
    heroSubtitle: 'الأفكار الكبيرة تبدأ بخطوات صغيرة.',
    pathHeading: 'خريطة رحلتك', pathSubtitle: 'أكمل المهام وافتح مهارات جديدة.',
    level: 'المستوى', totalXp: 'مجموع النقاط',
  },
  fr: {
    play: 'Jouer', continuePlaying: 'Continuer',
    lessonOf: 'Leçon', of: 'sur', streakDays: 'jours de suite',
    locked: 'Verrouillé', completed: 'Terminé', current: 'À suivre', now: 'Maintenant',
    lesson: 'leçon', lessons: 'leçons', mission: 'mission', missions: 'missions',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as fini tous les niveaux ici.',
    switching: 'Chargement…', back: 'Retour',
    leaderboard: 'Classement', viewAll: 'Tout voir', you: 'Toi',
    dailyQuests: 'Défi de la semaine', dailyChallenges: 'Défi du jour',
    challengeDone: 'Réclamé 🎉', challengeCheck: 'Réclamer',
    heroSubtitle: 'Les grandes idées commencent par de petits pas.',
    pathHeading: 'Ton parcours', pathSubtitle: 'Termine des missions, débloque de nouvelles compétences.',
    level: 'Niveau', totalXp: 'XP total',
  },
}

// rotating companion messages — one picked per day so it feels alive
// without needing any backend support
const MASCOT_MSGS: Record<string, string[]> = {
  en: [
    "You're doing great! Every line of code, every idea, makes you stronger.",
    'One more step, one more win — keep going!',
    "Mistakes mean you're learning. Proud of you!",
  ],
  ar: [
    'أنت رائع! كل سطر كود وكل فكرة تجعلك أقوى.',
    'خطوة كمان، وانتصار كمان — كمّل!',
    'الأخطاء معناها إنك بتتعلم. إحنا فخورين فيك!',
  ],
  fr: [
    'Tu assures ! Chaque ligne de code, chaque idée te rend plus fort.',
    'Encore un pas, encore une victoire — continue !',
    "Se tromper, c'est apprendre. On est fiers de toi !",
  ],
}

interface Track    { id: string; name: string; emoji: string; color: string }
interface Skill    { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg{ skill_node_id: string; progress_pct: number; completed_at: string | null }

interface LeaderboardEntry {
  id: string
  rank_global: number | null
  name: string
  avatar_url: string | null
  xp: number
  is_current_user?: boolean
}

interface DailyQuest { label: string; current: number; target: number }
interface DailyChallenge { id: string; title: string; emoji: string; xp_reward: number; completed: boolean }

interface Props {
  userId: string
  tracks: Track[]
  initialTrackId: string | null
  skills: Skill[]
  skillProgress: SkillProg[]
  lessonCountMap: Record<string, number>
  language: string
  streak: number
  gems: number
  initialCurrentSkillId: string | null
  initialFirstIncompleteLessonId: string | null
  leaderboard?: LeaderboardEntry[]
  dailyQuest?: DailyQuest
  dailyChallenge?: DailyChallenge | null
  totalTimeMins?: number
  /** kid's display name for the hero greeting; greeting is generic if omitted */
  userName?: string
  /** your own character illustration — rendered in the hero banner if provided */
  characterImageUrl?: string
  /** shown as the signature under the mascot's speech-bubble message */
  mascotName?: string
}

const PAL = {
  lagoon: '#EAF7F4',
  lagoonFill: '#D9F1EC',
  reef: '#17D9C0',
  reefDeep: '#0FA893',
  gold: '#FFB930',
  goldDeep: '#DB9410',
  coral: '#FF6B57',
  coralDeep: '#E24E3C',
  ink: '#29394A',
  inkSoft: '#5C7080',
  white: '#FFFFFF',
  sky: '#BEE7F5',
  mountainFar: '#A9C9E8',
  mountainNear: '#7FA9D6',
}

// strips internal content-ops labels like "S3 — " or "S12 - " from a title
// before it ever reaches a kid's screen — that's a CMS artifact, not content.
function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*[—-]\s*/i, '').trim() || title
}

type IconKind = 'lock' | 'check' | 'flame' | 'gem' | 'play' | 'chevronR'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 22 5.5 5.5 0 0 1 6 16.6C6 11.8 10 9 12 2Z"/></svg>
    case 'gem':
      return <svg {...common}><path d="M6 4h12l3 5-9 11L3 9l3-5Zm1.8 2L5.5 9h4.9L7.8 6Zm3.4 0-2.4 3h6.4l-2.4-3h-1.6Zm3.4 0-2.3 3h4.9L14.6 6ZM6.2 11l4.9 7-4-7h-.9Zm11.6 0h-.9l-4 7 4.9-7ZM9.4 11l2.6 6.5L14.6 11H9.4Z"/></svg>
    case 'play':
      return <svg {...common}><path d="M8 5v14l11-7L8 5Z"/></svg>
    case 'chevronR':
      return <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
  }
}

function ProgressBar({ pct, track = PAL.lagoonFill, fill }: { pct: number; track?: string; fill: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden w-full" style={{ backgroundColor: track }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, pct)}%`, backgroundColor: fill }} />
    </div>
  )
}

function XpBadge({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black shrink-0" style={{ backgroundColor: PAL.lagoon, color: PAL.goldDeep }}>
      +{xp} XP
    </span>
  )
}

// ── Hero banner: greeting, character slot, mascot speech bubble, stats ──
function HeroBanner({
  userName, characterImageUrl, mascotName, mascotMsg, streak, level, totalXp, t,
  activeTrack, tracks, showPicker, setShowPicker, pickerRef, onSelectTrack, activeTrackId,
}: {
  userName?: string
  characterImageUrl?: string
  mascotName?: string
  mascotMsg: string
  streak: number
  level: number
  totalXp: number
  t: Record<string, string>
  activeTrack: Track | null
  tracks: Track[]
  showPicker: boolean
  setShowPicker: (v: boolean | ((p: boolean) => boolean)) => void
  pickerRef: React.RefObject<HTMLDivElement>
  onSelectTrack: (id: string) => void
  activeTrackId: string | null
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4" style={{ background: `linear-gradient(180deg, ${PAL.sky} 0%, ${PAL.lagoon} 100%)` }}>
      {/* ambient sky decoration */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <span className="absolute rounded-full bg-white/60 blur-md" style={{ width: 90, height: 40, top: 18, left: '8%' }} />
        <span className="absolute rounded-full bg-white/50 blur-md" style={{ width: 60, height: 28, top: 40, left: '22%' }} />
        <span className="absolute rounded-full bg-white/45 blur-md" style={{ width: 70, height: 30, top: 14, right: '30%' }} />
      </div>

      <div className="relative flex items-start justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="min-w-0">
          <h1 className="font-black text-xl sm:text-2xl md:text-3xl leading-tight truncate" style={{ color: PAL.ink }}>
            {userName ? `Hello ${userName} 👋` : 'Welcome back 👋'}
          </h1>
          <p className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: PAL.inkSoft }}>{t.heroSubtitle}</p>
        </div>

        {activeTrack && (
          <div className="relative shrink-0" ref={pickerRef}>
            <button
              onClick={() => setShowPicker(v => !v)}
              aria-label="Switch track"
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/80 rounded-2xl transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)' }}
            >
              <span className="text-base">{activeTrack.emoji}</span>
            </button>
            {showPicker && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-2xl overflow-hidden z-30" style={{ boxShadow: '0 8px 24px rgba(41,57,74,0.14)' }}>
                {tracks.map(tr => (
                  <button
                    key={tr.id}
                    onClick={() => onSelectTrack(tr.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{ backgroundColor: tr.id === activeTrackId ? PAL.lagoon : 'transparent' }}
                  >
                    <span>{tr.emoji}</span>
                    <span className="flex-1 font-bold truncate">{tr.name}</span>
                    {tr.id === activeTrackId && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PAL.reef }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* stat chips */}
      <div className="relative flex flex-wrap gap-2 px-4 sm:px-6 mt-3">
        <div className="flex items-center gap-1.5 bg-white/85 rounded-full px-3 py-1.5">
          <Icon kind="flame" className="w-3.5 h-3.5" style={{ color: PAL.coral }} />
          <span className="text-xs font-black" style={{ color: PAL.ink }}>{streak} {t.streakDays}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/85 rounded-full px-3 py-1.5">
          <Icon kind="gem" className="w-3.5 h-3.5" style={{ color: PAL.gold }} />
          <span className="text-xs font-black" style={{ color: PAL.ink }}>{totalXp} {t.totalXp}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: PAL.ink }}>
          <span className="text-xs font-black text-white">{t.level} {level}</span>
        </div>
      </div>

      {/* character + mascot bubble */}
      <div className="relative flex items-end justify-end gap-3 px-4 sm:px-6 pb-3" style={{ minHeight: characterImageUrl ? 120 : 0 }}>
        <div className="flex-1 min-w-0 mb-4 flex justify-end">
          <div className="relative bg-white rounded-2xl px-3.5 py-2.5 max-w-[240px]" style={{ boxShadow: '0 2px 8px rgba(41,57,74,0.12)' }}>
            <p className="text-[11px] sm:text-xs font-bold leading-snug" style={{ color: PAL.ink }}>{mascotMsg}</p>
            {mascotName && <p className="text-[10px] font-black mt-1" style={{ color: PAL.reefDeep }}>— {mascotName}</p>}
            <span className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-white" />
          </div>
        </div>
        {characterImageUrl && (
          <img src={characterImageUrl} alt="" className="h-24 sm:h-32 w-auto object-contain object-bottom shrink-0" />
        )}
      </div>
    </div>
  )
}

// ── quick topic chip: a shortcut into a nearby lesson ──
function TopicChip({ skill, locked, tint, onClick, label }: {
  skill: Skill
  locked: boolean
  tint: { bg: string; icon: string }
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={locked}
      aria-label={label}
      className={cn('flex items-center gap-2 rounded-2xl pl-2 pr-3 py-2 shrink-0 transition-transform', !locked && 'hover:-translate-y-0.5')}
      style={{ backgroundColor: locked ? PAL.lagoonFill : tint.bg, opacity: locked ? 0.7 : 1 }}
    >
      <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ backgroundColor: locked ? PAL.white : tint.icon }}>
        {locked ? <Icon kind="lock" className="w-3.5 h-3.5" style={{ color: PAL.inkSoft }} /> : (skill.emoji || '⭐')}
      </span>
      <span className="text-xs font-bold truncate max-w-[110px]" style={{ color: PAL.ink }}>{cleanTitle(skill.title)}</span>
      <Icon kind="chevronR" className="w-3 h-3 shrink-0" style={{ color: PAL.inkSoft }} />
    </button>
  )
}

const CHIP_TINTS = [
  { bg: '#E8FBF7', icon: PAL.reef },
  { bg: '#FFF6E3', icon: PAL.gold },
  { bg: '#FFECEA', icon: PAL.coral },
]

// ── continue card: WHITE card, progress bar, solid claim/play button ────
function ContinueCard({
  skill, lessonIdx, lessonCount, pct, onPlay, onBack, t,
}: {
  skill: Skill
  lessonIdx: number
  lessonCount: number
  pct: number
  onPlay: () => void
  onBack: () => void
  t: Record<string, string>
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 bg-white" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.06)' }}>
      <button onClick={onBack} className="flex items-center gap-1.5 mb-3 -ms-1 opacity-70 hover:opacity-100 transition-opacity">
        <svg width="15" height="15" viewBox="0 0 24 24" fill={PAL.inkSoft}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
        <span className="text-[11px] font-black tracking-wide uppercase" style={{ color: PAL.inkSoft }}>{t.continuePlaying}</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="font-black text-lg leading-tight flex items-center gap-2 min-w-0" style={{ color: PAL.ink }}>
              <span className="text-xl shrink-0">{skill.emoji}</span>
              <span className="truncate">{cleanTitle(skill.title)}</span>
            </h2>
            <XpBadge xp={skill.xp_reward} />
          </div>
          <p className="text-xs font-bold mb-2.5" style={{ color: PAL.inkSoft }}>
            {t.lessonOf} {lessonIdx} {t.of} {lessonCount || 1}
          </p>
          <ProgressBar pct={pct} fill={PAL.gold} />
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="shrink-0 w-full sm:w-auto rounded-2xl px-5 py-3 font-black text-sm flex items-center justify-center gap-1.5 text-white transition-transform hover:-translate-y-0.5 active:translate-y-[1px]"
          style={{ backgroundColor: PAL.coral }}
        >
          <Icon kind="play" className="w-4 h-4" />
          {t.play}
        </button>
      </div>
    </div>
  )
}

// a natural winding layout for up to 5 stops, spread left-to-right across
// a wide landscape banner (0–100 % of the container in both axes)
const PATH_POSITIONS = [
  { x: 9, y: 58 },
  { x: 27, y: 24 },
  { x: 45, y: 62 },
  { x: 63, y: 26 },
  { x: 81, y: 54 },
]

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function PathNode({ locked, bg, isCurrent, onClick, label }: {
  locked: boolean
  bg: string
  isCurrent: boolean
  onClick: () => void
  label: string
}) {
  const [shake, setShake] = useState(false)
  const handleClick = () => {
    if (locked) { setShake(true); window.setTimeout(() => setShake(false), 400); return }
    onClick()
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={locked}
      aria-label={label}
      className={cn('flex items-center justify-center transition-transform shrink-0', !locked && 'active:scale-90')}
      style={{
        width: isCurrent ? 56 : 48,
        height: isCurrent ? 56 : 48,
        borderRadius: '9999px',
        backgroundColor: bg,
        border: '3px solid white',
        boxShadow: isCurrent ? `0 0 0 4px ${PAL.gold}33, 0 6px 14px rgba(41,57,74,0.25)` : '0 4px 10px rgba(41,57,74,0.18)',
        animation: shake ? 'shakeX 0.4s ease' : undefined,
      }}
    >
      {locked ? (
        <Icon kind="lock" className="w-4 h-4" style={{ color: PAL.inkSoft }} />
      ) : isCurrent ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={PAL.white}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
      ) : (
        <Icon kind="check" className="w-4 h-4" style={{ color: PAL.white }} />
      )}
    </button>
  )
}

// the wide landscape path: sky, clouds, soft mountain silhouettes, and a
// handful of labeled stops on a curved trail — the "neighborhood" around
// where the kid actually is, not the whole curriculum at once.
function PathBanner({
  skills, currentSkillId, isUnlockedFn, isCompleteFn, onTap, t, dir,
}: {
  skills: Skill[]
  currentSkillId: string | null
  isUnlockedFn: (s: Skill) => boolean
  isCompleteFn: (id: string) => boolean
  onTap: (s: Skill, unlocked: boolean) => void
  t: Record<string, string>
  dir: 'ltr' | 'rtl'
}) {
  const pts = skills.map((_, i) => PATH_POSITIONS[i % PATH_POSITIONS.length])
  const trailD = buildSmoothPath(pts)
  const doneCount = skills.filter(s => isCompleteFn(s.id)).length

  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 bg-white" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.06)' }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-black text-base flex items-center gap-2" style={{ color: PAL.ink }}>
            🧭 {t.pathHeading}
          </h3>
          <p className="text-xs font-bold" style={{ color: PAL.inkSoft }}>{t.pathSubtitle}</p>
        </div>
        <span className="text-xs font-black shrink-0" style={{ color: PAL.reefDeep }}>
          {doneCount}/{skills.length} {skills.length === 1 ? t.mission : t.missions}
        </span>
      </div>

      <div className="no-scrollbar overflow-x-auto -mx-1 px-1">
        <div className="relative min-w-[560px] h-[230px] rounded-2xl overflow-hidden" style={{ background: `linear-gradient(180deg, ${PAL.sky} 0%, ${PAL.lagoon} 75%)` }}>
          {/* ambient sky + mountains, purely decorative */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <span className="absolute rounded-full bg-white/60 blur-md" style={{ width: 70, height: 30, top: 16, left: '10%' }} />
            <span className="absolute rounded-full bg-white/50 blur-md" style={{ width: 55, height: 24, top: 32, left: '55%' }} />
            <span className="absolute rounded-full bg-white/50 blur-md" style={{ width: 60, height: 26, top: 10, left: '78%' }} />
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[90px]">
              <path d="M0 40 L0 26 L15 12 L28 24 L42 8 L58 22 L72 6 L88 20 L100 10 L100 40 Z" fill={PAL.mountainFar} opacity="0.5" />
              <path d="M0 40 L0 32 L18 20 L34 30 L50 16 L66 28 L82 14 L100 26 L100 40 Z" fill={PAL.mountainNear} opacity="0.55" />
            </svg>
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <path d={trailD} fill="none" stroke={PAL.reefDeep} strokeOpacity={0.45} strokeWidth={0.9} strokeDasharray="0.5 2.4" strokeLinecap="round" />
          </svg>

          {skills.map((s, i) => {
            const pos = pts[i]
            const px = dir === 'rtl' ? 100 - pos.x : pos.x
            const unlocked = isUnlockedFn(s)
            const complete = isCompleteFn(s.id)
            const isCurrent = s.id === currentSkillId
            const bg = complete || (unlocked && !isCurrent) ? PAL.reef : isCurrent ? PAL.gold : PAL.white
            const statusText = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.now : ''
            const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.current : cleanTitle(s.title)

            return (
              <div
                key={s.id}
                className="absolute flex flex-col items-center"
                style={{ left: `${px}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', width: 92 }}
              >
                <PathNode locked={!unlocked} bg={bg} isCurrent={isCurrent} onClick={() => onTap(s, unlocked)} label={label} />
                <div className="mt-1 text-center">
                  <p className="text-[10px] font-bold leading-tight truncate" style={{ color: PAL.ink, maxWidth: 90 }}>{cleanTitle(s.title)}</p>
                  <p className="text-[9px] font-black" style={{ color: complete ? PAL.reefDeep : isCurrent ? PAL.goldDeep : PAL.inkSoft }}>{statusText}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// one row per finished lesson — its own real title, nothing borrowed or
// grouped. Tapping it reopens that lesson for review.
function CompletedRow({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-2xl text-start transition-colors hover:bg-white"
    >
      <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PAL.reef }}>
        <Icon kind="check" className="w-3.5 h-3.5" style={{ color: PAL.white }} />
      </span>
      <span className="text-sm font-bold truncate flex-1 min-w-0" style={{ color: PAL.inkSoft }}>
        {cleanTitle(skill.title)}
      </span>
    </button>
  )
}

// finished lessons collapse into ONE line by default — a kid never has to
// scroll past everything they've already done just to reach today's stop.
function CompletedSummary({ skills, t, onTapSkill }: { skills: Skill[]; t: Record<string, string>; onTapSkill: (s: Skill) => void }) {
  const [open, setOpen] = useState(false)
  if (skills.length === 0) return null
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors hover:bg-white"
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PAL.reef }}>
          <Icon kind="check" className="w-3.5 h-3.5" style={{ color: PAL.white }} />
        </span>
        <span className="text-sm font-bold flex-1 min-w-0 text-start" style={{ color: PAL.inkSoft }}>
          {skills.length} {skills.length === 1 ? t.lesson : t.lessons} {t.completed.toLowerCase()}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6" fill="none" stroke={PAL.inkSoft} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 ps-2">
          {skills.map(skill => (
            <CompletedRow key={skill.id} skill={skill} onClick={() => onTapSkill(skill)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SideCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5" style={{ boxShadow: '0 1px 0 rgba(41,57,74,0.08)', border: '1px solid rgba(41,57,74,0.06)' }}>{children}</div>
}

function SideHeader({ title, onViewAll, t }: { title: string; onViewAll?: () => void; t: Record<string, string> }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-base" style={{ color: PAL.ink }}>{title}</h3>
      {onViewAll && <button onClick={onViewAll} className="text-xs font-black tracking-wide uppercase" style={{ color: PAL.coralDeep }}>{t.viewAll}</button>}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  return <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>{medal ?? rank}</div>
}

function LeaderboardAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [errored, setErrored] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  if (avatarUrl && !errored) {
    return <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" style={{ backgroundColor: PAL.lagoonFill }} onError={() => setErrored(true)} />
  }
  return <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: PAL.lagoonFill, color: PAL.inkSoft }}>{initial}</div>
}

function LeaderboardCard({ entries, t, onViewAll }: { entries: LeaderboardEntry[]; t: Record<string, string>; onViewAll: () => void }) {
  const top = entries.slice(0, 5)
  return (
    <SideCard>
      <SideHeader title={t.leaderboard} onViewAll={onViewAll} t={t} />
      <div className="flex flex-col gap-1">
        {top.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 px-2 py-2 rounded-2xl" style={entry.is_current_user ? { backgroundColor: PAL.lagoon } : undefined}>
            {entry.rank_global != null ? <RankBadge rank={entry.rank_global} /> : <div className="w-7 h-7 shrink-0" />}
            <LeaderboardAvatar name={entry.name} avatarUrl={entry.avatar_url} />
            <span className={cn('flex-1 min-w-0 truncate text-sm', entry.is_current_user ? 'font-black' : 'font-bold')} style={{ color: PAL.ink }}>
              {entry.is_current_user ? t.you : entry.name}
            </span>
            <span className="text-xs font-black shrink-0" style={{ color: PAL.coralDeep }}>{entry.xp} XP</span>
          </div>
        ))}
      </div>
    </SideCard>
  )
}

function QuestCard({ quest, t }: { quest: DailyQuest; t: Record<string, string> }) {
  const pct = quest.target > 0 ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 0
  return (
    <SideCard>
      <SideHeader title={t.dailyQuests} t={t} />
      <p className="text-sm font-bold mb-3" style={{ color: PAL.ink }}>{quest.label}</p>
      <div className="flex items-center gap-2 mb-3">
        <ProgressBar pct={pct} fill={PAL.gold} />
        <span className="text-xs font-black shrink-0" style={{ color: PAL.inkSoft }}>{quest.current}/{quest.target}</span>
      </div>
      <button
        type="button"
        disabled={pct < 100}
        className="w-full rounded-2xl py-2.5 font-black text-sm text-white transition-opacity"
        style={{ backgroundColor: pct >= 100 ? PAL.coral : PAL.lagoonFill, color: pct >= 100 ? PAL.white : PAL.inkSoft }}
      >
        {t.challengeCheck}
      </button>
    </SideCard>
  )
}

function ChallengeCard({ challenge, t, onOpen }: { challenge: DailyChallenge; t: Record<string, string>; onOpen?: () => void }) {
  return (
    <SideCard>
      <SideHeader title={t.dailyChallenges} t={t} />
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: PAL.lagoon }}>{challenge.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-bold truncate', challenge.completed && 'line-through')} style={{ color: challenge.completed ? PAL.inkSoft : PAL.ink }}>{challenge.title}</p>
          <p className="text-xs font-black" style={{ color: PAL.goldDeep }}>+{challenge.xp_reward} XP</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={challenge.completed}
        className="w-full rounded-2xl py-2.5 font-black text-sm transition-opacity"
        style={{ backgroundColor: challenge.completed ? PAL.lagoonFill : PAL.coral, color: challenge.completed ? PAL.reefDeep : PAL.white }}
      >
        {challenge.completed ? t.challengeDone : t.challengeCheck}
      </button>
    </SideCard>
  )
}

export default function SkillsClient({
  userId, tracks = [], initialTrackId, skills = [], skillProgress = [], lessonCountMap = {},
  language, streak = 0, gems = 0, initialCurrentSkillId, initialFirstIncompleteLessonId,
  leaderboard = [], dailyQuest, dailyChallenge, totalTimeMins = 0,
  userName, characterImageUrl, mascotName,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as 'en' | 'ar' | 'fr'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [activeTrackId, setActiveTrackId] = useState<string | null>(initialTrackId)
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(initialCurrentSkillId)
  const [firstIncompleteLessonId, setFirstIncompleteLessonId] = useState<string | null>(initialFirstIncompleteLessonId)
  const [showPicker, setShowPicker] = useState(false)
  const [switching, setSwitching] = useState(false)

  const pickerRef = useRef<HTMLDivElement | null>(null)

  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  const orderedSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrackId).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrackId],
  )

  const isUnlocked = (skill: Skill) =>
    !skill.required_nodes?.length || skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)
  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  const activeTrack = tracks.find(tr => tr.id === activeTrackId) ?? null
  const currentSkill = orderedSkills.find(s => s.id === currentSkillId) ?? null
  const allDone = orderedSkills.length > 0 && orderedSkills.every(s => isComplete(s.id))

  const currentSkillIdx = currentSkill ? orderedSkills.findIndex(s => s.id === currentSkill.id) : -1
  const islandStart = currentSkillIdx >= 0 ? Math.max(0, currentSkillIdx - 1) : 0
  const islandSkills = orderedSkills.slice(islandStart, islandStart + 5)
  const completedBefore = orderedSkills.slice(0, islandStart).filter(s => isComplete(s.id))

  // global-ish stats for the hero banner, computed from real data (not fabricated):
  // total XP earned across every completed skill, and a simple level heuristic
  // derived from it. Tune the divisor server-side once you have a real leveling
  // curve — this is a placeholder that's at least grounded in real numbers.
  const totalXp = useMemo(
    () => skills.reduce((sum, s) => (isComplete(s.id) ? sum + (s.xp_reward || 0) : sum), 0),
    [skills, progressMap],
  )
  const level = 1 + Math.floor(totalXp / 500)

  const mascotMsg = useMemo(() => {
    const msgs = MASCOT_MSGS[lang] ?? MASCOT_MSGS.en
    return msgs[new Date().getDate() % msgs.length]
  }, [lang])

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  const handleTrackSelect = async (trackId: string) => {
    if (trackId === activeTrackId) { setShowPicker(false); return }
    setShowPicker(false); setSwitching(true); setActiveTrackId(trackId)

    const saveResult = await setCurrentTrack(trackId)
    if (saveResult?.error) console.error('Failed to save current track:', saveResult.error)

    try {
      const res = await fetch('/api/path/resolve-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })
      const data = await res.json()
      setCurrentSkillId(data.skillId ?? null)
      setFirstIncompleteLessonId(data.lessonId ?? null)
    } catch {
      const trackSkills = skills.filter(s => s.track_id === trackId).sort((a, b) => a.sort_order - b.sort_order)
      const fallback = trackSkills.find(s => isUnlocked(s) && !isComplete(s.id)) ?? trackSkills[0] ?? null
      setCurrentSkillId(fallback?.id ?? null)
      setFirstIncompleteLessonId(null)
    } finally {
      setSwitching(false)
    }
  }

  const goToCurrentLesson = () => {
    if (!currentSkill) return
    if (firstIncompleteLessonId) router.push(`/dashboard/path/${currentSkill.id}/lesson/${firstIncompleteLessonId}`)
    else router.push(`/dashboard/path/${currentSkill.id}`)
  }

  const handleCardTap = (skill: Skill, unlocked: boolean) => {
    if (!unlocked) return
    if (skill.id === currentSkillId) goToCurrentLesson()
    else router.push(`/dashboard/path/${skill.id}`)
  }

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  const sidebarWidgets = (
    <>
      <LeaderboardCard entries={leaderboard} t={t} onViewAll={() => router.push('/dashboard/leaderboard')} />
      {dailyQuest && <QuestCard quest={dailyQuest} t={t} />}
      {dailyChallenge && <ChallengeCard challenge={dailyChallenge} t={t} onOpen={() => router.push(`/dashboard/challenges/${dailyChallenge.id}`)} />}
    </>
  )

  return (
    <div dir={dir} className="min-h-screen w-full overflow-x-hidden font-[Baloo_2,Cairo,sans-serif]" style={{ backgroundColor: PAL.lagoon, color: PAL.ink }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Cairo:wght@600;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes shakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
      ` }} />

      <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 max-w-[1100px] mx-auto w-full">
        <HeroBanner
          userName={userName}
          characterImageUrl={characterImageUrl}
          mascotName={mascotName}
          mascotMsg={mascotMsg}
          streak={streak}
          level={level}
          totalXp={totalXp}
          t={t}
          activeTrack={activeTrack}
          tracks={tracks}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          pickerRef={pickerRef}
          onSelectTrack={handleTrackSelect}
          activeTrackId={activeTrackId}
        />
      </div>

      <div className="flex flex-col lg:flex-row justify-center gap-6 px-3 sm:px-4 pb-12 max-w-[1100px] mx-auto w-full">
        <div className="flex-1 min-w-0 w-full lg:max-w-[680px]">
          {switching ? (
            <div className="flex items-center justify-center py-20">
              <p className="font-bold" style={{ color: PAL.inkSoft }}>{t.switching}</p>
            </div>
          ) : allDone ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl">
              <p className="text-5xl sm:text-6xl mb-3">🏆</p>
              <p className="text-lg sm:text-xl font-black">{t.allDone}</p>
              <p className="mt-2 font-bold text-sm sm:text-base" style={{ color: PAL.inkSoft }}>{t.allDoneSub}</p>
            </div>
          ) : currentSkill ? (
            <>
              <ContinueCard
                skill={currentSkill}
                lessonIdx={currentLessonIdx}
                lessonCount={currentLessonCount}
                pct={currentProgressPct}
                onPlay={goToCurrentLesson}
                onBack={() => router.back()}
                t={t}
              />

              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 mb-6">
                {islandSkills.map(s => {
                  const unlocked = isUnlocked(s)
                  const isCurrent = s.id === currentSkillId
                  const label = !unlocked ? t.locked : isComplete(s.id) ? t.completed : isCurrent ? t.current : cleanTitle(s.title)
                  return (
                    <TopicChip
                      key={s.id}
                      skill={s}
                      locked={!unlocked}
                      tint={CHIP_TINTS[orderedSkills.indexOf(s) % CHIP_TINTS.length]}
                      onClick={() => handleCardTap(s, unlocked)}
                      label={label}
                    />
                  )
                })}
              </div>

              <CompletedSummary skills={completedBefore} t={t} onTapSkill={(skill) => handleCardTap(skill, true)} />

              <PathBanner
                skills={islandSkills}
                currentSkillId={currentSkillId}
                isUnlockedFn={isUnlocked}
                isCompleteFn={isComplete}
                onTap={handleCardTap}
                t={t}
                dir={dir}
              />
            </>
          ) : null}

          <div className="lg:hidden flex flex-col gap-4 mt-2">{sidebarWidgets}</div>
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pt-1">
          {sidebarWidgets}
        </aside>
      </div>
    </div>
  )
}