import { createClient } from '@/lib/supabase/server'

export interface Wallet {
  id: string
  user_id: string
  balance: number
  total_earned: number
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number
  type: 'streak_login' | 'xp_reward' | 'purchase' | 'admin_grant' | 'refund'
  description: string | null
  reference_id: string | null
  created_at: string
}

export interface ShopItem {
  id: string
  name: string
  description: string | null
  emoji: string
  category: 'digital' | 'physical' | 'subscription'
  price_coins: number
  stock: number | null
  is_active: boolean
  sort_order: number
  image_url: string | null
}

export interface ShopRedemption {
  id: string
  user_id: string
  item_id: string
  coins_spent: number
  status: 'pending' | 'fulfilled' | 'cancelled' | 'refunded'
  shipping_info: Record<string, string> | null
  notes: string | null
  admin_notes: string | null
  fulfilled_at: string | null
  created_at: string
  coin_shop_items?: ShopItem
}

export async function getWallet(userId: string): Promise<Wallet | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function getTransactions(userId: string, limit = 20): Promise<WalletTransaction[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function addCoins(
  userId: string,
  amount: number,
  type: WalletTransaction['type'],
  description: string,
  referenceId?: string
): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('add_coins', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description,
    p_reference: referenceId ?? null,
  })
  if (error) throw error
  return data as number
}

export async function awardStreakCoins(userId: string): Promise<number> {
  return addCoins(userId, 1000, 'streak_login', '🔥 Daily streak bonus — 1,000 coins!')
}

export async function awardXPCoins(userId: string, xpEarned: number): Promise<void> {
  const coins = Math.floor(xpEarned / 1000) * 100
  if (coins <= 0) return
  await addCoins(
    userId, coins, 'xp_reward',
    `⚡ ${xpEarned.toLocaleString()} XP earned → ${coins} coins`,
  )
}

export async function getShopItems(): Promise<ShopItem[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('coin_shop_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}

export async function getRedemptions(userId: string): Promise<ShopRedemption[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('coin_shop_redemptions')
    .select('*, coin_shop_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function redeemItem(
  userId: string,
  item: ShopItem,
  shippingInfo?: Record<string, string>,
  notes?: string
): Promise<{ redemptionId: string; newBalance: number }> {
  const supabase = createClient()

  const { data: newBalance, error: spendErr } = await supabase.rpc('spend_coins', {
    p_user_id: userId,
    p_amount: item.price_coins,
    p_item_id: item.id,
    p_description: `🛍️ Redeemed: ${item.name}`,
  })
  if (spendErr) throw spendErr

  const { data: redemption, error: redErr } = await supabase
    .from('coin_shop_redemptions')
    .insert({
      user_id: userId,
      item_id: item.id,
      coins_spent: item.price_coins,
      shipping_info: shippingInfo ?? null,
      notes: notes ?? null,
    })
    .select()
    .single()
  if (redErr) throw redErr

  return { redemptionId: redemption.id, newBalance: newBalance as number }
}