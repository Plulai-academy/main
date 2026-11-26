'use client'
// components/dashboard/SkillsClient.tsx
//
// REDESIGN v17 — the "Adventure" page, matching the reference mock:
//   Title + track dropdown  →  Gulf of Discovery banner  →  Current lesson
//   card with the "Set Sail" button  →  Completed lessons list with "Review".
//
// UNCHANGED: every prop, track switching (setCurrentTrack + /api/path/resolve-track
// with its fallback), the current-lesson / first-incomplete-lesson routing,
// unlock + completion rules, click-outside for the picker, the "world
// complete" state, and the three languages (new text keys were only ADDED).
//
// REMOVED on purpose (the mock doesn't have them): the island map, the pearl
// necklace and the rank card. Streak/level now live on the dashboard home.
//
// ASSETS: all PNGs are read from ICON_BASE (default /public/icons/):
//   gulf-of-discovery.png, adventure-python.png, adventure-sailboat.png,
//   adventure-ship-wheel.png, adventure-completed.png,
//   adventure-review-chevron.png, adventure-dropdown-chevron.png
// Change ICON_BASE if you keep them elsewhere. The Python icon is shown for
// tracks whose name contains "python"; other tracks fall back to their emoji.
//
// FONT: this page keeps the Baloo 2 / Baloo Bhaijaan 2 pairing it already had.

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { setCurrentTrack } from '@/app/dashboard/path/actions'

const ICON_BASE = '/icons'
const ic = (file: string) => `${ICON_BASE}/${file}`

const UI: Record<string, Record<string, string>> = {
  en: {
    play: 'Set Sail', lessonOf: 'Lesson', of: 'of', missions: 'pearls', unit: 'Voyage',
    locked: 'Locked', completed: 'Conquered', current: 'current stop', now: "You're here",
    allDone: 'World complete!', allDoneSub: "You've charted every island here.",
    switching: 'Charting course…',
    hello: 'Ahlan', subtitle: "Let's continue your voyage.",
    streak: 'day streak', level: 'Rank', totalXp: 'total pearls',
    worldName: 'Gulf of Discovery',
    // added in v17
    adventure: 'Adventure', currentLesson: 'Current lesson', completedLessons: 'Completed lessons',
    review: 'Review', noneYet: 'Finish your first lesson and it will show up here.',
    switchTrack: 'Switch track',
  },
  ar: {
    play: 'أبحر', lessonOf: 'الدرس', of: 'من', missions: 'لؤلؤة', unit: 'رحلة',
    locked: 'مقفل', completed: 'مُنجزة', current: 'موقعك', now: 'أنت هنا',
    allDone: 'أنهيت هذا العالم! 🏆', allDoneSub: 'اكتشفت كل جزيرة هنا.',
    switching: 'نرسم المسار…',
    hello: 'أهلاً', subtitle: 'يلا نكمل رحلتنا في الخليج!',
    streak: 'أيام متتالية', level: 'الرتبة', totalXp: 'مجموع اللآلئ',
    worldName: 'خليج الاكتشاف',
    adventure: 'المغامرة', currentLesson: 'الدرس الحالي', completedLessons: 'الدروس المكتملة',
    review: 'مراجعة', noneYet: 'أنهِ أول درس وسيظهر هنا.',
    switchTrack: 'تغيير المسار',
  },
  fr: {
    play: 'Embarquer', lessonOf: 'Leçon', of: 'sur', missions: 'perles', unit: 'Voyage',
    locked: 'Verrouillé', completed: 'Conquise', current: 'position actuelle', now: 'Tu es ici',
    allDone: 'Monde terminé !', allDoneSub: 'Tu as exploré chaque île ici.',
    switching: 'Traçage de la route…',
    hello: 'Ahlan', subtitle: 'Continuons ton voyage dans le Golfe.',
    streak: 'jours de suite', level: 'Rang', totalXp: 'perles au total',
    worldName: 'Golfe de la Découverte',
    adventure: 'Aventure', currentLesson: 'Leçon en cours', completedLessons: 'Leçons terminées',
    review: 'Revoir', noneYet: 'Termine ta première leçon et elle apparaîtra ici.',
    switchTrack: 'Changer de parcours',
  },
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
  userName?: string
  characterImageUrl?: string
  mascotName?: string
  userTotalXp?: number
  heroBackgroundImageUrl?: string
  unitTitles?: string[]
}

