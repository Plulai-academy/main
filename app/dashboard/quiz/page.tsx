// ══════════════════════════════════════════════════════════════════════════════
// app/(app)/quiz/page.tsx
// Server component — creates session, fetches first question batch, renders game
// ══════════════════════════════════════════════════════════════════════════════
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

  // ── Create a new quiz session ──────────────────────────────────────────────
  const { data: session, error: sessionErr } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id:    user.id,
      hearts_left: 3,
    })
    .select('id')
    .single()

  if (sessionErr || !session) {
    console.error('Failed to create quiz session:', sessionErr)
    redirect('/dashboard')
  }

  // ── Fetch first question batch (adaptive) ──────────────────────────────────
  // Random count between 5 and 15 — keeps it unpredictable
  const count = Math.floor(Math.random() * 11) + 5

  const { data: questions, error: qErr } = await supabase.rpc('pick_quiz_questions', {
    p_user_id:   user.id,
    p_age_group: ageGroup,
    p_count:     count,
  })

  if (qErr) console.error('pick_quiz_questions:', qErr)

  // If no questions yet (first-time user), fall back to Month 1 basics
  const questionBank = questions?.length
    ? questions
    : await supabase
        .from('quiz_questions')
        .select('id,month,topic,difficulty,question,options,hint,explanation,xp_reward')
        .eq('is_active', true)
        .contains('age_groups', [ageGroup])
        .eq('month', 1)
        .order('random()')
        .limit(10)
        .then(r => r.data ?? [])

  return (
    <QuizGame
      userId     = {user.id}
      ageGroup   = {ageGroup}
      language   = {language}
      questions  = {questionBank}
      sessionId  = {session.id}
    />
  )
}