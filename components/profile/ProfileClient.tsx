// File: ProfileClient.tsx
// Placement: components/profile/ProfileClient.tsx
'use client'

import { BRAND } from '@/lib/brand'
import { getLevel, XP_PER_LEVEL } from '@/lib/xp'
import { signOutAction } from '@/app/profile/actions'
import Link from 'next/link'

interface WeekDay { label: string; active: boolean; isFuture: boolean }

interface Props {
  profile: any
  progress: any
  totalLessons: number
  userBadges: any[]
  allBadges: any[]
  weekActivity: WeekDay[]
}

export default function ProfileClient({
  profile, progress, totalLessons, userBadges, allBadges, weekActivity,
}: Props) {
  const xp = progress?.xp ?? 0
  const level = getLevel(xp)
  const bestStreak = progress?.longest_streak ?? progress?.streak ?? 0
  const isPro = profile?.subscription === 'pro'

  const earnedBadgeIds = new Set(userBadges.map((b: any) => b.badge_id))
  const displayName: string = profile?.display_name || profile?.full_name || 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-10 text-[#F5F5F5]"
      style={{ background: BRAND.depth }}
    >
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 440 }}>

        {/* ── Top row ─────────────────────────────────────── */}
        <div className="w-full flex items-center justify-between mb-8">
          <span className="text-xs font-black tracking-widest text-white/30 uppercase">
            Profile
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* ── Avatar + name + level ───────────────────────── */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl mb-3"
          style={{ background: BRAND.reefBright, color: '#053D35' }}
        >
          {initial}
        </div>
        <p className="font-display font-bold text-lg text-white mb-1">{displayName}</p>
        <p className="text-xs text-white/40 font-semibold mb-3">
          Level {level} · {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
        </p>
        <span
          className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full mb-8"
          style={{
            background: isPro ? BRAND.gold : 'rgba(255,255,255,0.08)',
            color: isPro ? BRAND.ink : 'rgba(255,255,255,0.4)',
          }}
        >
          {isPro ? 'Pro plan' : 'Free plan'}
        </span>

        {/* ── This week's pearls ──────────────────────────── */}
        <div className="w-full mb-8">
          <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">
            This week&apos;s pearls
          </p>
          <div className="flex justify-between">
            {weekActivity.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: day.active
                      ? BRAND.sungold
                      : day.isFuture
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.12)',
                    boxShadow: day.active ? '0 0 8px rgba(255,185,48,0.4)' : 'none',
                  }}
                />
                <span className="text-[9px] font-bold text-white/25">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Badges ───────────────────────────────────────── */}
        <div className="w-full mb-8">
          <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">
            Badges earned
          </p>
          <div className="grid grid-cols-4 gap-2">
            {allBadges.map((badge: any) => {
              const earned = earnedBadgeIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  title={badge.name}
                  className="aspect-square rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    opacity: earned ? 1 : 0.3,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ background: earned ? BRAND.gold : 'rgba(255,255,255,0.15)' }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────── */}
        <div className="w-full flex justify-between rounded-2xl px-5 py-4 mb-8"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="text-center">
            <p className="font-display font-black text-lg text-white">{xp.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Total XP</p>
          </div>
          <div className="text-center">
            <p className="font-display font-black text-lg text-white">{totalLessons}</p>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Lessons</p>
          </div>
          <div className="text-center">
            <p className="font-display font-black text-lg text-white">{bestStreak}</p>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Best streak</p>
          </div>
        </div>

        {/* ── Upgrade card, Free plan only ─────────────────── */}
        {!isPro && (
          <Link
            href="/upgrade"
            className="w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-transform hover:-translate-y-0.5"
            style={{ background: '#123A42' }}
          >
            <div>
              <p className="font-display font-bold text-sm text-white mb-0.5">
                Unlock every track
              </p>
              <p className="text-xs text-white/40">Plulai Pro · cancel anytime</p>
            </div>
            <span
              className="text-xs font-black px-3 py-2 rounded-lg"
              style={{ background: BRAND.gold, color: BRAND.ink }}
            >
              Upgrade
            </span>
          </Link>
        )}

      </div>
    </div>
  )
}