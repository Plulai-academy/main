// app/(app)/quiz/page.tsx  v2
// Resumes existing session if < 3 hours old and hearts > 0
// Otherwise creates a new one
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuizGame from '@/components/quiz/QuizGame'

export const dynamic = 'force-dynamic'

export default async function QuizPage() {
  const supabase = await createClient()

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Profile ────────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group, language')
    .eq('id', user.id)
    .single()

  const ageGroup = (profile?.age_group ?? 'pro') as 'pro' | 'expert'
  const language = (profile?.language  ?? 'en')  as 'en' | 'ar' | 'fr'

  // ── Try to resume an existing session (< 3h old, hearts > 0) ──────────────
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()

  const { data: existing } = await supabase
    .from('quiz_sessions')
    .select('id, hearts_left')
    .eq('user_id', user.id)
    .is('ended_at', null)             // not yet ended
    .gt('hearts_left', 0)             // still has hearts
    .gt('started_at', threeHoursAgo)  // started within last 3 hours
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let sessionId: string
  let initialHearts: number

  if (existing) {
    // Resume
    sessionId     = existing.id
    initialHearts = existing.hearts_left
  } else {
    // Create new session
    const { data: newSession, error } = await supabase
      .from('quiz_sessions')
      .insert({ user_id: user.id, hearts_left: 3 })
      .select('id')
      .single()

    if (error || !newSession) {
      console.error('Failed to create session:', error)
      redirect('/dashboard')
    }

    sessionId     = newSession.id
    initialHearts = 3
  }

  // ── Fetch adaptive question batch ──────────────────────────────────────────
  const count = Math.floor(Math.random() * 11) + 5  // 5–15

  const { data: questions, error: qErr } = await supabase
    .rpc('pick_quiz_questions', {
      p_user_id:   user.id,
      p_age_group: ageGroup,
      p_count:     count,
    })

  if (qErr) console.error('pick_quiz_questions:', qErr)

  // Fallback: Month 1 questions if adaptive engine returns nothing
  let questionBank = questions ?? []
  if (!questionBank.length) {
    const { data: fallback } = await supabase
      .from('quiz_questions')
      .select('id,month,topic,difficulty,question,options,hint,explanation,xp_reward')
      .eq('is_active', true)
      .contains('age_groups', [ageGroup])
      .eq('month', 1)
      .limit(10)
    questionBank = fallback ?? []
  }

  if (!questionBank.length) redirect('/dashboard')

  return (
    <QuizGame
      userId        = {user.id}
      ageGroup      = {ageGroup}
      language      = {language}
      questions     = {questionBank}
      sessionId     = {sessionId}
      initialHearts = {initialHearts}
    />
  )
}