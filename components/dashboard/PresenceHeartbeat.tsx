'use client'

import { useEffect } from 'react'
import { pingPresence } from '@/lib/supabase/queries'

export default function PresenceHeartbeat({ userId }: { userId: string }) {
  useEffect(() => {
    pingPresence(userId)
    const interval = setInterval(() => pingPresence(userId), 60_000)
    return () => clearInterval(interval)
  }, [userId])

  return null
}