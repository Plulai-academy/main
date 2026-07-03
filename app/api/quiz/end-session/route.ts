// app/api/quiz/end-session/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_CHEST = {
  tier: 'wood', emoji: '📦', color: '#8B6F47',
  label: 'Wood Chest', xp: 15, coins: 75, badge_id: null,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { sessionId, userId } = await req.json()

  if (!sessionId || !userId)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabase.rpc('end_quiz_session', {
    p_session_id: sessionId,
    p_user_id:    userId,
  })

  if (error) {
    console.error('end_quiz_session:', error)
    return NextResponse.json({ chest: FALLBACK_CHEST })
  }

  // Award coins
// Award coins
if (data?.coins) {
  const { error: coinError } = await supabase.rpc('increment_user_coins', {
    p_user_id: userId,
    p_amount:  data.coins,
  })

  if (coinError) {
    console.error('increment_user_coins:', coinError)
  }
}

  return NextResponse.json({ chest: data })
}