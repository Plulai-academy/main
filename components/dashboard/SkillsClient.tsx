'use client'
// components/dashboard/SkillsClient.tsx
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const UI: Record<string, Record<string, string>> = {
  en: {
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    streak: 'day streak',
    keepGoing: 'keep it going',
    upNext: 'Up next',
    start: 'Start lesson',
    continue: 'Continue',
    done: 'done',
    of: 'of',
    inThisTrack: 'In this track',
    min: 'min',
    locked: 'Complete previous skills to unlock',
    mastered: 'Mastered',
    switchTrack: 'Switch track',
    allDone: "You've completed this track!",
    allDoneDesc: 'Explore another track to keep learning.',
    explore: 'Explore tracks',
  },
  ar: {
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    streak: 'أيام متتالية',
    keepGoing: 'واصل!',
    upNext: 'التالي',
    start: 'ابدأ الدرس',
    continue: 'واصل',
    done: 'مكتملة',
    of: 'من',
    inThisTrack: 'في هذا المسار',
    min: 'دقيقة',
    locked: 'أكمل المهارات السابقة للفتح',
    mastered: 'أتقنت',
    switchTrack: 'تغيير المسار',
    allDone: 'أكملت هذا المسار!',
    allDoneDesc: 'استكشف مساراً آخر لمواصلة التعلم.',
    explore: 'استكشف المسارات',
  },
  fr: {
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    streak: 'jours de suite',
    keepGoing: 'continue !',
    upNext: 'Ensuite',
    start: 'Commencer',
    continue: 'Continuer',
    done: 'terminées',
    of: 'sur',
    inThisTrack: 'Dans cette piste',
    min: 'min',
    locked: 'Termine les étapes précédentes pour débloquer',
    mastered: 'Maîtrisé',
    switchTrack: 'Changer de piste',
    allDone: 'Tu as terminé cette piste !',
    allDoneDesc: "Explore une autre piste pour continuer.",
    explore: 'Explorer les pistes',
  },
}

interface Track     { id: string; name: string; emoji: string; color: string }
interface Skill     { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg { skill_node_id: string; progress_pct: number; completed_at: string | null }

interface Props {
  userId:                  string
  tracks:                  Track[]
  skills:                  Skill[]
  skillProgress:           SkillProg[]
  lessonCountMap:          Record<string, number>
  language:                string
  userName:                string
  streak:                  number
  currentTrackId:          string | null
  nextSkillId:             string | null
  firstIncompleteLessonId: string | null
}

function getGreeting(lang: string): string {
  const h = new Date().getHours()
  const t = UI[lang] ?? UI.en
  if (h < 12) return t.goodMorning
  if (h < 18) return t.goodAfternoon
  return t.goodEvening
}

export default function SkillsClient({
  userId, tracks, skills, skillProgress, lessonCountMap,
  language, userName, streak, currentTrackId, nextSkillId, firstIncompleteLessonId,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as Language
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [activeTrackId, setActiveTrackId] = useState(currentTrackId ?? tracks[0]?.id ?? '')
  const [showTrackPicker, setShowTrackPicker] = useState(false)

  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  const isUnlocked = (skill: Skill) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)

  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  const trackSkills = useMemo(
    () => skills.filter(s => s.track_id === activeTrackId).sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrackId],
  )

  const activeTrack = tracks.find(t => t.id === activeTrackId)

  // Hero skill: first unlocked + incomplete, or the nextSkillId from server
  const heroSkill = useMemo(() => {
    if (activeTrackId === currentTrackId && nextSkillId) {
      return trackSkills.find(s => s.id === nextSkillId) ?? null
    }
    return trackSkills.find(s => isUnlocked(s) && !isComplete(s.id)) ?? null
  }, [trackSkills, nextSkillId, activeTrackId, currentTrackId])

  const heroLessonId = activeTrackId === currentTrackId ? firstIncompleteLessonId : null

  const heroProgress = heroSkill ? (progressMap[heroSkill.id] ?? 0) : 0
  const heroLessonCount = heroSkill ? (lessonCountMap[heroSkill.id] ?? 0) : 0
  const doneLessons = heroLessonCount > 0 ? Math.round((heroProgress / 100) * heroLessonCount) : 0
  const allTrackDone = trackSkills.length > 0 && trackSkills.every(s => isComplete(s.id))

  const heroHref = heroSkill && heroLessonId
    ? `/dashboard/skills/${heroSkill.id}/lesson/${heroLessonId}`
    : heroSkill
    ? `/dashboard/skills/${heroSkill.id}`
    : '/dashboard/skills'

