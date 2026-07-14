'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setCurrentTrack(trackId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(
      { user_id: user.id, current_track: trackId },
      { onConflict: 'user_id' }
    )
    .select('current_track')
    .single()

  if (error) {
    console.error('setCurrentTrack failed:', error.message)
    return { error: error.message }
  }

  // Defensive check: confirm the write actually landed.
  // If RLS quietly filtered the row instead of throwing, data.current_track
  // would not match what we just tried to save.
  if (data?.current_track !== trackId) {
    console.error('setCurrentTrack: write did not persist as expected', { trackId, returned: data })
    return { error: 'Track save did not persist' }
  }

  revalidatePath('/dashboard/path')
  return { success: true }
}