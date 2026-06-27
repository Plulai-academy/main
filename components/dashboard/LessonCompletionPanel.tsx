'use client'
// components/dashboard/LessonCompletionPanel.tsx

import React, { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Icon helper ──────────────────────────────────────────────
// Renders a custom icon from /icons/*.png, falling back to the original
// emoji if the file isn't there yet (so nothing looks broken before you
// upload your own set — it just upgrades automatically once you do).
function Icon({
  src, fallback, className = 'w-5 h-5',
}: {
  src: string
  fallback: string
  className?: string
}) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <span className={cn(className, 'inline-flex items-center justify-center leading-none')} aria-hidden>
        {fallback}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn(className, 'object-contain inline-block')}
      onError={() => setError(true)}
    />
  )
}

// ── i18n ─────────────────────────────────────────────────────
const T = {
  en: {
    congrats:        'Lesson complete!',
    xpEarned:        'XP earned',
    streakLine:      (n: number) => `${n}-day streak — keep it going!`,
    submitHeading:   'Save your work (optional)',
    submitSubline:   'Paste a link to your project, code, or demo. Saved to your portfolio.',
    submitUrl:       'Project link (GitHub, Replit, Glitch…)',
    submitVideo:     'Demo video (Loom, YouTube…)',
    submitPlaceholder: 'https://…',
    submitBtn:       'Save to portfolio',
    submitSaving:    'Saving…',
    submitDone:      'Saved to your portfolio!',
    submitError:     'Could not save — check your connection.',
    invalidUrl:      'Paste a full URL starting with https://',
    nextLesson:      'Next lesson',
    nextSkill:       'Next skill',
    backToSkill:     'Back to lessons',
    finishedSkill:   "You've finished this track!",
    finishedAll:     "You've completed everything available!",
    suggestNext:     "What's next for you:",
    askCoach:        'Ask Jimmy what to build next',
    buildProject:    'Build your capstone project',
    shareProgress:   'Share your progress',
    viewPortfolio:   'View my portfolio',
    coachPromptFinished: "I just finished all available lessons on Plulai. What should I build or learn next based on my interests?",
    exploreTracks:   'Explore more tracks',
  },
  ar: {
    congrats:        'اكتمل الدرس!',
    xpEarned:        'XP مكتسب',
    streakLine:      (n: number) => `${n} أيام متتالية — واصل!`,
    submitHeading:   'احفظ عملك (اختياري)',
    submitSubline:   'الصق رابط مشروعك أو الكود أو الفيديو. يُحفظ في محفظتك.',
    submitUrl:       'رابط المشروع (GitHub، Replit…)',
    submitVideo:     'فيديو تجريبي (Loom، YouTube…)',
    submitPlaceholder: 'https://…',
    submitBtn:       'حفظ في المحفظة',
    submitSaving:    'جاري الحفظ…',
    submitDone:      'تم الحفظ في محفظتك!',
    submitError:     'تعذر الحفظ — تحقق من الاتصال.',
    invalidUrl:      'الصق رابطاً كاملاً يبدأ بـ https://',
    nextLesson:      'الدرس التالي',
    nextSkill:       'المهارة التالية',
    backToSkill:     'العودة إلى الدروس',
    finishedSkill:   'أكملت هذا المسار!',
    finishedAll:     'أكملت كل المحتوى المتاح!',
    suggestNext:     'ماذا بعد:',
    askCoach:        'اسأل جيمي ماذا تبني بعد',
    buildProject:    'ابنِ مشروعك الختامي',
    shareProgress:   'شارك تقدمك',
    viewPortfolio:   'عرض محفظتي',
    coachPromptFinished: 'أكملت جميع الدروس المتاحة على Plulai. ماذا أبني أو أتعلم بعد بناءً على اهتماماتي؟',
    exploreTracks:   'استكشف المزيد من المسارات',
  },
  fr: {
    congrats:        'Leçon terminée !',
    xpEarned:        'XP gagnés',
    streakLine:      (n: number) => `${n} jours de suite — continue !`,
    submitHeading:   'Sauvegarde ton travail (optionnel)',
    submitSubline:   'Colle un lien vers ton projet, code ou démo. Sauvegardé dans ton portfolio.',
    submitUrl:       'Lien projet (GitHub, Replit…)',
    submitVideo:     'Vidéo démo (Loom, YouTube…)',
    submitPlaceholder: 'https://…',
    submitBtn:       'Sauvegarder dans le portfolio',
    submitSaving:    'Enregistrement…',
    submitDone:      'Sauvegardé dans ton portfolio !',
    submitError:     'Impossible de sauvegarder — vérifie ta connexion.',
    invalidUrl:      'Colle une URL complète commençant par https://',
    nextLesson:      'Leçon suivante',
    nextSkill:       'Compétence suivante',
    backToSkill:     'Retour aux leçons',
    finishedSkill:   'Tu as terminé cette piste !',
    finishedAll:     "Tu as tout complété !",
    suggestNext:     'La suite pour toi :',
    askCoach:        'Demander à Jimmy quoi construire',
    buildProject:    'Construis ton projet final',
    shareProgress:   'Partage ta progression',
    viewPortfolio:   'Voir mon portfolio',
    coachPromptFinished: "Je viens de terminer toutes les leçons disponibles sur Plulai. Que devrais-je construire ou apprendre ensuite selon mes intérêts ?",
    exploreTracks:   'Explorer plus de pistes',
  },
}

