// app/dashboard/page.tsx — Server component, queries Supabase directly
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 1. Profile — needed before everything else
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  const isAdmin = (profile as any).is_admin === true
  if (!profile.onboarding_done && !isAdmin) redirect('/onboarding')

  const ageGroup = profile.age_group ?? 'pro'
  const today    = new Date().toISOString().split('T')[0]

  // 2. Upsert user_progress so it always exists (handles new/test accounts)
  await supabase
    .from('user_progress')
    .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })

  // 3. Fetch everything in parallel — same pattern as badges/skills pages
  const [
    progressRes,
    skillProgressRes,
    lessonCompletionsRes,
    userBadgesRes,
    allBadgesRes,
    todayChallengeRes,
    challengeCompletionsRes,
  ] = await Promise.all([
    supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
    supabase.from('user_lesson_completions').select('*').eq('user_id', user.id),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
    supabase.from('badges').select('*').eq('is_active', true).order('rarity'),
    supabase.from('daily_challenges').select('*').eq('age_group', ageGroup).eq('active_date', today).maybeSingle(),
    supabase.from('user_challenge_completions').select('*').eq('user_id', user.id),
  ])

  return (
    <DashboardClient
      userId={user.id}
      profile={profile}
      progress={progressRes.data}
      skillProgress={skillProgressRes.data ?? []}
      lessonCompletions={lessonCompletionsRes.data ?? []}
      userBadges={userBadgesRes.data ?? []}
      allBadges={allBadgesRes.data ?? []}
      todayChallenge={todayChallengeRes.data ?? null}
      challengeCompletions={challengeCompletionsRes.data ?? []}
    />
  )
}
