// app/dashboard/settings/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, progressRes] = await Promise.all([
    supabase.from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase.from('user_progress')
      .select('xp, level, streak, total_time_mins, longest_streak')
      .eq('user_id', user.id)
      .single(),
  ])

  return (
    <SettingsClient
      userId={user.id}
      profile={profileRes.data}
      progress={progressRes.data}
    />
  )
}
