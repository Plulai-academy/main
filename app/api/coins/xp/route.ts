// app/api/coins/xp/route.ts
// Call this from the lesson complete flow — passes xpEarned
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { awardXPCoins } from '@/lib/supabase/wallet'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { xpEarned } = await req.json()
  if (!xpEarned || xpEarned < 1000) {
    return NextResponse.json({ coinsEarned: 0 })
  }

  await awardXPCoins(user.id, xpEarned)
  const coins = Math.floor(xpEarned / 1000) * 100
  return NextResponse.json({ coinsEarned: coins })
}