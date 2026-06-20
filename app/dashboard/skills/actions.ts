// app/dashboard/skills/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setCurrentTrack(trackId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_progress')
    .update({ current_track: trackId })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/skills')
  return { success: true }
}