// app/api/shop/redemptions/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('[redemptions] auth error:', authError.message)
      return NextResponse.json({ error: 'Auth error' }, { status: 401 })
    }
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data, error } = await supabase
      .from('shop_redemptions')
      .select('*, shop_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[redemptions] supabase error:', error.code, error.message, error.details)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ redemptions: data ?? [] })
  } catch (err: any) {
    console.error('[redemptions] unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 })
  }
}