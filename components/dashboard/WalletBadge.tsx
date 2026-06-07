// components/dashboard/WalletBadge.tsx
// Drop this in your sidebar/navbar to show live coin balance
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WalletBadge() {
  const [balance, setBalance] = useState<number | null>(null)
  const [flash, setFlash]     = useState(false)

  useEffect(() => {
    fetch('/api/shop/wallet')
      .then(r => r.json())
      .then(d => setBalance(d.wallet?.balance ?? 0))
  }, [])

  // Listen for coin updates from lesson completions
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setBalance(b => (b ?? 0) + e.detail.coins)
      setFlash(true)
      setTimeout(() => setFlash(false), 1500)
    }
    window.addEventListener('plulai:coins_earned', handler as EventListener)
    return () => window.removeEventListener('plulai:coins_earned', handler as EventListener)
  }, [])

  if (balance === null) return null

  return (
    <Link href="/dashboard/shop"
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-extrabold text-sm
        transition-all duration-300
        ${flash
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 scale-110'
          : 'bg-white/5 border-white/10 text-muted hover:text-white hover:border-white/25'}
      `}>
      <span className="text-base">🪙</span>
      <span className="tabular-nums">{balance.toLocaleString()}</span>
    </Link>
  )
}