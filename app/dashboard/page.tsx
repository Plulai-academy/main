// File: page.tsx
// Placement: app/dashboard/page.tsx
//
// Branches on account_type: B2B2C students get an assignment-driven
// next lesson + their class name, B2C students keep the original
// free-exploration path. Also guards against staff landing here.
//
// CHANGE FROM PREVIOUS VERSION: className is now actually passed to
// DashboardClient — it was being fetched but had nowhere to go until
// DashboardClient grew a className prop.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { getStaffRoleIfAny, getNextLessonForSoloStudent, getNextAssignmentForStudent } from '@/lib/supabase/queries'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Guard: a teacher/school_admin should never land on the student
  // dashboard, even by navigating here directly (login already routes
  // them elsewhere, but that's not the only way someone reaches a URL).
  const staffRole = await getStaffRoleIfAny(user.id)
  if (staffRole) {
    redirect(staffRole.role === 'school_admin' ? '/school-admin' : '/teacher')
  }

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

  // 4. Branch: B2B2C students get an assignment-driven next lesson +
  //    class name; B2C students get the free-exploration path. This
  //    is the one meaningful difference in server logic — everything
  //    else (progress, badges, challenges) is identical for both.
  const isB2B2C = profile.account_type === 'b2b2c' && !!profile.school_id

  let nextLesson: Awaited<ReturnType<typeof getNextLessonForSoloStudent>> | null = null
  let className: string | null = null

  if (isB2B2C) {
    const result = await getNextAssignmentForStudent(user.id, supabase)
    nextLesson = result.nextLesson
    className  = result.className
  } else {
    nextLesson = await getNextLessonForSoloStudent(user.id, ageGroup, supabase)
  }

  // 5. Weekly lesson count, for the streak-dots row
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const weeklyLessons = (lessonCompletionsRes.data ?? []).filter(
    (c: any) => c.completed_at && c.completed_at >= oneWeekAgo
  ).length

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
      nextLesson={nextLesson}
      weeklyLessons={weeklyLessons}
      weeklyGoal={5}
      className={className}
      // classNews is still NOT wired — there's no announcements table
      // yet. className (the class name, e.g. "Grade 5B") IS wired now
      // and shows in DashboardClient's assignment pill for B2B2C
      // students; it's simply null for B2C students, which
      // DashboardClient already handles (falsy values are filtered
      // out of the pill).
    />
  )
}