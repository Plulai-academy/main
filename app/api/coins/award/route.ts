import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { awardStreakCoins, awardXPCoins } from '@/lib/supabase/wallet'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { userId, type, xpBefore, xpAfter } = body

    // Security: only award coins for the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (type === 'streak') {
      const newBalance = await awardStreakCoins(userId)
      return NextResponse.json({ success: true, newBalance })
    }

    if (type === 'xp') {
      if (xpBefore === undefined || xpAfter === undefined) {
        return NextResponse.json({ error: 'Missing xpBefore/xpAfter' }, { status: 400 })
      }
      await awardXPCoins(userId, xpBefore, xpAfter)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  } catch (err: any) {
    console.error('[coins/award] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}