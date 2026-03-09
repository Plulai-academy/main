// lib/admin/stats.ts
// Shared analytics logic — used by both the API route (for external calls)
// and the admin page (direct import, avoids localhost fetch that breaks Cloudflare builds).

import { createClient as createAdminClient } from '@supabase/supabase-js'

// Simple in-memory cache — reuse data for 60s to avoid hammering DB on every tab switch
let _cache: { data: any; ts: number } | null = null
const CACHE_TTL_MS = 60_000

export function getCachedStats() {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return { ..._cache.data, cached: true }
  }
  return null
}

export async function fetchAdminStats(): Promise<any> {
  // Check cache first
  const cached = getCachedStats()
  if (cached) return cached

  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now      = new Date()
  const d30      = new Date(now.getTime() - 30 * 86400000).toISOString()
  const d7       = new Date(now.getTime() -  7 * 86400000).toISOString()
  const todayStr = new Date(now.setHours(0, 0, 0, 0)).toISOString()

  const [
    profilesRes,
    progressRes,
    lessonsRes,
    badgesRes,
    skillNodesRes,
  ] = await Promise.all([
    db.from('profiles').select(
      'id, email, display_name, avatar, country, age_group, preferred_language, ' +
      'subscription, trial_ends_at, subscription_ends_at, created_at, onboarding_done'
    ).order('created_at', { ascending: false }),

    db.from('user_progress').select(
      'user_id, xp, level, streak, longest_streak, last_active_date, total_time_mins'
    ),

    db.from('user_lesson_completions')
      .select('user_id, lesson_id, completed_at')
      .gte('completed_at', d30),

    db.from('user_badges')
      .select('user_id, badge_id, earned_at')
      .gte('earned_at', d30),

    db.from('skill_nodes').select('id, title, emoji, track_id'),
  ])

  const profiles   = (profilesRes.data   ?? []) as any[]
  const progress   = (progressRes.data   ?? []) as any[]
  const lessons    = (lessonsRes.data    ?? []) as any[]
  const badges     = (badgesRes.data     ?? []) as any[]
  const skillNodes = (skillNodesRes.data ?? []) as any[]

  const progressMap = Object.fromEntries(progress.map(p => [p.user_id, p]))

  // ── Subscription buckets ───────────────────────────────────
  const nowMs = Date.now()
  const paidUsers = profiles.filter(p => {
    const subEnd = p.subscription_ends_at ? new Date(p.subscription_ends_at).getTime() : 0
    return subEnd > nowMs || ['pro', 'school'].includes(p.subscription ?? '')
  })
  const trialingUsers = profiles.filter(p => {
    const trialEnd = p.trial_ends_at ? new Date(p.trial_ends_at).getTime() : 0
    return trialEnd > nowMs && !['pro', 'school'].includes(p.subscription ?? '')
  })
  const expiredUsers = profiles.filter(p => {
    const trialEnd = p.trial_ends_at ? new Date(p.trial_ends_at).getTime() : 0
    const subEnd   = p.subscription_ends_at ? new Date(p.subscription_ends_at).getTime() : 0
    return trialEnd <= nowMs && subEnd <= nowMs && !['pro', 'school'].includes(p.subscription ?? '')
  })

  // ── Activity ───────────────────────────────────────────────
  const activeToday = new Set(lessons.filter(l => l.completed_at >= todayStr).map(l => l.user_id))
  const activeWeek  = new Set(lessons.filter(l => l.completed_at >= d7).map(l => l.user_id))

  // ── Revenue ────────────────────────────────────────────────
  const MONTHLY_PRICE_USD = 79
  const mrr       = paidUsers.length * MONTHLY_PRICE_USD
  const everTried = profiles.filter(p => p.trial_ends_at).length
  const convRate  = everTried > 0 ? Math.round((paidUsers.length / everTried) * 100) : 0

  // ── Daily charts (30d) ─────────────────────────────────────
  const days: Record<string, { signups: number; lessons: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d   = new Date(nowMs - i * 86400000)
    const key = d.toISOString().split('T')[0]
    days[key] = { signups: 0, lessons: 0 }
  }
  for (const p of profiles) {
    const day = p.created_at?.split('T')[0]
    if (day && day in days) days[day].signups++
  }
  for (const l of lessons) {
    const day = l.completed_at?.split('T')[0]
    if (day && day in days) days[day].lessons++
  }
  const signupChart = Object.entries(days).map(([date, d]) => ({ date, signups: d.signups }))
  const lessonChart = Object.entries(days).map(([date, d]) => ({ date, count: d.lessons }))

  // ── Top skills ─────────────────────────────────────────────
  const skillNodeMap = Object.fromEntries(skillNodes.map(s => [s.id, s]))
  const lessonsBySkill: Record<string, { title: string; emoji: string; track: string; count: number }> = {}
  for (const l of lessons) {
    const parts   = l.lesson_id.split('-')
    const skillId = parts.slice(0, -1).join('-')
    const node    = skillNodeMap[skillId]
    if (!lessonsBySkill[skillId]) {
      lessonsBySkill[skillId] = { title: node?.title ?? skillId, emoji: node?.emoji ?? '📚', track: node?.track_id ?? 'unknown', count: 0 }
    }
    lessonsBySkill[skillId].count++
  }
  const topSkills = Object.values(lessonsBySkill).sort((a, b) => b.count - a.count).slice(0, 10)

  // ── Breakdowns ─────────────────────────────────────────────
  const byCountry: Record<string, number> = {}
  const byLang:    Record<string, number> = {}
  const byAge:     Record<string, number> = {}
  for (const p of profiles) {
    const c = p.country ?? 'Unknown'; byCountry[c] = (byCountry[c] ?? 0) + 1
    const l = p.preferred_language ?? 'en'; byLang[l] = (byLang[l] ?? 0) + 1
    const a = (p as any).age_group ?? 'unknown'; byAge[a] = (byAge[a] ?? 0) + 1
  }
  const countryBreakdown = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([country, count]) => ({ country, count }))

  // ── Streak distribution ────────────────────────────────────
  const streakBuckets: Record<string, number> = { '0': 0, '1-3': 0, '4-7': 0, '8-14': 0, '15-30': 0, '30+': 0 }
  for (const p of progress) {
    const s = p.streak ?? 0
    if (s === 0)       streakBuckets['0']++
    else if (s <= 3)   streakBuckets['1-3']++
    else if (s <= 7)   streakBuckets['4-7']++
    else if (s <= 14)  streakBuckets['8-14']++
    else if (s <= 30)  streakBuckets['15-30']++
    else               streakBuckets['30+']++
  }

  // ── User table (latest 200) ────────────────────────────────
  const users = profiles.slice(0, 200).map(p => {
    const prog     = progressMap[p.id]
    const subEnd   = p.subscription_ends_at ? new Date(p.subscription_ends_at).getTime() : 0
    const trialEnd = p.trial_ends_at ? new Date(p.trial_ends_at).getTime() : 0
    const isPaid   = subEnd > nowMs || ['pro', 'school'].includes(p.subscription ?? '')
    const isTrial  = trialEnd > nowMs && !isPaid
    return {
      id:          p.id,
      email:       p.email,
      name:        p.display_name,
      avatar:      p.avatar,
      country:     p.country ?? 'AE',
      language:    p.preferred_language ?? 'en',
      age_group:   (p as any).age_group ?? '—',
      status:      isPaid ? 'paid' : isTrial ? 'trial' : 'expired',
      xp:          prog?.xp ?? 0,
      level:       prog?.level ?? 1,
      streak:      prog?.streak ?? 0,
      last_active: prog?.last_active_date ?? null,
      joined:      p.created_at,
      onboarded:   p.onboarding_done,
    }
  })

  const data = {
    kpis: {
      totalUsers:    profiles.length,
      paidUsers:     paidUsers.length,
      trialingUsers: trialingUsers.length,
      expiredUsers:  expiredUsers.length,
      activeToday:   activeToday.size,
      activeWeek:    activeWeek.size,
      mrr,
      convRate,
      lessonsLast30: lessons.length,
      badgesLast30:  badges.length,
      avgXP: progress.length > 0
        ? Math.round(progress.reduce((s, p) => s + (p.xp ?? 0), 0) / progress.length) : 0,
      avgStreak: progress.length > 0
        ? Math.round(progress.reduce((s, p) => s + (p.streak ?? 0), 0) / progress.length) : 0,
    },
    signupChart,
    lessonChart,
    topSkills,
    countryBreakdown,
    byLang,
    byAge,
    streakBuckets,
    users,
    generatedAt: new Date().toISOString(),
  }

  // Cache for 60s
  _cache = { data, ts: Date.now() }

  return data
}
