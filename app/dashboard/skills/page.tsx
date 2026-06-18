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
    .select('age_group, preferred_language, display_name')
    .eq('id', user.id)
    .single()

  const [tracksRes, skillsRes, skillProgressRes, lessonCountsRes, progressRes] = await Promise.all([
    supabase.from('tracks').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('skill_nodes').select('*').eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .order('sort_order'),
    supabase.from('user_skill_progress')
      .select('skill_node_id,progress_pct,completed_at')
      .eq('user_id', user.id),
    supabase.from('lessons')
      .select('skill_node_id')
      .eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro']),
    supabase.from('user_progress')
      .select('streak, current_track')
      .eq('user_id', user.id)
      .single(),
  ])

  const lessonCountMap: Record<string, number> = {}
  for (const l of lessonCountsRes.data ?? []) {
    lessonCountMap[l.skill_node_id] = (lessonCountMap[l.skill_node_id] ?? 0) + 1
  }

  const skills = skillsRes.data ?? []
  const skillProgress = skillProgressRes.data ?? []
  const progressMap: Record<string, number> = Object.fromEntries(
    skillProgress.map(p => [p.skill_node_id, p.progress_pct])
  )

  // Find the first incomplete lesson across the active track
  // Active track = current_track from user_progress, else first track
  const currentTrackId = progressRes.data?.current_track ?? tracksRes.data?.[0]?.id ?? null

  const trackSkills = skills
    .filter(s => s.track_id === currentTrackId)
    .sort((a, b) => a.sort_order - b.sort_order)

  // First skill that is unlocked (all required_nodes complete) but not 100% done
  const isUnlocked = (skill: any) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every((r: string) => (progressMap[r] ?? 0) >= 100)

  const nextSkill = trackSkills.find(s => isUnlocked(s) && (progressMap[s.id] ?? 0) < 100)
    ?? trackSkills[0]

  // Find first incomplete lesson in that skill
  let firstIncompleteLessonId: string | null = null
  if (nextSkill) {
    const { data: lessonsInSkill } = await supabase
      .from('lessons')
      .select('id, sort_order')
      .eq('skill_node_id', nextSkill.id)
      .eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .order('sort_order')

    const { data: completedLessons } = await supabase
      .from('user_lesson_completions')
      .select('lesson_id')
      .eq('user_id', user.id)

    const completedSet = new Set((completedLessons ?? []).map(c => c.lesson_id))
    const firstIncomplete = (lessonsInSkill ?? []).find(l => !completedSet.has(l.id))
    firstIncompleteLessonId = firstIncomplete?.id ?? lessonsInSkill?.[0]?.id ?? null
  }

  return (
    <SkillsClient
      userId={user.id}
      tracks={tracksRes.data ?? []}
      skills={skills}
      skillProgress={skillProgress}
      lessonCountMap={lessonCountMap}
      language={profile?.preferred_language ?? 'en'}
      userName={profile?.display_name ?? ''}
      streak={progressRes.data?.streak ?? 0}
      currentTrackId={currentTrackId}
      nextSkillId={nextSkill?.id ?? null}
      firstIncompleteLessonId={firstIncompleteLessonId}
    />
  )
}