'use client'
// components/dashboard/AssignmentsClient.tsx
//
// REDESIGN — matches the reference mock: title + class name, All / To do /
// Graded tabs, a list of assignments on the left and the selected one on the
// right (grade + feedback for graded work, answer box or lesson link otherwise).
//
// UNCHANGED: props, the Assignment type, both submit paths
// (submitAssignmentResponse for custom answers and for project / video
// links), status values, and router.refresh() after saving.
//
// NEW (all optional / safe):
//  - `language` prop ('en' | 'ar' | 'fr', default 'en'). Without it the page
//    stays English exactly like before.
//  - "To do" = everything that isn't graded yet (including submitted work,
//    because a kid can still update a submission until it's graded).
//  - On phones, tapping an assignment scrolls down to its details.
//
// ASSET: assignment-clipboard.png is read from ICON_BASE (default /public/icons/).
// The grade star is drawn inline, so no extra asset is needed.

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitAssignmentResponse } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

const ICON_BASE = '/icons'

type Assignment = {
  id: string
  sourceType: 'lesson' | 'skill_node' | 'custom'
  title: string
  instructions: string | null
  dueDate: string | null
  assignedBy: string | null
  lessonHref: string | null
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded'
  submissionContent: string
  projectUrl: string
  videoUrl: string
  grade: string | null
  feedback: string | null
}

interface Props {
  userId: string
  className: string | null
  assignments: Assignment[]
  language?: string
}

