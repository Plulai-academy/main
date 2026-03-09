// app/dashboard/leaderboard/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from '@/components/dashboard/LeaderboardClient'

export default async function LeaderboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, globalRes, gccRes] = await Promise.all([
    supabase.from('profiles').select('id,country,age_group,preferred_language').eq('id', user.id).single(),
    supabase.from('leaderboard').select('*').order('rank_global').limit(50),
    supabase.from('leaderboard').select('*')
      .in('country', ['AE','SA','QA','KW','BH','OM'])
      .order('xp', { ascending: false }).limit(50),
  ])

  const profile = profileRes.data
  const userRankRes = await supabase.from('leaderboard').select('*').eq('id', user.id).single()

  return (
    <LeaderboardClient
      userId={user.id}
      userCountry={profile?.country ?? 'AE'}
      ageGroup={profile?.age_group ?? 'pro'}
      language={profile?.preferred_language ?? 'en'}
      globalRows={globalRes.data ?? []}
      gccRows={gccRes.data ?? []}
      myRank={userRankRes.data ?? null}
    />
  )
}
