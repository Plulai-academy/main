'use client'
// app/dashboard/shop/page.tsx

import { useState, useEffect, useTransition } from 'react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────
interface ShopItem {
  id: string; name: string; description: string; emoji: string
  category: 'digital' | 'physical' | 'subscription'
  price_coins: number; stock: number | null; is_active: boolean
}
interface Transaction {
  id: string; amount: number; type: string; description: string; created_at: string
}
interface Redemption {
  id: string; item_id: string; coins_spent: number; status: string
  created_at: string; coin_shop_items?: ShopItem
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{item.emoji}</span>
          <div>
            <h3 className="font-extrabold text-lg leading-tight">{item.name}</h3>
            <p className="text-muted text-sm font-semibold">🪙 {item.price_coins.toLocaleString()} coins</p>
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
                <label className="text-xs font-bold text-muted mb-1 block">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/25 outline-none focus:border-accent5/50 transition-all"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mb-5">
          <label className="text-xs font-bold text-muted mb-1 block">
            Note to Plulai (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any special request..."
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/25 outline-none focus:border-accent5/50 transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm border border-white/10 text-muted hover:text-white hover:border-white/25 transition-all"
          >
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
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-accent3/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="text-6xl mb-4">{item.emoji}</div>
        <h3 className="font-extrabold text-2xl text-accent3 mb-2">Redeemed! 🎉</h3>
        <p className="text-muted font-semibold text-sm mb-2">
          <strong className="text-white">{item.name}</strong> has been requested.
        </p>
        <p className="text-muted text-xs mb-6 leading-relaxed">
          {item.category === 'physical'
            ? "We'll ship to your address within 3-5 business days. Check your email for confirmation."
            : 'Check your email within 24h. We\'ll send your code or activate your account.'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent3 to-accent4 text-white hover:-translate-y-0.5 transition-all"
        >
          Back to Shop
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

  // Modals
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [successItem, setSuccessItem]   = useState<ShopItem | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [redeeming, setRedeeming]       = useState(false)

  // Load data — Promise.allSettled so a single 500 can't crash the whole page
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
    setRedeeming(true)
    setError(null)
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
      // Refresh redemptions
      fetch('/api/shop/redemptions')
        .then(r => r.json())
        .then(d => setRedemptions(d.redemptions ?? []))
        .catch(() => {/* silently skip if refresh fails */})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRedeeming(false)
    }
  }

  const filteredItems = items.filter(i =>
    filter === 'all' ? true : i.category === filter
  )

