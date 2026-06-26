// app/dashboard/progress/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProgressClient from '@/components/dashboard/ProgressClient'

const WEEKLY_LESSON_GOAL = 5 // tune per age group later if you want

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const userId = user.id
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay()) // start of this week (Sunday)
  weekStart.setHours(0, 0, 0, 0)

  const [
    profileRes,
    progressRes,
    userBadgesRes,
    allBadgesRes,
    completionsRes,
  ] = await Promise.all([
    supabase.from('profiles')
      .select('display_name, preferred_language, age_group, avatar')
      .eq('id', userId)
      .single(),
    supabase.from('user_progress')
      .select('xp, streak')
      .eq('user_id', userId)
      .single(),
    supabase.from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId),
    supabase.from('badges')
      .select('id, name, emoji, condition, rarity'),
    // Lesson completions joined with lesson title/emoji for the timeline.
    // Adjust the join syntax to match your actual FK name if different.
    supabase.from('user_lesson_completions')
      .select('lesson_id, completed_at, lessons(title, emoji)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50),
  ])

  const profile  = profileRes.data
  const progress = progressRes.data
  const allBadges = allBadgesRes.data ?? []
  const userBadgeRows = userBadgesRes.data ?? []
  const earnedMap = new Map(userBadgeRows.map(b => [b.badge_id, b.earned_at]))

  const badges = allBadges.map(b => ({
    id: b.id,
    name: b.name,
    emoji: b.emoji,
    condition: b.condition,
    rarity: b.rarity ?? 'common',
    earned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  })).sort((a, b) => (a.earned === b.earned ? 0 : a.earned ? -1 : 1))

  const completions = (completionsRes.data ?? []).map((c: any) => ({
    lessonId: c.lesson_id,
    completedAt: c.completed_at,
    title: c.lessons?.title ?? 'Lesson',
    emoji: c.lessons?.emoji ?? '📘',
  }))

  const lessonsThisWeek = completions.filter(c => new Date(c.completedAt) >= weekStart).length

  return (
    <ProgressClient
      displayName={profile?.display_name ?? ''}
      language={profile?.preferred_language ?? 'en'}
      xp={progress?.xp ?? 0}
      streak={progress?.streak ?? 0}
      lessonsThisWeek={lessonsThisWeek}
      weeklyGoal={WEEKLY_LESSON_GOAL}
      badges={badges}
      completions={completions}
    />
  )
}