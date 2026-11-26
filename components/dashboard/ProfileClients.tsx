// File: ProfileClients.tsx
// Placement: components/dashboard/ProfileClients.tsx
//
// REDESIGN — matches the reference mock: identity card (avatar, level shield,
// plan pill, XP bar, grade / teacher / school line), "This week's pearls",
// then Badges with All / Earned / Locked tabs.
//
// UNCHANGED: props, level/XP math (getLevel, XP_PER_LEVEL), sign out, class
// code redemption (B2C only), the school-account notes, the Pro upgrade card,
// and tapping a badge to open the share card.
//
// NEW (optional / safe): a `language` prop ('en' | 'ar' | 'fr'; default 'en'),
// and a stats row (Total XP, Lessons, Best streak) that uses your icons.
//
// ASSETS (read from ICON_BASE, default /public/icons/): profile-pearl.png,
// profile-level-shield.png, profile-total-xp.png, profile-lessons.png,
// profile-best-streak.png, profile-grade.png, profile-teacher.png,
// profile-school-account.png. The sidebar is not touched.
'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getLevel, XP_PER_LEVEL } from '@/lib/xp'
import { signOut, redeemClassCode } from '@/lib/supabase/queries'
import BadgeIcon from './BadgeIcon'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'

const ICON_BASE = '/icons'
const ic = (n: string) => `${ICON_BASE}/${n}.png`

interface WeekDay { label: string; active: boolean; isFuture: boolean }
interface ClassInfo { className: string | null; teacherName: string | null }

interface Props {
  profile: any
  progress: any
  totalLessons: number
  userBadges: any[]
  allBadges: any[]
  weekActivity: WeekDay[]
  classInfo: ClassInfo | null
  language?: string
}

const UI = {
  en: {
    profile: 'Profile', signOut: 'Sign out', level: 'Level', pro: 'Pro plan', free: 'Free plan',
    teacher: 'Teacher', school: 'School account', notAssigned: 'Not assigned to a class yet — ask your teacher or school admin to add you.',
    pearls: "This week's pearls", badges: 'Badges', all: 'All', earned: 'Earned', locked: 'Locked',
    noBadges: 'No badges here yet.',
    totalXp: 'Total XP', lessons: 'Lessons', bestStreak: 'Best streak',
    codeTitle: 'Have a class code?', codePh: 'e.g. MATH5B-7X2K', join: 'Join', invalid: 'Invalid code',
    unlock: 'Unlock every track', proSub: 'Plulai Pro · cancel anytime', upgrade: 'Upgrade',
    lockedDesc: (c: string) => `Locked — ${c}`,
  },
  ar: {
    profile: 'الملف الشخصي', signOut: 'تسجيل الخروج', level: 'المستوى', pro: 'باقة برو', free: 'الباقة المجانية',
    teacher: 'المعلّم', school: 'حساب مدرسة', notAssigned: 'لم يتم تعيينك في صف بعد — اطلب من معلّمك أو إدارة المدرسة إضافتك.',
    pearls: 'لآلئ هذا الأسبوع', badges: 'الأوسمة', all: 'الكل', earned: 'المكتسبة', locked: 'المقفلة',
    noBadges: 'لا توجد أوسمة هنا بعد.',
    totalXp: 'مجموع النقاط', lessons: 'الدروس', bestStreak: 'أفضل سلسلة',
    codeTitle: 'هل لديك رمز صف؟', codePh: 'مثال: MATH5B-7X2K', join: 'انضم', invalid: 'رمز غير صالح',
    unlock: 'افتح كل المسارات', proSub: 'Plulai برو · ألغِ في أي وقت', upgrade: 'ترقية',
    lockedDesc: (c: string) => `مقفل — ${c}`,
  },
  fr: {
    profile: 'Profil', signOut: 'Se déconnecter', level: 'Niveau', pro: 'Forfait Pro', free: 'Forfait gratuit',
    teacher: 'Enseignant', school: 'Compte école', notAssigned: 'Pas encore dans une classe — demande à ton enseignant ou à l\'administration de t\'ajouter.',
    pearls: 'Les perles de la semaine', badges: 'Badges', all: 'Tous', earned: 'Obtenus', locked: 'Verrouillés',
    noBadges: 'Aucun badge ici pour l\'instant.',
    totalXp: 'XP total', lessons: 'Leçons', bestStreak: 'Meilleure série',
    codeTitle: 'Tu as un code de classe ?', codePh: 'ex. MATH5B-7X2K', join: 'Rejoindre', invalid: 'Code invalide',
    unlock: 'Débloque tous les parcours', proSub: 'Plulai Pro · résiliable à tout moment', upgrade: 'Passer Pro',
    lockedDesc: (c: string) => `Verrouillé — ${c}`,
  },
}

