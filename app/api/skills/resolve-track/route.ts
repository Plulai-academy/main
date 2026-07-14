// app/api/path/resolve-track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { trackId } = await req.json()
  if (!trackId) return NextResponse.json({ error: 'Missing trackId' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_group')
    .eq('id', user.id)
    .single()

  const { data: trackSkills } = await supabase
    .from('skill_nodes')
    .select('id, sort_order, required_nodes')
    .eq('track_id', trackId)
    .eq('is_active', true)
    .contains('age_groups', [profile?.age_group ?? 'pro'])
    .order('sort_order')

  const { data: skillProgress } = await supabase
    .from('user_skill_progress')
    .select('skill_node_id, progress_pct')
    .eq('user_id', user.id)

  const progressMap: Record<string, number> = Object.fromEntries(
    (skillProgress ?? []).map(p => [p.skill_node_id, p.progress_pct])
  )

  const isUnlocked = (skill: any) =>
    !skill.required_nodes?.length ||
    skill.required_nodes.every((r: string) => (progressMap[r] ?? 0) >= 100)

  const skill = (trackSkills ?? []).find(s => isUnlocked(s) && (progressMap[s.id] ?? 0) < 100)
    ?? trackSkills?.[0]
    ?? null

  if (!skill) {
    return NextResponse.json({ skillId: null, lessonId: null })
  }

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
    .eq('user_id', user.id)

  const completedSet = new Set((completedLessons ?? []).map(c => c.lesson_id))
  const firstIncomplete = (lessonsInSkill ?? []).find(l => !completedSet.has(l.id))

  return NextResponse.json({
    skillId: skill.id,
    lessonId: firstIncomplete?.id ?? lessonsInSkill?.[0]?.id ?? null,
  })
}