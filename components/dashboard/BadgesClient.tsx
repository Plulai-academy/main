'use client'
// components/dashboard/BadgesClient.tsx
import { useState } from 'react'
import { cn, getRarityColor, getRarityGlow } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'

const RARITY_LABELS: Record<string, Record<Language, string>> = {
  common:    { en:'Common',    ar:'شائع',       fr:'Commun'     },
  rare:      { en:'Rare ✨',   ar:'نادر ✨',     fr:'Rare ✨'    },
  epic:      { en:'Epic 💜',   ar:'ملحمي 💜',    fr:'Épique 💜'  },
  legendary: { en:'Legendary 🌟', ar:'أسطوري 🌟', fr:'Légendaire 🌟' },
}

const UI: Record<Language, Record<string, string>> = {
  en: { title:'Badges', earned:'Earned', locked:'Locked', empty:'Complete your first lesson to earn your first badge!', progress:'badges earned' },
  ar: { title:'الشارات', earned:'المكتسبة', locked:'المقفلة', empty:'أكمل درسك الأول لكسب أول شارة!', progress:'شارات مكتسبة' },
  fr: { title:'Badges', earned:'Gagnés', locked:'Verrouillés', empty:'Complète ta première leçon pour gagner ton premier badge !', progress:'badges gagnés' },
}

interface Badge {
  id: string; name: string; emoji: string; description: string; condition: string; rarity: string; xp_bonus: number
}

interface Props {
  allBadges:  Badge[]
  userBadges: { badge_id: string; earned_at: string }[]
  language:   string
  childName?:  string
  childAvatar?: string
}

export default function BadgesClient({ allBadges, userBadges, language, childName = 'Explorer', childAvatar = '🧑‍🚀' }: Props) {
  const lang = (language || 'en') as Language
  const t    = UI[lang]
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)

  const earnedIds  = new Set(userBadges.map(b => b.badge_id))
  const earned     = allBadges.filter(b => earnedIds.has(b.id))
  const locked     = allBadges.filter(b => !earnedIds.has(b.id))
  const earnedDate = Object.fromEntries(userBadges.map(b => [b.badge_id, b.earned_at]))

  return (
    <div className="p-6 lg:p-10 max-w-4xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="font-fredoka text-3xl lg:text-4xl mb-2">🏆 {t.title}</h1>
      <p className="text-muted font-semibold mb-2">
        {earned.length} / {allBadges.length} {t.progress}
      </p>

      {/* Progress bar */}
      <div className="h-3 bg-card2 rounded-full overflow-hidden mb-8">
        <div className="h-full xp-bar-fill rounded-full transition-all duration-700"
          style={{ width: `${allBadges.length ? (earned.length / allBadges.length) * 100 : 0}%` }} />
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="mb-10">
          <h2 className="font-fredoka text-xl mb-5">✅ {t.earned}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {earned.map(b => {
              const when = earnedDate[b.id] ? new Date(earnedDate[b.id]).toLocaleDateString(lang === 'ar' ? 'ar-AE' : lang === 'fr' ? 'fr-FR' : 'en-US') : ''
              return (
                <div key={b.id} className={cn(
                  'bg-card rounded-2xl p-5 border text-center transition-all hover:scale-105 group relative',
                  getRarityColor(b.rarity), getRarityGlow(b.rarity)
                )}>
                  <div className="text-5xl mb-3 animate-star-pop group-hover:scale-110 transition-transform">{b.emoji}</div>
                  <div className="font-extrabold text-sm mb-1">{b.name}</div>
                  <div className="text-xs text-muted font-semibold mb-2 leading-relaxed">{b.description}</div>
                  <div className={cn('text-xs font-bold px-2.5 py-1 rounded-full border inline-block mb-1', getRarityColor(b.rarity))}>
                    {RARITY_LABELS[b.rarity]?.[lang] || b.rarity}
                  </div>
                  {b.xp_bonus > 0 && <div className="text-xs text-accent2 font-bold">+{b.xp_bonus} XP bonus</div>}
                  {when && <div className="text-xs text-muted/60 font-semibold mt-1">{when}</div>}
                  {/* Share button - appears on hover */}
                  <button
                    onClick={() => setShareCard({
                      type: 'badge',
                      childName, childAvatar,
                      badgeName: b.name,
                      badgeEmoji: b.emoji,
                      badgeRarity: (b.rarity as any) ?? 'common',
                      badgeDesc: b.description,
                    })}
                    className="mt-3 w-full py-1.5 rounded-xl text-xs font-extrabold bg-white/8 hover:bg-white/15 border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {lang === 'ar' ? '📤 مشاركة' : lang === 'fr' ? '📤 Partager' : '📤 Share'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="font-fredoka text-xl mb-5">🔒 {t.locked}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map(b => (
              <div key={b.id} className="bg-card2/50 rounded-2xl p-5 border border-white/5 text-center opacity-50 hover:opacity-70 transition-all cursor-default">
                <div className="text-5xl mb-3 grayscale">{b.emoji}</div>
                <div className="font-extrabold text-sm mb-1">{b.name}</div>
                <div className="text-xs text-muted font-semibold mb-2 leading-relaxed">{b.description}</div>
                <div className="text-xs font-bold text-muted border border-muted/25 px-2.5 py-1 rounded-full inline-block">
                  {b.condition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌱</div>
          <p className="font-bold text-muted">{t.empty}</p>
        </div>
      )}

      {/* Share card modal */}
      {shareCard && (
        <ShareCardModal
          props={shareCard}
          onClose={() => setShareCard(null)}
        />
      )}
    </div>
  )
}
