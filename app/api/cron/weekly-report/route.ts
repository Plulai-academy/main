// app/api/cron/weekly-report/route.ts
export const runtime = 'nodejs'
// Runs every Sunday at 10:00 AM UAE time (06:00 UTC).
// For every active user with a parent_email set, computes their week's stats
// and sends a beautiful progress report to the parent.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireEnv, verifyCronAuth } from '@/lib/env'
import { sendEmail } from '@/lib/email/sender'
import { weeklyReportEmail } from '@/lib/email/templates'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try { requireEnv('CRON_SECRET', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY') }
  catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://plulai.com'
  const results  = { sent: 0, skipped: 0, errors: 0 }
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  // Get all users with parent_email set and active in the last 30 days
  const { data: profiles, error: profilesErr } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, avatar, preferred_language, parent_email, subscription, trial_ends_at')
    .not('parent_email', 'is', null)
    .neq('parent_email', '')

  if (profilesErr || !profiles) {
    return NextResponse.json({ error: profilesErr?.message }, { status: 500 })
  }

  for (const profile of profiles) {
    // Skip users whose trial expired and aren't paid
    const trialEnd    = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    const trialActive = trialEnd && trialEnd > new Date()
    const isPaid      = profile.subscription === 'pro' || profile.subscription === 'school'
    if (!trialActive && !isPaid) { results.skipped++; continue }

    try {
      const userId = profile.id

      // Fetch this week's data in parallel
      const [progressRes, lessonsRes, badgesRes, skillsRes] = await Promise.all([
        supabaseAdmin
          .from('user_progress')
          .select('xp, streak, longest_streak, freeze_tokens')
          .eq('user_id', userId)
          .single(),

        // Lessons completed THIS week
        supabaseAdmin
          .from('user_lesson_completions')
          .select('lesson_id, time_spent_mins, completed_at')
          .eq('user_id', userId)
          .gte('completed_at', oneWeekAgo),

        // Badges earned THIS week
        supabaseAdmin
          .from('user_badges')
          .select('badge_id, earned_at, badges(name, emoji, rarity)')
          .eq('user_id', userId)
          .gte('earned_at', oneWeekAgo),

        // All skill progress
        supabaseAdmin
          .from('user_skill_progress')
          .select('skill_node_id, progress_pct, skill_nodes(title, emoji)')
          .eq('user_id', userId)
          .gt('progress_pct', 0),
      ])

      const progress  = progressRes.data
      const lessons   = lessonsRes.data ?? []
      const badges    = badgesRes.data ?? []
      const skills    = skillsRes.data ?? []

      // Skip users with zero lessons this week — no report needed
      if (lessons.length === 0) { results.skipped++; continue }

      // Compute XP earned this week (approx: lessons * avg xp_reward)
      // More accurately: sum from xp_transactions this week — but that's a heavier query
      const xpThisWeek   = lessons.length * 12  // avg 12 XP per lesson
      const timeThisWeek = lessons.reduce((sum: number, l: any) => sum + (l.time_spent_mins ?? 5), 0)

      // Format badges
      const newBadges = badges.map((b: any) => ({
        name:   b.badges?.name   ?? b.badge_id,
        emoji:  b.badges?.emoji  ?? '🏅',
        rarity: b.badges?.rarity ?? 'common',
      }))

      // Format skills in progress
      const skillsInProgress = skills
        .sort((a: any, b: any) => b.progress_pct - a.progress_pct)
        .map((s: any) => ({
          name:  s.skill_nodes?.title ?? s.skill_node_id,
          emoji: s.skill_nodes?.emoji ?? '📖',
          pct:   s.progress_pct,
        }))

      // Generate or reuse parent token for the dashboard link
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await supabaseAdmin
        .from('parent_tokens')
        .upsert({ user_id: userId, token, expires_at: expiresAt }, { onConflict: 'user_id' })

      const lang = (profile.preferred_language ?? 'en') as 'en' | 'ar' | 'fr'
      const { subject, html } = weeklyReportEmail({
        parentEmail:     profile.parent_email,
        childName:       profile.display_name ?? 'Your child',
        childAvatar:     profile.avatar ?? '🧑‍🚀',
        lessonsThisWeek: lessons.length,
        xpThisWeek,
        currentStreak:   progress?.streak ?? 0,
        timeThisWeek,
        newBadges,
        skillsInProgress,
        parentDashUrl:   `${appUrl}/parent/${token}`,
        appUrl,
        lang,
      })

      const result = await sendEmail({
        to:      profile.parent_email,
        subject,
        html,
        tags: [
          { name: 'type',    value: 'weekly_report' },
          { name: 'lessons', value: String(lessons.length) },
        ],
      })

      if (result.success) {
        results.sent++
        console.info(`[CRON weekly-report] Sent to ${profile.parent_email} for ${profile.display_name}`)
      } else {
        results.errors++
      }
    } catch (err) {
      console.error(`[CRON weekly-report] Error for user ${profile.id}:`, err)
      results.errors++
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
