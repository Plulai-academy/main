// app/api/cron/streak-alert/route.ts
export const runtime = 'nodejs'
// Runs daily at 8:00 PM UAE time (16:00 UTC).
// Sends a streak nudge to any active user who:
//   1. Has a streak >= 3 days (worth protecting)
//   2. Has NOT done a lesson today
//   3. Has an email address
// Excludes: users who completed a lesson today, users with streak < 3.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireEnv, verifyCronAuth } from '@/lib/env'
import { sendEmail } from '@/lib/email/sender'
import { streakRiskEmail } from '@/lib/email/templates'

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

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://plulai.com'
  const today   = new Date().toISOString().split('T')[0]
  const results = { sent: 0, skipped: 0, errors: 0 }

  // Find users with streaks >= 3 who haven't been active today
  const { data: atRiskUsers, error } = await supabaseAdmin
    .from('user_progress')
    .select(`
      user_id,
      streak,
      freeze_tokens,
      last_active_date,
      profiles!inner (
        email,
        display_name,
        preferred_language,
        subscription,
        trial_ends_at
      )
    `)
    .gte('streak', 3)
    .neq('last_active_date', today)  // not active today
    .not('profiles.email', 'is', null)

  if (error) {
    console.error('[CRON streak-alert] DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!atRiskUsers || atRiskUsers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No at-risk users' })
  }

  for (const row of atRiskUsers) {
    const profile = (row as any).profiles
    if (!profile?.email) { results.skipped++; continue }

    // Skip users whose trial expired AND are not paid — they can't access app anyway
    const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    const trialExpired = trialEnd && trialEnd < new Date()
    const isPaid = profile.subscription === 'pro' || profile.subscription === 'school'
    if (trialExpired && !isPaid) { results.skipped++; continue }

    try {
      const lang = (profile.preferred_language ?? 'en') as 'en' | 'ar' | 'fr'
      const { subject, html } = streakRiskEmail({
        childName:     profile.display_name ?? 'Explorer',
        currentStreak: row.streak,
        freezeTokens:  row.freeze_tokens ?? 0,
        lang,
        dashboardUrl:  `${appUrl}/dashboard`,
      })

      const result = await sendEmail({
        to:      profile.email,
        subject,
        html,
        tags: [
          { name: 'type',   value: 'streak_alert' },
          { name: 'streak', value: String(row.streak) },
        ],
      })

      if (result.success) {
        results.sent++
        console.info(`[CRON streak-alert] Sent to ${profile.email} (streak: ${row.streak})`)
      } else {
        results.errors++
      }
    } catch (err) {
      console.error(`[CRON streak-alert] Error for user ${row.user_id}:`, err)
      results.errors++
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