const UI = {
  en: {
    title: 'Assignments', all: 'All', todo: 'To do', graded: 'Graded',
    status: { not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted', graded: 'Graded' },
    assignedBy: (n: string) => `Assigned by ${n}`, assigned: 'Assigned', due: (d: string) => `Due ${d}`,
    activity: 'Activity', unit: 'Unit', lesson: 'Lesson',
    grade: 'Grade', feedback: 'Feedback',
    answerPlaceholder: 'Type your answer here...', submit: 'Submit', update: 'Update submission', saving: 'Saving...',
    submitWork: 'Submit your work (optional)', projectPh: 'Link to your project (optional)', videoPh: 'Link to a video (optional)',
    reviewLesson: 'Review lesson', startLesson: 'Start lesson', continueLesson: 'Continue lesson',
    noClassTitle: 'No assignments yet', noClassSub: 'Assignments show up here once you join a class with a class code.',
    clearTitle: 'All clear', clearSub: 'Nothing assigned yet — check back soon.',
    emptyTab: 'Nothing here right now.', pick: 'Pick an assignment to see its details.',
  },
  ar: {
    title: 'المهام', all: 'الكل', todo: 'للإنجاز', graded: 'مُقيَّمة',
    status: { not_started: 'لم تبدأ', in_progress: 'قيد التنفيذ', submitted: 'تم التسليم', graded: 'مُقيَّمة' },
    assignedBy: (n: string) => `من ${n}`, assigned: 'مُكلَّف بها', due: (d: string) => `التسليم ${d}`,
    activity: 'نشاط', unit: 'وحدة', lesson: 'درس',
    grade: 'الدرجة', feedback: 'الملاحظات',
    answerPlaceholder: 'اكتب إجابتك هنا...', submit: 'تسليم', update: 'تحديث التسليم', saving: 'جارٍ الحفظ...',
    submitWork: 'سلّم عملك (اختياري)', projectPh: 'رابط مشروعك (اختياري)', videoPh: 'رابط فيديو (اختياري)',
    reviewLesson: 'مراجعة الدرس', startLesson: 'ابدأ الدرس', continueLesson: 'تابع الدرس',
    noClassTitle: 'لا توجد مهام بعد', noClassSub: 'تظهر المهام هنا بعد انضمامك إلى صف برمز الصف.',
    clearTitle: 'كل شيء جاهز', clearSub: 'لا توجد مهام بعد — عُد قريبًا.',
    emptyTab: 'لا شيء هنا الآن.', pick: 'اختر مهمة لعرض تفاصيلها.',
  },
  fr: {
    title: 'Devoirs', all: 'Tous', todo: 'À faire', graded: 'Notés',
    status: { not_started: 'Pas commencé', in_progress: 'En cours', submitted: 'Rendu', graded: 'Noté' },
    assignedBy: (n: string) => `Donné par ${n}`, assigned: 'Assigné', due: (d: string) => `Pour le ${d}`,
    activity: 'Activité', unit: 'Unité', lesson: 'Leçon',
    grade: 'Note', feedback: 'Commentaire',
    answerPlaceholder: 'Écris ta réponse ici...', submit: 'Rendre', update: 'Mettre à jour', saving: 'Enregistrement...',
    submitWork: 'Rends ton travail (facultatif)', projectPh: 'Lien vers ton projet (facultatif)', videoPh: 'Lien vers une vidéo (facultatif)',
    reviewLesson: 'Revoir la leçon', startLesson: 'Commencer la leçon', continueLesson: 'Continuer la leçon',
    noClassTitle: 'Pas encore de devoirs', noClassSub: 'Les devoirs apparaissent ici une fois que tu rejoins une classe avec un code.',
    clearTitle: 'Tout est calme', clearSub: 'Rien à faire pour l\'instant — reviens bientôt.',
    emptyTab: 'Rien ici pour le moment.', pick: 'Choisis un devoir pour voir les détails.',
  },
}
type Copy = typeof UI.en

const STATUS_STYLE: Record<Assignment['status'], { bg: string; text: string }> = {
  not_started: { bg: '#F1EFE9', text: '#7C8C89' },
  in_progress: { bg: '#FDECD8', text: '#C9741C' },
  submitted:   { bg: '#DDF3E8', text: '#1F8A58' },
  graded:      { bg: '#C9F5EE', text: '#0B6B63' },
}

const CARD = 'rounded-[28px] bg-[#FFFCF7] shadow-[0_4px_20px_rgba(11,59,68,0.07)] ring-1 ring-[#F0E7DA]'
const FIELD = 'w-full rounded-2xl border-2 border-[#E6DFD1] bg-white px-4 py-3 text-[15px] font-medium text-[#0B3B44] outline-none transition-all placeholder:text-[#9DB0AC] focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/15'
const PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#FF7A5C] to-[#F4533A] px-7 py-3.5 text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgba(244,83,58,0.35)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4533A]/60 focus-visible:ring-offset-2'

function formatDue(dateStr: string | null, lang: string) {
  if (!dateStr) return null
  const loc = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr-FR' : 'en-US'
  return new Date(dateStr).toLocaleDateString(loc, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function Clipboard({ size }: { size: number }) {
  return (
    <Image
      src={`${ICON_BASE}/assignment-clipboard.png`}
      alt="" width={size} height={size}
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  )
}

function Star() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0 sm:h-16 sm:w-16" aria-hidden>
      <path d="M30 8l5.6 12.2 13.3 1.5-9.9 9 2.8 13.1L30 37.2 18.2 43.8 21 30.7l-9.9-9 13.3-1.5z" fill="#FFC21A" stroke="#F5A300" strokeWidth={2} strokeLinejoin="round" />
      <path d="M48 8l-3 6M54 16l-6 2M52 26l-6-1" stroke="#FFC21A" strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  )
}

function GradeCard({ a, t }: { a: Assignment; t: Copy }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#DDF6EF] to-[#EAFBF6] p-6 ring-1 ring-[#CDEFE6] sm:p-8">
      <p className="text-[18px] font-extrabold text-[#0B6B63] sm:text-[22px]">{t.grade}</p>
      <div className="mt-1 flex items-center gap-3">
        <span className="text-[56px] font-extrabold leading-none tracking-tight text-[#0B3B44] sm:text-[84px]">{a.grade}</span>
        <Star />
      </div>
      {a.feedback && (
        <div className="mt-5">
          <p className="text-[18px] font-extrabold text-[#0B6B63] sm:text-[22px]">{t.feedback}</p>
          <p className="mt-1 text-[18px] font-medium leading-snug text-[#0B3B44] sm:text-[26px]">{a.feedback}</p>
        </div>
      )}
    </div>
  )
}

