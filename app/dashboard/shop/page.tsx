'use client'
// app/dashboard/shop/page.tsx

import { useState, useEffect, useTransition } from 'react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────
interface ShopItem {
  id: string; name: string; description: string; emoji: string
  category: 'digital' | 'physical' | 'subscription'
  price_coins: number; stock: number | null; is_active: boolean
  image_url: string | null
}
interface Transaction {
  id: string; amount: number; type: string; description: string; created_at: string
}
interface Redemption {
  id: string; item_id: string; coins_spent: number; status: string
  created_at: string; coin_shop_items?: ShopItem
}

// ── Normalise image path (fixes Windows backslashes from DB) ──
function normaliseImageUrl(url: string | null): string | null {
  if (!url) return null
  // Already an absolute URL — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // Convert backslashes to forward slashes and ensure leading slash
  return '/' + url.replace(/\\/g, '/')
}

// ── Item image component ──────────────────────────────────────
function ItemImage({ item, className }: { item: ShopItem; className?: string }) {
  const [imgError, setImgError] = useState(false)
  const src = normaliseImageUrl(item.image_url)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={item.name}
        onError={() => setImgError(true)}
        className={cn('object-contain', className)}
      />
    )
  }
  // Fallback to emoji
  return (
    <div className={cn('flex items-center justify-center text-5xl', className)}>
      {item.emoji}
    </div>
  )
}