function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*[—-]\s*/i, '').trim() || title
}

const CARD = 'rounded-[28px] bg-[#FFFCF7] shadow-[0_4px_20px_rgba(11,59,68,0.07)] ring-1 ring-[#F0E7DA]'

export default function SkillsClient({
  tracks = [], initialTrackId, skills = [], skillProgress = [], lessonCountMap = {},
  language, initialCurrentSkillId, initialFirstIncompleteLessonId,
}: Props) {
  const router = useRouter()
  const lang = (language || 'en') as 'en' | 'ar' | 'fr'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'
  const fontFamily = lang === 'ar' ? "'Baloo Bhaijaan 2', sans-serif" : "'Baloo 2', sans-serif"

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
  const completedSkills = orderedSkills.filter(s => isComplete(s.id))

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

  const reviewSkill = (skill: Skill) => router.push(`/dashboard/path/${skill.id}`)

  const currentLessonCount = currentSkill ? (lessonCountMap[currentSkill.id] ?? 0) : 0
  const currentProgressPct = currentSkill ? (progressMap[currentSkill.id] ?? 0) : 0
  const currentLessonIdx = currentLessonCount > 0
    ? Math.min(Math.round((currentProgressPct / 100) * currentLessonCount) + 1, currentLessonCount)
    : 1

  // Python icon for Python tracks, emoji for everything else
  const TrackIcon = ({ track, size }: { track: Track; size: number }) =>
    /python/i.test(track.name)
      ? <Image src={ic('adventure-python.png')} alt="" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} />
      : <span className="shrink-0 text-center" style={{ fontSize: size * 0.8, width: size, lineHeight: 1 }}>{track.emoji}</span>

  const Chevron = ({ open }: { open?: boolean }) => (
    <Image
      src={ic('adventure-dropdown-chevron.png')}
      alt="" width={22} height={22}
      className={`h-[18px] w-[18px] shrink-0 object-contain transition-transform sm:h-[22px] sm:w-[22px] ${open ? 'rotate-180' : ''}`}
    />
  )

  return (
    <div dir={dir} className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#FBF5EC] text-[#0B3B44]" style={{ fontFamily }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Baloo+Bhaijaan+2:wght@500;600;700;800&display=swap');
      ` }} />

      <div className="mx-auto max-w-6xl px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-10 lg:pb-10 lg:pt-8">

        {/* ── Title + track dropdown ───────────────────────── */}
        <header className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <h1 className="text-[32px] font-extrabold leading-tight sm:text-[52px]">{t.adventure}</h1>

          {activeTrack && (
            <div className="relative min-w-0" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowPicker(v => !v)}
                aria-label={t.switchTrack}
                aria-haspopup="listbox"
                aria-expanded={showPicker}
                className="flex max-w-full items-center gap-2.5 rounded-full bg-[#FFFCF7] py-2 pe-4 ps-3 shadow-[0_4px_16px_rgba(11,59,68,0.1)] ring-1 ring-[#F0E7DA] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] sm:gap-3 sm:py-3 sm:pe-6 sm:ps-4"
              >
                <TrackIcon track={activeTrack} size={30} />
                <span className="truncate text-[15px] font-extrabold sm:text-[22px]">{activeTrack.name}</span>
                <Chevron open={showPicker} />
              </button>

              {showPicker && (
                <div
                  role="listbox"
                  className="absolute end-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl bg-[#FFFCF7] shadow-[0_16px_40px_rgba(11,59,68,0.18)] ring-1 ring-[#F0E7DA]"
                >
                  {tracks.map(tr => (
                    <button
                      key={tr.id}
                      type="button"
                      role="option"
                      aria-selected={tr.id === activeTrackId}
                      onClick={() => handleTrackSelect(tr.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-[#F6EFE3] ${tr.id === activeTrackId ? 'bg-[#F6EFE3]' : ''}`}
                    >
                      <TrackIcon track={tr} size={28} />
                      <span className="flex-1 truncate text-[16px] font-bold">{tr.name}</span>
                      {tr.id === activeTrackId && <span className="h-2 w-2 shrink-0 rounded-full bg-[#14B8A6]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {/* ── Gulf of Discovery banner ─────────────────────── */}
        <section className="relative overflow-hidden rounded-[26px] shadow-[0_10px_30px_rgba(11,59,68,0.18)] sm:rounded-[32px]">
          <div className="relative aspect-[16/8] sm:aspect-[1396/375]">
            <Image
              src={ic('gulf-of-discovery.png')}
              alt=""
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1100px"
              className="object-cover"
            />
          </div>
          <span className="absolute start-3 top-3 rounded-full bg-[#0B3B44] px-4 py-2 text-[17px] font-extrabold text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)] sm:start-8 sm:top-5 sm:px-8 sm:py-3.5 sm:text-[34px]">
            {t.worldName}
          </span>
        </section>

        {/* ── Current lesson ───────────────────────────────── */}
        {switching ? (
          <section className={`${CARD} mt-5 flex items-center justify-center py-14`}>
            <p className="text-lg font-bold text-[#5E7F83]">{t.switching}</p>
          </section>
        ) : allDone ? (
          <section className={`${CARD} mt-5 px-6 py-10 text-center`}>
            <p className="mb-2 text-5xl">🏆</p>
            <p className="text-2xl font-extrabold sm:text-3xl">{t.allDone}</p>
            <p className="mt-1 text-[16px] font-semibold text-[#5E7F83]">{t.allDoneSub}</p>
          </section>
        ) : currentSkill ? (
          <section className={`${CARD} mt-5 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-7`}>
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              <Image
                src={ic('adventure-sailboat.png')}
                alt=""
                width={96}
                height={96}
                className="h-14 w-14 shrink-0 object-contain sm:h-20 sm:w-20"
              />
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#0B6B63] sm:text-[20px]">{t.currentLesson}</p>
                <h2 className="text-[24px] font-extrabold leading-tight sm:text-[40px]">{cleanTitle(currentSkill.title)}</h2>
                {currentLessonCount > 0 && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="whitespace-nowrap text-[13px] font-bold text-[#6F8E8B] sm:text-[14px]">
                      {t.lessonOf} {currentLessonIdx} {t.of} {currentLessonCount}
                    </span>
                    <div
                      className="h-2.5 w-24 overflow-hidden rounded-full bg-[#D3EDE8] sm:w-40"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(currentProgressPct)}
                    >
                      <div className="h-full rounded-full bg-[#14B8A6] transition-all duration-700" style={{ width: `${Math.min(100, Math.round(currentProgressPct))}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goToCurrentLesson}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#FF7A5C] to-[#F4533A] px-9 text-[22px] font-extrabold text-white shadow-[0_12px_28px_rgba(244,83,58,0.4)] transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4533A]/60 focus-visible:ring-offset-2 sm:h-[76px] sm:w-auto sm:min-w-[300px] sm:text-[32px]"
            >
              <Image src={ic('adventure-ship-wheel.png')} alt="" width={48} height={48} className="h-8 w-8 shrink-0 object-contain sm:h-11 sm:w-11" />
              {t.play}
            </button>
          </section>
        ) : null}

        {/* ── Completed lessons ────────────────────────────── */}
        {!switching && (
          <section className={`${CARD} mt-5 px-5 pb-3 pt-6 sm:px-8 sm:pt-7`} aria-labelledby="completed-title">
            <h2 id="completed-title" className="text-[24px] font-extrabold sm:text-[34px]">{t.completedLessons}</h2>

            {completedSkills.length > 0 ? (
              <ul className="mt-2">
                {completedSkills.map((s, i) => (
                  <li key={s.id} className={i > 0 ? 'border-t border-[#E6EEEA]' : ''}>
                    <button
                      type="button"
                      onClick={() => reviewSkill(s)}
                      className="group flex w-full items-center gap-4 rounded-xl py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60 sm:gap-5 sm:py-5"
                    >
                      <Image src={ic('adventure-completed.png')} alt="" width={44} height={44} className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" />
                      <span className="min-w-0 flex-1 truncate text-[18px] font-bold sm:text-[26px]">{cleanTitle(s.title)}</span>
                      <span className="flex shrink-0 items-center gap-2 text-[16px] font-extrabold sm:text-[22px]">
                        {t.review}
                        <Image
                          src={ic('adventure-review-chevron.png')}
                          alt="" width={24} height={24}
                          className="h-5 w-5 object-contain transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 sm:h-6 sm:w-6"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pb-4 pt-2 text-[16px] font-medium text-[#6F8E8B]">{t.noneYet}</p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}