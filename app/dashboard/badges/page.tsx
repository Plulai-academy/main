// app/dashboard/badges/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BadgesClient from '@/components/dashboard/BadgesClient'

export default async function BadgesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, allBadgesRes, userBadgesRes] = await Promise.all([
    supabase.from('profiles').select('preferred_language, display_name, avatar').eq('id', user.id).single(),
    supabase.from('badges').select('*').eq('is_active', true).order('rarity'),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
  ])

  return (
    <BadgesClient
      allBadges={allBadgesRes.data ?? []}
      userBadges={userBadgesRes.data ?? []}
      language={profileRes.data?.preferred_language ?? 'en'}
      childName={profileRes.data?.display_name ?? 'Explorer'}
      childAvatar={profileRes.data?.avatar ?? '🧑‍🚀'}
    />
  )
}
