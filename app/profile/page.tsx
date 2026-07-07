// File: page.tsx
// Placement: app/profile/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/ProfileClient'

function startOfWeek(d: Date) {
  const date = new Date(d)
  const day = date.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const [
    progressRes,
    lessonCompletionsRes,
    userBadgesRes,
    allBadgesRes,
  ] = await Promise.all([
    supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
    supabase.from('user_lesson_completions').select('completed_at').eq('user_id', user.id),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
    supabase.from('badges').select('*').eq('is_active', true).order('rarity'),
  ])

  const lessonCompletions = lessonCompletionsRes.data ?? []

  // Build this week's pearl calendar — Monday through Sunday, marking any
  // day that has at least one lesson completion.
  const weekStart = startOfWeek(new Date())
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const completedDates = new Set(
    lessonCompletions.map((c: any) => new Date(c.completed_at).toDateString())
  )
  const weekActivity = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      active: completedDates.has(date.toDateString()),
      isFuture: date > today,
    }
  })

  return (
    <ProfileClient
      profile={profile}
      progress={progressRes.data}
      totalLessons={lessonCompletions.length}
      userBadges={userBadgesRes.data ?? []}
      allBadges={allBadgesRes.data ?? []}
      weekActivity={weekActivity}
    />
  )
}