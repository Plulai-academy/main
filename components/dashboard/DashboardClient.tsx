'use client'
// components/dashboard/DashboardClient.tsx
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { addXP, completeChallenge, checkAndAwardBadges, updateStreak } from '@/lib/supabase/queries'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import { cn, formatXP, getRarityColor, getRarityGlow } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const XP_PER_LEVEL = 1000
const getLevel      = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
const getLevelTitle = (level: number): string => {
  const tiers = [
    'Rookie', 'Explorer', 'Builder', 'Creator', 'Innovator',
    'Strategist', 'Visionary', 'Elite', 'Legend', 'Grandmaster',
  ]
  const tierIndex = Math.floor((level - 1) / 10)
  const tierLevel = ((level - 1) % 10) + 1
  const tier = tiers[Math.min(tierIndex, tiers.length - 1)]
  return `${tier} ${tierLevel}`
}

interface Props {
  userId:               string
  profile:              any
  progress:             any
  skillProgress:        any[]
  lessonCompletions:    any[]
  userBadges:           any[]
  allBadges:            any[]
  todayChallenge:       any
  challengeCompletions: any[]
  balance?:             number | null
}

export default function DashboardClient({
  userId, profile, progress, skillProgress, lessonCompletions,
  userBadges, allBadges, todayChallenge, challengeCompletions,
  balance,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast]           = useState<string | null>(null)
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null)
  const [shareCard, setShareCard]   = useState<ShareCardProps | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const xp        = progress?.xp || 0
  const level     = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL
  const xpPct     = (xpInLevel / XP_PER_LEVEL) * 100
  const streak    = progress?.streak || 0

  const earnedBadgeIds = userBadges.map((b: any) => b.badge_id)
  const earnedBadges   = allBadges.filter((b: any)  => earnedBadgeIds.includes(b.id))
  const lockedBadges   = allBadges.filter((b: any)  => !earnedBadgeIds.includes(b.id)).slice(0, 3)

  const isChallengeComplete = todayChallenge
    ? challengeCompletions.some((c: any) => c.challenge_id === todayChallenge.id)
    : false

  const doChallenge = () => {
    if (!todayChallenge || isChallengeComplete) return
    startTransition(async () => {
      await updateStreak(userId)
      const result = await addXP(userId, todayChallenge.xp_reward, 'daily_challenge', todayChallenge.id)
      await completeChallenge(userId, todayChallenge.id, 'daily')
      const newBadges = await checkAndAwardBadges(userId)
      const lang = profile?.preferred_language || 'en'
      const msg = lang === 'ar' ? `🎉 +${todayChallenge.xp_reward} XP! اكتملت المهمة!`
                : lang === 'fr' ? `🎉 +${todayChallenge.xp_reward} XP! Défi terminé!`
                : `🎉 +${todayChallenge.xp_reward} XP! Challenge complete!`
      showToast(msg)
      if (result.data?.leveledUp) setLevelUpMsg(`🎊 Level Up! You're now Level ${result.data.newLevel}!`)
      if (newBadges.length) setTimeout(() => showToast(`🏆 New badge: ${newBadges[0]}!`), 2500)
      router.refresh()
    })
  }

  const lang = profile?.preferred_language || 'en'

  const greetingsByLang: Record<string, Record<string, string>> = {
    en: {
      mini:   `Hey ${profile.display_name}! Ready to learn something amazing today? 🌟`,
      junior: `What's up, ${profile.display_name}! Let's build something cool today! 🛠️`,
      pro:    `Welcome back, ${profile.display_name}. Ready to level up? 🚀`,
      expert: `${profile.display_name}. Let's get to work. 💻`,
    },
    ar: {
      mini:   `أهلاً ${profile.display_name}! هل أنت مستعد اليوم؟ 🌟`,
      junior: `مرحباً ${profile.display_name}! هيا نبني شيئاً رائعاً! 🛠️`,
      pro:    `أهلاً بعودتك ${profile.display_name}. مستعد للترقي؟ 🚀`,
      expert: `${profile.display_name}. هيا نعمل. 💻`,
    },
    fr: {
      mini:   `Salut ${profile.display_name} ! Prêt à apprendre aujourd'hui ? 🌟`,
      junior: `Hé ${profile.display_name} ! On construit quelque chose ! 🛠️`,
      pro:    `Bon retour, ${profile.display_name}. On passe au niveau sup ? 🚀`,
      expert: `${profile.display_name}. Au travail. 💻`,
    },
  }
  const greetings = greetingsByLang[lang] ?? greetingsByLang.en
  const streakMsg = lang === 'ar'
    ? (streak > 0 ? `🔥 ${streak} أيام متتالية!` : '🌱 ابدأ بإتمام درس اليوم!')
    : lang === 'fr'
    ? (streak > 0 ? `🔥 ${streak} jours de suite !` : '🌱 Lance ta série en complétant une leçon!')
    : (streak > 0 ? `🔥 ${streak}-day streak — keep it up!` : '🌱 Start your streak by completing a lesson today!')

  const statItems = [
    { emoji:'🔥', val:`${streak}`, label: lang === 'ar' ? 'أيام' : lang === 'fr' ? 'Jours' : 'days',      sublabel: lang === 'ar' ? 'متتالية' : lang === 'fr' ? 'de suite' : 'streak',   color:'text-[#FAA918]',  bg:'bg-[#FAA918]/10' },
    { emoji:'📚', val:`${lessonCompletions.length}`, label: lang === 'ar' ? 'درس' : lang === 'fr' ? 'leçons' : 'lessons', sublabel: lang === 'ar' ? 'مكتملة' : lang === 'fr' ? 'terminées' : 'done', color:'text-[#1CB0F6]', bg:'bg-[#1CB0F6]/10' },
    { emoji:'🏆', val:`${earnedBadges.length}`,      label: lang === 'ar' ? 'شارة' : lang === 'fr' ? 'badges' : 'badges',   sublabel: lang === 'ar' ? 'مكتسبة' : lang === 'fr' ? 'gagnés' : 'earned',  color:'text-[#FAA918]',  bg:'bg-[#FAA918]/10' },
  ]

  // i18n helpers for the balance banner
  const balanceI18n = {
    label:   lang === 'ar' ? 'رصيدك' : lang === 'fr' ? 'Ton solde' : 'Your balance',
    cta:     lang === 'ar' ? 'تسوّق الآن ←' : lang === 'fr' ? 'Visiter la boutique →' : 'Visit shop →',
    noCoins: lang === 'ar' ? 'لا يوجد رصيد بعد — أكمل التحديات لكسب العملات!' : lang === 'fr' ? 'Aucune pièce pour l\'instant — complète des défis pour en gagner !' : 'No coins yet — complete challenges to earn some!',
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-5xl text-[#F5F5F5]">

      {/* Level-up modal */}
      {levelUpMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={() => setLevelUpMsg(null)}
        >
          <div className="bg-card border border-[#1CB0F6]/40 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-[#1CB0F6]/20 animate-star-pop w-full max-w-sm ring-1 ring-[#1CB0F6]/20">
            <div className="text-6xl mb-5 animate-bounce-slow">🎊</div>
            <h2 className="font-fredoka text-2xl md:text-3xl text-[#1CB0F6] mb-2">{levelUpMsg}</h2>
            <p className="text-[#6F6F6F] font-bold text-sm">Keep going — you&apos;re unstoppable!</p>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-5 py-3 rounded-2xl',
        'bg-card/95 backdrop-blur-sm border border-[#14D4F4]/40 text-[#14D4F4] font-bold text-sm shadow-xl shadow-[#14D4F4]/10',
        'transition-all duration-400 flex items-center gap-2',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        {toast}
      </div>

      {/* ── Wallet Balance Banner ── */}
      {balance != null && (
        <Link
          href="/dashboard/shop"
          className={cn(
            'group relative flex items-center justify-between gap-4 rounded-3xl px-5 py-4 mb-6 md:mb-8 overflow-hidden',
            'border border-yellow-400/20 hover:border-yellow-400/40',
            'bg-gradient-to-r from-yellow-400/8 via-yellow-300/5 to-transparent',
            'hover:from-yellow-400/14 hover:via-yellow-300/8',
            'transition-all duration-300 animate-slide-up',
          )}
        >
          {/* ambient glow */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-3 min-w-0">
            {/* coin stack */}
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center text-2xl shadow-inner">
              🪙
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-yellow-300/50 leading-none mb-1">
                {balanceI18n.label}
              </div>
              <div className="font-fredoka text-2xl md:text-3xl text-yellow-300 leading-none">
                {balance > 0 ? balance.toLocaleString() : <span className="text-base font-bold text-yellow-300/50">{balanceI18n.noCoins}</span>}
              </div>
            </div>
          </div>

          {/* CTA — hidden on very small screens, visible md+ */}
          {balance > 0 && (
            <div className="relative hidden sm:flex items-center gap-2 shrink-0 text-yellow-300/60 group-hover:text-yellow-300 font-extrabold text-sm transition-colors duration-200">
              {balanceI18n.cta}
            </div>
          )}
        </Link>
      )}

      {/* Greeting */}
      <div className="mb-6 md:mb-8 animate-slide-up">
        <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl mb-1 leading-tight text-[#F5F5F5]">
          {greetings[profile.age_group] || greetings.pro}
        </h1>
        <p className="text-[#6F6F6F] font-semibold text-sm md:text-base">{streakMsg}</p>
      </div>

      {/* Start Learning Section */}
      <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 mb-5 md:mb-6 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1CB0F6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="font-fredoka text-xl md:text-2xl mb-1 text-[#F5F5F5]">🚀 Continue Your Journey</h2>
            <p className="text-[#6F6F6F] text-sm font-semibold">Master new skills and earn more XP today!</p>
          </div>
          <Link
            href="/dashboard/skills"
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] text-black text-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1CB0F6]/25 transition-all duration-200"
          >
            Start
          </Link>
        </div>
      </div>

      {/* XP Card */}
      <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 mb-5 md:mb-6 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1CB0F6]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between mb-5 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-fredoka text-xl md:text-2xl text-[#1CB0F6]">Level {level}</span>
              <span className="text-xs md:text-sm font-bold text-[#6F6F6F] bg-[#1CB0F6]/10 border border-[#1CB0F6]/15 px-2.5 py-0.5 rounded-full">
                {getLevelTitle(level)}
              </span>
            </div>
            <div className="text-[#6F6F6F] text-xs font-bold">{xpInLevel} / {XP_PER_LEVEL} XP to next level</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-fredoka text-2xl md:text-3xl text-[#F5F5F5]">{formatXP(xp)}</div>
            <div className="text-[#6F6F6F] text-xs font-bold">Total XP</div>
          </div>
        </div>

        <div className="relative h-4 md:h-5 bg-card2 rounded-full overflow-hidden mb-5 ring-1 ring-white/5">
          <div
            className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #1CB0F6 0%, #14D4F4 100%)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 animate-[shimmer_2.5s_ease-in-out_infinite]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {statItems.map(s => (
            <div key={s.label} className={cn('rounded-2xl p-3 md:p-4 text-center border border-white/5', s.bg)}>
              <div className={cn('font-fredoka text-xl md:text-2xl leading-none mb-0.5', s.color)}>{s.val}</div>
              <div className="text-[#F5F5F5] font-extrabold text-xs">{s.label}</div>
              <div className="text-[#6F6F6F] text-xs font-bold hidden sm:block">{s.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">

        {/* Daily Challenge */}
        <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#2B70C9]/6 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4 gap-2">
            <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5]">⚡ Today&apos;s Challenge</h2>
            {todayChallenge && (
              <span className="text-xs font-bold bg-[#FAA918]/15 text-[#FAA918] border border-[#FAA918]/25 px-3 py-1 rounded-full shrink-0">
                +{todayChallenge.xp_reward} XP
              </span>
            )}
          </div>

          {todayChallenge ? (
            <>
              <div className="relative bg-card2 rounded-2xl p-4 md:p-5 mb-4 border border-white/5">
                <div className="text-3xl md:text-4xl mb-2.5">{todayChallenge.emoji}</div>
                <h3 className="font-extrabold text-sm md:text-base mb-1 text-[#F5F5F5]">{todayChallenge.title}</h3>
                <p className="text-[#6F6F6F] text-sm font-semibold leading-relaxed">{todayChallenge.description}</p>
              </div>
              <button
                onClick={doChallenge}
                disabled={isChallengeComplete || isPending}
                className={cn(
                  'w-full py-3 md:py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-200',
                  isChallengeComplete
                    ? 'bg-[#6F6F6F]/15 text-[#6F6F6F] border border-[#6F6F6F]/25 cursor-default'
                    : 'bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1CB0F6]/25 active:translate-y-0 disabled:opacity-50'
                )}
              >
                {isPending ? '⏳ Saving...' : isChallengeComplete ? '✅ Challenge Complete!' : '🎯 Mark as Done'}
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-[#6F6F6F] font-bold text-sm">
              No challenge today — check back tomorrow! 🌅
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FAA918]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4">
            <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5]">🏆 Badges</h2>
            <Link href="/dashboard/badges" className="text-[#1CB0F6] text-xs font-bold hover:underline underline-offset-2">
              See all →
            </Link>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
              {earnedBadges.slice(0, 6).map((b: any) => (
                <div
                  key={b.id}
                  className={cn(
                    'bg-card2 rounded-2xl p-2.5 md:p-3 text-center border hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 cursor-default',
                    'border-[#1CB0F6]/20 shadow-sm shadow-[#1CB0F6]/10'
                  )}
                >
                  <div className="text-2xl md:text-3xl mb-1">{b.emoji}</div>
                  <div className="text-xs font-bold truncate text-[#F5F5F5]">{b.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[#6F6F6F] font-semibold text-sm">
              No badges yet — complete your first lesson! 🌱
            </div>
          )}

          {lockedBadges.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[#6F6F6F] mb-2">🔒 Coming next:</div>
              {lockedBadges.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 bg-card2/60 rounded-xl px-3 py-2.5 opacity-55 border border-white/5">
                  <span className="text-lg md:text-xl grayscale shrink-0">{b.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-[#F5F5F5]">{b.name}</div>
                    <div className="text-xs text-[#6F6F6F] truncate">{b.condition}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dream Project */}
        <div className="lg:col-span-2 relative rounded-3xl p-5 md:p-6 shadow-xl animate-slide-up overflow-hidden border border-[#2B70C9]/15"
          style={{ background: 'linear-gradient(135deg, rgba(28,176,246,0.12) 0%, rgba(20,212,244,0.08) 100%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#14D4F4]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#2B70C9]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="font-fredoka text-lg md:text-xl mb-0.5 text-[#F5F5F5]">🌟 Your Dream Project</h2>
            <p className="text-xs md:text-sm font-semibold text-[#6F6F6F] mb-4">Everything you learn is building toward this:</p>

            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-sm font-semibold leading-relaxed italic text-[#F5F5F5]/85 mb-5 border border-white/8">
              &ldquo;{profile.dream_project || 'Not set yet — update your profile!'}&rdquo;
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/coach"
                className="w-full sm:w-auto text-center px-5 md:px-6 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2B70C9]/25 transition-all duration-200"
              >
                🤖 Talk to your AI Coach →
              </Link>
              <button
                onClick={() => setShareCard({
                  type: 'level',
                  childName:   profile.display_name,
                  childAvatar: profile.avatar ?? '🧑‍🚀',
                  newLevel:    level,
                  levelTitle:  getLevelTitle(level),
                  totalXP:     xp,
                })}
                className="w-full sm:w-auto text-center px-5 md:px-6 py-3 rounded-2xl font-extrabold text-sm border border-[#1CB0F6]/30 text-[#1CB0F6] hover:bg-[#1CB0F6]/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                📤 Share my progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {shareCard && (
        <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />
      )}
    </div>
  )
} 
