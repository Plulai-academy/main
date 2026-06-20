'use client'
// components/dashboard/SkillsClient.tsx
import { useMemo, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { setCurrentTrack } from '@/app/dashboard/skills/actions'

const UI: Record<string, Record<string, string>> = {
  en: {
    continueBtn: 'Continue',
    startBtn:    'Start',
    lessonOf:    'Lesson',
    of:          'of',
    locked:      'Locked lesson',
    completed:   'Completed lesson',
    current:     'Current lesson, tap to start',
    allDone:     'Track complete',
    allDoneSub:  "You've mastered every skill here.",
    switching:   'Loading…',
  },
  ar: {
    continueBtn: 'واصل',
    startBtn:    'ابدأ',
    lessonOf:    'الدرس',
    of:          'من',
    locked:      'درس مقفل',
    completed:   'درس مكتمل',
    current:     'الدرس الحالي، اضغط للبدء',
    allDone:     'المسار مكتمل',
    allDoneSub:  'أتقنت كل المهارات هنا.',
    switching:   'جارٍ التحميل…',
  },
  fr: {
    continueBtn: 'Continuer',
    startBtn:    'Commencer',
    lessonOf:    'Leçon',
    of:          'sur',
    locked:      'Leçon verrouillée',
    completed:   'Leçon terminée',
    current:     'Leçon actuelle, appuie pour commencer',
    allDone:     'Piste terminée',
    allDoneSub:  'Tu as maîtrisé toutes les compétences ici.',
    switching:   'Chargement…',
  },
}

// ── Icon placeholders ───────────────────────────────────────────────
// Drop your real files in public/icons using these exact names (or
// update the paths below) and they'll show up automatically — no
// other code changes needed.
const ICONS = {
  streak: '/icons/streak.png',
  gems:   '/icons/gem.png',
}

interface Track     { id: string; name: string; emoji: string; color: string }
interface Skill      { id: string; track_id: string; title: string; emoji: string; description: string; xp_reward: number; sort_order: number; required_nodes: string[] }
interface SkillProg { skill_node_id: string; progress_pct: number; completed_at: string | null }

interface Props {
  userId:                          string
  tracks:                          Track[]
  initialTrackId:                  string | null
  skills:                          Skill[]
  skillProgress:                   SkillProg[]
  lessonCountMap:                  Record<string, number>
  language:                        string
  streak:                          number
  gems:                            number
  initialCurrentSkillId:           string | null
  initialFirstIncompleteLessonId:  string | null
}

const OFFSET_PATTERN = [0, -1, 1, 0]

// Caps the zig-zag offset to a viewport-relative value so it never pushes
// the path wider than the screen on small phones, while still reaching the
// full 54px swing on larger viewports.
function offsetTransform(offset: number) {
  if (offset === 0) return undefined
  return `translateX(calc(${offset} * min(14vw, 54px)))`
}

export default function SkillsClient({
  userId, tracks, initialTrackId, skills, skillProgress, lessonCountMap,
  language, streak, gems, initialCurrentSkillId, initialFirstIncompleteLessonId,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as 'en' | 'ar' | 'fr'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [activeTrackId, setActiveTrackId] = useState(initialTrackId)
  const [currentSkillId, setCurrentSkillId] = useState(initialCurrentSkillId)
  const [firstIncompleteLessonId, setFirstIncompleteLessonId] = useState(initialFirstIncompleteLessonId)
  const [showPicker, setShowPicker] = useState(false)
  const [switching, setSwitching] = useState(false)

  const currentNodeRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  const progressMap = useMemo(
    () => Object.fromEntries(skillProgress.map(p => [p.skill_node_id, p.progress_pct])),
    [skillProgress],
  )

  const orderedSkills = useMemo(
    () => skills
      .filter(s => s.track_id === activeTrackId)
      .sort((a, b) => a.sort_order - b.sort_order),
    [skills, activeTrackId],
  )

  const isUnlocked = (skill: Skill) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every(r => (progressMap[r] ?? 0) >= 100)

  const isComplete = (id: string) => (progressMap[id] ?? 0) >= 100

  const activeTrack = tracks.find(tr => tr.id === activeTrackId) ?? null
  const currentSkill = orderedSkills.find(s => s.id === currentSkillId) ?? null
  const allDone = orderedSkills.length > 0 && orderedSkills.every(s => isComplete(s.id))

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  useEffect(() => {
    currentNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeTrackId])

  const handleTrackSelect = async (trackId: string) => {
    if (trackId === activeTrackId) { setShowPicker(false); return }
    setShowPicker(false)
    setSwitching(true)
    setActiveTrackId(trackId)

    // Persist selection (fire and forget, UI doesn't wait on this)
    setCurrentTrack(trackId).catch(() => {})

    // Resolve the current skill + lesson for the new track
    try {
      const res = await fetch('/api/skills/resolve-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })
      const data = await res.json()
      setCurrentSkillId(data.skillId ?? null)
      setFirstIncompleteLessonId(data.lessonId ?? null)
    } catch {
      // fall back to client-side guess if the request fails
      const trackSkills = skills
        .filter(s => s.track_id === trackId)
        .sort((a, b) => a.sort_order - b.sort_order)
      const fallback = trackSkills.find(s => isUnlocked(s) && !isComplete(s.id)) ?? trackSkills[0] ?? null
      setCurrentSkillId(fallback?.id ?? null)
      setFirstIncompleteLessonId(null)
    } finally {
      setSwitching(false)
    }
  }

  const goToCurrentLesson = () => {
    if (!currentSkill) return
    if (firstIncompleteLessonId) {
      router.push(`/dashboard/skills/${currentSkill.id}/lesson/${firstIncompleteLessonId}`)
    } else {
      router.push(`/dashboard/skills/${currentSkill.id}`)
    }
  }

  const handleNodeTap = (skill: Skill, unlocked: boolean) => {
    if (!unlocked) return
    if (skill.id === currentSkillId) {
      goToCurrentLesson()
    } else {
      router.push(`/dashboard/skills/${skill.id}`)
    }
  }

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[#131F24] flex flex-col max-w-[680px] mx-auto relative"
      dir={dir}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');`}</style>

      {/* ── TOP BAR ── */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3.5 bg-[#131F24] border-b border-[#1F2C31] sm:px-6 sm:py-4 md:px-8"
        style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-[#D33131]/15 to-[#FAA918]/15 ring-1 ring-[#FAA918]/25 rounded-full px-3 py-1.5 sm:px-3.5">
            <img
              src={ICONS.streak}
              alt="Streak"
              width={18}
              height={18}
              className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }}
            />
            <span className="text-[13px] sm:text-[14px] font-extrabold text-[#FAA918]">{streak}</span>
          </div>
          {/* Gems badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-[#1CB0F6]/15 to-[#14D4F4]/15 ring-1 ring-[#1CB0F6]/25 rounded-full px-3 py-1.5 sm:px-3.5">
            <img
              src={ICONS.gems}
              alt="Gems"
              width={18}
              height={18}
              className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }}
            />
            <span className="text-[13px] sm:text-[14px] font-extrabold text-[#1CB0F6]">{gems}</span>
          </div>
        </div>

        {/* Track dropdown trigger */}
        {activeTrack && (
          <div className="relative shrink-0" ref={pickerRef}>
            <button
              onClick={() => setShowPicker(v => !v)}
              className="flex items-center gap-1.5 text-[#F5F5F5]/90 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors max-w-[40vw] sm:max-w-none"
            >
              <span className="text-[15px] sm:text-[16px] shrink-0">{activeTrack.emoji}</span>
              <span className="text-[13px] sm:text-[14px] font-extrabold truncate">{activeTrack.name}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={cn('transition-transform shrink-0', showPicker && 'rotate-180')}>
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showPicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] bg-[#1F2C31] rounded-2xl shadow-xl overflow-hidden z-30 w-[min(220px,calc(100vw-32px))] max-h-[60vh] overflow-y-auto">
                {tracks.map(tr => (
                  <button
                    key={tr.id}
                    onClick={() => handleTrackSelect(tr.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      tr.id === activeTrackId ? 'bg-[#1CB0F6]/12' : 'hover:bg-white/5',
                    )}
                  >
                    <span className="text-[20px] shrink-0">{tr.emoji}</span>
                    <span className="text-[14px] font-extrabold text-[#F5F5F5] flex-1 truncate">{tr.name}</span>
                    {tr.id === activeTrackId && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0"><path d="M3 8l4 4 6-7" stroke="#1CB0F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PATH ── */}
      <div className="flex-1 overflow-y-auto pt-7 pb-32 sm:pt-9 sm:pb-40">
        {switching ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-[14px] font-bold text-[#6F6F6F]">{t.switching}</p>
          </div>
        ) : allDone ? (
          <div className="flex flex-col items-center text-center px-6 sm:px-8 py-16">
            <div className="text-[48px] sm:text-[56px] mb-4">🏆</div>
            <p className="text-[17px] sm:text-[18px] font-extrabold text-[#F5F5F5] mb-2">{t.allDone}</p>
            <p className="text-[13px] sm:text-[14px] text-[#6F6F6F]">{t.allDoneSub}</p>
          </div>
        ) : currentSkill ? (
          <>
            <div className="flex items-center justify-between bg-gradient-to-br from-[#1CB0F6] to-[#14D4F4] rounded-[18px] mx-auto mb-8 px-4 py-3 text-[#F5F5F5] max-w-[420px] w-[calc(100%-32px)] sm:px-5 sm:py-3.5 sm:w-[calc(100%-40px)] sm:max-w-[480px]">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider opacity-85">
                  {t.lessonOf} {currentLessonIdx} {t.of} {currentLessonCount || 1}
                </p>
                <p className="text-[15px] sm:text-[16px] font-extrabold mt-0.5 truncate">{currentSkill.title}</p>
              </div>
              <span className="text-[22px] sm:text-[24px] shrink-0 ml-2">{currentSkill.emoji}</span>
            </div>

            <div className="flex flex-col items-center w-full max-w-[340px] mx-auto px-3">
              {orderedSkills.map((skill, idx) => {
                const unlocked  = isUnlocked(skill)
                const complete  = isComplete(skill.id)
                const isCurrent = skill.id === currentSkillId
                const offset    = OFFSET_PATTERN[idx % OFFSET_PATTERN.length]

                const state = complete ? 'done' : isCurrent ? 'current' : unlocked ? 'done' : 'locked'
                const icon  = complete ? 'check' : isCurrent ? 'target' : unlocked ? 'check' : 'lock'

                const label = !unlocked ? t.locked : complete ? t.completed : isCurrent ? t.current : skill.title

                return (
                  <div key={skill.id} className="relative flex flex-col items-center w-full">
                    <button
                      ref={isCurrent ? currentNodeRef : undefined}
                      onClick={() => handleNodeTap(skill, unlocked)}
                      aria-label={label}
                      disabled={!unlocked}
                      style={{
                        transform: offsetTransform(offset),
                        width: 'clamp(58px, 19vw, 76px)',
                        height: 'clamp(58px, 19vw, 76px)',
                        marginBottom: 'clamp(28px, 8vw, 40px)',
                      }}
                      className={cn(
                        'rounded-full flex items-center justify-center relative flex-shrink-0 transition-transform active:translate-y-[3px]',
                        state === 'done'    && 'bg-[#FAA918] shadow-[0_6px_0_#C2820D]',
                        state === 'current' && 'bg-[#1CB0F6] shadow-[0_6px_0_#2B70C9]',
                        state === 'locked'  && 'bg-[#1F2C31] shadow-none opacity-55 cursor-default',
                      )}
                    >
                      {isCurrent && (
                        <span className="absolute -inset-2 rounded-full border-[3px] border-[#1CB0F6]/30 animate-[ringPulse_1.8s_ease-out_infinite]" />
                      )}
                      {isCurrent && (
                        <span className="absolute -top-[42px] bg-[#F5F5F5] text-[#1CB0F6] text-[11px] sm:text-[12px] font-extrabold px-3.5 sm:px-4 py-[6px] sm:py-[7px] rounded-[11px] whitespace-nowrap uppercase tracking-wider shadow-md">
                          {currentProgressPct > 0 ? t.continueBtn : t.startBtn}
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#F5F5F5]" />
                        </span>
                      )}
                      <span className="relative z-10">
                        {icon === 'check' && (
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="w-[60%] h-[60%]"><path d="M6 14l5 5 11-12" stroke="#F5F5F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                        {icon === 'target' && (
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="w-[60%] h-[60%]"><circle cx="14" cy="14" r="10" stroke="#F5F5F5" strokeWidth="2.5"/><circle cx="14" cy="14" r="5" stroke="#F5F5F5" strokeWidth="2.5"/><circle cx="14" cy="14" r="1.5" fill="#F5F5F5"/></svg>
                        )}
                        {icon === 'lock' && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-[55%] h-[55%]"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#6F6F6F" strokeWidth="2"/><path d="M8 11V7a4 4 0 018 0v4" stroke="#6F6F6F" strokeWidth="2"/></svg>
                        )}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* ── BOTTOM BAR ── */}
      {!switching && !allDone && currentSkill && (
        <div
          className="sticky bottom-0 left-0 right-0 bg-[#131F24] border-t-2 border-[#1F2C31] px-4 sm:px-6 md:px-8 flex flex-col items-center"
          style={{ paddingTop: 16, paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-[420px] sm:max-w-[480px] w-full">
            <button
              onClick={goToCurrentLesson}
              className="w-full bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] text-[#F5F5F5] rounded-2xl py-[16px] sm:py-[17px] md:py-[18px] text-[15px] sm:text-[16px] md:text-[17px] font-extrabold uppercase tracking-wider shadow-[0_4px_0_#2B70C9] transition-transform active:translate-y-1 active:shadow-none"
              style={{ touchAction: 'manipulation' }}
            >
              {currentProgressPct > 0 ? t.continueBtn : t.startBtn}
            </button>
            <p className="text-center text-[11px] sm:text-[12px] font-extrabold text-[#6F6F6F] mt-2.5 truncate">
              {t.lessonOf} {currentLessonIdx} — {currentSkill.title}
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes ringPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }`}</style>
    </div>
  )
}