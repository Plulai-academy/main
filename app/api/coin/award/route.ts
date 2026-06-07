// app/api/coins/award/route.ts
import { NextResponse } from 'next/server'
import { awardStreakCoins, awardXPCoins } from '@/lib/supabase/wallet'

export async function POST(req: Request) {
  try {
    const { userId, type, amount } = await req.json()
    if (!userId || !type) return NextResponse.json({ ok: false })

    if (type === 'streak') await awardStreakCoins(userId)
    if (type === 'xp')     await awardXPCoins(userId, amount ?? 0)

    return NextResponse.json({ ok: true })
  } catch (_) {
    return NextResponse.json({ ok: false })
  }
}