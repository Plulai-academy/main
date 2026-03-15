'use client'
// components/dashboard/ChallengesClient.tsx
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addXP, completeChallenge, checkAndAwardBadges } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const TYPE_COLORS: Record<string, string> = {
  think: 'text-accent5 bg-accent5/10 border-accent5/25',
  build: 'text-accent4 bg-accent4/10 border-accent4/25',
  quiz:  'text-accent2 bg-accent2/10 border-accent2/25',
  share: 'text-accent3 bg-accent3/10 border-accent3/25',
}
const UI: Record<Language, Record<string, string>> = {
  en: { title:'Challenges', sub:'Complete challenges to earn XP and keep your streak!', daily:'Today\'s Daily Challenge', resets:'Resets tomorrow', bonus:'Bonus Challenges', mark:'Mark as Done', done:'✅ Done!', pro:'🔒 Pro Feature', upgrade:'Upgrade to unlock', xpEarned:'XP earned!' },
  ar: { title:'التحديات', sub:'أكمل التحديات لكسب XP والحفاظ على سلسلتك!', daily:'تحدي اليوم', resets:'يُعاد غداً', bonus:'تحديات إضافية', mark:'علّم كمنجز', done:'✅ تم!', pro:'🔒 ميزة Pro', upgrade:'قم بالترقية للفتح', xpEarned:'XP مكتسب!' },
  fr: { title:'Défis', sub:'Complète des défis pour gagner des XP et maintenir ta série !', daily:'Défi du Jour', resets:'Se réinitialise demain', bonus:'Défis Bonus', mark:'Marquer comme fait', done:'✅ Fait !', pro:'🔒 Fonctionnalité Pro', upgrade:'Passer à Pro pour débloquer', xpEarned:'XP gagné !' },
}

interface Props {
  userId:          string
  language:        string
  hasAccess:       boolean
  dailyChallenge:  any
  bonusChallenges: any[]
  completedIds:    string[]
}

