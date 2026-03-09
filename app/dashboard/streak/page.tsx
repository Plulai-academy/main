// app/dashboard/streak/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StreakClient from '@/components/dashboard/StreakClient'

export default async function StreakPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, progressRes, shopRes, historyRes, txnCountRes] = await Promise.all([
    supabase.from('profiles').select('preferred_language, display_name, avatar').eq('id', user.id).single(),
    supabase.from('user_progress').select('xp, level, streak, longest_streak, last_active_date, freeze_tokens').eq('user_id', user.id).single(),
    supabase.from('shop_items').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('freeze_uses').select('used_date, protected_streak, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('shop_transactions').select('item_id, xp_spent, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <StreakClient
      userId={user.id}
      profile={profileRes.data}
      progress={progressRes.data}
      shopItems={shopRes.data ?? []}
      freezeHistory={historyRes.data ?? []}
      recentPurchases={txnCountRes.data ?? []}
    />
  )
}
