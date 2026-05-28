// app/api/submissions/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, lessonId, projectUrl, videoUrl } = await req.json()

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'Missing userId or lessonId' }, { status: 400 })
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('lesson_submissions')
      .upsert(
        {
          user_id:     userId,
          lesson_id:   lessonId,
          project_url: projectUrl ?? null,
          video_url:   videoUrl   ?? null,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )

    if (error) {
      console.error('Submission error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submission route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')
    const userId   = searchParams.get('userId')

    const supabase = createClient()
    let query = supabase.from('lesson_submissions').select('*').order('submitted_at', { ascending: false })

    if (lessonId) query = query.eq('lesson_id', lessonId)
    if (userId)   query = query.eq('user_id', userId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ submissions: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}