const CARD = 'rounded-[28px] bg-[#FFFCF7] shadow-[0_4px_20px_rgba(11,59,68,0.07)] ring-1 ring-[#F0E7DA]'

function Png({ name, size, className }: { name: string; size: number; className?: string }) {
  return <Image src={ic(name)} alt="" width={size} height={size} className={cn('shrink-0 object-contain', className)} />
}

export default function ProfileClient({
  profile, progress, totalLessons, userBadges, allBadges, weekActivity, classInfo, language = 'en',
}: Props) {
  const lang = (language === 'ar' || language === 'fr' ? language : 'en') as 'en' | 'ar' | 'fr'
  const t = UI[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const router = useRouter()
  const [, startTransition] = useTransition()
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [badgeTab, setBadgeTab] = useState<'all' | 'earned' | 'locked'>('all')

  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const handleRedeem = () => {
    if (!codeInput.trim()) return
    setRedeeming(true)
    setCodeError('')
    startTransition(async () => {
      const result = await redeemClassCode(codeInput)
      setRedeeming(false)
      if (!result.success) {
        setCodeError(result.error ?? t.invalid)
        return
      }
      router.refresh()
    })
  }

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
      router.push('/auth/login')
      router.refresh()
    })
  }

  const xp = progress?.xp ?? 0
  const level = getLevel(xp)
  const xpInLevel = xp % XP_PER_LEVEL
  const levelPct = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))
  const bestStreak = progress?.longest_streak ?? progress?.streak ?? 0
  const isPro = profile?.subscription === 'pro'
  const isSchool = !!profile?.school_id

  const earnedBadgeIds = new Set(userBadges.map((b: any) => b.badge_id))
  const displayName: string = profile?.display_name || 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  const shownBadges = allBadges.filter((b: any) => {
    const earned = earnedBadgeIds.has(b.id)
    return badgeTab === 'all' ? true : badgeTab === 'earned' ? earned : !earned
  })

  const tabs: { key: 'all' | 'earned' | 'locked'; label: string }[] = [
    { key: 'all', label: t.all }, { key: 'earned', label: t.earned }, { key: 'locked', label: t.locked },
  ]

  return (
    <div dir={dir} className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#FBF5EC] px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] text-[#0B3B44] sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">

        {/* ── Top row ─────────────────────────────────────── */}
        <header className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <h1 className="text-[32px] font-extrabold leading-tight sm:text-[48px]">{t.profile}</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[15px] font-bold text-[#5E7F83] transition-colors hover:bg-white hover:text-[#0B3B44] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60 sm:text-[18px]"
          >
            <svg className="h-6 w-6 rtl:-scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M15 8l4 4-4 4" /><path d="M19 12H9" />
            </svg>
            {t.signOut}
          </button>
        </header>

        <div className="flex flex-col gap-5">

          {/* ── Identity card ─────────────────────────────── */}
          <section className={cn(CARD, 'flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7')}>
            {/* avatar with orbit */}
            <div className="relative mx-auto h-28 w-28 shrink-0 sm:mx-0 sm:h-[130px] sm:w-[130px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 130 130" fill="none" aria-hidden>
                <ellipse cx="65" cy="68" rx="62" ry="40" transform="rotate(-28 65 68)" stroke="#BFEFE5" strokeWidth={2} />
                <path d="M104 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC21A" />
                <path d="M16 106l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#2DD4BF" />
              </svg>
              <span className="absolute inset-[14%] flex items-center justify-center rounded-full bg-[#9FF0E0] text-[44px] font-extrabold text-[#0B3B44] sm:text-[56px]">
                {initial}
              </span>
            </div>

            <div className="hidden h-24 w-px shrink-0 bg-[#E6DFD1] sm:block" />

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[26px] font-extrabold leading-tight sm:text-[40px]">{displayName}</h2>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex shrink-0 items-center gap-3">
                  <Png name="profile-level-shield" size={44} className="h-9 w-9 sm:h-11 sm:w-11" />
                  <span className="text-[19px] font-extrabold text-[#0B6B63] sm:text-[24px]">{t.level} {level}</span>
                  <span className={cn(
                    'rounded-full px-4 py-1.5 text-[13px] font-extrabold sm:text-[16px]',
                    isPro ? 'bg-[#FFC21A] text-[#402F12]' : 'bg-[#C9F5EE] text-[#0B6B63]'
                  )}>
                    {isPro ? t.pro : t.free}
                  </span>
                </div>

                {/* XP bar */}
                <div
                  className="relative h-8 w-full overflow-hidden rounded-full bg-[#D3F3EC] sm:h-9 sm:flex-1"
                  role="progressbar" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xpInLevel}
                >
                  <div className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] transition-all duration-700" style={{ width: `${Math.max(levelPct, 6)}%` }} />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-[13px] font-bold tabular-nums text-[#0B6B63] sm:text-[17px]">
                    {xpInLevel} / {XP_PER_LEVEL} XP
                  </span>
                </div>
              </div>

              {/* grade · teacher · school */}
              {(classInfo || isSchool) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-semibold text-[#5E7F83] sm:text-[17px]">
                  {classInfo?.className && (
                    <span className="inline-flex items-center gap-2"><Png name="profile-grade" size={24} className="h-6 w-6" />{classInfo.className}</span>
                  )}
                  {classInfo?.teacherName && (
                    <span className="inline-flex items-center gap-2"><Png name="profile-teacher" size={24} className="h-6 w-6" />{t.teacher}: {classInfo.teacherName}</span>
                  )}
                  {isSchool && (
                    <span className="inline-flex items-center gap-2"><Png name="profile-school-account" size={24} className="h-6 w-6" />{t.school}</span>
                  )}
                </div>
              )}
              {!classInfo && isSchool && (
                <p className="mt-2 text-[13.5px] font-medium text-[#6F8E8B] sm:text-[15px]">{t.notAssigned}</p>
              )}
            </div>
          </section>

          {/* ── Stats ─────────────────────────────────────── */}
          <section className="grid grid-cols-3 gap-3 sm:gap-5" aria-label="Stats">
            {[
              { icon: 'profile-total-xp', value: xp.toLocaleString('en-US'), label: t.totalXp },
              { icon: 'profile-lessons', value: String(totalLessons), label: t.lessons },
              { icon: 'profile-best-streak', value: String(bestStreak), label: t.bestStreak },
            ].map(s => (
              <div key={s.label} className={cn(CARD, 'flex flex-col items-center gap-1 px-2 py-4 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-5 sm:text-start')}>
                <Png name={s.icon} size={56} className="h-10 w-10 sm:h-14 sm:w-14" />
                <div className="min-w-0">
                  <p className="text-[20px] font-extrabold leading-tight tabular-nums sm:text-[30px]">{s.value}</p>
                  <p className="truncate text-[11.5px] font-bold text-[#6F8E8B] sm:text-[15px]">{s.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── This week's pearls ────────────────────────── */}
          <section className="rounded-[28px] bg-gradient-to-br from-[#DDF6EF] to-[#EAFBF6] p-5 ring-1 ring-[#CDEFE6] shadow-[0_4px_20px_rgba(11,59,68,0.05)] sm:p-7">
            <h2 className="mb-4 text-[24px] font-extrabold sm:text-[32px]">{t.pearls}</h2>
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {weekActivity.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  {day.active ? (
                    <Png name="profile-pearl" size={80} className="h-10 w-10 drop-shadow-[0_4px_8px_rgba(212,162,76,0.4)] sm:h-[72px] sm:w-[72px]" />
                  ) : (
                    <span
                      className={cn(
                        'h-9 w-9 rounded-full border-2 border-[#19D3BE] bg-[#D4F6EE] sm:h-[68px] sm:w-[68px]',
                        day.isFuture && 'opacity-60'
                      )}
                    />
                  )}
                  <span className="text-[12px] font-bold text-[#0B6B63] sm:text-[19px]">{day.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Badges ────────────────────────────────────── */}
          <section className={cn(CARD, 'p-5 sm:p-7')}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[24px] font-extrabold sm:text-[34px]">{t.badges}</h2>
              <div role="tablist" aria-label={t.badges} className="inline-flex gap-1 rounded-full bg-[#DDF6EF] p-1">
                {tabs.map(x => (
                  <button
                    key={x.key}
                    type="button"
                    role="tab"
                    aria-selected={badgeTab === x.key}
                    onClick={() => setBadgeTab(x.key)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-[14px] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60 sm:px-6 sm:py-2 sm:text-[18px]',
                      badgeTab === x.key
                        ? 'bg-gradient-to-r from-[#22D3BE] to-[#14B8A6] text-[#0B3B44] shadow-[0_4px_10px_rgba(20,184,166,0.3)]'
                        : 'text-[#0B6B63]'
                    )}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>

            {shownBadges.length === 0 ? (
              <p className="py-6 text-center text-[16px] font-medium text-[#6F8E8B]">{t.noBadges}</p>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 sm:gap-4 lg:grid-cols-8">
                {shownBadges.map((badge: any) => {
                  const earned = earnedBadgeIds.has(badge.id)
                  return (
                    <button
                      key={badge.id}
                      onClick={() =>
                        setShareCard({
                          type: 'badge',
                          childName: displayName,
                          childAvatar: initial,
                          badgeId: badge.id,
                          badgeName: badge.name,
                          badgeEmoji: badge.emoji,
                          badgeDescription: earned ? badge.description : t.lockedDesc(badge.condition),
                          rarity: badge.rarity,
                          xpBonus: badge.xp_bonus ?? 0,
                        })
                      }
                      aria-label={badge.name}
                      className="flex justify-center rounded-2xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60"
                    >
                      <BadgeIcon badgeId={badge.id} fallbackEmoji={badge.emoji} rarity={badge.rarity} earned={earned} />
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Class code (B2C) + upgrade (free plan) ────── */}
          {(!classInfo && !isSchool) || !isPro ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {!classInfo && !isSchool && (
                <section className={cn(CARD, 'p-5 sm:p-7')}>
                  <p className="mb-3 text-[20px] font-extrabold sm:text-[24px]">{t.codeTitle}</p>
                  <div className="flex gap-2">
                    <input
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder={t.codePh}
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-2xl border-2 border-[#E6DFD1] bg-white px-4 py-3 text-[15px] font-semibold text-[#0B3B44] outline-none transition-all placeholder:text-[#9DB0AC] focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/15"
                    />
                    <button
                      onClick={handleRedeem}
                      disabled={redeeming || !codeInput.trim()}
                      className="rounded-2xl bg-gradient-to-r from-[#22D3BE] to-[#14B8A6] px-6 text-[15px] font-extrabold text-[#0B3B44] shadow-[0_6px_14px_rgba(20,184,166,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      {redeeming ? '...' : t.join}
                    </button>
                  </div>
                  {codeError && <p className="mt-2 text-[13.5px] font-bold text-[#E5533D]">{codeError}</p>}
                </section>
              )}

              {!isPro && (
                <Link
                  href="/upgrade"
                  className="flex items-center justify-between gap-4 rounded-[28px] bg-gradient-to-br from-[#0B5059] to-[#073E47] p-5 text-white shadow-[0_10px_28px_rgba(11,59,68,0.25)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] sm:p-7"
                >
                  <div className="min-w-0">
                    <p className="text-[19px] font-extrabold sm:text-[24px]">{t.unlock}</p>
                    <p className="mt-0.5 text-[14px] font-medium text-white/60">{t.proSub}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#FFC21A] px-5 py-2.5 text-[15px] font-extrabold text-[#402F12]">{t.upgrade}</span>
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}