function SubmissionBox({ userId, assignment, t }: { userId: string; assignment: Assignment; t: Copy }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [projectUrl, setProjectUrl] = useState(assignment.projectUrl)
  const [videoUrl, setVideoUrl] = useState(assignment.videoUrl)
  const [saving, setSaving] = useState(false)

  const hasSubmission = assignment.projectUrl || assignment.videoUrl

  const handleSubmit = () => {
    if (!projectUrl.trim() && !videoUrl.trim()) return
    setSaving(true)
    startTransition(async () => {
      await submitAssignmentResponse(assignment.id, userId, assignment.submissionContent, projectUrl, videoUrl)
      setSaving(false)
      router.refresh()
    })
  }

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs font-extrabold uppercase tracking-wider text-[#6F8E8B]">{t.submitWork}</p>
      <input
        value={projectUrl}
        onChange={(e) => setProjectUrl(e.target.value)}
        placeholder={t.projectPh}
        inputMode="url"
        className={FIELD}
      />
      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder={t.videoPh}
        inputMode="url"
        className={FIELD}
      />
      <button
        onClick={handleSubmit}
        disabled={saving || (!projectUrl.trim() && !videoUrl.trim())}
        className={cn(PRIMARY, 'w-full sm:w-auto')}
      >
        {saving ? t.saving : hasSubmission ? t.update : t.submit}
      </button>
    </div>
  )
}

