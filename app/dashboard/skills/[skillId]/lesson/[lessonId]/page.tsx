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

  // Load skill node for context
  const { data: skill } = await supabase
    .from('skill_nodes')
    .select('id, title, emoji, xp_reward, track_id')
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
    .select('id, title, emoji, sort_order')
    .eq('skill_node_id', params.skillId)
    .eq('is_active', true)
    .contains('age_groups', [profile?.age_group ?? 'pro'])
    .order('sort_order')

  const currentIdx   = (siblings ?? []).findIndex((l: any) => l.id === params.lessonId)
  const prevLesson   = currentIdx > 0 ? siblings![currentIdx - 1] : null
  const nextLesson   = currentIdx < (siblings?.length ?? 0) - 1 ? siblings![currentIdx + 1] : null
  const totalLessons = siblings?.length ?? allLessons?.length ?? 1
  const lessonIndex  = currentIdx + 1 // 1-based

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
      language={profile?.preferred_language ?? 'en'}
      userName={profile?.display_name ?? 'Learner'}
      userAvatar={profile?.avatar ?? '🧑‍🚀'}
    />
  )
}
