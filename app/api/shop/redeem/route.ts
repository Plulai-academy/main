import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redeemItem, getShopItems } from '@/lib/supabase/wallet'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, shippingInfo, notes } = await req.json()
  if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })

  const items = await getShopItems()
  const item = items.find(i => i.id === itemId)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  try {
    const { redemptionId, newBalance } = await redeemItem(user.id, item, shippingInfo, notes)
    return NextResponse.json({ redemptionId, newBalance })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}