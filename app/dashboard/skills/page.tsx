// app/dashboard/skills/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SkillsClient from '@/components/dashboard/SkillsClient'

export default async function SkillsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group, preferred_language')
    .eq('id', user.id)
    .single()

  const [tracksRes, skillsRes, skillProgressRes, lessonCountsRes] = await Promise.all([
    supabase.from('tracks').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('skill_nodes').select('*').eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .order('sort_order'),
    supabase.from('user_skill_progress').select('skill_node_id,progress_pct,completed_at').eq('user_id', user.id),
    // Count lessons per skill node
    supabase.from('lessons').select('skill_node_id').eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro']),
  ])

  // Build a map: skill_node_id → lesson count
  const lessonCountMap: Record<string, number> = {}
  for (const l of lessonCountsRes.data ?? []) {
    lessonCountMap[l.skill_node_id] = (lessonCountMap[l.skill_node_id] ?? 0) + 1
  }

  return (
    <SkillsClient
      userId={user.id}
      tracks={tracksRes.data ?? []}
      skills={skillsRes.data ?? []}
      skillProgress={skillProgressRes.data ?? []}
      lessonCountMap={lessonCountMap}
      language={profile?.preferred_language ?? 'en'}
    />
  )
}
