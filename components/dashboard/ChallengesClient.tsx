'use client'
// components/dashboard/ChallengesClient.tsx
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addXP, completeChallenge, checkAndAwardBadges } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

// ─── Shared icon set — same pattern as SkillsClient / LessonViewClient ───
type IconKind = 'bolt' | 'sunrise' | 'fire' | 'lightbulb' | 'hammer' | 'quiz' | 'share' | 'lock' | 'check' | 'hourglass' | 'sparkle' | 'chevronRight'

function Icon({ kind, className }: { kind: IconKind; className?: string }) {
  const common = { className, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'bolt':         return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
    case 'sunrise':      return <svg {...common}><path d="M12 4a1 1 0 0 1 1 1v2h-2V5a1 1 0 0 1 1-1Zm6.4 2.6 1.4 1.4-1.5 1.5-1.4-1.4 1.5-1.5ZM4.2 6l1.5 1.5-1.4 1.4L2.8 7.4 4.2 6ZM12 9a5 5 0 0 1 4.9 6H7.1A5 5 0 0 1 12 9Zm-9 7h18v2H3v-2Zm.8 4 1.4-1.4 1.5 1.5-1.4 1.4L3.8 20Zm14.9.1 1.4-1.4 1.5 1.5-1.4 1.4-1.5-1.5Z"/></svg>
    case 'fire':         return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'lightbulb':    return <svg {...common}><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2ZM9 19h6v1H9v-1Zm1 3h4v1h-4v-1Z"/></svg>
    case 'hammer':       return <svg {...common}><path d="M21.7 5.3 18.7 2.3a1 1 0 0 0-1.4 0l-2 2 4.4 4.4 2-2a1 1 0 0 0 0-1.4ZM14.6 5.3l-10 10L3 19.9l4.6-1.6 10-10-3-3Z"/></svg>
    case 'quiz':         return <svg {...common}><path d="M11 18h2v2h-2v-2Zm1-14a5 5 0 0 0-5 5h2a3 3 0 1 1 4.5 2.6c-.9.55-1.5 1.5-1.5 2.4v1h2v-1c0-.4.3-.85.8-1.15A5 5 0 0 0 12 4Z"/></svg>
    case 'share':        return <svg {...common}><path d="M18 16.1c-.8 0-1.5.3-2 .9l-7.1-4.1c.1-.3.1-.6 0-.9l7-4c.5.5 1.3.9 2.1.9a3 3 0 1 0-3-3c0 .3 0 .6.1.9l-7-4a3 3 0 1 0 0 4.3l7 4a3 3 0 0 0-.1.9c0 .3 0 .6.1.9l-7.1 4.1a3 3 0 1 0 2 5.2 3 3 0 0 0 2.9-3.7l7-4c.5.5 1.3.8 2.1.8a3 3 0 1 0 0-3.2Z"/></svg>
    case 'lock':         return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':        return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'hourglass':     return <svg {...common}><path d="M6 2h12v2l-4 5 4 5v2H6v-2l4-5-4-5V2Zm2 2.6L11 8h2l3-3.4H8Zm0 14.8h8L11 16H9l-1 3.4Z"/></svg>
    case 'sparkle':       return <svg {...common}><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/></svg>
    case 'chevronRight':  return <svg {...common}><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/></svg>
  }
}

// ─── Design tokens — same neutral-card + semantic-color system as the rest
// of the app, instead of a unique tint per challenge type. ─────────────────
const CARD          = 'bg-card border border-white/8 rounded-3xl'
const PRIMARY_BTN    = 'bg-[#1CB0F6] text-black shadow-[0_3px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none'
const SUCCESS_CHIP   = 'bg-[#3CB371]/15 text-[#3CB371] border border-[#3CB371]/25'

const TYPE_ICON: Record<string, IconKind> = { think: 'lightbulb', build: 'hammer', quiz: 'quiz', share: 'share' }
const TYPE_COLOR: Record<string, string> = {
  think: 'text-[#A66BFF] bg-[#A66BFF]/12',
  build: 'text-amber-400 bg-amber-400/12',
  quiz:  'text-[#1CB0F6] bg-[#1CB0F6]/12',
  share: 'text-[#3CB371] bg-[#3CB371]/12',
}

const UI: Record<Language, Record<string, string>> = {
  en: { title:'Challenges', sub:'Complete challenges to earn XP and keep your streak!', daily:'Today\'s Daily Challenge', resets:'Resets tomorrow', bonus:'Bonus Challenges', mark:'Mark as Done', done:'Done!', pro:'Pro Feature', upgrade:'Upgrade to unlock', xpEarned:'XP earned!', noChallenge:'No challenge today — check back tomorrow!' },
  ar: { title:'التحديات', sub:'أكمل التحديات لكسب XP والحفاظ على سلسلتك!', daily:'تحدي اليوم', resets:'يُعاد غداً', bonus:'تحديات إضافية', mark:'علّم كمنجز', done:'تم!', pro:'ميزة Pro', upgrade:'قم بالترقية للفتح', xpEarned:'XP مكتسب!', noChallenge:'لا يوجد تحدٍ اليوم — عد غداً!' },
  fr: { title:'Défis', sub:'Complète des défis pour gagner des XP et maintenir ta série !', daily:'Défi du Jour', resets:'Se réinitialise demain', bonus:'Défis Bonus', mark:'Marquer comme fait', done:'Fait !', pro:'Fonctionnalité Pro', upgrade:'Passer à Pro pour débloquer', xpEarned:'XP gagné !', noChallenge:"Pas de défi aujourd'hui — reviens demain !" },
}

