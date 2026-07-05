// app/api/quiz/answer/route.ts  v2
// Passes hearts correctly + uses origIdx (pre-shuffle) for DB recording
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    sessionId, userId, questionId,
    topic, month, selectedIdx,   // origIdx = index before shuffle
    isCorrect, xpGained,
  } = await req.json()

  if (!sessionId || !userId || !questionId)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // 1. Record answer (parallel)
  const [answerResult] = await Promise.all([
    supabase.from('quiz_answers').insert({
      session_id:   sessionId,
      user_id:      userId,
      question_id:  questionId,
      selected_idx: selectedIdx,   // original index before shuffle
      is_correct:   isCorrect,
    }),
    // 2. Update session counters + hearts
    supabase.rpc('increment_session_stats', {
      p_session_id: sessionId,
      p_correct:    isCorrect,
      p_xp:         xpGained ?? 0,
      p_lose_heart: !isCorrect,    // lose heart on wrong
    }),
    // 3. Update concept mastery
    supabase.rpc('update_concept_mastery', {
      p_user_id: userId,
      p_topic:   topic,
      p_month:   month,
      p_correct: isCorrect,
    }),
  ])

  if (answerResult.error) console.error('quiz_answers:', answerResult.error)

  // 4. Award XP (only on correct)
// 4. Award XP (only on correct)
  if (isCorrect && xpGained > 0) {
    const { error } = await supabase
      .rpc('increment_user_xp', { p_user_id: userId, p_amount: xpGained })
    if (error) console.error('increment_user_xp:', error)
  }

  return NextResponse.json({ ok: true })
}