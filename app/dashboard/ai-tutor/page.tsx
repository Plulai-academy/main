// app/dashboard/coach/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoachClient from '@/components/dashboard/CoachClient'
import { Suspense } from 'react'

export default async function CoachPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, sessionRes] = await Promise.all([
    supabase.from('profiles')
      .select('display_name,avatar,age,age_group,interests,dream_project,preferred_language')
      .eq('id', user.id).single(),
    // Find today's session (one session per day)
    supabase.from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', new Date().toISOString().split('T')[0]) // today
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  let sessionId = sessionRes.data?.[0]?.id
  if (!sessionId) {
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: `Session ${new Date().toLocaleDateString()}` })
      .select('id').single()
    sessionId = newSession?.id
  }

  // Load this session's history (last 40 messages)
  const historyRes = sessionId ? await supabase
    .from('chat_messages')
    .select('role,content,created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(40) : { data: [] }

  return (
    <Suspense>
      <CoachClient
        userId={user.id}
        profile={profileRes.data}
        sessionId={sessionId ?? ''}
        history={(historyRes.data ?? []).map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          ts: m.created_at,
        }))}
      />
    </Suspense>
  )
}
