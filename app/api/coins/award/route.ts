// app/api/coins/award/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { awardStreakCoins, awardXPCoins } from '@/lib/supabase/wallet'

export async function POST(req: Request) {
  try {
    const { userId, type, xpBefore, xpAfter } = await req.json()

    if (!userId || !type) {
      return NextResponse.json({ ok: false, error: 'Missing userId or type' }, { status: 400 })
    }

    // Verify the userId matches the authenticated session as a safety check
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (type === 'streak') {
      await awardStreakCoins(userId)
    }

    if (type === 'xp') {
      // xpBefore and xpAfter are the user's total XP before and after the transaction
      await awardXPCoins(userId, xpBefore ?? 0, xpAfter ?? 0)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[coins/award] error:', err?.message ?? err)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}