// app/dashboard/challenges/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChallengesClient from '@/components/dashboard/ChallengesClient'

export default async function ChallengesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group, preferred_language, trial_ends_at, subscription_ends_at, subscription')
    .eq('id', user.id).single()

  const today = new Date().toISOString().split('T')[0]

  const [dailyRes, bonusRes, completionsRes] = await Promise.all([
    supabase.from('daily_challenges').select('*')
      .eq('age_group', profile?.age_group ?? 'pro')
      .eq('active_date', today).single(),
    supabase.from('bonus_challenges').select('*')
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .eq('is_active', true).order('sort_order'),
    supabase.from('user_challenge_completions').select('challenge_id').eq('user_id', user.id),
  ])

  const now = Date.now()
  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0
  const subEnd   = profile?.subscription_ends_at ? new Date(profile.subscription_ends_at).getTime() : 0
  const hasAccess = trialEnd > now || subEnd > now || ['pro','school'].includes(profile?.subscription ?? '')

  return (
    <ChallengesClient
      userId={user.id}
      language={profile?.preferred_language ?? 'en'}
      hasAccess={hasAccess}
      dailyChallenge={dailyRes.data ?? null}
      bonusChallenges={bonusRes.data ?? []}
      completedIds={(completionsRes.data ?? []).map((c: any) => c.challenge_id)}
    />
  )
}
