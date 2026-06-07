// lib/supabase/wallet.ts
// All wallet & shop queries — import these in API routes and components

import { createClient } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────
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

// ── Server-side queries ───────────────────────────────────────

/** Get wallet balance for a user (server) */
export async function getWallet(userId: string): Promise<Wallet | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

/** Get transaction history (server) */
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

/** Award coins via DB function (server) */
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

/** Award streak coins — call once per day on login */
export async function awardStreakCoins(userId: string): Promise<number> {
  return addCoins(userId, 1000, 'streak_login', '🔥 Daily streak bonus — 1,000 coins!')
}

/** Award XP-based coins: 100 coins per 1,000 XP */
export async function awardXPCoins(userId: string, xpEarned: number): Promise<void> {
  const coins = Math.floor(xpEarned / 1000) * 100
  if (coins <= 0) return
  await addCoins(
    userId, coins, 'xp_reward',
    `⚡ ${xpEarned.toLocaleString()} XP earned → ${coins} coins`,
  )
}

/** Get all active shop items */
export async function getShopItems(): Promise<ShopItem[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('coin_shop_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}

/** Get redemption history for a user */
export async function getRedemptions(userId: string): Promise<ShopRedemption[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('coin_shop_redemptions')
    .select('*, coin_shop_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

/** Redeem an item — calls spend_coins DB function */
export async function redeemItem(
  userId: string,
  item: ShopItem,
  shippingInfo?: Record<string, string>,
  notes?: string
): Promise<{ redemptionId: string; newBalance: number }> {
  const supabase = createClient()

  // Spend coins via DB function (atomic — checks balance and stock)
  const { data: newBalance, error: spendErr } = await supabase.rpc('spend_coins', {
    p_user_id: userId,
    p_amount: item.price_coins,
    p_item_id: item.id,
    p_description: `🛍️ Redeemed: ${item.name}`,
  })
  if (spendErr) throw spendErr

  // Create redemption record
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