// File: ProfileClients.tsx
// Placement: components/dashboard/ProfileClients.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getLevel, XP_PER_LEVEL } from '@/lib/xp'
import { signOut, redeemClassCode } from '@/lib/supabase/queries'
import BadgeIcon from './BadgeIcon'
import Link from 'next/link'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
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
}

export default function ProfileClient({
  profile, progress, totalLessons, userBadges, allBadges, weekActivity, classInfo,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const handleRedeem = () => {
    if (!codeInput.trim()) return
    setRedeeming(true)
    setCodeError('')
    startTransition(async () => {
      const result = await redeemClassCode(codeInput)
      setRedeeming(false)
      if (!result.success) {
        setCodeError(result.error ?? 'Invalid code')
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
  const bestStreak = progress?.longest_streak ?? progress?.streak ?? 0
  const isPro = profile?.subscription === 'pro'

  const earnedBadgeIds = new Set(userBadges.map((b: any) => b.badge_id))
  const displayName: string = profile?.display_name || 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div
      className="min-h-screen px-5 py-8 sm:px-8 sm:py-10"
      style={{ background: 'var(--energetic-bg)', color: 'var(--energetic-text)' }}
    >
      <div className="w-full mx-auto" style={{ maxWidth: 1040 }}>

        {/* ── Top row ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <span
            className="text-xs font-black tracking-widest uppercase"
            style={{ color: 'var(--energetic-text-dim)' }}
          >
            Profile
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs font-bold transition-colors"
            style={{ color: 'var(--energetic-text-muted)' }}
          >
            Sign out
          </button>
        </div>

        {/* ── Main responsive grid: content + sidebar ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">

          {/* ── Main column ─────────────────────────────────── */}
          <div className="flex flex-col gap-6 sm:gap-8">

            {/* Identity card */}
            <div
              className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl shrink-0"
                style={{ background: 'var(--energetic-accent)', color: '#053D35' }}
              >
                {initial}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg mb-1" style={{ color: 'var(--energetic-text)' }}>
                  {displayName}
                </p>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--energetic-text-muted)' }}>
                  Level {level} · {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
                </p>
                <span
                  className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full inline-block"
                  style={{
                    background: isPro ? 'var(--energetic-reward)' : 'var(--energetic-surface-alt)',
                    color: isPro ? '#053D35' : 'var(--energetic-text-muted)',
                  }}
                >
                  {isPro ? 'Pro plan' : 'Free plan'}
                </span>
              </div>
            </div>

            {/* This week's pearls */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
            >
              <p
                className="text-xs font-black tracking-widest uppercase mb-4"
                style={{ color: 'var(--energetic-text-dim)' }}
              >
                This week&apos;s pearls
              </p>
              <div className="flex justify-between sm:justify-start sm:gap-6">
                {weekActivity.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        background: day.active
                          ? 'var(--energetic-reward)'
                          : day.isFuture
                          ? 'var(--energetic-surface-alt)'
                          : '#D9F1EC',
                        boxShadow: day.active ? '0 0 8px rgba(255,185,48,0.35)' : 'none',
                      }}
                    />
                    <span className="text-[9px] font-bold" style={{ color: 'var(--energetic-text-dim)' }}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            {/* Badges */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
            >
              <p
                className="text-xs font-black tracking-widest uppercase mb-4"
                style={{ color: 'var(--energetic-text-dim)' }}
              >
                Badges earned
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {allBadges.map((badge: any) => {
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
                          badgeDescription: earned ? badge.description : `Locked — ${badge.condition}`,
                          rarity: badge.rarity,
                          xpBonus: badge.xp_bonus ?? 0,
                        })
                      }
                      className="flex justify-center"
                    >
                      <BadgeIcon badgeId={badge.id} fallbackEmoji={badge.emoji} rarity={badge.rarity} earned={earned} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Class info or class-code redemption */}
            {classInfo ? (
              <div
                className="rounded-2xl px-5 py-5"
                style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className="text-xs font-black tracking-widest uppercase"
                    style={{ color: 'var(--energetic-text-dim)' }}
                  >
                    My class
                  </p>
                  {profile?.school_id && (
                    <span
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--energetic-surface-alt)', color: 'var(--energetic-text-muted)' }}
                    >
                      School account
                    </span>
                  )}
                </div>
                <p className="font-display font-bold text-sm" style={{ color: 'var(--energetic-text)' }}>
                  {classInfo.className}
                </p>
                {classInfo.teacherName && (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--energetic-text-muted)' }}>
                    Teacher: {classInfo.teacherName}
                  </p>
                )}
              </div>
            ) : profile?.school_id ? (
              // B2B2C student: belongs to a school but no class section assigned yet.
              // No code input here — enrollment is the school's job, not the student's.
              <div
                className="rounded-2xl px-5 py-5"
                style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-xs font-black tracking-widest uppercase"
                    style={{ color: 'var(--energetic-text-dim)' }}
                  >
                    My class
                  </p>
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--energetic-surface-alt)', color: 'var(--energetic-text-muted)' }}
                  >
                    School account
                  </span>
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--energetic-text-muted)' }}>
                  Not assigned to a class yet — ask your teacher or school admin to add you.
                </p>
              </div>
            ) : (
              // B2C student: self-serve, so the code input applies here.
              <div
                className="rounded-2xl px-5 py-5"
                style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
              >
                <p
                  className="text-xs font-black tracking-widest uppercase mb-3"
                  style={{ color: 'var(--energetic-text-dim)' }}
                >
                  Have a class code?
                </p>
                <div className="flex gap-2">
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="e.g. MATH5B-7X2K"
                    className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                    style={{
                      background: 'var(--energetic-surface-alt)',
                      color: 'var(--energetic-text)',
                      border: '1px solid transparent',
                    }}
                  />
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming || !codeInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-black disabled:opacity-40"
                    style={{ background: 'var(--energetic-accent)', color: '#053D35' }}
                  >
                    {redeeming ? '...' : 'Join'}
                  </button>
                </div>
                {codeError && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--color-error)' }}>
                    {codeError}
                  </p>
                )}
              </div>
            )}

            {/* Stats */}
            <div
              className="rounded-2xl px-5 py-5 flex justify-between"
              style={{ background: 'var(--energetic-surface)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="text-center">
                <p className="font-display font-black text-lg" style={{ color: 'var(--energetic-text)' }}>
                  {xp.toLocaleString()}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--energetic-text-dim)' }}>
                  Total XP
                </p>
              </div>
              <div className="text-center">
                <p className="font-display font-black text-lg" style={{ color: 'var(--energetic-text)' }}>
                  {totalLessons}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--energetic-text-dim)' }}>
                  Lessons
                </p>
              </div>
              <div className="text-center">
                <p className="font-display font-black text-lg" style={{ color: 'var(--energetic-text)' }}>
                  {bestStreak}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--energetic-text-dim)' }}>
                  Best streak
                </p>
              </div>
            </div>

            {/* Upgrade card, Free plan only */}
           {/* Upgrade card, Free plan only */}
            {!isPro && (
              <Link
                href="/upgrade"
                className="flex items-center justify-between rounded-2xl px-5 py-4 transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--raw-depth)' }}
              >
                <div>
                  <p className="font-display font-bold text-sm text-white mb-0.5">
                    Unlock every track
                  </p>
                  <p className="text-xs text-white/50">Plulai Pro · cancel anytime</p>
                </div>
                <span
                  className="text-xs font-black px-3 py-2 rounded-lg"
                  style={{ background: 'var(--raw-gold)', color: 'var(--raw-depth)' }}
                >
                  Upgrade
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}