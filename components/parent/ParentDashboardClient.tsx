'use client'
// components/parent/ParentDashboardClient.tsx
// Beautiful read-only parent progress view
import { cn } from '@/lib/utils'

const RARITY_COLORS: Record<string, string> = {
  common:    'text-gray-300  border-gray-600/50   bg-gray-800/30',
  rare:      'text-blue-300  border-blue-500/40   bg-blue-900/20',
  epic:      'text-purple-300 border-purple-500/40 bg-purple-900/20',
  legendary: 'text-yellow-300 border-yellow-500/40 bg-yellow-900/20',
}

const TRACK_COLORS: Record<string, string> = {
  coding:           'text-blue-400  bg-blue-900/20  border-blue-500/30',
  ai:               'text-purple-400 bg-purple-900/20 border-purple-500/30',
  entrepreneurship: 'text-amber-400  bg-amber-900/20  border-amber-500/30',
}

interface Props {
  child:         any
  progress:      any
  lessons:       any[]
  badges:        any[]
  skillProgress: any[]
  challenges:    any[]
}

export default function ParentDashboardClient({ child, progress, lessons, badges, skillProgress, challenges }: Props) {
  const xp           = progress?.xp ?? 0
  const level        = progress?.level ?? 1
  const streak       = progress?.streak ?? 0
  const longestStreak = progress?.longest_streak ?? 0
  const totalMins    = progress?.total_time_mins ?? 0
  const timeStr      = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`
  const lastActive   = progress?.last_active_date
    ? new Date(progress.last_active_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : 'Not yet'

  const completedSkills = skillProgress.filter((s: any) => s.progress_pct >= 100).length
  const memberSince = child?.created_at
    ? new Date(child.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : ''

  // Recent activity — last 10 lesson completions
  const recentLessons = lessons.slice(0, 10)

  // Weekly activity — count lessons completed each of last 7 days
  const today = new Date()
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = lessons.filter((l: any) =>
      l.completed_at && l.completed_at.startsWith(dateStr)
    ).length
    return { day: d.toLocaleDateString('en-GB', { weekday: 'short' }), count }
  })
  const maxActivity = Math.max(...weekActivity.map(d => d.count), 1)

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1a1a3e] to-[#0d0d2e] border-b border-white/8 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="font-fredoka text-2xl bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] bg-clip-text text-transparent">
              🚀 Plulai
            </span>
            <span className="text-white/30 font-bold">|</span>
            <span className="text-sm font-bold text-white/60">Parent Report</span>
          </div>
          <div className="text-xs font-bold text-white/40">
            Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Child profile card ─────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#1a1a3e] to-[#0d1a2e] border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-[#0d0d2e] border-2 border-purple-500/30 flex items-center justify-center text-5xl flex-shrink-0">
              {child?.avatar ?? '🧑‍🚀'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-fredoka text-3xl mb-1">{child?.display_name ?? 'Your Child'}</h1>
              <div className="flex items-center gap-3 flex-wrap text-sm font-semibold text-white/60">
                <span>Age {child?.age}</span>
                <span>·</span>
                <span className="capitalize">{child?.age_group} Explorer</span>
                <span>·</span>
                <span>Member since {memberSince}</span>
              </div>
              {child?.dream_project && (
                <p className="mt-2 text-sm font-semibold text-white/80 italic">
                  💭 "{child.dream_project}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Key stats grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { emoji: '⚡', value: xp.toLocaleString(),   label: 'Total XP',        sub: `Level ${level}`,             color: 'border-yellow-500/30 bg-yellow-900/10' },
            { emoji: '🔥', value: `${streak} days`,       label: 'Current Streak',  sub: `Best: ${longestStreak} days`, color: 'border-orange-500/30 bg-orange-900/10' },
            { emoji: '📚', value: `${lessons.length}`,    label: 'Lessons Done',    sub: `${challenges.length} challenges`, color: 'border-blue-500/30 bg-blue-900/10' },
            { emoji: '⏱',  value: timeStr,                label: 'Time Learning',   sub: `Last active: ${lastActive}`,  color: 'border-green-500/30 bg-green-900/10' },
          ].map(s => (
            <div key={s.label} className={cn('border rounded-2xl p-5 text-center', s.color)}>
              <div className="text-3xl mb-2">{s.emoji}</div>
              <div className="font-fredoka text-2xl mb-0.5">{s.value}</div>
              <div className="font-bold text-sm mb-1">{s.label}</div>
              <div className="text-xs text-white/50 font-semibold">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* ── Weekly activity chart ──────────────────────────── */}
          <div className="lg:col-span-2 bg-[#111128] border border-white/8 rounded-3xl p-6">
            <h2 className="font-fredoka text-xl mb-6">📅 This Week&apos;s Activity</h2>
            <div className="flex items-end gap-3 h-32">
              {weekActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all',
                        day.count > 0 ? 'bg-gradient-to-t from-purple-600 to-blue-500' : 'bg-white/5'
                      )}
                      style={{ height: `${Math.max(4, (day.count / maxActivity) * 96)}px` }}
                    />
                    {day.count > 0 && (
                      <span className="absolute -top-5 text-xs font-bold text-purple-300">{day.count}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white/50">{day.day}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 font-semibold mt-4 text-center">
              Lessons completed per day. Consistent daily practice builds the strongest habits.
            </p>
          </div>

          {/* ── Skills progress ────────────────────────────────── */}
          <div className="bg-[#111128] border border-white/8 rounded-3xl p-6">
            <h2 className="font-fredoka text-xl mb-5">🗺️ Skill Progress</h2>
            {skillProgress.length > 0 ? (
              <div className="space-y-4">
                {skillProgress.map((sp: any) => (
                  <div key={sp.skill_node_id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">{sp.skill_nodes?.emoji ?? '📖'}</span>
                        <span className="text-xs font-bold truncate">{sp.skill_nodes?.title ?? sp.skill_node_id}</span>
                      </div>
                      <span className={cn(
                        'text-xs font-extrabold flex-shrink-0 ml-2',
                        sp.progress_pct >= 100 ? 'text-green-400' : 'text-white/60'
                      )}>
                        {sp.progress_pct >= 100 ? '✅' : `${sp.progress_pct}%`}
                      </span>
                    </div>
                    <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', sp.progress_pct >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-blue-500')}
                        style={{ width: `${sp.progress_pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm font-semibold text-center py-6">No skills started yet</p>
            )}
          </div>
        </div>

        {/* ── Badges earned ─────────────────────────────────── */}
        {badges.length > 0 && (
          <div className="bg-[#111128] border border-white/8 rounded-3xl p-6 mb-6">
            <h2 className="font-fredoka text-xl mb-5">🏆 Badges Earned ({badges.length})</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {badges.map((b: any) => {
                const badge = b.badges ?? {}
                const rarity = badge.rarity ?? 'common'
                return (
                  <div key={b.badge_id} className={cn('border rounded-2xl p-3 text-center', RARITY_COLORS[rarity] ?? RARITY_COLORS.common)}>
                    <div className="text-2xl mb-1">{badge.emoji ?? '🏅'}</div>
                    <div className="text-xs font-bold leading-tight">{badge.name ?? b.badge_id}</div>
                    <div className="text-xs text-white/40 font-semibold mt-1 capitalize">{rarity}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Recent lessons ─────────────────────────────────── */}
        {recentLessons.length > 0 && (
          <div className="bg-[#111128] border border-white/8 rounded-3xl p-6 mb-8">
            <h2 className="font-fredoka text-xl mb-5">📖 Recent Lessons</h2>
            <div className="space-y-3">
              {recentLessons.map((l: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-green-400 font-extrabold text-lg flex-shrink-0">✓</span>
                    <span className="text-sm font-bold truncate text-white/80">{l.lesson_id.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-xs font-bold text-white/40">
                    {l.score_pct && <span className={l.score_pct >= 90 ? 'text-green-400' : 'text-yellow-400'}>{l.score_pct}%</span>}
                    {l.completed_at && (
                      <span>{new Date(l.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Parent tips ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-8">
          <h2 className="font-fredoka text-xl mb-4">💡 Tips for Parents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: '🔥', tip: 'Ask about the streak', detail: 'Kids love talking about their daily streak. A simple "Did you keep your streak today?" keeps them engaged.' },
              { emoji: '🎯', tip: 'Celebrate badges', detail: 'When a new badge appears here, celebrate it together. Recognition is the most powerful motivator for kids.' },
              { emoji: '🚀', tip: 'Discuss the dream project', detail: `${child?.display_name} dreams of: "${child?.dream_project || 'something amazing'}". Ask about their progress on it!` },
            ].map(tip => (
              <div key={tip.tip} className="bg-white/5 rounded-2xl p-4">
                <div className="text-2xl mb-2">{tip.emoji}</div>
                <p className="font-extrabold text-sm mb-1">{tip.tip}</p>
                <p className="text-xs text-white/60 font-semibold leading-relaxed">{tip.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-white/30 font-semibold mt-8">
          🔒 This link is private and expires after 7 days. Powered by Plulai — AI Learning for Kids.
        </p>
      </div>
    </div>
  )
}
