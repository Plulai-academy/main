// app/dashboard/progress/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProgressClient from '@/components/dashboard/ProgressClient'

const WEEKLY_LESSON_GOAL = 5

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const userId = user.id
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const [profileRes, progressRes, userBadgesRes, completionsRes] = await Promise.all([
    supabase.from('profiles').select('preferred_language').eq('id', userId).single(),
    supabase.from('user_progress').select('xp, streak').eq('user_id', userId).single(),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId),
    supabase.from('user_lesson_completions').select('completed_at').eq('user_id', userId),
  ])

  const completions = completionsRes.data ?? []
  const lessonsThisWeek = completions.filter(c => new Date(c.completed_at) >= weekStart).length

  return (
    <ProgressClient
      language={profileRes.data?.preferred_language ?? 'en'}
      xp={progressRes.data?.xp ?? 0}
      streak={progressRes.data?.streak ?? 0}
      lessonsThisWeek={lessonsThisWeek}
      weeklyGoal={WEEKLY_LESSON_GOAL}
      badgesEarned={(userBadgesRes.data ?? []).length}
      totalLessons={completions.length}
    />
  )
}