// ── Types ─────────────────────────────────────────────────────
interface NextLesson {
  id: string
  title: string
  emoji: string
  xp_reward: number
  duration_mins: number
}

// The next skill in the track, when the skill the user just finished has no
// further lessons of its own (skills are 1:1 with lessons in this app).
// `lessonId` is usually the same id as the skill itself (e.g. "mp-m1-s4"),
// but kept separate in case that ever changes.
interface NextSkill {
  id: string
  lessonId: string
  title: string
  emoji: string
}

interface SuggestedTrack {
  id: string
  name: string
  emoji: string
  description: string
}

interface Props {
  userId:             string
  lessonId:           string
  lessonTitle:        string
  lessonEmoji:        string
  xpEarned:           number
  streak:             number
  skillId:            string
  skillTitle:         string
  nextLesson:         NextLesson | null
  nextSkill?:         NextSkill | null
  suggestedTracks?:   SuggestedTrack[]
  lang:               'en' | 'ar' | 'fr'
  alreadySubmitted?:  boolean
  finishedAllTracks?: boolean
}

// ── URL validator ─────────────────────────────────────────────
const isValidUrl = (val: string) => {
  try { return Boolean(new URL(val)) } catch { return false }
}

// ── Submission mini-form ──────────────────────────────────────
function SubmissionForm({
  userId, lessonId, lang, alreadySubmitted,
}: {
  userId: string; lessonId: string; lang: 'en'|'ar'|'fr'; alreadySubmitted?: boolean
}) {
  const t = T[lang]
  const [projectUrl, setProjectUrl] = useState('')
  const [videoUrl,   setVideoUrl]   = useState('')
  const [status, setStatus]         = useState<'idle'|'saving'|'done'|'error'>(
    alreadySubmitted ? 'done' : 'idle'
  )
  const [urlError,   setUrlError]   = useState('')
  const [videoError, setVideoError] = useState('')

  const save = async () => {
    let valid = true
    if (projectUrl && !isValidUrl(projectUrl)) { setUrlError(t.invalidUrl);   valid = false }
    if (videoUrl   && !isValidUrl(videoUrl))   { setVideoError(t.invalidUrl); valid = false }
    if (!projectUrl && !videoUrl) return
    if (!valid) return

    setStatus('saving')
    try {
      const res = await fetch('/api/submissions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          lessonId,
          projectUrl: projectUrl || null,
          videoUrl:   videoUrl   || null,
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') return (
    <div className="flex items-center gap-3 px-4 py-3 bg-accent3/10 border border-accent3/25 rounded-2xl">
      <Icon src="/icons/check.png" fallback="✅" className="w-6 h-6 flex-shrink-0" />
      <div>
        <p className="text-sm font-extrabold text-accent3">{t.submitDone}</p>
        <div className="flex gap-3 mt-1">
          {projectUrl && (
            <a href={projectUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-accent5 hover:text-white transition-colors">
              <Icon src="/icons/link.png" fallback="🔗" className="w-3.5 h-3.5" /> Project ↗
            </a>
          )}
          {videoUrl && (
            <a href={videoUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-accent5 hover:text-white transition-colors">
              <Icon src="/icons/video.png" fallback="🎥" className="w-3.5 h-3.5" /> Video ↗
            </a>
          )}
          <Link href="/dashboard/portfolio"
            className="text-xs font-bold text-accent5 hover:text-white transition-colors">
            {t.viewPortfolio} →
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-extrabold mb-0.5">
          <Icon src="/icons/upload.png" fallback="📤" className="w-4 h-4" />
          {t.submitHeading}
        </p>
        <p className="text-xs text-muted font-semibold">{t.submitSubline}</p>
      </div>

      {/* Project URL */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-muted/70 mb-1.5 uppercase tracking-wider">
          <Icon src="/icons/link.png" fallback="🔗" className="w-3.5 h-3.5" />
          {t.submitUrl}
        </label>
        <input
          type="url"
          value={projectUrl}
          onChange={e => { setProjectUrl(e.target.value); setUrlError('') }}
          placeholder={t.submitPlaceholder}
          className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-accent5/40 transition-all"
        />
        {urlError && <p className="text-xs text-red-400 font-semibold mt-1">{urlError}</p>}
      </div>

      {/* Video URL */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-muted/70 mb-1.5 uppercase tracking-wider">
          <Icon src="/icons/video.png" fallback="🎥" className="w-3.5 h-3.5" />
          {t.submitVideo}
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={e => { setVideoUrl(e.target.value); setVideoError('') }}
          placeholder="https://loom.com/share/…"
          className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-accent5/40 transition-all"
        />
        {videoError && <p className="text-xs text-red-400 font-semibold mt-1">{videoError}</p>}
        <p className="text-xs text-muted/50 font-semibold mt-1.5">
          No video?{' '}
          <a href="https://loom.com" target="_blank" rel="noopener noreferrer"
            className="text-accent5 hover:text-white transition-colors">
            Record 90s on Loom.com ↗
          </a>{' '}
          — free, no install.
        </p>
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {t.submitError}
        </p>
      )}

      <button
        onClick={save}
        disabled={status === 'saving' || (!projectUrl && !videoUrl)}
        className={cn(
          'w-full py-3 rounded-xl font-extrabold text-sm transition-all',
          status === 'saving' || (!projectUrl && !videoUrl)
            ? 'bg-white/5 text-muted/40 cursor-not-allowed'
            : 'bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-lg'
        )}
      >
        {status === 'saving' ? t.submitSaving : t.submitBtn}
      </button>
    </div>
  )
}

// ── What's Next suggestions ───────────────────────────────────
function WhatsNext({
  nextLesson, nextSkill, skillId, skillTitle, suggestedTracks,
  finishedAllTracks, lang, coachUrl,
}: {
  nextLesson:         NextLesson | null
  nextSkill?:         NextSkill | null
  skillId:            string
  skillTitle:         string
  suggestedTracks?:   SuggestedTrack[]
  finishedAllTracks?: boolean
  lang:               'en' | 'ar' | 'fr'
  coachUrl:           string
}) {
  const t   = T[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // ── Case 1: there IS a next lesson in the same skill ─────
  if (nextLesson) return (
    <div className="space-y-2" dir={dir}>
      <p className="text-xs font-extrabold text-muted/60 uppercase tracking-wider">{t.nextLesson}</p>
      <Link
        href={`/dashboard/skills/${skillId}/lesson/${nextLesson.id}`}
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent4/10 to-accent5/10 border-2 border-accent4/30 rounded-2xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent4/10 transition-all group"
      >
        <span className="text-3xl flex-shrink-0">{nextLesson.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm truncate">{nextLesson.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-accent2">+{nextLesson.xp_reward} XP</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted font-semibold">⏱ {nextLesson.duration_mins} min</span>
          </div>
        </div>
        <span className="text-muted group-hover:text-white transition-colors flex-shrink-0">→</span>
      </Link>
    </div>
  )

  // ── Case 2: this skill is done, but the track continues with
  //    another skill (e.g. mp-m1-s3 → mp-m1-s4) — go straight there
  //    instead of showing "explore other tracks". ─────────────
  if (nextSkill) return (
    <div className="space-y-2" dir={dir}>
      <p className="text-xs font-extrabold text-muted/60 uppercase tracking-wider">{t.nextSkill}</p>
      <Link
        href={`/dashboard/skills/${nextSkill.id}/lesson/${nextSkill.lessonId}`}
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent4/10 to-accent5/10 border-2 border-accent4/30 rounded-2xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent4/10 transition-all group"
      >
        <span className="text-3xl flex-shrink-0">{nextSkill.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm truncate">{nextSkill.title}</p>
        </div>
        <span className="text-muted group-hover:text-white transition-colors flex-shrink-0">→</span>
      </Link>
    </div>
  )

  // ── Case 3: finished this skill AND no next skill in the track,
  //    but more tracks are available ────────────────────────
  if (!finishedAllTracks) {
    const tracks = suggestedTracks ?? []

    return (
      <div className="space-y-3" dir={dir}>
        <div className="text-center py-4">
          <Icon src="/icons/confetti.png" fallback="🎉" className="w-10 h-10 mx-auto mb-2" />
          <p className="font-extrabold text-base">{t.finishedSkill}</p>
          <p className="text-sm text-muted font-semibold mt-1">{t.suggestNext}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tracks.map((tr) => (
            <Link
              key={tr.id}
              href={`/dashboard/skills?track=${tr.id}`}
              className="flex items-center gap-3 p-3.5 bg-white/3 border border-white/8 rounded-2xl hover:border-accent5/30 hover:bg-accent5/5 transition-all group"
            >
              <span className="text-2xl flex-shrink-0">{tr.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold truncate">{tr.name}</p>
                <p className="text-xs text-muted font-semibold truncate">{tr.description}</p>
              </div>
              <span className="ml-auto text-muted/40 group-hover:text-accent5 transition-colors flex-shrink-0">→</span>
            </Link>
          ))}

          {/* Fallback if no suggested tracks */}
          {tracks.length === 0 && (
            <Link
              href="/dashboard/skills"
              className="flex items-center gap-3 p-3.5 bg-white/3 border border-white/8 rounded-2xl hover:border-accent5/30 hover:bg-accent5/5 transition-all group col-span-2"
            >
              <Icon src="/icons/rocket.png" fallback="🚀" className="w-6 h-6 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold">{t.exploreTracks}</p>
              </div>
              <span className="ml-auto text-muted/40 group-hover:text-accent5 transition-colors flex-shrink-0">→</span>
            </Link>
          )}
        </div>

        {/* Coach link */}
        <Link
          href={coachUrl}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-extrabold text-sm border-2 border-accent5/30 text-accent5 hover:bg-accent5/10 transition-all"
        >
          <Icon src="/icons/coach.png" fallback="🤖" className="w-4 h-4" />
          {t.askCoach}
        </Link>

        <Link
          href={`/dashboard/skills/${skillId}`}
          className="block text-center text-xs font-bold text-muted hover:text-white transition-colors pt-1"
        >
          {t.backToSkill}
        </Link>
      </div>
    )
  }

  // ── Case 4: truly finished EVERYTHING ─────────────────────
  return (
    <div className="space-y-4" dir={dir}>
      <div className="text-center py-4">
        <Icon src="/icons/trophy.png" fallback="🏆" className="w-14 h-14 mx-auto mb-3" />
        <p className="font-extrabold text-lg">{t.finishedAll}</p>
        <p className="text-sm text-muted font-semibold mt-1">
          {lang === 'ar'
            ? 'أكملت كل ما هو متاح. أنت جاهز لبناء شيء حقيقي.'
            : lang === 'fr'
            ? "Tu as tout terminé. Tu es prêt à construire quelque chose de réel."
            : "You've done everything available. Time to build something real."}
        </p>
      </div>

      <Link
        href={coachUrl}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-xl transition-all"
      >
        <Icon src="/icons/coach.png" fallback="🤖" className="w-5 h-5" />
        {t.askCoach}
      </Link>

      <Link
        href="/dashboard/portfolio"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-extrabold text-sm border border-white/15 text-muted hover:text-white hover:border-white/30 transition-all"
      >
        {t.viewPortfolio}
      </Link>

      <Link
        href={`/dashboard/skills/${skillId}`}
        className="block text-center text-xs font-bold text-muted hover:text-white transition-colors"
      >
        {t.backToSkill}
      </Link>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function LessonCompletionPanel({
  userId, lessonId, lessonTitle, lessonEmoji,
  xpEarned, streak, skillId, skillTitle,
  nextLesson, nextSkill, suggestedTracks, lang,
  alreadySubmitted, finishedAllTracks,
}: Props) {
  const t   = T[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const coachPrompt = finishedAllTracks
    ? T[lang].coachPromptFinished
    : `I just completed "${lessonTitle}" on Plulai. What should I build or try next?`
  const coachUrl = `/dashboard/coach?topic=${encodeURIComponent(skillTitle)}&lesson=${encodeURIComponent(lessonTitle)}&prompt=${encodeURIComponent(coachPrompt)}`

  return (
    <div
      className="bg-card border border-white/8 rounded-3xl overflow-hidden mb-6 animate-slide-up"
      dir={dir}
    >
      {/* ── Celebration header ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-accent3/15 to-accent4/15 border-b border-white/8 px-5 py-5 text-center">
        <div className="text-4xl mb-2">{lessonEmoji}</div>
        <p className="font-fredoka text-xl text-accent3">{t.congrats}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-accent2 bg-accent2/15 border border-accent2/25 px-3 py-1 rounded-full">
            <Icon src="/icons/star1.png" fallback="⭐" className="w-3.5 h-3.5" />
            +{xpEarned} {t.xpEarned}
          </span>
          {streak > 1 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              <Icon src="/icons/streak.png" fallback="🔥" className="w-3.5 h-3.5" />
              {t.streakLine(streak)}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Project submission ──────────────────────────── */}
        <SubmissionForm
          userId={userId}
          lessonId={lessonId}
          lang={lang}
          alreadySubmitted={alreadySubmitted}
        />

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="border-t border-white/6" />

        {/* ── What's next ─────────────────────────────────── */}
        <WhatsNext
          nextLesson={nextLesson}
          nextSkill={nextSkill}
          skillId={skillId}
          skillTitle={skillTitle}
          suggestedTracks={suggestedTracks}
          finishedAllTracks={finishedAllTracks}
          lang={lang}
          coachUrl={coachUrl}
        />
      </div>
    </div>
  )
}