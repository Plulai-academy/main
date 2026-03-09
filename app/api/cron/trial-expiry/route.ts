// app/api/cron/trial-expiry/route.ts
export const runtime = 'nodejs'
// Runs daily at 9:00 AM UAE time (05:00 UTC).
// Sends trial expiry email to any user whose trial ends in exactly 3 days.
// Secured with CRON_SECRET — Vercel sends this header automatically.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireEnv, verifyCronAuth } from '@/lib/env'
import { sendEmail } from '@/lib/email/sender'
import { trialExpiryEmail } from '@/lib/email/templates'

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron routes)
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

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://plulai.com'
  const now       = new Date()
  const results   = { sent: 0, skipped: 0, errors: 0 }

  // Find users whose trial ends in 1, 3, or 7 days
  // We send at: 7 days left (heads up), 3 days left (reminder), 1 day left (urgent)
  const TARGET_DAYS = [7, 3, 1]

  for (const daysLeft of TARGET_DAYS) {
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysLeft)
    const targetStart = targetDate.toISOString().split('T')[0] + 'T00:00:00Z'
    const targetEnd   = targetDate.toISOString().split('T')[0] + 'T23:59:59Z'

    // Get users whose trial ends on this target day, still on free/trial, not yet upgraded
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, display_name, preferred_language, trial_ends_at, subscription')
      .gte('trial_ends_at', targetStart)
      .lte('trial_ends_at', targetEnd)
      .in('subscription', ['free', null])  // not yet paid
      .not('email', 'is', null)

    if (error) {
      console.error(`[CRON trial-expiry] DB error for ${daysLeft}d:`, error)
      results.errors++
      continue
    }

    if (!users || users.length === 0) continue

    for (const user of users) {
      try {
        const lang = (user.preferred_language ?? 'en') as 'en' | 'ar' | 'fr'
        const { subject, html } = trialExpiryEmail({
          childName:  user.display_name ?? 'Explorer',
          daysLeft,
          lang,
          upgradeUrl: `${appUrl}/pricing`,
          loginUrl:   `${appUrl}/auth/login`,
        })

        const result = await sendEmail({
          to:      user.email,
          subject,
          html,
          tags: [
            { name: 'type',     value: 'trial_expiry' },
            { name: 'days_left', value: String(daysLeft) },
          ],
        })

        if (result.success) {
          results.sent++
          // Log the send so we don't double-send (optional: add email_logs table)
          console.info(`[CRON trial-expiry] Sent ${daysLeft}d warning to ${user.email}`)
        } else {
          results.errors++
        }
      } catch (err) {
        console.error(`[CRON trial-expiry] Error for user ${user.id}:`, err)
        results.errors++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    ...results,
  })
}
