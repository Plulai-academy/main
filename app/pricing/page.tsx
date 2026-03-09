// app/pricing/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import PricingClient from '@/components/subscription/PricingClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Plulai — AI Coding for Kids UAE',
  description: 'Start free for 14 days. Then $79/month or $663/year. Full access to AI, Coding & Entrepreneurship for kids in UAE & GCC.',
}

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let accessInfo = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name,trial_ends_at,subscription_ends_at,subscription,preferred_language')
      .eq('id', user.id)
      .single()
    profile = data

    const now = Date.now()
    const trialEnd = data?.trial_ends_at ? new Date(data.trial_ends_at).getTime() : 0
    const subEnd   = data?.subscription_ends_at ? new Date(data.subscription_ends_at).getTime() : 0
    accessInfo = {
      isTrialing:     trialEnd > now,
      trialDaysLeft:  trialEnd > now ? Math.ceil((trialEnd - now) / 86400000) : 0,
      isPaid:         subEnd > now || ['pro','school'].includes(data?.subscription ?? ''),
    }
  }

  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_usd')

  return (
    <PricingClient
      plans={plans ?? []}
      isLoggedIn={!!user}
      profile={profile}
      accessInfo={accessInfo}
    />
  )
}