// ── Shipping form modal ───────────────────────────────────────
function ShippingModal({
  item, onConfirm, onClose,
}: {
  item: ShopItem
  onConfirm: (shipping: Record<string, string>, notes: string) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', notes: '' })
  const isPhysical = item.category === 'physical'

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const valid = isPhysical
    ? form.name && form.address && form.city && form.phone
    : true

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0f1117] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        {/* Item preview */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <ItemImage item={item} className="w-full h-full" />
          </div>
          <div>
            <h3 className="font-extrabold text-base leading-tight">{item.name}</h3>
            <p className="text-[#1CB0F6] text-sm font-extrabold mt-1">🪙 {item.price_coins.toLocaleString()} coins</p>
          </div>
        </div>

        {isPhysical && (
          <div className="space-y-3 mb-4">
            <p className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-3">
              📦 Shipping information required
            </p>
            {[
              { key: 'name',    label: 'Full name',        placeholder: 'Your full name' },
              { key: 'address', label: 'Address',          placeholder: 'Street address' },
              { key: 'city',    label: 'City & country',   placeholder: 'Dubai, UAE' },
              { key: 'phone',   label: 'WhatsApp number',  placeholder: '+971 50 000 0000' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-white/40 mb-1 block">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-[#1CB0F6]/50 focus:bg-[#1CB0F6]/5 transition-all"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mb-5">
          <label className="text-xs font-bold text-white/40 mb-1 block">Note to Plulai (optional)</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any special request..."
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-[#1CB0F6]/50 transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all">
            Cancel
          </button>
          <button
            onClick={() => {
              const shipping: Record<string, string> = isPhysical
                ? { name: form.name, address: form.address, city: form.city, phone: form.phone }
                : {}
              onConfirm(shipping, form.notes)
            }}
            disabled={!valid}
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1CB0F6]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            Confirm Redemption →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Success modal ─────────────────────────────────────────────
function SuccessModal({ item, onClose }: { item: ShopItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0f1117] border border-green-500/20 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
          <ItemImage item={item} className="w-full h-full" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-extrabold text-green-400 uppercase tracking-wider">Redeemed!</span>
        </div>
        <h3 className="font-extrabold text-xl mb-2">{item.name}</h3>
        <p className="text-white/40 font-semibold text-sm mb-6 leading-relaxed">
          {item.category === 'physical'
            ? "We'll ship to your address within 3–5 business days. Check your email!"
            : 'Check your email within 24h for your code or account activation.'}
        </p>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:-translate-y-0.5 transition-all">
          Back to Shop 🛍️
        </button>
      </div>
    </div>
  )
}

// ── Main shop page ─────────────────────────────────────────────
export default function ShopPage() {
  const [, startTransition] = useTransition()

  const [balance, setBalance]           = useState<number | null>(null)
  const [totalEarned, setTotalEarned]   = useState(0)
  const [items, setItems]               = useState<ShopItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [redemptions, setRedemptions]   = useState<Redemption[]>([])
  const [loading, setLoading]           = useState(true)
  const [tab, setTab]                   = useState<'shop' | 'history'>('shop')
  const [filter, setFilter]             = useState<'all' | 'digital' | 'physical' | 'subscription'>('all')

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [successItem, setSuccessItem]   = useState<ShopItem | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [redeeming, setRedeeming]       = useState(false)

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/shop/wallet').then(r => r.json()),
      fetch('/api/shop/items').then(r => r.json()),
      fetch('/api/shop/redemptions').then(r => r.json()),
    ]).then(([walletRes, itemsRes, redRes]) => {
      const walletData = walletRes.status === 'fulfilled' ? walletRes.value : {}
      const itemsData  = itemsRes.status  === 'fulfilled' ? itemsRes.value  : {}
      const redData    = redRes.status    === 'fulfilled' ? redRes.value    : {}
      setBalance(walletData.wallet?.balance ?? 0)
      setTotalEarned(walletData.wallet?.total_earned ?? 0)
      setTransactions(walletData.transactions ?? [])
      setItems(itemsData.items ?? [])
      setRedemptions(redData.redemptions ?? [])
      setLoading(false)
    })
  }, [])

  const handleRedeem = async (shipping: Record<string, string>, notes: string) => {
    if (!selectedItem) return
    setRedeeming(true); setError(null)
    try {
      const res = await fetch('/api/shop/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedItem.id, shippingInfo: shipping, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setBalance(data.newBalance)
      setSuccessItem(selectedItem)
      setSelectedItem(null)
      fetch('/api/shop/redemptions').then(r => r.json()).then(d => setRedemptions(d.redemptions ?? [])).catch(() => {})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRedeeming(false)
    }
  }

  const filteredItems = items.filter(i => filter === 'all' ? true : i.category === filter)

  const categoryMeta: Record<string, { label: string; color: string; bg: string; border: string }> = {
    digital:      { label: '⚡ Digital',      color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
    physical:     { label: '📦 Physical',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    subscription: { label: '🔄 Subscription', color: 'text-[#1CB0F6]',  bg: 'bg-[#1CB0F6]/10',  border: 'border-[#1CB0F6]/20' },
  }

  const statusColor: Record<string, string> = {
    pending:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
    fulfilled: 'text-green-400 bg-green-400/10 border-green-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
    refunded:  'text-white/30 bg-white/5 border-white/10',
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 flex items-center justify-center">
          <span className="text-2xl animate-bounce">🪙</span>
        </div>
        <p className="text-white/30 font-bold text-sm tracking-wide">Loading your wallet…</p>
      </div>
    </div>
  )

  const spent = totalEarned - (balance ?? 0)
  const spentPct = totalEarned > 0 ? Math.round((spent / totalEarned) * 100) : 0

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl w-full mx-auto">

      {/* ── Wallet Card ─────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-6">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a6b] via-[#0f2040] to-[#070d1a]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1CB0F6]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2B70C9]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <p className="text-xs font-extrabold text-white/30 uppercase tracking-widest mb-3">Plulai Wallet</p>
              <div className="flex items-end gap-3 mb-5">
                <span className="text-5xl sm:text-6xl font-extrabold text-white leading-none tabular-nums">
                  {(balance ?? 0).toLocaleString()}
                </span>
                <div className="mb-1">
                  <span className="text-2xl">🪙</span>
                  <p className="text-white/30 font-bold text-xs">coins</p>
                </div>
              </div>

              {/* Spend bar */}
              <div className="w-full sm:w-72">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-white/30">Spent</span>
                  <span className="text-xs font-bold text-white/30">{spentPct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] rounded-full transition-all duration-700"
                    style={{ width: `${spentPct}%` }} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-3">
              <div className="flex-1 sm:flex-none bg-white/5 border border-white/8 rounded-2xl px-4 sm:px-5 py-3">
                <p className="text-white/30 text-xs font-semibold mb-1">Total earned</p>
                <p className="text-white font-extrabold text-lg">🪙 {totalEarned.toLocaleString()}</p>
              </div>
              <div className="flex-1 sm:flex-none bg-white/5 border border-white/8 rounded-2xl px-4 sm:px-5 py-3">
                <p className="text-white/30 text-xs font-semibold mb-1">Spent</p>
                <p className="text-white font-extrabold text-lg">🪙 {spent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How to earn ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0f1117] border border-amber-500/15 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <p className="font-extrabold text-sm">Daily Streak</p>
            <p className="text-amber-400 font-extrabold text-xs">+1,000 coins/day</p>
          </div>
        </div>
        <div className="bg-[#0f1117] border border-[#1CB0F6]/15 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1CB0F6]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <p className="font-extrabold text-sm">XP Rewards</p>
            <p className="text-[#1CB0F6] font-extrabold text-xs">+100 per 1,000 XP</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 p-1 bg-white/3 border border-white/8 rounded-2xl w-fit">
        {(['shop', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-5 py-2 rounded-xl font-extrabold text-sm transition-all',
              tab === t
                ? 'bg-[#1CB0F6] text-white shadow-lg shadow-[#1CB0F6]/20'
                : 'text-white/30 hover:text-white'
            )}>
            {t === 'shop' ? '🛍️ Shop' : '📜 My Orders'}
          </button>
        ))}
      </div>

      {/* ── SHOP TAB ─────────────────────────────────────────── */}
      {tab === 'shop' && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-6">
            {(['all', 'digital', 'subscription', 'physical'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border',
                  filter === f
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-transparent border-white/8 text-white/30 hover:text-white hover:border-white/15'
                )}>
                {f === 'all' ? '✨ All' : categoryMeta[f].label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20">
              <p className="text-red-400 font-bold text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">🛍️</p>
              <p className="text-white/30 font-semibold text-sm">No items available right now.</p>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const canAfford  = (balance ?? 0) >= item.price_coins
              const outOfStock = item.stock !== null && item.stock <= 0
              const meta       = categoryMeta[item.category]
              return (
                <div key={item.id}
                  className={cn(
                    'group bg-[#0f1117] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col',
                    outOfStock
                      ? 'border-white/5 opacity-50'
                      : canAfford
                      ? 'border-white/10 hover:border-[#1CB0F6]/40 hover:shadow-xl hover:shadow-[#1CB0F6]/8 hover:-translate-y-1'
                      : 'border-white/8 hover:border-white/15'
                  )}>

                  {/* Product image area */}
                  <div className="relative bg-white/3 h-44 overflow-hidden flex items-center justify-center">
                    {/* Category badge */}
                    <div className={cn('absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-extrabold z-10', meta.bg, meta.border, meta.color)}>
                      {meta.label}
                    </div>

                    {/* Stock badge */}
                    {item.stock !== null && (
                      <div className="absolute top-3 right-3 z-10">
                        {item.stock <= 0
                          ? <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold">Sold out</span>
                          : <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-bold">{item.stock} left</span>
                        }
                      </div>
                    )}

                    {/* Image or emoji via shared component */}
                    <ItemImage
                      item={item}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-extrabold text-sm leading-tight mb-1">{item.name}</h3>
                    <p className="text-white/30 text-xs font-semibold leading-relaxed mb-4 flex-1">{item.description}</p>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-white/5">
                      <div>
                        <p className={cn('font-extrabold text-lg leading-none', canAfford ? 'text-[#1CB0F6]' : 'text-white/30')}>
                          🪙 {item.price_coins.toLocaleString()}
                        </p>
                        {!canAfford && !outOfStock && (
                          <p className="text-xs text-red-400/60 font-semibold mt-1">
                            Need {(item.price_coins - (balance ?? 0)).toLocaleString()} more
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => { setError(null); setSelectedItem(item) }}
                        disabled={!canAfford || outOfStock || redeeming}
                        className={cn(
                          'px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex-shrink-0',
                          canAfford && !outOfStock
                            ? 'bg-[#1CB0F6] text-white hover:bg-[#14D4F4] hover:shadow-lg hover:shadow-[#1CB0F6]/25 hover:-translate-y-0.5'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        )}>
                        {outOfStock ? 'Sold out' : canAfford ? 'Redeem →' : 'Need more 🪙'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-6">
          {/* Redemptions */}
          <div>
            <p className="text-xs font-extrabold text-white/20 uppercase tracking-widest mb-3">🛍️ Redemptions</p>
            {redemptions.length === 0 ? (
              <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-10 text-center">
                <p className="text-4xl mb-3">🛍️</p>
                <p className="text-white/30 font-semibold text-sm">No redemptions yet. Spend those coins!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map(r => (
                  <div key={r.id} className="bg-[#0f1117] border border-white/8 rounded-2xl p-4 flex items-center gap-4">
                    {/* Item image */}
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {r.coin_shop_items ? (
                        <ItemImage item={r.coin_shop_items} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-2xl">🎁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm truncate">{r.coin_shop_items?.name ?? 'Item'}</p>
                      <p className="text-white/30 text-xs font-semibold">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className="font-extrabold text-red-400 text-sm">-🪙 {(r.coins_spent ?? 0).toLocaleString()}</span>
                      <span className={cn('text-xs font-extrabold px-2.5 py-0.5 rounded-full border', statusColor[r.status] ?? statusColor.pending)}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction history */}
          <div>
            <p className="text-xs font-extrabold text-white/20 uppercase tracking-widest mb-3">📋 Coin History</p>
            {transactions.length === 0 ? (
              <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-6 text-center">
                <p className="text-white/30 font-semibold text-sm">No transactions yet. Complete lessons to earn coins!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-[#0f1117] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">
                        {tx.type === 'streak_login' ? '🔥' : tx.type === 'xp_reward' ? '⚡' : tx.type === 'purchase' ? '🛍️' : '🪙'}
                      </span>
                    </div>
                    <p className="flex-1 text-sm font-semibold text-white/40 truncate">{tx.description ?? tx.type}</p>
                    <p className={cn('font-extrabold text-sm flex-shrink-0', tx.amount > 0 ? 'text-green-400' : 'text-red-400')}>
                      {tx.amount > 0 ? '+' : ''}{(tx.amount ?? 0).toLocaleString()} 🪙
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      {selectedItem && (
        <ShippingModal
          item={selectedItem}
          onConfirm={handleRedeem}
          onClose={() => { setSelectedItem(null); setError(null) }}
        />
      )}
      {successItem && (
        <SuccessModal item={successItem} onClose={() => setSuccessItem(null)} />
      )}
    </div>
  )
}