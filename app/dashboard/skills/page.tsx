// app/dashboard/skills/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SkillsClient from '@/components/dashboard/SkillsClient'

export default async function SkillsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const userId = user.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group, preferred_language, display_name')
    .eq('id', userId)
    .single()

  const [tracksRes, skillsRes, skillProgressRes, lessonCountsRes, progressRes, walletRes] = await Promise.all([
    supabase.from('tracks').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('skill_nodes').select('*').eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .order('sort_order'),
    supabase.from('user_skill_progress')
      .select('skill_node_id,progress_pct,completed_at')
      .eq('user_id', userId),
    supabase.from('lessons')
      .select('skill_node_id')
      .eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro']),
    supabase.from('user_progress')
      .select('streak, current_track')
      .eq('user_id', userId)
      .single(),
    supabase.from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single(),
  ])

  const lessonCountMap: Record<string, number> = {}
  for (const l of lessonCountsRes.data ?? []) {
    lessonCountMap[l.skill_node_id] = (lessonCountMap[l.skill_node_id] ?? 0) + 1
  }

  const tracks = tracksRes.data ?? []
  const skills = skillsRes.data ?? []
  const skillProgress = skillProgressRes.data ?? []
  const progressMap: Record<string, number> = Object.fromEntries(
    skillProgress.map(p => [p.skill_node_id, p.progress_pct])
  )

  // Active track: saved current_track if it's still valid, else first track
  const savedTrackId = progressRes.data?.current_track
  const currentTrackId = (savedTrackId && tracks.some(tr => tr.id === savedTrackId))
    ? savedTrackId
    : (tracks[0]?.id ?? null)

  const isUnlocked = (skill: any) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every((r: string) => (progressMap[r] ?? 0) >= 100)

  // Helper: find current skill + first incomplete lesson for a given track
  async function resolveCurrentSkill(trackId: string | null) {
    const trackSkills = skills
      .filter(s => s.track_id === trackId)
      .sort((a, b) => a.sort_order - b.sort_order)

    const skill = trackSkills.find(s => isUnlocked(s) && (progressMap[s.id] ?? 0) < 100)
      ?? trackSkills[0]
      ?? null

    if (!skill) return { skillId: null, lessonId: null }

    const { data: lessonsInSkill } = await supabase
      .from('lessons')
      .select('id, sort_order')
      .eq('skill_node_id', skill.id)
      .eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .order('sort_order')

    const { data: completedLessons } = await supabase
      .from('user_lesson_completions')
      .select('lesson_id')
      .eq('user_id', userId)

    const completedSet = new Set((completedLessons ?? []).map(c => c.lesson_id))
    const firstIncomplete = (lessonsInSkill ?? []).find(l => !completedSet.has(l.id))
    return {
      skillId: skill.id,
      lessonId: firstIncomplete?.id ?? lessonsInSkill?.[0]?.id ?? null,
    }
  }

  const { skillId: currentSkillId, lessonId: firstIncompleteLessonId } = await resolveCurrentSkill(currentTrackId)

  return (
    <SkillsClient
      userId={userId}
      tracks={tracks}
      initialTrackId={currentTrackId}
      skills={skills}
      skillProgress={skillProgress}
      lessonCountMap={lessonCountMap}
      language={profile?.preferred_language ?? 'en'}
      streak={progressRes.data?.streak ?? 0}
      gems={walletRes.data?.balance ?? 0}
      initialCurrentSkillId={currentSkillId}
      initialFirstIncompleteLessonId={firstIncompleteLessonId}
    />
  )
}