export default function ChallengesClient({ userId, language, hasAccess, dailyChallenge, bonusChallenges, completedIds }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast]     = useState<string | null>(null)
  const [localDone, setLocalDone] = useState<Set<string>>(new Set())

  const lang = (language || 'en') as Language
  const t    = UI[lang]
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const title = (c: any) => lang === 'ar' ? (c.title_ar || c.title) : lang === 'fr' ? (c.title_fr || c.title) : c.title
  const desc  = (c: any) => lang === 'ar' ? (c.description_ar || c.description) : lang === 'fr' ? (c.description_fr || c.description) : c.description
  const isDone = (id: string) => localDone.has(id) || completedIds.includes(id)

  const markDone = (id: string, xpReward: number, isPro = false, challengeType: 'daily' | 'bonus' = 'daily') => {
    if (isPro && !hasAccess) return
    if (isDone(id)) return
    startTransition(async () => {
      setLocalDone((prev: Set<string>) => new Set([...prev, id]))
      await completeChallenge(userId, id, challengeType)
      await addXP(userId, xpReward, 'challenge', id)
      await checkAndAwardBadges(userId)
      showToast(`⚡ +${xpReward} ${t.xpEarned}`)
      router.refresh()
    })
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-3xl" dir={dir}>

      {/* Toast — full-width on mobile, pinned right on desktop */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-4 md:px-5 py-3 rounded-2xl bg-card border border-accent2/30 text-accent2 font-bold text-sm shadow-xl transition-all duration-300',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        {toast}
      </div>

      <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl mb-1">⚡ {t.title}</h1>
      <p className="text-muted font-semibold text-sm md:text-base mb-6 md:mb-8">{t.sub}</p>

      {/* ── Daily Challenge ── */}
      <div className="mb-7 md:mb-8">
        <h2 className="font-fredoka text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2 flex-wrap">
          🌅 {t.daily}
          <span className="text-xs font-bold bg-accent1/15 text-accent1 border border-accent1/25 px-2.5 py-1 rounded-full">
            {t.resets}
          </span>
        </h2>

        {dailyChallenge ? (
          <div className="bg-gradient-to-br from-accent2/10 to-accent1/10 rounded-3xl p-5 md:p-6 border border-accent2/20 shadow-xl">
            {/* Header row */}
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="text-3xl md:text-4xl shrink-0">{dailyChallenge.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-extrabold text-base md:text-lg leading-snug">{dailyChallenge.title}</h3>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', TYPE_COLORS[dailyChallenge.type])}>
                    {dailyChallenge.type}
                  </span>
                </div>
                <p className="text-muted text-sm font-semibold leading-relaxed">{dailyChallenge.description}</p>
              </div>
            </div>

            {/* XP + CTA — stacked on mobile, inline on sm+ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="font-bold text-accent2 text-sm">+{dailyChallenge.xp_reward} XP</span>
              <button
                onClick={() => markDone(dailyChallenge.id, dailyChallenge.xp_reward, false, 'daily')}
                disabled={isDone(dailyChallenge.id) || isPending}
                className={cn(
                  'w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-2xl font-extrabold text-sm transition-all touch-manipulation active:scale-95',
                  isDone(dailyChallenge.id)
                    ? 'bg-accent3/15 text-accent3 border border-accent3/25 cursor-default'
                    : 'bg-gradient-to-r from-accent2 to-accent1 text-black hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50'
                )}
              >
                {isPending ? '⏳' : isDone(dailyChallenge.id) ? t.done : t.mark}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-white/5 rounded-3xl p-8 text-center text-muted font-bold text-sm">
            🌅 {lang === 'ar' ? 'لا يوجد تحدٍ اليوم — عد غداً!' : lang === 'fr' ? "Pas de défi aujourd'hui — reviens demain !" : 'No challenge today — check back tomorrow!'}
          </div>
        )}
      </div>

      {/* ── Bonus Challenges ── */}
      <h2 className="font-fredoka text-lg md:text-xl mb-3 md:mb-4">💪 {t.bonus}</h2>
      <div className="space-y-3 md:space-y-4">
        {bonusChallenges.map((c: any) => {
          const done     = isDone(c.id)
          const isLocked = c.is_pro && !hasAccess

          return (
            <div
              key={c.id}
              className={cn(
                'bg-card rounded-2xl p-4 md:p-5 border border-white/5 shadow-lg transition-all',
                isLocked && 'opacity-60',
                done && 'border-accent3/25 bg-accent3/5'
              )}
            >
              <div className="flex items-start gap-3 md:gap-4">
                {/* Emoji — slightly smaller on mobile */}
                <div className="text-2xl md:text-3xl shrink-0 mt-0.5">
                  {done ? '✅' : isLocked ? '🔒' : c.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title + type + pro badge */}
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-sm leading-snug">{title(c)}</h3>
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', TYPE_COLORS[c.type])}>
                      {c.type}
                    </span>
                    {c.is_pro && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-accent5/30 text-accent5 bg-accent5/10">
                        Pro
                      </span>
                    )}
                  </div>

                  <p className="text-muted text-xs font-semibold leading-relaxed mb-3">{desc(c)}</p>

                  {/* XP + CTA — always in one row; button full-width on xs if locked */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-accent2">+{c.xp_reward} XP</span>
                    {isLocked ? (
                      <Link
                        href="/pricing"
                        className="text-xs font-bold text-accent5 hover:underline touch-manipulation"
                      >
                        {t.upgrade} →
                      </Link>
                    ) : (
                      <button
                        onClick={() => markDone(c.id, c.xp_reward, c.is_pro, 'bonus')}
                        disabled={done || isPending}
                        className={cn(
                          'px-4 py-2 rounded-xl font-extrabold text-xs transition-all touch-manipulation active:scale-95',
                          done
                            ? 'bg-accent3/15 text-accent3'
                            : 'bg-card2 border border-white/10 text-muted hover:text-white hover:border-white/25 hover:-translate-y-0.5 disabled:opacity-50'
                        )}
                      >
                        {done ? t.done : t.mark}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}