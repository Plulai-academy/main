'use client'
// components/dashboard/StreakClient.tsx
// Streak management page: current streak, freeze tokens, XP shop, history
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { purchaseShopItem } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

// ── i18n ──────────────────────────────────────────────────────
const UI: Record<string, Record<string, string>> = {
  en: {
    title:        'Streak & Freeze',
    subtitle:     'Protect your learning streak with freeze tokens',
    currentStreak: 'Current Streak',
    bestStreak:   'Best Streak',
    freezeTokens: 'Freeze Tokens',
    days:         'days',
    tokens:       'tokens',
    howItWorks:   'How Freeze Works',
    hw1:          'If you miss a day, a freeze token is used automatically to protect your streak.',
    hw2:          'No freeze tokens? Streak resets to 1. Keep tokens as backup!',
    hw3:          'Earn free tokens by reaching 7-day and 30-day streaks.',
    shop:         'XP Shop',
    shopSub:      'Spend XP to buy streak protection and power-ups',
    buy:          'Buy',
    notEnough:    'Need more XP',
    buying:       'Buying...',
    bought:       '✅ Purchased!',
    history:      'Freeze History',
    historyEmpty: 'No freezes used yet — keep that streak alive! 🔥',
    protected:    'Protected streak of',
    xpCost:       'XP',
    youHave:      'You have',
    xpBalance:    'XP to spend',
    milestones:   'Streak Milestones',
    milestoneSub: 'Reach these to earn free freeze tokens',
    calendar:     'Last 30 Days',
    calendarSub:  'Your daily learning activity',
    active:       'Active',
    frozen:       'Frozen',
    missed:       'Missed',
  },
  ar: {
    title:        'السلسلة والتجميد',
    subtitle:     'احمِ سلسلتك التعليمية برموز التجميد',
    currentStreak: 'السلسلة الحالية',
    bestStreak:   'أفضل سلسلة',
    freezeTokens: 'رموز التجميد',
    days:         'أيام',
    tokens:       'رموز',
    howItWorks:   'كيف يعمل التجميد',
    hw1:          'إذا غبت يوماً، يُستخدم رمز تجميد تلقائياً لحماية سلسلتك.',
    hw2:          'بدون رموز تجميد؟ تعود السلسلة إلى 1. احتفظ بالرموز احتياطياً!',
    hw3:          'اكسب رموزاً مجانية بالوصول إلى سلاسل 7 و30 يوماً.',
    shop:         'متجر XP',
    shopSub:      'أنفق XP لشراء الحماية والمميزات',
    buy:          'شراء',
    notEnough:    'تحتاج XP أكثر',
    buying:       'جارٍ الشراء...',
    bought:       '✅ تم الشراء!',
    history:      'سجل التجميد',
    historyEmpty: 'لم تستخدم أي رموز بعد — حافظ على سلسلتك! 🔥',
    protected:    'سلسلة محمية عند',
    xpCost:       'XP',
    youHave:      'لديك',
    xpBalance:    'XP للإنفاق',
    milestones:   'معالم السلسلة',
    milestoneSub: 'الغ هذه للحصول على رموز تجميد مجانية',
    calendar:     'آخر 30 يوماً',
    calendarSub:  'نشاطك التعليمي اليومي',
    active:       'نشط',
    frozen:       'مجمد',
    missed:       'غائب',
  },
  fr: {
    title:        'Série & Gel',
    subtitle:     'Protège ta série avec des jetons de gel',
    currentStreak: 'Série actuelle',
    bestStreak:   'Meilleure série',
    freezeTokens: 'Jetons de gel',
    days:         'jours',
    tokens:       'jetons',
    howItWorks:   'Comment fonctionne le gel',
    hw1:          'Si tu rates un jour, un jeton est utilisé automatiquement pour protéger ta série.',
    hw2:          'Plus de jetons ? La série repart à 1. Garde des jetons en réserve !',
    hw3:          'Gagne des jetons gratuits en atteignant 7 et 30 jours de série.',
    shop:         'Boutique XP',
    shopSub:      'Dépense des XP pour acheter des protections',
    buy:          'Acheter',
    notEnough:    'Pas assez de XP',
    buying:       'Achat...',
    bought:       '✅ Acheté !',
    history:      'Historique de gel',
    historyEmpty: 'Aucun gel utilisé — garde ta série vivante ! 🔥',
    protected:    'Série protégée à',
    xpCost:       'XP',
    youHave:      'Tu as',
    xpBalance:    'XP à dépenser',
    milestones:   'Jalons de série',
    milestoneSub: 'Atteins-les pour gagner des jetons gratuits',
    calendar:     '30 derniers jours',
    calendarSub:  'Ton activité d\'apprentissage quotidienne',
    active:       'Actif',
    frozen:       'Gelé',
    missed:       'Manqué',
  },
}

