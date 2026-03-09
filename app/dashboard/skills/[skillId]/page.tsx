// app/dashboard/skills/[skillId]/page.tsx — Server Component
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonListClient from '@/components/dashboard/LessonListClient'

interface Props {
  params: { skillId: string }
}

export default async function SkillDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group, preferred_language')
    .eq('id', user.id)
    .single()

  // Load the skill node
  const { data: skill } = await supabase
    .from('skill_nodes')
    .select('*')
    .eq('id', params.skillId)
    .single()

  if (!skill) notFound()

  // Load lessons for this skill (age-filtered)
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('skill_node_id', params.skillId)
    .eq('is_active', true)
    .contains('age_groups', [profile?.age_group ?? 'pro'])
    .order('sort_order')

  // Load user's lesson completions for this skill
  const { data: completions } = await supabase
    .from('user_lesson_completions')
    .select('lesson_id, score_pct, time_spent_mins, completed_at')
    .eq('user_id', user.id)
    .in('lesson_id', (lessons ?? []).map((l: any) => l.id))

  // Load skill progress
  const { data: skillProgress } = await supabase
    .from('user_skill_progress')
    .select('progress_pct, completed_at')
    .eq('user_id', user.id)
    .eq('skill_node_id', params.skillId)
    .single()

  return (
    <LessonListClient
      userId={user.id}
      skill={skill}
      lessons={lessons ?? []}
      completions={completions ?? []}
      skillProgress={skillProgress ?? null}
      language={profile?.preferred_language ?? 'en'}
    />
  )
}
