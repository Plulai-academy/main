'use client'
// components/layout/TrialBanner.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

interface Props {
  trialDaysLeft: number
  isTrialing:    boolean
  isPaid:        boolean
  language:      string
}

export default function TrialBanner({ trialDaysLeft, isTrialing, isPaid, language }: Props) {
  const lang = (language || 'en') as Language
  if (isPaid) return null // paid users don't see banner

  if (!isTrialing) {
    // Trial expired
    return (
      <div className="sticky top-0 z-40 bg-gradient-to-r from-red-900/80 to-accent5/80 border-b border-red-500/30 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span>⏰</span>
          <span>
            {lang === 'ar' ? 'انتهت تجربتك المجانية! قم بالترقية للاستمرار.' :
             lang === 'fr' ? 'Votre essai gratuit est terminé ! Passez à Pro pour continuer.' :
             'Your free trial has ended! Upgrade to keep learning.'}
          </span>
        </div>
        <Link
          href="/pricing"
          className="px-4 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-accent2 transition-colors flex-shrink-0"
        >
          {lang === 'ar' ? 'ترقية الآن →' : lang === 'fr' ? 'Passer à Pro →' : 'Upgrade Now →'}
        </Link>
      </div>
    )
  }

  const urgency = trialDaysLeft <= 3
  const color   = trialDaysLeft <= 3 ? 'from-red-900/60 to-accent5/60 border-red-500/25' : 'from-accent3/20 to-accent4/20 border-accent3/25'

  return (
    <div className={cn(
      'sticky top-0 z-40 bg-gradient-to-r border-b backdrop-blur-sm px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap',
      color
    )}>
      <div className="flex items-center gap-2 text-sm font-bold">
        <span>{urgency ? '⚠️' : '🎁'}</span>
        <span>
          {lang === 'ar'
            ? `${trialDaysLeft} يوم متبقٍ في تجربتك المجانية`
            : lang === 'fr'
            ? `${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''} restant${trialDaysLeft > 1 ? 's' : ''} dans votre essai gratuit`
            : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in your free trial`}
        </span>
      </div>
      <Link
        href="/pricing"
        className={cn(
          'px-4 py-1.5 rounded-xl font-extrabold text-xs transition-all hover:-translate-y-0.5 flex-shrink-0',
          urgency
            ? 'bg-gradient-to-r from-accent1 to-accent2 text-black shadow'
            : 'bg-gradient-to-r from-accent3 to-accent4 text-white shadow'
        )}
      >
        {lang === 'ar' ? 'ترقية →' : lang === 'fr' ? 'Passer à Pro →' : 'Upgrade →'}
      </Link>
    </div>
  )
}