function AssignmentDetail({ userId, assignment, t, lang }: { userId: string; assignment: Assignment; t: Copy; lang: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [draft, setDraft] = useState(assignment.submissionContent)
  const [saving, setSaving] = useState(false)

  const dueLabel = formatDue(assignment.dueDate, lang)
  const isGraded = assignment.status === 'graded'

  const handleSubmit = () => {
    if (!draft.trim()) return
    setSaving(true)
    startTransition(async () => {
      await submitAssignmentResponse(assignment.id, userId, draft.trim())
      setSaving(false)
      router.refresh()
    })
  }

  const sourceLabel = assignment.sourceType === 'custom' ? t.activity : assignment.sourceType === 'skill_node' ? t.unit : t.lesson

  return (
    <div className={cn(CARD, 'p-5 sm:p-8')}>
      <span className="inline-block rounded-full bg-[#DDF6EF] px-3 py-1 font-mono text-[11px] font-bold uppercase text-[#0B6B63]">{sourceLabel}</span>
      <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-[#0B3B44] sm:text-[42px]">{assignment.title}</h2>
      <p className="mt-1 text-[14px] font-semibold text-[#6F8E8B]">
        {assignment.assignedBy ? t.assignedBy(assignment.assignedBy) : t.assigned}
        {dueLabel ? ` · ${t.due(dueLabel)}` : ''}
      </p>
      {assignment.instructions && (
        <p className="mt-3 text-[16px] font-medium leading-relaxed text-[#4F7276] sm:text-[19px]">{assignment.instructions}</p>
      )}

      <div className="mt-6">
        {assignment.sourceType === 'custom' ? (
          isGraded ? (
            <GradeCard a={assignment} t={t} />
          ) : (
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.answerPlaceholder}
                rows={5}
                className={cn(FIELD, 'resize-none')}
              />
              <button onClick={handleSubmit} disabled={saving || !draft.trim()} className={cn(PRIMARY, 'w-full sm:w-auto')}>
                {saving ? t.saving : assignment.status === 'submitted' ? t.update : t.submit}
              </button>
            </div>
          )
        ) : (
          <>
            {isGraded && <div className="mb-5"><GradeCard a={assignment} t={t} /></div>}
            {assignment.lessonHref && (
              <Link href={assignment.lessonHref} className={cn(PRIMARY, 'w-full sm:w-auto')}>
                {isGraded ? t.reviewLesson : assignment.status === 'not_started' ? t.startLesson : t.continueLesson}
              </Link>
            )}
            {!isGraded && <SubmissionBox userId={userId} assignment={assignment} t={t} />}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyCard({ title, sub, dir }: { title: string; sub: string; dir: 'ltr' | 'rtl' }) {
  return (
    <div dir={dir} className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#FBF5EC] px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className={cn(CARD, 'mx-auto mt-6 flex max-w-xl flex-col items-center p-10 text-center')}>
          <Clipboard size={96} />
          <p className="mt-4 text-[24px] font-extrabold text-[#0B3B44]">{title}</p>
          <p className="mt-1 text-[16px] font-medium text-[#6F8E8B]">{sub}</p>
        </div>
      </div>
    </div>
  )
}

export default function AssignmentsClient({ userId, className, assignments, language = 'en' }: Props) {
  const lang = (language === 'ar' || language === 'fr' ? language : 'en') as 'en' | 'ar' | 'fr'
  const t = UI[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const [tab, setTab] = useState<'all' | 'todo' | 'graded'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement | null>(null)

  if (!className) return <EmptyCard title={t.noClassTitle} sub={t.noClassSub} dir={dir} />
  if (assignments.length === 0) return <EmptyCard title={t.clearTitle} sub={t.clearSub} dir={dir} />

  const filtered = assignments.filter(a =>
    tab === 'all' ? true : tab === 'graded' ? a.status === 'graded' : a.status !== 'graded'
  )
  const selected = filtered.find(a => a.id === selectedId) ?? filtered[0] ?? null

  const choose = (id: string) => {
    setSelectedId(id)
    // on phones the details sit under the list, so bring them into view
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    }
  }

  const tabs: { key: 'all' | 'todo' | 'graded'; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'todo', label: t.todo },
    { key: 'graded', label: t.graded },
  ]

  return (
    <div dir={dir} className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#FBF5EC] px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">

        <header className="mb-5 sm:mb-6">
          <h1 className="text-[32px] font-extrabold leading-tight text-[#0B3B44] sm:text-[52px]">{t.title}</h1>
          <p className="text-[16px] font-medium text-[#5E7F83] sm:text-[22px]">{className}</p>
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={t.title}
          className="mb-5 inline-flex max-w-full gap-1 rounded-full bg-[#FFFCF7] p-1.5 shadow-[0_4px_16px_rgba(11,59,68,0.08)] ring-1 ring-[#F0E7DA]"
        >
          {tabs.map(x => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => setTab(x.key)}
              className={cn(
                'rounded-full px-5 py-2 text-[15px] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60 sm:px-8 sm:py-3 sm:text-[20px]',
                tab === x.key
                  ? 'bg-gradient-to-r from-[#22D3BE] to-[#14B8A6] text-[#0B3B44] shadow-[0_6px_14px_rgba(20,184,166,0.35)]'
                  : 'text-[#0B3B44] hover:bg-[#F6EFE3]'
              )}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">

          {/* List */}
          <section className={cn(CARD, 'p-3 sm:p-4')} aria-label={t.title}>
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-[16px] font-medium text-[#6F8E8B]">{t.emptyTab}</p>
            ) : (
              <ul className="space-y-3">
                {filtered.map(a => {
                  const active = selected?.id === a.id
                  const st = STATUS_STYLE[a.status]
                  const due = formatDue(a.dueDate, lang)
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => choose(a.id)}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-[22px] border-2 p-3 text-start transition-all sm:gap-4 sm:p-4',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60',
                          active
                            ? 'border-[#19D3BE] bg-[#EAFBF7] shadow-[0_6px_18px_rgba(25,211,190,0.2)]'
                            : 'border-transparent bg-[#FBF5EC] hover:border-[#E6DFD1] hover:bg-white'
                        )}
                      >
                        <Clipboard size={56} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[18px] font-extrabold text-[#0B3B44] sm:text-[22px]">{a.title}</span>
                          <span className="block truncate text-[14px] font-medium text-[#6F8E8B] sm:text-[16px]">
                            {a.assignedBy ? t.assignedBy(a.assignedBy) : t.assigned}
                            {due ? ` · ${t.due(due)}` : ''}
                          </span>
                        </span>
                        <span
                          className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-extrabold sm:text-[14px]"
                          style={{ background: st.bg, color: st.text }}
                        >
                          {t.status[a.status]}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Details */}
          <div ref={detailRef} className="scroll-mt-4 lg:sticky lg:top-6">
            {selected ? (
              <AssignmentDetail key={selected.id} userId={userId} assignment={selected} t={t} lang={lang} />
            ) : (
              <div className={cn(CARD, 'p-8 text-center')}>
                <p className="text-[16px] font-medium text-[#6F8E8B]">{t.pick}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}