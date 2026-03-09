// app/parent/[token]/page.tsx — Public, token-protected parent view
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ParentDashboardClient from '@/components/parent/ParentDashboardClient'

interface Props { params: { token: string } }

export default async function ParentDashboardPage({ params }: Props) {
  // Use service role to bypass RLS for token lookup
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Validate token
  const { data: tokenRow } = await supabase
    .from('parent_tokens')
    .select('user_id, expires_at')
    .eq('token', params.token)
    .single()

  if (!tokenRow) return notFound()
  if (new Date(tokenRow.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-white/10 rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="font-fredoka text-2xl mb-2">Link Expired</h1>
          <p className="text-muted font-semibold text-sm">
            This parent access link has expired. Ask your child to send a new one from their Settings page.
          </p>
        </div>
      </div>
    )
  }

  const userId = tokenRow.user_id

  // Load all child data
  const [profileRes, progressRes, lessonRes, badgeRes, skillProgressRes, challengeRes] = await Promise.all([
    supabase.from('profiles').select('display_name, avatar, age, age_group, country, preferred_language, interests, dream_project, created_at').eq('id', userId).single(),
    supabase.from('user_progress').select('xp, level, streak, longest_streak, total_time_mins, last_active_date').eq('user_id', userId).single(),
    supabase.from('user_lesson_completions').select('lesson_id, score_pct, time_spent_mins, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }),
    supabase.from('user_badges').select('badge_id, earned_at, badges(name, emoji, rarity)').eq('user_id', userId).order('earned_at', { ascending: false }),
    supabase.from('user_skill_progress').select('skill_node_id, progress_pct, completed_at, skill_nodes(title, emoji, track_id)').eq('user_id', userId),
    supabase.from('user_challenge_completions').select('challenge_id, completed_at').eq('user_id', userId),
  ])

  return (
    <ParentDashboardClient
      child={profileRes.data}
      progress={progressRes.data}
      lessons={lessonRes.data ?? []}
      badges={badgeRes.data ?? []}
      skillProgress={skillProgressRes.data ?? []}
      challenges={challengeRes.data ?? []}
    />
  )
}
