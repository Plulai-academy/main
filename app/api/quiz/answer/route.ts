// app/api/quiz/answer/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { sessionId, userId, questionId, topic, month, selectedIdx, isCorrect, xpGained } = body

  if (!sessionId || !userId || !questionId)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // 1. Record answer
  await supabase.from('quiz_answers').insert({
    session_id:   sessionId,
    user_id:      userId,
    question_id:  questionId,
    selected_idx: selectedIdx,
    is_correct:   isCorrect,
  })

  // 2. Update session counters
  await supabase.rpc('increment_session_stats', {
    p_session_id: sessionId,
    p_correct:    isCorrect,
    p_xp:         xpGained ?? 0,
  })

  // 3. Update concept mastery
  await supabase.rpc('update_concept_mastery', {
    p_user_id: userId,
    p_topic:   topic,
    p_month:   month,
    p_correct: isCorrect,
  })

  // 4. Award XP
  if (isCorrect && xpGained > 0) {
    await supabase.rpc('increment_user_xp', {
      p_user_id: userId,
      p_amount:  xpGained,
    })
  }

  return NextResponse.json({ ok: true })
}