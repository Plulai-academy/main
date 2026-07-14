'use client'
// components/dashboard/AssignmentsClient.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitAssignmentResponse } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

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
}

const STATUS_STYLE: Record<Assignment['status'], { label: string; bg: string; text: string }> = {
  not_started: { label: 'Not started', bg: '#F1F5F4', text: '#7C9995' },
  in_progress: { label: 'In progress', bg: '#FDECD8', text: '#D9822B' },
  submitted:   { label: 'Submitted',   bg: '#E3F3EE', text: '#2DA36B' },
  graded:      { label: 'Graded',      bg: '#E3EEFB', text: '#3B7DD9' },
}

function formatDue(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function SubmissionBox({
  userId,
  assignment,
}: {
  userId: string
  assignment: Assignment
}) {
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

  if (assignment.status === 'graded') {
    return (
      <div className="bg-[#EAF6F1] rounded-2xl p-4 mt-3">
        <p className="text-xs font-bold text-[#2DA36B] mb-1">Grade: {assignment.grade}</p>
        {assignment.feedback && <p className="text-sm text-[#16323A]">{assignment.feedback}</p>}
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-bold text-[#7C9995] uppercase tracking-wider">
        Submit your work (optional)
      </p>
      <input
        value={projectUrl}
        onChange={(e) => setProjectUrl(e.target.value)}
        placeholder="Link to your project (optional)"
        className="w-full bg-[#F7FAF9] border-2 border-[#E3EEEB] focus:border-[#2DD4BF] rounded-xl px-4 py-2.5 text-sm text-[#16323A] font-medium outline-none transition-all"
      />
      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Link to a video (optional)"
        className="w-full bg-[#F7FAF9] border-2 border-[#E3EEEB] focus:border-[#2DD4BF] rounded-xl px-4 py-2.5 text-sm text-[#16323A] font-medium outline-none transition-all"
      />
      <button
        onClick={handleSubmit}
        disabled={saving || (!projectUrl.trim() && !videoUrl.trim())}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-white text-sm transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#FF6E52' }}
      >
        {saving ? 'Saving...' : hasSubmission ? 'Update submission' : 'Submit'}
      </button>
    </div>
  )
}

function AssignmentCard({ userId, assignment }: { userId: string; assignment: Assignment }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [draft, setDraft] = useState(assignment.submissionContent)
  const [saving, setSaving] = useState(false)

  const statusInfo = STATUS_STYLE[assignment.status]
  const dueLabel = formatDue(assignment.dueDate)

  const handleSubmit = () => {
    if (!draft.trim()) return
    setSaving(true)
    startTransition(async () => {
      await submitAssignmentResponse(assignment.id, userId, draft.trim())
      setSaving(false)
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAF6F1] text-[#2DA36B] text-[10.5px] font-mono font-bold uppercase mb-2">
            {assignment.sourceType === 'custom' ? 'Activity' : assignment.sourceType === 'skill_node' ? 'Unit' : 'Lesson'}
          </span>
          <h3 className="text-lg font-extrabold text-[#16323A] leading-snug">{assignment.title}</h3>
        </div>
        <span
          className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          style={{ background: statusInfo.bg, color: statusInfo.text }}
        >
          {statusInfo.label}
        </span>
      </div>

      <p className="text-[#7C9995] text-xs font-medium mb-4">
        {assignment.assignedBy ? `Assigned by ${assignment.assignedBy}` : 'Assigned'}
        {dueLabel ? ` · Due ${dueLabel}` : ''}
      </p>

      {assignment.sourceType === 'custom' ? (
        <>
          {assignment.instructions && (
            <p className="text-sm text-[#16323A] font-medium leading-relaxed mb-4">{assignment.instructions}</p>
          )}

          {assignment.status === 'graded' ? (
            <div className="bg-[#EAF6F1] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#2DA36B] mb-1">Grade: {assignment.grade}</p>
              {assignment.feedback && <p className="text-sm text-[#16323A]">{assignment.feedback}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full bg-[#F7FAF9] border-2 border-[#E3EEEB] focus:border-[#2DD4BF] rounded-2xl px-4 py-3 text-sm text-[#16323A] font-medium outline-none transition-all resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={saving || !draft.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-white text-sm transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#FF6E52' }}
              >
                {saving ? 'Saving...' : assignment.status === 'submitted' ? 'Update submission' : 'Submit'}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {assignment.instructions && (
            <p className="text-sm text-[#16323A] font-medium leading-relaxed mb-3">{assignment.instructions}</p>
          )}

          {assignment.lessonHref && (
            <Link
              href={assignment.lessonHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-white text-sm transition-transform hover:-translate-y-0.5"
              style={{ background: '#FF6E52' }}
            >
              {assignment.status === 'graded' ? 'Review lesson' : assignment.status === 'not_started' ? 'Start lesson' : 'Continue lesson'}
            </Link>
          )}

          <SubmissionBox userId={userId} assignment={assignment} />
        </>
      )}
    </div>
  )
}

export default function AssignmentsClient({ userId, className, assignments }: Props) {
  if (!className) {
    return (
      <div className="min-h-screen bg-[#EAF6F1] px-6 py-8 lg:px-10 lg:py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[26px] font-extrabold text-[#16323A] mb-2">Assignments</h1>
          <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <p className="text-[#16323A] font-bold mb-1">No assignments yet</p>
            <p className="text-[#7C9995] text-sm font-medium">
              Assignments show up here once you join a class with a class code.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EAF6F1] px-6 py-8 lg:px-10 lg:py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-[26px] font-extrabold text-[#16323A] mb-1">Assignments</h1>
        <p className="text-[#5B7B78] text-sm font-medium mb-7">{className}</p>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <p className="text-[#16323A] font-bold mb-1">All clear</p>
            <p className="text-[#7C9995] text-sm font-medium">Nothing assigned yet — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => (
              <AssignmentCard key={a.id} userId={userId} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}