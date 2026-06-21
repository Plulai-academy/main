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

// ─── Inline SVG icon set — replaces all literal emoji in the UI chrome ───
// (matches the Icon pattern used in SkillsClient / LessonListClient)
type IconKind =
  | 'fire' | 'book' | 'trophy' | 'coin' | 'rocket' | 'target' | 'lock' | 'check'
  | 'hourglass' | 'share' | 'robot' | 'sparkle' | 'bolt' | 'sunrise' | 'partyPop'
  | 'chevronRight' | 'seedling' | 'star'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'fire':
      return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'book':
      return <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Z"/></svg>
    case 'trophy':
      return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'coin':
      return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm-1 3h2v1.1c1.15.27 2 1.16 2 2.4h-2c0-.4-.4-.7-1-.7s-1 .3-1 .7c0 .4.4.6 1 .8 1.4.4 2.3 1 2.3 2.3 0 1.2-.85 2.1-2 2.4V18h-2v-1.1c-1.15-.27-2-1.16-2-2.4h2c0 .4.4.7 1 .7s1-.3 1-.7c0-.4-.4-.6-1-.8-1.4-.4-2.3-1-2.3-2.3 0-1.2.85-2.1 2-2.4V8Z"/></svg>
    case 'rocket':
      return <svg {...common}><path d="M13.5 2.5c3 .3 5.3 2.6 5.6 5.6.2 2-.4 4-1.7 5.6l.1 3.4-3.4-.1c-1.6 1.3-3.6 1.9-5.6 1.7-3-.3-5.3-2.6-5.6-5.6-.2-2 .4-4 1.7-5.6L4.5 4.2l3.4.1c1.6-1.3 3.6-1.9 5.6-1.7Zm-2.8 8.8a2 2 0 1 0 2.8-2.8 2 2 0 0 0-2.8 2.8ZM3 21l3-1 -2-2-1 3Z"/></svg>
    case 'target':
      return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>
    case 'lock':
      return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'check':
      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'hourglass':
      return <svg {...common}><path d="M6 2h12v2l-4 5 4 5v2H6v-2l4-5-4-5V2Zm2 2.6L11 8h2l3-3.4H8Zm0 14.8h8L11 16H9l-1 3.4Z"/></svg>
    case 'share':
      return <svg {...common}><path d="M18 16.1c-.8 0-1.5.3-2 .9l-7.1-4.1c.1-.3.1-.6 0-.9l7-4c.5.5 1.3.9 2.1.9a3 3 0 1 0-3-3c0 .3 0 .6.1.9l-7-4a3 3 0 1 0 0 4.3l7 4a3 3 0 0 0-.1.9c0 .3 0 .6.1.9l-7.1 4.1a3 3 0 1 0 2 5.2 3 3 0 0 0 2.9-3.7l7-4c.5.5 1.3.8 2.1.8a3 3 0 1 0 0-3.2Z"/></svg>
    case 'robot':
      return <svg {...common}><path d="M12 2a1.5 1.5 0 0 1 1.5 1.5V5h3A2.5 2.5 0 0 1 19 7.5V9a3 3 0 0 1 0 6v1.5A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5V15a3 3 0 0 1 0-6V7.5A2.5 2.5 0 0 1 7.5 5h3V3.5A1.5 1.5 0 0 1 12 2ZM9 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>
    case 'sparkle':
      return <svg {...common}><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/></svg>
    case 'bolt':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
    case 'sunrise':
      return <svg {...common}><path d="M12 4a1 1 0 0 1 1 1v2h-2V5a1 1 0 0 1 1-1Zm6.4 2.6 1.4 1.4-1.5 1.5-1.4-1.4 1.5-1.5ZM4.2 6l1.5 1.5-1.4 1.4L2.8 7.4 4.2 6ZM12 9a5 5 0 0 1 4.9 6H7.1A5 5 0 0 1 12 9Zm-9 7h18v2H3v-2Zm.8 4 1.4-1.4 1.5 1.5-1.4 1.4L3.8 20Zm14.9.1 1.4-1.4 1.5 1.5-1.4 1.4-1.5-1.5Z"/></svg>
    case 'partyPop':
      return <svg {...common}><path d="M3 21l4-13 13 4-13 4-4 5Zm9-17 1.5 2.6L17 8l-3.6.3L12 11l-1.4-2.7L7 8l3.5-2.4L12 3Z"/></svg>
    case 'chevronRight':
      return <svg {...common}><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/></svg>
    case 'seedling':
      return <svg {...common}><path d="M12 22a1 1 0 0 1-1-1v-6.1C8 14.4 5 12 5 8c4 0 6.4 2 7 4.5C12.6 10 15 8 19 8c0 4-3 6.4-6 6.9V21a1 1 0 0 1-1 1Z"/></svg>
    case 'star':
      return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
  }
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
  const earnedBadges   = allBadges.filter((b: any) => earnedBadgeIds.includes(b.id))
  const lockedBadges   = allBadges.filter((b: any) => !earnedBadgeIds.includes(b.id)).slice(0, 3)

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
      const msg = lang === 'ar' ? `+${todayChallenge.xp_reward} XP! اكتملت المهمة!`
                : lang === 'fr' ? `+${todayChallenge.xp_reward} XP! Défi terminé!`
                : `+${todayChallenge.xp_reward} XP! Challenge complete!`
      showToast(msg)
      if (result.data?.leveledUp) setLevelUpMsg(`Level Up! You're now Level ${result.data.newLevel}!`)
      if (newBadges.length) setTimeout(() => showToast(`New badge: ${newBadges[0]}!`), 2500)
      router.refresh()
    })
  }

  const lang = profile?.preferred_language || 'en'

  const greetingsByLang: Record<string, Record<string, string>> = {
    en: {
      mini:   `Hey ${profile.display_name}! Ready to learn something amazing today?`,
      junior: `What's up, ${profile.display_name}! Let's build something cool today!`,
      pro:    `Welcome back, ${profile.display_name}. Ready to level up?`,
      expert: `${profile.display_name}. Let's get to work.`,
    },
    ar: {
      mini:   `أهلاً ${profile.display_name}! هل أنت مستعد اليوم؟`,
      junior: `مرحباً ${profile.display_name}! هيا نبني شيئاً رائعاً!`,
      pro:    `أهلاً بعودتك ${profile.display_name}. مستعد للترقي؟`,
      expert: `${profile.display_name}. هيا نعمل.`,
    },
    fr: {
      mini:   `Salut ${profile.display_name} ! Prêt à apprendre aujourd'hui ?`,
      junior: `Hé ${profile.display_name} ! On construit quelque chose !`,
      pro:    `Bon retour, ${profile.display_name}. On passe au niveau sup ?`,
      expert: `${profile.display_name}. Au travail.`,
    },
  }
  const greetings = greetingsByLang[lang] ?? greetingsByLang.en

  const streakMsg = lang === 'ar'
    ? (streak > 0 ? `${streak} أيام متتالية!` : 'ابدأ بإتمام درس اليوم!')
    : lang === 'fr'
    ? (streak > 0 ? `${streak} jours de suite !` : 'Lance ta série en complétant une leçon!')
    : (streak > 0 ? `${streak}-day streak — keep it up!` : 'Start your streak by completing a lesson today!')

  const statItems = [
    { icon:'fire'   as IconKind, val:`${streak}`,                   label: lang === 'ar' ? 'أيام' : lang === 'fr' ? 'Jours'   : 'days',    sublabel: lang === 'ar' ? 'متتالية' : lang === 'fr' ? 'de suite'  : 'streak', color:'text-[#FAA918]', bg:'bg-[#FAA918]/10' },
    { icon:'book'   as IconKind, val:`${lessonCompletions.length}`, label: lang === 'ar' ? 'درس'  : lang === 'fr' ? 'leçons'  : 'lessons', sublabel: lang === 'ar' ? 'مكتملة'  : lang === 'fr' ? 'terminées' : 'done',   color:'text-[#1CB0F6]', bg:'bg-[#1CB0F6]/10' },
    { icon:'trophy' as IconKind, val:`${earnedBadges.length}`,      label: lang === 'ar' ? 'شارة' : lang === 'fr' ? 'badges'  : 'badges',  sublabel: lang === 'ar' ? 'مكتسبة'  : lang === 'fr' ? 'gagnés'    : 'earned', color:'text-[#FAA918]', bg:'bg-[#FAA918]/10' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-5xl text-[#F5F5F5]">

      {/* ── Level-up modal ── */}
      {levelUpMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={() => setLevelUpMsg(null)}
        >
          <div className="bg-card border border-[#1CB0F6]/40 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-[#1CB0F6]/20 animate-star-pop w-full max-w-sm ring-1 ring-[#1CB0F6]/20">
            <div className="w-20 h-20 rounded-full bg-[#1CB0F6]/15 flex items-center justify-center mx-auto mb-5 animate-bounce-slow">
              <Icon kind="partyPop" className="w-10 h-10 text-[#1CB0F6]" />
            </div>
            <h2 className="font-fredoka text-2xl md:text-3xl text-[#1CB0F6] mb-2">{levelUpMsg}</h2>
            <p className="text-[#6F6F6F] font-bold text-sm">Keep going — you&apos;re unstoppable!</p>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-5 py-3 rounded-2xl',
        'bg-card/95 backdrop-blur-sm border border-[#14D4F4]/40 text-[#14D4F4] font-bold text-sm shadow-xl shadow-[#14D4F4]/10',
        'transition-all duration-400 flex items-center gap-2',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        <Icon kind="sparkle" className="w-4 h-4 shrink-0" />
        {toast}
      </div>

      {/* ── Wallet Balance Banner ── */}
      {balance != null && (
        <Link
          href="/dashboard/shop"
          className="flex items-center justify-between gap-4 px-5 py-4 mb-6 md:mb-8 rounded-3xl bg-card border border-white/10 hover:border-yellow-400/40 transition-all duration-200 animate-slide-up group"
        >
          {/* Left: icon + amount */}
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border',
              balance > 0
                ? 'bg-yellow-400/15 border-yellow-400/30'
                : 'bg-white/5 border-white/10 opacity-50'
            )}>
              <Icon kind="coin" className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                {lang === 'ar' ? 'رصيدك' : lang === 'fr' ? 'Ton solde' : 'Your balance'}
              </div>
              {balance > 0 ? (
                <div className="font-fredoka text-2xl md:text-3xl text-yellow-400 leading-none">
                  {balance.toLocaleString()}
                </div>
              ) : (
                <div className="text-sm font-semibold text-white/40">
                  {lang === 'ar'
                    ? 'أكمل التحديات لكسب العملات!'
                    : lang === 'fr'
                    ? 'Complète des défis pour gagner des pièces !'
                    : 'Complete challenges to earn coins!'}
                </div>
              )}
            </div>
          </div>

          {/* Right: CTA pill */}
          <div className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-bold group-hover:bg-yellow-400/20 transition-all duration-200">
            {balance > 0
              ? (lang === 'ar' ? 'المتجر' : lang === 'fr' ? 'Boutique' : 'Shop')
              : (lang === 'ar' ? 'كيف أكسب؟' : lang === 'fr' ? 'Comment gagner ?' : 'How to earn?')}
            <Icon kind="chevronRight" className="w-3.5 h-3.5" />
          </div>
        </Link>
      )}

      {/* ── Greeting ── */}
      <div className="mb-6 md:mb-8 animate-slide-up">
        <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl mb-1 leading-tight text-[#F5F5F5]">
          {greetings[profile.age_group] || greetings.pro}
        </h1>
        <p className="text-[#6F6F6F] font-semibold text-sm md:text-base flex items-center gap-1.5">
          <Icon kind={streak > 0 ? 'fire' : 'seedling'} className={cn('w-4 h-4 shrink-0', streak > 0 ? 'text-[#FAA918]' : 'text-[#3CB371]')} />
          {streakMsg}
        </p>
      </div>

      {/* ── Start Learning ── */}
      <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 mb-5 md:mb-6 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1CB0F6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1CB0F6]/15 flex items-center justify-center shrink-0 hidden sm:flex">
              <Icon kind="rocket" className="w-5.5 h-5.5 text-[#1CB0F6]" />
            </div>
            <div>
              <h2 className="font-fredoka text-xl md:text-2xl mb-1 text-[#F5F5F5]">Continue Your Journey</h2>
              <p className="text-[#6F6F6F] text-sm font-semibold">Master new skills and earn more XP today!</p>
            </div>
          </div>
          <Link
            href="/dashboard/skills"
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] text-black text-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1CB0F6]/25 transition-all duration-200"
          >
            Start
          </Link>
        </div>
      </div>

      {/* ── XP Card ── */}
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
              <Icon kind={s.icon} className={cn('w-5 h-5 mx-auto mb-1.5', s.color)} />
              <div className={cn('font-fredoka text-xl md:text-2xl leading-none mb-0.5', s.color)}>{s.val}</div>
              <div className="text-[#F5F5F5] font-extrabold text-xs">{s.label}</div>
              <div className="text-[#6F6F6F] text-xs font-bold hidden sm:block">{s.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">

        {/* ── Daily Challenge ── */}
        <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#2B70C9]/6 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4 gap-2">
            <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5] flex items-center gap-2">
              <Icon kind="bolt" className="w-5 h-5 text-[#FAA918]" /> Today&apos;s Challenge
            </h2>
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
                  'w-full py-3 md:py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                  isChallengeComplete
                    ? 'bg-[#6F6F6F]/15 text-[#6F6F6F] border border-[#6F6F6F]/25 cursor-default'
                    : 'bg-gradient-to-r from-[#1CB0F6] to-[#14D4F4] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1CB0F6]/25 active:translate-y-0 disabled:opacity-50'
                )}
              >
                {isPending ? (
                  <><Icon kind="hourglass" className="w-4 h-4" /> Saving...</>
                ) : isChallengeComplete ? (
                  <><Icon kind="check" className="w-4 h-4" /> Challenge Complete!</>
                ) : (
                  <><Icon kind="target" className="w-4 h-4" /> Mark as Done</>
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-[#6F6F6F] font-bold text-sm flex flex-col items-center gap-2">
              <Icon kind="sunrise" className="w-7 h-7 text-[#6F6F6F]/60" />
              No challenge today — check back tomorrow!
            </div>
          )}
        </div>

        {/* ── Badges ── */}
        <div className="relative bg-card rounded-3xl p-5 md:p-6 border border-white/5 shadow-xl shadow-black/20 animate-slide-up overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FAA918]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4">
            <h2 className="font-fredoka text-lg md:text-xl text-[#F5F5F5] flex items-center gap-2">
              <Icon kind="trophy" className="w-5 h-5 text-[#FAA918]" /> Badges
            </h2>
            <Link href="/dashboard/badges" className="text-[#1CB0F6] text-xs font-bold hover:underline underline-offset-2 flex items-center gap-1">
              See all <Icon kind="chevronRight" className="w-3 h-3" />
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
            <div className="text-center py-6 text-[#6F6F6F] font-semibold text-sm flex flex-col items-center gap-2">
              <Icon kind="seedling" className="w-6 h-6 text-[#3CB371]" />
              No badges yet — complete your first lesson!
            </div>
          )}

          {lockedBadges.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[#6F6F6F] mb-2 flex items-center gap-1.5">
                <Icon kind="lock" className="w-3.5 h-3.5" /> Coming next:
              </div>
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

        {/* ── Dream Project ── */}
        <div
          className="lg:col-span-2 relative rounded-3xl p-5 md:p-6 shadow-xl animate-slide-up overflow-hidden border border-[#2B70C9]/15"
          style={{ background: 'linear-gradient(135deg, rgba(28,176,246,0.12) 0%, rgba(20,212,244,0.08) 100%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#14D4F4]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#2B70C9]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="font-fredoka text-lg md:text-xl mb-0.5 text-[#F5F5F5] flex items-center gap-2">
              <Icon kind="star" className="w-5 h-5 text-[#FAA918]" /> Your Dream Project
            </h2>
            <p className="text-xs md:text-sm font-semibold text-[#6F6F6F] mb-4">Everything you learn is building toward this:</p>

            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-sm font-semibold leading-relaxed italic text-[#F5F5F5]/85 mb-5 border border-white/8">
              &ldquo;{profile.dream_project || 'Not set yet — update your profile!'}&rdquo;
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/coach"
                className="w-full sm:w-auto text-center px-5 md:px-6 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2B70C9]/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icon kind="robot" className="w-4 h-4" /> Talk to your AI Coach
                <Icon kind="chevronRight" className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShareCard({
                  type:        'level',
                  childName:   profile.display_name,
                  childAvatar: profile.avatar ?? '🧑‍🚀',
                  newLevel:    level,
                  levelTitle:  getLevelTitle(level),
                  totalXP:     xp,
                })}
                className="w-full sm:w-auto text-center px-5 md:px-6 py-3 rounded-2xl font-extrabold text-sm border border-[#1CB0F6]/30 text-[#1CB0F6] hover:bg-[#1CB0F6]/10 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icon kind="share" className="w-4 h-4" /> Share my progress
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