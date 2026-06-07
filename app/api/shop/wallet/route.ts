import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWallet, getTransactions } from '@/lib/supabase/wallet'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [wallet, transactions] = await Promise.all([
    getWallet(user.id),
    getTransactions(user.id),
  ])
  return NextResponse.json({ wallet, transactions })
}