  const categoryLabel: Record<string, string> = {
    digital: '⚡ Digital', physical: '📦 Physical', subscription: '🔄 Subscription',
  }
  const statusColor: Record<string, string> = {
    pending:   'text-amber-400 bg-amber-400/10 border-amber-400/25',
    fulfilled: 'text-accent3 bg-accent3/10 border-accent3/25',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/25',
    refunded:  'text-muted bg-white/5 border-white/10',
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="text-4xl animate-bounce">🪙</div>
        <p className="text-muted font-bold text-sm">Loading your wallet…</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl w-full mx-auto">

      {/* ── Wallet Card ─────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#2B70C9] to-[#0f2d6e] rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10">
          <p className="text-xs font-extrabold text-white/50 uppercase tracking-widest mb-1">Your Wallet</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-extrabold text-white leading-none">
              {balance?.toLocaleString() ?? '—'}
            </span>
            <span className="text-2xl mb-1">🪙</span>
            <span className="text-white/50 font-bold text-sm mb-1">coins</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-white/50 text-xs font-semibold">All-time earned</p>
              <p className="text-white font-extrabold">🪙 {totalEarned.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-white/50 text-xs font-semibold">Spent</p>
              <p className="text-white font-extrabold">
                🪙 {(totalEarned - (balance ?? 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── How to earn ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-extrabold text-sm">Daily Streak</p>
            <p className="text-amber-400 font-extrabold text-xs">+1,000 coins</p>
            <p className="text-muted text-xs">Every day you log in</p>
          </div>
        </div>
        <div className="bg-card border border-accent5/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-extrabold text-sm">XP Rewards</p>
            <p className="text-accent5 font-extrabold text-xs">+100 per 1,000 XP</p>
            <p className="text-muted text-xs">Keep completing lessons</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {(['shop', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('px-5 py-2 rounded-xl font-extrabold text-sm transition-all',
              tab === t
                ? 'bg-gradient-to-r from-accent5 to-accent1 text-white'
                : 'bg-card border border-white/8 text-muted hover:text-white'
            )}
          >
            {t === 'shop' ? '🛍️ Shop' : '📜 My Orders'}
          </button>
        ))}
      </div>

      {/* ── SHOP TAB ─────────────────────────────────────────── */}
      {tab === 'shop' && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {(['all', 'digital', 'subscription', 'physical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border',
                  filter === f
                    ? 'bg-white/15 text-white border-white/25'
                    : 'bg-card border-white/8 text-muted hover:text-white hover:border-white/20'
                )}
              >
                {f === 'all' ? '✨ All' : categoryLabel[f]}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
              <p className="text-red-400 font-bold text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="bg-card border border-white/8 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">🛍️</p>
              <p className="text-muted font-semibold text-sm">No items available right now. Check back soon!</p>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => {
              const canAfford  = (balance ?? 0) >= item.price_coins
              const outOfStock = item.stock !== null && item.stock <= 0
              return (
                <div
                  key={item.id}
                  className={cn(
                    'bg-card border rounded-2xl overflow-hidden transition-all',
                    outOfStock
                      ? 'border-white/5 opacity-60'
                      : canAfford
                      ? 'border-accent5/25 hover:border-accent5/50 hover:shadow-lg hover:shadow-accent5/10 hover:-translate-y-0.5'
                      : 'border-white/8 hover:border-white/15'
                  )}
                >
                  {/* Category badge */}
                  <div className="px-4 pt-4 pb-0 flex items-center justify-between">
                    <span className={cn(
                      'text-xs font-extrabold px-2.5 py-1 rounded-full border',
                      item.category === 'subscription' ? 'bg-accent5/15 text-accent5 border-accent5/25'
                      : item.category === 'digital'    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                    )}>
                      {categoryLabel[item.category]}
                    </span>
                    {item.stock !== null && (
                      <span className="text-xs text-muted font-semibold">
                        {item.stock <= 0 ? '🚫 Out of stock' : `${item.stock} left`}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl leading-none">{item.emoji}</span>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight mb-1">{item.name}</h3>
                        <p className="text-muted text-xs font-semibold leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-muted font-semibold mb-0.5">Price</p>
                        <p className={cn('font-extrabold text-xl', canAfford ? 'text-accent2' : 'text-muted')}>
                          🪙 {item.price_coins.toLocaleString()}
                        </p>
                        {!canAfford && !outOfStock && (
                          <p className="text-xs text-red-400/70 font-semibold mt-0.5">
                            Need {(item.price_coins - (balance ?? 0)).toLocaleString()} more
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => { setError(null); setSelectedItem(item) }}
                        disabled={!canAfford || outOfStock || redeeming}
                        className={cn(
                          'px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all',
                          canAfford && !outOfStock
                            ? 'bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-lg shadow-accent5/20'
                            : 'bg-white/5 text-muted/50 cursor-not-allowed'
                        )}
                      >
                        {outOfStock ? 'Out of stock' : canAfford ? 'Redeem →' : 'Not enough 🪙'}
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
            <p className="text-xs font-extrabold text-muted uppercase tracking-wider mb-3">
              🛍️ Redemptions
            </p>
            {redemptions.length === 0 ? (
              <div className="bg-card border border-white/8 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-2">🛍️</p>
                <p className="text-muted font-semibold text-sm">No redemptions yet. Spend those coins!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map(r => (
                  <div key={r.id} className="bg-card border border-white/8 rounded-2xl p-4 flex items-center gap-4">
                    <span className="text-3xl">{r.coin_shop_items?.emoji ?? '🎁'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm truncate">{r.coin_shop_items?.name ?? 'Item'}</p>
                      <p className="text-muted text-xs font-semibold">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="font-extrabold text-red-400 text-sm">
                        -🪙 {(r.coins_spent ?? 0).toLocaleString()}
                      </span>
                      <span className={cn('text-xs font-extrabold px-2 py-0.5 rounded-full border', statusColor[r.status] ?? statusColor.pending)}>
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
            <p className="text-xs font-extrabold text-muted uppercase tracking-wider mb-3">
              📋 Coin History
            </p>
            {transactions.length === 0 ? (
              <div className="bg-card border border-white/8 rounded-2xl p-6 text-center">
                <p className="text-muted font-semibold text-sm">No transactions yet. Complete lessons to earn coins!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-card border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">
                      {tx.type === 'streak_login' ? '🔥' : tx.type === 'xp_reward' ? '⚡' : tx.type === 'purchase' ? '🛍️' : '🪙'}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-muted truncate">
                      {tx.description ?? tx.type}
                    </p>
                    <p className={cn('font-extrabold text-sm flex-shrink-0', tx.amount > 0 ? 'text-accent3' : 'text-red-400')}>
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
        <SuccessModal
          item={successItem}
          onClose={() => setSuccessItem(null)}
        />
      )}
    </div>
  )
}