// app/dashboard/layout.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/layout/DashboardNav'
import TrialBanner from '@/components/layout/TrialBanner'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // No profile row → onboarding
  if (!profile) redirect('/onboarding')

  // Onboarding not completed → onboarding
  // Admin accounts bypass this: they have is_admin=true and we skip the check
  const isAdmin = (profile as any).is_admin === true
  if (!profile.onboarding_done && !isAdmin) {
    redirect('/onboarding')
  }

  // Compute trial / subscription status
  const now      = Date.now()
  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0
  const subEnd   = profile?.subscription_ends_at ? new Date(profile.subscription_ends_at).getTime() : 0
  const isTrialing    = trialEnd > now
  const isPaid        = subEnd > now || ['pro', 'school'].includes(profile?.subscription ?? '')
  const trialDaysLeft = isTrialing ? Math.ceil((trialEnd - now) / 86_400_000) : 0
  // Note: subscription access gate is enforced in middleware.ts

  return (
    <div className="flex min-h-screen">
      <DashboardNav profile={profile} userId={user.id} />
      <main className="flex-1 ml-20 lg:ml-64 relative z-10">
        <TrialBanner
          trialDaysLeft={trialDaysLeft}
          isTrialing={isTrialing}
          isPaid={isPaid}
          language={profile?.preferred_language ?? 'en'}
        />
        {children}
      </main>
    </div>
  )
}
