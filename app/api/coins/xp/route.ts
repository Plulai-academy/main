// app/api/coins/xp/route.ts
// Called after every lesson completion — awards coins based on TOTAL XP milestones
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Get student's current total XP
    const { data: progress } = await supabase
      .from('user_progress')
      .select('xp')
      .eq('user_id', user.id)
      .single()

    const totalXP = progress?.xp ?? 0

    // How many coins SHOULD the student have earned from XP milestones
    const coinsShouldHave = Math.floor(totalXP / 1000) * 100

    if (coinsShouldHave <= 0) {
      return NextResponse.json({ coinsEarned: 0 })
    }

    // How many XP-based coins have already been awarded
    const { data: alreadyAwarded } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'xp_reward')

    const coinsAlreadyAwarded = (alreadyAwarded ?? []).reduce((sum, tx) => sum + (tx.amount ?? 0), 0)

    // Only award the difference
    const coinsToAward = coinsShouldHave - coinsAlreadyAwarded

    if (coinsToAward <= 0) {
      return NextResponse.json({ coinsEarned: 0 })
    }

    // Award via DB function
    const { data: newBalance, error } = await supabase.rpc('add_coins', {
      p_user_id: user.id,
      p_amount: coinsToAward,
      p_type: 'xp_reward',
      p_description: `⚡ ${totalXP.toLocaleString()} XP milestone → +${coinsToAward} coins`,
      p_reference: null,
    })

    if (error) {
      console.error('[coins/xp] rpc error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coinsEarned: coinsToAward, newBalance })
  } catch (err: any) {
    console.error('[coins/xp] unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 })
  }
}