const MILESTONES = [
  { days: 7,  reward: '+1 🧊',  color: 'text-blue-400',   bg: 'bg-blue-900/20 border-blue-500/30' },
  { days: 14, reward: '+1 🧊',  color: 'text-cyan-400',   bg: 'bg-cyan-900/20 border-cyan-500/30' },
  { days: 30, reward: '+2 🧊',  color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-500/30' },
  { days: 50, reward: '+1 🧊',  color: 'text-amber-400',  bg: 'bg-amber-900/20 border-amber-500/30' },
  { days: 100,reward: '+2 🧊 + 🏆', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-500/30' },
]

interface Props {
  userId:          string
  profile:         any
  progress:        any
  shopItems:       any[]
  freezeHistory:   any[]
  recentPurchases: any[]
}

export default function StreakClient({ userId, profile, progress, shopItems, freezeHistory, recentPurchases }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [buyingItem, setBuyingItem]  = useState<string | null>(null)
  const [boughtItem, setBoughtItem]  = useState<string | null>(null)
  const [error, setError]            = useState<string | null>(null)
  const [localXP, setLocalXP]        = useState<number>(progress?.xp ?? 0)
  const [localTokens, setLocalTokens] = useState<number>(progress?.freeze_tokens ?? 0)

  const lang = profile?.preferred_language ?? 'en'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const streak  = progress?.streak ?? 0
  const best    = progress?.longest_streak ?? 0
  const xp      = localXP

  const buy = (item: any) => {
    if (xp < item.xp_cost) return
    setBuyingItem(item.id)
    setError(null)
    startTransition(async () => {
      const result = await purchaseShopItem(userId, item.id)
      if (result.error) {
        setError(result.error)
      } else {
        setLocalXP(result.newXP ?? xp - item.xp_cost)
        if (item.item_type === 'freeze') setLocalTokens(result.newFreezeTokens ?? localTokens + item.quantity)
        setBoughtItem(item.id)
        setTimeout(() => setBoughtItem(null), 2500)
        router.refresh()
      }
      setBuyingItem(null)
    })
  }

  // Build 30-day calendar
  const today = new Date()
  const lastActive = progress?.last_active_date
  const freezeDates = new Set(freezeHistory.map((f: any) => f.used_date))

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === today.toISOString().split('T')[0]
    const wasFrozen = freezeDates.has(dateStr)
    // Simplified: we only know "last_active_date" precisely, so we mark today if active
    const isActive = dateStr === lastActive || (isToday && lastActive === today.toISOString().split('T')[0])
    return { dateStr, isToday, wasFrozen, isActive, dayNum: d.getDate() }
  })

  const nextMilestone = MILESTONES.find(m => m.days > streak)
  const daysToNext = nextMilestone ? nextMilestone.days - streak : null

  const getItemName = (item: any) =>
    lang === 'ar' ? (item.name_ar || item.name) : lang === 'fr' ? (item.name_fr || item.name) : item.name
  const getItemDesc = (item: any) =>
    lang === 'ar' ? (item.desc_ar || item.description) : lang === 'fr' ? (item.desc_fr || item.description) : item.description

  return (
    <div className="p-6 lg:p-10 max-w-4xl" dir={dir}>
      <h1 className="font-fredoka text-3xl lg:text-4xl mb-1">{t.title}</h1>
      <p className="text-muted font-semibold mb-8">{t.subtitle}</p>

      {/* ── Top stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Current streak */}
        <div className="bg-card border border-orange-500/20 rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
          <div className="text-5xl mb-2 animate-bounce-slow">🔥</div>
          <div className="font-fredoka text-4xl text-orange-400">{streak}</div>
          <div className="text-xs font-bold text-muted mt-1">{t.currentStreak}</div>
          <div className="text-xs text-orange-400/70 font-semibold mt-0.5">{streak} {t.days}</div>
        </div>

        {/* Best streak */}
        <div className="bg-card border border-yellow-500/20 rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
          <div className="text-5xl mb-2">🏆</div>
          <div className="font-fredoka text-4xl text-yellow-400">{best}</div>
          <div className="text-xs font-bold text-muted mt-1">{t.bestStreak}</div>
          <div className="text-xs text-yellow-400/70 font-semibold mt-0.5">{best} {t.days}</div>
        </div>

        {/* Freeze tokens */}
        <div className={cn(
          'bg-card rounded-3xl p-6 text-center relative overflow-hidden border',
          localTokens > 0 ? 'border-blue-500/30' : 'border-red-500/20'
        )}>
          <div className={cn('absolute inset-0 bg-gradient-to-b to-transparent pointer-events-none', localTokens > 0 ? 'from-blue-500/5' : 'from-red-500/5')} />
          <div className="text-5xl mb-2">🧊</div>
          <div className={cn('font-fredoka text-4xl', localTokens > 0 ? 'text-blue-400' : 'text-red-400')}>
            {localTokens}
          </div>
          <div className="text-xs font-bold text-muted mt-1">{t.freezeTokens}</div>
          <div className={cn('text-xs font-semibold mt-0.5', localTokens > 0 ? 'text-blue-400/70' : 'text-red-400/70')}>
            {localTokens > 0 ? `${localTokens} ${t.tokens}` : '⚠️ Unprotected'}
          </div>
        </div>
      </div>

      {/* ── Next milestone progress ────────────────────────────── */}
      {nextMilestone && (
        <div className="bg-card border border-white/8 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-fredoka text-lg">{t.milestones}</span>
              <span className="text-muted text-sm font-semibold ml-3">
                {daysToNext} {lang === 'ar' ? 'يوم حتى' : lang === 'fr' ? 'jours avant' : 'days until'} {nextMilestone.days}-day reward
              </span>
            </div>
            <span className={cn('font-extrabold text-sm px-3 py-1 rounded-full border', nextMilestone.bg, nextMilestone.color)}>
              {nextMilestone.reward}
            </span>
          </div>
          {/* Progress bar to next milestone */}
          <div className="h-4 bg-card2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-700"
              style={{ width: `${Math.min(100, (streak / nextMilestone.days) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-muted">
            <span>{streak} {t.days}</span>
            <span>{nextMilestone.days} {t.days}</span>
          </div>

          {/* All milestones */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {MILESTONES.map(m => (
              <div key={m.days} className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border',
                streak >= m.days ? 'bg-green-900/20 border-green-500/30 text-green-400' : m.bg + ' ' + m.color
              )}>
                {streak >= m.days ? '✅' : '🔒'} {m.days}d → {m.reward}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── 30-day activity calendar ──────────────────────── */}
        <div className="bg-card border border-white/8 rounded-3xl p-6">
          <h2 className="font-fredoka text-xl mb-1">{t.calendar}</h2>
          <p className="text-muted text-xs font-semibold mb-4">{t.calendarSub}</p>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                title={day.dateStr}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                  day.isToday && day.isActive
                    ? 'bg-orange-500 text-white ring-2 ring-orange-400/50 scale-110'
                    : day.isActive
                    ? 'bg-orange-500/70 text-white'
                    : day.wasFrozen
                    ? 'bg-blue-500/40 text-blue-300 ring-1 ring-blue-400/30'
                    : day.isToday
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'bg-white/4 text-white/25'
                )}
              >
                {day.wasFrozen ? '🧊' : day.dayNum}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {[
              { color: 'bg-orange-500', label: t.active },
              { color: 'bg-blue-500/40 ring-1 ring-blue-400/30', label: t.frozen },
              { color: 'bg-white/4', label: t.missed },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <div className={cn('w-3 h-3 rounded', l.color)} /> {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ───────────────────────────────────── */}
        <div className="bg-card border border-white/8 rounded-3xl p-6">
          <h2 className="font-fredoka text-xl mb-4">{t.howItWorks}</h2>
          <div className="space-y-4">
            {[
              { icon: '🧊', text: t.hw1, color: 'bg-blue-900/20 border-blue-500/20' },
              { icon: '💔', text: t.hw2, color: 'bg-red-900/20 border-red-500/20' },
              { icon: '🎁', text: t.hw3, color: 'bg-green-900/20 border-green-500/20' },
            ].map((tip, i) => (
              <div key={i} className={cn('flex items-start gap-3 rounded-2xl border p-4', tip.color)}>
                <span className="text-xl flex-shrink-0 mt-0.5">{tip.icon}</span>
                <p className="text-sm font-semibold leading-relaxed text-white/80">{tip.text}</p>
              </div>
            ))}
          </div>

          {/* XP balance */}
          <div className="mt-5 bg-card2 rounded-2xl p-4 border border-white/8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted">{t.youHave}</p>
              <p className="font-fredoka text-2xl text-accent2">{xp.toLocaleString()} <span className="text-sm text-muted font-bold">{t.xpBalance}</span></p>
            </div>
            <span className="text-3xl">⚡</span>
          </div>
        </div>
      </div>

      {/* ── XP Shop ─────────────────────────────────────────── */}
      <div className="bg-card border border-white/8 rounded-3xl p-6 mb-6">
        <h2 className="font-fredoka text-xl mb-1">{t.shop}</h2>
        <p className="text-muted text-xs font-semibold mb-5">{t.shopSub}</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shopItems.map(item => {
            const canAfford  = xp >= item.xp_cost
            const isBuying   = buyingItem === item.id
            const wasBought  = boughtItem === item.id
            const isFreeze   = item.item_type === 'freeze'

            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-2xl border p-5 flex items-start gap-4 transition-all',
                  isFreeze
                    ? 'bg-blue-900/10 border-blue-500/25 hover:border-blue-500/50'
                    : 'bg-card2 border-white/8 hover:border-white/20',
                  !canAfford && 'opacity-60'
                )}
              >
                <div className="text-4xl flex-shrink-0">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm mb-0.5">{getItemName(item)}</p>
                  <p className="text-xs text-muted font-semibold leading-relaxed mb-3">{getItemDesc(item)}</p>
                  <button
                    onClick={() => buy(item)}
                    disabled={!canAfford || !!buyingItem || isPending}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-extrabold transition-all border',
                      wasBought
                        ? 'bg-accent3/15 text-accent3 border-accent3/30'
                        : canAfford
                        ? isFreeze
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30 hover:-translate-y-0.5'
                          : 'bg-accent2/15 text-accent2 border-accent2/30 hover:bg-accent2/25 hover:-translate-y-0.5'
                        : 'bg-white/5 text-muted border-white/10 cursor-not-allowed'
                    )}
                  >
                    {wasBought
                      ? t.bought
                      : isBuying
                      ? t.buying
                      : !canAfford
                      ? `${t.notEnough} (${item.xp_cost} ${t.xpCost})`
                      : `${t.buy} — ${item.xp_cost} ${t.xpCost}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Freeze history ─────────────────────────────────── */}
      <div className="bg-card border border-white/8 rounded-3xl p-6">
        <h2 className="font-fredoka text-xl mb-4">{t.history} 🧊</h2>
        {freezeHistory.length === 0 ? (
          <p className="text-muted font-semibold text-sm text-center py-6">{t.historyEmpty}</p>
        ) : (
          <div className="space-y-2">
            {freezeHistory.map((f: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧊</span>
                  <div>
                    <p className="text-sm font-bold">
                      {t.protected} {f.protected_streak} {t.days}
                    </p>
                    <p className="text-xs text-muted font-semibold">
                      {new Date(f.used_date).toLocaleDateString(
                        lang === 'ar' ? 'ar-AE' : lang === 'fr' ? 'fr-FR' : 'en-GB',
                        { weekday: 'long', month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-900/20 border border-blue-500/20 px-3 py-1 rounded-full">
                  Saved ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
