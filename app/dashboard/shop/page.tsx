'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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

// ── Local image map — replace values with your real paths/URLs ──
const ITEM_IMAGES: Record<string, string> = {
  'Plulai Pro — 1 Month': '/images/shop/p1.png',
  'Your Book':             '/images/shop/p2.png',
  'Spotify — 1 Month':    '/images/shop/p3.png',
  'Netflix — 1 Month':    '/images/shop/p4.png',
  'MSI Gaming Bag':        '/images/shop/p5.png',
  'PC Accessory Bundle':   '/images/shop/p6.png',
}

function getItemImage(item: ShopItem): string {
  return item.image_url ?? ITEM_IMAGES[item.name] ?? '/images/shop/placeholder.png'
}

// ── Product Image component ───────────────────────────────────
function ItemImage({ item, size = 'card' }: { item: ShopItem; size?: 'card' | 'modal' | 'row' }) {
  const [errored, setErrored] = useState(false)
  const src = getItemImage(item)

  const dims = {
    card:  { w: 80,  h: 80,  cls: 'w-20 h-20 rounded-2xl' },
    modal: { w: 100, h: 100, cls: 'w-24 h-24 rounded-2xl' },
    row:   { w: 40,  h: 40,  cls: 'w-10 h-10 rounded-xl'  },
  }[size]

  if (errored) {
    return (
      <div
        className={`${dims.cls} flex items-center justify-center text-2xl flex-shrink-0`}
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {item.emoji}
      </div>
    )
  }

  return (
    <div className={`${dims.cls} overflow-hidden flex-shrink-0 relative`}
      style={{ background: 'rgba(255,255,255,0.06)' }}>
      <Image
        src={src}
        alt={item.name}
        width={dims.w}
        height={dims.h}
        className="w-full h-full object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  )
}

// ── Shipping Modal ────────────────────────────────────────────
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
  const valid = isPhysical ? form.name && form.address && form.city && form.phone : true

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: '#1a1a2e', border: '2px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center" style={{ borderBottom: '2px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-center mb-3">
            <ItemImage item={item} size="modal" />
          </div>
          <h3 className="font-black text-white text-lg">{item.name}</h3>
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full font-black text-sm"
            style={{ background: '#FFC800', color: '#1a1a2e' }}
          >
            🪙 {item.price_coins.toLocaleString()} coins
          </div>
        </div>

        <div className="p-6 space-y-3">
          {isPhysical && (
            <>
              <p className="text-xs font-black uppercase tracking-widest text-center mb-4"
                style={{ color: '#FFC800' }}>
                📦 Shipping info required
              </p>
              {[
                { key: 'name',    label: 'Full name',      placeholder: 'Your full name'      },
                { key: 'address', label: 'Address',         placeholder: 'Street address'      },
                { key: 'city',    label: 'City & country',  placeholder: 'Dubai, UAE'          },
                { key: 'phone',   label: 'WhatsApp',        placeholder: '+971 50 000 0000'    },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-black uppercase tracking-wider block mb-1"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {f.label}
                  </label>
                  <input
                    value={form[f.key as keyof typeof form]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '2px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              ))}
            </>
          )}

          <div>
            <label className="text-xs font-black uppercase tracking-wider block mb-1"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Note (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any special request..."
              rows={2}
              className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none resize-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const shipping = isPhysical
                  ? { name: form.name, address: form.address, city: form.city, phone: form.phone }
                  : {} as Record<string, string>
                onConfirm(shipping, form.notes)
              }}
              disabled={!valid}
              className="py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-30"
              style={{
                background: valid ? '#58CC02' : '#333',
                color: '#fff',
                boxShadow: valid ? '0 4px 0 #3d8f01' : 'none',
                flex: 2,
              }}
            >
              Confirm →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Success Modal ─────────────────────────────────────────────
function SuccessModal({ item, onClose }: { item: ShopItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <div
        className="w-full max-w-xs rounded-3xl p-8 text-center"
        style={{ background: '#1a1a2e', border: '2px solid rgba(88,204,2,0.3)' }}
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <ItemImage item={item} size="modal" />
            <span className="absolute -top-2 -right-2 text-2xl">🎉</span>
          </div>
        </div>
        <h3 className="font-black text-2xl mb-2" style={{ color: '#58CC02' }}>Redeemed!</h3>
        <p className="font-bold text-sm mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {item.name}
        </p>
        <p className="text-xs mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {item.category === 'physical'
            ? 'Ships to your address in 3–5 business days.'
            : 'Check your email within 24h for your code.'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-black text-white text-sm"
          style={{ background: '#58CC02', boxShadow: '0 4px 0 #3d8f01' }}
        >
          Back to Shop
        </button>
      </div>
    </div>
  )
}

// ── Coin Badge ────────────────────────────────────────────────
function CoinBadge({ amount, positive = true }: { amount: number; positive?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
      style={{
        background: positive ? 'rgba(255,200,0,0.12)' : 'rgba(255,75,75,0.12)',
        color: positive ? '#FFC800' : '#FF4B4B',
      }}
    >
      🪙 {positive ? '+' : '-'}{amount.toLocaleString()}
    </span>
  )
}

// ── Category styles ───────────────────────────────────────────
const catStyle: Record<string, { bg: string; color: string; label: string }> = {
  subscription: { bg: 'rgba(88,204,2,0.15)',  color: '#58CC02', label: '⚡ Sub'      },
  digital:      { bg: 'rgba(28,176,246,0.15)', color: '#1CB0F6', label: '📲 Digital'  },
  physical:     { bg: 'rgba(255,200,0,0.15)', color: '#FFC800', label: '📦 Physical' },
}

// ── Main Page ─────────────────────────────────────────────────
export default function ShopPage() {
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
    Promise.all([
      fetch('/api/shop/wallet').then(r => r.json()),
      fetch('/api/shop/items').then(r => r.json()),
      fetch('/api/shop/redemptions').then(r => r.json()),
    ]).then(([walletData, itemsData, redData]) => {
      setBalance(walletData.wallet?.balance ?? 0)
      setTotalEarned(walletData.wallet?.total_earned ?? 0)
      setTransactions(walletData.transactions ?? [])
      setItems(itemsData.items ?? [])
      setRedemptions(redData.redemptions ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
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
      fetch('/api/shop/redemptions').then(r => r.json()).then(d => setRedemptions(d.redemptions ?? []))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRedeeming(false)
    }
  }

  const filteredItems = items.filter(i => filter === 'all' || i.category === filter)

  const statusStyle: Record<string, { bg: string; color: string }> = {
    pending:   { bg: 'rgba(255,200,0,0.12)',   color: '#FFC800' },
    fulfilled: { bg: 'rgba(88,204,2,0.12)',    color: '#58CC02' },
    cancelled: { bg: 'rgba(255,75,75,0.12)',   color: '#FF4B4B' },
    refunded:  { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">🪙</div>
        <p className="font-black text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Loading your wallet…
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">

      {/* ── Wallet Hero ─────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 mb-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1CB0F6 0%, #0d7ab0 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            Your Wallet
          </p>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-5xl">🪙</span>
            <div>
              <div className="text-4xl font-black text-white leading-none">
                {balance?.toLocaleString() ?? '—'}
              </div>
              <div className="text-sm font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                coins available
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}>All-time earned</p>
              <p className="font-black text-white text-lg">🪙 {totalEarned.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}>Total spent</p>
              <p className="font-black text-white text-lg">
                🪙 {(totalEarned - (balance ?? 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Earn callouts ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(255,200,0,0.08)', border: '2px solid rgba(255,200,0,0.2)' }}>
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-black text-sm text-white">Daily Streak</p>
            <p className="font-black text-xs" style={{ color: '#FFC800' }}>+1,000 coins/day</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(88,204,2,0.08)', border: '2px solid rgba(88,204,2,0.2)' }}>
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-black text-sm text-white">XP Rewards</p>
            <p className="font-black text-xs" style={{ color: '#58CC02' }}>+100 per 1k XP</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-2xl mb-5"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        {(['shop', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
            style={{
              background: tab === t ? '#1CB0F6' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow: tab === t ? '0 2px 0 #0d7ab0' : 'none',
            }}>
            {t === 'shop' ? '🛍️ Shop' : '📜 My Orders'}
          </button>
        ))}
      </div>

      {/* ── SHOP TAB ─────────────────────────────────────── */}
      {tab === 'shop' && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {(['all', 'digital', 'subscription', 'physical'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-xs font-black transition-all"
                style={{
                  background: filter === f ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                  color: filter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: filter === f ? '2px solid rgba(255,255,255,0.25)' : '2px solid transparent',
                }}>
                {f === 'all' ? '✨ All'
                  : f === 'digital' ? '📲 Digital'
                  : f === 'subscription' ? '⚡ Subscription'
                  : '📦 Physical'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl font-bold text-sm"
              style={{ background: 'rgba(255,75,75,0.1)', border: '2px solid rgba(255,75,75,0.25)', color: '#FF4B4B' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map(item => {
              const canAfford = (balance ?? 0) >= item.price_coins
              const outOfStock = item.stock !== null && item.stock <= 0
              const cat = catStyle[item.category]

              return (
                <div key={item.id}
                  className="rounded-3xl overflow-hidden transition-all"
                  style={{
                    background: '#1a1a2e',
                    border: outOfStock
                      ? '2px solid rgba(255,255,255,0.05)'
                      : canAfford
                      ? '2px solid rgba(88,204,2,0.3)'
                      : '2px solid rgba(255,255,255,0.08)',
                    opacity: outOfStock ? 0.5 : 1,
                  }}
                >
                  {/* Product image — full width banner */}
                  <div className="relative w-full h-36 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <ItemImage item={item} size="card" />
                    {/* Category badge over image */}
                    <span
                      className="absolute top-2 left-2 text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ background: cat.bg, color: cat.color, backdropFilter: 'blur(8px)' }}>
                      {cat.label}
                    </span>
                    {item.stock !== null && (
                      <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)' }}>
                        {item.stock <= 0 ? '🚫 Sold out' : `${item.stock} left`}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-black text-white text-sm leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-xl"
                          style={{ color: canAfford ? '#FFC800' : 'rgba(255,255,255,0.3)' }}>
                          🪙 {item.price_coins.toLocaleString()}
                        </div>
                        {!canAfford && !outOfStock && (
                          <div className="text-xs font-bold mt-0.5" style={{ color: '#FF4B4B' }}>
                            Need {(item.price_coins - (balance ?? 0)).toLocaleString()} more
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setError(null); setSelectedItem(item) }}
                        disabled={!canAfford || outOfStock || redeeming}
                        className="px-5 py-2.5 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-30"
                        style={{
                          background: canAfford && !outOfStock ? '#58CC02' : 'rgba(255,255,255,0.08)',
                          boxShadow: canAfford && !outOfStock ? '0 4px 0 #3d8f01' : 'none',
                          color: canAfford && !outOfStock ? '#fff' : 'rgba(255,255,255,0.3)',
                        }}>
                        {outOfStock ? 'Sold out' : canAfford ? 'Redeem' : 'Need more 🪙'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}>My Redemptions</p>
            {redemptions.length === 0 ? (
              <div className="rounded-3xl p-10 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <div className="text-4xl mb-3">🛍️</div>
                <p className="font-black text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No redemptions yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Earn coins and spend them on cool stuff!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {redemptions.map(r => {
                  const st = statusStyle[r.status] ?? statusStyle.pending
                  return (
                    <div key={r.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.06)' }}>
                      {r.coin_shop_items && (
                        <ItemImage item={r.coin_shop_items} size="row" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-white truncate">
                          {r.coin_shop_items?.name ?? 'Item'}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <CoinBadge amount={r.coins_spent} positive={false} />
                        <span className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}>Coin History</p>
            {transactions.length === 0 ? (
              <div className="rounded-3xl p-8 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <p className="font-black text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Complete lessons to earn coins!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xl flex-shrink-0">
                      {tx.type === 'streak_login' ? '🔥'
                        : tx.type === 'xp_reward' ? '⚡'
                        : tx.type === 'purchase' ? '🛍️'
                        : '🪙'}
                    </span>
                    <p className="flex-1 text-sm font-bold truncate"
                      style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {tx.description ?? tx.type}
                    </p>
                    <CoinBadge amount={Math.abs(tx.amount)} positive={tx.amount > 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
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