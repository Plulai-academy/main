// app/dashboard/skills/[skillId]/lesson/[lessonId]/page.tsx — Server Component
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonViewClient from '@/components/dashboard/LessonViewClient'

interface Props {
  params: { skillId: string; lessonId: string }
}

export default async function LessonPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group, preferred_language, display_name, avatar')
    .eq('id', user.id)
    .single()

  // Load the lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.lessonId)
    .eq('skill_node_id', params.skillId)
    .single()

  if (!lesson) notFound()

  // Load skill node for context (sort_order is needed below to find the
  // next node in the same track once this node runs out of lessons)
  const { data: skill } = await supabase
    .from('skill_nodes')
    .select('id, title, emoji, xp_reward, track_id, sort_order')
    .eq('id', params.skillId)
    .single()

  // Check if already completed
  const { data: completion } = await supabase
    .from('user_lesson_completions')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', params.lessonId)
    .single()

  // Count total lessons in this skill for progress calculation
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('skill_node_id', params.skillId)
    .eq('is_active', true)

  // Load sibling lessons for next/prev navigation
const { data: siblings } = await supabase
    .from('lessons')
    .select('id, title, emoji, sort_order, xp_reward, duration_mins')
    .eq('skill_node_id', params.skillId)

// Real streak for the completion panel
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('streak')
    .eq('user_id', user.id)
    .single()

  // Has the user completed every available skill node for their age group?
 const { data: allNodes } = await supabase
    .from('skill_nodes')
    .select('id, track_id')
    .eq('is_active', true)
    .contains('age_groups', [profile?.age_group ?? 'pro'])

  const { data: completedNodes } = await supabase
    .from('user_skill_progress')
    .select('skill_node_id')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
// Fetch all active tracks for "what's next" suggestions
const { data: allTracks } = await supabase
  .from('tracks')
  .select('id, name, emoji, description')
  .eq('is_active', true)
  .order('sort_order')

// Find which track IDs the user hasn't completed a skill in yet
const completedTrackIds = new Set(
  (completedNodes ?? [])
    .map((n: any) => {
      // Match skill_node_id back to its track_id
      return allNodes?.find((sn: any) => sn.id === n.skill_node_id)?.track_id
    })
    .filter(Boolean)
)

const suggestedTracks = (allTracks ?? [])
  .filter((tr: any) => !completedTrackIds.has(tr.id))
  .slice(0, 3) // max 3 suggestions

  const finishedAllTracks =
    (allNodes?.length ?? 0) > 0 &&
    (completedNodes?.length ?? 0) >= (allNodes?.length ?? 0)
  const currentIdx   = (siblings ?? []).findIndex((l: any) => l.id === params.lessonId)
  const prevLesson   = currentIdx > 0 ? siblings![currentIdx - 1] : null
  const nextLesson   = currentIdx < (siblings?.length ?? 0) - 1 ? siblings![currentIdx + 1] : null
  const totalLessons = siblings?.length ?? allLessons?.length ?? 1
  const lessonIndex  = currentIdx + 1 // 1-based

  // ── Next skill node in this track ───────────────────────────
  // This is the piece that was missing: when the lesson the user just
  // finished is the LAST lesson in its skill node (nextLesson is null),
  // look up the next node in the same track (by sort_order) and its
  // first lesson, so the completion screen can link straight there
  // instead of falling through to "explore other tracks".
  let nextSkill: { id: string; lessonId: string; title: string; emoji: string } | null = null

  if (!nextLesson && skill) {
    const { data: nextNode } = await supabase
      .from('skill_nodes')
      .select('id, title, emoji, sort_order')
      .eq('track_id', skill.track_id)
      .eq('is_active', true)
      .contains('age_groups', [profile?.age_group ?? 'pro'])
      .gt('sort_order', skill.sort_order)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single()

    if (nextNode) {
      const { data: firstLessonOfNextNode } = await supabase
        .from('lessons')
        .select('id')
        .eq('skill_node_id', nextNode.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single()

      if (firstLessonOfNextNode) {
        nextSkill = {
          id: nextNode.id,
          lessonId: firstLessonOfNextNode.id,
          title: nextNode.title,
          emoji: nextNode.emoji,
        }
      }
    }
  }

  return (
    <LessonViewClient
      userId={user.id}
      lesson={lesson}
      skill={skill}
      completion={completion ?? null}
      totalLessons={totalLessons}
      lessonIndex={lessonIndex}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      nextSkill={nextSkill}
      language={profile?.preferred_language ?? 'en'}
      userName={profile?.display_name ?? 'Learner'}
      userAvatar={profile?.avatar ?? '🧑‍🚀'}
      streak={progressData?.streak ?? 0}
      finishedAllTracks={finishedAllTracks}
      suggestedTracks={suggestedTracks}
    />
    
  )
}