interface Props {
  userId:          string
  language:        string
  hasAccess:       boolean
  dailyChallenge:  any
  bonusChallenges: any[]
  completedIds:    string[]
}

// One small icon chip, reused for the type badge everywhere — same shape,
// only the color/icon changes per type, so there's one pattern to learn.
function TypeChip({ type }: { type: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', TYPE_COLOR[type] ?? 'text-muted bg-white/8')}>
      <Icon kind={TYPE_ICON[type] ?? 'sparkle'} className="w-3 h-3" /> {type}
    </span>
  )
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
      showToast(`+${xpReward} ${t.xpEarned}`)
      router.refresh()
    })
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-3xl" dir={dir}>

      {/* Toast */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-4 md:px-5 py-3 rounded-2xl bg-card border border-white/10 text-[#1CB0F6] font-bold text-sm shadow-xl transition-all duration-300 flex items-center gap-2',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        <Icon kind="sparkle" className="w-4 h-4 shrink-0" />
        {toast}
      </div>

      <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl mb-1 flex items-center gap-2">
        <Icon kind="bolt" className="w-7 h-7 text-amber-400" /> {t.title}
      </h1>
      <p className="text-muted font-semibold text-sm md:text-base mb-6 md:mb-8">{t.sub}</p>

      {/* ── Daily Challenge ── */}
      <div className="mb-7 md:mb-8">
        <h2 className="font-fredoka text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2 flex-wrap">
          <Icon kind="sunrise" className="w-5 h-5 text-amber-400" /> {t.daily}
          <span className="text-xs font-bold bg-white/8 text-muted px-2.5 py-1 rounded-full">
            {t.resets}
          </span>
        </h2>

        {dailyChallenge ? (
          <div className={cn(CARD, 'p-5 md:p-6 shadow-xl')}>
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="text-3xl md:text-4xl shrink-0">{dailyChallenge.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-extrabold text-base md:text-lg leading-snug">{dailyChallenge.title}</h3>
                  <TypeChip type={dailyChallenge.type} />
                </div>
                <p className="text-muted text-sm font-semibold leading-relaxed">{dailyChallenge.description}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="font-bold text-[#1CB0F6] text-sm">+{dailyChallenge.xp_reward} XP</span>
              <button
                onClick={() => markDone(dailyChallenge.id, dailyChallenge.xp_reward, false, 'daily')}
                disabled={isDone(dailyChallenge.id) || isPending}
                className={cn(
                  'w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-2xl font-extrabold text-sm transition-all touch-manipulation flex items-center justify-center gap-1.5',
                  isDone(dailyChallenge.id) ? SUCCESS_CHIP + ' cursor-default' : cn(PRIMARY_BTN, 'disabled:opacity-50')
                )}
              >
                {isPending ? <Icon kind="hourglass" className="w-4 h-4" /> : isDone(dailyChallenge.id) ? <Icon kind="check" className="w-4 h-4" /> : null}
                {isPending ? '' : isDone(dailyChallenge.id) ? t.done : t.mark}
              </button>
            </div>
          </div>
        ) : (
          <div className={cn(CARD, 'p-8 text-center text-muted font-bold text-sm flex flex-col items-center gap-2')}>
            <Icon kind="sunrise" className="w-6 h-6 text-muted/50" />
            {t.noChallenge}
          </div>
        )}
      </div>

      {/* ── Bonus Challenges ── */}
      <h2 className="font-fredoka text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2">
        <Icon kind="fire" className="w-5 h-5 text-amber-400" /> {t.bonus}
      </h2>
      <div className="space-y-3 md:space-y-4">
        {bonusChallenges.map((c: any) => {
          const done     = isDone(c.id)
          const isLocked = c.is_pro && !hasAccess

          return (
            <div
              key={c.id}
              className={cn(
                CARD, 'p-4 md:p-5 shadow-lg transition-all',
                isLocked && 'opacity-60',
                done && 'border-[#3CB371]/25 bg-[#3CB371]/5'
              )}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 text-xl md:text-2xl"
                  style={{ backgroundColor: done ? '#3CB37122' : isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)' }}>
                  {done ? <Icon kind="check" className="w-5 h-5 text-[#3CB371]" /> : isLocked ? <Icon kind="lock" className="w-5 h-5 text-muted" /> : c.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-sm leading-snug">{title(c)}</h3>
                    <TypeChip type={c.type} />
                    {c.is_pro && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-400 bg-amber-400/10">
                        Pro
                      </span>
                    )}
                  </div>

                  <p className="text-muted text-xs font-semibold leading-relaxed mb-3">{desc(c)}</p>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#1CB0F6]">+{c.xp_reward} XP</span>
                    {isLocked ? (
                      <Link
                        href="/pricing"
                        className="text-xs font-bold text-amber-400 hover:underline touch-manipulation flex items-center gap-1"
                      >
                        {t.upgrade} <Icon kind="chevronRight" className="w-3 h-3" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => markDone(c.id, c.xp_reward, c.is_pro, 'bonus')}
                        disabled={done || isPending}
                        className={cn(
                          'px-4 py-2 rounded-xl font-extrabold text-xs transition-all touch-manipulation flex items-center gap-1.5',
                          done
                            ? 'bg-[#3CB371]/15 text-[#3CB371]'
                            : 'bg-card2 border border-white/10 text-muted hover:text-white hover:border-white/25 hover:-translate-y-0.5 disabled:opacity-50'
                        )}
                      >
                        {done && <Icon kind="check" className="w-3.5 h-3.5" />}
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