  return (
    <div
      className="min-h-screen bg-[#09090f] pb-28 select-none"
      dir={dir}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;700;800;900&display=swap');`}</style>

      {/* ── HEADER ── */}
      <div className="px-6 pt-8 pb-2">
        <p className="text-[13px] text-white/40 mb-1">{getGreeting(lang)}</p>
        {userName ? (
          <h1 className="text-[26px] font-bold text-white leading-tight mb-6">{userName}</h1>
        ) : null}

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[18px]">🔥</span>
            <span className="text-[14px] font-bold text-white">{streak}</span>
            <span className="text-[14px] text-white/50">{t.streak} — {t.keepGoing}</span>
          </div>
        )}

        {/* Track row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {activeTrack && (
              <>
                <span className="text-[18px]">{activeTrack.emoji}</span>
                <span className="text-[15px] font-bold text-white">{activeTrack.name}</span>
              </>
            )}
          </div>
          {tracks.length > 1 && (
            <button
              onClick={() => setShowTrackPicker(v => !v)}
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              {t.switchTrack}
              <span className="text-[10px]">{showTrackPicker ? '▲' : '▼'}</span>
            </button>
          )}
        </div>

        {/* Track picker */}
        {showTrackPicker && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tracks.map(tr => (
              <button
                key={tr.id}
                onClick={() => { setActiveTrackId(tr.id); setShowTrackPicker(false) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] border transition-all',
                  tr.id === activeTrackId
                    ? 'bg-[#1e1b3a] border-[#534AB7] text-[#AFA9EC]'
                    : 'bg-[#141420] border-white/8 text-white/50 hover:border-white/20',
                )}
              >
                <span>{tr.emoji}</span>
                <span>{tr.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── HERO CARD ── */}
      <div className="px-6 mb-6">
        {allTrackDone ? (
          <div className="bg-[#141420] border border-white/8 rounded-[24px] p-7 text-center">
            <div className="text-[44px] mb-3">🏆</div>
            <p className="text-[18px] font-bold text-white mb-2">{t.allDone}</p>
            <p className="text-[14px] text-white/50 mb-5">{t.allDoneDesc}</p>
            <button
              onClick={() => setShowTrackPicker(true)}
              className="px-6 py-3 rounded-[14px] bg-[#7F77DD] text-white text-[15px] font-bold"
            >
              {t.explore}
            </button>
          </div>
        ) : heroSkill ? (
          <div className="bg-[#141420] border border-white/8 rounded-[24px] overflow-hidden relative">
            {/* top accent */}
            <div className="h-[3px] bg-[#7F77DD]" />
            <div className="p-7">
              <p className="text-[11px] font-bold tracking-[0.1em] text-white/30 uppercase mb-3">{t.upNext}</p>
              <span className="text-[44px] block mb-4">{heroSkill.emoji}</span>
              <h2 className="text-[20px] font-bold text-white leading-tight mb-2">{heroSkill.title}</h2>
              <p className="text-[14px] text-white/50 leading-relaxed mb-5">{heroSkill.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-[13px] font-bold text-[#AFA9EC]">+{heroSkill.xp_reward} XP</span>
                <span className="text-[13px] text-white/40">{heroLessonCount} lessons</span>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href={heroHref}
                  className="px-6 py-3 rounded-[14px] bg-[#7F77DD] text-white text-[15px] font-bold transition-all active:scale-95 active:bg-[#534AB7]"
                >
                  {heroProgress > 0 ? t.continue : t.start}
                </Link>

                {heroLessonCount > 0 && (
                  <div className="text-right">
                    <p className="text-[12px] text-white/30 mb-1">
                      {doneLessons} {t.of} {heroLessonCount} {t.done}
                    </p>
                    <div className="w-[80px] h-[4px] bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7F77DD] rounded-full transition-all duration-700"
                        style={{ width: `${heroProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── LESSON LIST ── */}
      <div className="px-6">
        <p className="text-[11px] font-bold tracking-[0.1em] text-white/30 uppercase mb-3">{t.inThisTrack}</p>
        <div className="flex flex-col gap-2">
          {trackSkills.map(skill => {
            const complete  = isComplete(skill.id)
            const unlocked  = isUnlocked(skill)
            const isCurrent = skill.id === heroSkill?.id
            const prog      = progressMap[skill.id] ?? 0

            return (
              <Link
                key={skill.id}
                href={unlocked ? `/dashboard/skills/${skill.id}` : '#'}
                className={cn(
                  'flex items-center gap-4 px-4 py-3.5 rounded-[16px] border transition-all',
                  complete
                    ? 'bg-[#141420] border-white/5 opacity-50'
                    : isCurrent
                    ? 'bg-[#1e1b3a] border-[#534AB7]'
                    : unlocked
                    ? 'bg-[#141420] border-white/8 hover:border-white/15'
                    : 'bg-[#141420] border-white/5 opacity-35 pointer-events-none',
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-[40px] h-[40px] rounded-[12px] flex items-center justify-center text-[20px] flex-shrink-0',
                  complete ? 'bg-[#0d2318]' : isCurrent ? 'bg-[#1e1b3a]' : 'bg-[#1a1a2e]',
                )}>
                  {complete ? '⭐' : unlocked ? skill.emoji : '🔒'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-[14px] font-bold truncate',
                    complete ? 'text-white/40' : 'text-white',
                  )}>
                    {skill.title}
                  </p>
                  <p className="text-[12px] text-white/30">
                    {complete
                      ? t.mastered
                      : unlocked && prog > 0
                      ? `${prog}% — ${lessonCountMap[skill.id] ?? 0} lessons`
                      : `${lessonCountMap[skill.id] ?? 0} lessons · +${skill.xp_reward} XP`}
                  </p>
                </div>

                {/* Right indicator */}
                {complete && (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {!complete && unlocked && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M6 3l5 5-5 5" stroke={isCurrent ? '#7F77DD' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}