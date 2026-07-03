// app/api/quiz/mastery/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const topic  = searchParams.get('topic')
  const month  = parseInt(searchParams.get('month') ?? '1')

  if (!userId || !topic)
    return NextResponse.json({ justMastered: false })

  const { data } = await supabase
    .from('user_concept_mastery')
    .select('is_mastered, mastered_at')
    .eq('user_id', userId)
    .eq('topic', topic)
    .eq('month', month)
    .maybeSingle()

  // "just mastered" = mastered in the last 10 seconds
  const justMastered =
    data?.is_mastered &&
    data?.mastered_at &&
    new Date(data.mastered_at).getTime() > Date.now() - 10_000

  return NextResponse.json({ justMastered: !!justMastered })
}