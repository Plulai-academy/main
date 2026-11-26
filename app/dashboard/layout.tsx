// app/dashboard/layout.tsx
//
// Only the wrapper classes changed (phone-width fix). All data loading,
// redirects, streak update and trial/subscription logic is the same.
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/layout/DashboardNav'
import TrialBanner from '@/components/layout/TrialBanner'
import PresenceHeartbeat from '@/components/dashboard/PresenceHeartbeat'
import { updateStreak } from '@/lib/supabase/queries'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const isAdmin = (profile as any).is_admin === true
  if (!profile.onboarding_done && !isAdmin) {
    redirect('/onboarding')
  }

  try { await updateStreak(user.id) } catch (_) {}

  const now      = Date.now()
  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0
  const subEnd   = profile?.subscription_ends_at ? new Date(profile.subscription_ends_at).getTime() : 0
  const isTrialing    = trialEnd > now
  const isPaid        = subEnd > now || ['pro', 'school'].includes(profile?.subscription ?? '')
  const trialDaysLeft = isTrialing ? Math.ceil((trialEnd - now) / 86_400_000) : 0

  return (
    // overflow-x-clip: nothing inside can ever make the page wider than the screen
    <div className="flex min-h-dvh w-full max-w-full overflow-x-clip">
      <PresenceHeartbeat userId={user.id} />
      <DashboardNav profile={profile} userId={user.id} />

      {/*
        min-w-0 is the actual fix: a flex child defaults to min-width:auto, so one
        wide thing inside (a scrolling row, a marquee, a long line) stretched <main>
        past the phone's width and the browser zoomed the whole page out.
        The bottom padding keeps content clear of the mobile nav bar (+ iPhone home bar).
      */}
      <main className="relative z-10 min-w-0 flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pb-0">
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