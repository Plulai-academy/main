// app/api/quiz/questions/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const userId   = searchParams.get('userId')
  const ageGroup = searchParams.get('ageGroup') as 'pro' | 'expert'
  const count    = Math.min(parseInt(searchParams.get('count') ?? '10'), 15)

  if (!userId || !ageGroup)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { data, error } = await supabase.rpc('pick_quiz_questions', {
    p_user_id:   userId,
    p_age_group: ageGroup,
    p_count:     count,
  })

  if (error) {
    console.error('pick_quiz_questions:', error)
    return NextResponse.json({ questions: [] }, { status: 500 })
  }

  return NextResponse.json({ questions: data ?? [] })
}